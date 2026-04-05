const db = require('../config/db');

class Booking {
  #id;
  #pnr;
  #userId;
  #scheduleId;
  #sourceStationId;
  #destStationId;
  #classType;
  #status;
  #totalFare;
  #bookingDate;

  constructor(data = {}) {
    this.#id = data.id || data.booking_id || null;
    this.#pnr = data.pnr || '';
    this.#userId = data.user_id || null;
    this.#scheduleId = data.schedule_id || null;
    this.#sourceStationId = data.source_station_id || null;
    this.#destStationId = data.dest_station_id || null;
    this.#classType = data.class_type || 'SL';
    this.#status = data.status || data.booking_status || 'Pending';
    this.#totalFare = data.total_fare || 0;
    this.#bookingDate = data.booking_date || null;
  }

  get id() { return this.#id; }
  get pnr() { return this.#pnr; }
  get status() { return this.#status; }
  get totalFare() { return this.#totalFare; }

  toJSON() {
    return {
      id: this.#id,
      pnr: this.#pnr,
      userId: this.#userId,
      scheduleId: this.#scheduleId,
      sourceStationId: this.#sourceStationId,
      destStationId: this.#destStationId,
      classType: this.#classType,
      status: this.#status,
      totalFare: this.#totalFare,
      bookingDate: this.#bookingDate
    };
  }

  static async create(userId, scheduleId, sourceStationId, destStationId, classType, passengers) {
    const passengersJson = JSON.stringify(passengers);
    const [rows] = await db.execute(
      'CALL sp_book_ticket(?, ?, ?, ?, ?, ?, @booking_id, @pnr, @status)',
      [userId, scheduleId, sourceStationId, destStationId, classType, passengersJson]
    );
    const [[result]] = await db.execute('SELECT @booking_id AS booking_id, @pnr AS pnr, @status AS status');
    return result;
  }

  static async cancel(bookingId, userId, reason) {
    await db.execute(
      'CALL sp_cancel_booking(?, ?, ?, @status, @refund_amount)',
      [bookingId, userId, reason || 'User requested cancellation']
    );
    const [[result]] = await db.execute('SELECT @status AS status, @refund_amount AS refund_amount');
    return result;
  }

  static async getByPnr(pnr) {
    const [rows] = await db.execute('CALL sp_get_booking_by_pnr(?)', [pnr]);
    const bookingInfo = rows[0] && rows[0][0] ? rows[0][0] : null;
    const passengers = rows[1] || [];
    return { booking: bookingInfo, passengers };
  }

  static async getUserBookings(userId) {
    const [rows] = await db.execute(`
      SELECT
        b.id, b.pnr, b.status, b.total_fare, b.class_type, b.booking_date,
        t.train_number, t.name AS train_name, t.train_type,
        src.name AS source_station, src.code AS source_code,
        dest.name AS dest_station, dest.code AS dest_code,
        s.run_date,
        (SELECT COUNT(*) FROM passengers p WHERE p.booking_id = b.id) AS passenger_count
      FROM bookings b
      INNER JOIN schedules s ON b.schedule_id = s.id
      INNER JOIN trains t ON s.train_id = t.id
      INNER JOIN stations src ON b.source_station_id = src.id
      INNER JOIN stations dest ON b.dest_station_id = dest.id
      WHERE b.user_id = ?
      ORDER BY b.booking_date DESC
    `, [userId]);
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute(`
      SELECT b.*, s.run_date, t.train_number, t.name AS train_name
      FROM bookings b
      INNER JOIN schedules s ON b.schedule_id = s.id
      INNER JOIN trains t ON s.train_id = t.id
      WHERE b.id = ?
    `, [id]);
    return rows.length > 0 ? rows[0] : null;
  }
}

module.exports = Booking;
