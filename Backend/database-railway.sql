-- =====================================================
-- MENTAL HEALTH CHATBOT - RAILWAY DATABASE SCHEMA
-- MySQL / MariaDB - Railway Compatible Version
-- =====================================================

-- Railway đã tạo database sẵn, không cần CREATE DATABASE
-- Chỉ cần tạo tables

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
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    clinic VARCHAR(255) NOT NULL,
    bookingType ENUM('online', 'offline') DEFAULT 'online',
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    userId INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_booking_date ON bookings(date);
CREATE INDEX idx_booking_user ON bookings(userId);

-- =====================================================
-- BẢNG GOOD THOUGHTS (SUY NGHĨ TÍCH CỰC)
-- =====================================================
CREATE TABLE IF NOT EXISTS goodthoughts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    thoughts TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- =====================================================
-- BẢNG CLINICS (PHÒNG KHÁM)
-- =====================================================
CREATE TABLE IF NOT EXISTS clinics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500),
    phone VARCHAR(50),
    email VARCHAR(255),
    specialty VARCHAR(255),
    description TEXT,
    rating DECIMAL(2,1) DEFAULT 0.0,
    workingHours VARCHAR(100),
    image VARCHAR(500),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_clinic_name ON clinics(name);

-- =====================================================
-- BẢNG CLINIC ADMINS (QUẢN TRỊ PHÒNG KHÁM)
-- =====================================================
CREATE TABLE IF NOT EXISTS clinic_admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    clinicId INT NOT NULL,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    fullName VARCHAR(255),
    phone VARCHAR(50),
    role ENUM('admin', 'staff') DEFAULT 'admin',
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clinicId) REFERENCES clinics(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_clinic_admin_username ON clinic_admins(username);
CREATE INDEX idx_clinic_admin_clinic ON clinic_admins(clinicId);

-- =====================================================
-- BẢNG CHAT SESSIONS (PHIÊN CHAT)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    title VARCHAR(255) DEFAULT 'New Conversation',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_chat_session_user ON chat_sessions(userId);

-- =====================================================
-- BẢNG CHAT MESSAGES (TIN NHẮN CHAT)
-- =====================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sessionId INT NOT NULL,
    sender ENUM('user', 'bot') NOT NULL,
    message TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sessionId) REFERENCES chat_sessions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_chat_message_session ON chat_messages(sessionId);

-- =====================================================
-- BẢNG MEDICAL RECORDS (HỒ SƠ BỆNH ÁN)
-- =====================================================
CREATE TABLE IF NOT EXISTS medical_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bookingId INT NOT NULL,
    userId INT NOT NULL,
    clinicId INT NOT NULL,
    diagnosis TEXT,
    prescription TEXT,
    notes TEXT,
    nextAppointment DATE,
    doctorName VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (clinicId) REFERENCES clinics(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_medical_record_booking ON medical_records(bookingId);
CREATE INDEX idx_medical_record_user ON medical_records(userId);
CREATE INDEX idx_medical_record_clinic ON medical_records(clinicId);

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- Sample Good Thoughts
INSERT INTO goodthoughts (thoughts) VALUES
('Hãy luôn tin vào chính mình và khả năng của bạn'),
('Mỗi ngày là một cơ hội mới để bắt đầu lại'),
('Bạn mạnh mẽ hơn những gì bạn nghĩ'),
('Hãy yêu thương bản thân mình nhiều hơn'),
('Mọi thứ sẽ ổn thôi, hãy kiên nhẫn');

-- Sample Clinics
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
-- Sample Clinic Admins (password: admin123 - đã hash bằng bcrypt)
-- Hash của 'admin123': $2b$10$rKZd9K7qF8qJ9QxYZqJ9ZuC7VZ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9
INSERT INTO clinic_admins (clinicId, username, password, email, fullName, role) VALUES
(1, 'admin1', '$2b$10$rKZd9K7qF8qJ9QxYZqJ9ZuC7VZ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9', 'admin1@clinic1.com', 'Nguyễn Văn A', 'admin'),
(2, 'admin2', '$2b$10$rKZd9K7qF8qJ9QxYZqJ9ZuC7VZ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9', 'admin2@clinic2.com', 'Trần Thị B', 'admin'),
(3, 'admin3', '$2b$10$rKZd9K7qF8qJ9QxYZqJ9ZuC7VZ9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9Z9', 'admin3@clinic3.com', 'Lê Văn C', 'admin');