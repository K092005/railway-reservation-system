const db = require('../config/db');

class User {
  #id;
  #name;
  #email;
  #passwordHash;
  #phone;
  #role;
  #createdAt;

  constructor(data = {}) {
    this.#id = data.id || null;
    this.#name = data.name || '';
    this.#email = data.email || '';
    this.#passwordHash = data.password_hash || '';
    this.#phone = data.phone || '';
    this.#role = data.role || 'user';
    this.#createdAt = data.created_at || null;
  }

  get id() { return this.#id; }
  get name() { return this.#name; }
  get email() { return this.#email; }
  get phone() { return this.#phone; }
  get role() { return this.#role; }
  get createdAt() { return this.#createdAt; }

  toJSON() {
    return {
      id: this.#id,
      name: this.#name,
      email: this.#email,
      phone: this.#phone,
      role: this.#role,
      createdAt: this.#createdAt
    };
  }

  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows.length > 0 ? new User(rows[0]) : null;
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows.length > 0 ? new User(rows[0]) : null;
  }

  static async create(name, email, passwordHash, phone) {
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password_hash, phone) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, phone]
    );
    return new User({ id: result.insertId, name, email, password_hash: passwordHash, phone, role: 'user' });
  }

  getPasswordHash() {
    return this.#passwordHash;
  }
}

class Admin extends User {
  constructor(data = {}) {
    super({ ...data, role: 'admin' });
  }

  static async getAllUsers() {
    const [rows] = await db.execute('SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC');
    return rows.map(r => new User(r).toJSON());
  }

  static async getDashboardStats() {
    const [stats] = await db.execute(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'user') AS total_users,
        (SELECT COUNT(*) FROM bookings) AS total_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'Confirmed') AS active_bookings,
        (SELECT COUNT(*) FROM bookings WHERE status = 'Cancelled') AS cancelled_bookings,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'Success') AS total_revenue,
        (SELECT COUNT(*) FROM trains WHERE is_active = TRUE) AS total_trains
    `);
    return stats[0];
  }
}

module.exports = { User, Admin };
