const Payment = require('../models/Payment');

class PaymentController {
  static async processPayment(req, res) {
    try {
      const { bookingId, method } = req.body;

      if (!bookingId || !method) {
        return res.status(400).json({ error: 'bookingId and payment method are required.' });
      }

      const validMethods = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking'];
      if (!validMethods.includes(method)) {
        return res.status(400).json({ error: `Invalid payment method. Use: ${validMethods.join(', ')}` });
      }

      const result = await Payment.processPayment(bookingId, method);

      if (result.status === 'SUCCESS') {
        res.json({
          message: 'Payment processed successfully.',
          transactionId: result.transactionId,
          method: result.method,
          status: 'Success'
        });
      } else {
        res.status(400).json({ error: `Payment failed: ${result.status}` });
      }
    } catch (err) {
      console.error('Payment error:', err);
      res.status(500).json({ error: 'Payment processing failed.' });
    }
  }

  static async getPaymentStatus(req, res) {
    try {
      const { bookingId } = req.params;
      const payment = await Payment.getByBookingId(bookingId);

      if (!payment) {
        return res.status(404).json({ error: 'No payment found for this booking.' });
      }

      res.json({ payment });
    } catch (err) {
      console.error('PaymentStatus error:', err);
      res.status(500).json({ error: 'Failed to fetch payment status.' });
    }
  }
}

module.exports = PaymentController;
