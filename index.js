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
  const station = req.params.stationCode;
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
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));