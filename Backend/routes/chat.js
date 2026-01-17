const express = require('express');
const jwt = require('jsonwebtoken');
const { db } = require('../config/database');
const { JWT_SECRET } = require('../middleware/auth');
const { runChat } = require('../services/gemini');
const { PARTNER_CLINICS, GOOD_THOUGHTS } = require('../constants');

const router = express.Router();

// ----------------- CHAT ENDPOINT -----------------
router.post('/chat', async (req, res) => {
    try {
        const { userInput, sessionId } = req.body;
        if (!userInput) return res.status(400).json({ error: "Missing userInput" });

        let currentSessionHistory = [];
        let oldSessionsHistory = [];
        let medicalRecords = [];
        let userName = null;

        const token = req.headers.authorization;

        // Nếu có token (user đã đăng nhập), load lịch sử để hiểu người dùng
        if (token) {
            try {
                const { userId } = jwt.verify(token, JWT_SECRET);
                
                // Lấy tên người dùng
                const [userRows] = await db.query("SELECT name FROM users WHERE id = ?", [userId]);
                if (userRows.length > 0) {
                    userName = userRows[0].name;
                }

                // LUÔN load lịch sử từ TẤT CẢ các session cũ để hiểu người dùng
                const [oldMessages] = await db.query(
                    `SELECT cm.role, cm.message, cs.title as sessionTitle
                     FROM chat_messages cm
                     JOIN chat_sessions cs ON cm.sessionId = cs.id
                     WHERE cs.userId = ? ${sessionId ? 'AND cs.id != ?' : ''}
                     ORDER BY cm.createdAt DESC 
                     LIMIT 50`,
                    sessionId ? [userId, sessionId] : [userId]
                );
                oldSessionsHistory = oldMessages.reverse();

                // Nếu có sessionId, load thêm tin nhắn từ session hiện tại
                if (sessionId) {
                    const [currentMessages] = await db.query(
                        `SELECT role, message FROM chat_messages 
                         WHERE sessionId = ? 
                         ORDER BY createdAt DESC 
                         LIMIT 20`,
                        [sessionId]
                    );
                    currentSessionHistory = currentMessages.reverse();
                }

                // Load hồ sơ bệnh án của người dùng (nếu có)
                const [medicalRows] = await db.query(
                    `SELECT mr.*, b.clinicName, b.date as appointmentDate
                     FROM medical_records mr
                     JOIN bookings b ON mr.bookingId = b.id
                     WHERE mr.userId = ?
                     ORDER BY mr.createdAt DESC
                     LIMIT 5`,
                    [userId]
                );
                medicalRecords = medicalRows;
            } catch (err) {
                console.error('Error loading user history:', err);
            }
        }

        // Kết hợp lịch sử: cũ trước, hiện tại sau
        const conversationHistory = [...oldSessionsHistory, ...currentSessionHistory];

        const response = await runChat(userInput, conversationHistory, userName, medicalRecords);
        res.json({ response });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ----------------- GET PARTNER CLINICS -----------------
router.get('/clinics', (req, res) => {
    res.json({ success: true, clinics: PARTNER_CLINICS });
});

// ----------------- RANDOM GOOD THOUGHTS -----------------
router.get('/goodthoughts', (req, res) => {
    const i = Math.floor(Math.random() * GOOD_THOUGHTS.length);
    res.json(GOOD_THOUGHTS[i]);
});

// ----------------- CHAT HISTORY ENDPOINTS -----------------

// Lấy tất cả các phiên chat của người dùng
router.get('/chat-sessions', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ success: false, error: "Missing token" });

        const { userId } = jwt.verify(token, JWT_SECRET);

        const [sessions] = await db.query(
            "SELECT * FROM chat_sessions WHERE userId = ? ORDER BY updatedAt DESC",
            [userId]
        );

        // Lấy số lượng tin nhắn cho mỗi session
        for (let session of sessions) {
            const [countResult] = await db.query(
                "SELECT COUNT(*) as count FROM chat_messages WHERE sessionId = ?",
                [session.id]
            );
            session.messageCount = countResult[0].count;
        }

        res.json({ success: true, sessions });
    } catch (err) {
        console.error('Get chat sessions error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Tạo phiên chat mới
router.post('/chat-sessions', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ success: false, error: "Missing token" });

        const { userId } = jwt.verify(token, JWT_SECRET);
        const { title } = req.body;

        const [result] = await db.query(
            "INSERT INTO chat_sessions (userId, title) VALUES (?, ?)",
            [userId, title || 'Cuộc trò chuyện mới']
        );

        const [newSession] = await db.query(
            "SELECT * FROM chat_sessions WHERE id = ?",
            [result.insertId]
        );

        console.log('✓ New chat session created:', result.insertId);
        res.json({ success: true, session: newSession[0] });
    } catch (err) {
        console.error('Create chat session error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Lấy tin nhắn cho một phiên cụ thể
router.get('/chat-sessions/:sessionId/messages', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ success: false, error: "Missing token" });

        const { userId } = jwt.verify(token, JWT_SECRET);
        const { sessionId } = req.params;

        // Xác minh session thuộc về người dùng
        const [session] = await db.query(
            "SELECT * FROM chat_sessions WHERE id = ? AND userId = ?",
            [sessionId, userId]
        );
        if (session.length === 0) {
            return res.status(404).json({ success: false, error: "Session not found" });
        }

        const [messages] = await db.query(
            "SELECT * FROM chat_messages WHERE sessionId = ? ORDER BY createdAt ASC",
            [sessionId]
        );

        res.json({ success: true, messages });
    } catch (err) {
        console.error('Get messages error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Thêm tin nhắn vào phiên
router.post('/chat-sessions/:sessionId/messages', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ success: false, error: "Missing token" });

        const { userId } = jwt.verify(token, JWT_SECRET);
        const { sessionId } = req.params;
        const { role, message } = req.body;

        // Xác minh session thuộc về người dùng
        const [session] = await db.query(
            "SELECT * FROM chat_sessions WHERE id = ? AND userId = ?",
            [sessionId, userId]
        );
        if (session.length === 0) {
            return res.status(404).json({ success: false, error: "Session not found" });
        }

        // Chèn tin nhắn
        const [result] = await db.query(
            "INSERT INTO chat_messages (sessionId, role, message) VALUES (?, ?, ?)",
            [sessionId, role, message]
        );

        // Cập nhật tiêu đề session nếu đây là tin nhắn đầu tiên của người dùng
        if (role === 'user') {
            const [msgCount] = await db.query(
                "SELECT COUNT(*) as count FROM chat_messages WHERE sessionId = ? AND role = 'user'",
                [sessionId]
            );
            if (msgCount[0].count === 1) {
                await db.query(
                    "UPDATE chat_sessions SET title = ? WHERE id = ?",
                    [message.slice(0, 50) + (message.length > 50 ? '...' : ''), sessionId]
                );
            }
        }

        // Cập nhật thời gian của session
        await db.query(
            "UPDATE chat_sessions SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?",
            [sessionId]
        );

        res.json({ success: true, messageId: result.insertId });
    } catch (err) {
        console.error('Add message error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Xóa phiên chat
router.delete('/chat-sessions/:sessionId', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ success: false, error: "Missing token" });

        const { userId } = jwt.verify(token, JWT_SECRET);
        const { sessionId } = req.params;

        // Xác minh session thuộc về người dùng và xóa
        const [result] = await db.query(
            "DELETE FROM chat_sessions WHERE id = ? AND userId = ?",
            [sessionId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, error: "Session not found" });
        }

        console.log('✓ Chat session deleted:', sessionId);
        res.json({ success: true, message: "Session deleted" });
    } catch (err) {
        console.error('Delete session error:', err.message);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ----------------- TEXT-TO-SPEECH -----------------
const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY || process.env.API_KEY;

router.post('/tts', async (req, res) => {
    try {
        const { text, voiceType = 'warm' } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Missing text' });
        }

        const truncatedText = text.slice(0, 5000);

        let voiceConfig;
        let audioConfig;
        
        switch(voiceType) {
            case 'warm':
                voiceConfig = { 
                    languageCode: 'vi-VN', 
                    name: 'vi-VN-Wavenet-C', 
                    ssmlGender: 'FEMALE' 
                };
                audioConfig = {
                    audioEncoding: 'MP3',
                    pitch: -3.0,
                    speakingRate: 0.88,
                    volumeGainDb: 1.0,
                    effectsProfileId: ['headphone-class-device']
                };
                break;
            case 'male':
                voiceConfig = { 
                    languageCode: 'vi-VN', 
                    name: 'vi-VN-Wavenet-B', 
                    ssmlGender: 'MALE' 
                };
                audioConfig = {
                    audioEncoding: 'MP3',
                    pitch: -2.0,
                    speakingRate: 0.9,
                    volumeGainDb: 0,
                    effectsProfileId: ['headphone-class-device']
                };
                break;
            default:
                voiceConfig = { 
                    languageCode: 'vi-VN', 
                    name: 'vi-VN-Neural2-A', 
                    ssmlGender: 'FEMALE' 
                };
                audioConfig = {
                    audioEncoding: 'MP3',
                    pitch: 0,
                    speakingRate: 0.95,
                    volumeGainDb: 0,
                    effectsProfileId: ['headphone-class-device']
                };
        }

        const requestBody = {
            input: { text: truncatedText },
            voice: voiceConfig,
            audioConfig: audioConfig
        };

        const response = await fetch(
            `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            }
        );

        if (!response.ok) {
            const error = await response.text();
            console.error('Google TTS error:', error);
            return res.status(500).json({ error: 'TTS service error', fallback: true });
        }

        const data = await response.json();
        
        res.json({ 
            audioContent: data.audioContent,
            format: 'mp3'
        });

    } catch (err) {
        console.error('TTS error:', err.message);
        res.status(500).json({ error: err.message, fallback: true });
    }
});

module.exports = router;
