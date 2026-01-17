const { PARTNER_CLINICS } = require('../constants');

// Gemini API Setup
const API_KEY = process.env.API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

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

// Hàm chat sử dụng REST API - với lịch sử trò chuyện để cá nhân hóa trải nghiệm
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
                ${conversationHistory.map(msg => `${msg.role === 'user' ? 'Người dùng' : 'WellBot'}: ${msg.message}`).join('\n')}--- `;
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
            - Bạn sử dụng ngôn ngữ thân mật, gần gũi như nói chuyện với bạn bè thân thiết
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

module.exports = {
    runChat,
    checkBookingIntent,
    getClinicRecommendations
};
