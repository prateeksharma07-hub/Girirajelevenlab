import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import TextInputCard from './components/TextInputCard';
import VoiceSelector from './components/VoiceSelector';
import AudioPlayerDeck from './components/AudioPlayerDeck';
import VoiceLibrary from './components/VoiceLibrary';
import HistoryView from './components/HistoryView';
import AboutView from './components/AboutView';
import ContactView from './components/ContactView';
import Toast from './components/Toast';
import { 
  Sparkles, 
  BookOpen, 
  Tv, 
  Feather, 
  Radio, 
  Compass, 
  AlertTriangle 
} from 'lucide-react';

const PRESET_TEMPLATES = [
  {
    label: 'Storytelling Audiobook',
    icon: BookOpen,
    text: 'The ancient gate stood shrouded in twilight mist. As Donald stepped closer, the runes etched along the granite arch began to radiate with a soft, azure pulse.',
    stability: 0.65,
    similarity_boost: 0.8
  },
  {
    label: 'Tech Product Launch',
    icon: Tv,
    text: 'Meet the future of digital audio. Engineered with state-of-the-art neural architecture, Beta AI turns pure text into cinematic, emotion-rich performance in milliseconds.',
    stability: 0.45,
    similarity_boost: 0.85
  },
  {
    label: 'Calm Mindfulness Meditation',
    icon: Feather,
    text: 'Gently close your eyes. Inhale deeply through your nose, filling your lungs with clarity. Hold for three quiet seconds, and let every ounce of tension dissolve.',
    stability: 0.75,
    similarity_boost: 0.7
  },
  {
    label: 'Daily News Podcast',
    icon: Radio,
    text: 'Good morning, listeners. Welcome to your five-minute global tech briefing. Markets surged today as breakthroughs in generative voice AI captured worldwide attention.',
    stability: 0.6,
    similarity_boost: 0.75
  }
];

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => localStorage.getItem('voicecraft_theme') || 'dark');

  // Active navigation tab
  const [currentTab, setCurrentTab] = useState('studio');

  // Text state
  const [text, setText] = useState(
    'Welcome to Beta AI Studio. Type any text here, choose your preferred narrator voice, and experience the power of ElevenLabs neural voice synthesis.'
  );

  // ElevenLabs state
  const [voices, setVoices] = useState([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState('CwhRBWXzGAHq8TQ4Fs17'); // Roger by default
  const [models, setModels] = useState([]);
  const [modelId, setModelId] = useState('eleven_multilingual_v2');
  const [voiceSettings, setVoiceSettings] = useState({
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true
  });

  // User subscription / quota
  const [subscription, setSubscription] = useState(null);
  const [backendStatus, setBackendStatus] = useState(false);
  const [loadingVoices, setLoadingVoices] = useState(true);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [activeAudioUrl, setActiveAudioUrl] = useState(null);
  const [activeAudioMeta, setActiveAudioMeta] = useState(null);

  // History state
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('voicecraft_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toasts
  const [toasts, setToasts] = useState([]);

  // Set theme attribute on root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('voicecraft_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync history with localStorage
  useEffect(() => {
    try {
      localStorage.setItem('voicecraft_history', JSON.stringify(history));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }, [history]);

  // Initial data loading from backend
  useEffect(() => {
    // 1. Health check
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          setBackendStatus(true);
        }
      })
      .catch(err => {
        console.warn('Backend offline or health error:', err);
        setBackendStatus(false);
      });

    // 2. Fetch Subscription quota
    fetch('/api/user/subscription')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setSubscription(data);
        }
      })
      .catch(err => console.warn('Subscription fetch error:', err));

    // 3. Fetch Models
    fetch('/api/models')
      .then(res => res.json())
      .then(data => {
        if (data.models) {
          setModels(data.models);
        }
      })
      .catch(err => console.warn('Models fetch error:', err));

    // 4. Fetch Voices
    setLoadingVoices(true);
    fetch('/api/voices')
      .then(res => res.json())
      .then(data => {
        if (data.voices && data.voices.length > 0) {
          setVoices(data.voices);
          // If default voice not found, select first
          const found = data.voices.find(v => v.voice_id === selectedVoiceId);
          if (!found) {
            setSelectedVoiceId(data.voices[0].voice_id);
          }
        }
      })
      .catch(err => {
        console.error('Failed to load voices:', err);
        addToast('Failed to connect to backend voices endpoint.', 'error');
      })
      .finally(() => {
        setLoadingVoices(false);
      });
  }, []);

  // Helper to convert Blob to Base64 for persistent history playback
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Generation Handler
  const handleGenerate = async () => {
    if (!text.trim()) {
      addToast('Please enter text to narrate.', 'error');
      return;
    }

    if (text.length > 5000) {
      addToast('Text exceeds the 5,000 character limit.', 'error');
      return;
    }

    setGenerating(true);
    const activeVoice = voices.find(v => v.voice_id === selectedVoiceId);
    const voiceName = activeVoice ? activeVoice.name : 'Selected Voice';

    try {
      const response = await fetch('/api/narrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          voiceId: selectedVoiceId,
          modelId,
          voiceSettings
        })
      });

      if (!response.ok) {
        let errMessage = 'Synthesis failed.';
        try {
          const errData = await response.json();
          errMessage = errData.error || errMessage;
        } catch {
          errMessage = `Server error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errMessage);
      }

      const audioBlob = await response.blob();
      const objectUrl = URL.createObjectURL(audioBlob);

      // Convert to base64 for persistent storage in history
      let base64Url = objectUrl;
      try {
        base64Url = await blobToBase64(audioBlob);
      } catch (err) {
        console.warn('Base64 conversion failed, using blob URL:', err);
      }

      setActiveAudioUrl(objectUrl);
      setActiveAudioMeta({
        voiceName,
        textSnippet: text.trim().slice(0, 80)
      });

      // Update local history
      const newHistoryItem = {
        id: Date.now().toString(),
        text: text.trim(),
        voiceId: selectedVoiceId,
        voiceName,
        modelId,
        audioUrl: base64Url,
        timestamp: new Date().toISOString(),
        charCount: text.trim().length
      };

      setHistory(prev => [newHistoryItem, ...prev.slice(0, 49)]); // keep latest 50

      // Update remaining characters if subscription info exists
      if (subscription && typeof subscription.charactersRemaining === 'number') {
        const remaining = Math.max(0, subscription.charactersRemaining - text.trim().length);
        const used = subscription.characterCount + text.trim().length;
        setSubscription(prev => ({
          ...prev,
          charactersRemaining: remaining,
          characterCount: used
        }));
      }

      addToast(`Narration generated with ${voiceName}!`, 'success');
    } catch (err) {
      console.error('Generation Error:', err);
      addToast(err.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  // Preset Template Loader
  const handleLoadPreset = (preset) => {
    setText(preset.text);
    setVoiceSettings(prev => ({
      ...prev,
      stability: preset.stability ?? prev.stability,
      similarity_boost: preset.similarity_boost ?? prev.similarity_boost
    }));
    addToast(`Loaded preset: "${preset.label}"`, 'info');
  };

  // From Voice Library -> Studio
  const handleSelectAndUseVoice = (voiceId) => {
    setSelectedVoiceId(voiceId);
    setCurrentTab('studio');
    const v = voices.find(item => item.voice_id === voiceId);
    addToast(`Selected voice: ${v ? v.name : voiceId}`, 'success');
  };

  // From History -> Studio
  const handleLoadTextToStudio = (savedText, savedVoiceId) => {
    setText(savedText);
    if (savedVoiceId && voices.some(v => v.voice_id === savedVoiceId)) {
      setSelectedVoiceId(savedVoiceId);
    }
    setCurrentTab('studio');
    addToast('Script loaded into Studio editor.', 'info');
  };

  // From History -> Play in Audio Deck
  const handlePlayHistoryItem = (item) => {
    if (item.audioUrl) {
      setActiveAudioUrl(item.audioUrl);
      setActiveAudioMeta({
        voiceName: item.voiceName,
        textSnippet: item.text.slice(0, 80)
      });
      setCurrentTab('studio');
      addToast(`Playing narration by ${item.voiceName}`, 'info');
    }
  };

  // Delete single history item
  const handleDeleteHistoryItem = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
    addToast('History item deleted.', 'info');
  };

  // Clear all history
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to delete all saved narration history?')) {
      setHistory([]);
      addToast('All narration history cleared.', 'info');
    }
  };

  const selectedVoice = voices.find(v => v.voice_id === selectedVoiceId);

  return (
    <div className="app-container">
      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        theme={theme}
        toggleTheme={toggleTheme}
        subscription={subscription}
        backendStatus={backendStatus}
      />

      {/* Main Content Router */}
      <main className="main-content">
        {currentTab === 'studio' && (
          <div>
            {/* Hero Banner */}
            <div className="hero-section">
              <div className="hero-pill">
                <Sparkles size={14} />
                <span>Next-Generation ElevenLabs Voice Synthesis</span>
              </div>
              <h1 className="hero-title">
                Turn Your Words <span className="hero-gradient">Into Voice</span>
              </h1>
              <p className="hero-subtitle">
                Synthesize lifelike, emotion-infused human speech across 29+ languages. Perfect for audiobooks, video narrations, and interactive media.
              </p>

              {/* Quick Preset Prompts */}
              <div className="presets-container">
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Quick Presets:
                </span>
                {PRESET_TEMPLATES.map((preset, idx) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={idx}
                      className="preset-chip"
                      onClick={() => handleLoadPreset(preset)}
                      id={`preset-btn-${idx}`}
                    >
                      <Icon size={12} />
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Studio 2-Column Grid */}
            <div className="studio-layout">
              {/* Left Column: Script Editor & Controls */}
              <div>
                <TextInputCard
                  text={text}
                  setText={setText}
                  generating={generating}
                  onGenerate={handleGenerate}
                  modelId={modelId}
                  setModelId={setModelId}
                  models={models}
                  voiceSettings={voiceSettings}
                  setVoiceSettings={setVoiceSettings}
                  onNotify={addToast}
                />
              </div>

              {/* Right Column: Voice Selector & Live Audio Deck */}
              <div>
                <VoiceSelector
                  voices={voices}
                  selectedVoiceId={selectedVoiceId}
                  onSelectVoice={setSelectedVoiceId}
                  loading={loadingVoices}
                />

                {/* Audio Player Deck */}
                {activeAudioUrl && (
                  <AudioPlayerDeck
                    audioUrl={activeAudioUrl}
                    voiceName={activeAudioMeta?.voiceName || selectedVoice?.name}
                    textSnippet={activeAudioMeta?.textSnippet}
                    onNotify={addToast}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {currentTab === 'library' && (
          <VoiceLibrary
            voices={voices}
            onSelectAndUse={handleSelectAndUseVoice}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            history={history}
            onPlayHistoryItem={handlePlayHistoryItem}
            onLoadTextToStudio={handleLoadTextToStudio}
            onDeleteHistoryItem={handleDeleteHistoryItem}
            onClearHistory={handleClearHistory}
            onNotify={addToast}
          />
        )}

        {currentTab === 'about' && <AboutView />}

        {currentTab === 'contact' && <ContactView onNotify={addToast} />}
      </main>

      {/* Global Footer */}
      <footer className="app-footer">
        <div className="footer-content">
          <div>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Beta AI Studio</span>
            <span style={{ color: 'var(--text-secondary)' }}> • Neural Speech Platform</span>
          </div>

          <div className="footer-links">
            <span 
              onClick={() => setCurrentTab('about')} 
              style={{ cursor: 'pointer' }}
            >
              Overview
            </span>
            <span 
              onClick={() => setCurrentTab('library')} 
              style={{ cursor: 'pointer' }}
            >
              Voices
            </span>
            <span 
              onClick={() => setCurrentTab('contact')} 
              style={{ cursor: 'pointer' }}
            >
              Support & Feedback
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
