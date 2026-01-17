# 🚀 Quick Start: Deploy & Build Checklist

## 📋 Tổng Quan
Dự án này hướng dẫn deploy **Backend lên Railway** và build **Frontend thành APK** với Expo.

---

## 🎯 BƯỚC 1: Deploy Backend Lên Railway

### 1.1 Chuẩn Bị Railway
```bash
# Đăng ký tài khoản tại: https://railway.app/
# Login với GitHub
```

### 1.2 Deploy Backend

**Option A: Deploy từ GitHub** (Khuyến nghị)
```bash
# Push code lên GitHub
cd Backend
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main

# Trên Railway Dashboard:
# 1. New Project → Deploy from GitHub repo
# 2. Chọn repo → Chọn thư mục Backend
# 3. Railway tự động deploy
```

**Option B: Deploy với Railway CLI**
```bash
npm install -g @railway/cli
cd Backend
railway login
railway init
railway up
```

### 1.3 Setup MySQL Database
```
1. Railway Dashboard → + New → Database → MySQL
2. Database tự động tạo và connect
3. Import database: railway connect mysql
   Sau đó: SOURCE database.sql;
```

### 1.4 Configure Environment Variables
```
Trong Railway Dashboard → Backend Service → Variables:

MYSQL_URL=${MYSQL.MYSQL_URL}
PORT=4000
JWT_SECRET=your-secret-key-change-this
GEMINI_API_KEY=your-gemini-api-key
```

### 1.5 Lấy Production URL
```
Railway Dashboard → Settings → Domains
Copy URL: https://your-app.up.railway.app
```

---

## 📱 BƯỚC 2: Build APK với Expo

### 2.1 Cập Nhật API URL
```typescript
// mobile/constants/api.ts
const RAILWAY_PRODUCTION_URL = 'https://your-railway-app.up.railway.app';
```

### 2.2 Install EAS CLI
```bash
npm install -g eas-cli
```

### 2.3 Login Expo
```bash
cd mobile
eas login
```

### 2.4 Configure EAS
```bash
eas build:configure
```

### 2.5 Build APK
```bash
# Preview build (testing)
eas build --platform android --profile preview

# Production build
eas build --platform android --profile production
```

### 2.6 Download & Install
```
1. EAS sẽ cho link download APK
2. Hoặc vào: https://expo.dev/accounts/[username]/projects/wellbot-mental-health/builds
3. Download APK
4. Install trên Android device
```

---

## ✅ Checklist Hoàn Thành

### Backend (Railway)
- [ ] Đã đăng ký Railway account
- [ ] Backend deployed thành công
- [ ] MySQL database đã tạo và import schema
- [ ] Environment variables đã set đầy đủ
- [ ] Test API endpoints hoạt động (Postman/Browser)
- [ ] Đã lấy Production URL

### Frontend (Expo APK)
- [ ] Đã cập nhật RAILWAY_PRODUCTION_URL trong api.ts
- [ ] Đã login Expo account
- [ ] EAS build thành công
- [ ] Download APK về máy
- [ ] Install APK trên thiết bị Android
- [ ] Test app kết nối được backend
- [ ] Test đầy đủ features: login, chat, booking

---

## 🔗 Liên Kết Quan Trọng

- **Railway Dashboard**: https://railway.app/dashboard
- **Expo Dashboard**: https://expo.dev/
- **Gemini API Key**: https://makersuite.google.com/app/apikey
- **Railway Docs**: https://docs.railway.app/
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/

---

## 📚 Tài Liệu Chi Tiết

Xem hướng dẫn chi tiết tại:
- **Backend**: [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)
- **Frontend**: [EXPO_BUILD_GUIDE.md](./EXPO_BUILD_GUIDE.md)

---

## 🆘 Troubleshooting

### Backend không kết nối database?
```bash
railway logs          # Xem logs
railway variables     # Kiểm tra biến môi trường
```

### Build APK failed?
```bash
cd mobile
npm install           # Cài lại dependencies
eas build:list        # Xem lịch sử build
```

### App crashes khi mở?
```bash
adb logcat           # Xem logs Android
# Kiểm tra RAILWAY_URL đã đúng chưa
```

---

**Chúc mừng! Bạn đã deploy thành công! 🎉**
