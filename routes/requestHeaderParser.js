const express = require('express');
const router = express.Router();
const path = require('path');

router.get("/requestHeaderParser", (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'requestHeaderParser.html'));
});

router.get("/requestHeaderParser/api/whoami", (req, res) => {
  // get ip address from request
  let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  // get language from request
  let language = req.headers['accept-language'];
  // get software from request
  let software = req.headers['user-agent'];
  res.json({
    ipaddress: ip,
    language: language,
    software: software
  });
})

module.exports = router;