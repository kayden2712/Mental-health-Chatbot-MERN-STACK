# Mobile App Setup Instructions

## Quick Start Guide

### Prerequisites
- Node.js installed
- Expo CLI (`npm install -g expo-cli`)
- Backend server running on port 4000
- Your computer's IP address

### Step 1: Install Dependencies
```bash
cd mobile
npm install
```

This will install the new dependency: `@react-native-async-storage/async-storage`

### Step 2: Configure API URL
1. Open `mobile/constants/api.ts`
2. Find your computer's IP address:
   - **Windows**: Open PowerShell and run `ipconfig`, look for "IPv4 Address"
   - **Mac/Linux**: Open Terminal and run `ifconfig` or `ip addr`
3. Update the IP address:
   ```typescript
   const YOUR_COMPUTER_IP = '192.168.1.XXX'; // Replace with your IP
   ```

### Step 3: Start Backend Server
```bash
cd Backend
npm start
```

Make sure you see:
```
✓ Server running on port 4000
✓ Database connected successfully
```

### Step 4: Start Mobile App
```bash
cd mobile
npm start
```

### Step 5: Run on Device/Emulator
- Press `a` for Android emulator
- Press `i` for iOS simulator  
- Scan QR code with Expo Go app on your phone

## Testing Features

### 1. Test Login/Signup
1. Open the app
2. Go to **Profile** tab
3. Sign up with new account
4. Try logging out and logging in

### 2. Test Chatbot
1. Go to **WellBot** tab
2. Send a message
3. Wait for AI response

### 3. Test Booking
1. Make sure you're logged in
2. Go to **Booking** tab
3. Fill in all fields:
   - Name: Your name
   - Phone: 10 digits (e.g., 0123456789)
   - Age: Your age
   - Address: Your address
   - Timeslot: e.g., "10:00 AM - 11:00 AM"
   - Date: e.g., "2026-01-15"
4. Click "Book Appointment"
5. Switch to "My Bookings" to see your bookings

### 4. Test Good Thoughts
1. Go to **Motivation** tab
2. See the motivational quote
3. Click "Get New Thought" button
4. See a new random quote

## Troubleshooting

### "Network request failed"
- ✅ Check Backend is running
- ✅ Check IP address in `api.ts` is correct
- ✅ Make sure phone and computer are on same WiFi network
- ✅ Try restarting the Metro bundler (`r` in terminal)

### "Please login first"
- ✅ Go to Profile tab
- ✅ Sign up or login
- ✅ Try the feature again

### "Invalid phone"
- ✅ Phone must be exactly 10 digits
- ✅ No spaces or special characters

### App not loading
- ✅ Clear Metro bundler cache: `npm start -- --reset-cache`
- ✅ Delete `node_modules` and run `npm install` again
- ✅ Make sure all dependencies installed correctly

## File Structure
```
mobile/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx         # Home screen
│   │   ├── chatbot.tsx       # Chatbot screen
│   │   ├── booking.tsx       # Booking screen
│   │   ├── motivation.tsx    # Good Thoughts screen
│   │   └── profile.tsx       # Profile/Auth screen
│   └── _layout.tsx           # Root layout with AuthProvider
├── components/
│   ├── Auth/
│   │   └── AuthScreen.tsx    # Login/Signup component
│   ├── Booking/
│   │   └── BookingScreen.tsx # Booking component
│   ├── Chatbot/
│   │   └── Chatbot.tsx       # Chatbot component
│   └── GoodThoughts/
│       └── GoodThoughtsScreen.tsx # Motivation component
├── contexts/
│   └── AuthContext.tsx       # Authentication context
└── constants/
    └── api.ts                # API configuration
```

## Features Overview

### 🏠 Home Tab
- Welcome screen
- Quick access to all features
- Mental health tips

### 💬 WellBot Tab
- AI-powered mental health chatbot
- 24/7 support
- Empathetic responses

### 📅 Booking Tab
- Create new appointments
- View your bookings
- Requires login

### ⭐ Motivation Tab
- Daily motivational quotes
- Mental health tips
- Refresh for new quotes

### 👤 Profile Tab
- Login/Signup
- App information
- Logout option

## Important Notes

1. **Backend must be running** on port 4000
2. **Same network**: Phone and computer must be on same WiFi
3. **Correct IP**: Update IP address in `api.ts`
4. **Database**: MySQL database must be set up properly

## Next Steps

After successful setup:
1. ✅ Create an account
2. ✅ Try chatting with the bot
3. ✅ Make a test booking
4. ✅ Get some motivation!

Enjoy using WellBot Mobile! 🎉
