const express = require('express');
const path = require('path');
const app = express();
const axios = require('axios');

app.use(express.json());

const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.ejs'), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
});

app.get('/api', async (req, res) => {
  try {
    const response = await axios.get(`${backendUrl}/api`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data from backend API:', error.message);
    res.status(502).json({ error: 'Unable to fetch data from the backend API' });
  }
});

app.get('/view', async (req, res) => {
  try {
    const response = await axios.get(`${backendUrl}/view`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching submitted grades from backend:', error.message);
    res.status(502).json({ error: 'Unable to fetch submitted grades from the backend' });
  }
});

app.post('/submit', async (req, res) => {
  try {
    const response = await axios.post(`${backendUrl}/submit`, req.body);
    res.status(response.status).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      res.status(error.response.status).json(error.response.data);
      return;
    }
    console.error('Error submitting grade to backend:', error.message);
    res.status(502).json({ error: 'Unable to submit grade to the backend' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Frontend server is running on port ${PORT}`);
});