import cors from 'cors';
import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'https://giv123.github.io'
}));

app.use(express.json());

app.get('/api/train-times/:stationCode', async (req, res) => {
  const station = req.params.stationCode.toUpperCase(); // Ensure uppercase
  const url = `https://api.rtt.io/api/v1/json/search/${station}`;

  const username = process.env.RTT_USER;
  const password = process.env.RTT_PASS;

  const auth = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: auth,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: await response.text() });
    }

    const data = await response.json();

    if (!data.search || data.search.length === 0) {
      return res.status(404).json({ error: 'Station not found' });
    }

    const stationData = data.search[0];
    const trainServices = stationData.trainServices || [];

    if (trainServices.length === 0) {
      return res.status(404).json({ error: 'No train services found' });
    }

    // Simplify the response
    const services = trainServices.map(service => ({
      serviceID: service.serviceID,
      scheduledTime: service.std,
      expectedTime: service.etd,
      platform: service.platform || 'N/A',
      destination: service.destination.map(d => d.location.name).join(', '),
      operator: service.operator,
      status: service.etd === 'On time' ? 'On time' : service.etd
    }));

    res.json({
      station: stationData.location.name,
      crs: stationData.location.crs,
      services,
    });

  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));