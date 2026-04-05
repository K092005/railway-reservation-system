USE railway_reservation;

DELIMITER //

CREATE PROCEDURE sp_search_trains(
    IN p_source_code VARCHAR(10),
    IN p_dest_code VARCHAR(10),
    IN p_travel_date DATE
)
BEGIN
    SELECT
        t.id AS train_id,
        t.train_number,
        t.name AS train_name,
        t.train_type,
        src_station.name AS source_station,
        src_station.code AS source_code,
        dest_station.name AS dest_station,
        dest_station.code AS dest_code,
        src_route.departure_time,
        dest_route.arrival_time,
        (dest_route.distance_km - src_route.distance_km) AS distance_km,
        TIMEDIFF(
            ADDTIME(dest_route.arrival_time, SEC_TO_TIME(dest_route.day_offset * 86400)),
            ADDTIME(src_route.departure_time, SEC_TO_TIME(src_route.day_offset * 86400))
        ) AS duration,
        s.id AS schedule_id,
        s.status AS schedule_status
    FROM trains t
    INNER JOIN train_routes src_route ON t.id = src_route.train_id
    INNER JOIN train_routes dest_route ON t.id = dest_route.train_id
    INNER JOIN stations src_station ON src_route.station_id = src_station.id
    INNER JOIN stations dest_station ON dest_route.station_id = dest_station.id
    INNER JOIN schedules s ON t.id = s.train_id AND s.run_date = p_travel_date
    WHERE src_station.code = p_source_code
      AND dest_station.code = p_dest_code
      AND src_route.stop_order < dest_route.stop_order
      AND t.is_active = TRUE
      AND s.status IN ('Scheduled', 'Running')
    ORDER BY src_route.departure_time;
END //

CREATE PROCEDURE sp_check_availability(
    IN p_schedule_id INT,
    IN p_class_type VARCHAR(5)
)
BEGIN
    SELECT
        c.class_type,
        COUNT(CASE WHEN sa.status = 'Available' THEN 1 END) AS available_seats,
        COUNT(CASE WHEN sa.status = 'Booked' THEN 1 END) AS booked_seats,
        COUNT(sa.id) AS total_seats
    FROM coaches c
    INNER JOIN seats st ON c.id = st.coach_id
    INNER JOIN seat_availability sa ON st.id = sa.seat_id AND sa.schedule_id = p_schedule_id
    INNER JOIN schedules sch ON sa.schedule_id = sch.id
    WHERE sch.id = p_schedule_id
      AND c.train_id = sch.train_id
      AND (p_class_type IS NULL OR c.class_type = p_class_type)
    GROUP BY c.class_type;
END //

CREATE PROCEDURE sp_get_available_seats(
    IN p_schedule_id INT,
    IN p_class_type VARCHAR(5)
)
BEGIN
    SELECT
        st.id AS seat_id,
        st.seat_number,
        st.seat_type,
        c.coach_number,
        c.class_type,
        sa.status
    FROM seats st
    INNER JOIN coaches c ON st.coach_id = c.id
    INNER JOIN seat_availability sa ON st.id = sa.seat_id AND sa.schedule_id = p_schedule_id
    INNER JOIN schedules sch ON sa.schedule_id = sch.id
    WHERE sch.id = p_schedule_id
      AND c.train_id = sch.train_id
      AND c.class_type = p_class_type
    ORDER BY c.coach_number, st.seat_number;
END //

CREATE PROCEDURE sp_generate_pnr(OUT p_pnr VARCHAR(10))
BEGIN
    SET p_pnr = CONCAT(
        CHAR(FLOOR(65 + RAND() * 26)),
        CHAR(FLOOR(65 + RAND() * 26)),
        LPAD(FLOOR(RAND() * 100000000), 8, '0')
    );
END //

CREATE PROCEDURE sp_book_ticket(
    IN p_user_id INT,
    IN p_schedule_id INT,
    IN p_source_station_id INT,
    IN p_dest_station_id INT,
    IN p_class_type VARCHAR(5),
    IN p_passengers_json JSON,
    OUT p_booking_id INT,
    OUT p_pnr VARCHAR(10),
    OUT p_status VARCHAR(20)
)
BEGIN
    DECLARE v_passenger_count INT;
    DECLARE v_available_count INT;
    DECLARE v_fare_per_person DECIMAL(10,2);
    DECLARE v_total_fare DECIMAL(10,2);
    DECLARE v_distance INT;
    DECLARE v_seat_id INT;
    DECLARE v_i INT DEFAULT 0;
    DECLARE v_p_name VARCHAR(100);
    DECLARE v_p_age INT;
    DECLARE v_p_gender VARCHAR(10);

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status = 'ERROR';
    END;

    START TRANSACTION;

    SET v_passenger_count = JSON_LENGTH(p_passengers_json);

    SELECT COUNT(*) INTO v_available_count
    FROM seat_availability sa
    INNER JOIN seats st ON sa.seat_id = st.id
    INNER JOIN coaches c ON st.coach_id = c.id
    INNER JOIN schedules sch ON sa.schedule_id = sch.id
    WHERE sa.schedule_id = p_schedule_id
      AND c.train_id = sch.train_id
      AND c.class_type = p_class_type
      AND sa.status = 'Available';

    IF v_available_count < v_passenger_count THEN
        SET p_status = 'INSUFFICIENT_SEATS';
        ROLLBACK;
    ELSE
        SELECT (dest_r.distance_km - src_r.distance_km) INTO v_distance
        FROM train_routes src_r
        INNER JOIN train_routes dest_r ON src_r.train_id = dest_r.train_id
        INNER JOIN schedules sch ON src_r.train_id = sch.train_id
        WHERE sch.id = p_schedule_id
          AND src_r.station_id = p_source_station_id
          AND dest_r.station_id = p_dest_station_id;

        SET v_fare_per_person = CASE p_class_type
            WHEN '1A' THEN v_distance * 4.00
            WHEN '2A' THEN v_distance * 2.50
            WHEN '3A' THEN v_distance * 1.80
            WHEN 'SL' THEN v_distance * 1.00
            WHEN 'CC' THEN v_distance * 2.00
            WHEN '2S' THEN v_distance * 0.60
            WHEN 'GN' THEN v_distance * 0.40
            ELSE v_distance * 1.00
        END;

        SET v_total_fare = v_fare_per_person * v_passenger_count;

        CALL sp_generate_pnr(p_pnr);

        INSERT INTO bookings (pnr, user_id, schedule_id, source_station_id, dest_station_id, class_type, total_fare, status)
        VALUES (p_pnr, p_user_id, p_schedule_id, p_source_station_id, p_dest_station_id, p_class_type, v_total_fare, 'Confirmed');

        SET p_booking_id = LAST_INSERT_ID();

        WHILE v_i < v_passenger_count DO
            SET v_p_name = JSON_UNQUOTE(JSON_EXTRACT(p_passengers_json, CONCAT('$[', v_i, '].name')));
            SET v_p_age = JSON_EXTRACT(p_passengers_json, CONCAT('$[', v_i, '].age'));
            SET v_p_gender = JSON_UNQUOTE(JSON_EXTRACT(p_passengers_json, CONCAT('$[', v_i, '].gender')));

            SELECT sa.seat_id INTO v_seat_id
            FROM seat_availability sa
            INNER JOIN seats st ON sa.seat_id = st.id
            INNER JOIN coaches c ON st.coach_id = c.id
            INNER JOIN schedules sch ON sa.schedule_id = sch.id
            WHERE sa.schedule_id = p_schedule_id
              AND c.train_id = sch.train_id
              AND c.class_type = p_class_type
              AND sa.status = 'Available'
            ORDER BY c.coach_number, st.seat_number
            LIMIT 1;

            UPDATE seat_availability SET status = 'Booked'
            WHERE schedule_id = p_schedule_id AND seat_id = v_seat_id;

            INSERT INTO passengers (booking_id, name, age, gender, seat_id, status)
            VALUES (p_booking_id, v_p_name, v_p_age, v_p_gender, v_seat_id, 'Confirmed');

            SET v_i = v_i + 1;
        END WHILE;

        SET p_status = 'SUCCESS';
        COMMIT;
    END IF;
END //

CREATE PROCEDURE sp_cancel_booking(
    IN p_booking_id INT,
    IN p_user_id INT,
    IN p_reason VARCHAR(255),
    OUT p_status VARCHAR(20),
    OUT p_refund_amount DECIMAL(10,2)
)
BEGIN
    DECLARE v_booking_status VARCHAR(20);
    DECLARE v_total_fare DECIMAL(10,2);
    DECLARE v_booking_user INT;
    DECLARE v_schedule_id INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status = 'ERROR';
    END;

    SELECT status, total_fare, user_id, schedule_id
    INTO v_booking_status, v_total_fare, v_booking_user, v_schedule_id
    FROM bookings WHERE id = p_booking_id;

    IF v_booking_user != p_user_id THEN
        SET p_status = 'UNAUTHORIZED';
    ELSEIF v_booking_status = 'Cancelled' THEN
        SET p_status = 'ALREADY_CANCELLED';
    ELSEIF v_booking_status != 'Confirmed' THEN
        SET p_status = 'INVALID_STATUS';
    ELSE
        START TRANSACTION;

        SET p_refund_amount = v_total_fare * 0.75;

        UPDATE bookings SET status = 'Cancelled' WHERE id = p_booking_id;
        UPDATE passengers SET status = 'Cancelled' WHERE booking_id = p_booking_id;

        UPDATE seat_availability sa
        INNER JOIN passengers p ON sa.seat_id = p.seat_id
        SET sa.status = 'Available'
        WHERE p.booking_id = p_booking_id
          AND sa.schedule_id = v_schedule_id;

        INSERT INTO cancellations (booking_id, reason, refund_amount, refund_status)
        VALUES (p_booking_id, p_reason, p_refund_amount, 'Pending');

        SET p_status = 'SUCCESS';
        COMMIT;
    END IF;
END //

CREATE PROCEDURE sp_process_payment(
    IN p_booking_id INT,
    IN p_method VARCHAR(20),
    IN p_transaction_id VARCHAR(50),
    OUT p_status VARCHAR(20)
)
BEGIN
    DECLARE v_amount DECIMAL(10,2);
    DECLARE v_booking_status VARCHAR(20);

    SELECT total_fare, status INTO v_amount, v_booking_status
    FROM bookings WHERE id = p_booking_id;

    IF v_booking_status != 'Confirmed' THEN
        SET p_status = 'INVALID_BOOKING';
    ELSE
        INSERT INTO payments (booking_id, amount, method, transaction_id, status, paid_at)
        VALUES (p_booking_id, v_amount, p_method, p_transaction_id, 'Success', NOW());

        SET p_status = 'SUCCESS';
    END IF;
END //

CREATE PROCEDURE sp_get_booking_by_pnr(IN p_pnr VARCHAR(10))
BEGIN
    SELECT
        b.id AS booking_id,
        b.pnr,
        b.status AS booking_status,
        b.total_fare,
        b.class_type,
        b.booking_date,
        t.train_number,
        t.name AS train_name,
        t.train_type,
        src.name AS source_station,
        src.code AS source_code,
        dest.name AS dest_station,
        dest.code AS dest_code,
        s.run_date,
        src_r.departure_time,
        dest_r.arrival_time,
        u.name AS passenger_booked_by,
        u.email
    FROM bookings b
    INNER JOIN schedules s ON b.schedule_id = s.id
    INNER JOIN trains t ON s.train_id = t.id
    INNER JOIN stations src ON b.source_station_id = src.id
    INNER JOIN stations dest ON b.dest_station_id = dest.id
    INNER JOIN train_routes src_r ON t.id = src_r.train_id AND src_r.station_id = src.id
    INNER JOIN train_routes dest_r ON t.id = dest_r.train_id AND dest_r.station_id = dest.id
    INNER JOIN users u ON b.user_id = u.id
    WHERE b.pnr = p_pnr;

    SELECT
        p.id AS passenger_id,
        p.name,
        p.age,
        p.gender,
        p.status,
        st.seat_number,
        st.seat_type,
        c.coach_number,
        c.class_type
    FROM passengers p
    INNER JOIN bookings b ON p.booking_id = b.id
    LEFT JOIN seats st ON p.seat_id = st.id
    LEFT JOIN coaches c ON st.coach_id = c.id
    WHERE b.pnr = p_pnr;
END //

DELIMITER ;
