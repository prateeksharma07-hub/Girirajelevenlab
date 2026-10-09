// Netlify Serverless Function for Beta AI Voice Studio API
// Handles: /api/health, /api/user/subscription, /api/voices, /api/models, /api/narrate

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
let cachedVoices = null;
let lastVoicesFetch = 0;

// Curated fallback voices if ElevenLabs API is temporarily unreachable
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

const MODELS_LIST = [
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
];

function getApiKey() {
  return process.env.ELEVENLABS_API_KEY || (typeof Netlify !== 'undefined' && Netlify.env?.get('ELEVENLABS_API_KEY')) || 'sk_cf0c81b849d5b3d58c17673926a03518e054498a23af09ce';
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

export default async function handler(req, context) {
  const url = new URL(req.url);
  // Match path whether coming directly or rewritten
  let pathname = url.pathname;
  if (pathname.startsWith('/.netlify/functions/api')) {
    pathname = pathname.replace('/.netlify/functions/api', '/api');
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }

  const apiKey = getApiKey();

  // 1. Health check
  if (pathname === '/api/health' || pathname === '/api/health/') {
    return jsonResponse({
      status: 'ok',
      timestamp: new Date().toISOString(),
      platform: 'Netlify Functions'
    });
  }

  // 2. User subscription & quota
  if (pathname === '/api/user/subscription' || pathname === '/api/user/subscription/') {
    if (!apiKey) {
      return jsonResponse({ error: 'ELEVENLABS_API_KEY is not configured in Netlify environment variables.' }, 500);
    }
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/user', {
        headers: { 'xi-api-key': apiKey }
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return jsonResponse({
          error: errorData.detail?.message || 'Failed to fetch user subscription info from ElevenLabs.'
        }, response.status);
      }
      const data = await response.json();
      const sub = data.subscription || {};
      const charCount = sub.character_count ?? 0;
      const charLimit = sub.character_limit ?? 10000;
      const remaining = Math.max(0, charLimit - charCount);

      return jsonResponse({
        tier: sub.tier || 'free',
        characterCount: charCount,
        characterLimit: charLimit,
        charactersRemaining: remaining,
        status: sub.status || 'active',
        firstName: data.first_name || 'User',
        resetDateUnix: sub.next_character_count_reset_unix
      });
    } catch (err) {
      return jsonResponse({ error: 'Network error connecting to ElevenLabs API: ' + err.message }, 500);
    }
  }

  // 3. Voices list
  if (pathname === '/api/voices' || pathname === '/api/voices/') {
    const now = Date.now();
    if (cachedVoices && (now - lastVoicesFetch < CACHE_TTL_MS)) {
      return jsonResponse({ voices: cachedVoices, cached: true });
    }

    if (!apiKey) {
      return jsonResponse({ voices: FALLBACK_VOICES, fallback: true, warning: 'ELEVENLABS_API_KEY not configured' });
    }

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: { 'xi-api-key': apiKey }
      });
      if (!response.ok) {
        return jsonResponse({ voices: FALLBACK_VOICES, fallback: true });
      }
      const data = await response.json();
      const rawVoices = data.voices || [];
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
      return jsonResponse({ voices: formattedVoices, cached: false });
    } catch (err) {
      return jsonResponse({ voices: FALLBACK_VOICES, fallback: true, error: err.message });
    }
  }

  // 4. Models list
  if (pathname === '/api/models' || pathname === '/api/models/') {
    return jsonResponse({ models: MODELS_LIST });
  }

  // 5. Narrate (TTS)
  if (pathname === '/api/narrate' || pathname === '/api/narrate/') {
    if (req.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed. Use POST.' }, 405);
    }
    if (!apiKey) {
      return jsonResponse({ error: 'ELEVENLABS_API_KEY is not configured in Netlify environment variables.' }, 500);
    }

    let body = {};
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: 'Invalid JSON request body.' }, 400);
    }

    const {
      text,
      voiceId = 'CwhRBWXzGAHq8TQ4Fs17',
      modelId = 'eleven_multilingual_v2',
      voiceSettings = {}
    } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return jsonResponse({ error: 'Text prompt is required and cannot be empty.' }, 400);
    }

    if (text.length > 5000) {
      return jsonResponse({
        error: `Character count exceeds the 5,000 character limit (Current: ${text.length} characters).`
      }, 400);
    }

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
      const response = await fetch(elevenUrl, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
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
        } catch {
          errorMessage = `ElevenLabs returned HTTP ${response.status}: ${response.statusText}`;
        }
        return jsonResponse({ error: errorMessage }, response.status);
      }

      const audioBuffer = await response.arrayBuffer();

      return new Response(audioBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': String(audioBuffer.byteLength),
          'Content-Disposition': 'inline; filename="narration.mp3"',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*'
        }
      });
    } catch (err) {
      return jsonResponse({ error: 'Internal server error while processing audio: ' + err.message }, 500);
    }
  }

  return jsonResponse({ error: `Not found: ${pathname}` }, 404);
}

export const config = {
  path: '/api/*'
};
