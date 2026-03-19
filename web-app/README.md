# EZournals Web App

A modern, desktop-optimized web interface for EZournals built with React and Vite.

## Features

- ✅ Clean, desktop-first UI with glassmorphism theme
- ✅ Firebase Authentication (Email/Password)
- ✅ Cloud sync with Firestore
- ✅ Real-time entry management
- ✅ Search and filter entries
- ✅ Responsive design
- ✅ Fast performance with Vite

## Setup Instructions

### 1. Install Dependencies

```bash
cd web-app
npm install
```

### 2. Configure Environment Variables

The `.env` file has already been created with your Firebase credentials. If you need to update it:

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your Firebase credentials
```

See [ENV_SETUP.md](ENV_SETUP.md) for detailed instructions.

### 3. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## Project Structure

```
web-app/
├── src/
│   ├── contexts/          # React contexts (Auth, Theme)
│   ├── layouts/           # Layout components (Dashboard)
│   ├── pages/             # Page components
│   │   ├── LoginPage.jsx
│   │   ├── SignupPage.jsx
│   │   ├── HomePage.jsx
│   │   ├── AddEntryPage.jsx
│   │   └── ...
│   ├── firebase.js        # Firebase configuration
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── index.html
├── vite.config.js
└── package.json
```

## Tech Stack

- **React 18** - UI library
- **React Router 6** - Routing
- **Firebase** - Authentication, Firestore, Storage
- **Vite** - Build tool and dev server
- **Lucide React** - Icons

## Shared Backend

This web app shares the same Firebase backend with the React Native mobile app:
- Same Firestore database
- Same Authentication
- Same Storage bucket
- Entries sync automatically across devices

## Development Notes

### Why Separate Web App?

We moved from React Native Web to a dedicated React web app because:
- Better web performance
- Native web scrolling and interactions
- No platform-specific hacks needed
- Easier to maintain and debug
- Better desktop UX

### Mobile App

The React Native mobile app remains in the parent directory and continues to work perfectly for iOS and Android.

## Next Steps

1. ✅ Basic authentication and entry management
2. 🚧 Complete ViewEntryPage with full entry details
3. 🚧 Add Calendar view
4. 🚧 Add Analytics dashboard
5. 🚧 Add Profile page with image upload
6. 🚧 Add Settings page
7. 🚧 Add rich text editor
8. 🚧 Add media support (images, audio)

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Upload dist folder to Netlify
```

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## License

Same as parent project
