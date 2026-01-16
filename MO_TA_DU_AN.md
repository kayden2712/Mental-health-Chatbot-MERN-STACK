# MÔ TẢ DỰ ÁN - MENTAL HEALTH CHATBOT

## 📱 TỔNG QUAN DỰ ÁN

**Tên dự án:** WellBot - Mental Health Chatbot Mobile App

**Mục đích:** Ứng dụng di động hỗ trợ sức khỏe tâm thần, giúp người dùng có thể trò chuyện với AI chatbot để nhận được lời khuyên, động viên về sức khỏe tinh thần, đồng thời có thể đặt lịch hẹn với chuyên gia trị liệu.

**Đối tượng sử dụng:** 
- Sinh viên, học sinh cần hỗ trợ tâm lý
- Người làm việc có áp lực công việc
- Bất kỳ ai cần được lắng nghe và hỗ trợ về mặt tinh thần

---

## 🎯 NHIỆM VỤ CHÍNH CỦA HỆ THỐNG

### 1. **Hỗ trợ Tâm lý qua AI Chatbot**
- **Nhiệm vụ:** Cung cấp một chatbot thông minh có khả năng trò chuyện empathetic (đồng cảm) với người dùng
- **Công nghệ:** Google Gemini AI
- **Chức năng:**
  - Lắng nghe tâm tư, tình cảm của người dùng
  - Đưa ra lời khuyên, động viên phù hợp
  - Nhận diện và phản hồi các vấn đề về sức khỏe tâm thần
  - Chỉ tập trung vào chủ đề sức khỏe tinh thần, từ chối các câu hỏi không liên quan

### 2. **Quản lý Người dùng**
- **Nhiệm vụ:** Đảm bảo mỗi người dùng có tài khoản riêng, bảo mật thông tin cá nhân
- **Chức năng:**
  - Đăng ký tài khoản mới (username, email, password)
  - Đăng nhập bảo mật với JWT Token
  - Quản lý phiên đăng nhập
  - Lưu trữ lịch sử booking của từng user

### 3. **Hệ thống Đặt lịch Trị liệu**
- **Nhiệm vụ:** Cho phép người dùng đặt lịch hẹn với các chuyên gia tâm lý
- **Chức năng:**
  - Chọn khung giờ phù hợp
  - Nhập thông tin cá nhân (tên, số điện thoại, tuổi, địa chỉ)
  - Xem lịch sử các buổi hẹn đã đặt
  - Quản lý thông tin booking

### 4. **Động viên Hàng ngày (Daily Motivation)**
- **Nhiệm vụ:** Cung cấp những thông điệp tích cực mỗi ngày
- **Chức năng:**
  - Hiển thị random positive thoughts
  - Cải thiện tâm trạng người dùng
  - Animation mượt mà khi thay đổi câu động viên

### 5. **Giao diện Người dùng (UI/UX)**
- **Nhiệm vụ:** Tạo trải nghiệm người dùng thân thiện, dễ sử dụng
- **Đặc điểm:**
  - Thiết kế gradient đẹp mắt (tím, hồng)
  - Navigation dễ dàng với tab bar
  - Responsive trên mọi kích thước màn hình
  - Animation mượt mà

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

### **Frontend - Mobile App (React Native + Expo)**
```
Nhiệm vụ: Giao diện người dùng trên điện thoại
├── Tab Home: Hiển thị daily motivation
├── Tab Chatbot: Chat với AI
├── Tab Booking: Đặt lịch trị liệu
└── Tab Profile: Thông tin & đăng xuất
```

### **Backend - API Server (Node.js + Express)**
```
Nhiệm vụ: Xử lý logic nghiệp vụ, kết nối database và AI
├── Authentication: Xác thực người dùng (JWT)
├── Chat Endpoint: Gọi Google Gemini AI
├── Booking Endpoint: Quản lý lịch hẹn
└── User Endpoint: Quản lý thông tin người dùng
```

### **Database (MySQL)**
```
Nhiệm vụ: Lưu trữ dữ liệu
├── Table users: Thông tin người dùng
└── Table bookings: Thông tin lịch hẹn
```

### **AI Engine (Google Gemini)**
```
Nhiệm vụ: Tạo phản hồi thông minh
└── Gemini 2.5 Flash: Model AI cho chatbot
```

---

## 📊 WORKFLOW HỆ THỐNG

### **Workflow 1: Người dùng mới sử dụng app**
1. Tải Expo Go app trên điện thoại
2. Scan QR code từ terminal
3. Đăng ký tài khoản (username, email, password)
4. Hệ thống tạo JWT token
5. Người dùng được chuyển đến trang Home

### **Workflow 2: Chat với AI**
1. User nhập tin nhắn
2. Frontend gửi request đến `/chat` endpoint
3. Backend nhận request, gọi Google Gemini AI
4. Gemini xử lý và trả về response
5. Backend gửi response về Frontend
6. Hiển thị câu trả lời của bot cho user

### **Workflow 3: Đặt lịch trị liệu**
1. User chọn tab Booking
2. Nhập thông tin (tên, SĐT, tuổi, địa chỉ, khung giờ, ngày)
3. Frontend gửi request đến `/booking` endpoint
4. Backend xác thực JWT token
5. Lưu thông tin vào database
6. Trả về confirmation cho user
7. User có thể xem lịch đã đặt trong tab Profile

### **Workflow 4: Daily Motivation**
1. App tự động gọi `/goodthoughts` khi mở
2. Backend random chọn 1 câu từ danh sách
3. Trả về Frontend
4. Hiển thị với animation fade in/out

---

## 🔐 BẢO MẬT

### **JWT Authentication**
- **Nhiệm vụ:** Bảo vệ các endpoint cần xác thực
- **Cách hoạt động:**
  1. User đăng nhập thành công → Server tạo JWT token
  2. Token được lưu trong app (localStorage)
  3. Mỗi request cần auth → Gửi token trong header
  4. Server verify token → Cho phép/Từ chối request

### **Password Storage**
- Hiện tại: Plain text (CẦN CẢI THIỆN)
- Nên dùng: bcrypt để hash password

### **CORS Policy**
- Backend cho phép all origins (`*`) trong development
- Production nên giới hạn specific origins

---

## 🌐 NETWORK CONFIGURATION

### **Mobile kết nối Backend như thế nào?**

1. **Điều kiện:**
   - Mobile và PC phải cùng WiFi
   - Firewall phải allow port 4000
   - Backend phải running

2. **Cấu hình:**
   - Backend bind: `0.0.0.0:4000` (lắng nghe tất cả network interfaces)
   - Mobile connect: `http://YOUR_WIFI_IP:4000`
   - VD: `http://10.210.106.133:4000`

3. **Auto-configuration:**
   - File `start.bat` tự động detect WiFi IP
   - Tự động update file `mobile/constants/api.ts`
   - Trim spaces để tránh lỗi

---

## 📱 CÁC SCREEN TRONG APP

### **1. Home Screen**
- **Nhiệm vụ:** Welcome page, hiển thị động viên
- **Thành phần:**
  - App logo và title
  - Daily motivation card
  - Thông báo login/logout status
  - Features overview

### **2. Chatbot Screen**
- **Nhiệm vụ:** Giao diện chat với AI
- **Thành phần:**
  - Message list (user + bot)
  - Input textbox
  - Send button
  - Loading indicator
  - Auto scroll to bottom

### **3. Booking Screen**
- **Nhiệm vụ:** Form đặt lịch
- **Thành phần:**
  - Input: Name, Phone, Age, Address
  - Date picker
  - Time slot selector
  - Submit button
  - Booking history list

### **4. Profile Screen**
- **Nhiệm vụ:** Thông tin user và authentication
- **Thành phần:**
  - User info display
  - Login/Signup form (nếu chưa login)
  - Logout button
  - Settings (future)

---

## 🛠️ CÔNG CỤ VÀ SCRIPT

### **start.bat**
- **Nhiệm vụ:** One-click launcher cho toàn bộ hệ thống
- **Chức năng:**
  1. Tìm WiFi IP tự động
  2. Kill processes cũ trên port 4000
  3. Update API config trong mobile app
  4. Start Backend server
  5. Start Mobile Expo dev server

### **start-mobile.bat**
- **Nhiệm vụ:** Giống start.bat, alternative launcher

### **test-connection.bat**
- **Nhiệm vụ:** Kiểm tra network connectivity
- **Chức năng:**
  1. Check WiFi IP
  2. Check backend port status
  3. Check firewall rule
  4. Test actual connection với backend
  5. Hiển thị diagnostic report

### **enable-mobile-access.bat**
- **Nhiệm vụ:** Tạo Windows Firewall rule
- **Chức năng:**
  - Cho phép incoming connections trên port 4000
  - Cần run as Administrator

### **Backend/setup-database.js**
- **Nhiệm vụ:** Auto setup MySQL database
- **Chức năng:**
  - Tạo database `healthbot`
  - Tạo tables `users` và `bookings`
  - Insert sample data (optional)

---

## 🔧 CÁC VẤN ĐỀ THƯỜNG GẶP VÀ CÁCH XỬ LÝ

### **1. Network Request Failed**
- **Nguyên nhân:**
  - Firewall chặn port 4000
  - IP address có space thừa
  - Backend không chạy
  - Mobile và PC khác WiFi

- **Giải pháp:**
  1. Run `enable-mobile-access.bat` as Admin
  2. Check API config không có trailing space
  3. Verify backend running: `netstat -ano | findstr :4000`
  4. Confirm same WiFi network

### **2. Backend không start**
- **Nguyên nhân:**
  - MySQL không chạy
  - Port 4000 bị chiếm
  - Missing .env file

- **Giải pháp:**
  1. Start MySQL/XAMPP
  2. Kill process trên port 4000
  3. Tạo file `.env` với API_KEY

### **3. Mobile không kết nối**
- **Giải pháp:**
  1. Chạy `test-connection.bat`
  2. Xem diagnostic report
  3. Fix theo hướng dẫn

---

## 📈 FUTURE ENHANCEMENTS (Nâng cấp tương lai)

### **Tính năng mới:**
1. 🔔 Push notifications cho reminder booking
2. 📊 Mood tracking - Theo dõi tâm trạng theo thời gian
3. 🎯 Personalized recommendations dựa trên lịch sử chat
4. 💬 Group therapy chat rooms
5. 🌙 Dark mode
6. 📱 Offline chatbot với local AI
7. 🔊 Voice chat với AI
8. 📸 Share thoughts qua hình ảnh
9. 🏆 Achievement system để motivate người dùng

### **Cải thiện bảo mật:**
1. Bcrypt cho password hashing
2. Rate limiting cho API
3. Input validation và sanitization
4. HTTPS trong production
5. OAuth integration (Google, Facebook login)

### **Cải thiện performance:**
1. Caching responses
2. Database indexing
3. Message pagination
4. Image optimization
5. Code splitting

---

## 💻 YÊU CẦU KỸ THUẬT

### **Development Environment:**
- Node.js 16+
- MySQL 8.0+
- Expo Go app
- Windows OS (scripts được tối ưu cho Windows)

### **Skills Required:**
- JavaScript/TypeScript
- React Native
- Node.js/Express
- MySQL
- REST API design
- JWT Authentication
- Mobile UI/UX design

---

## 📚 TÀI LIỆU THAM KHẢO

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [Google Gemini API](https://ai.google.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)

---

## 👥 TEAM & CONTRIBUTION

- **Original Author:** Byas Yadav
- **Email:** byasyadav371@example.com
- **Current Version:** Mobile-only (Web frontend removed)

---

## 📄 LICENSE

MIT License - Free to use and modify

---

**Tóm lại:** Đây là một ứng dụng mobile toàn diện cho sức khỏe tâm thần, sử dụng AI để hỗ trợ người dùng, với hệ thống đặt lịch tích hợp và giao diện thân thiện. Mục tiêu là làm cho việc tìm kiếm hỗ trợ tâm lý trở nên dễ dàng và tiếp cận hơn cho mọi người.
