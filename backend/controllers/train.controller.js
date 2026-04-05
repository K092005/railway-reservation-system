const Train = require('../models/Train');
const db = require('../config/db');

class TrainController {
  static async search(req, res) {
    try {
      const { from, to, date } = req.query;

      if (!from || !to || !date) {
        return res.status(400).json({ error: 'Source (from), destination (to), and date are required.' });
      }

      const trains = await Train.search(from.toUpperCase(), to.toUpperCase(), date);

      const trainsWithAvailability = [];
      for (const train of trains) {
        const availability = await Train.checkAvailability(train.schedule_id, null);
        trainsWithAvailability.push({
          ...train,
          availability
        });
      }

      res.json({ trains: trainsWithAvailability, count: trainsWithAvailability.length });
    } catch (err) {
      console.error('Search error:', err);
      res.status(500).json({ error: 'Train search failed.' });
    }
  }

  static async getById(req, res) {
    try {
      const train = await Train.getById(req.params.id);
      if (!train) {
        return res.status(404).json({ error: 'Train not found.' });
      }
      res.json({ train });
    } catch (err) {
      console.error('GetById error:', err);
      res.status(500).json({ error: 'Failed to fetch train.' });
    }
  }

  static async checkAvailability(req, res) {
    try {
      const { scheduleId } = req.params;
      const { classType } = req.query;

      const availability = await Train.checkAvailability(scheduleId, classType || null);
      res.json({ availability });
    } catch (err) {
      console.error('Availability error:', err);
      res.status(500).json({ error: 'Failed to check availability.' });
    }
  }

  static async getSeats(req, res) {
    try {
      const { scheduleId } = req.params;
      const { classType } = req.query;

      if (!classType) {
        return res.status(400).json({ error: 'classType query parameter is required.' });
      }

      const seats = await Train.getAvailableSeats(scheduleId, classType);
      res.json({ seats });
    } catch (err) {
      console.error('Seats error:', err);
      res.status(500).json({ error: 'Failed to fetch seats.' });
    }
  }

  static async getStations(req, res) {
    try {
      const [rows] = await db.execute('SELECT * FROM stations ORDER BY name');
      res.json({ stations: rows });
    } catch (err) {
      console.error('Stations error:', err);
      res.status(500).json({ error: 'Failed to fetch stations.' });
    }
  }

  static async getAll(req, res) {
    try {
      const trains = await Train.getAll();
      res.json({ trains });
    } catch (err) {
      console.error('GetAll error:', err);
      res.status(500).json({ error: 'Failed to fetch trains.' });
    }
  }
}

module.exports = TrainController;
