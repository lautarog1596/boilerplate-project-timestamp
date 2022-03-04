const express = require('express');
const router = express.Router();
const path = require('path');
const multer  = require('multer')

router.get("/fileanalyse", (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'fileanalyse.html'));
});

// HINT: You can use the multer npm package to handle file uploading.
// You can submit a form that includes a file upload.
// The form file input field has the name attribute set to upfile.
// When you submit a file, you receive the file name, type, and size in bytes within the JSON response.
router.post("/api/fileanalyse", multer().single('upfile'), (req, res) => {
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

module.exports = router;