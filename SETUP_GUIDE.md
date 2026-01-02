# 🚀 Hướng dẫn chạy Mental Health Chatbot

## 📋 Yêu cầu hệ thống

- **Node.js** v14 trở lên (tải tại: https://nodejs.org/)
- **MySQL** v5.7 trở lên hoặc **XAMPP/WAMP** (tải tại: https://www.apachefriends.org/)
- **Google Gemini API Key** (đăng ký miễn phí tại: https://makersuite.google.com/app/apikey)

## 📝 Các bước cài đặt

### Bước 1: Cài đặt MySQL

**Tùy chọn A: Sử dụng XAMPP (Đơn giản nhất)**
1. Tải XAMPP từ https://www.apachefriends.org/
2. Cài đặt và mở XAMPP Control Panel
3. Bấm "Start" cho MySQL

**Tùy chọn B: Cài MySQL riêng**
1. Tải MySQL từ https://dev.mysql.com/downloads/mysql/
2. Cài đặt và nhớ mật khẩu root

### Bước 2: Tạo Database

**Cách 1: Sử dụng phpMyAdmin (XAMPP)**
1. Mở trình duyệt, truy cập: http://localhost/phpmyadmin
2. Click "New" để tạo database mới
3. Tên database: `healthbot`
4. Click tab "SQL" và paste nội dung file `Backend/database.sql`
5. Click "Go"

**Cách 2: Sử dụng MySQL Command Line**
```bash
# Mở MySQL
mysql -u root -p

# Nếu không có password, dùng:
mysql -u root
```

Sau đó chạy:
```sql
CREATE DATABASE healthbot;
USE healthbot;
source d:/Development/IdeaProjects/Mental-health-Chatbot-MERN-STACK/Backend/database.sql;
```

### Bước 3: Cấu hình API Key

1. Truy cập https://makersuite.google.com/app/apikey
2. Đăng nhập bằng Google
3. Click "Create API Key"
4. Copy API key

5. Tạo file `.env` trong thư mục `Backend`:
```bash
cd Backend
copy .env.example .env
```

6. Mở file `.env` và thêm API key:
```
API_KEY=your_actual_api_key_here
```

### Bước 4: Cài đặt Dependencies

**Backend:**
```bash
cd Backend
npm install
```

**Frontend:**
```bash
cd chatbot
npm install
```

### Bước 5: Chạy Project

**Terminal 1 - Backend:**
```bash
cd Backend
npm start
```

Bạn sẽ thấy:
```
✅ MySQL connected!
Server running on port 4000
```

**Terminal 2 - Frontend:**
```bash
cd..
cd chatbot
npm start
```

Trình duyệt sẽ tự động mở http://localhost:3000

## ✅ Kiểm tra

1. **Database:** Vào phpMyAdmin, kiểm tra database `healthbot` có 2 bảng: `users` và `bookings`
2. **Backend:** Truy cập http://localhost:4000/goodthoughts - nếu thấy JSON response là OK
3. **Frontend:** Mở http://localhost:3000 - trang web hiển thị bình thường

## 🔧 Xử lý lỗi thường gặp

### Lỗi 1: "Cannot connect to MySQL"
**Nguyên nhân:** MySQL chưa chạy hoặc sai cấu hình

**Giải pháp:**
- Kiểm tra MySQL đã start chưa (XAMPP Control Panel)
- Kiểm tra file `Backend/index.js` dòng 16-21:
```javascript
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",  // Thêm password nếu có
    database: "healthbot",
});
```

### Lỗi 2: "ER_NO_SUCH_TABLE: Table 'healthbot.users' doesn't exist"
**Nguyên nhân:** Chưa chạy file SQL

**Giải pháp:** Chạy lại file `Backend/database.sql` (xem Bước 2)

### Lỗi 3: "API_KEY is not defined"
**Nguyên nhân:** Chưa tạo file `.env` hoặc chưa có API key

**Giải pháp:**
- Tạo file `.env` trong thư mục Backend
- Thêm dòng: `API_KEY=your_key_here`

### Lỗi 4: "Port 3000 already in use"
**Nguyên nhân:** Có app khác đang dùng port 3000

**Giải pháp:**
- Tắt app đang dùng port 3000
- Hoặc chạy frontend với port khác:
```bash
set PORT=3001 && npm start
```

### Lỗi 5: "npm install" báo lỗi
**Nguyên nhân:** Node.js phiên bản cũ hoặc npm bị lỗi

**Giải pháp:**
```bash
# Xóa cache
npm cache clean --force

# Xóa node_modules và cài lại
rmdir /s /q node_modules
del package-lock.json
npm install
```

## 📱 Sử dụng

1. **Đăng ký tài khoản:** Click "Sign Up" và tạo tài khoản mới
2. **Đăng nhập:** Đăng nhập bằng email và password
3. **Chat với bot:** Bắt đầu trò chuyện với WellBot
4. **Đặt lịch hẹn:** Chọn "Booking" để đặt lịch với therapist

## 🎯 Các endpoints API

- `POST /signup` - Đăng ký
- `POST /login` - Đăng nhập
- `POST /chat` - Chat với bot
- `POST /booking` - Đặt lịch hẹn
- `GET /user-bookings` - Xem lịch hẹn của user
- `GET /goodthoughts` - Lấy câu động viên ngẫu nhiên

## 📞 Liên hệ

Nếu gặp vấn đề, hãy:
1. Kiểm tra lại từng bước
2. Xem phần "Xử lý lỗi"
3. Kiểm tra console/terminal xem lỗi cụ thể
