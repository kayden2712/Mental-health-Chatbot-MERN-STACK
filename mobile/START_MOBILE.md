# Khởi động Mobile App

## Bước 1: Cài đặt dependencies (đã hoàn thành ✅)
```bash
cd mobile
npm install
```

## Bước 2: Cấu hình IP address
1. Tìm IP máy tính:
   - Windows: `ipconfig` → tìm "IPv4 Address"
   - Thường là: 192.168.1.xxx hoặc 192.168.0.xxx

2. Mở file: `mobile/constants/api.ts`
3. Sửa dòng:
   ```typescript
   const YOUR_COMPUTER_IP = '192.168.1.5'; // ⬅️ Thay bằng IP của bạn
   ```

## Bước 3: Khởi động Backend
```bash
cd Backend
npm start
```

Đảm bảo thấy:
```
✓ Server running on port 4000
✓ Database connected successfully
```

## Bước 4: Khởi động Mobile
```bash
cd mobile
npm start
```

## Bước 5: Chạy app
Sau khi Metro bundler khởi động:
- Nhấn `a` - Android emulator
- Nhấn `i` - iOS simulator
- Quét QR code - Expo Go trên điện thoại thật

## Troubleshooting

### Lỗi TypeScript (tạm thời)
Nếu thấy lỗi routing trong editor:
1. Reload VS Code window: `Ctrl+Shift+P` → "Reload Window"
2. Hoặc chỉ cần chạy app, lỗi sẽ tự hết

### Lỗi "Network request failed"
- ✅ Backend đang chạy?
- ✅ IP đúng trong `api.ts`?
- ✅ Cùng mạng WiFi?

### Reset cache nếu cần
```bash
cd mobile
npm start -- --reset-cache
```

## Test checklist
- [ ] Mở app thành công
- [ ] Vào tab Home - thấy giao diện
- [ ] Vào tab Profile - đăng ký tài khoản
- [ ] Vào tab WellBot - chat thử
- [ ] Vào tab Booking - tạo lịch hẹn
- [ ] Vào tab Motivation - xem quote

Xong! 🎉
