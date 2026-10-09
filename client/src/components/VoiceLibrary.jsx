import React, { useState, useRef } from 'react';
import { Search, Play, Pause, ArrowRight, Globe, Mic, Sparkles } from 'lucide-react';

export default function VoiceLibrary({ voices = [], onSelectAndUse }) {
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(new Audio());

  const handlePlayPreview = (voice) => {
    if (!voice.preview_url) return;
    if (playingId === voice.voice_id) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      audioRef.current.pause();
      audioRef.current.src = voice.preview_url;
      audioRef.current.play().then(() => setPlayingId(voice.voice_id)).catch(() => setPlayingId(null));
      audioRef.current.onended = () => setPlayingId(null);
    }
  };

  const filteredVoices = voices.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = v.name.toLowerCase().includes(q) ||
      (v.description && v.description.toLowerCase().includes(q)) ||
      (v.labels?.accent && v.labels.accent.toLowerCase().includes(q));

    if (!matchSearch) return false;
    if (genderFilter === 'male' && v.labels?.gender !== 'male') return false;
    if (genderFilter === 'female' && v.labels?.gender !== 'female') return false;
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: 650, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          ElevenLabs Voice Catalog
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
          Explore studio-grade neural voices trained on thousands of hours of expressive speech. Preview samples and choose the perfect narrator.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', flex: '1', minWidth: 260, maxWidth: 450 }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search voices by name, accent, or style..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'female', 'male'].map(g => (
            <button
              key={g}
              onClick={() => setGenderFilter(g)}
              style={{
                padding: '0.5rem 1.1rem',
                borderRadius: '999px',
                fontSize: '0.85rem',
                fontWeight: 600,
                border: '1px solid var(--border-subtle)',
                background: genderFilter === g ? 'var(--accent-indigo)' : 'var(--bg-card)',
                color: genderFilter === g ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              {g === 'all' ? 'All Voices' : g === 'female' ? 'Female' : 'Male'}
            </button>
          ))}
        </div>
      </div>

      {/* Voice Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filteredVoices.map(voice => {
          const isPlaying = playingId === voice.voice_id;

          return (
            <div
              key={voice.voice_id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.5rem',
                gap: '1.25rem'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div className="voice-avatar">
                      {voice.name.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{voice.name}</h3>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {[voice.labels?.accent, voice.labels?.gender, voice.labels?.age].filter(Boolean).join(' • ')}
                      </div>
                    </div>
                  </div>

                  {voice.preview_url && (
                    <button
                      className={`preview-play-btn ${isPlaying ? 'playing' : ''}`}
                      onClick={() => handlePlayPreview(voice)}
                      title={isPlaying ? 'Pause preview' : 'Play preview'}
                    >
                      {isPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: 2 }} />}
                    </button>
                  )}
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', minHeight: 42, lineHeight: 1.5 }}>
                  {voice.description || 'Versatile studio voice suited for diverse narrations, storytelling, and content.'}
                </p>

                {/* Verified languages if any */}
                {voice.verified_languages && voice.verified_languages.length > 0 && (
                  <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <Globe size={13} style={{ color: 'var(--text-muted)' }} />
                    {voice.verified_languages.slice(0, 4).map((lang, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '0.68rem',
                          background: 'rgba(255,255,255,0.06)',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '4px',
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase'
                        }}
                      >
                        {lang.language || 'en'}
                      </span>
                    ))}
                    {voice.verified_languages.length > 4 && (
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        +{voice.verified_languages.length - 4} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                className="action-pill-btn primary"
                onClick={() => onSelectAndUse(voice.voice_id)}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <span>Use Voice in Studio</span>
                <ArrowRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
