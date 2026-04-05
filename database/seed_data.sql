USE railway_reservation;

INSERT INTO stations (name, code, city, state) VALUES
('New Delhi', 'NDLS', 'New Delhi', 'Delhi'),
('Mumbai Central', 'BCT', 'Mumbai', 'Maharashtra'),
('Chennai Central', 'MAS', 'Chennai', 'Tamil Nadu'),
('Howrah Junction', 'HWH', 'Kolkata', 'West Bengal'),
('Bengaluru City', 'SBC', 'Bengaluru', 'Karnataka'),
('Ahmedabad Junction', 'ADI', 'Ahmedabad', 'Gujarat'),
('Jaipur Junction', 'JP', 'Jaipur', 'Rajasthan'),
('Lucknow Junction', 'LKO', 'Lucknow', 'Uttar Pradesh'),
('Pune Junction', 'PUNE', 'Pune', 'Maharashtra'),
('Hyderabad Deccan', 'HYB', 'Hyderabad', 'Telangana'),
('Bhopal Junction', 'BPL', 'Bhopal', 'Madhya Pradesh'),
('Patna Junction', 'PNBE', 'Patna', 'Bihar'),
('Kanpur Central', 'CNB', 'Kanpur', 'Uttar Pradesh'),
('Agra Cantt', 'AGC', 'Agra', 'Uttar Pradesh'),
('Varanasi Junction', 'BSB', 'Varanasi', 'Uttar Pradesh');

INSERT INTO trains (train_number, name, train_type, total_coaches) VALUES
('12952', 'Mumbai Rajdhani Express', 'Rajdhani', 20),
('12302', 'Howrah Rajdhani Express', 'Rajdhani', 18),
('12622', 'Tamil Nadu Express', 'Superfast', 22),
('12002', 'Bhopal Shatabdi', 'Shatabdi', 16),
('22692', 'Delhi Bengaluru Rajdhani', 'Rajdhani', 20),
('12916', 'Ashram Express', 'Express', 22),
('12036', 'Jaipur Shatabdi', 'Shatabdi', 14),
('12560', 'Himgiri Express', 'Express', 18),
('12724', 'Hyderabad Deccan Express', 'Superfast', 20),
('12394', 'Sampoorna Kranti Express', 'Superfast', 20);

INSERT INTO train_routes (train_id, station_id, stop_order, arrival_time, departure_time, distance_km, day_offset) VALUES
(1, 1, 1, NULL, '16:55:00', 0, 0),
(1, 11, 2, '23:30:00', '23:35:00', 707, 0),
(1, 9, 3, '08:00:00', '08:10:00', 1200, 1),
(1, 2, 4, '10:30:00', NULL, 1384, 1),
(2, 1, 1, NULL, '16:50:00', 0, 0),
(2, 13, 2, '21:30:00', '21:35:00', 440, 0),
(2, 15, 3, '01:30:00', '01:40:00', 760, 1),
(2, 12, 4, '06:00:00', '06:10:00', 1000, 1),
(2, 4, 5, '09:55:00', NULL, 1450, 1),
(3, 1, 1, NULL, '22:30:00', 0, 0),
(3, 14, 2, '01:30:00', '01:35:00', 195, 1),
(3, 11, 3, '08:30:00', '08:40:00', 707, 1),
(3, 10, 4, '21:00:00', '21:15:00', 1660, 1),
(3, 3, 5, '06:50:00', NULL, 2182, 2),
(4, 1, 1, NULL, '06:00:00', 0, 0),
(4, 14, 2, '07:57:00', '07:59:00', 195, 0),
(4, 11, 3, '10:30:00', NULL, 707, 0),
(5, 1, 1, NULL, '20:50:00', 0, 0),
(5, 7, 2, '01:30:00', '01:35:00', 308, 1),
(5, 10, 3, '16:00:00', '16:10:00', 1600, 1),
(5, 5, 4, '22:30:00', NULL, 2150, 1),
(6, 1, 1, NULL, '15:20:00', 0, 0),
(6, 7, 2, '20:30:00', '20:40:00', 308, 0),
(6, 6, 3, '05:30:00', NULL, 940, 1),
(7, 1, 1, NULL, '06:05:00', 0, 0),
(7, 7, 2, '10:40:00', NULL, 308, 0),
(8, 1, 1, NULL, '23:15:00', 0, 0),
(8, 8, 2, '06:30:00', '06:40:00', 510, 1),
(8, 15, 3, '10:30:00', NULL, 760, 1),
(9, 1, 1, NULL, '21:15:00', 0, 0),
(9, 14, 2, '00:15:00', '00:17:00', 195, 1),
(9, 11, 3, '07:30:00', '07:40:00', 707, 1),
(9, 10, 4, '18:30:00', NULL, 1660, 1),
(10, 1, 1, NULL, '22:35:00', 0, 0),
(10, 13, 2, '02:30:00', '02:35:00', 440, 1),
(10, 15, 3, '06:00:00', '06:10:00', 760, 1),
(10, 12, 4, '10:20:00', NULL, 1000, 1);

-- Insert coaches for each train
-- Train 1: Mumbai Rajdhani
INSERT INTO coaches (train_id, coach_number, class_type, total_seats) VALUES
(1, 'H1', '1A', 24), (1, 'A1', '2A', 48), (1, 'A2', '2A', 48),
(1, 'B1', '3A', 64), (1, 'B2', '3A', 64), (1, 'B3', '3A', 64);

-- Train 2: Howrah Rajdhani
INSERT INTO coaches (train_id, coach_number, class_type, total_seats) VALUES
(2, 'H1', '1A', 24), (2, 'A1', '2A', 48), (2, 'A2', '2A', 48),
(2, 'B1', '3A', 64), (2, 'B2', '3A', 64);

-- Train 3: Tamil Nadu Express
INSERT INTO coaches (train_id, coach_number, class_type, total_seats) VALUES
(3, 'A1', '2A', 48), (3, 'B1', '3A', 64), (3, 'B2', '3A', 64),
(3, 'S1', 'SL', 72), (3, 'S2', 'SL', 72), (3, 'S3', 'SL', 72), (3, 'S4', 'SL', 72);

-- Train 4: Bhopal Shatabdi
INSERT INTO coaches (train_id, coach_number, class_type, total_seats) VALUES
(4, 'C1', 'CC', 78), (4, 'C2', 'CC', 78), (4, 'C3', 'CC', 78), (4, 'C4', 'CC', 78);

-- Train 5: Delhi Bengaluru Rajdhani
INSERT INTO coaches (train_id, coach_number, class_type, total_seats) VALUES
(5, 'H1', '1A', 24), (5, 'A1', '2A', 48), (5, 'A2', '2A', 48),
(5, 'B1', '3A', 64), (5, 'B2', '3A', 64), (5, 'B3', '3A', 64);

-- Train 6-10: Mixed coaches
INSERT INTO coaches (train_id, coach_number, class_type, total_seats) VALUES
(6, 'A1', '2A', 48), (6, 'B1', '3A', 64), (6, 'S1', 'SL', 72), (6, 'S2', 'SL', 72),
(7, 'C1', 'CC', 78), (7, 'C2', 'CC', 78), (7, 'C3', 'CC', 78),
(8, 'B1', '3A', 64), (8, 'S1', 'SL', 72), (8, 'S2', 'SL', 72), (8, 'S3', 'SL', 72),
(9, 'A1', '2A', 48), (9, 'B1', '3A', 64), (9, 'B2', '3A', 64), (9, 'S1', 'SL', 72), (9, 'S2', 'SL', 72),
(10, 'A1', '2A', 48), (10, 'B1', '3A', 64), (10, 'S1', 'SL', 72), (10, 'S2', 'SL', 72);

-- Generate seats for ALL coaches
-- Using a procedure for seat generation
DELIMITER //
CREATE PROCEDURE sp_seed_seats()
BEGIN
    DECLARE v_coach_id INT;
    DECLARE v_total INT;
    DECLARE v_class VARCHAR(5);
    DECLARE v_i INT;
    DECLARE v_seat_type VARCHAR(20);
    DECLARE done INT DEFAULT FALSE;

    DECLARE coach_cursor CURSOR FOR
        SELECT id, total_seats, class_type FROM coaches;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN coach_cursor;

    read_loop: LOOP
        FETCH coach_cursor INTO v_coach_id, v_total, v_class;
        IF done THEN LEAVE read_loop; END IF;

        SET v_i = 1;
        WHILE v_i <= v_total DO
            IF v_class IN ('SL', '3A') THEN
                SET v_seat_type = CASE (v_i % 8)
                    WHEN 1 THEN 'Lower'
                    WHEN 2 THEN 'Middle'
                    WHEN 3 THEN 'Upper'
                    WHEN 4 THEN 'Lower'
                    WHEN 5 THEN 'Middle'
                    WHEN 6 THEN 'Upper'
                    WHEN 7 THEN 'Side Lower'
                    WHEN 0 THEN 'Side Upper'
                END;
            ELSEIF v_class = '2A' THEN
                SET v_seat_type = CASE (v_i % 6)
                    WHEN 1 THEN 'Lower'
                    WHEN 2 THEN 'Upper'
                    WHEN 3 THEN 'Lower'
                    WHEN 4 THEN 'Upper'
                    WHEN 5 THEN 'Side Lower'
                    WHEN 0 THEN 'Side Upper'
                END;
            ELSEIF v_class = '1A' THEN
                SET v_seat_type = CASE (v_i % 4)
                    WHEN 1 THEN 'Lower'
                    WHEN 2 THEN 'Upper'
                    WHEN 3 THEN 'Lower'
                    WHEN 0 THEN 'Upper'
                END;
            ELSE
                SET v_seat_type = CASE (v_i % 2)
                    WHEN 1 THEN 'Window'
                    WHEN 0 THEN 'Aisle'
                END;
            END IF;

            INSERT INTO seats (coach_id, seat_number, seat_type)
            VALUES (v_coach_id, v_i, v_seat_type);

            SET v_i = v_i + 1;
        END WHILE;
    END LOOP;

    CLOSE coach_cursor;
END //
DELIMITER ;

CALL sp_seed_seats();
DROP PROCEDURE sp_seed_seats;

-- Generate schedules for next 30 days
DELIMITER //
CREATE PROCEDURE sp_seed_schedules()
BEGIN
    DECLARE v_day INT DEFAULT 0;
    DECLARE v_train_id INT;
    DECLARE done INT DEFAULT FALSE;

    DECLARE train_cursor CURSOR FOR SELECT id FROM trains;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    WHILE v_day < 30 DO
        SET done = FALSE;
        OPEN train_cursor;

        train_loop: LOOP
            FETCH train_cursor INTO v_train_id;
            IF done THEN LEAVE train_loop; END IF;

            INSERT IGNORE INTO schedules (train_id, run_date, status)
            VALUES (v_train_id, DATE_ADD(CURDATE(), INTERVAL v_day DAY), 'Scheduled');
        END LOOP;

        CLOSE train_cursor;
        SET v_day = v_day + 1;
    END WHILE;
END //
DELIMITER ;

CALL sp_seed_schedules();
DROP PROCEDURE sp_seed_schedules;

-- Populate seat_availability for each schedule
INSERT INTO seat_availability (schedule_id, seat_id, status)
SELECT s.id, st.id, 'Available'
FROM schedules s
INNER JOIN coaches c ON s.train_id = c.train_id
INNER JOIN seats st ON c.id = st.coach_id;

-- Insert an admin user (password: admin123)
INSERT INTO users (name, email, password_hash, phone, role)
VALUES ('Admin', 'admin@railway.com', '$2b$10$YourHashedPasswordHere', '9999999999', 'admin');
