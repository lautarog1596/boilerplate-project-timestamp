const express = require('express');
const router = express.Router();
const path = require('path');
const shortid = require('shortid');
const Url = require('../models/Url');

router.get("/shortUrl", (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'shortUrl.html'));
});

router.post("/api/shorturl", (req, res) => {
  let url = req.body.url;
  // If you pass an invalid URL that doesn't follow the valid http://www.example.com format, the JSON response will contain { error: 'invalid url' }
  if (url.indexOf('http://') == -1 && url.indexOf('https://') == -1) {
    res.json({error: "Invalid URL"});
  } else {

    let suffix = shortid.generate();

    let newUrl = new Url({
      original_url: url,
      short_url: suffix,
    });

    // save newUrl to database
    newUrl.save(function(err, newUrl) {
      if (err) return console.error(err);
      console.log("Document inserted successfully! ", newUrl);
      res.json({
        original_url: newUrl.original_url,
        short_url: newUrl.short_url
      });
    });
  }
});

router.get("/api/shorturl/:short_url", (req, res) => {
  let short_url = req.params.short_url;
  Url.findOne({ short_url: short_url }, function(err, url) {
    if (err) return console.error(err);
    console.log("Document found! ", url);
    res.redirect(url.original_url);
  });
})

module.exports = router;