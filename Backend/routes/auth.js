const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { db } = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// ----------------- SIGNUP -----------------
router.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log('Signup request:', { username, email });

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, errors: "All fields are required" });
        }

        const [found] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (found.length > 0) {
            return res.status(400).json({ success: false, errors: "User already exists" });
        }

        const [result] = await db.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [username, email, password]
        );

        const token = jwt.sign({ userId: result.insertId }, JWT_SECRET);
        console.log('✓ User registered successfully:', email);
        res.json({ success: true, token });

    } catch (err) {
        console.error('✗ Signup error:', err.message);
        res.status(500).json({ success: false, errors: err.message });
    }
});

// ----------------- LOGIN -----------------
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login request:', email);

        if (!email || !password) {
            return res.status(400).json({ success: false, error: "Email and password are required" });
        }

        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        const user = rows[0];

        if (!user || user.password !== password) {
            return res.status(401).json({ success: false, error: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET);
        console.log('✓ User logged in successfully:', email);
        res.json({ success: true, token });

    } catch (err) {
        console.error('✗ Login error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
