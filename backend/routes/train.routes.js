const express = require('express');
const TrainController = require('../controllers/train.controller');

const router = express.Router();

router.get('/search', TrainController.search);
router.get('/stations', TrainController.getStations);
router.get('/all', TrainController.getAll);
router.get('/:id', TrainController.getById);
router.get('/:scheduleId/availability', TrainController.checkAvailability);
router.get('/:scheduleId/seats', TrainController.getSeats);

module.exports = router;
