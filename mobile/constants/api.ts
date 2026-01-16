// TODO: Replace with your computer's IP address
const YOUR_COMPUTER_IP = '192.168.1.5'; 
const getBaseUrl = () => {
  if (__DEV__) {
    // For Expo Go, always use your computer's IP address
    return `http://${YOUR_COMPUTER_IP}:4000`;
  }
  // Production URL - Render backend
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
  // Chat history endpoints
  chatSessions: `${API_BASE_URL}/chat-sessions`,
  chatSessionMessages: (sessionId: string | number) => `${API_BASE_URL}/chat-sessions/${sessionId}/messages`,
  deleteSession: (sessionId: string | number) => `${API_BASE_URL}/chat-sessions/${sessionId}`,
  
  // =====================================================
  // CLINIC ADMIN ENDPOINTS
  // =====================================================
  clinicLogin: `${API_BASE_URL}/clinic/login`,
  clinicBookings: `${API_BASE_URL}/clinic/bookings`,
  updateBookingStatus: (bookingId: number) => `${API_BASE_URL}/clinic/bookings/${bookingId}/status`,
  clinicMedicalRecords: `${API_BASE_URL}/clinic/medical-records`,
  clinicStats: `${API_BASE_URL}/clinic/stats`,
  userMedicalRecords: `${API_BASE_URL}/user/medical-records`,
};
