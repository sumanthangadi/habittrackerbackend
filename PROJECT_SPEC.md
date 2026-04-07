# Habit Tracker - Full Project Specification

This document captures the entire architecture, data schemas, features, and setup instructions required to rebuild the Habit Tracker application from scratch.

---

## 1. PROJECT OVERVIEW
**Project Name:** SumanthHabitTracker
**Purpose:** A cross-platform productivity application designed to track recurring habits and one-off tasks with progress analytics.
**Tech Stack:**
- **Web App:** React 19, Vite, React Router DOM, Tailwind CSS V4
- **Mobile App:** React Native 0.81, Expo SDK 54, React Navigation (Bottom Tabs)
- **Backend:** Firebase (Firestore Serverless Database)
**Target Platforms:** Desktop browsers (Web), Android (APK via Expo), iOS (via Expo).

---

## 2. FIREBASE ARCHITECTURE

### Firestore Database Schema
The serverless database consists of two root-level collections:

**Collection 1: `habits`**
Tracks recurring goals that happen daily or on specific days of the week.
```json
{
  "_id": "auto-generated-firestore-id",
  "name": "Read a Book",          // string
  "time": "08:00 AM",             // string (optional)
  "type": "daily" | "custom",     // string enum
  "days": ["Mon", "Wed", "Fri"],  // array of strings (only populated if type=custom)
  "active": true,                 // boolean
  "completedDays": ["2026-04-01"] // array of ISO date strings (when the habit was completed)
}
```

**Collection 2: `tasks`**
Tracks one-off, non-recurring to-do items assigned to specific dates.
```json
{
  "_id": "auto-generated-firestore-id",
  "title": "Buy Groceries",       // string
  "time": "05:00 PM",             // string (optional)
  "date": "2026-04-01",           // ISO date string
  "status": "pending" | "done"    // string enum
}
```

### Firebase Initialization Code
*(Used identically in both Web and Mobile apps)*
```javascript
import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "sumanthhabittracker.firebaseapp.com",
  projectId: "sumanthhabittracker",
  storageBucket: "sumanthhabittracker.firebasestorage.app",
  messagingSenderId: "1054749526621",
  appId: "YOUR_APP_ID",
  measurementId: "G-W0RYLEQ4J5"
};

// Prevent multi-initialization errors during hot reloads
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Note: Avoid experimentalForceLongPolling unless WebSockets are strictly blocked by ISP
export const db = initializeFirestore(app, {});
```

### Security Rules
Currently operating in generic "Test Mode".
*Requirement for Rebuild:* Secure rules must be written to authenticate users via Firebase Auth before enabling production write access.

---

## 3. FEATURES & FUNCTIONALITY

### Complete Feature List
1. **Habit Creation:** Users can create 'Daily' or 'Custom' (specific day of week) habits.
2. **Task Creation:** Users can create one-off tasks assigned to today.
3. **Daily Tracking:** Users check off habits and tasks from the Dashboard. Real-time updates push completion status.
4. **Weekly Progress Analytics:** A dedicated "Week" view calculating completion percentage on a 7-day rolling window.
5. **Admin Management:** Dedicated portal to view all database records, create new habits/tasks, and manually delete obsolete records.

### State Management & Logic
- Handled locally in functional components using React `useState` and `useEffect`.
- `api.js` acts as an abstraction layer for fetching/sending standard `Promise` formatted data bridging UI components to the Firestore SDK.
- **Complex Logic - Weekly Calculation:**
  ```javascript
  // Calculates rolling 7-day progress
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = daysOfWeek[d.getDay()];

    const applicableHabits = habits.filter(h => 
      h.active && (h.type === 'daily' || (h.type === 'custom' && h.days?.includes(dayName)))
    );
    const total = applicableHabits.length;
    const completed = applicableHabits.filter(h => h.completedDays?.includes(dateStr)).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    // Push { day: dayName, percentage, total, completed } to week array
  }
  ```

---

## 4. UI/UX STRUCTURE

### Web App Structure
- **Routing:** `<BrowserRouter>` mapping `/` to Dashboard and `/admin` to Admin portal.
- **Components:**
  - `NavBar.jsx` (Sticky header)
  - `Dashboard.jsx` (Houses `ToggleGroup`, `TodayList`, `WeekGrid`)
  - `Admin.jsx` (Form and list view for CRUD operations)
- **Styling:** Raw Tailwind CSS V4 for immediate utility classes, prioritizing dark-mode aesthetics.

### Mobile App Structure (React Native)
- **Routing:** `@react-navigation/bottom-tabs` wrapped inside a `<NavigationContainer>`.
- **Primary Screens:**
  - `DashboardScreen.js`
  - `AdminScreen.js`
- **Component Hierarchy:**
  - `App.js` -> `<SafeAreaProvider>` -> Bottom Tabs
  - Uses exact same structural layout components (`TodayList`, `WeekGrid`, `ToggleGroup`) but built with `View`, `Text`, and `TouchableOpacity`.
- **Styling:** Centralized `Theme.js` object supplying static color tokens (e.g., `Theme.colors.surfaceCard`, `Theme.colors.bg`) directly to React Native `StyleSheet.create`.

---

## 5. DEPENDENCIES

### Frontend (Web) Packages
```json
"dependencies": {
  "axios": "^1.14.0",
  "firebase": "^12.11.0",
  "react": "^19.2.4",
  "react-dom": "^19.2.4",
  "react-router-dom": "^7.13.2",
  "recharts": "^3.8.1"
}
```
*Note: Tailwind Vite plugin handles all CSS styling dependencies.*

### Mobile (React Native) Packages
```json
"dependencies": {
  "@react-navigation/bottom-tabs": "^7.15.9",
  "@react-navigation/native": "^7.2.2",
  "expo": "~54.0.33",
  "expo-router": "~6.0.23",
  "firebase": "^12.11.0",
  "lucide-react-native": "^1.7.0",
  "react-native": "0.81.5",
  "react-native-gesture-handler": "~2.28.0",
  "react-native-safe-area-context": "~5.6.0"
}
```

---

## 6. CURRENT ISSUES & FIXES REQUIRED IN REBUILD

1. **IPv6 Firestore Connection Blackhole:** 
   - **Symptom:** Firebase reads/writes silently hang for exactly 120 seconds in environments using IPv6 (like Fedora Linux) before successfully triggering IPv4 fallback.
   - **Fix:** Avoid `experimentalForceLongPolling: true` (which triggers the massive timeout on blackholed ISPS/browsers). The system OS must have `precedence ::ffff:0:0/96 100` appended to `/etc/gai.conf` to force fast IPv4 resolution during development.
2. **Undefined Field Validation in Firestore:**
   - **Symptom:** Firestore randomly crashes when sending `{ time: undefined }` on newly created habits.
   - **Fix:** Implement a payload sanitizer (`cleanData`) to strip `undefined` properties before passing objects to `addDoc` or `updateDoc`.
3. **Gesture Handler Missing Initialization:**
   - **Symptom:** React Native tab icons and TouchableOpacity buttons become 100% unresponsive on Android.
   - **Fix:** Ensure `import 'react-native-gesture-handler';` remains at the absolute top/line 1 of the mobile `App.js` entry file.

---

## 7. ENVIRONMENT SETUP INSTRUCTIONS

1. **Web:** 
   - Run `npm install` inside the `frontend/` directory.
   - Edit `.env` or set up the `firebaseConfig` object appropriately.
   - Start the Vite server: `npm run dev`.
2. **Mobile:**
   - Run `npm install` inside the `mobile/` directory.
   - Start the Expo Metro Bundler: `npx expo start -c` (to clear cache).
   - Use `expo run:android` for local builds or `eas build -p android` for cloud APKs.
3. **Network Adjustments:**
   - Always run Node commands with `NODE_OPTIONS=--dns-result-order=ipv4first` prefix if developing on the Fedora Linux host to prevent DNS hangs.
