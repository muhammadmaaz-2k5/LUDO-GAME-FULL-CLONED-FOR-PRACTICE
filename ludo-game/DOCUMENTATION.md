# 🎨 Pak Ludo Frontend Documentation

A modern, responsive, dark-themed multiplayer web application for **Pak Ludo**, built with **React, Vite, Tailwind CSS, and Radix UI**.

---

## 📑 Table of Contents
1. [Tech Stack & Architecture](#-tech-stack--architecture)
2. [Design System & Styling System](#-design-system--styling-system)
3. [Component Hierarchy & Layout Engine](#-component-hierarchy--layout-engine)
4. [Themes Engine & Context](#-themes-engine--context)
5. [Page Directory & Routing](#-page-directory--routing)
6. [Planned Real-Time Integration](#-planned-real-time-integration)
7. [Installation & Development Scripts](#-installation--development-scripts)

---

## 💻 Tech Stack & Architecture

- **Core**: React 19 + Vite (Fast HMR & build tooling)
- **Routing**: `react-router-dom` (v7+)
- **Styling**: Tailwind CSS (v3.4) + PostCSS + Autoprefixer + `tailwindcss-animate`
- **UI Components & Primitives**: `@radix-ui/react-dialog` (Sheet/Modal), `@radix-ui/react-accordion`, `@radix-ui/react-slot`
- **Icons**: `lucide-react`
- **Utilities**: `clsx`, `tailwind-merge`, `class-variance-authority` (CVA)

---

## 🎨 Design System & Styling System

The application inherits the curated dark aesthetic from the Pak Chess platform:

### 1. Theme Color Tokens (`index.css` & `tailwind.config.js`)
| Token Name | Value / CSS Variable | Description |
|---|---|---|
| `bgMain` | `var(--bg-main)` (`#302e2b`) | Primary application background |
| `bgAuxiliary` | `var(--bg-auxiliary)` (`#262522`) | Sidebar & Navbar background |
| `bgDark` | `var(--bg-dark)` (`#21201d`) | Cards & popover background |
| `textMain` | `var(--text-main)` (`#ffffff`) | Primary text color |
| `textSecondary` | `var(--text-secondary)` (`#c3c3c1`)| Muted descriptions and secondary text |

### 2. Custom Scrollbar
Integrated sleek custom scrollbars with dark track (`#21201d`) and rounded stone thumb (`#464441`).

---

## 🧱 Component Hierarchy & Layout Engine

```
App.jsx (ThemesProvider > BrowserRouter)
 └── Layout.jsx
      ├── Navbar.jsx (Mobile Header with Sheet Trigger & Auth Button)
      │    └── MobileSidebar.jsx (Left Drawer with full Nav & Logo)
      ├── Sidebar.jsx (Desktop Fixed Side Navigation with Logo & Rating card)
      │    └── SideNav.jsx (Nav Items & Radix Accordions)
      │         └── subnav-accordian.jsx
      └── <main> (Dynamic Route Content Container: max-w-7xl)
```

### Key Components

- **`src/layout/index.jsx`**: Responsive container wrapping all routes with persistent sidebar, mobile navbar, and content constraints.
- **`src/components/sidebar.jsx`**: Left sidebar for medium/desktop viewports with active route indicators and brand styling.
- **`src/components/mobile-sidebar.jsx`**: Drawer navigation powered by Radix Dialog Sheet for mobile devices.
- **`src/components/ui/button.jsx`**: CVA-styled polymorphic button with variants (`default`, `outline`, `ghost`, `destructive`, etc.).
- **`src/components/ui/sheet.jsx`**: Accessible side drawer modal wrapper.
- **`src/components/subnav-accordian.jsx`**: Expandable accordions for grouped navigation links.

---

## 🌈 Themes Engine & Context

Located in `src/context/themeContext.jsx` and `src/constants/themes.js`.

### Features
1. **Dynamic CSS Variables**: Injects `--ludo-red`, `--ludo-green`, `--ludo-yellow`, and `--ludo-blue` directly onto `document.documentElement`.
2. **Persistent Storage**: Saves the player's active theme in `localStorage` under `ludo_theme`.
3. **Four Curated Palettes**:
   - **Classic**: Traditional primary colors (`#ef4444`, `#22c55e`, `#eab308`, `#3b82f6`).
   - **Neon**: Cyber glowing tones (`#ff007f`, `#39ff14`, `#fcf601`, `#00ffff`).
   - **Pastel**: Soft, desaturated colors (`#fca5a5`, `#86efac`, `#fde047`, `#93c5fd`).
   - **Ocean**: Deep marine and coastal colors (`#f43f5e`, `#14b8a6`, `#fbbf24`, `#0ea5e9`).

---

## 🗺 Page Directory & Routing

| Route | Component | Description |
|---|---|---|
| `/` | `src/pages/Home.jsx` | Landing screen, quick matchmaking launcher, and news |
| `/play-online` | `src/pages/PlayOnline.jsx` | Multiplayer matchmaking and custom room lobbies |
| `/computer` | `src/pages/Computer.jsx` | Offline/Online AI Bot match configurations |
| `/tournaments` | `src/pages/Tournaments.jsx` | Tournament brackets, entry fees, and prize pools |
| `/variants` | `src/pages/Variants.jsx` | Quick Ludo, Master mode, and 2v2 Team Up modes |
| `/leaderboard` | `src/pages/Leaderboard.jsx` | Global & regional ranking tables |
| `/login` | `src/pages/Login.jsx` | Authentication modal/form |
| `/settings` | `src/pages/Settings.jsx` | Settings hub with sub-navigation |
| `/settings/themes` | `src/components/themes.jsx` | Visual theme picker with 2x2 base previews |

---

## 🔮 Planned Real-Time Integration

Upcoming modules to be integrated into `ludo-game`:
1. **Interactive Ludo Board (`LudoBoard.jsx`)**: SVG/Canvas board with animated dice roll and step-by-step token paths.
2. **Socket Service (`useLudoSocket.js`)**: Socket.IO event handler for real-time turn synchronization.
3. **Audio System**: Sound effects for dice roll, token step, star safe placement, opponent cut, and victory horn.
4. **Chat & Emojis**: Quick in-game reaction overlay.

---

## 🛠 Installation & Development Scripts

### Install Dependencies
```bash
cd ludo-game
npm install
```

### Start Development Server (Vite HMR)
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```
The output bundle will be created in the `dist/` directory.
