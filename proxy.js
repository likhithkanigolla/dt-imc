const express = require('express');
const request = require('request');
const cors = require('cors');
const app = express();

app.use(cors());

app.use('/', (req, res) => {
  const url = 'http://dev-onem2m.iiit.ac.in:443' + req.url;
  req.pipe(request(url)).pipe(res);
});

app.listen(1631, () => {
  console.log('CORS proxy running on port 1631');
});
