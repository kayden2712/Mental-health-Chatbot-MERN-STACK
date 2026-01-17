# 📱 Hướng Dẫn Build APK với Expo

## Điều Kiện Tiên Quyết

1. ✅ Backend đã deploy lên Railway
2. ✅ Đã cập nhật `RAILWAY_PRODUCTION_URL` trong `mobile/constants/api.ts`
3. ✅ Có tài khoản Expo (https://expo.dev/)
4. ✅ Đã cài đặt Node.js và npm

## Phương Pháp 1: Build với EAS Build (Khuyến nghị)

### Bước 1: Cài Đặt EAS CLI

```bash
npm install -g eas-cli
```

### Bước 2: Đăng Nhập Expo

```bash
cd mobile
eas login
```

Nhập email và password của tài khoản Expo.

### Bước 3: Configure Project

```bash
eas build:configure
```

Lệnh này sẽ:
- Tạo hoặc cập nhật `eas.json`
- Liên kết project với tài khoản Expo của bạn

### Bước 4: Cập Nhật Production URL

Trước khi build, đảm bảo đã cập nhật Railway URL:

```typescript
// mobile/constants/api.ts
const RAILWAY_PRODUCTION_URL = 'https://your-railway-app.up.railway.app';
```

### Bước 5: Build APK

#### A. Build APK Preview (Nhanh hơn, cho testing)
```bash
eas build --platform android --profile preview
```

#### B. Build APK Production (Chính thức)
```bash
eas build --platform android --profile production
```

### Bước 6: Download APK

1. Sau khi build xong, EAS sẽ cung cấp link download
2. Hoặc vào https://expo.dev/accounts/[your-username]/projects/wellbot-mental-health/builds
3. Download file APK
4. Install trên Android device

## Phương Pháp 2: Build Local với Expo (Không cần EAS)

⚠️ **Lưu ý**: Phương pháp này đã deprecated, nhưng vẫn hoạt động.

### Bước 1: Cài Đặt Dependencies

```bash
cd mobile
npm install
```

### Bước 2: Build APK

```bash
npx expo build:android -t apk
```

### Bước 3: Chọn Options

- **Build type**: APK
- **Would you like to upload a Keystore**: Chọn "Let Expo handle it"
- Đợi build hoàn thành (15-30 phút)

### Bước 4: Download APK

```bash
# Download URL sẽ hiển thị trong terminal
# Hoặc check tại:
npx expo build:status
```

## Phương Pháp 3: Build Local Standalone (Android Studio Required)

### Yêu Cầu
- Android Studio đã cài đặt
- Android SDK
- JDK 11+

### Bước 1: Eject Project (nếu cần)

```bash
cd mobile
npx expo prebuild
```

### Bước 2: Build với Gradle

```bash
cd android
./gradlew assembleRelease
```

APK sẽ ở: `android/app/build/outputs/apk/release/app-release.apk`

## Cấu Hình Chi Tiết

### 1. App Icon và Splash Screen

Đảm bảo có các file sau trong `mobile/assets/images/`:
- `icon.png` (1024x1024)
- `splash-icon.png` (200x200)
- `android-icon-foreground.png` (adaptive icon)

### 2. App.json Configuration

```json
{
  "expo": {
    "name": "WellBot",
    "slug": "wellbot-mental-health",
    "version": "1.0.0",
    "android": {
      "package": "com.wellbot.mentalhealth",
      "versionCode": 1,
      "adaptiveIcon": {
        "backgroundColor": "#667eea",
        "foregroundImage": "./assets/images/android-icon-foreground.png"
      },
      "permissions": [
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ]
    }
  }
}
```

### 3. EAS.json Profiles

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

## Environment Variables cho Build

### Option 1: Sử dụng app.config.js (Thay vì app.json)

Đổi tên `app.json` → `app.config.js`:

```javascript
export default {
  expo: {
    name: 'WellBot',
    slug: 'wellbot-mental-health',
    // ... other config
    extra: {
      apiUrl: process.env.RAILWAY_URL || 'https://your-default-url.up.railway.app',
    }
  }
}
```

Sử dụng trong code:
```typescript
import Constants from 'expo-constants';
const apiUrl = Constants.expoConfig?.extra?.apiUrl;
```

### Option 2: Hardcode Production URL

Đơn giản hơn - đã làm trong `api.ts`:
```typescript
const RAILWAY_PRODUCTION_URL = 'https://your-railway-app.up.railway.app';
```

## Testing APK

### 1. Install trên thiết bị
```bash
adb install path/to/app.apk
```

### 2. Kiểm tra kết nối API
- Mở app
- Kiểm tra logs: `adb logcat`
- Test các chức năng:
  - Đăng ký/Đăng nhập
  - Chat với bot
  - Đặt lịch

### 3. Test Production Mode
```typescript
// Trong api.ts, tạm thời force production:
const getBaseUrl = () => {
  return RAILWAY_PRODUCTION_URL; // Bỏ qua __DEV__
};
```

## 🎯 Build Commands Tóm Tắt

```bash
# === EAS Build (Khuyến nghị) ===

# 1. Login
eas login

# 2. Configure
cd mobile
eas build:configure

# 3. Build APK
eas build --platform android --profile preview

# 4. Check build status
eas build:list

# === Legacy Expo Build ===
npx expo build:android -t apk

# === Local Build ===
npx expo prebuild
cd android && ./gradlew assembleRelease
```

## ⚠️ Common Issues

### 1. Build fails: "Missing dependencies"
```bash
cd mobile
npm install
npm audit fix
```

### 2. "Invalid keystore"
```bash
# Xóa keystore cũ và tạo mới
eas credentials
# Chọn "Remove keystore"
# Build lại
```

### 3. APK cài đặt failed
- Enable "Install from Unknown Sources" trên Android
- Hoặc sign lại APK

### 4. App crashes khi mở
- Kiểm tra RAILWAY_URL đúng chưa
- Xem logs: `adb logcat | grep -i wellbot`
- Đảm bảo backend đang chạy

## 📦 Distribution

### Google Play Store (Production)
```bash
# Build AAB (App Bundle)
eas build --platform android --profile production

# Submit lên Google Play
eas submit --platform android
```

### Internal Testing
```bash
# Share APK link từ Expo build
# Hoặc upload lên Google Drive, Firebase App Distribution
```

## 🔄 Update App

### Cập nhật version
```json
// app.json
{
  "expo": {
    "version": "1.1.0",
    "android": {
      "versionCode": 2
    }
  }
}
```

### Build version mới
```bash
eas build --platform android --profile production --auto-submit
```

## 📊 Monitoring

### Expo Analytics
- Xem crashes: https://expo.dev/
- User analytics
- Build history

### Sentry (Optional)
```bash
npm install @sentry/react-native
# Configure theo docs
```

---

## ✅ Checklist Deploy Hoàn Chỉnh

- [ ] Backend deployed lên Railway
- [ ] Database imported và chạy tốt
- [ ] Test API endpoints với Postman/Thunder Client
- [ ] Cập nhật RAILWAY_PRODUCTION_URL trong api.ts
- [ ] Test app trong dev mode với Railway URL
- [ ] Build APK với EAS
- [ ] Install và test APK trên thiết bị thật
- [ ] Kiểm tra tất cả features hoạt động
- [ ] Submit lên Google Play (nếu cần)

**Chúc mừng! App của bạn đã sẵn sàng! 🎉📱**
