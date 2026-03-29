# EZournals - Digital Journal Application

A feature-rich, cross-platform journaling application with mobile (iOS/Android) and web interfaces. Write, organize, and reflect on your thoughts with powerful tools including AI-powered insights, voice dictation, mood tracking, and beautiful customizable themes.

![Platforms](https://img.shields.io/badge/platforms-iOS%20%7C%20Android%20%7C%20Web-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.79-61dafb)
![React](https://img.shields.io/badge/React-19-61dafb)
![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%7C%20Auth%20%7C%20Storage-orange)

---

## ✨ Features

### 📝 Core Journaling
- **Rich Text Editing** - Format your entries with styling options
- **Voice Dictation** - Speech-to-text for hands-free journaling
- **Audio Recording** - Attach voice memos to entries
- **Image Attachments** - Add photos from your device
- **Auto-Save & Draft Recovery** - Never lose your work
- **Word Count & Reading Time** - Track your writing statistics
- **Location Tagging** - Capture where memories happen
- **Event Time Tracking** - Mark specific times within entries

### 🏷️ Mood & Tagging
- **Mood Tags** - Track emotions with customizable mood tags
- **AI Mood Detection** - Automatic emotion detection from your writing
- **Custom Tag Colors** - Full-spectrum color picker for personalization
- **Tag Analytics** - Visualize mood patterns over time

### 🎨 Themes & Customization
- **11 Built-in Themes** - Glassmorphism, Matte Black/White, Ocean Teal, Sunset Orange, Forest Green, Purple Dream, Rose Gold, and more
- **Custom Theme Creator** - Design your own themes with full color control
- **Font Customization** - Adjustable size, family, and weight
- **Layout Options** - Grid/list view, card spacing preferences
- **Glass & Matte Effects** - Modern UI with blur and texture effects

### 🤖 AI-Powered Features
- **Entry Summarization** - AI-generated summaries of your entries
- **Emotion Analysis** - Detect moods and emotions in your writing
- **Theme Detection** - Identify recurring themes across entries
- **Insight Generation** - Get meaningful insights from your journal
- **Multiple AI Models** - Support for Gemini 2.5 Flash, Gemini 2.0 Flash, Gemma 3

### 📊 Analytics & Insights
- **Writing Statistics** - Total entries, words, averages
- **Mood Trends** - Track emotional patterns over time
- **Writing Frequency** - Visualize your journaling habits
- **Time-Based Analysis** - Filter by week, month, year, or custom range
- **Most Common Moods** - See your dominant emotional states

### ☁️ Cloud Sync
- **Real-time Sync** - Automatic synchronization across devices
- **Selective Sync** - Choose which data to sync (text, media, location, etc.)
- **Offline Support** - Works without internet, syncs when connected
- **Sync Status Indicators** - Always know your sync state

### 🔍 Search & Organization
- **Full-Text Search** - Find entries by content
- **Filter by Tags/Moods** - Quick mood-based filtering
- **Date Range Search** - Find entries by date
- **Calendar Navigation** - Browse entries by date
- **Entry Merging** - Combine same-day entries into grouped views
- **Recycle Bin** - Recover accidentally deleted entries

### 🔐 Authentication
- **Email/Password** - Traditional account creation
- **Google Sign-In** - Quick authentication
- **Facebook Sign-In** - Social login (mobile)
- **Apple Sign-In** - iOS users (mobile)
- **Password Recovery** - Forgot password flow

### 👤 Profile Management
- **Profile Picture** - Upload and manage your avatar
- **Personal Information** - Name, username, DOB, gender
- **Preferences Storage** - Settings sync across devices

---

## 🏗️ Project Structure

```
EZournals/
├── mobile-app/          # React Native (iOS/Android)
│   ├── screens/         # App screens
│   ├── components/      # Reusable components
│   ├── context/         # State management
│   └── assets/          # Images, fonts
├── web-app/             # React Web Application
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React contexts
│   │   └── layouts/     # Layout components
│   └── public/          # Static assets
├── backend/             # Shared utilities
│   ├── firebase/        # Firebase configuration
│   └── utils/           # Storage utilities
├── firestore.rules      # Firestore security rules
└── storage.rules        # Storage security rules
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project (for cloud features)
- Expo CLI (for mobile development)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/EZournals.git
cd EZournals

# Install all dependencies
npm run install:all

# Or install individually:
cd mobile-app && npm install
cd ../web-app && npm install
```

### Running the Apps

```bash
# Run mobile app (Expo)
npm run mobile
# or
cd mobile-app && npm start

# Run web app
npm run web
# or
cd web-app && npm run dev
```

### Building for Production

**Mobile (using EAS Build):**
```bash
cd mobile-app

# Development build (for testing)
eas build --profile development --platform android
eas build --profile development --platform ios

# Production build
eas build --platform android
eas build --platform ios
```

**Web:**
```bash
cd web-app
npm run build
# Output in dist/ folder
```

---

## ⚙️ Configuration

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password, Google, Facebook, Apple)
3. Create a Firestore database
4. Set up Cloud Storage
5. Copy your Firebase config to:
   - `mobile-app/firebaseConfig.js`
   - `web-app/.env`

### Environment Variables (Web)

Create `web-app/.env`:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Firestore Security Rules

Deploy the included security rules:
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### AI Features (Optional)

To enable AI-powered features:
1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com)
2. Add the API key in the app's Settings → AI Features section

---

## 📱 Platform-Specific Notes

### Mobile App
- Built with React Native and Expo
- Uses `react-native-reanimated` for smooth animations
- Supports iOS 13+ and Android 8+
- Development builds required for full functionality

### Web App
- Built with React 19 and Vite
- Optimized for desktop browsers
- Responsive design for various screen sizes
- Glassmorphism UI with blur effects

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Mobile** | React Native, Expo SDK 53 |
| **Web** | React 19, Vite |
| **Backend** | Firebase (Auth, Firestore, Storage) |
| **State** | React Context API |
| **Styling** | CSS-in-JS, Custom theming |
| **AI** | Google Gemini API |
| **Icons** | Lucide React, Expo Vector Icons |
| **Animations** | React Native Reanimated |
| **Voice** | Expo Speech, Audio APIs |

---

## 📖 Documentation

- [Mobile App Documentation](mobile-app/README.md)
- [Web App Documentation](web-app/README.md)
- [Backend Utilities](backend/README.md)
- [Environment Setup](web-app/ENV_SETUP.md)

---

## 🚢 Deployment

### Web App

**Vercel (Recommended):**
```bash
cd web-app
npm install -g vercel
vercel
```

**Firebase Hosting:**
```bash
firebase init hosting
npm run build
firebase deploy --only hosting
```

**Netlify:**
```bash
npm run build
# Deploy dist/ folder via Netlify dashboard
```

### Mobile App

**EAS Build (Expo Application Services):**
```bash
cd mobile-app

# Configure EAS
eas build:configure

# Build for app stores
eas build --platform all

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com) for backend infrastructure
- [Expo](https://expo.dev) for React Native tooling
- [Google Gemini](https://ai.google.dev) for AI capabilities
- [Lucide](https://lucide.dev) for beautiful icons
