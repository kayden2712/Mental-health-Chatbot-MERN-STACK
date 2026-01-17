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

// Danh sách suy nghĩ tích cực
const GOOD_THOUGHTS = [
    { id: 1, joketext: "Mỗi ngày trôi qua là một cơ hội mới để bạn bắt đầu lại." },
    { id: 2, joketext: "Bạn không cần phải hoàn hảo, chỉ cần cố gắng là đủ." },
    { id: 3, joketext: "Hãy cho bản thân thời gian, mọi điều tốt đẹp đều cần chờ đợi." },
    { id: 4, joketext: "Dù hôm nay có khó khăn, bạn vẫn đang tiến về phía trước." },
];

module.exports = {
    PARTNER_CLINICS,
    GOOD_THOUGHTS
};
