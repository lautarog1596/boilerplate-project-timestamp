// server.js
// where your node app starts

// init project
require('dotenv').config();
var express = require('express');
var mongo = require('mongodb');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var shortid = require('shortid');
const multer  = require('multer')
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

app.get("/exerciseTracker", function (req, res) {
  res.sendFile(__dirname + '/views/exerciseTracker.html');
});

app.get('/fileanalyse', function (req, res) {
  res.sendFile(process.cwd() + '/views/fileanalyse.html');
});


// ---- TIMESTAMP MICROSERVICE ---- //
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


// ---- REQUEST HEADER PARSER MICROSERVICE ---- //
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


// ---- URL SHORTENER MICROSERVICE ---- //
// Build a schema and model to store saved URLS
var urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String
});
var Url = mongoose.model('Url', urlSchema);

app.post("/api/shorturl", (req, res) => {
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

app.get("/api/shorturl/:short_url", (req, res) => {
  let short_url = req.params.short_url;
  Url.findOne({ short_url: short_url }, function(err, url) {
    if (err) return console.error(err);
    console.log("Document found! ", url);
    res.redirect(url.original_url);
  });
})



// ---- EXERCISE TRACKER MICROSERVICE ---- //
// Build a schema and model to store saved Exercises
var exerciseSchema = new mongoose.Schema({
  date: String,
  duration: Number,
  description: String
});
var Exercise = mongoose.model('Exercise', exerciseSchema);
// Build a schema and model to store saved Users
var userSchema = new mongoose.Schema({
  _id: String,
  username: String,
  log: {type: [exerciseSchema], default: []}
});
var User = mongoose.model('User', userSchema);

// You can POST to /api/users with form data username to create a new user.
// The returned response from POST /api/users with form data username will be an object with username and _id properties.
app.post("/api/users", (req, res) => {
  let username = req.body.username;
  let _id = shortid.generate();
  // if username is already in database don't create new user
  User.findOne({ username: username }, (err, user) => {
    if (err) return console.error(err);
    if (!user) {
      let newUser = new User({ username: username, _id:_id });
      newUser.save((err, newUser) => {
        if (err) return console.error(err);
        console.log("newUser inserted successfully! ", newUser);
        res.json({username: newUser.username, _id: newUser._id});
      });
    } else {
      res.json({error: "Username already exists"});
    }
  });
});

// You can make a GET request to /api/users to get a list of all users.
// The GET request to /api/users returns an array.
// Each element in the array returned from GET /api/users is an object literal containing a user's username and _id.
app.get("/api/users", (req, res) => {
  User.find((err, users) => {
    if (err) return console.error(err);
    console.log("users found! ", users);
    if (users) res.json(users.map(user => ( {username: user.username, _id: user._id} ) ));
  });
});

// You can POST to /api/users/:_id/exercises with form data description, duration, and optionally date. If no date is supplied, the current date will be used.
// The response returned from POST /api/users/:_id/exercises will be the user object with the exercise fields added.
app.post("/api/users/:_id/exercises", (req, res) => {
  let _id = req.params._id;
  let description = req.body.description;
  let duration = parseInt(req.body.duration);
  let date = new Date(req.body.date).toDateString();
  if (date == "Invalid Date") date = new Date().toDateString();
  User.findOne({ _id: _id }, (err, user) => {
    if (err) return console.error(err);
    if (user) {
      user.log.push({ date: date, duration: duration, description: description });
      user.save((err, user) => {
        if (err) return console.error(err);
        console.log("user updated successfully! ", user);
        res.json({username: user.username, _id: user._id, date: date, duration: duration, description: description});
      });
    } else {
      res.json({error: "User not found"});
    }
  });
});

// You can make a GET request to /api/users/:_id/logs to retrieve a full exercise log of any user.
// A request to a user's log GET /api/users/:_id/logs returns a user object with a count property representing the number of exercises that belong to that user.
// You can add from, to and limit parameters to a GET /api/users/:_id/logs request to retrieve part of the log of any user. from and to are dates in yyyy-mm-dd format. limit is an integer of how many logs to send back.
app.get("/api/users/:_id/logs", (req, res) => {
  let _id = req.params._id;
  let from = req.query.from; // yyyy-mm-dd format
  let to = req.query.to; 
  let limit = req.query.limit;
  User.findOne({ _id: _id }, (err, user) => {
    if (err) return console.error(err);
    console.log("user found! ", user);
    if (user) {
      let exercises = user.log;
      if(from) exercises = exercises.filter(e => (new Date(e.date) >= new Date(from)));
      if(to) exercises = exercises.filter(e => (new Date(e.date) <= new Date(to)));
      if(limit) exercises = exercises.slice(0, limit);
      res.json({_id: user._id, username: user.username, count: exercises.length, log: exercises});
    } else {
      res.json({error: "User not found"});
    }
  });
});


// ---- FILE METADATA MICROSERVICE ---- //
// HINT: You can use the multer npm package to handle file uploading.
// You can submit a form that includes a file upload.
// The form file input field has the name attribute set to upfile.
// When you submit a file, you receive the file name, type, and size in bytes within the JSON response.
app.post("/api/fileanalyse", multer().single('upfile'), (req, res) => {
  let file = req.file;
  if (file) {
    res.json({
      name: file.originalname,
      type: file.mimetype,
      size: file.size
    });
  } else {
    res.json({error: "No file uploaded"});
  }
});


// listen for requests :)
var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + port);
});
