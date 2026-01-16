-- =====================================================
-- MENTAL HEALTH CHATBOT - FULL DATABASE SCHEMA
-- MySQL / MariaDB
-- =====================================================

-- Tạo database
CREATE DATABASE IF NOT EXISTS healthbot
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE healthbot;

-- =====================================================
-- BẢNG USERS
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_user_email ON users(email);

-- =====================================================
-- BẢNG BOOKINGS (LỊCH HẸN)
-- =====================================================
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(10) NOT NULL,
    age INT NOT NULL,
    address TEXT NOT NULL,
    timeslot VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    clinicId INT DEFAULT NULL,
    clinicName VARCHAR(255) DEFAULT NULL,
    status ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled') 
        DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_user
        FOREIGN KEY (userId) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_booking_userId ON bookings(userId);
CREATE INDEX idx_booking_date ON bookings(date);
CREATE INDEX idx_booking_clinicId ON bookings(clinicId);

-- =====================================================
-- BẢNG TÀI KHOẢN PHÒNG KHÁM
-- =====================================================
CREATE TABLE IF NOT EXISTS clinic_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clinicId INT NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    clinicName VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- BẢNG HỒ SƠ BỆNH ÁN
-- =====================================================
CREATE TABLE IF NOT EXISTS medical_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bookingId INT NOT NULL,
    userId INT NOT NULL,
    clinicId INT NOT NULL,
    doctorName VARCHAR(255),
    diagnosis TEXT,
    symptoms TEXT,
    mentalHealthStatus TEXT,
    severity ENUM('mild', 'moderate', 'severe') DEFAULT 'mild',
    recommendations TEXT,
    medications TEXT,
    nextAppointment DATE,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_medical_booking
        FOREIGN KEY (bookingId) REFERENCES bookings(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_medical_user
        FOREIGN KEY (userId) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_medical_userId ON medical_records(userId);
CREATE INDEX idx_medical_clinicId ON medical_records(clinicId);
CREATE INDEX idx_medical_bookingId ON medical_records(bookingId);

-- =====================================================
-- BẢNG CHAT SESSIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    title VARCHAR(255) NOT NULL DEFAULT 'Cuộc trò chuyện mới',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_session_user
        FOREIGN KEY (userId) REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_chat_session_userId ON chat_sessions(userId);

-- =====================================================
-- BẢNG CHAT MESSAGES
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sessionId INT NOT NULL,
    role ENUM('user', 'bot') NOT NULL,
    message TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_message_session
        FOREIGN KEY (sessionId) REFERENCES chat_sessions(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_chat_message_sessionId ON chat_messages(sessionId);

-- =====================================================
-- DỮ LIỆU MẪU: TÀI KHOẢN PHÒNG KHÁM
-- Password mặc định: clinic123
-- =====================================================
INSERT INTO clinic_accounts (clinicId, username, password, clinicName, email, phone) VALUES
(1, 'vietphap', '$2b$10$POL4GeS6HtNQIDl1RSWrBO/bxTXduyQ2rGcS3GepgOhLMecmx2Lzi', 'Phòng khám Tâm lý Việt Pháp Hà Nội', 'vietphap@clinic.com', '02438261234'),
(2, 'vienquocgia', '$2b$10$POL4GeS6HtNQIDl1RSWrBO/bxTXduyQ2rGcS3GepgOhLMecmx2Lzi', 'Viện Sức khỏe Tâm thần Quốc gia', 'vienquocgia@clinic.com', '02435762345'),
(3, 'tamly1088', '$2b$10$POL4GeS6HtNQIDl1RSWrBO/bxTXduyQ2rGcS3GepgOhLMecmx2Lzi', 'Trung tâm Tâm lý 1088', 'tamly1088@clinic.com', '02473041088'),
(4, 'bachmai', '$2b$10$POL4GeS6HtNQIDl1RSWrBO/bxTXduyQ2rGcS3GepgOhLMecmx2Lzi', 'Bệnh viện Bạch Mai - Viện Sức khỏe Tâm thần', 'bachmai@clinic.com', '02438693731'),
(5, 'mindcare', '$2b$10$POL4GeS6HtNQIDl1RSWrBO/bxTXduyQ2rGcS3GepgOhLMecmx2Lzi', 'Phòng khám Tâm lý MindCare Hà Nội', 'mindcare@clinic.com', '02473005678')
ON DUPLICATE KEY UPDATE
clinicName = VALUES(clinicName),
email = VALUES(email),
phone = VALUES(phone);
