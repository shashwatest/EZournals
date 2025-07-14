# EZournals

A simple React Native journal app built with Expo.

## Features
- Create new journal entries
- View all entries with timestamps
- Read full entry details
- Delete entries
- Local storage (entries saved on device)

## Setup & Run

1. Install dependencies:
   ```
   npm install
   ```

2. Install Expo CLI globally:
   ```
   npm install -g @expo/cli
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Use Expo Go app on your phone to scan QR code, or run on simulator:
   - For Android: `npm run android`
   - For iOS: `npm run ios`

## Project Structure
- `App.js` - Main navigation setup
- `screens/` - All app screens
- `utils/storage.js` - Data persistence functions

## Next Features to Add
- Search entries
- Edit existing entries
- Categories/tags
- Export entries
- Dark mode
- Entry photos