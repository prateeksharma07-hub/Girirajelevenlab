# 🎙️ VoiceCraft Studio — ElevenLabs AI Narration Platform

A modern, responsive, full-stack text-to-speech narration website built with **React**, **Node.js Express**, and the **ElevenLabs API**.

Turn written words into natural-sounding, emotive, studio-grade speech in seconds across 29+ languages.

---

## 🌟 Key Features

### 1. Studio Narration Workspace
- **Dynamic Text Input**: Supports up to 5,000 characters with real-time character count, word count, and speech reading time estimates.
- **SSML Pause Tag Injection**: Insert `<break time="1.0s" />` breaks with one click for natural timing and pacing.
- **Quick Presets**: Instant starter templates for *Storytelling Audiobooks*, *Tech Product Launches*, *Mindfulness Meditations*, and *Daily News Briefings*.
- **Model Selection**: Choose between:
  - `Eleven Multilingual v2` (Recommended: emotional range, 29+ languages)
  - `Eleven Turbo v2.5` (Ultra-low latency for instant feedback)
  - `Eleven Flash v2.5` (High-speed generation)
  - `Eleven Monolingual v1` (Classic English narration)

### 2. Fine-Grained Voice Tuning
- **Stability Slider**: Control vocal variability (from highly emotional/expressive to steady/consistent).
- **Similarity & Clarity Boost**: Tune acoustic proximity to original voice samples.
- **Style Exaggeration**: Amplify dramatic inflection and speaker style.
- **Speaker Boost**: Enhance output loudness and punch.

### 3. Voice Catalog & Instant Previews
- **21+ Curated Premade Voices** fetched live from ElevenLabs API (including *Roger*, *Rachel*, *Bella*, *Antoni*, *Josh*, *Adam*, etc.).
- **Zero-Quota Voice Sample Previews**: Listen to voice sample clips directly from ElevenLabs CDN before generating, preserving your character quota.
- **Filter & Search**: Filter voices by gender (*Male/Female*), accent (*American, British, Australian, etc.*), and use cases (*Narration, Conversational, Storytelling*).

### 4. Audio Playback Deck & Waveform
- **Live Soundwave Visualizer**: Dynamic animated frequency bars synchronized with audio playback.
- **Precision Audio Scrubber**: Interactive timeline seek bar with `mm:ss` timestamp display.
- **Playback Speed Control**: Selectable rates (`0.75x`, `1.0x`, `1.25x`, `1.5x`, `2.0x`).
- **Volume & Mute**: Smooth volume slider and instant mute toggle.
- **1-Click MP3 Download**: Save generated narration files with custom timestamped filenames.

### 5. Local Narration History Vault
- Persists your past generations in browser `localStorage` (including base64 audio and metadata).
- Re-play audio tracks directly from history.
- Download past MP3s or re-load scripts back into the studio editor for iteration.
- Export entire narration history to JSON backup.

### 6. Design & Accessibility
- **Dark & Light Mode**: Default nebula dark mode with glassmorphism and radiant gradients, with a clean pearl-white light mode.
- **Real-time Quota Badge**: Live indicator of remaining monthly character quota fetched directly from the ElevenLabs user endpoint.
- **Keyboard Shortcuts**: Synthesize speech instantly using `Ctrl + Enter` (or `Cmd + Enter`).
- **System Health Diagnostics**: Real-time ping latency check and backend uptime monitoring.

---

## 🏗️ Project Architecture

```
elevenlabsapigiriraj/
├── client/                     # Frontend (React 19 + Vite)
│   ├── public/
│   │   └── favicon.svg         # Soundwave gradient icon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Top navigation, quota pill, theme toggle
│   │   │   ├── TextInputCard.jsx   # Text input, counter, presets, sliders
│   │   │   ├── VoiceSelector.jsx   # Voice dropdown, cards, preview playback
│   │   │   ├── AudioPlayerDeck.jsx # Waveform visualizer, scrubber, MP3 download
│   │   │   ├── VoiceLibrary.jsx    # Full searchable voice catalog
│   │   │   ├── HistoryView.jsx     # LocalStorage history, JSON export
│   │   │   ├── AboutView.jsx       # ElevenLabs technology & use cases
│   │   │   ├── ContactView.jsx     # Feedback form & API diagnostics
│   │   │   └── Toast.jsx           # Floating notification toast alerts
│   │   ├── App.jsx             # Root layout & global state router
│   │   ├── index.css           # Glassmorphism design system & CSS tokens
│   │   └── main.jsx            # React root mount
│   ├── package.json
│   └── vite.config.js          # Vite config with /api proxy to localhost:5000
│
├── server/
│   └── server.js               # Node.js + Express backend API proxy
│
├── .env                        # Private environment variables (API Key)
├── .env.example                # Example environment template
├── package.json                # Root scripts (dev, build, start)
└── README.md                   # Full documentation
```

---

## 🔒 Security Best Practices

> [!IMPORTANT]
> **API Key Protection**: The ElevenLabs API key (`xi-api-key`) is stored **strictly in the backend `.env` file**. The client browser never sees or handles the secret key. All synthesis requests flow securely through `POST /api/narrate`.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### 1. Clone & Navigate
```bash
cd "c:\Users\jarvi\OneDrive\Desktop\New folder\elevenlabsapigiriraj"
```

### 2. Configure Environment Variables
Verify your `.env` file in the root directory:
```env
PORT=5000
ELEVENLABS_API_KEY=sk_cf0c81b849d5b3d58c17673926a03518e054498a23af09ce
NODE_ENV=development
```

### 3. Install Dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### 4. Run Development Servers
To run both backend API (port 5000) and frontend Vite server (port 3000) concurrently:
```bash
npm run dev
```

Open your browser at `http://localhost:3000` (or `http://localhost:5000`).

### 5. Production Build & Start
```bash
# Build the React frontend
npm run build

# Start the full-stack production server
npm start
```
Visit `http://localhost:5000` to access the production application.

---

## 📡 Backend API Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/health` | `GET` | Server health, uptime, and API key configuration status |
| `/api/user/subscription` | `GET` | Live ElevenLabs character count, monthly limit, and remaining balance |
| `/api/voices` | `GET` | Fetches available voices with metadata, tags, and sample preview URLs |
| `/api/models` | `GET` | List of supported ElevenLabs TTS models |
| `/api/narrate` | `POST` | Generates speech; streams `audio/mpeg` binary buffer to client |

### Example `POST /api/narrate` Request Body:
```json
{
  "text": "Hello, welcome to VoiceCraft Studio!",
  "voiceId": "CwhRBWXzGAHq8TQ4Fs17",
  "modelId": "eleven_multilingual_v2",
  "voiceSettings": {
    "stability": 0.5,
    "similarity_boost": 0.75,
    "style": 0.0,
    "use_speaker_boost": true
  }
}
```

---

## 🌐 Deployment Instructions

### Option A: Unified Full-Stack Deployment (Render / Railway / Heroku)
1. Push this repository to GitHub.
2. In **Render** or **Railway**, create a new **Web Service**.
3. Set the following build and start commands:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add environment variables:
   - `PORT`: `5000`
   - `ELEVENLABS_API_KEY`: `your_elevenlabs_api_key_here`
   - `NODE_ENV`: `production`
5. The Express server will build the frontend into `client/dist` and automatically serve both API routes and the client single-page application.

### Option B: Decoupled Deployment (Vercel Frontend + Render Backend)
1. **Deploy Backend to Render / Heroku**:
   - Repository root: Deploy the Express server.
   - Set environment variable: `ELEVENLABS_API_KEY`.
   - Your backend URL will be e.g. `https://voicecraft-api.onrender.com`.
2. **Deploy Frontend to Vercel / Netlify**:
   - Root directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - In `client/vite.config.js`, configure the proxy target to point to your deployed backend URL:
     ```javascript
     proxy: {
       '/api': {
         target: process.env.VITE_BACKEND_URL || 'https://voicecraft-api.onrender.com',
         changeOrigin: true
       }
     }
     ```

---

## 📄 License & Attribution
- Speech synthesis engine powered by **ElevenLabs API** (Text-to-Speech v1).
- Developed for VoiceCraft Studio.
