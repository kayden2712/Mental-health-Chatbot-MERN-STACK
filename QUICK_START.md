# 🚀 Quick Start Guide - Mobile App

## Chạy nhanh bằng 1 cú nhấp chuột!

### 📱 Cách duy nhất: Chạy Mobile App
```
Double-click: start.bat
```
- Tự động tìm IP WiFi
- Tự động cập nhật cấu hình mobile
- Khởi động Backend + Mobile Expo
- Tự động dọn dẹp processes cũ

**Hoặc:**
```
Double-click: start-mobile.bat
```

---

## ⚙️ Lần đầu setup

### 1. Cài đặt dependencies
```bash
# Backend
cd Backend
npm install

# Mobile App
cd mobile
npm install
```

### 2. Setup MySQL Database
```bash
cd Backend
node setup-database.js
```

### 3. Tạo file .env trong folder Backend
```
API_KEY=your_gemini_api_key_here
```

### 4. Enable Mobile Access (Run as Admin)
```
Right-click: enable-mobile-access.bat → Run as Administrator
```

---

## 📋 Yêu cầu hệ thống

- ✅ Node.js 16+
- ✅ MySQL 8.0+
- ✅ npm hoặc yarn
- ✅ Expo Go app (cài trên điện thoại)
- ✅ WiFi (PC và mobile cùng mạng)

---

## 🎮 Sử dụng Mobile App

### Bước 1: Chuẩn bị
1. Cài **Expo Go** trên điện thoại (iOS/Android)
2. Kết nối điện thoại và máy tính **cùng WiFi**
3. Đảm bảo MySQL đang chạy

### Bước 2: Start App
1. Double-click `start.bat` hoặc `start-mobile.bat`
2. Đợi Backend khởi động (3 giây)
3. Expo sẽ hiển thị QR code

### Bước 3: Kết nối Mobile
1. Mở **Expo Go** app trên điện thoại
2. Scan QR code
3. App sẽ tự động build và mở

### Bước 4: Sử dụng
1. Đăng ký tài khoản mới
2. Hoặc đăng nhập nếu đã có
3. Bắt đầu chat với WellBot!

---

## 🔧 Troubleshooting

### ❌ Backend không start?
- Kiểm tra MySQL đang chạy
- Port 4000 bị chiếm: File sẽ tự động kill process cũ

### ❌ Mobile không connect?
**Giải pháp:**
1. Kiểm tra cùng WiFi
2. Run `enable-mobile-access.bat` as Admin
3. Check IP trong terminal output
4. Thử reload app (shake device → Reload)

### ❌ "Network request failed"
**Nguyên nhân:** Firewall đang chặn
**Giải pháp:**
```
Right-click: enable-mobile-access.bat
→ Run as Administrator
```

### ❌ Expo QR không scan được
**Giải pháp:**
1. Mở Expo Go → Enter URL manually
2. Nhập URL từ terminal (exp://...)
3. Hoặc chọn "Scan QR Code" trong Expo Go

### ❌ IP thay đổi sau khi restart
**Giải pháp:**
- Chạy lại `start.bat` - sẽ tự động cập nhật IP mới

---

## 📁 Cấu trúc project

```
├── Backend/              # Express + MySQL + Gemini AI
├── mobile/               # React Native Expo App
├── start.bat            # 🌟 Launcher chính
├── start-mobile.bat     # 📱 Launcher mobile (giống start.bat)
└── enable-mobile-access.bat  # Firewall config
```

---

## 🎯 Features của Mobile App

✅ **Authentication**
- Đăng ký / Đăng nhập
- JWT token authentication
- Secure password storage

✅ **Mental Health Chat**
- AI-powered chatbot (Gemini)
- Empathetic responses
- Mental health focus

✅ **Booking System**
- Book therapy sessions
- View your bookings
- Manage appointments

✅ **Daily Motivation**
- Random positive thoughts
- Mood boosting messages

---

## 💡 Tips & Best Practices

### Performance
- Giữ Backend running trong suốt phiên làm việc
- Đóng các app không cần thiết để tăng tốc Expo

### Development
- Shake device để mở Developer Menu
- Enable Fast Refresh trong Expo
- Check logs trong terminal

### Debugging
- Xem logs trong terminal Backend
- Check network requests trong Expo console
- Use React Native Debugger nếu cần

---

## 🎉 Đó là tất cả!

Chỉ cần:
1. ✅ Double-click `start.bat`
2. ✅ Scan QR code
3. ✅ Bắt đầu sử dụng!

💡 **Lưu ý:** 
- Backend và Mobile sẽ mở trong các cửa sổ riêng
- Đóng cửa sổ CMD = dừng server
- Firewall popup lần đầu? Chọn "Allow access"

---

## 📞 Thông tin kết nối

Sau khi start, bạn sẽ thấy:
```
📡 Backend API:   http://YOUR_IP:4000
📱 Mobile App:    Scan QR in Expo Go
```

Test endpoint:
```
http://YOUR_IP:4000/goodthoughts
```

Nếu thấy JSON response → ✅ Kết nối thành công!
