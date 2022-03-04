const shortid = require('shortid');
const User = require('../models/User');

// You can POST to /api/users with form data username to create a new user.
// The returned response from POST /api/users with form data username will be an object with username and _id properties.
const newUser = (req, res, next) => {
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
}

// You can make a GET request to /api/users to get a list of all users.
// The GET request to /api/users returns an array.
// Each element in the array returned from GET /api/users is an object literal containing a user's username and _id.
const getUsers = (req, res, next) => {
  User.find((err, users) => {
    if (err) return console.error(err);
    console.log("users found! ", users);
    if (users) res.json(users.map(user => ( {username: user.username, _id: user._id} ) ));
  });
};

// You can POST to /api/users/:_id/exercises with form data description, duration, and optionally date. If no date is supplied, the current date will be used.
// The response returned from POST /api/users/:_id/exercises will be the user object with the exercise fields added.
const newExercise = (req, res, next) => {
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
};

// You can make a GET request to /api/users/:_id/logs to retrieve a full exercise log of any user.
// A request to a user's log GET /api/users/:_id/logs returns a user object with a count property representing the number of exercises that belong to that user.
// You can add from, to and limit parameters to a GET /api/users/:_id/logs request to retrieve part of the log of any user. from and to are dates in yyyy-mm-dd format. limit is an integer of how many logs to send back.
const getLogs = (req, res, next) => {
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
};

module.exports = { newUser, getUsers, newExercise, getLogs };