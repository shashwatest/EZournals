# EZournals Mobile App

React Native mobile application for iOS and Android built with Expo.

## Features

- ✅ Full journal entry creation and editing
- ✅ Rich text formatting
- ✅ Voice dictation (Speech-to-Text)
- ✅ Audio recording attachments
- ✅ Image attachments from camera/gallery
- ✅ Location tagging with GPS
- ✅ Mood tags with full-spectrum color picker
- ✅ AI-powered mood detection and insights
- ✅ 11 built-in themes + custom theme creator
- ✅ Cloud sync with Firebase
- ✅ Offline support
- ✅ Search and filter entries
- ✅ Calendar navigation
- ✅ Entry merging/grouping
- ✅ Recycle bin
- ✅ Analytics dashboard
- ✅ Profile management
- ✅ Multiple auth methods (Email, Google, Facebook, Apple)

## Setup

```bash
npm install
```

## Run (Development)

```bash
# Start Expo development server
npm start

# Run on specific platform
npm run android
npm run ios
```

## Development Build

For full functionality (native modules like Reanimated), you need a development build:

```bash
# Clean prebuild
npx expo prebuild --clean

# Build with EAS
eas build --profile development --platform android
eas build --profile development --platform ios
```

## Production Build

```bash
# Build for app stores
eas build --platform android
eas build --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

## Project Structure

```
mobile-app/
├── screens/           # App screens (Home, Settings, etc.)
├── components/        # Reusable components
├── context/           # React Context providers
├── assets/            # Images, fonts, static files
├── firebaseConfig.js  # Firebase configuration
├── babel.config.js    # Babel config (with Reanimated)
└── app.json          # Expo configuration
```

## Requirements

- Node.js 18+
- Expo CLI
- EAS CLI (for builds)
- iOS: Xcode (Mac only)
- Android: Android Studio or device with Expo Go

## Tech Stack

- React Native 0.79
- Expo SDK 53
- React 19
- Firebase (Auth, Firestore, Storage)
- React Native Reanimated
- Expo Router / React Navigation
