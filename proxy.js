const express = require('express');
const request = require('request');
const cors = require('cors');
const app = express();

app.use(cors());

app.use('/', (req, res) => {
  const url = 'http://192.168.137.1:2000' + req.url;
  req.pipe(request(url)).pipe(res);
});

app.listen(8080, () => {
  console.log('CORS proxy running on port 8080');
});
