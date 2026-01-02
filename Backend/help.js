// server.js
const express = require("express");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");

const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const mysql = require("mysql2/promise");

dotenv.config();

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

// ===============================
// 1. CONNECT MYSQL
// ===============================
let db;

(async () => {
  db = await mysql.createPool({
    host: "localhost",
    user: "root",
    password: "12345", 
    database: "healthbot",
  });
  console.log("✅ MySQL connected!");
})();

// ===============================
// 2. GEMINI AI CONFIG
// ===============================
const MODEL_NAME = "gemini-pro";
const API_KEY = process.env.API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: MODEL_NAME });

async function runChat(userInput) {
  const generationConfig = {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  };

  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  const chat = model.startChat({
    generationConfig,
    safetySettings,
    history: [
      {
        role: "user",
        parts: [
          {
            text: "You are mental health chatbot named 'WellBot'...",
          },
        ],
      },
      {
        role: "model",
        parts: [
          {
            text: "(Smiling emoji) Hello there!... ",
          },
        ],
      },
    ],
  });

  const result = await chat.sendMessage(userInput);
  return result.response.text();
}

// ===============================
// 3. ROUTES
// ===============================

app.get("/", (req, res) => {
  res.send("Server is running with MySQL database!");
});

// ---------- CHAT ----------
app.post("/chat", async (req, res) => {
  try {
    const userInput = req.body?.userInput;
    if (!userInput) return res.status(400).json({ error: "Invalid request" });

    const response = await runChat(userInput);
    res.json({ response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Chat error" });
  }
});

// ---------- SIGNUP ----------
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const [exist] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (exist.length > 0) {
      return res
        .status(400)
        .json({ success: false, error: "User already exists" });
    }

    const [result] = await db.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password]
    );

    const token = jwt.sign({ userId: result.insertId }, "secret_chat");
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------- LOGIN ----------
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0 || rows[0].password !== password) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: rows[0].id }, "secret_chat");
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------- BOOK A SESSION ----------
app.post("/booking", async (req, res) => {
  try {
    const authToken = req.headers.authorization;
    const tokenData = jwt.verify(authToken, "secret_chat");

    const userId = tokenData.userId;
    const { name, phone, age, address, timeslot } = req.body;

    await db.query(
      "INSERT INTO bookings (userId, name, phone, age, address, timeslot) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, name, phone, age, address, timeslot]
    );

    res.json({ success: true, message: "Booking successful" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------- GET USER BOOKINGS ----------
app.get("/user-bookings", async (req, res) => {
  try {
    const authToken = req.headers.authorization;
    const tokenData = jwt.verify(authToken, "secret_chat");

    const userId = tokenData.userId;

    const [rows] = await db.query("SELECT * FROM bookings WHERE userId = ?", [
      userId,
    ]);

    res.json({ success: true, bookings: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ---------- RANDOM GOOD THOUGHTS ----------
const thoughts = [
  { id: 1, joketext: "Smile please!!" },
  { id: 2, joketext: "You are good!!" },
  { id: 3, joketext: "Be happy!!!" },
  { id: 4, joketext: "Shut your door!!" },
  { id: 5, joketext: "I will kick your heart" },
  { id: 6, joketext: "Do some funny things" },
  { id: 7, joketext: "Don't take stress!!" },
];

app.get("/goodthoughts", (req, res) => {
  const idx = Math.floor(Math.random() * thoughts.length);
  res.json(thoughts[idx]);
});

// ===============================
// 4. START SERVER
// ===============================
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
