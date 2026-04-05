const db = require('../config/db');

class Payment {
  #id;
  #bookingId;
  #amount;
  #method;
  #transactionId;
  #status;
  #paidAt;

  constructor(data = {}) {
    this.#id = data.id || null;
    this.#bookingId = data.booking_id || null;
    this.#amount = data.amount || 0;
    this.#method = data.method || '';
    this.#transactionId = data.transaction_id || '';
    this.#status = data.status || 'Pending';
    this.#paidAt = data.paid_at || null;
  }

  get id() { return this.#id; }
  get status() { return this.#status; }

  toJSON() {
    return {
      id: this.#id,
      bookingId: this.#bookingId,
      amount: this.#amount,
      method: this.#method,
      transactionId: this.#transactionId,
      status: this.#status,
      paidAt: this.#paidAt
    };
  }

  static generateTransactionId(method) {
    const prefix = {
      'UPI': 'UPI',
      'Credit Card': 'CC',
      'Debit Card': 'DC',
      'Net Banking': 'NB'
    };
    const code = prefix[method] || 'TXN';
    return `${code}${Date.now()}${Math.floor(Math.random() * 10000)}`;
  }

  static async processPayment(bookingId, method) {
    const txnId = Payment.generateTransactionId(method);

    await db.execute(
      'CALL sp_process_payment(?, ?, ?, @status)',
      [bookingId, method, txnId]
    );
    const [[result]] = await db.execute('SELECT @status AS status');

    return {
      status: result.status,
      transactionId: txnId,
      method
    };
  }

  static async getByBookingId(bookingId) {
    const [rows] = await db.execute(
      'SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC LIMIT 1',
      [bookingId]
    );
    return rows.length > 0 ? new Payment(rows[0]).toJSON() : null;
  }
}

module.exports = Payment;
