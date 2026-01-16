
# Mental Health Chatbot - Mobile App 📱

### Description
The Mental Health Chatbot is a **mobile application** built with React Native (Expo) and Node.js backend, designed to assist users in managing their mental health. Users can sign up, log in, and interact with an AI-powered chatbot to receive mental health support and book therapy sessions. This project offers a mobile-first platform for students and individuals to seek help and engage with mental health resources anywhere, anytime.

### Features
- **📱 Mobile-First Design**: Native mobile experience on iOS and Android
- **🔐 User Authentication**: Secure sign up and login with JWT tokens
- **🤖 AI Chatbot**: Powered by Google Gemini AI for empathetic mental health conversations
- **📅 Therapy Booking**: Book therapy sessions at available time slots
- **💭 Daily Motivation**: Random positive thoughts and mood boosters
- **🎨 Beautiful UI**: Modern design with gradient themes and smooth animations
- **🔔 Real-time Updates**: Instant responses and booking confirmations
- **📊 Booking History**: View and manage your therapy appointments

### Technologies Used
- **Backend:**
  - Node.js + Express.js - Server and API
  - MySQL - Database for users and bookings
  - JWT - Secure authentication
  - Google Gemini AI - Chatbot intelligence
  
- **Mobile App:**
  - React Native (Expo) - Cross-platform mobile framework
  - TypeScript - Type-safe development
  - Expo Router - File-based navigation
  - Expo Linear Gradient - Beautiful UI effects

### Quick Start 🚀

**Double-click để chạy:**
```
start.bat
```

Hoặc xem hướng dẫn chi tiết: [QUICK_START.md](QUICK_START.md)

---

### Installation Instructions

#### Bước 1: Cài đặt yêu cầu hệ thống

1. **Node.js 16+**: https://nodejs.org/
2. **MySQL 8.0+**: https://dev.mysql.com/downloads/mysql/
   - Hoặc XAMPP: https://www.apachefriends.org/
3. **Expo Go App**: Cài trên điện thoại (iOS/Android)

#### Bước 2: Setup Database

```bash
cd Backend
node setup-database.js
```

#### Bước 3: Cấu hình API Key

Tạo file `Backend/.env`:
```env
API_KEY=your_google_gemini_api_key
```

Lấy API key tại: https://makersuite.google.com/app/apikey

#### Bước 4: Cài đặt dependencies

```bash
# Backend
cd Backend
npm install

# Mobile App
cd mobile
npm install
```

#### Bước 5: Enable Firewall (Run as Admin)

```
Right-click: enable-mobile-access.bat → Run as Administrator
```

#### Bước 6: Chạy App

**Cách nhanh nhất:**
```
Double-click: start.bat
```

**Hoặc thủ công:**
```bash
# Terminal 1 - Backend
cd Backend
node index.js

# Terminal 2 - Mobile App
cd mobile
npm start
```

#### Bước 7: Kết nối Mobile

1. Đảm bảo điện thoại và PC **cùng WiFi**
2. Mở **Expo Go** app trên điện thoại
3. Scan QR code hiển thị trong terminal
4. App sẽ tự động build và mở!

---

### Usage

**Trên Mobile App:**
1. Mở app và đăng ký tài khoản mới
2. Đăng nhập vào hệ thống
3. Tab **Home**: Xem daily motivation
4. Tab **Chatbot**: Chat với AI về mental health
5. Tab **Booking**: Đặt lịch therapy session
6. Tab **Profile**: Xem thông tin và đăng xuất

---

### Project Structure

```
├── Backend/              # Node.js + Express API
│   ├── index.js         # Main server file
│   ├── database.sql     # Database schema
│   └── setup-database.js # Auto setup script
│
├── mobile/              # React Native App
│   ├── app/            # Screens & navigation
│   ├── components/     # Reusable components
│   ├── constants/      # API config & theme
│   └── contexts/       # Auth context
│
├── start.bat           # 🌟 One-click launcher
├── start-mobile.bat    # Alternative launcher
└── enable-mobile-access.bat  # Firewall setup
```

---

### API Endpoints

```
POST   /signup          # Register new user
POST   /login           # User login
POST   /chat            # Chat with AI
POST   /booking         # Book therapy session
GET    /user-bookings   # Get user's bookings
GET    /goodthoughts    # Random motivation
```

---

### Screenshots

<div align="center">
  <img src="https://github.com/user-attachments/assets/dff3860f-7874-48d5-80f0-51de590c003a" width="250"/>
  <img src="https://github.com/user-attachments/assets/3465e21a-9722-4a53-ad5a-7a1c2b85487a" width="250"/>
  <img src="https://github.com/user-attachments/assets/3461eb17-e8bf-4331-8b64-94856f3fc718" width="250"/>
</div>

---

### Troubleshooting

**❌ "Network request failed"**
- Run `enable-mobile-access.bat` as Administrator
- Check PC and mobile on same WiFi
- Verify Backend is running

**❌ Backend không start**
- Check MySQL is running
- Check port 4000 is free
- Verify .env file exists with API_KEY

**❌ Expo QR không scan được**
- Try manual URL entry in Expo Go
- Check firewall settings
- Restart backend and mobile app

Xem thêm: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

### Future Enhancements
- 🔔 Push notifications for booking reminders
- 📊 Mood tracking and analytics
- 🎯 Personalized mental health recommendations
- 💬 Group therapy chat rooms
- 🌙 Dark mode support
- 📱 Offline mode for chatbot
- 🔊 Voice chat with AI

---

### Contact
For queries or contributions:
- **Original Author**: Byas Yadav
- **Email**: byasyadav371@example.com

---

### License
MIT License - Feel free to use and modify for your projects!



