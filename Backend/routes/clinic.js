const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { db } = require('../config/database');
const { CLINIC_SECRET, authenticateClinic } = require('../middleware/auth');

const router = express.Router();

// ----------------- CLINIC LOGIN -----------------
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const [rows] = await db.query(
            "SELECT * FROM clinic_accounts WHERE username = ? AND isActive = TRUE",
            [username]
        );
        
        if (rows.length === 0) {
            return res.status(401).json({ success: false, error: 'Tài khoản không tồn tại' });
        }
        
        const clinic = rows[0];
        const validPassword = await bcrypt.compare(password, clinic.password);
        
        if (!validPassword) {
            return res.status(401).json({ success: false, error: 'Mật khẩu không đúng' });
        }
        
        const token = jwt.sign(
            { clinicId: clinic.clinicId, clinicName: clinic.clinicName, username: clinic.username },
            CLINIC_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            token,
            clinic: {
                id: clinic.clinicId,
                name: clinic.clinicName,
                username: clinic.username
            }
        });
    } catch (err) {
        console.error('Clinic login error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ----------------- GET CLINIC BOOKINGS -----------------
router.get('/bookings', authenticateClinic, async (req, res) => {
    try {
        const { clinicId } = req.clinic;
        const { status } = req.query;
        
        let query = `
            SELECT b.*, u.name as userName, u.email as userEmail
            FROM bookings b
            JOIN users u ON b.userId = u.id
            WHERE b.clinicId = ?
        `;
        const params = [clinicId];
        
        if (status) {
            query += ' AND b.status = ?';
            params.push(status);
        }
        
        query += ' ORDER BY b.date DESC, b.timeslot ASC';
        
        const [bookings] = await db.query(query, params);
        
        res.json({ success: true, bookings });
    } catch (err) {
        console.error('Get clinic bookings error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ----------------- UPDATE BOOKING STATUS -----------------
router.put('/bookings/:bookingId/status', authenticateClinic, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;
        const { clinicId } = req.clinic;
        
        // Kiểm tra booking thuộc phòng khám này
        const [existing] = await db.query(
            "SELECT * FROM bookings WHERE id = ? AND clinicId = ?",
            [bookingId, clinicId]
        );
        
        if (existing.length === 0) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy lịch hẹn' });
        }
        
        await db.query(
            "UPDATE bookings SET status = ? WHERE id = ?",
            [status, bookingId]
        );
        
        res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
    } catch (err) {
        console.error('Update booking status error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ----------------- CREATE MEDICAL RECORD -----------------
router.post('/medical-records', authenticateClinic, async (req, res) => {
    try {
        const { clinicId, clinicName } = req.clinic;
        const {
            bookingId,
            doctorName,
            diagnosis,
            symptoms,
            mentalHealthStatus,
            severity,
            recommendations,
            medications,
            nextAppointment,
            notes
        } = req.body;
        
        // Lấy thông tin booking
        const [bookingRows] = await db.query(
            "SELECT * FROM bookings WHERE id = ? AND clinicId = ?",
            [bookingId, clinicId]
        );
        
        if (bookingRows.length === 0) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy lịch hẹn' });
        }
        
        const booking = bookingRows[0];
        
        // Tạo hồ sơ bệnh án
        const [result] = await db.query(
            `INSERT INTO medical_records 
            (bookingId, userId, clinicId, doctorName, diagnosis, symptoms, mentalHealthStatus, severity, recommendations, medications, nextAppointment, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [bookingId, booking.userId, clinicId, doctorName, diagnosis, symptoms, mentalHealthStatus, severity || 'mild', recommendations, medications, nextAppointment, notes]
        );
        
        // Cập nhật trạng thái booking thành hoàn thành
        await db.query(
            "UPDATE bookings SET status = 'completed' WHERE id = ?",
            [bookingId]
        );
        
        res.json({
            success: true,
            message: 'Tạo hồ sơ bệnh án thành công',
            recordId: result.insertId
        });
    } catch (err) {
        console.error('Create medical record error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ----------------- GET MEDICAL RECORDS BY CLINIC -----------------
router.get('/medical-records', authenticateClinic, async (req, res) => {
    try {
        const { clinicId } = req.clinic;
        
        const [records] = await db.query(
            `SELECT mr.*, u.name as patientName, u.email as patientEmail, b.date as appointmentDate, b.age as patientAge
            FROM medical_records mr
            JOIN users u ON mr.userId = u.id
            JOIN bookings b ON mr.bookingId = b.id
            WHERE mr.clinicId = ?
            ORDER BY mr.createdAt DESC`,
            [clinicId]
        );
        
        res.json({ success: true, records });
    } catch (err) {
        console.error('Get medical records error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ----------------- CLINIC STATS -----------------
router.get('/stats', authenticateClinic, async (req, res) => {
    try {
        const { clinicId } = req.clinic;
        
        const [pending] = await db.query(
            "SELECT COUNT(*) as count FROM bookings WHERE clinicId = ? AND status = 'pending'",
            [clinicId]
        );
        
        const [approved] = await db.query(
            "SELECT COUNT(*) as count FROM bookings WHERE clinicId = ? AND status = 'approved'",
            [clinicId]
        );
        
        const [completed] = await db.query(
            "SELECT COUNT(*) as count FROM bookings WHERE clinicId = ? AND status = 'completed'",
            [clinicId]
        );
        
        const [totalRecords] = await db.query(
            "SELECT COUNT(*) as count FROM medical_records WHERE clinicId = ?",
            [clinicId]
        );
        
        res.json({
            success: true,
            stats: {
                pending: pending[0].count,
                approved: approved[0].count,
                completed: completed[0].count,
                totalRecords: totalRecords[0].count
            }
        });
    } catch (err) {
        console.error('Get clinic stats error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
