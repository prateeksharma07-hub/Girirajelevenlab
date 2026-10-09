const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// In-memory cache for voices
let cachedVoices = null;
let lastVoicesFetch = 0;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Fallback curated voices if API is temporarily unreachable
const FALLBACK_VOICES = [
  {
    voice_id: 'CwhRBWXzGAHq8TQ4Fs17',
    name: 'Roger',
    category: 'premade',
    description: 'Laid-Back, Casual, Resonant. Perfect for conversational and storytelling.',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/CwhRBWXzGAHq8TQ4Fs17/58ee3ff5-f6f2-4628-93b8-e38eb31806b0.mp3',
    labels: { accent: 'american', gender: 'male', age: 'middle_aged', use_case: 'conversational' },
    verified_languages: ['en', 'fr', 'de', 'es', 'nl']
  },
  {
    voice_id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    category: 'premade',
    description: 'Calm, soothing, warm and gentle young female voice.',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/b751cf01-7fa1-49b8-89c0-8d5f30e01768.mp3',
    labels: { accent: 'american', gender: 'female', age: 'young', use_case: 'narration' },
    verified_languages: ['en']
  },
  {
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    category: 'premade',
    description: 'Soft, pleasant, sweet narrator tone.',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/094c7764-f6cf-4467-b50a-4bf33010c283.mp3',
    labels: { accent: 'american', gender: 'female', age: 'young', use_case: 'narration' },
    verified_languages: ['en']
  },
  {
    voice_id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    category: 'premade',
    description: 'Well-rounded, clear, confident and natural storytelling.',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/ErXwobaYiN019PkySvjV/38d8f3b1-309c-4573-a837-2cb83fb39487.mp3',
    labels: { accent: 'american', gender: 'male', age: 'young', use_case: 'narration' },
    verified_languages: ['en']
  },
  {
    voice_id: 'MF3mGyEYCl7XYWbV9V6O',
    name: 'Elli',
    category: 'premade',
    description: 'Emotional, expressive, youth narrator.',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/MF3mGyEYCl7XYWbV9V6O/d9145657-6101-4475-9c97-09a25b2938cf.mp3',
    labels: { accent: 'american', gender: 'female', age: 'young', use_case: 'storytelling' },
    verified_languages: ['en']
  },
  {
    voice_id: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Josh',
    category: 'premade',
    description: 'Deep, engaging, resonant young male voice.',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/TxGEqnHWrfWFTfGW9XjX/3e7284f1-6785-4dfc-8fc6-b27e69cf20dc.mp3',
    labels: { accent: 'american', gender: 'male', age: 'young', use_case: 'narration' },
    verified_languages: ['en']
  },
  {
    voice_id: 'VR6AewLTigWG4xSOukaG',
    name: 'Arnold',
    category: 'premade',
    description: 'Crisp, authoritative, articulate documentary narration.',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/VR6AewLTigWG4xSOukaG/71dd9b21-4d37-4d1a-be19-9aa8f3d65b77.mp3',
    labels: { accent: 'american', gender: 'male', age: 'middle_aged', use_case: 'narration' },
    verified_languages: ['en']
  },
  {
    voice_id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    category: 'premade',
    description: 'Deep, warm, versatile professional male narration voice.',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/pNInz6obpgDQGcFmaJgB/6f131109-c102-4e87-a2f0-1c39064c1268.mp3',
    labels: { accent: 'american', gender: 'male', age: 'middle_aged', use_case: 'narration' },
    verified_languages: ['en']
  }
];

// Helper function to verify API key is present
const checkApiKey = (res) => {
  if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY.includes('your_elevenlabs_api_key')) {
    res.status(500).json({
      error: 'ElevenLabs API Key is not configured in backend .env file. Please provide a valid key.'
    });
    return false;
  }
  return true;
};

// ==========================================
// API ROUTES
// ==========================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime())
  });
});

// User Subscription & Quota Check
app.get('/api/user/subscription', async (req, res) => {
  if (!checkApiKey(res)) return;

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: { 'xi-api-key': ELEVENLABS_API_KEY }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errorData.detail?.message || 'Failed to fetch user subscription info from ElevenLabs.'
      });
    }

    const data = await response.json();
    const sub = data.subscription || {};
    const charCount = sub.character_count ?? 0;
    const charLimit = sub.character_limit ?? 10000;
    const remaining = Math.max(0, charLimit - charCount);

    res.json({
      tier: sub.tier || 'free',
      characterCount: charCount,
      characterLimit: charLimit,
      charactersRemaining: remaining,
      status: sub.status || 'active',
      firstName: data.first_name || 'User',
      resetDateUnix: sub.next_character_count_reset_unix
    });
  } catch (err) {
    console.error('Error fetching subscription:', err);
    res.status(500).json({
      error: 'Network error connecting to ElevenLabs API: ' + err.message
    });
  }
});

// Fetch Available Voices
app.get('/api/voices', async (req, res) => {
  // If cache is fresh, return cached
  const now = Date.now();
  if (cachedVoices && (now - lastVoicesFetch < CACHE_TTL_MS)) {
    return res.json({ voices: cachedVoices, cached: true });
  }

  if (!checkApiKey(res)) return;

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: { 'xi-api-key': ELEVENLABS_API_KEY }
    });

    if (!response.ok) {
      console.warn(`ElevenLabs voices call returned status ${response.status}. Using fallback voices.`);
      return res.json({ voices: FALLBACK_VOICES, fallback: true });
    }

    const data = await response.json();
    const rawVoices = data.voices || [];

    // Format & simplify voices list for clean frontend consumption
    const formattedVoices = rawVoices.map((v) => ({
      voice_id: v.voice_id,
      name: v.name,
      category: v.category || 'premade',
      description: v.description || '',
      preview_url: v.preview_url || null,
      labels: v.labels || {},
      high_quality_base_model_ids: v.high_quality_base_model_ids || [],
      verified_languages: (v.verified_languages || []).map(l => ({
        language: l.language,
        locale: l.locale,
        accent: l.accent,
        preview_url: l.preview_url
      }))
    }));

    cachedVoices = formattedVoices;
    lastVoicesFetch = now;

    res.json({ voices: formattedVoices, cached: false });
  } catch (err) {
    console.error('Error fetching voices, falling back:', err.message);
    res.json({ voices: FALLBACK_VOICES, fallback: true, error: err.message });
  }
});

// Generate Narration (TTS)
app.post('/api/narrate', async (req, res) => {
  if (!checkApiKey(res)) return;

  const {
    text,
    voiceId = 'CwhRBWXzGAHq8TQ4Fs17',
    modelId = 'eleven_multilingual_v2',
    voiceSettings = {}
  } = req.body;

  // Validation
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'Text prompt is required and cannot be empty.' });
  }

  if (text.length > 5000) {
    return res.status(400).json({
      error: `Character count exceeds the 5,000 character limit (Current: ${text.length} characters).`
    });
  }

  // Construct request payload
  const stability = typeof voiceSettings.stability === 'number' ? voiceSettings.stability : 0.5;
  const similarity_boost = typeof voiceSettings.similarity_boost === 'number' ? voiceSettings.similarity_boost : 0.75;
  const style = typeof voiceSettings.style === 'number' ? voiceSettings.style : 0.0;
  const use_speaker_boost = typeof voiceSettings.use_speaker_boost === 'boolean' ? voiceSettings.use_speaker_boost : true;

  const payload = {
    text: text.trim(),
    model_id: modelId,
    voice_settings: {
      stability,
      similarity_boost,
      style,
      use_speaker_boost
    }
  };

  try {
    const elevenUrl = `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`;
    
    console.log(`Generating speech with voice: ${voiceId}, model: ${modelId}, chars: ${text.length}`);

    const response = await fetch(elevenUrl, {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMessage = 'Failed to generate speech with ElevenLabs.';
      try {
        const errJson = await response.json();
        if (errJson.detail && errJson.detail.message) {
          errorMessage = errJson.detail.message;
        } else if (typeof errJson.detail === 'string') {
          errorMessage = errJson.detail;
        }
      } catch (e) {
        errorMessage = `ElevenLabs returned HTTP ${response.status}: ${response.statusText}`;
      }

      console.error('ElevenLabs TTS Error:', errorMessage);
      return res.status(response.status).json({ error: errorMessage });
    }

    const audioBuffer = await response.arrayBuffer();
    const nodeBuffer = Buffer.from(audioBuffer);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': nodeBuffer.length,
      'Content-Disposition': 'inline; filename="narration.mp3"',
      'Cache-Control': 'no-cache'
    });

    res.send(nodeBuffer);
  } catch (err) {
    console.error('Server error during narration generation:', err);
    res.status(500).json({ error: 'Internal server error while processing audio: ' + err.message });
  }
});

// Models list endpoint
app.get('/api/models', (req, res) => {
  res.json({
    models: [
      {
        id: 'eleven_multilingual_v2',
        name: 'Eleven Multilingual v2 (Recommended)',
        description: 'Cutting-edge model supporting 29 languages with unmatched emotional range and realism.'
      },
      {
        id: 'eleven_turbo_v2_5',
        name: 'Eleven Turbo v2.5',
        description: 'Ultra-low latency model designed for instant response and developer integrations.'
      },
      {
        id: 'eleven_flash_v2_5',
        name: 'Eleven Flash v2.5',
        description: 'Fastest generation speed with high fidelity, ideal for real-time applications.'
      },
      {
        id: 'eleven_monolingual_v1',
        name: 'Eleven Monolingual v1',
        description: 'Original English voice model tuned for classic stability and storytelling.'
      }
    ]
  });
});

// Serve frontend static files if built
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.use((req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Start Server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🎙️ Beta AI Narration Studio Backend`);
    console.log(`⚡ Server running on http://localhost:${PORT}`);
    console.log(`🔑 ElevenLabs API Key: ${ELEVENLABS_API_KEY ? 'Configured ✅' : 'Missing ❌'}`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
