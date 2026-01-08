// ⚠️ IMPORTANT: For Expo Go, you MUST use your computer's IP address
// To find your IP:
// Windows: Run "ipconfig" in terminal, look for "IPv4 Address" (usually starts with 192.168.x.x)
// Mac/Linux: Run "ifconfig" or "ip addr", look for inet address

// TODO: Replace with your computer's IP address
const YOUR_COMPUTER_IP = '192.168.1.5'; // ⬅️ CHANGE THIS!

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
