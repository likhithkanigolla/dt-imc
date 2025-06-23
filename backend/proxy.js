require('dotenv').config();
const express = require('express');
const request = require('request');
const cors = require('cors');
const app = express();

app.use(cors());

app.use('/', (req, res) => {
  const url = process.env.PROXY_TARGET_URL + req.url;
  req.pipe(request(url)).pipe(res);
});

app.listen(process.env.PROXY_PORT, () => {
  console.log(`CORS proxy running on port ${process.env.PROXY_PORT}`);
});
