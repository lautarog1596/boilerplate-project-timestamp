// server.js
// where your node app starts

// init project
require('dotenv').config();
var express = require('express');
var mongo = require('mongodb');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var shortid = require('shortid');
var app = express();
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get("/timestamp", function (req, res) {
  res.sendFile(__dirname + '/views/timestamp.html');
});

app.get("/requestHeaderParser", function (req, res) {
  res.sendFile(__dirname + '/views/requestHeaderParser.html');
});

app.get("/shortUrl", function (req, res) {
  res.sendFile(__dirname + '/views/shortUrl.html');
});

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


// 3. if the date string is empty it should be equivalent to trigger new Date(), i.e. the service uses the current timestamp
app.get("/timestamp/api", function(req, res) {
  let now = new Date();
  res.json({
    unix: now.getTime(),
    utc: now.toUTCString()
  });
});

// 1. The API endpoint is GET [project_url]/api/:date_string
app.get("/timestamp/api/:date_string", function(req, res) {
  var date_string = req.params.date_string;
  // 2. A date string is valid if can be successfully parsed by new Date(date_string).
  // Note that the unix timestamp need to be an integer (not a string) specifying milliseconds.
  // In our test we will use date strings compliant with ISO-8601 (e.g. "2016-11-20") because this 
  // will ensure an UTC timestamp

  if (/^\d{5,}$/.test(date_string)) date_string = parseInt(date_string);

  const date = new Date(date_string);

  if (date.toString() == "Invalid Date") {
    res.json({error: "Invalid Date" });
  } else {
    res.json({
      unix: date.valueOf(),
      utc: date.toUTCString()
    });
  }
})

app.get("/requestHeaderParser/api/whoami", (req, res) => {
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

// Build a schema and model to store saved URLS
var urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String,
  sufix: String
});

var Url = mongoose.model('Url', urlSchema);

app.post("/shortUrl/api", (req, res) => {
  let url = req.body.url;
  let suffix = shortid.generate();

  let newUrl = new Url({
    original_url: url,
    short_url: __dirname + "/shortUrl/api/" + suffix,
    sufix: suffix
  });

  // save newUrl to database
  newUrl.save(function(err, newUrl) {
    if (err) return console.error(err);
    console.log("Document inserted successfully! ", newUrl);
    res.json({
      original_url: newUrl.original_url,
      short_url: newUrl.short_url,
      sufix: newUrl.sufix
    });
  });
})

app.get("/shortUrl/api/:sufix", (req, res) => {
  let sufix = req.params.sufix;
  Url.findOne({ sufix: sufix }, function(err, url) {
    if (err) return console.error(err);
    console.log("Document found! ", url);
    res.redirect(url.original_url);
  });

})


// listen for requests :)
var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + port);
});
