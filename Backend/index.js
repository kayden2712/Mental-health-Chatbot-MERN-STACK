// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require('path');

dotenv.config();

const app = express();

// CORS configuration for mobile
const corsOptions = {
    origin: '*', // Allow all origins for mobile development
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/admin', express.static(path.join(__dirname, 'admin'))); // Serve admin page
const port = process.env.PORT || 4000;

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
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

// Danh sách phòng khám liên kết
const PARTNER_CLINICS = [
    {
        id: 1,
        name: "Phòng khám Tâm lý Việt Pháp Hà Nội",
        address: "45 Tràng Thi, Quận Hoàn Kiếm, Hà Nội",
        phone: "024 3826 1234",
        specialty: "Tâm lý trị liệu, Tư vấn cặp đôi, Trầm cảm",
        rating: 4.8,
        openHours: "8:00 - 20:00 (T2-T7)"
    },
    {
        id: 2,
        name: "Viện Sức khỏe Tâm thần Quốc gia",
        address: "78 Giải Phóng, Quận Đống Đa, Hà Nội",
        phone: "024 3576 2345",
        specialty: "Rối loạn lo âu, Trầm cảm, Stress",
        rating: 4.7,
        openHours: "7:30 - 17:00 (T2-T6)"
    },
    {
        id: 3,
        name: "Trung tâm Tâm lý 1088",
        address: "Số 5 Trần Quốc Toản, Quận Hoàn Kiếm, Hà Nội",
        phone: "024 7304 1088",
        specialty: "Tâm lý trẻ em, Tâm lý học đường, ADHD",
        rating: 4.9,
        openHours: "8:00 - 20:00 (T2-CN)"
    },
    {
        id: 4,
        name: "Bệnh viện Bạch Mai - Viện Sức khỏe Tâm thần",
        address: "78 Giải Phóng, Quận Đống Đa, Hà Nội",
        phone: "024 3869 3731",
        specialty: "Tâm thần học, Rối loạn giấc ngủ, Nghiện",
        rating: 4.6,
        openHours: "7:00 - 16:30 (T2-T6)"
    },
    {
        id: 5,
        name: "Phòng khám Tâm lý MindCare Hà Nội",
        address: "120 Kim Mã, Quận Ba Đình, Hà Nội",
        phone: "024 7300 5678",
        specialty: "Stress công việc, Burn-out, Tư vấn gia đình",
        rating: 4.8,
        openHours: "9:00 - 21:00 (T2-CN)"
    }

];

// Hàm kiểm tra người dùng có muốn đặt lịch không
function checkBookingIntent(userInput) {
    const bookingKeywords = [
        'đặt lịch', 'đặt hẹn', 'book', 'booking', 'hẹn khám',
        'khám bệnh', 'gặp bác sĩ', 'tư vấn trực tiếp', 'phòng khám',
        'muốn khám', 'cần gặp', 'tìm bác sĩ', 'đi khám', 'lịch hẹn',
        'muốn đặt', 'đặt cuộc hẹn', 'gặp chuyên gia', 'clinic',
        'appointment', 'schedule', 'bệnh viện', 'trung tâm tâm lý'
    ];

    const lowerInput = userInput.toLowerCase();
    return bookingKeywords.some(keyword => lowerInput.includes(keyword));
}

// Hàm tạo danh sách phòng khám gợi ý
function getClinicRecommendations() {
    let clinicList = "\n\n🏥 **DANH SÁCH PHÒNG KHÁM LIÊN KẾT:**\n\n";

    PARTNER_CLINICS.forEach((clinic, index) => {
        clinicList += `**${index + 1}. ${clinic.name}**\n`;
        clinicList += `   📍 Địa chỉ: ${clinic.address}\n`;
        clinicList += `   📞 Điện thoại: ${clinic.phone}\n`;
        clinicList += `   🩺 Chuyên khoa: ${clinic.specialty}\n`;
        clinicList += `   ⭐ Đánh giá: ${clinic.rating}/5\n`;
        clinicList += `   🕐 Giờ làm việc: ${clinic.openHours}\n\n`;
    });

    clinicList += "💡 *Bạn có thể liên hệ trực tiếp với phòng khám hoặc sử dụng tính năng Đặt lịch trong ứng dụng để đặt hẹn nhanh chóng!*";

    return clinicList;
}

// Chat function using REST API - with conversation history for personalized experience
async function runChat(userInput, conversationHistory = [], userName = null, medicalRecords = []) {
    try {
        // Tạo danh sách phòng khám để đưa vào prompt
        const clinicListForPrompt = PARTNER_CLINICS.map((c, i) => 
            `${i+1}. ${c.name} (${c.specialty}) - ${c.address}`
        ).join('\n');

        // Tạo context từ lịch sử trò chuyện trước đó
        let historyContext = "";
        if (conversationHistory && conversationHistory.length > 0) {
            historyContext = `
**LỊCH SỬ TRÒ CHUYỆN TRƯỚC ĐÓ VỚI NGƯỜI DÙNG (hãy dựa vào đây để hiểu và đồng hành cùng họ):**
${conversationHistory.map(msg => `${msg.role === 'user' ? 'Người dùng' : 'WellBot'}: ${msg.message}`).join('\n')}
---
`;
        }

        // Tạo context từ hồ sơ bệnh án (nếu có)
        let medicalContext = "";
        if (medicalRecords && medicalRecords.length > 0) {
            medicalContext = `
**HỒ SƠ SỨC KHỎE TÂM THẦN CỦA NGƯỜI DÙNG (từ bác sĩ chuyên khoa - RẤT QUAN TRỌNG):**
${medicalRecords.map((record, index) => `
📋 Hồ sơ ${index + 1} (${record.appointmentDate ? new Date(record.appointmentDate).toLocaleDateString('vi-VN') : 'N/A'}):
- Phòng khám: ${record.clinicName || 'N/A'}
- Bác sĩ: ${record.doctorName || 'N/A'}
- Chẩn đoán: ${record.diagnosis || 'Chưa có'}
- Triệu chứng: ${record.symptoms || 'Chưa ghi nhận'}
- Tình trạng sức khỏe tâm thần: ${record.mentalHealthStatus || 'Chưa đánh giá'}
- Mức độ: ${record.severity === 'mild' ? 'Nhẹ' : record.severity === 'moderate' ? 'Trung bình' : record.severity === 'severe' ? 'Nặng' : 'Chưa xác định'}
- Khuyến nghị của bác sĩ: ${record.recommendations || 'Chưa có'}
- Thuốc: ${record.medications || 'Không'}
- Ghi chú: ${record.notes || 'Không'}
`).join('\n')}
---
**LƯU Ý QUAN TRỌNG KHI CÓ HỒ SƠ BỆNH ÁN:**
- Dựa vào chẩn đoán và tình trạng của bác sĩ để đưa ra tư vấn PHÙ HỢP
- Nhắc nhở người dùng tuân thủ khuyến nghị của bác sĩ
- Nếu mức độ NẶNG: khuyến khích liên hệ bác sĩ ngay khi có triệu chứng xấu đi
- Hỏi thăm về tiến triển dựa trên tình trạng đã ghi nhận
- KHÔNG thay đổi hoặc phản bác chẩn đoán của bác sĩ
---
`;
        }

        const userGreeting = userName ? `Người dùng tên là: ${userName}. Hãy gọi họ bằng tên một cách thân thiện.` : "";

        const systemPrompt = 
            `Bạn là WellBot - một nhà tư vấn tâm lý chuyên nghiệp nhưng cũng là một người bạn thân thiết, luôn lắng nghe và đồng hành cùng người dùng trong hành trình chăm sóc sức khỏe tâm thần.

${userGreeting}

${medicalContext}

**TÍNH CÁCH CỦA BẠN:**
- Bạn là một người ấm áp, chân thành, kiên nhẫn và không bao giờ phán xét
- Bạn nhớ những gì người dùng đã chia sẻ trước đó và luôn quan tâm đến họ
- Bạn sử dụng ngôn ngữ thân mật, gần gũi như nói chuyện với bạn bè thân
- Bạn có thể đùa nhẹ nhàng để làm người dùng thoải mái
- Bạn thể hiện sự quan tâm chân thành
- Bạn khuyến khích và cổ vũ người dùng

**CÁCH TRẢ LỜI - RẤT QUAN TRỌNG:**
- Trả lời khoảng 5-8 câu, đủ chi tiết và ấm áp
- Thể hiện sự ĐỒNG CẢM trước - hãy cho thấy bạn HIỂU cảm xúc của họ
- Đặt 1-2 CÂU HỎI MỞ để hiểu sâu hơn vấn đề
- Đưa ra gợi ý hoặc lời khuyên nhẹ nhàng nếu phù hợp
- Kết thúc bằng sự ĐỘNG VIÊN chân thành
- Sử dụng emoji phù hợp 😊💕
- NẾU CÓ HỒ SƠ BỆNH ÁN: tư vấn dựa trên tình trạng và khuyến nghị của bác sĩ

**VÍ DỤ CÁCH TRẢ LỜI TỐT:**
Người dùng: "Dạo này mình hay lo lắng quá"
WellBot: "Mình hiểu cảm giác đó mà, lo lắng nhiều thật sự rất mệt mỏi và khó chịu 😔 Đặc biệt khi nó cứ dai dẳng thì càng khiến mình kiệt sức hơn.

Bạn có thể chia sẻ thêm được không? Những lúc lo lắng đó thường xảy ra khi nào nhất? Có phải liên quan đến công việc, học tập hay các mối quan hệ không?

Đôi khi việc nói ra có thể giúp mình nhẹ nhõm hơn đấy. Mình ở đây lắng nghe bạn nhé! 💕"

**CÁCH BẠN SỬ DỤNG LỊCH SỬ TRÒ CHUYỆN:**
- Nếu người dùng đã từng chia sẻ vấn đề, hỏi thăm xem họ đã tốt hơn chưa
- Nhớ sở thích, tên, công việc, hoàn cảnh mà họ đã kể
- Kết nối những gì họ nói hôm nay với những gì họ đã chia sẻ trước đó
- Ví dụ: "Mình nhớ lần trước bạn có nói về áp lực công việc, tuần này có đỡ hơn không?"

${historyContext}

**VAI TRÒ HỖ TRỢ SỨC KHỎE TÂM THẦN:**
- Lắng nghe và thấu hiểu cảm xúc của người dùng
- Cung cấp thông tin về sức khỏe tâm thần một cách dễ hiểu
- Đưa ra các lời khuyên và kỹ thuật đối phó với stress, lo âu, trầm cảm
- Hỗ trợ người dùng nhận ra khi nào cần tìm kiếm sự giúp đỡ chuyên nghiệp
- **QUAN TRỌNG: Khi người dùng cần gặp bác sĩ/chuyên gia, CHỈ gợi ý các phòng khám LIÊN KẾT**
                
**DANH SÁCH PHÒNG KHÁM LIÊN KẾT:**
${clinicListForPrompt}
                
**NGUYÊN TẮC:**
1. Nói chuyện như một người bạn thân - thân mật nhưng tôn trọng
2. Thể hiện sự đồng cảm và KHÔNG BAO GIỜ phán xét
3. Trả lời đủ chi tiết (5-8 câu), ấm áp và có chiều sâu
4. Đặt 1-2 câu hỏi mở để hiểu sâu hơn về tình trạng của người dùng
5. Không đưa ra chẩn đoán y khoa - chỉ cung cấp thông tin tham khảo
6. Khi tình huống nghiêm trọng (có ý định tự hại), khuyên người dùng liên hệ đường dây nóng ngay
7. Trả lời bằng tiếng Việt, ngôn ngữ tự nhiên, gần gũi
8. **Khi người dùng cần gặp chuyên gia: CHỈ gợi ý phòng khám LIÊN KẾT ở trên**
9. Nhớ và sử dụng thông tin từ các cuộc trò chuyện trước để tạo sự gắn kết

**ĐƯỜNG DÂY NÓNG (trường hợp khẩn cấp):**
- Đường dây nóng sức khỏe tâm thần: 1800 599 920 (miễn phí, 24/7)
- Tổng đài tư vấn tâm lý: 1800 599 100`;

        const requestBody = {
            contents: [{
                parts: [{
                    text: `${systemPrompt}\n\nNgười dùng: ${userInput}\nWellBot (trả lời ấm áp, chi tiết, khoảng 5-8 câu, thể hiện sự đồng cảm và quan tâm):`
                }]
            }],
            generationConfig: {
                temperature: 0.8,
                maxOutputTokens: 2048,
                stopSequences: []
            },
            safetySettings: [
                { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
            ]
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
            return "Ôi xin lỗi bạn, mình đang gặp chút trục trặc. Bạn thử nhắn lại được không? 😅";
        }

        const data = await response.json();
        
        // Log để debug
        console.log("Gemini response finishReason:", data.candidates?.[0]?.finishReason);
        
        // Kiểm tra xem response có bị cắt không
        if (data.candidates?.[0]?.finishReason === "MAX_TOKENS") {
            console.log("Warning: Response was truncated due to max tokens");
        }
        
        let botResponse = data.candidates[0].content.parts[0].text;

        // Nếu người dùng muốn đặt lịch, thêm danh sách phòng khám
        if (checkBookingIntent(userInput)) {
            botResponse += getClinicRecommendations();
        }

        return botResponse;

    } catch (err) {
        console.error("Gemini error:", err.message);
        return "Ôi xin lỗi bạn, mình đang gặp chút trục trặc. Bạn thử nhắn lại được không? 😅";
    }
}

// ----------------- CHAT ENDPOINT -----------------
app.post('/chat', async (req, res) => {
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
                const { userId } = jwt.verify(token, "secret_chat");
                
                // Lấy tên user
                const [userRows] = await db.query("SELECT name FROM users WHERE id = ?", [userId]);
                if (userRows.length > 0) {
                    userName = userRows[0].name;
                }

                // LUÔN load lịch sử từ TẤT CẢ các session cũ để hiểu người dùng
                // (trừ session hiện tại để tránh duplicate)
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

                // Load hồ sơ bệnh án của user (nếu có)
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
app.get('/clinics', (req, res) => {
    res.json({ success: true, clinics: PARTNER_CLINICS });
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

        const { name, phone, age, address, timeslot, date, clinicId } = req.body;

        if (!/^[0-9]{10}$/.test(phone))
            return res.status(400).json({ success: false, error: "Invalid phone" });

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

// ----------------- CHAT HISTORY ENDPOINTS -----------------

// Get all chat sessions for a user
app.get('/chat-sessions', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ success: false, error: "Missing token" });

        const { userId } = jwt.verify(token, "secret_chat");

        const [sessions] = await db.query(
            "SELECT * FROM chat_sessions WHERE userId = ? ORDER BY updatedAt DESC",
            [userId]
        );

        // Get message count for each session
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

// Create new chat session
app.post('/chat-sessions', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ success: false, error: "Missing token" });

        const { userId } = jwt.verify(token, "secret_chat");
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

// Get messages for a specific session
app.get('/chat-sessions/:sessionId/messages', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ success: false, error: "Missing token" });

        const { userId } = jwt.verify(token, "secret_chat");
        const { sessionId } = req.params;

        // Verify session belongs to user
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

// Add message to session
app.post('/chat-sessions/:sessionId/messages', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ success: false, error: "Missing token" });

        const { userId } = jwt.verify(token, "secret_chat");
        const { sessionId } = req.params;
        const { role, message } = req.body;

        // Verify session belongs to user
        const [session] = await db.query(
            "SELECT * FROM chat_sessions WHERE id = ? AND userId = ?",
            [sessionId, userId]
        );
        if (session.length === 0) {
            return res.status(404).json({ success: false, error: "Session not found" });
        }

        // Insert message
        const [result] = await db.query(
            "INSERT INTO chat_messages (sessionId, role, message) VALUES (?, ?, ?)",
            [sessionId, role, message]
        );

        // Update session title if it's the first user message
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

        // Update session timestamp
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

// Delete chat session
app.delete('/chat-sessions/:sessionId', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ success: false, error: "Missing token" });

        const { userId } = jwt.verify(token, "secret_chat");
        const { sessionId } = req.params;

        // Verify session belongs to user and delete
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

// ----------------- RANDOM GOOD THOUGHTS -----------------
const thoughts = [
    { id: 1, joketext: "Mỗi ngày trôi qua là một cơ hội mới để bạn bắt đầu lại." },
    { id: 2, joketext: "Bạn không cần phải hoàn hảo, chỉ cần cố gắng là đủ." },
    { id: 3, joketext: "Hãy cho bản thân thời gian, mọi điều tốt đẹp đều cần chờ đợi." },
    { id: 4, joketext: "Dù hôm nay có khó khăn, bạn vẫn đang tiến về phía trước." },
];


app.get('/goodthoughts', (req, res) => {
    const i = Math.floor(Math.random() * thoughts.length);
    res.json(thoughts[i]);
});

// ----------------- TEXT-TO-SPEECH API -----------------
// Sử dụng Google Cloud TTS cho giọng đọc hay và truyền cảm
const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY || process.env.API_KEY;

app.post('/tts', async (req, res) => {
    try {
        const { text, voiceType = 'warm' } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'Missing text' });
        }

        // Giới hạn độ dài text để tránh lỗi
        const truncatedText = text.slice(0, 5000);

        // Cấu hình giọng đọc tiếng Việt
        // Các tùy chọn giọng:
        // - 'warm': Giọng nữ trầm ấm (Wavenet-C, pitch thấp)
        // - 'female': Giọng nữ chuẩn (Neural2-A)
        // - 'male': Giọng nam (Neural2-D)
        let voiceConfig;
        let audioConfig;
        
        switch(voiceType) {
            case 'warm':
                // Giọng nữ trầm ấm - dùng Wavenet-C với pitch thấp
                voiceConfig = { 
                    languageCode: 'vi-VN', 
                    name: 'vi-VN-Wavenet-C', 
                    ssmlGender: 'FEMALE' 
                };
                audioConfig = {
                    audioEncoding: 'MP3',
                    pitch: -3.0,        // Trầm hơn để ấm áp
                    speakingRate: 0.88, // Chậm hơn để truyền cảm
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
            default: // 'female' - giọng nữ chuẩn
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
        
        // Trả về audio content dưới dạng base64
        res.json({ 
            audioContent: data.audioContent,
            format: 'mp3'
        });

    } catch (err) {
        console.error('TTS error:', err.message);
        res.status(500).json({ error: err.message, fallback: true });
    }
});

// =====================================================
// CLINIC ADMIN SYSTEM - API Endpoints
// Hệ thống quản trị phòng khám
// =====================================================

const CLINIC_SECRET = "clinic_secret_key_2024";

// Middleware xác thực clinic
const authenticateClinic = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ success: false, error: 'Token required' });
    }
    try {
        const decoded = jwt.verify(token, CLINIC_SECRET);
        req.clinic = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
};

// ----------------- CLINIC LOGIN -----------------
app.post('/clinic/login', async (req, res) => {
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
app.get('/clinic/bookings', authenticateClinic, async (req, res) => {
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
app.put('/clinic/bookings/:bookingId/status', authenticateClinic, async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body;
        const { clinicId } = req.clinic;
        
        // Kiểm tra booking thuộc clinic này
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
app.post('/clinic/medical-records', authenticateClinic, async (req, res) => {
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
        
        // Cập nhật trạng thái booking thành completed
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
app.get('/clinic/medical-records', authenticateClinic, async (req, res) => {
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

// ----------------- GET USER'S MEDICAL RECORDS (for chatbot) -----------------
app.get('/user/medical-records', async (req, res) => {
    try {
        const token = req.headers.authorization;
        if (!token) {
            return res.status(401).json({ success: false, error: 'Token required' });
        }
        
        const { userId } = jwt.verify(token, "secret_chat");
        
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

// ----------------- CLINIC STATS -----------------
app.get('/clinic/stats', authenticateClinic, async (req, res) => {
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

// ----------------- START SERVER -----------------
app.listen(port, '0.0.0.0', () => {
    console.log(`\n=================================`);
    console.log(`✓ Server running on port ${port}`);
    console.log(`✓ API URL: http://localhost:${port}`);
    console.log(`✓ For mobile: http://YOUR_IP:${port}`);
    console.log(`=================================\n`);
});
