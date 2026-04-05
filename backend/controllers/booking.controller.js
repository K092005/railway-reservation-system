const Booking = require('../models/Booking');

class BookingController {
  static async createBooking(req, res) {
    try {
      const { scheduleId, sourceStationId, destStationId, classType, passengers } = req.body;
      const userId = req.user.id;

      if (!scheduleId || !sourceStationId || !destStationId || !classType || !passengers || passengers.length === 0) {
        return res.status(400).json({ error: 'All booking details and at least one passenger are required.' });
      }

      for (const p of passengers) {
        if (!p.name || !p.age || !p.gender) {
          return res.status(400).json({ error: 'Each passenger must have name, age, and gender.' });
        }
      }

      const result = await Booking.create(userId, scheduleId, sourceStationId, destStationId, classType, passengers);

      if (result.status === 'SUCCESS') {
        res.status(201).json({
          message: 'Booking confirmed!',
          bookingId: result.booking_id,
          pnr: result.pnr,
          status: result.status
        });
      } else if (result.status === 'INSUFFICIENT_SEATS') {
        res.status(400).json({ error: 'Not enough seats available for the selected class.' });
      } else {
        res.status(500).json({ error: 'Booking failed. Please try again.' });
      }
    } catch (err) {
      console.error('Booking error:', err);
      res.status(500).json({ error: 'Booking creation failed.' });
    }
  }

  static async getUserBookings(req, res) {
    try {
      const bookings = await Booking.getUserBookings(req.user.id);
      res.json({ bookings });
    } catch (err) {
      console.error('GetBookings error:', err);
      res.status(500).json({ error: 'Failed to fetch bookings.' });
    }
  }

  static async getByPnr(req, res) {
    try {
      const { pnr } = req.params;
      const data = await Booking.getByPnr(pnr);

      if (!data.booking) {
        return res.status(404).json({ error: 'Booking not found.' });
      }

      res.json(data);
    } catch (err) {
      console.error('GetByPnr error:', err);
      res.status(500).json({ error: 'Failed to fetch booking.' });
    }
  }

  static async cancelBooking(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user.id;

      const result = await Booking.cancel(parseInt(id), userId, reason);

      if (result.status === 'SUCCESS') {
        res.json({
          message: 'Booking cancelled successfully.',
          refundAmount: result.refund_amount,
          status: result.status
        });
      } else if (result.status === 'UNAUTHORIZED') {
        res.status(403).json({ error: 'You are not authorized to cancel this booking.' });
      } else if (result.status === 'ALREADY_CANCELLED') {
        res.status(400).json({ error: 'This booking is already cancelled.' });
      } else {
        res.status(400).json({ error: `Cannot cancel booking. Status: ${result.status}` });
      }
    } catch (err) {
      console.error('Cancel error:', err);
      res.status(500).json({ error: 'Cancellation failed.' });
    }
  }
}

module.exports = BookingController;
