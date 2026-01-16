// TODO: Replace with your computer's IP address
const YOUR_COMPUTER_IP = '10.210.106.133'; 
const getBaseUrl = () => {
  if (__DEV__) {
    // For Expo Go, always use your computer's IP address
    return `http://${YOUR_COMPUTER_IP}:4000`;
  }
  // Production URL - update this when deploying
  return 'https://your-production-api.com';
};

export const API_BASE_URL = getBaseUrl();

export const API_ENDPOINTS = {
  chat: `${API_BASE_URL}/chat`,
  signup: `${API_BASE_URL}/signup`,
  login: `${API_BASE_URL}/login`,
  booking: `${API_BASE_URL}/booking`,
  userBookings: `${API_BASE_URL}/user-bookings`,
  goodThoughts: `${API_BASE_URL}/goodthoughts`,
};
