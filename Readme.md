<div align="center">

# 🍽️ Recipify — AI-Powered Recipe App

**A premium, dark-themed mobile recipe application built with Expo & React Native**

[![React Native](https://img.shields.io/badge/React_Native-0.74-61DAFB?style=flat-square&logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?style=flat-square&logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

*Discover recipes. Cook like a pro. Save your favorites. Build your shopping list.*

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Screenshots](#-screenshots)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Navigation Architecture](#-navigation-architecture)
- [Getting Started](#-getting-started)
- [Running the App](#-running-the-app)
- [Screen Reference](#-screen-reference)
- [Theme System](#-theme-system)
- [Known Issues & Fixes](#-known-issues--fixes)
- [Roadmap](#-roadmap)

---

## 🌟 Overview

**Recipify**  is a full-featured, production-ready mobile app for discovering, saving, and cooking recipes. Built with a premium dark UI inspired by high-end iOS apps like Linear and Cal.ai, it features smooth animations, a well-structured navigation system, and a clean component architecture.

The app now demonstrates CRUD against a fake REST API powered by JSON Server. The UI still uses the existing theme and navigation system, but recipe data is loaded from and persisted to the local API during development.

---

## 📱 Screenshots

| Onboarding | Home | Recipe Detail |
|:---:|:---:|:---:|
| 4-slide animated intro | Search, categories, featured | Hero image, tabs, ingredients |

| Search & Filter | Shopping List | Settings |
|:---:|:---:|:---:|
| Browse + live results + filter sheet | Checkable list with progress | Profile & preferences |

---

## ✨ Features

### 🚀 Core Features
- **Onboarding Flow** — 4-slide animated intro with progress indicator and skip option
- **Home Screen** — Personalized greeting, search bar, cuisine categories, featured & popular recipe sections, AI recommendation banner
- **Search & Filter** — Live search results, browse by ingredient / cooking method / dish type, bottom sheet filter with cuisine, diet, and prep time controls
- **Recipe Detail** — Full-screen hero image with parallax scroll, servings selector, calorie & time stats, tabbed view for Ingredients / Steps / Reviews
- **Saved Recipes** — Bookmarked recipes with category filter chips
- **Shopping List** — Add/remove/check-off ingredients, progress bar, item count, inline add modal
- **Profile & Settings** — Language, dietary preferences, measurement units, notification toggle, dark mode, support links

### 🎨 Design Features
- Premium dark theme throughout (`#0D0D0D` base)
- Amber/gold primary accent (`#FFA500`)
- Smooth spring animations using React Native's built-in `Animated` API
- Custom drawer with slide-in animation — no native dependencies
- Consistent 8pt spacing grid
- Rounded cards with subtle borders
- Accessible touch targets (minimum 44×44pt)

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [Expo](https://expo.dev/) SDK 54 |
| **Language** | TypeScript 5.3 |
| **UI** | React Native 0.74 |
| **Navigation** | React Navigation v6 (Stack + Tabs + Custom Drawer) |
| **Animations** | React Native `Animated` API |
| **Icons** | `@expo/vector-icons` (Ionicons) |
| **Gradients** | `expo-linear-gradient` |
| **Safe Areas** | `react-native-safe-area-context` |
| **Web Support** | `react-native-web` |

---

## 📁 Project Structure

```
Recipify-recipe-app/
│
├── App.tsx                          # Entry point — manages onboarding → main app
├── app.json                         # Expo config (name, icons, splash, platforms)
├── babel.config.js                  # Babel config (babel-preset-expo only)
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies
├── db.json                           # JSON Server seed database
│
└── src/
    │
    ├── navigation/
    │   └── index.tsx                # Full navigation setup
    │                                # Stack + Tab + Custom Animated Drawer
    │
    ├── screens/
    │   ├── OnboardingScreen.tsx     # 4-slide intro with animated transitions
    │   ├── HomeScreen.tsx           # Main home feed
    │   ├── SearchScreen.tsx         # Search + browse + filter bottom sheet
    │   ├── RecipeDetailScreen.tsx   # Full recipe view with scroll-aware header
    │   ├── SavedScreen.tsx          # Bookmarked recipes
    │   ├── ShoppingListScreen.tsx   # Interactive shopping checklist
    │   ├── ManageRecipesScreen.tsx  # JSON Server CRUD demo screen
    │   └── ProfileScreen.tsx        # Settings & user profile
    │
    ├── services/
    │   └── api.ts                   # Fetch-based API client for JSON Server
    │
    ├── components/
    │   ├── RecipeCard.tsx           # Multi-variant card (grid / list / featured)
    │   ├── SearchBar.tsx            # Search input with mic + filter button
    │   └── SectionHeader.tsx        # Section title with "See All" link
    │
    ├── data/
    │   └── mockData.ts              # All mock recipes, categories, onboarding slides
    │
    ├── theme/
    │   └── index.ts                 # Colors, spacing, radius, typography tokens
    │
    └── types/
        └── navigation.ts            # TypeScript param list types for all navigators
```

---

## 🗺️ Navigation Architecture

```
App.tsx
└── AppNavigator (Custom Animated Drawer Wrapper)
    │
    ├── [Drawer Panel] — slides in from left via Animated.spring
    │   ├── Home
    │   ├── Saved Recipes
    │   ├── Shopping List
    │   └── Profile & Settings
    │
    └── NavigationContainer
        └── RootStack (NativeStackNavigator)
            ├── MainTabs (BottomTabNavigator)
            │   ├── Home       → HomeScreen
            │   ├── Saved      → SavedScreen
            │   ├── List       → ShoppingListScreen
            │   └── Profile    → ProfileScreen
            │
            ├── RecipeDetail   → RecipeDetailScreen
            │   (slide_from_right)
            │
            ├── ManageRecipes   → ManageRecipesScreen
            │   (CRUD screen backed by JSON Server)
            │
            └── Search         → SearchScreen
                (modal, slide_from_bottom)
```

> **Note:** The drawer uses a fully custom React Native `Animated` implementation instead of `@react-navigation/drawer` to ensure compatibility with **Expo Go** without requiring a custom native build.

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

| Tool | Version | Install |
|---|---|---|
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| npm | 9+ | Included with Node |
| Expo CLI | Latest | `npm install -g expo-cli` |
| Expo Go (mobile) | Latest | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779) |

### Installation

**1. Clone or extract the project:**
```bash
# If using git
git clone https://github.com/yourusername/Recipify-recipe-app.git
cd Recipify-recipe-app

# Or extract the zip
tar -xzf Recipify-recipe-src.tar.gz
cd Recipify-recipe-app
```

**2. Install dependencies:**
```bash
npm install --legacy-peer-deps
```

**3. Create asset placeholders** (if `assets/` folder is missing):

*On Windows PowerShell:*
```powershell
mkdir assets -Force
Add-Type -AssemblyName System.Drawing
$bmp = New-Object System.Drawing.Bitmap(1,1)
$bmp.SetPixel(0,0,[System.Drawing.Color]::FromArgb(255,255,165,0))
$bmp.Save("assets\icon.png",[System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save("assets\splash.png",[System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save("assets\adaptive-icon.png",[System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Save("assets\favicon.png",[System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
```

*On macOS/Linux:*
```bash
mkdir -p assets
# Place any PNG images named: icon.png, splash.png, adaptive-icon.png, favicon.png
```

---

## ▶️ Running the App

Start the fake API first so the recipe screens can load from JSON Server:

```bash
npm run server
```

If you are testing on a physical device with Expo Go, `localhost` will not work.

Use your computer's LAN IP instead:

```bash
EXPO_PUBLIC_API_BASE_URL=http://<your-computer-ip>:3000 npm start
```

Keep `npm run server` running in a separate terminal. If the phone still cannot reach the API, verify that the IP shown in the app matches your computer's current LAN address and that port `3000` is open on the same Wi-Fi network.

### On Physical Device (Expo Go)

```bash
npx expo start --clear
```

Then:
1. Open **Expo Go** on your phone
2. Tap **Scan QR Code**
3. Scan the QR code shown in the terminal
4. ⚠️ Your phone and computer must be on the **same WiFi network**

> If scanning fails, in Expo Go tap **"Enter URL manually"** and type the `exp://` URL shown in your terminal (e.g. `exp://192.168.1.6:8081`)

### On Web Browser

```bash
# Option A — Dev server (live reload)
npx expo start --clear
# Then press 'w' in the terminal

# Option B — Static build
npx expo export --platform web
npx serve dist
# Open http://localhost:3000
```

> For best web experience: open DevTools → Device Toolbar → set to iPhone 14 (390×844)

### On Android Emulator

```bash
npx expo start --clear
# Press 'a' in the terminal
```

### On iOS Simulator (macOS only)

```bash
npx expo start --clear
# Press 'i' in the terminal
```

---

## 📺 Screen Reference

### OnboardingScreen
- 4 animated slides: Discover / Cook / Save / Shopping List
- Progress bar at the bottom
- "Continue" / "Get Started" CTA
- "Skip" button in the top right
- State persisted in `App.tsx` — shows only once per session

### HomeScreen
- User greeting with avatar
- Search bar (taps → opens SearchScreen as modal)
- Horizontally scrollable cuisine category chips
- Featured recipes (2-column grid)
- Popular recipes (2-column grid)
- AI Recommendation banner section
- Each card navigates to `RecipeDetail`

### SearchScreen
- Live filtering against mock data
- Browse mode: At Home ingredients / Cooking Method / Dish Type image chips
- Filter bottom sheet: Cuisine, Prep Time slider, Diet toggles
- "Find" CTA button

### RecipeDetailScreen
- Full-screen hero image
- Scroll-aware floating header (fades in on scroll)
- Star rating display
- Stats pills: Servings (tappable) / Calories / Time
- Description section
- Tabbed content: **Ingredients** / **Steps** / **Reviews**
- "Create Shopping List" sticky CTA

### SavedScreen
- Category filter chips (All / Breakfast / Main Course / Desserts)
- List view of saved recipes
- Empty state with "Explore Recipes" CTA

### ShoppingListScreen
- Progress bar (checked / total items)
- Checkable list items with delete option
- "Show/Hide completed" toggle
- "+ Add Item" modal with text input
- "Clear done" bulk action

### ProfileScreen
- User avatar + name + "Edit Profile" link
- Settings groups: Language, Dietary Preferences, Measurement Units (expandable), Notifications toggle
- Appearance: Dark Mode toggle
- Support: Help, Privacy Policy, Terms of Service
- Sign Out button

---

## 🎨 Theme System

All design tokens live in `src/theme/index.ts`.

### Colors
```typescript
colors.bg             // #0D0D0D  — page background
colors.bgSurface      // #141414  — elevated surfaces
colors.card           // #1A1A1A  — card background
colors.cardBorder     // #2A2A2A  — subtle borders
colors.primary        // #FFA500  — amber accent
colors.primaryMuted   // #FFA50015 — tinted background
colors.textPrimary    // #FFFFFF
colors.textSecondary  // #A0A0A0
colors.textMuted      // #606060
colors.error          // #FF4444
```

### Spacing (8pt grid)
```typescript
spacing.xs   // 4
spacing.sm   // 8
spacing.md   // 16
spacing.lg   // 24
spacing.xl   // 32
spacing.xxl  // 48
```

### Typography
```typescript
typography.displayLarge   // 36px bold
typography.displayMedium  // 30px bold
typography.titleLarge     // 22px semibold
typography.bodyMedium     // 15px regular
typography.label          // 11px medium, uppercase tracking
```

---

## 🐛 Known Issues & Fixes

### `react-native-reanimated` crashes in Expo Go
**Cause:** Newer versions of reanimated require a custom native build.  
**Fix:** The drawer navigator uses a fully custom `Animated`-based implementation — no reanimated dependency at runtime.

### Windows: `node_modules` fails to delete with PowerShell
**Cause:** Windows MAX_PATH (260 chars) limitation with deeply nested folders.  
**Fix:**
```bash
# Install rimraf globally and use it instead
npm install -g rimraf
rimraf node_modules
```

### Assets CRC error on startup
**Cause:** Corrupted PNG files generated by Node's Buffer method.  
**Fix:** Use PowerShell's `System.Drawing` to generate valid PNGs (see Getting Started section).

### SDK version mismatch with Expo Go
**Cause:** Project SDK and installed Expo Go app version differ.  
**Fix:** Update the project to match your Expo Go version:
```bash
npx expo install expo@latest
npx expo install --fix
```

---

## 🗓️ Roadmap

- [ ] Connect to real recipe API (Spoonacular / Edamam)
- [ ] User authentication (email + Google OAuth)
- [ ] Persistent saved recipes (AsyncStorage / Supabase)
- [ ] AI-powered recipe recommendations
- [ ] Meal planning calendar
- [ ] Nutritional breakdown charts
- [ ] Step-by-step cooking mode (screen stays on)
- [ ] Voice search integration
- [ ] Push notifications for meal reminders
- [ ] Social sharing of recipes
- [ ] Offline support with cached recipes
- [ ] Tablet / iPad layout

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ using Expo & React Native

**Recipify** — *وصفة*

</div>