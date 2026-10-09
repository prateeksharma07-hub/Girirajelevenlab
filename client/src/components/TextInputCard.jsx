import React, { useState } from 'react';
import { 
  FileText, 
  Trash2, 
  Clipboard, 
  Sliders, 
  Sparkles, 
  Loader2, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Volume2,
  Cpu
} from 'lucide-react';

export default function TextInputCard({
  text,
  setText,
  generating,
  onGenerate,
  modelId,
  setModelId,
  models = [],
  voiceSettings,
  setVoiceSettings,
  onNotify
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  // Estimate reading duration: ~150 words per minute -> 2.5 words per second
  const estimatedSeconds = Math.max(1, Math.round(wordCount / 2.5));

  const isWarning = charCount > 4000 && charCount <= 5000;
  const isDanger = charCount > 5000;

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setText(clipText.slice(0, 5000));
        if (onNotify) onNotify('Pasted from clipboard!', 'success');
      }
    } catch (e) {
      if (onNotify) onNotify('Clipboard access denied or unavailable.', 'error');
    }
  };

  const handleClear = () => {
    setText('');
  };

  const handleInsertPause = () => {
    setText(prev => prev + ' <break time="1.0s" /> ');
    if (onNotify) onNotify('Added 1s pause tag', 'info');
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!generating && text.trim().length > 0 && !isDanger) {
        onGenerate();
      }
    }
  };

  return (
    <div className="glass-card">
      <div className="card-header">
        <div className="card-title-group">
          <FileText size={18} className="text-indigo-400" />
          <h2 className="card-title">Narration Script</h2>
        </div>
        <div className="card-badge">
          ~{estimatedSeconds}s Speech
        </div>
      </div>

      <div className="text-editor-container">
        {/* Main Textarea */}
        <div className="textarea-wrapper">
          <textarea
            className="narration-textarea"
            placeholder="Type or paste your text here (up to 5,000 characters). Select a voice on the right and click Generate Narration to synthesize lifelike speech..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={5000}
            id="narration-text-input"
          />

          <div className="textarea-footer">
            <div className={`char-counter ${isDanger ? 'danger' : isWarning ? 'warning' : ''}`}>
              <span>{charCount.toLocaleString()} / 5,000 chars</span>
              <span>•</span>
              <span>{wordCount} words</span>
            </div>

            <div className="textarea-actions">
              <button 
                type="button" 
                className="text-action-btn" 
                onClick={handleInsertPause}
                title="Insert SSML pause break"
              >
                + 1s Pause
              </button>
              <button 
                type="button" 
                className="text-action-btn" 
                onClick={handlePaste}
                title="Paste from clipboard"
              >
                <Clipboard size={12} />
                <span>Paste</span>
              </button>
              <button 
                type="button" 
                className="text-action-btn" 
                onClick={handleClear}
                disabled={!text}
                title="Clear text"
              >
                <Trash2 size={12} />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Model Selection & Advanced Drawer Toggle */}
        <div className="settings-bar">
          <div className="select-control-group">
            <label className="control-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Cpu size={14} className="text-indigo-400" />
                <span>AI Synthesis Model</span>
              </span>
            </label>
            <select
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              className="custom-select"
              id="model-selector-dropdown"
            >
              {models.length > 0 ? (
                models.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))
              ) : (
                <>
                  <option value="eleven_multilingual_v2">Eleven Multilingual v2 (Recommended)</option>
                  <option value="eleven_turbo_v2_5">Eleven Turbo v2.5 (Fast)</option>
                  <option value="eleven_flash_v2_5">Eleven Flash v2.5</option>
                  <option value="eleven_monolingual_v1">Eleven Monolingual v1</option>
                </>
              )}
            </select>
          </div>

          <div className="select-control-group">
            <label className="control-label">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Sliders size={14} className="text-purple-400" />
                <span>Voice Tuning</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-accent)',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                {showAdvanced ? 'Hide' : 'Customize'}
                {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </label>
            <div 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="custom-select" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Stability: {(voiceSettings.stability * 100).toFixed(0)}% | Clarity: {(voiceSettings.similarity_boost * 100).toFixed(0)}%
              </span>
              {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </div>
          </div>
        </div>

        {/* Collapsible Voice Settings Drawer */}
        {showAdvanced && (
          <div className="advanced-drawer">
            {/* Stability */}
            <div className="slider-group">
              <div className="slider-header">
                <span>Stability (Consistency vs Expression)</span>
                <span className="slider-value">{(voiceSettings.stability * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={voiceSettings.stability}
                onChange={(e) => setVoiceSettings({ ...voiceSettings, stability: parseFloat(e.target.value) })}
                className="custom-slider"
                id="stability-slider"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>More expressive & emotive</span>
                <span>More consistent & stable</span>
              </div>
            </div>

            {/* Similarity Boost */}
            <div className="slider-group">
              <div className="slider-header">
                <span>Clarity + Similarity Boost</span>
                <span className="slider-value">{(voiceSettings.similarity_boost * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={voiceSettings.similarity_boost}
                onChange={(e) => setVoiceSettings({ ...voiceSettings, similarity_boost: parseFloat(e.target.value) })}
                className="custom-slider"
                id="similarity-slider"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>Low artifacts</span>
                <span>High voice resemblance</span>
              </div>
            </div>

            {/* Style Exaggeration */}
            <div className="slider-group">
              <div className="slider-header">
                <span>Style Exaggeration</span>
                <span className="slider-value">{(voiceSettings.style * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={voiceSettings.style}
                onChange={(e) => setVoiceSettings({ ...voiceSettings, style: parseFloat(e.target.value) })}
                className="custom-slider"
                id="style-slider"
              />
            </div>

            {/* Speaker Boost Checkbox */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
              <input
                type="checkbox"
                checked={voiceSettings.use_speaker_boost}
                onChange={(e) => setVoiceSettings({ ...voiceSettings, use_speaker_boost: e.target.checked })}
                style={{ accentColor: 'var(--accent-indigo)', width: 16, height: 16 }}
              />
              <span>Enable Speaker Boost (Improves voice loudness & punch)</span>
            </label>
          </div>
        )}

        {/* Big Generate Button */}
        <button
          className="generate-btn"
          onClick={onGenerate}
          disabled={generating || text.trim().length === 0 || isDanger}
          id="generate-narration-main-btn"
        >
          {generating ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Generating Speech with ElevenLabs...</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>Generate Narration</span>
              <span style={{ fontSize: '0.75rem', opacity: 0.75, fontWeight: 500, marginLeft: '0.5rem' }}>
                (Ctrl + Enter)
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
