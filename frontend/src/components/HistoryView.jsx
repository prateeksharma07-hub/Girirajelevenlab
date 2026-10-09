import React, { useState } from 'react';
import { 
  History, 
  Trash2, 
  Download, 
  Play, 
  ArrowUpRight, 
  Search, 
  FileDown, 
  Clock, 
  Volume2, 
  Sparkles 
} from 'lucide-react';

export default function HistoryView({
  history = [],
  onPlayHistoryItem,
  onLoadTextToStudio,
  onDeleteHistoryItem,
  onClearHistory,
  onNotify
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = history.filter(item => {
    const q = searchTerm.toLowerCase();
    return (
      item.text.toLowerCase().includes(q) ||
      (item.voiceName && item.voiceName.toLowerCase().includes(q)) ||
      (item.modelId && item.modelId.toLowerCase().includes(q))
    );
  });

  const handleExportJSON = () => {
    if (history.length === 0) return;
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voicecraft-history-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    if (onNotify) onNotify('History exported to JSON successfully!', 'success');
  };

  const handleDownloadMp3 = (item) => {
    if (!item.audioUrl) return;
    const a = document.createElement('a');
    a.href = item.audioUrl;
    a.download = `narration-${(item.voiceName || 'voice').toLowerCase()}-${item.id || Date.now()}.mp3`;
    a.click();
    if (onNotify) onNotify('Downloading MP3...', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Narration History</h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Access, replay, and manage your past speech generations saved locally in your browser.
          </p>
        </div>

        {history.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="action-pill-btn"
              onClick={handleExportJSON}
              title="Export as JSON backup"
            >
              <FileDown size={15} />
              <span>Export JSON</span>
            </button>
            <button
              className="action-pill-btn"
              onClick={onClearHistory}
              style={{ color: 'var(--accent-rose)' }}
              title="Delete all items"
            >
              <Trash2 size={15} />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="voice-search-box" style={{ maxWidth: 450 }}>
          <Search size={16} className="voice-search-icon" />
          <input
            type="text"
            placeholder="Search past scripts or voice names..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="voice-search-input"
          />
        </div>
      )}

      {/* History Items List */}
      {history.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <History size={48} style={{ color: 'var(--accent-indigo)', margin: '0 auto 1rem', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Narrations Yet</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 450, margin: '0 auto 1.5rem' }}>
            Your generated speech tracks will be automatically preserved here so you can re-listen, download, or edit anytime.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          No history items match "{searchTerm}"
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(item => (
            <div key={item.id} className="history-card-item">
              <div className="history-item-top">
                <div className="history-meta-group">
                  <span className="card-badge">{item.voiceName || 'ElevenLabs Voice'}</span>
                  <span>•</span>
                  <span>{item.modelId || 'Multilingual v2'}</span>
                  <span>•</span>
                  <span>{item.charCount || item.text.length} characters</span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} />
                    {new Date(item.timestamp).toLocaleString(undefined, { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>

                <div className="history-actions">
                  <button
                    className="action-pill-btn"
                    onClick={() => onPlayHistoryItem(item)}
                    title="Play audio in studio player"
                  >
                    <Play size={14} />
                    <span>Play</span>
                  </button>

                  <button
                    className="action-pill-btn"
                    onClick={() => onLoadTextToStudio(item.text, item.voiceId)}
                    title="Load text into studio editor"
                  >
                    <ArrowUpRight size={14} />
                    <span>Open in Studio</span>
                  </button>

                  {item.audioUrl && (
                    <button
                      className="secondary-control-btn"
                      onClick={() => handleDownloadMp3(item)}
                      title="Download MP3"
                    >
                      <Download size={15} />
                    </button>
                  )}

                  <button
                    className="secondary-control-btn"
                    onClick={() => onDeleteHistoryItem(item.id)}
                    title="Delete item"
                    style={{ color: 'var(--accent-rose)' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <p className="history-text-snippet">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
