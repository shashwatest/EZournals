# EZournals Monorepo Migration Script
# This script reorganizes the project into mobile-app, web-app, and backend folders

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "EZournals Monorepo Migration Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is clean
Write-Host "Checking git status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain 2>$null
if ($gitStatus) {
    Write-Host "WARNING: You have uncommitted changes!" -ForegroundColor Red
    Write-Host "It's recommended to commit or stash your changes before running this script." -ForegroundColor Red
    $continue = Read-Host "Do you want to continue anyway? (yes/no)"
    if ($continue -ne "yes") {
        Write-Host "Migration cancelled." -ForegroundColor Yellow
        exit
    }
}

Write-Host ""
Write-Host "This script will:" -ForegroundColor Green
Write-Host "  1. Create mobile-app/ folder and move React Native code" -ForegroundColor White
Write-Host "  2. Create backend/ folder and move shared utilities" -ForegroundColor White
Write-Host "  3. Update import paths in all files" -ForegroundColor White
Write-Host "  4. Create root package.json for monorepo" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Do you want to proceed? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Migration cancelled." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Starting migration..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Create directory structure
Write-Host "[1/6] Creating directory structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path "mobile-app" -Force | Out-Null
New-Item -ItemType Directory -Path "mobile-app/utils" -Force | Out-Null
New-Item -ItemType Directory -Path "backend" -Force | Out-Null
New-Item -ItemType Directory -Path "backend/firebase" -Force | Out-Null
New-Item -ItemType Directory -Path "backend/utils" -Force | Out-Null
Write-Host "  ✓ Directories created" -ForegroundColor Green

# Step 2: Move mobile-specific folders
Write-Host "[2/6] Moving mobile-specific folders..." -ForegroundColor Yellow
$mobileFolders = @("screens", "components", "contexts", "assets", "styles", ".expo")
foreach ($folder in $mobileFolders) {
    if (Test-Path $folder) {
        Move-Item -Path $folder -Destination "mobile-app/" -Force
        Write-Host "  ✓ Moved $folder/" -ForegroundColor Green
    } else {
        Write-Host "  ⊘ $folder/ not found (skipping)" -ForegroundColor Gray
    }
}

# Step 3: Move mobile-specific files
Write-Host "[3/6] Moving mobile-specific files..." -ForegroundColor Yellow
$mobileFiles = @(
    "App.js",
    "app.config.js",
    "app.json",
    "package.json",
    "package-lock.json",
    "eas.json",
    ".gitignore"
)
foreach ($file in $mobileFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "mobile-app/" -Force
        Write-Host "  ✓ Moved $file" -ForegroundColor Green
    } else {
        Write-Host "  ⊘ $file not found (skipping)" -ForegroundColor Gray
    }
}

# Step 4: Move backend files
Write-Host "[4/6] Moving backend files..." -ForegroundColor Yellow

# Move Firebase files
if (Test-Path "utils/firebase.js") {
    Move-Item -Path "utils/firebase.js" -Destination "backend/firebase/config.js" -Force
    Write-Host "  ✓ Moved utils/firebase.js → backend/firebase/config.js" -ForegroundColor Green
}

if (Test-Path "utils/cloudStorage.js") {
    Move-Item -Path "utils/cloudStorage.js" -Destination "backend/firebase/cloudStorage.js" -Force
    Write-Host "  ✓ Moved utils/cloudStorage.js → backend/firebase/" -ForegroundColor Green
}

# Move shared utils
$sharedUtils = @("storage.js", "platformStorage.js")
foreach ($util in $sharedUtils) {
    if (Test-Path "utils/$util") {
        Move-Item -Path "utils/$util" -Destination "backend/utils/" -Force
        Write-Host "  ✓ Moved utils/$util → backend/utils/" -ForegroundColor Green
    }
}

# Move remaining utils to mobile-app
if (Test-Path "utils") {
    Get-ChildItem -Path "utils" -File | ForEach-Object {
        Move-Item -Path $_.FullName -Destination "mobile-app/utils/" -Force
        Write-Host "  ✓ Moved utils/$($_.Name) → mobile-app/utils/" -ForegroundColor Green
    }
    Remove-Item -Path "utils" -Force -ErrorAction SilentlyContinue
}

# Step 5: Update import paths in mobile-app
Write-Host "[5/6] Updating import paths in mobile-app..." -ForegroundColor Yellow

$mobileJsFiles = Get-ChildItem -Path "mobile-app" -Include *.js,*.jsx -Recurse -File

foreach ($file in $mobileJsFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Update Firebase imports
    $content = $content -replace "from ['\`"]\.\.\/utils\/firebase['\`"]", "from '../../backend/firebase/config'"
    $content = $content -replace "from ['\`"]\.\.\/\.\.\/utils\/firebase['\`"]", "from '../../../backend/firebase/config'"
    $content = $content -replace "from ['\`"]\.\.\/\.\.\/\.\.\/utils\/firebase['\`"]", "from '../../../../backend/firebase/config'"
    
    # Update cloudStorage imports
    $content = $content -replace "from ['\`"]\.\.\/utils\/cloudStorage['\`"]", "from '../../backend/firebase/cloudStorage'"
    $content = $content -replace "from ['\`"]\.\.\/\.\.\/utils\/cloudStorage['\`"]", "from '../../../backend/firebase/cloudStorage'"
    $content = $content -replace "from ['\`"]\.\.\/\.\.\/\.\.\/utils\/cloudStorage['\`"]", "from '../../../../backend/firebase/cloudStorage'"
    
    # Update storage imports
    $content = $content -replace "from ['\`"]\.\.\/utils\/storage['\`"]", "from '../../backend/utils/storage'"
    $content = $content -replace "from ['\`"]\.\.\/\.\.\/utils\/storage['\`"]", "from '../../../backend/utils/storage'"
    $content = $content -replace "from ['\`"]\.\.\/\.\.\/\.\.\/utils\/storage['\`"]", "from '../../../../backend/utils/storage'"
    
    # Update platformStorage imports
    $content = $content -replace "from ['\`"]\.\.\/utils\/platformStorage['\`"]", "from '../../backend/utils/platformStorage'"
    $content = $content -replace "from ['\`"]\.\.\/\.\.\/utils\/platformStorage['\`"]", "from '../../../backend/utils/platformStorage'"
    $content = $content -replace "from ['\`"]\.\.\/\.\.\/\.\.\/utils\/platformStorage['\`"]", "from '../../../../backend/utils/platformStorage'"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  ✓ Updated imports in $($file.Name)" -ForegroundColor Green
    }
}

# Update imports in backend files
$backendJsFiles = Get-ChildItem -Path "backend" -Include *.js,*.jsx -Recurse -File

foreach ($file in $backendJsFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Update relative imports within backend
    $content = $content -replace "from ['\`"]\.\.\/firebase['\`"]", "from './config'"
    $content = $content -replace "from ['\`"]\.\.\/utils\/firebase['\`"]", "from '../firebase/config'"
    $content = $content -replace "from ['\`"]\.\.\/utils\/platformStorage['\`"]", "from '../utils/platformStorage'"
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  ✓ Updated imports in backend/$($file.Name)" -ForegroundColor Green
    }
}

# Step 6: Create root package.json
Write-Host "[6/6] Creating root package.json..." -ForegroundColor Yellow

$rootPackageJson = @"
{
  "name": "ezournals-monorepo",
  "version": "1.0.0",
  "private": true,
  "description": "EZournals - Mobile and Web Journal Application",
  "scripts": {
    "mobile": "cd mobile-app && npm start",
    "web": "cd web-app && npm run dev",
    "install:mobile": "cd mobile-app && npm install",
    "install:web": "cd web-app && npm install",
    "install:all": "npm run install:mobile && npm run install:web",
    "build:web": "cd web-app && npm run build",
    "clean": "Remove-Item -Recurse -Force mobile-app/node_modules, web-app/node_modules -ErrorAction SilentlyContinue"
  },
  "workspaces": [
    "mobile-app",
    "web-app"
  ]
}
"@

Set-Content -Path "package.json" -Value $rootPackageJson
Write-Host "  ✓ Created root package.json" -ForegroundColor Green

# Create backend README
$backendReadme = @"
# Backend - Shared Code

This folder contains shared code used by both mobile and web apps.

## Structure

\`\`\`
backend/
├── firebase/
│   ├── config.js          # Firebase initialization
│   └── cloudStorage.js    # Firestore sync utilities
└── utils/
    ├── storage.js         # Entry storage utilities
    └── platformStorage.js # Cross-platform storage wrapper
\`\`\`

## Usage

### In Mobile App
\`\`\`javascript
import { auth, db, storage } from '../../backend/firebase/config';
import { saveEntry } from '../../backend/utils/storage';
\`\`\`

### In Web App
\`\`\`javascript
// Web app has its own firebase.js, but can import from backend if needed
import { saveEntry } from '../../backend/utils/storage';
\`\`\`

## Notes

- Firebase config is initialized separately in mobile and web
- Utilities are shared to maintain consistency
- Platform-specific code stays in respective app folders
"@

Set-Content -Path "backend/README.md" -Value $backendReadme
Write-Host "  ✓ Created backend/README.md" -ForegroundColor Green

# Create updated root README
$rootReadme = @"
# EZournals - Digital Journal Application

A cross-platform journaling application with mobile (iOS/Android) and web interfaces.

## Project Structure

\`\`\`
EZournals/
├── mobile-app/          # React Native mobile app (iOS/Android)
├── web-app/             # React web app (Desktop)
├── backend/             # Shared Firebase & utilities
└── package.json         # Root workspace configuration
\`\`\`

## Quick Start

### Install All Dependencies
\`\`\`bash
npm run install:all
\`\`\`

### Run Mobile App
\`\`\`bash
npm run mobile
# or
cd mobile-app
npm start
\`\`\`

### Run Web App
\`\`\`bash
npm run web
# or
cd web-app
npm run dev
\`\`\`

## Features

- 📱 Native mobile apps (iOS/Android)
- 💻 Desktop-optimized web interface
- 🔐 Firebase Authentication
- ☁️ Cloud sync with Firestore
- 📸 Media support (images, audio)
- 🎨 Glassmorphism theme
- 🔍 Search and filter entries
- 📊 Analytics and insights

## Tech Stack

### Mobile App
- React Native
- Expo
- Firebase (Auth, Firestore, Storage)

### Web App
- React 18
- Vite
- React Router
- Firebase

### Backend
- Firebase (shared)
- Firestore
- Firebase Storage

## Documentation

- [Mobile App README](mobile-app/README.md)
- [Web App README](web-app/README.md)
- [Backend README](backend/README.md)

## Development

Each app can be developed independently:
- Mobile and web share the same Firebase backend
- Data syncs automatically across devices
- Shared utilities in \`backend/\` folder

## Deployment

### Mobile
\`\`\`bash
cd mobile-app
eas build --platform ios
eas build --platform android
\`\`\`

### Web
\`\`\`bash
cd web-app
npm run build
# Deploy dist/ folder to Vercel, Netlify, or Firebase Hosting
\`\`\`

## License

MIT
"@

Set-Content -Path "README.md" -Value $rootReadme
Write-Host "  ✓ Created root README.md" -ForegroundColor Green

# Create mobile-app README
$mobileReadme = @"
# EZournals Mobile App

React Native mobile application for iOS and Android.

## Setup

\`\`\`bash
npm install
\`\`\`

## Run

\`\`\`bash
npm start
\`\`\`

Then press:
- \`i\` for iOS simulator
- \`a\` for Android emulator
- Scan QR code with Expo Go app

## Build

\`\`\`bash
eas build --platform ios
eas build --platform android
\`\`\`

## Features

- Native mobile UI
- Camera and photo library access
- Audio recording
- Location services
- Push notifications (coming soon)

## Tech Stack

- React Native
- Expo
- Firebase
- React Navigation

## Shared Backend

Uses shared code from \`../backend/\` folder for Firebase and utilities.
"@

Set-Content -Path "mobile-app/README.md" -Value $mobileReadme
Write-Host "  ✓ Created mobile-app/README.md" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Migration Complete! ✓" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review the changes: git status" -ForegroundColor White
Write-Host "  2. Install dependencies: npm run install:all" -ForegroundColor White
Write-Host "  3. Test mobile app: npm run mobile" -ForegroundColor White
Write-Host "  4. Test web app: npm run web" -ForegroundColor White
Write-Host "  5. Commit changes: git add . && git commit -m 'Migrate to monorepo structure'" -ForegroundColor White
Write-Host ""
Write-Host "Project Structure:" -ForegroundColor Yellow
Write-Host "  mobile-app/  - React Native (iOS/Android)" -ForegroundColor White
Write-Host "  web-app/     - React Web (Desktop)" -ForegroundColor White
Write-Host "  backend/     - Shared Firebase & utilities" -ForegroundColor White
Write-Host ""
Write-Host "If you encounter any issues, you can revert with: git reset --hard HEAD" -ForegroundColor Gray
Write-Host ""
