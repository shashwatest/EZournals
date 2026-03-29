# EZournals - Technical Documentation

> Comprehensive technical reference for the EZournals cross-platform journaling application.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Tech Stack Deep Dive](#2-tech-stack-deep-dive)
3. [Project Architecture](#3-project-architecture)
4. [Feature-File Map](#4-feature-file-map)
5. [Data Flow & State Management](#5-data-flow--state-management)
6. [Core Feature Flows](#6-core-feature-flows)
7. [Cloud Sync System](#7-cloud-sync-system)
8. [Security Model](#8-security-model)
9. [Performance Considerations](#9-performance-considerations)
10. [Error Handling Patterns](#10-error-handling-patterns)

---

## 1. Executive Summary

### Overview

EZournals is a feature-rich, cross-platform digital journaling application built with React Native (mobile) and React (web). It enables users to capture thoughts, emotions, and experiences through text, voice, images, and audio recordings, with optional AI-powered insights and real-time cloud synchronization.

### Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
├──────────────────────────┬──────────────────────────────────────┤
│   Mobile App (React Native)   │      Web App (React + Vite)     │
│   - Expo SDK 53               │      - React 18                 │
│   - React Navigation          │      - React Router             │
│   - AsyncStorage              │      - localStorage             │
└──────────────────────────┴──────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │   Shared Backend    │
                    │   (backend/ folder) │
                    └──────────┬──────────┘
                               │
┌──────────────────────────────┴──────────────────────────────────┐
│                      Firebase Services                           │
├─────────────────┬─────────────────┬─────────────────────────────┤
│  Authentication │    Firestore    │      Cloud Storage          │
│  (Multi-provider)│   (NoSQL DB)   │   (Media files)             │
└─────────────────┴─────────────────┴─────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │   Google Gemini AI  │
                    │   (Optional)        │
                    └─────────────────────┘
```

### Key Design Decisions

1. **Local-First Architecture**: Data saves locally first for instant feedback, then syncs to cloud in background
2. **Shared Backend Code**: Common utilities in `backend/` folder used by both mobile and web
3. **Selective Sync**: Users control which data fields sync to cloud (privacy-first)
4. **Platform Abstraction**: `PlatformStorage` wrapper abstracts AsyncStorage vs localStorage
5. **Optional AI**: Gemini integration is opt-in with user-provided API key (never stored on servers)

---

## 2. Tech Stack Deep Dive

### 2.1 Frontend - Mobile

#### React Native (v0.79.5)
**What it is**: JavaScript framework for building native mobile apps using React patterns.

**Why chosen over alternatives**:
- **vs Flutter**: React Native allows code sharing with web (both use React/JS), reducing learning curve. Flutter would require learning Dart and maintaining completely separate UI code.
- **vs Native iOS/Android**: Single codebase serves both platforms. Native development would double engineering effort and require expertise in Swift/Kotlin.
- **vs Ionic/Cordova**: React Native produces truly native UI components, not web views wrapped in native containers. Better performance and native feel.

**Trade-offs**: 
- Slightly slower than pure native for complex animations
- Native module bridging can be complex
- Larger app bundle size than native

#### Expo SDK 53
**What it is**: Managed workflow platform built on top of React Native providing pre-configured native modules and build services.

**Why chosen**:
- **vs Bare React Native**: Expo provides turnkey solutions for camera, audio, location, auth—no native code configuration needed
- **EAS Build**: Cloud-based builds without local Xcode/Android Studio setup
- **OTA Updates**: Push JavaScript updates without app store review
- **Development Client**: Test on physical devices without full rebuild

**Trade-offs**:
- Larger app size (~15MB overhead)
- Some native modules not available (mitigated by development builds)
- Less control over native layer

#### React Navigation (v6)
**What it is**: Routing and navigation library for React Native.

**Why chosen**:
- **vs Expo Router**: More mature, better documentation, explicit navigation patterns. Expo Router (file-based) is newer and less battle-tested.
- **vs React Native Navigation (Wix)**: Pure JavaScript implementation, easier debugging. Wix's solution requires native code modifications.

**Trade-offs**:
- Navigation state in JS thread (slightly less performant than native navigation)

#### React Native Reanimated (v3.17)
**What it is**: Animation library that runs animations on the UI thread for smooth 60fps performance.

**Why chosen**:
- **vs Animated API**: Reanimated runs on UI thread (native), while Animated runs on JS thread (can drop frames)
- Required by `reanimated-color-picker` for smooth color picker interactions
- Gesture-driven animations possible

**Trade-offs**:
- Requires native code (development build needed, not Expo Go compatible)
- Steeper learning curve (worklets concept)

#### AsyncStorage
**What it is**: Unencrypted, asynchronous, persistent key-value storage for React Native.

**Why chosen**:
- **vs MMKV**: AsyncStorage is simpler, sufficient for JSON storage. MMKV is faster but adds native dependency complexity.
- **vs SQLite**: Key-value access pattern fits our data model. SQLite would be overkill for storing JSON blobs.
- **vs Realm**: AsyncStorage is lighter weight. Realm adds significant bundle size.

**Trade-offs**:
- Not encrypted (sensitive data should use SecureStore)
- Slower than MMKV for large datasets
- 6MB limit on Android

---

### 2.2 Frontend - Web

#### React 18
**What it is**: UI library for building component-based user interfaces.

**Why chosen**:
- **vs Next.js**: EZournals is a SPA (Single Page App), doesn't need SSR/SSG. Next.js adds unnecessary complexity.
- **vs Vue/Angular**: Team expertise in React. Shared mental model with React Native codebase.
- **vs Svelte**: React's ecosystem is larger, more battle-tested for production apps.

**Trade-offs**:
- Larger bundle than Svelte
- JSX syntax preference varies

#### Vite (v5)
**What it is**: Next-generation frontend build tool with instant hot module replacement.

**Why chosen**:
- **vs Create React App (CRA)**: Vite is 10-100x faster in development. CRA is deprecated and slow.
- **vs Webpack**: Vite uses native ES modules in development—no bundling needed. Webpack bundles everything.
- **vs Parcel**: Vite has better React support and larger community.

**Trade-offs**:
- Newer tool (less Stack Overflow answers)
- Some older plugins not compatible

#### React Router (v6)
**What it is**: Declarative routing library for React applications.

**Why chosen**:
- **vs TanStack Router**: React Router is the de facto standard, more documentation and community support.
- **vs Reach Router**: Merged into React Router v6.

**Trade-offs**:
- None significant for our use case

#### CSS-in-JS (Inline Styles)
**What it is**: Styles defined as JavaScript objects directly in components.

**Why chosen**:
- **vs Tailwind CSS**: Direct theme object access without class name mapping. Themes are dynamic objects.
- **vs CSS Modules**: Easier to share style logic with React Native (which uses style objects).
- **vs Styled Components**: Less abstraction, simpler debugging, smaller bundle.

**Trade-offs**:
- No automatic vendor prefixing
- No CSS caching (styles in JS bundle)
- Larger component files

---

### 2.3 Backend & Infrastructure

#### Firebase Suite
**What it is**: Google's Backend-as-a-Service (BaaS) platform providing authentication, database, storage, and hosting.

**Why chosen over alternatives**:
- **vs Supabase**: Firebase has better React Native SDKs and offline support. Supabase's real-time is PostgreSQL-based (more complex).
- **vs AWS Amplify**: Firebase is simpler to set up, better documentation, more generous free tier.
- **vs Custom Backend**: Zero server maintenance. Would need to build auth, database, file storage, real-time sync from scratch.

**Trade-offs**:
- Vendor lock-in
- Pricing can spike with scale
- NoSQL limitations (no JOINs)

#### Firestore (NoSQL Database)
**Why chosen**:
- **vs Realtime Database**: Firestore has better querying, structured data, and scales better. Realtime DB is a giant JSON tree.
- **vs MongoDB Atlas**: Firestore integrates natively with Firebase Auth, has offline persistence built-in.

**Collections used**:
| Collection | Purpose |
|------------|---------|
| `entries` | Journal entries (indexed by userId) |
| `userProfiles` | User profile data |
| `userPreferences` | Settings, mood tags, recycle bin |
| `userStorageQuotas` | Daily upload quota tracking |
| `deletedEntries` | Soft-deleted entries |

#### Firebase Auth
**Why chosen**:
- **vs Auth0**: Firebase Auth is free for most use cases. Auth0 charges per active user.
- **vs Clerk**: Firebase integrates seamlessly with Firestore security rules.

**Providers enabled**:
- Email/Password
- Google OAuth
- Apple Sign-In (mobile)

#### Cloud Storage
**Why chosen**:
- **vs AWS S3**: Native Firebase integration, simpler security rules tied to Firebase Auth.
- **vs Cloudinary**: No image transformation needed; raw storage is sufficient.

**Storage structure**:
```
/entries/{userId}/{timestamp}_image.jpg
/entries/{userId}/{timestamp}_audio.m4a
/profile_pictures/{userId}/profile.jpg
```

---

### 2.4 AI Integration

#### Google Gemini API
**What it is**: Google's multimodal AI model accessible via REST API.

**Why chosen**:
- **vs OpenAI GPT**: Gemini has generous free tier (60 requests/minute). GPT requires paid plan.
- **vs Claude**: Gemini API is simpler to integrate (single endpoint). Claude requires Anthropic account.
- **vs Local Models**: Cloud API requires no device resources. Local models would drain battery and require large downloads.

**Models available**:
| Model | Use Case |
|-------|----------|
| `gemini-2.5-flash` | Default, fastest responses |
| `gemini-2.0-flash` | Balanced speed/quality |
| `gemma-3-27b-it` | Open model, instruction-tuned |

**Trade-offs**:
- Requires internet connection
- API key managed by user (privacy-first, but adds friction)
- Rate limits apply

---

## 3. Project Architecture

### 3.1 Directory Structure

```
EZournals/
├── mobile-app/                    # React Native application
│   ├── App.js                     # Entry point, navigation setup
│   ├── app.config.js              # Expo configuration
│   ├── babel.config.js            # Babel with Reanimated plugin
│   ├── package.json               # Dependencies
│   ├── screens/                   # 17 screen components
│   │   ├── HomeScreen.js          # Main dashboard
│   │   ├── AddEntryScreen.js      # Entry creation
│   │   ├── EditEntryScreen.js     # Entry editing
│   │   ├── ViewEntryScreen.js     # Entry display
│   │   ├── SettingsScreen.js      # Settings hub
│   │   ├── LoginScreen.js         # Authentication
│   │   └── ...                    # Other screens
│   ├── components/                # 21 reusable components
│   │   ├── EntryCard.js           # Entry list item
│   │   ├── RichTextEditor.js      # Text editing
│   │   ├── ColorPicker.js         # Color selection
│   │   ├── AudioRecorder.js       # Voice recording
│   │   └── ...                    # Other components
│   ├── contexts/                  # React Context providers
│   │   ├── ThemeContext.js        # Theme management
│   │   ├── UISettingsContext.js   # UI preferences
│   │   └── ProfilePicContext.js   # Profile picture
│   └── assets/                    # Images, fonts
│
├── web-app/                       # React web application
│   ├── index.html                 # HTML entry point
│   ├── vite.config.js             # Vite configuration
│   ├── package.json               # Dependencies
│   └── src/
│       ├── App.jsx                # Entry point, routing
│       ├── main.jsx               # React DOM render
│       ├── index.css              # Global styles
│       ├── firebase.js            # Firebase initialization
│       ├── pages/                 # 17 page components
│       │   ├── HomePage.jsx       # Main dashboard
│       │   ├── AddEntryPage.jsx   # Entry creation
│       │   ├── SettingsPage.jsx   # Settings hub
│       │   └── ...                # Other pages
│       ├── components/            # Shared components
│       │   ├── QuotaUsage.jsx     # Storage quota display
│       │   ├── ConfirmDialog.jsx  # Confirmation modal
│       │   └── ...
│       ├── contexts/              # React Context providers
│       │   ├── AuthContext.jsx    # Authentication state
│       │   ├── ThemeContext.jsx   # Theme management
│       │   └── UISettingsContext.jsx
│       └── layouts/
│           └── DashboardLayout.jsx # Authenticated layout
│
├── backend/                       # Shared utilities
│   ├── firebase/
│   │   ├── config.js              # Firebase initialization
│   │   └── cloudStorage.js        # Cloud sync functions
│   └── utils/
│       ├── storage.js             # Entry CRUD operations
│       ├── platformStorage.js     # Cross-platform storage
│       ├── moodTags.js            # Mood tag management
│       ├── mediaUpload.js         # Media handling + quota
│       ├── geminiService.js       # AI integration
│       ├── aiSettings.js          # AI configuration
│       ├── insightsCalculator.js  # Analytics calculations
│       └── drafts.js              # Draft auto-save
│
├── firestore.rules                # Firestore security rules
├── storage.rules                  # Storage security rules
├── firebase.json                  # Firebase project config
├── package.json                   # Root workspace scripts
└── README.md                      # Project documentation
```

### 3.2 Separation of Concerns

#### Presentation Layer (Screens/Pages)
- UI rendering and user interaction
- Local state for form inputs
- Navigation between views
- Call context methods for data operations

#### State Layer (Contexts)
- Global application state
- Theme preferences
- UI settings
- Authentication state
- Coordinate between local storage and cloud

#### Data Layer (Backend Utils)
- CRUD operations on entries
- Cloud synchronization logic
- Media upload handling
- AI service integration

#### Infrastructure Layer (Firebase)
- Authentication
- Database (Firestore)
- File storage
- Security rules

### 3.3 Shared Code Strategy

The `backend/` folder contains platform-agnostic code used by both mobile and web:

```javascript
// backend/utils/platformStorage.js
// Abstracts storage differences

// Web implementation
const WebStorage = {
  getItem: (key) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
};

// Mobile implementation  
const MobileStorage = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
};

// Export based on platform
export const PlatformStorage = Platform.OS === 'web' ? WebStorage : MobileStorage;
```

Both apps import from `backend/`:
```javascript
// In mobile-app/screens/AddEntryScreen.js
import { saveEntry } from '../../backend/utils/storage';

// In web-app/src/pages/AddEntryPage.jsx
import { saveEntry } from '../../backend/utils/storage';
```

### 3.4 Platform-Specific vs Shared Code

| Layer | Mobile-Specific | Web-Specific | Shared |
|-------|-----------------|--------------|--------|
| **UI Components** | screens/, components/ | pages/, components/ | - |
| **Navigation** | React Navigation | React Router | - |
| **Storage** | AsyncStorage | localStorage | platformStorage.js |
| **Auth UI** | Native pickers | HTML forms | - |
| **Business Logic** | - | - | backend/utils/ |
| **Firebase** | - | - | backend/firebase/ |
| **AI Services** | - | - | geminiService.js |

---

## 4. Feature-File Map

### 4.1 Authentication

| Feature | Mobile Files | Web Files | Shared Files |
|---------|--------------|-----------|--------------|
| Email/Password Login | `LoginScreen.js` | `LoginPage.jsx` | `config.js` |
| Email/Password Signup | `SignupScreen.js` | `SignupPage.jsx` | `config.js` |
| Google OAuth | `LoginScreen.js`, `SignupScreen.js` | `LoginPage.jsx`, `SignupPage.jsx` | `config.js` |
| Apple Sign-In | `LoginScreen.js` | - | `config.js` |
| Password Reset | `ForgotPasswordScreen.js` | `ForgotPasswordPage.jsx` | `config.js` |
| Auth State | `App.js` | `AuthContext.jsx` | `config.js` |
| Logout | `AccountInfoScreen.js` | `ProfilePage.jsx` | - |

### 4.2 Entry Management

| Feature | Mobile Files | Web Files | Shared Files |
|---------|--------------|-----------|--------------|
| Create Entry | `AddEntryScreen.js` | `AddEntryPage.jsx` | `storage.js` |
| Edit Entry | `EditEntryScreen.js` | `EditEntryPage.jsx` | `storage.js` |
| View Entry | `ViewEntryScreen.js` | `ViewEntryPage.jsx` | `storage.js` |
| Delete Entry | `HomeScreen.js` | `HomePage.jsx` | `storage.js` |
| List Entries | `HomeScreen.js` | `HomePage.jsx` | `storage.js` |
| Search Entries | `HomeScreen.js` | `HomePage.jsx` | - |
| Merge Entries | `HomeScreen.js` | `HomePage.jsx` | - |
| Entry Card UI | `EntryCard.js` | `HomePage.jsx` (inline) | - |

### 4.3 Rich Content

| Feature | Mobile Files | Web Files | Shared Files |
|---------|--------------|-----------|--------------|
| Rich Text Editor | `RichTextEditor.js` | `AddEntryPage.jsx` (inline) | - |
| Rich Text Renderer | `RichTextRenderer.js` | `ViewEntryPage.jsx` (inline) | - |
| Image Upload | `AddEntryScreen.js` | `AddEntryPage.jsx` | `mediaUpload.js` |
| Audio Recording | `AudioRecorder.js` | `AddEntryPage.jsx` | `mediaUpload.js` |
| Audio Playback | `AudioPlayer.js` | `ViewEntryPage.jsx` | - |
| Voice Dictation | `AddEntryScreen.js` | `AddEntryPage.jsx` | - |
| Location Tagging | `AddEntryScreen.js` | `AddEntryPage.jsx` | - |
| Event Time | `AddEntryScreen.js`, `TimeStampPicker.js` | `AddEntryPage.jsx` | - |

### 4.4 Mood & Tags

| Feature | Mobile Files | Web Files | Shared Files |
|---------|--------------|-----------|--------------|
| Tag Input | `TagInput.js` | `AddEntryPage.jsx` | `moodTags.js` |
| Mood Tags CRUD | `SettingsScreen.js` | `SettingsPage.jsx` | `moodTags.js` |
| AI Mood Detection | `AddEntryScreen.js` | `AddEntryPage.jsx` | `geminiService.js` |
| Tag Color Picker | `ColorPicker.js` | `SettingsPage.jsx` | - |
| Filter by Mood | `NavigateScreen.js` | `NavigatePage.jsx` | - |

### 4.5 Themes & Customization

| Feature | Mobile Files | Web Files | Shared Files |
|---------|--------------|-----------|--------------|
| Theme Selection | `SettingsScreen.js` | `SettingsPage.jsx` | - |
| Theme Context | `ThemeContext.js` | `ThemeContext.jsx` | - |
| Custom Theme Create | `CustomThemeScreen.js` | `CustomThemePage.jsx` | - |
| Custom Theme Edit | `CustomThemeScreen.js` | `CustomThemePage.jsx` | - |
| Custom Theme Delete | `SettingsScreen.js` | `SettingsPage.jsx` | - |
| Color Picker | `ColorPicker.js` | Native `<input type="color">` | - |
| Built-in Themes | `ThemeContext.js` | `ThemeContext.jsx` | - |

### 4.6 UI Settings

| Feature | Mobile Files | Web Files | Shared Files |
|---------|--------------|-----------|--------------|
| UI Settings Context | `UISettingsContext.js` | `UISettingsContext.jsx` | - |
| Font Size | `UISettingsScreen.js` | `UISettingsPage.jsx` | - |
| Font Family | `UISettingsScreen.js` | `UISettingsPage.jsx` | - |
| Card Layout | `UISettingsScreen.js` | `UISettingsPage.jsx` | - |
| Card Spacing | `UISettingsScreen.js` | `UISettingsPage.jsx` | - |
| Sort Order | `UISettingsScreen.js` | `UISettingsPage.jsx` | - |
| Default Entry Mode | `UISettingsScreen.js` | `UISettingsPage.jsx` | - |

### 4.7 Cloud Sync

| Feature | Mobile Files | Web Files | Shared Files |
|---------|--------------|-----------|--------------|
| Full Sync | `SettingsScreen.js` | `SettingsPage.jsx` | `cloudStorage.js` |
| Real-time Listener | `HomeScreen.js` | `HomePage.jsx` | `cloudStorage.js` |
| Selective Sync Config | `CloudSettingsScreen.js` | `CloudSettingsPage.jsx` | `cloudStorage.js` |
| Sync Preferences | `UISettingsContext.js` | `UISettingsContext.jsx` | `cloudStorage.js` |
| Sync Indicator | `SyncIndicator.js` | - | - |
| Last Sync Time | `SettingsScreen.js` | `SettingsPage.jsx` | `cloudStorage.js` |

### 4.8 Profile

| Feature | Mobile Files | Web Files | Shared Files |
|---------|--------------|-----------|--------------|
| Profile Display | `AccountInfoScreen.js` | `ProfilePage.jsx` | `cloudStorage.js` |
| Profile Edit | `AccountInfoScreen.js` | `ProfilePage.jsx` | `cloudStorage.js` |
| Profile Picture | `AccountInfoScreen.js` | `ProfilePage.jsx` | `mediaUpload.js` |
| Profile Pic Context | `ProfilePicContext.js` | - | - |
| Username Check | `AccountInfoScreen.js` | `ProfilePage.jsx` | `cloudStorage.js` |

### 4.9 AI Features

| Feature | Mobile Files | Web Files | Shared Files |
|---------|--------------|-----------|--------------|
| AI Settings | `AISettingsScreen.js` | `AISettingsPage.jsx` | `aiSettings.js` |
| Entry Summarization | `ViewEntryScreen.js` | `ViewEntryPage.jsx` | `geminiService.js` |
| Mood Detection | `AddEntryScreen.js`, `EditEntryScreen.js` | `AddEntryPage.jsx`, `EditEntryPage.jsx` | `geminiService.js` |
| Theme Detection | `InsightsScreen.js` | `InsightsPage.jsx` | `geminiService.js` |
| Insights Generation | `InsightsScreen.js` | `InsightsPage.jsx` | `geminiService.js` |
| Connection Test | `AISettingsScreen.js` | `AISettingsPage.jsx` | `geminiService.js` |

### 4.10 Analytics

| Feature | Mobile Files | Web Files | Shared Files |
|---------|--------------|-----------|--------------|
| Overview Dashboard | `OverviewScreen.js` | `OverviewPage.jsx` | `insightsCalculator.js` |
| Insights Dashboard | `InsightsScreen.js` | `InsightsPage.jsx` | `insightsCalculator.js` |
| Mood Trends | `OverviewScreen.js` | `OverviewPage.jsx` | `insightsCalculator.js` |
| Writing Patterns | `InsightsScreen.js` | `InsightsPage.jsx` | `insightsCalculator.js` |
| Time Patterns | `InsightsScreen.js` | `InsightsPage.jsx` | `insightsCalculator.js` |
| Word Stats | `InsightsScreen.js` | `InsightsPage.jsx` | `insightsCalculator.js` |

### 4.11 Recycle Bin

| Feature | Mobile Files | Web Files | Shared Files |
|---------|--------------|-----------|--------------|
| View Deleted | `RecycleBinScreen.js` | `RecycleBinPage.jsx` | `storage.js` |
| Restore Entry | `RecycleBinScreen.js` | `RecycleBinPage.jsx` | `storage.js` |
| Permanent Delete | `RecycleBinScreen.js` | `RecycleBinPage.jsx` | `storage.js` |

### 4.12 Navigation & Discovery

| Feature | Mobile Files | Web Files | Shared Files |
|---------|--------------|-----------|--------------|
| Calendar View | `NavigateScreen.js` | `NavigatePage.jsx` | - |
| Date Filter | `NavigateScreen.js` | `NavigatePage.jsx` | - |
| Mood Filter | `NavigateScreen.js` | `NavigatePage.jsx` | - |
| Sidebar Nav | `Sidebar.js` | `DashboardLayout.jsx` | - |

### 4.13 Drafts

| Feature | Mobile Files | Web Files | Shared Files |
|---------|--------------|-----------|--------------|
| Auto-save Draft | `AddEntryScreen.js` | `AddEntryPage.jsx` | `drafts.js` |
| Draft Recovery | `AddEntryScreen.js` | `AddEntryPage.jsx` | `drafts.js` |

### 4.14 Media Quota

| Feature | Mobile Files | Web Files | Shared Files |
|---------|--------------|-----------|--------------|
| Quota Display | `QuotaUsage.js` | `QuotaUsage.jsx` | `mediaUpload.js` |
| Quota Tracking | - | - | `mediaUpload.js` |
| Quota Enforcement | - | - | `mediaUpload.js` |

---

## 5. Data Flow & State Management

### 5.1 Context Providers Architecture

Both mobile and web apps use React Context for global state management, avoiding external state libraries to keep the bundle lean.

#### Mobile Context Hierarchy

```
App.js
├── ThemeProvider          // Theme colors, custom themes
│   ├── UISettingsProvider // Font, layout, sync preferences
│   │   ├── ProfilePicProvider // Profile picture URI
│   │   │   └── NavigationContainer
│   │   │       └── Screen Components
```

#### Web Context Hierarchy

```
main.jsx
├── AuthProvider           // Firebase auth state
│   ├── ThemeProvider      // Theme colors, custom themes
│   │   ├── UISettingsProvider // Font, layout, preferences
│   │   │   └── RouterProvider
│   │   │       └── Page Components
```

### 5.2 Context Provider Details

#### ThemeContext (Mobile: `contexts/ThemeContext.js`)

**State Managed:**
```javascript
{
  currentTheme: 'glassmorphism',     // Active theme ID
  customThemes: [],                   // User-created themes
  isLoading: boolean,                 // Initial load state
}
```

**Key Functions:**
| Function | Purpose |
|----------|---------|
| `changeTheme(themeName)` | Switch active theme, persist to storage |
| `saveCustomTheme(themeData)` | Create new custom theme |
| `updateCustomTheme(id, data)` | Modify existing custom theme |
| `deleteCustomTheme(id)` | Remove custom theme, fallback to default |
| `enableThemeSync(enabled)` | Toggle real-time cloud sync for themes |

#### UISettingsContext (Mobile: `contexts/UISettingsContext.js`)

**State Managed:**
```javascript
{
  fontSize: 'medium',         // 'small' | 'medium' | 'large'
  fontFamily: 'system',       // Font family name
  cardLayout: 'standard',     // 'compact' | 'standard' | 'expanded'
  cardSpacing: 'normal',      // 'tight' | 'normal' | 'relaxed'
  sortBy: 'newest',           // 'newest' | 'oldest' | 'modified'
  defaultEntryMode: 'text',   // 'text' | 'voice'
  syncPreferences: false,     // Whether to sync UI settings to cloud
}
```

#### AuthContext (Web: `contexts/AuthContext.jsx`)

**State Managed:**
```javascript
{
  user: FirebaseUser | null,  // Current authenticated user
  loading: boolean,           // Auth state loading
}
```

### 5.3 Local Storage Strategy

#### Storage Keys Reference

| Key | Type | Description | Synced to Cloud |
|-----|------|-------------|-----------------|
| `journal_entries` | Array | All journal entries | Yes (selective) |
| `mood_tags_{uid}` | Array | User's mood tag definitions | Yes |
| `app_theme` | String | Current theme ID | Yes (if sync enabled) |
| `customThemes` | Array | Custom theme definitions | Yes (if sync enabled) |
| `uiSettings` | Object | UI preferences | Yes (if sync enabled) |
| `ai_settings` | Object | AI feature configuration | No |
| `profile_picture` | String | Local profile picture URI | Yes |
| `recycleBin` | Array | Soft-deleted entries | Yes |
| `cloud_sync_settings` | Object | Field-level sync controls | No |
| `syncPreferences` | Boolean | Master sync toggle | No |
| `last_sync_timestamp` | String | ISO timestamp of last sync | No |
| `active_local_user_id` | String | Cache ownership validation | No |
| `drafts` | Object | Unsaved entry draft | Yes |

#### Platform Abstraction Layer

The `platformStorage.js` module provides a unified API across platforms:

```javascript
// backend/utils/platformStorage.js
const PlatformStorage = {
  getItem: async (key) => {
    if (isWeb) return localStorage.getItem(key);
    return AsyncStorage.getItem(key);
  },
  
  setItem: async (key, value) => {
    if (isWeb) { localStorage.setItem(key, value); return; }
    return AsyncStorage.setItem(key, value);
  },
  
  removeItem: async (key) => {
    if (isWeb) { localStorage.removeItem(key); return; }
    return AsyncStorage.removeItem(key);
  },
};
```

### 5.4 Cloud Data Model

#### Firestore Collections Schema

**`entries` Collection:**
```javascript
{
  id: string,              // Document ID (timestamp-based)
  userId: string,          // Owner's Firebase UID
  content: string,         // Entry text (may include markdown)
  date: string,            // ISO timestamp of creation
  updatedAt: string,       // ISO timestamp of last edit
  tags: string[],          // Mood tag names
  eventTime?: string,      // Optional event timestamp
  timeRange?: { start: string, end: string },
  location?: { latitude: number, longitude: number },
  imageUrl?: string,       // Firebase Storage URL
  audioUrl?: string,       // Firebase Storage URL
  syncedToCloud: boolean,  // Sync status flag
}
```

**`userProfiles` Collection:**
```javascript
{
  userId: string,          // Document ID = Firebase UID
  displayName: string,     // User's display name
  username: string,        // Unique username (lowercase)
  bio?: string,            // Optional bio text
  profilePictureUrl?: string, // Firebase Storage URL
  updatedAt: string,       // ISO timestamp
}
```

**`userPreferences` Collection:**
```javascript
{
  userId: string,          // Document ID = Firebase UID
  currentTheme: string,    // Active theme ID
  customThemes: ThemeObject[],
  uiSettings: Object,
  moodTags: MoodTag[],     // Mood tag definitions with colors
  recycleBin: Entry[],     // Soft-deleted entries
  drafts?: Object,
  updatedAt: string,
}
```

**`userStorageQuotas` Collection:**
```javascript
{
  userId: string,          // Document ID = Firebase UID
  currentDate: string,     // YYYY-MM-DD format
  bytesUsed: number,       // Bytes uploaded today
  lastReset: string,       // ISO timestamp of last reset
}
```

### 5.5 Data Flow Patterns

#### Local-First Write Pattern

All write operations follow this pattern for responsiveness:

```
User Action
    │
    ▼
┌─────────────────┐
│  Validate Input │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Save to Local   │◄── Immediate feedback to user
│ Storage         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Queue Cloud     │◄── Non-blocking, fire-and-forget
│ Sync (async)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Update UI State │
└─────────────────┘
```

#### Real-Time Sync Pattern

```javascript
// HomeScreen.js - Real-time listener setup
useEffect(() => {
  if (!user) return;

  const q = query(
    collection(db, 'entries'),
    where('userId', '==', user.uid)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const changes = [];
    snapshot.docChanges().forEach((change) => {
      changes.push({
        type: change.type, // 'added' | 'modified' | 'removed'
        entry: { id: change.doc.id, ...change.doc.data() }
      });
    });
    applyChangesToState(changes);
  });

  return () => unsubscribe();
}, [user]);
```

---

## 6. Core Feature Flows

### 6.1 Entry Creation Flow

The entry creation flow demonstrates the local-first architecture with background cloud sync.

#### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    AddEntryScreen Component                      │
├─────────────────────────────────────────────────────────────────┤
│ State: content, selectedTags, imageUrl, audioUrl, location      │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                       User taps "Save"
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. Validation                                                    │
│    - Check content not empty                                     │
│    - Check content length < 50,000 chars                         │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Media Upload (if present)                                     │
│    a. Check daily quota (30MB/day)                               │
│    b. Upload image to Firebase Storage                           │
│    c. Upload audio to Firebase Storage                           │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Call saveEntry() from storage.js                              │
│    - Creates entry object with id, date, userId                  │
│    - Sets syncedToCloud: false                                   │
└────────────────────────────────┬────────────────────────────────┘
                                 │
              ┌──────────────────┴──────────────────┐
              │                                     │
              ▼                                     ▼
┌─────────────────────────┐          ┌─────────────────────────────┐
│ 4a. Save to Local       │          │ 4b. Background Cloud Sync    │
│     AsyncStorage        │          │     saveEntryToCloud()       │
└─────────────────────────┘          └─────────────────────────────┘
              │
              ▼
┌─────────────────────────┐
│ 5. Clear Draft          │
│ 6. Navigate Back        │
└─────────────────────────┘
```

#### Code Walkthrough - Entry Creation

**Step 1-2: Validation and Media Upload**
```javascript
// AddEntryScreen.js - handleSave function
const handleSave = async () => {
  if (!content.trim()) {
    await showAlert({ title: 'Empty Entry', message: 'Please write something' });
    return;
  }
  if (content.length > 50000) {
    await showAlert({ title: 'Entry Too Long', message: 'Max 50,000 characters' });
    return;
  }
  
  let uploadedImageUrl = null;
  let uploadedAudioUrl = null;

  if (imageUrl) {
    try {
      uploadedImageUrl = await uploadImage(imageUrl);
    } catch (error) {
      await showAlert({ title: 'Warning', message: 'Image upload failed' });
    }
  }

  if (audioUrl) {
    try {
      uploadedAudioUrl = await uploadAudio(audioUrl);
    } catch (error) {
      await showAlert({ title: 'Warning', message: 'Audio upload failed' });
    }
  }
```

**Step 3-4: Save Entry (Local + Cloud)**
```javascript
// backend/utils/storage.js
export const saveEntry = async (entry) => {
  const { auth } = require('../firebase/config');
  const user = auth.currentUser;
  
  const entries = await getEntries();
  const newEntry = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    tags: entry.tags || [],
    eventTime: entry.eventTime || null,
    userId: user?.uid || 'local',
    syncedToCloud: false,
    ...entry
  };
  entries.unshift(newEntry);
  
  // LOCAL SAVE - Immediate, blocking
  await PlatformStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  
  // CLOUD SYNC - Background, non-blocking
  saveEntryToCloud(newEntry).catch(err => {
    console.error('Cloud sync failed, will retry later:', err);
  });
  
  return newEntry;
};
```

**Step 4b: Cloud Sync with Selective Fields**
```javascript
// backend/firebase/cloudStorage.js
export const saveEntryToCloud = async (entry) => {
  const user = auth.currentUser;
  if (!user) return entry;

  // Filter based on user's sync settings
  const filteredEntry = await filterEntryForSync(entry);
  
  // Save to Firestore
  const entryRef = doc(db, 'entries', entry.id);
  await setDoc(entryRef, filteredEntry, { merge: true });
  
  return { ...entry, syncedToCloud: true };
};

// Only sync fields user has enabled
const filterEntryForSync = async (entry) => {
  const syncSettings = await getSyncSettings();
  const filteredEntry = {
    id: entry.id,
    userId: entry.userId,
    updatedAt: entry.updatedAt,
    syncedToCloud: true,
  };

  if (syncSettings.content) filteredEntry.content = entry.content;
  if (syncSettings.date) filteredEntry.date = entry.date;
  if (syncSettings.tags) filteredEntry.tags = entry.tags;
  if (syncSettings.location) filteredEntry.location = entry.location;
  if (syncSettings.eventTime) filteredEntry.eventTime = entry.eventTime;
  if (syncSettings.media) {
    if (entry.imageUrl) filteredEntry.imageUrl = entry.imageUrl;
    if (entry.audioUrl) filteredEntry.audioUrl = entry.audioUrl;
  }

  return filteredEntry;
};
```

### 6.2 AI Summary Generation Flow

The AI summary feature uses Google's Gemini API with user-provided API keys.

```
┌─────────────────────────────────────────────────────────────────┐
│  User taps "Summarize" in ViewEntryScreen/Page                   │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. Check AI Enabled                                              │
│    isAIEnabled() → reads from ai_settings storage                │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Get API Configuration                                         │
│    - getGeminiAPIKey() → stored locally only                     │
│    - getGeminiModel() → 'gemini-2.5-flash' (default)             │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Build Prompt                                                  │
│    "You are a helpful assistant that summarizes journal entries."│
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. Call Gemini API                                               │
│    POST generativelanguage.googleapis.com/v1beta/models          │
│    Body: { contents, generationConfig, safetySettings }          │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Extract & Display Response                                    │
└─────────────────────────────────────────────────────────────────┘
```

#### AI Summary Code Implementation

```javascript
// backend/utils/geminiService.js
export const summarizeEntry = async (content) => {
  const prompt = `You are a helpful assistant that summarizes journal entries. 

Please provide a brief, concise summary (2-3 sentences) of the following journal entry. 
Focus on the main themes, emotions, and key events mentioned.

Journal Entry:
${content}

Summary:`;

  const summary = await callGemini(prompt, {
    temperature: 0.5,      // Lower = more focused
    maxOutputTokens: 200,  // Keep summaries brief
  });
  
  return summary.trim();
};

// Core Gemini API caller
export const callGemini = async (prompt, options = {}) => {
  const enabled = await isAIEnabled();
  if (!enabled) throw new Error('AI features are disabled');

  const apiKey = await getGeminiAPIKey();
  const model = await getGeminiModel();

  const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxOutputTokens || 1024,
        topP: 0.95,
        topK: 40,
      },
      // Disable safety filters for personal journaling
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
      ]
    })
  });

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
};
```

### 6.3 Custom Theme Creation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Settings → "Create Custom Theme"                                │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. Initialize State                                              │
│    - Load default colors from classyBWTheme template             │
│    - Or load existing theme if editing                           │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. User Interaction Loop                                         │
│    For each color field:                                         │
│    a. Tap color swatch → Open ColorPickerModal                   │
│    b. Select color from spectrum                                 │
│    c. Preview updates in real-time                               │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                       User taps "Save"
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Save Theme                                                    │
│    a. Generate unique ID: `custom-${Date.now()}`                 │
│    b. Save to customThemes array in storage                      │
│    c. Set as current theme                                       │
│    d. Sync to cloud if enabled                                   │
└─────────────────────────────────────────────────────────────────┘
```

#### Theme Save Code

```javascript
// ThemeContext.js (Mobile)
const saveCustomTheme = async (themeData) => {
  try {
    const themeId = `custom-${Date.now()}`;
    const newTheme = { ...themeData, id: themeId };
    const updatedThemes = [...customThemes, newTheme];
    
    await PlatformStorage.setItem('customThemes', JSON.stringify(updatedThemes));
    await saveTheme(themeId);
    
    setCustomThemes(updatedThemes);
    setCurrentTheme(themeId);
    
    if (syncPreferencesRef.current) {
      savePreferencesToCloud({ 
        currentTheme: themeId, 
        customThemes: updatedThemes 
      });
    }
  } catch (error) {
    console.error('Error saving custom theme:', error);
  }
};
```

### 6.4 Voice Dictation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  User taps "Dictate" button in AddEntryScreen                    │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. Start Speech Recognition                                      │
│    - Mobile: expo-speech-recognition                             │
│    - Web: Web Speech API (SpeechRecognition)                     │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Continuous Listening Loop                                     │
│    - interimResults shown in UI (italicized)                     │
│    - finalResults appended to content                            │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                       User taps "Stop Dictating"
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Stop Recognition                                              │
│    - Final transcript added to entry content                     │
│    - User can continue typing or dictating                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Cloud Sync System

### 7.1 Architecture Overview

EZournals implements a sophisticated hybrid sync system that prioritizes local-first operations while maintaining cloud consistency across devices.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SYNC ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐              │
│  │  Device A   │    │  Firestore  │    │  Device B   │              │
│  │  (Mobile)   │    │   Cloud     │    │   (Web)     │              │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘              │
│         │                  │                  │                      │
│         │   saveEntry()    │                  │                      │
│         ├─────────────────►│                  │                      │
│         │                  │   onSnapshot()   │                      │
│         │                  ├─────────────────►│                      │
│         │                  │                  │                      │
│         │   fullSync()     │                  │                      │
│         ├◄────────────────►│                  │                      │
│         │                  │                  │                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.2 Sync Operations

#### 7.2.1 Real-Time Sync (Push)

The system uses Firestore's `onSnapshot` listener for real-time updates:

```javascript
// Automatically triggered when any cloud entry changes
export const subscribeToCloudChanges = (callback) => {
  const user = auth.currentUser;
  if (!user) return () => {};

  const q = query(
    collection(db, ENTRIES_COLLECTION),
    where('userId', '==', user.uid)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const changes = [];
    snapshot.docChanges().forEach((change) => {
      changes.push({
        type: change.type, // 'added' | 'modified' | 'removed'
        entry: { id: change.doc.id, ...change.doc.data() }
      });
    });

    if (changes.length > 0) {
      callback(changes);
    }
  });

  return unsubscribe;
};
```

#### 7.2.2 Manual Full Sync (Pull + Push)

Bidirectional sync triggered manually from Settings:

```javascript
export const fullSync = async () => {
  // Step 1: Upload local unsynced entries
  const uploadResult = await syncLocalToCloud();
  
  // Step 2: Download cloud entries
  const downloadResult = await syncCloudToLocal();

  return {
    success: uploadResult.success && downloadResult.success,
    uploaded: uploadResult.synced || 0,
    downloaded: downloadResult.downloaded || 0
  };
};
```

#### 7.2.3 Background Sync (On Write)

Every local write triggers a non-blocking cloud sync:

```javascript
// Fire-and-forget pattern
saveEntryToCloud(newEntry).catch(err => {
  console.error('Cloud sync failed, will retry later:', err);
});
```

### 7.3 Conflict Resolution

When the same entry exists locally and in cloud with different content, the system uses timestamp-based resolution:

```javascript
const mergeEntries = (localEntries, cloudEntries) => {
  const entriesMap = new Map();

  // Local entries as base
  localEntries.forEach(entry => entriesMap.set(entry.id, entry));

  // Cloud entries override if newer
  cloudEntries.forEach(entry => {
    const localEntry = entriesMap.get(entry.id);
    
    if (!localEntry) {
      entriesMap.set(entry.id, entry);
    } else {
      const localTime = new Date(localEntry.updatedAt || localEntry.date).getTime();
      const cloudTime = new Date(entry.updatedAt || entry.date).getTime();
      
      // CONFLICT RESOLUTION: Newer timestamp wins
      if (cloudTime >= localTime) {
        entriesMap.set(entry.id, entry);
      }
    }
  });

  return Array.from(entriesMap.values());
};
```

**Resolution Strategy:**
| Scenario | Winner | Rationale |
|----------|--------|-----------|
| Cloud newer | Cloud | Latest edit preserved |
| Local newer | Local | Local changes not overwritten |
| Same timestamp | Cloud | Cloud is source of truth |
| New local entry | Local | Upload to cloud |
| New cloud entry | Cloud | Download to local |

### 7.4 Selective Field Sync

Users can control which entry fields sync to cloud for privacy:

```javascript
// Default sync settings
const defaultSyncSettings = {
  content: true,      // Entry text
  date: true,         // Creation date
  tags: true,         // Mood tags
  location: false,    // GPS coordinates - OFF by default
  eventTime: true,    // Event timestamp
  media: false,       // Images/audio - OFF by default
  timeRange: true,    // Time range
};

// Applied before cloud upload
const filterEntryForSync = async (entry) => {
  const syncSettings = await getSyncSettings();
  const filteredEntry = { id: entry.id, userId: entry.userId };

  if (syncSettings.content) filteredEntry.content = entry.content;
  if (syncSettings.tags) filteredEntry.tags = entry.tags;
  if (syncSettings.location) filteredEntry.location = entry.location;
  // ... other fields
  
  return filteredEntry;
};
```

### 7.5 User Session Isolation

Cache validation ensures one user doesn't see another's data:

```javascript
const loadData = async () => {
  const user = auth.currentUser;
  const cachedUserId = await PlatformStorage.getItem('active_local_user_id');
  
  // Different user? Clear cache
  if (cachedUserId && cachedUserId !== user.uid) {
    await PlatformStorage.multiRemove([
      'journal_entries',
      'recycleBin',
      'user_profile',
    ]);
  }
  
  // Store current user ID
  await PlatformStorage.setItem('active_local_user_id', user.uid);
};
```

### 7.6 Sync Status Tracking

```javascript
// Track what's synced
const newEntry = {
  id: Date.now().toString(),
  syncedToCloud: false,  // Initially false
  ...entry
};

// Update after successful cloud save
return { ...entry, syncedToCloud: true };

// Track last sync time
await PlatformStorage.setItem('last_sync_timestamp', new Date().toISOString());
```

---

## 8. Security Model

### 8.1 Authentication

EZournals uses Firebase Authentication with multiple providers:

| Provider | Mobile | Web | Configuration |
|----------|--------|-----|---------------|
| Email/Password | ✅ | ✅ | Default Firebase |
| Google Sign-In | ✅ | ✅ | OAuth 2.0 |
| Apple Sign-In | ✅ | ❌ | iOS only |

**Session Management:**
- Firebase manages session tokens automatically
- Tokens refresh transparently
- `onAuthStateChanged` listener updates UI on auth state changes

### 8.2 Firestore Security Rules

All collections enforce user isolation - users can only access their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User profiles - document ID must match auth UID
    match /userProfiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Entries - userId field must match auth UID
    match /entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // User preferences - document ID must match auth UID
    match /userPreferences/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Storage quotas - document ID must match auth UID
    match /userStorageQuotas/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 8.3 Storage Security Rules

Firebase Storage rules require authentication for all operations:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

**Storage Path Convention:**
- Profile pictures: `profile_pictures/{userId}/profile.jpg`
- Entry media: `entries/{userId}/{timestamp}_image.jpg`

### 8.4 API Key Security

**Gemini API Key:**
- Stored locally only (never synced to cloud)
- User provides their own key
- Key stored in `ai_settings` localStorage key
- Never logged or transmitted to EZournals servers

```javascript
// AI settings storage - local only
const AI_SETTINGS_KEY = 'ai_settings';

export const saveGeminiAPIKey = async (apiKey) => {
  const settings = await getAISettings();
  settings.apiKey = apiKey;  // Stored locally only
  await PlatformStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(settings));
};
```

### 8.5 Data Privacy Features

| Feature | Implementation |
|---------|----------------|
| Selective Sync | Users choose which fields sync to cloud |
| Location OFF by default | GPS data requires explicit opt-in |
| Media OFF by default | Images/audio require explicit opt-in |
| Local-only AI | API keys never leave device |
| No analytics tracking | No third-party analytics SDKs |

---

## 9. Performance Considerations

### 9.1 Local-First Benefits

| Operation | With Cloud-First | With Local-First |
|-----------|------------------|------------------|
| Save entry | 500-2000ms | <50ms |
| Load entries | 500-1500ms | <100ms |
| Theme change | 200-500ms | <10ms |
| Offline support | ❌ Broken | ✅ Full functionality |

### 9.2 Caching Strategy

**Entry Cache:**
```javascript
// Hydrate from cache on app launch
const hydrateFromLocalCache = () => {
  const cachedEntries = localStorage.getItem('journal_entries');
  if (cachedEntries) {
    setEntries(JSON.parse(cachedEntries));  // Instant UI
  }
  // Then fetch fresh data in background
  loadFromCloud();
};
```

**Theme Cache:**
```javascript
// Theme loaded synchronously from localStorage
const saved = localStorage.getItem('theme');
if (saved) setCurrentTheme(saved);  // No flash of wrong theme
```

### 9.3 Lazy Loading

- **Real-time listeners**: Only active on HomeScreen
- **AI features**: Loaded on-demand, not at startup
- **Media**: Images loaded with native lazy loading
- **Insights calculations**: Computed only when InsightsScreen focused

### 9.4 Memory Management

```javascript
// Cleanup listeners on unmount
useEffect(() => {
  const unsubscribe = subscribeToCloudChanges(callback);
  return () => unsubscribe();  // Prevent memory leaks
}, []);
```

### 9.5 Bundle Optimization

| Optimization | Implementation |
|--------------|----------------|
| Tree shaking | Vite/Metro default |
| Code splitting | React lazy loading (web) |
| Asset compression | Expo asset optimization |
| No unused dependencies | Regular audit |

---

## 10. Error Handling Patterns

### 10.1 Graceful Degradation

Operations continue with reduced functionality on error:

```javascript
// Media upload failure doesn't block entry save
if (imageUrl) {
  try {
    uploadedImageUrl = await uploadImage(imageUrl);
  } catch (error) {
    console.error('Image upload failed:', error);
    await showAlert({ 
      title: 'Warning', 
      message: 'Image upload failed, but entry will be saved' 
    });
    // Entry saves without image
  }
}
```

### 10.2 Sync Failure Handling

```javascript
// Cloud sync failures are non-fatal
saveEntryToCloud(entry).catch(err => {
  console.error('Cloud sync failed, will retry later:', err);
  // Entry already saved locally - user data is safe
  // syncedToCloud flag remains false for retry
});
```

### 10.3 Permission Error Handling

```javascript
// Firestore listener gracefully handles permission errors
const unsubscribe = onSnapshot(q, 
  (snapshot) => { /* handle data */ },
  (error) => {
    if (error.code !== 'permission-denied') {
      console.error('Listener error:', error);
    }
    // Silent fail for permission errors (user signed out)
  }
);
```

### 10.4 User-Facing Error Messages

| Error Type | User Message | Recovery Action |
|------------|--------------|-----------------|
| Network error | "Sync failed, will retry" | Auto-retry on reconnect |
| Auth error | "Please sign in again" | Navigate to login |
| Quota exceeded | "Daily limit reached (30MB)" | Wait for reset |
| AI error | "AI features unavailable" | Check API key |
| Validation | "Entry too long (max 50K chars)" | Trim content |

### 10.5 Validation Patterns

```javascript
// Input validation before operations
if (!content.trim()) {
  await showAlert({ title: 'Empty Entry', message: 'Please write something' });
  return;
}

if (content.length > 50000) {
  await showAlert({ title: 'Entry Too Long', message: 'Max 50,000 characters' });
  return;
}
```

---

*End of Technical Documentation*
