const express = require('express');
const BookingController = require('../controllers/booking.controller');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/', AuthMiddleware.authenticate, BookingController.createBooking);
router.get('/', AuthMiddleware.authenticate, BookingController.getUserBookings);
router.get('/:pnr', BookingController.getByPnr);
router.post('/:id/cancel', AuthMiddleware.authenticate, BookingController.cancelBooking);

module.exports = router;
