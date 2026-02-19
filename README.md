# ☤ QuickCure - Premium Healthcare Dashboard

QuickCure is a modern, high-performance appointment management platform designed with a premium "Glassmorphism" aesthetic. It provides a seamless interface for patients to book appointments and for doctors to manage their schedules efficiently.


## ✨ Premium Features

### 🎨 Visual Excellence
- **ECG Splash Screen:** A custom-built SVG animation of a heart monitor that greets users on their first visit of the session.
- **Glassmorphism UI:** Built with ultra-transparent layers, backdrop blurs, and gradient borders for a state-of-the-art feel.
- **Hospital Background:** An optimized, animated background with floating medical icons and periodic color blobs.

### 🕒 Smart Interaction
- **Drum Time Picker:** A custom-engineered, iOS-style vertical scroll-snap time picker for precise and intuitive slot selection.
- **Role-Based Workspaces:** Distinctive dashboards tailored for both Patients (booking/history) and Doctors (approval/management).
- **Responsive Animations:** Powered by `framer-motion` for smooth layout transitions and interaction feedback.

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Framer Motion, Lucide React, Axios.
- **Backend:** Node.js, Express.
- **Database:** MongoDB Atlas (Cloud).
- **Security:** JWT-based Authentication, Bcrypt password hashing.
- **Performance:** GPU-accelerated CSS, memoized components, and optimized SVG assets.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas Account

### 1. Setup Backend
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_complex_secret_key
```
Run the backend:
```bash
npm start
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Security & Compliance
- **JWT Authentication:** Secure stateless session management.
- **HIPAA-Ready UI:** Designed with privacy and professional healthcare standards in mind.
- **Encrypted Passwords:** Passwords never stored in plain text.

## 📈 Performance Highlights
- **Zero Layout Shift:** Careful use of `flexbox` and `grid` ensures a stable UI.
- **Fast First Paint:** Minimal assets and optimized SVGs for near-instant loading.
- **Butter-Smooth Animations:** Offloaded to the GPU using `transform: translateZ(0)` and `will-change` properties.

---

Built for **Aryan Dashboard** | 2026
