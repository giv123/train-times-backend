import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/train-times/:stationCode', async (req, res) => {
  const station = req.params.stationCode;
  const url = `https://api.rtt.io/api/v1/json/search/${station}`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${process.env.RTT_USER}:${process.env.RTT_PASS}`).toString('base64'),
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching train times:', error);
    res.status(500).json({ error: 'Failed to fetch train times' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));