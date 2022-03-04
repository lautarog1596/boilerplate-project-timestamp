const mongoose = require('mongoose');
const { Schema } = mongoose;

// Build a schema and model to store saved Exercises
var exerciseSchema = new Schema({
  date: String,
  duration: Number,
  description: String
});
// Build a schema and model to store saved Users
var userSchema = new Schema({
  _id: String,
  username: String,
  log: {type: [exerciseSchema], default: []}
});

module.exports = mongoose.model('User', userSchema);