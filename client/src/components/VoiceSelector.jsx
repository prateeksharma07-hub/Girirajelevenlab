import React, { useState, useRef } from 'react';
import { Search, Play, Pause, Check, Volume2, User, Mic } from 'lucide-react';

export default function VoiceSelector({ 
  voices = [], 
  selectedVoiceId, 
  onSelectVoice, 
  loading 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [playingPreviewId, setPlayingPreviewId] = useState(null);
  const previewAudioRef = useRef(new Audio());

  const selectedVoice = voices.find(v => v.voice_id === selectedVoiceId) || voices[0];

  const handlePreviewToggle = (e, voice) => {
    e.stopPropagation();
    if (!voice.preview_url) return;

    if (playingPreviewId === voice.voice_id) {
      previewAudioRef.current.pause();
      setPlayingPreviewId(null);
    } else {
      previewAudioRef.current.pause();
      previewAudioRef.current.src = voice.preview_url;
      previewAudioRef.current.play()
        .then(() => {
          setPlayingPreviewId(voice.voice_id);
        })
        .catch(err => {
          console.warn('Failed preview play:', err);
          setPlayingPreviewId(null);
        });

      previewAudioRef.current.onended = () => {
        setPlayingPreviewId(null);
      };
    }
  };

  // Filter voices
  const filteredVoices = voices.filter(v => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      v.name.toLowerCase().includes(term) ||
      (v.description && v.description.toLowerCase().includes(term)) ||
      (v.labels?.accent && v.labels.accent.toLowerCase().includes(term)) ||
      (v.labels?.gender && v.labels.gender.toLowerCase().includes(term));

    if (!matchesSearch) return false;

    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'narration') {
      return v.labels?.use_case?.includes('narration') || v.category === 'premade';
    }
    if (categoryFilter === 'conversational') {
      return v.labels?.use_case?.includes('conversational');
    }
    if (categoryFilter === 'female') {
      return v.labels?.gender === 'female';
    }
    if (categoryFilter === 'male') {
      return v.labels?.gender === 'male';
    }
    return true;
  });

  return (
    <div className="glass-card">
      <div className="card-header">
        <div className="card-title-group">
          <Mic size={18} className="text-indigo-400" />
          <h2 className="card-title">Select Narration Voice</h2>
        </div>
        <span className="card-badge">{voices.length} Available</span>
      </div>

      {/* Selected Voice Showcase Banner */}
      {selectedVoice && (
        <div className="selected-voice-banner">
          <div className="selected-voice-info">
            <div className="voice-avatar">
              {selectedVoice.name.charAt(0)}
            </div>
            <div>
              <div className="voice-name-title">
                <span>{selectedVoice.name}</span>
                <Check size={14} className="text-indigo-400" />
              </div>
              <div className="voice-tags">
                {selectedVoice.labels?.gender && (
                  <span className="voice-tag">{selectedVoice.labels.gender}</span>
                )}
                {selectedVoice.labels?.accent && (
                  <span className="voice-tag">{selectedVoice.labels.accent}</span>
                )}
                {selectedVoice.labels?.use_case && (
                  <span className="voice-tag">{selectedVoice.labels.use_case}</span>
                )}
              </div>
            </div>
          </div>

          {selectedVoice.preview_url && (
            <button
              className={`preview-play-btn ${playingPreviewId === selectedVoice.voice_id ? 'playing' : ''}`}
              onClick={(e) => handlePreviewToggle(e, selectedVoice)}
              title={playingPreviewId === selectedVoice.voice_id ? 'Stop sample' : 'Listen sample'}
              id="selected-voice-preview-btn"
            >
              {playingPreviewId === selectedVoice.voice_id ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: 2 }} />}
            </button>
          )}
        </div>
      )}

      {/* Search Input */}
      <div className="voice-search-box">
        <Search size={16} className="voice-search-icon" />
        <input
          type="text"
          placeholder="Search by voice name, accent, gender..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="voice-search-input"
          id="voice-search-input"
        />
      </div>

      {/* Quick Filter Chips */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
        {[
          { id: 'all', label: 'All' },
          { id: 'narration', label: 'Narration' },
          { id: 'conversational', label: 'Conversational' },
          { id: 'female', label: 'Female' },
          { id: 'male', label: 'Male' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            style={{
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: '1px solid var(--border-subtle)',
              background: categoryFilter === cat.id ? 'var(--accent-indigo)' : 'var(--bg-input)',
              color: categoryFilter === cat.id ? '#ffffff' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Voice List Grid */}
      <div className="voice-list-grid">
        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Loading ElevenLabs voices...
          </div>
        )}

        {!loading && filteredVoices.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No voices found matching "{searchTerm}"
          </div>
        )}

        {!loading && filteredVoices.map(voice => {
          const isSelected = voice.voice_id === selectedVoiceId;
          const isPlayingThis = playingPreviewId === voice.voice_id;

          return (
            <div
              key={voice.voice_id}
              className={`voice-card-item ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectVoice(voice.voice_id)}
              id={`voice-item-${voice.voice_id}`}
            >
              <div className="voice-item-left">
                {voice.preview_url && (
                  <button
                    className={`preview-play-btn ${isPlayingThis ? 'playing' : ''}`}
                    onClick={(e) => handlePreviewToggle(e, voice)}
                    title={isPlayingThis ? 'Stop sample' : 'Listen sample'}
                  >
                    {isPlayingThis ? <Pause size={12} /> : <Play size={12} style={{ marginLeft: 1 }} />}
                  </button>
                )}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {voice.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {[
                      voice.labels?.accent,
                      voice.labels?.gender,
                      voice.labels?.use_case
                    ].filter(Boolean).join(' • ')}
                  </div>
                </div>
              </div>

              {isSelected && (
                <div style={{ color: 'var(--accent-indigo)' }}>
                  <Check size={18} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
