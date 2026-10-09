# 🎙️ Beta AI — Neural Narration Website

A modern, responsive full-stack AI narration website powered by ElevenLabs API.

---

## 📁 Project Structure

```
narration-app/
├── package.json          # Root scripts controlling both frontend and backend
├── backend/
│   ├── server.js         # Node.js Express server (runs on Port 5000)
│   └── package.json      # Backend scripts ("start": "node server.js")
├── frontend/
│   ├── src/App.jsx       # React application (runs on Port 5173)
│   └── package.json      # Frontend scripts ("dev": "vite")
├── .env                  # Secret ElevenLabs API key (kept secure at root)
├── .env.example          # Sample environment configuration template
└── README.md             # Project documentation
```

---

## 🚀 Quick Start (Single "Live" Command)

### Step 1: Install All Dependencies
Install dependencies for the root, backend, and frontend with a single command:
```bash
npm run install-all
```

### Step 2: Run Both Backend & Frontend Together
Launch the backend server (Port 5000) and frontend Vite server (Port 5173) concurrently:
```bash
npm run live
```

### Step 3: Open the Website
Open your browser and navigate to:
👉 **`http://localhost:5173`**

*(Backend API runs on `http://localhost:5000` and is automatically proxied)*

---

## ⚙️ Available Root Scripts

| Command | Description |
| :--- | :--- |
| `npm run install-all` | Installs dependencies across root, `backend/`, and `frontend/` |
| `npm run live` | Starts both backend (port 5000) and frontend (port 5173) concurrently |
| `npm run start-backend` | Starts the Express backend server (`node server.js`) on port 5000 |
| `npm run start-frontend` | Starts the Vite frontend server on port 5173 |
| `npm run build` | Compiles the React frontend production bundle |

---

## 🔒 Environment Configuration

Create or verify `.env` in the root directory:
```env
PORT=5000
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
NODE_ENV=development
```

> [!NOTE]
> The ElevenLabs API key is strictly maintained on the backend server and is never exposed to the frontend browser.

---

## 🌟 Features Included

- **Text Editor**: Up to 5,000 characters with live character and word counters.
- **One-Click Presets**: Storytelling Audiobooks, Tech Product Launches, Meditations, and News Podcasts.
- **Voice Library**: 21+ premade ElevenLabs voices with zero-quota preview clips.
- **Voice Tuning**: Custom sliders for Stability, Similarity Boost, Style Exaggeration, and Speaker Boost.
- **Interactive Audio Player**: Animated soundwave visualizer, scrubber, speed controls (`0.75x` – `2x`), volume, and MP3 download.
- **Local History**: Automatic local storage saving with direct audio playback and JSON export.
- **Dark/Light Mode**: Nebula dark theme and clean light theme.
