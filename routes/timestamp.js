const express = require('express');
const router = express.Router();
const path = require('path');

router.get("/timestamp", (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'timestamp.html'));
});

// 3. if the date string is empty it should be equivalent to trigger new Date(), i.e. the service uses the current timestamp
router.get("/timestamp/api", function(req, res) {
  let now = new Date();
  res.json({
    unix: now.getTime(),
    utc: now.toUTCString()
  });
});

// 1. The API endpoint is GET [project_url]/api/:date_string
router.get("/timestamp/api/:date_string", function(req, res) {
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

module.exports = router;