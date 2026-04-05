const db = require('../config/db');

class Train {
  #id;
  #trainNumber;
  #name;
  #trainType;
  #totalCoaches;
  #isActive;

  constructor(data = {}) {
    this.#id = data.id || data.train_id || null;
    this.#trainNumber = data.train_number || '';
    this.#name = data.name || data.train_name || '';
    this.#trainType = data.train_type || '';
    this.#totalCoaches = data.total_coaches || 0;
    this.#isActive = data.is_active !== undefined ? data.is_active : true;
  }

  get id() { return this.#id; }
  get trainNumber() { return this.#trainNumber; }
  get name() { return this.#name; }
  get trainType() { return this.#trainType; }

  toJSON() {
    return {
      id: this.#id,
      trainNumber: this.#trainNumber,
      name: this.#name,
      trainType: this.#trainType,
      totalCoaches: this.#totalCoaches,
      isActive: this.#isActive
    };
  }

  static async search(sourceCode, destCode, travelDate) {
    const [rows] = await db.execute('CALL sp_search_trains(?, ?, ?)', [sourceCode, destCode, travelDate]);
    return rows[0] || [];
  }

  static async getById(id) {
    const [rows] = await db.execute('SELECT * FROM trains WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    const train = new Train(rows[0]);

    const [routes] = await db.execute(`
      SELECT tr.*, s.name AS station_name, s.code AS station_code, s.city
      FROM train_routes tr
      INNER JOIN stations s ON tr.station_id = s.id
      WHERE tr.train_id = ?
      ORDER BY tr.stop_order
    `, [id]);

    return { ...train.toJSON(), routes };
  }

  static async checkAvailability(scheduleId, classType) {
    const [rows] = await db.execute('CALL sp_check_availability(?, ?)', [scheduleId, classType || null]);
    return rows[0] || [];
  }

  static async getAvailableSeats(scheduleId, classType) {
    const [rows] = await db.execute('CALL sp_get_available_seats(?, ?)', [scheduleId, classType]);
    return rows[0] || [];
  }

  static async getAll() {
    const [rows] = await db.execute('SELECT * FROM trains WHERE is_active = TRUE ORDER BY train_number');
    return rows.map(r => new Train(r).toJSON());
  }
}

module.exports = Train;
