const express = require('express');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');
const { PARTNER_CLINICS } = require('../constants');

const router = express.Router();

// ----------------- BOOKING -----------------
router.post('/booking', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ success: false, error: "Missing token" });

        const { userId } = jwt.verify(token, JWT_SECRET);

        const { name, phone, age, address, timeslot, date, clinicId } = req.body;

        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({ success: false, error: "Invalid phone" });
        }

        // Kiểm tra clinicId hợp lệ
        if (!clinicId) {
            return res.status(400).json({ success: false, error: "Please select a clinic" });
        }

        const clinic = PARTNER_CLINICS.find(c => c.id === clinicId);
        if (!clinic) {
            return res.status(400).json({ success: false, error: "Invalid clinic" });
        }

        await db.query(
            "INSERT INTO bookings (userId, name, phone, age, address, timeslot, date, clinicId, clinicName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [userId, name, phone, age, address, timeslot, date, clinicId, clinic.name]
        );

        res.json({ success: true, message: "Đặt lịch thành công!", clinicName: clinic.name });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ----------------- USER BOOKINGS -----------------
router.get('/user-bookings', async (req, res) => {
    try {
        const token = req.headers.authorization;
        const { userId } = jwt.verify(token, JWT_SECRET);

        const [rows] = await db.query("SELECT * FROM bookings WHERE userId = ?", [userId]);
        res.json({ success: true, bookings: rows });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ----------------- GET USER'S MEDICAL RECORDS -----------------
router.get('/user/medical-records', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ success: false, error: 'Token required' });
        }
        
        const { userId } = jwt.verify(token, JWT_SECRET);
        
        const [records] = await db.query(
            `SELECT mr.*, b.clinicName, b.date as appointmentDate
            FROM medical_records mr
            JOIN bookings b ON mr.bookingId = b.id
            WHERE mr.userId = ?
            ORDER BY mr.createdAt DESC`,
            [userId]
        );
        
        res.json({ success: true, records });
    } catch (err) {
        console.error('Get user medical records error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
