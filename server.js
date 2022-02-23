// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();

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


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});


// 1. The API endpoint is GET [project_url]/api/timestamp/:date_string
app.get("/api/:date_string", function(req, res) {
  var date_string = req.params.date_string;
  // 2. A date string is valid if can be successfully parsed by new Date(date_string).
  // Note that the unix timestamp need to be an integer (not a string) specifying milliseconds.
  // In our test we will use date strings compliant with ISO-8601 (e.g. "2016-11-20") because this 
  // will ensure an UTC timestamp
  var date = new Date(date_string);

  // 3. if the date string is empty it should be equivalent to trigger new Date(), i.e. the service uses the current timestamp
  if (date_string === "") {
    date = new Date();
  }

  // 4. if the date string is valid the api returns a JSON having the structure:
  // {"unix": <date.getTime()>, "utc": <date.toUTCString()>}
  if (date.toString() !== "Invalid Date") {
    res.json({unix: date.getTime(), utc: date.toUTCString()});
  }else{
    // 5. if the date string is invalid the api returns a JSON object with the error message
    res.json({"error" : "Invalid Date"})
  }
})


// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
