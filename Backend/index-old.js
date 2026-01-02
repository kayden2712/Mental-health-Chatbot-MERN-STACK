// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const port = 4000;

// ----------------- MySQL Connection -----------------
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "12345",
    database: "healthbot",
});

// Test database connection
db.getConnection()
    .then(connection => {
        console.log('✓ Database connected successfully');
        connection.release();
    })
    .catch(err => {
        console.error('✗ Database connection failed:', err.message);
        console.error('Please ensure MySQL is running and the healthbot database exists');
    });

// ----------------- Gemini API Setup (REST API) -----------------
const API_KEY = process.env.API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// Chat function using REST API
async function runChat(userInput) {
    try {
        const systemPrompt = "You are a mental health chatbot named WellBot. Stay empathetic, supportive, and avoid answering topics outside mental health.";
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: `${systemPrompt}\n\nUser: ${userInput}\nWellBot:`
                }]
            }],
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 1024,
            }
        };

        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Gemini API error:", response.status, errorData);
            return "Sorry, I'm having trouble responding right now.";
        }

        const data = await response.json();
        const botResponse = data.candidates[0].content.parts[0].text;
        return botResponse;

    } catch (err) {
        console.error("Gemini error:", err.message);
        return "Sorry, I'm having trouble responding right now.";
    }
}

// ----------------- CHAT ENDPOINT -----------------
app.post('/chat', async (req, res) => {
    try {
        const { userInput } = req.body;
        if (!userInput) return res.status(400).json({ error: "Missing userInput" });

        const response = await runChat(userInput);
        res.json({ response });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ----------------- SIGNUP -----------------
app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        console.log('Signup request:', { username, email });

        if (!username || !email || !password) {
            return res.status(400).json({ success: false, errors: "All fields are required" });
        }

        const [found] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        if (found.length > 0)
            return res.status(400).json({ success: false, errors: "User already exists" });

        const [result] = await db.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [username, email, password]
        );

        const token = jwt.sign({ userId: result.insertId }, "secret_chat");
        console.log('✓ User registered successfully:', email);
        res.json({ success: true, token });

    } catch (err) {
        console.error('✗ Signup error:', err.message);
        res.status(500).json({ success: false, errors: err.message });
    }
});

// ----------------- LOGIN -----------------
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login request:', email);

        if (!email || !password) {
            return res.status(400).json({ success: false, error: "Email and password are required" });
        }

        const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
        const user = rows[0];

        if (!user || user.password !== password)
            return res.status(401).json({ success: false, error: "Invalid credentials" });

        const token = jwt.sign({ userId: user.id }, "secret_chat");
        console.log('✓ User logged in successfully:', email);
        res.json({ success: true, token });

    } catch (err) {
        console.error('✗ Login error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ----------------- BOOKING -----------------
app.post('/booking', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ success: false, error: "Missing token" });

        const { userId } = jwt.verify(token, "secret_chat");

        const { name, phone, age, address, timeslot, date } = req.body;

        if (!/^[0-9]{10}$/.test(phone))
            return res.status(400).json({ success: false, error: "Invalid phone" });

        await db.query(
            "INSERT INTO bookings (userId, name, phone, age, address, timeslot, date) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [userId, name, phone, age, address, timeslot, date]
        );

        res.json({ success: true, message: "Booking successful" });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ----------------- USER BOOKINGS -----------------
app.get('/user-bookings', async (req, res) => {
    try {
        const token = req.headers.authorization;
        const { userId } = jwt.verify(token, "secret_chat");

        const [rows] = await db.query("SELECT * FROM bookings WHERE userId = ?", [userId]);
        res.json({ success: true, bookings: rows });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ----------------- RANDOM GOOD THOUGHTS -----------------
const thoughts = [
    { id: 1, joketext: "Smile please!!" },
    { id: 2, joketext: "You are good!!" },
    { id: 3, joketext: "Be happy!!!" },
    { id: 4, joketext: "If you can stay positive, you win!" },
];

app.get('/goodthoughts', (req, res) => {
    const i = Math.floor(Math.random() * thoughts.length);
    res.json(thoughts[i]);
});

// ----------------- START SERVER -----------------
app.listen(port, () => {
    console.log(`\n=================================`);
    console.log(`✓ Server running on port ${port}`);
    console.log(`✓ API URL: http://localhost:${port}`);
    console.log(`=================================\n`);
});
