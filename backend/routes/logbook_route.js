const express = require('express');
const router = express.Router();
const logbooks = require('../controllers/logbook_controller.js');


// Get logbooks
router.get("/logbooks", logbooks.findLogbooks);

// Get message ids
router.get("/messageids/:logbook", logbooks.findMessageIds);

// Get logs by lazy loading
router.get("/logs/:logbook", logbooks.findLogs);

// Get single log
router.get("/log/:logbook/:id", logbooks.findSingleLog);

// Submit a log, including creat, update and delete
router.post('/log/:logbook', logbooks.submitLogFormData);


module.exports = router;