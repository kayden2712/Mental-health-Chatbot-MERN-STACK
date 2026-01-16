// TODO: Thay thế bằng địa chỉ IP của máy tính của bạn
const YOUR_COMPUTER_IP = '192.168.1.5'; 
const getBaseUrl = () => {
  if (__DEV__) {
    // Đối với Expo Go, luôn sử dụng địa chỉ IP của máy tính của bạn
    return `http://${YOUR_COMPUTER_IP}:4000`;
  }
  // URL sản phẩm - Backend Render
  return 'https://wellbot-7dbu.onrender.com';
};

export const API_BASE_URL = getBaseUrl();

export const API_ENDPOINTS = {
  chat: `${API_BASE_URL}/chat`,
  signup: `${API_BASE_URL}/signup`,
  login: `${API_BASE_URL}/login`,
  booking: `${API_BASE_URL}/booking`,
  userBookings: `${API_BASE_URL}/user-bookings`,
  goodThoughts: `${API_BASE_URL}/goodthoughts`,
  clinics: `${API_BASE_URL}/clinics`,
  tts: `${API_BASE_URL}/tts`,
  // Các endpoint lịch sử chat
  chatSessions: `${API_BASE_URL}/chat-sessions`,
  chatSessionMessages: (sessionId: string | number) => `${API_BASE_URL}/chat-sessions/${sessionId}/messages`,
  deleteSession: (sessionId: string | number) => `${API_BASE_URL}/chat-sessions/${sessionId}`,
  
  // =====================================================
  // CÁC ENDPOINT QUẢN TRỊ PHÒNG KHÁM
  // =====================================================
  clinicLogin: `${API_BASE_URL}/clinic/login`,
  clinicBookings: `${API_BASE_URL}/clinic/bookings`,
  updateBookingStatus: (bookingId: number) => `${API_BASE_URL}/clinic/bookings/${bookingId}/status`,
  clinicMedicalRecords: `${API_BASE_URL}/clinic/medical-records`,
  clinicStats: `${API_BASE_URL}/clinic/stats`,
  userMedicalRecords: `${API_BASE_URL}/user/medical-records`,
};
