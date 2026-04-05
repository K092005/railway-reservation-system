USE railway_reservation;

DELIMITER //

CREATE TRIGGER trg_after_booking_insert
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (action, table_name, record_id, user_id, details)
    VALUES (
        'BOOKING_CREATED',
        'bookings',
        NEW.id,
        NEW.user_id,
        CONCAT('PNR: ', NEW.pnr, ', Class: ', NEW.class_type, ', Fare: ', NEW.total_fare)
    );
END //

CREATE TRIGGER trg_after_booking_cancel
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF OLD.status != 'Cancelled' AND NEW.status = 'Cancelled' THEN
        INSERT INTO audit_log (action, table_name, record_id, user_id, details)
        VALUES (
            'BOOKING_CANCELLED',
            'bookings',
            NEW.id,
            NEW.user_id,
            CONCAT('PNR: ', NEW.pnr, ' cancelled. Previous status: ', OLD.status)
        );
    END IF;
END //

CREATE TRIGGER trg_before_booking_delete
BEFORE DELETE ON bookings
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Direct deletion of bookings is not allowed. Use cancellation instead.';
END //

CREATE TRIGGER trg_after_payment_success
AFTER INSERT ON payments
FOR EACH ROW
BEGIN
    IF NEW.status = 'Success' THEN
        INSERT INTO audit_log (action, table_name, record_id, user_id, details)
        VALUES (
            'PAYMENT_RECEIVED',
            'payments',
            NEW.id,
            NULL,
            CONCAT('Booking ID: ', NEW.booking_id, ', Amount: ', NEW.amount, ', Method: ', NEW.method, ', TXN: ', NEW.transaction_id)
        );
    END IF;
END //

DELIMITER ;
