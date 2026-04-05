const express = require('express');
const PaymentController = require('../controllers/payment.controller');
const AuthMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/process', AuthMiddleware.authenticate, PaymentController.processPayment);
router.get('/:bookingId', AuthMiddleware.authenticate, PaymentController.getPaymentStatus);

module.exports = router;
