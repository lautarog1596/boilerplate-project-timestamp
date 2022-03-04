const express = require('express');
const router = express.Router();
const path = require('path');
const exerciseTrackerController = require('../controllers/exerciseTracker');

router.get("/exerciseTracker", (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'exerciseTracker.html'));
});

router.post("/api/users", exerciseTrackerController.newUser);
router.get("/api/users", exerciseTrackerController.getUsers);
router.post("/api/users/:_id/exercises", exerciseTrackerController.newExercise);
router.get("/api/users/:_id/logs", exerciseTrackerController.getLogs);

module.exports = router;