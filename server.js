
// init project
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

// Settings
app.set('port', process.env.PORT || 3000);
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// Static Files: http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// Routes
app.use(require('./routes/index'));
app.use(require('./routes/timestamp'));
app.use(require('./routes/requestHeaderParser'));
app.use(require('./routes/shortUrl'));
app.use(require('./routes/exerciseTracker'));
app.use(require('./routes/fileanalyse'));

// listen for requests :)
var listener = app.listen(app.get('port'), () => {
  console.log('Your app is listening on port ' + app.get('port'));
});
