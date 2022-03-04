const mongoose = require('mongoose');
const { Schema } = mongoose;

// Build a schema and model to store saved URLS
var urlSchema = new Schema({
  original_url: String,
  short_url: String
});

module.exports = mongoose.model('Url', urlSchema);