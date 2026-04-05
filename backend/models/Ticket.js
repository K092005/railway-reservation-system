const db = require('../config/db');

class Ticket {
  #id;
  #bookingId;
  #passengerName;
  #age;
  #gender;
  #seatId;
  #status;

  constructor(data = {}) {
    this.#id = data.id || null;
    this.#bookingId = data.booking_id || null;
    this.#passengerName = data.name || '';
    this.#age = data.age || 0;
    this.#gender = data.gender || '';
    this.#seatId = data.seat_id || null;
    this.#status = data.status || 'Confirmed';
  }

  get id() { return this.#id; }
  get status() { return this.#status; }

  toJSON() {
    return {
      id: this.#id,
      bookingId: this.#bookingId,
      passengerName: this.#passengerName,
      age: this.#age,
      gender: this.#gender,
      seatId: this.#seatId,
      status: this.#status
    };
  }

  calculateFare(distance, classType) {
    const rates = {
      '1A': 4.00, '2A': 2.50, '3A': 1.80,
      'SL': 1.00, 'CC': 2.00, '2S': 0.60, 'GN': 0.40
    };
    return distance * (rates[classType] || 1.00);
  }
}

class ConfirmedTicket extends Ticket {
  constructor(data = {}) {
    super({ ...data, status: 'Confirmed' });
  }

  toJSON() {
    return { ...super.toJSON(), ticketType: 'Confirmed' };
  }
}

class WaitlistedTicket extends Ticket {
  #waitlistNumber;

  constructor(data = {}) {
    super({ ...data, status: 'WaitListed' });
    this.#waitlistNumber = data.waitlist_number || 0;
  }

  toJSON() {
    return { ...super.toJSON(), ticketType: 'WaitListed', waitlistNumber: this.#waitlistNumber };
  }
}

module.exports = { Ticket, ConfirmedTicket, WaitlistedTicket };
