const express = require('express');
const path = require('path');
const app = express();
const axios = require('axios');

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Frontend server is running on port ${PORT}`);
});