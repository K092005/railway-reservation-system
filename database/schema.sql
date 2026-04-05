CREATE DATABASE IF NOT EXISTS railway_reservation;
USE railway_reservation;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB;

CREATE TABLE stations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    INDEX idx_code (code),
    INDEX idx_city (city)
) ENGINE=InnoDB;

CREATE TABLE trains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    train_number VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    train_type ENUM('Express', 'Superfast', 'Rajdhani', 'Shatabdi', 'Duronto', 'Mail') NOT NULL,
    total_coaches INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_train_number (train_number)
) ENGINE=InnoDB;

CREATE TABLE train_routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    train_id INT NOT NULL,
    station_id INT NOT NULL,
    stop_order INT NOT NULL,
    arrival_time TIME,
    departure_time TIME,
    distance_km INT DEFAULT 0,
    day_offset INT DEFAULT 0,
    FOREIGN KEY (train_id) REFERENCES trains(id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
    UNIQUE KEY uk_train_stop (train_id, stop_order),
    INDEX idx_train_station (train_id, station_id)
) ENGINE=InnoDB;

CREATE TABLE coaches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    train_id INT NOT NULL,
    coach_number VARCHAR(10) NOT NULL,
    class_type ENUM('SL', '3A', '2A', '1A', 'CC', '2S', 'GN') NOT NULL,
    total_seats INT NOT NULL,
    FOREIGN KEY (train_id) REFERENCES trains(id) ON DELETE CASCADE,
    UNIQUE KEY uk_train_coach (train_id, coach_number),
    INDEX idx_class_type (class_type)
) ENGINE=InnoDB;

CREATE TABLE seats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coach_id INT NOT NULL,
    seat_number INT NOT NULL,
    seat_type ENUM('Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper', 'Window', 'Aisle') NOT NULL,
    FOREIGN KEY (coach_id) REFERENCES coaches(id) ON DELETE CASCADE,
    UNIQUE KEY uk_coach_seat (coach_id, seat_number)
) ENGINE=InnoDB;

CREATE TABLE schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    train_id INT NOT NULL,
    run_date DATE NOT NULL,
    status ENUM('Scheduled', 'Running', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    FOREIGN KEY (train_id) REFERENCES trains(id) ON DELETE CASCADE,
    UNIQUE KEY uk_train_date (train_id, run_date),
    INDEX idx_run_date (run_date)
) ENGINE=InnoDB;

CREATE TABLE seat_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    schedule_id INT NOT NULL,
    seat_id INT NOT NULL,
    status ENUM('Available', 'Booked', 'RAC', 'WL') DEFAULT 'Available',
    FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id) ON DELETE CASCADE,
    UNIQUE KEY uk_schedule_seat (schedule_id, seat_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pnr VARCHAR(10) UNIQUE NOT NULL,
    user_id INT NOT NULL,
    schedule_id INT NOT NULL,
    source_station_id INT NOT NULL,
    dest_station_id INT NOT NULL,
    class_type ENUM('SL', '3A', '2A', '1A', 'CC', '2S', 'GN') NOT NULL,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Confirmed', 'Cancelled', 'WaitListed') DEFAULT 'Pending',
    total_fare DECIMAL(10, 2) NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (schedule_id) REFERENCES schedules(id),
    FOREIGN KEY (source_station_id) REFERENCES stations(id),
    FOREIGN KEY (dest_station_id) REFERENCES stations(id),
    INDEX idx_pnr (pnr),
    INDEX idx_user (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB;

CREATE TABLE passengers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    seat_id INT,
    status ENUM('Confirmed', 'RAC', 'WaitListed', 'Cancelled') DEFAULT 'Confirmed',
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(id),
    INDEX idx_booking (booking_id)
) ENGINE=InnoDB;

CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    method ENUM('UPI', 'Credit Card', 'Debit Card', 'Net Banking') NOT NULL,
    transaction_id VARCHAR(50) UNIQUE,
    status ENUM('Pending', 'Success', 'Failed', 'Refunded') DEFAULT 'Pending',
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    INDEX idx_booking (booking_id),
    INDEX idx_transaction (transaction_id)
) ENGINE=InnoDB;

CREATE TABLE cancellations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NOT NULL,
    cancelled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(255),
    refund_amount DECIMAL(10, 2) DEFAULT 0,
    refund_status ENUM('Pending', 'Processed', 'Failed') DEFAULT 'Pending',
    FOREIGN KEY (booking_id) REFERENCES bookings(id),
    INDEX idx_booking (booking_id)
) ENGINE=InnoDB;

CREATE TABLE audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    user_id INT,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_action (action),
    INDEX idx_table (table_name)
) ENGINE=InnoDB;
