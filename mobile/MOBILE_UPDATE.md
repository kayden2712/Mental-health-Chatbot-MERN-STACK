# WellBot Mobile App - Cập nhật mới

## Tổng quan
Ứng dụng mobile WellBot đã được cập nhật để phù hợp với tất cả tính năng của Backend API, bao gồm:

## Tính năng mới

### 1. 🔐 Xác thực người dùng (Authentication)
- **Đăng ký tài khoản mới** (Sign Up)
- **Đăng nhập** (Login)
- **Đăng xuất** (Logout)
- **Lưu trữ token** tự động với AsyncStorage
- **Xác thực bảo mật** cho các API requests

### 2. 💬 Chatbot AI
- Chat với AI mental health bot
- Hỗ trợ sức khỏe tinh thần 24/7
- Giao diện thân thiện với hiệu ứng đẹp mắt

### 3. 📅 Đặt lịch hẹn (Booking)
- **Tạo lịch hẹn mới** với các thông tin:
  - Tên đầy đủ
  - Số điện thoại (10 chữ số)
  - Tuổi
  - Địa chỉ
  - Khung giờ
  - Ngày hẹn
- **Xem danh sách lịch hẹn** của bạn
- **Yêu cầu đăng nhập** để sử dụng

### 4. ✨ Động lực hàng ngày (Good Thoughts)
- Nhận câu động viên ngẫu nhiên
- Hiển thị với hiệu ứng fade đẹp mắt
- Các mẹo chăm sóc sức khỏe tinh thần
- Làm mới để xem câu mới

### 5. 👤 Trang cá nhân (Profile)
- Xem thông tin về WellBot
- Các tính năng của ứng dụng
- Đăng nhập/Đăng ký
- Đăng xuất

### 6. 🏠 Trang chủ (Home)
- Giới thiệu về WellBot
- Liên kết nhanh đến các tính năng
- Mẹo sức khỏe tinh thần
- Thông tin hữu ích

## Cấu trúc mới

### Components
```
mobile/
├── components/
│   ├── Auth/
│   │   └── AuthScreen.tsx          # Màn hình đăng nhập/đăng ký
│   ├── Booking/
│   │   └── BookingScreen.tsx       # Màn hình đặt lịch hẹn
│   ├── Chatbot/
│   │   └── Chatbot.tsx             # Chatbot AI
│   └── GoodThoughts/
│       └── GoodThoughtsScreen.tsx  # Màn hình động lực
├── contexts/
│   └── AuthContext.tsx             # Context quản lý xác thực
└── constants/
    └── api.ts                      # API endpoints
```

### Tabs Navigation
```
Home (🏠) -> Trang chủ
WellBot (💬) -> Chatbot AI
Booking (📅) -> Đặt lịch hẹn
Motivation (⭐) -> Động lực hàng ngày
Profile (👤) -> Trang cá nhân
```

## API Endpoints được sử dụng

```typescript
{
  chat: '/chat',              // Chat với AI
  signup: '/signup',          // Đăng ký tài khoản
  login: '/login',            // Đăng nhập
  booking: '/booking',        // Tạo lịch hẹn
  userBookings: '/user-bookings',  // Xem lịch hẹn
  goodThoughts: '/goodthoughts'    // Lấy câu động viên
}
```

## Cài đặt và sử dụng

### 1. Cài đặt dependencies mới
```bash
cd mobile
npm install
```

### 2. Cấu hình API
Mở file `mobile/constants/api.ts` và cập nhật IP address của máy tính:

```typescript
const YOUR_COMPUTER_IP = '192.168.1.5'; // ⬅️ THAY ĐỔI TẠI ĐÂY!
```

Để tìm IP:
- **Windows**: Chạy `ipconfig` trong terminal, tìm "IPv4 Address"
- **Mac/Linux**: Chạy `ifconfig` hoặc `ip addr`

### 3. Chạy Backend
```bash
cd Backend
npm start
```

### 4. Chạy Mobile App
```bash
cd mobile
npm start
```

Sau đó:
- Bấm `a` để mở Android emulator
- Bấm `i` để mở iOS simulator
- Quét QR code bằng Expo Go app trên điện thoại

## Tính năng bảo mật

- **Token-based authentication**: Sử dụng JWT tokens
- **Secure storage**: Token được lưu an toàn với AsyncStorage
- **Protected routes**: Một số tính năng yêu cầu đăng nhập
- **Validation**: Kiểm tra dữ liệu đầu vào (số điện thoại, email, v.v.)

## Giao diện

- **Gradient backgrounds**: Màu sắc đẹp mắt
- **Smooth animations**: Hiệu ứng mượt mà
- **Responsive design**: Tương thích với nhiều kích thước màn hình
- **User-friendly**: Dễ sử dụng và trực quan

## Lưu ý

1. **Backend phải chạy**: Đảm bảo Backend API đang chạy trên port 4000
2. **Cùng mạng**: Mobile và Backend phải cùng mạng WiFi
3. **IP chính xác**: Kiểm tra IP address trong file api.ts
4. **Database**: Database MySQL phải được thiết lập đúng

## Troubleshooting

### Lỗi kết nối API
- Kiểm tra Backend có đang chạy không
- Kiểm tra IP address trong `api.ts`
- Kiểm tra cùng mạng WiFi

### Lỗi đăng nhập
- Kiểm tra Backend đang chạy
- Kiểm tra database có user chưa
- Xem console logs để debug

### Lỗi booking
- Phải đăng nhập trước
- Kiểm tra số điện thoại phải 10 chữ số
- Điền đầy đủ thông tin

## Các bước test

1. **Test Authentication**:
   - Vào tab Profile
   - Đăng ký tài khoản mới
   - Đăng xuất và đăng nhập lại

2. **Test Chatbot**:
   - Vào tab WellBot
   - Gửi tin nhắn
   - Kiểm tra phản hồi từ AI

3. **Test Booking**:
   - Đăng nhập trước
   - Vào tab Booking
   - Tạo lịch hẹn mới
   - Xem lịch hẹn đã tạo

4. **Test Good Thoughts**:
   - Vào tab Motivation
   - Xem câu động viên
   - Bấm "Get New Thought"

## Dependencies mới

```json
{
  "@react-native-async-storage/async-storage": "^2.1.0"
}
```

## Kết luận

Ứng dụng mobile giờ đã có đầy đủ tính năng của Backend, bao gồm:
- ✅ Authentication (Login/Signup/Logout)
- ✅ AI Chatbot
- ✅ Booking System
- ✅ Good Thoughts/Motivation
- ✅ User Profile
- ✅ Modern UI/UX

Tất cả đã sẵn sàng để sử dụng! 🎉
