import React from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  BookOpen, 
  Video, 
  Gamepad2, 
  Accessibility, 
  Layers, 
  CheckCircle2 
} from 'lucide-react';

export default function AboutView() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: 1000, margin: '0 auto' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center' }}>
        <div className="hero-pill">
          <Sparkles size={14} />
          <span>Next-Gen Speech Synthesis</span>
        </div>
        <h1 style={{ fontSize: '2.75rem', fontWeight: 800, marginBottom: '1rem' }}>
          About <span className="hero-gradient">Beta AI</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
          Beta AI is a high-fidelity AI narration platform designed to bridge written language and human emotional expression through official ElevenLabs generative voice models.
        </p>
      </div>

      {/* 4 Feature Highlights */}
      <div className="content-grid-2col">
        <div className="feature-box">
          <div className="feature-icon">
            <Cpu size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Neural Voice Models</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Powered by ElevenLabs Multilingual v2 and Turbo v2.5 models. Generates rich human inflections, breathing nuances, emotional cadence, and context-aware pronunciation across 29+ languages.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
            <ShieldCheck size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Secure Full-Stack Proxy</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Enterprise-grade server proxy architecture. All narration requests are securely authenticated, validated, and streamed through the backend without exposing any sensitive credentials.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: 'var(--accent-pink)' }}>
            <Zap size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Ultra-Low Latency</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Direct binary audio streaming returns MPEG-3 data in fractions of a second, with integrated in-memory caching for voice metadata to respect API rate limits.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
            <Layers size={22} />
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Local Audio Vault</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Every synthesized audio clip is retained in browser local storage for instant replay, download, and script iteration without redundantly re-consuming your API quota.
          </p>
        </div>
      </div>

      {/* Target Audiences & Use Cases */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          Industry Applications & Use Cases
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-indigo)' }}>
              <BookOpen size={18} />
              <h4 style={{ fontWeight: 700 }}>Audiobooks & Literature</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Produce immersive long-form narrations with nuanced character distinction, pacing control, and emotional depth.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-purple)' }}>
              <Video size={18} />
              <h4 style={{ fontWeight: 700 }}>Content Creators & YouTube</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Generate studio-quality voiceovers for explainer videos, shorts, documentaries, and podcasts without recording booths.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-pink)' }}>
              <Gamepad2 size={18} />
              <h4 style={{ fontWeight: 700 }}>Gaming & Virtual NPCs</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Bring characters to life with distinct accents, personalities, and rapid turnarounds for interactive dialogues.
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--accent-emerald)' }}>
              <Accessibility size={18} />
              <h4 style={{ fontWeight: 700 }}>Accessibility & E-Learning</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Empower visually impaired individuals and students with natural auditory learning materials and screen assistance.
            </p>
          </div>
        </div>
      </div>

      {/* Architectural Flow Diagram */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>
          System Architecture
        </h2>
        <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1.5rem', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.8 }}>
          <div>[User Browser / React Studio]</div>
          <div style={{ color: 'var(--accent-indigo)' }}>&nbsp;&nbsp;│── POST /api/narrate (text, voiceId, settings)</div>
          <div style={{ color: 'var(--accent-indigo)' }}>&nbsp;&nbsp;▼</div>
          <div>[Node.js Express Server : Port 5000]</div>
          <div style={{ color: 'var(--text-muted)' }}>&nbsp;&nbsp;│── Validates input & executes authenticated cloud synthesis</div>
          <div style={{ color: 'var(--accent-purple)' }}>&nbsp;&nbsp;│── POST https://api.elevenlabs.io/v1/text-to-speech/{'{voice_id}'}</div>
          <div style={{ color: 'var(--accent-purple)' }}>&nbsp;&nbsp;▼</div>
          <div>[ElevenLabs Neural AI Engine]</div>
          <div style={{ color: 'var(--accent-emerald)' }}>&nbsp;&nbsp;│── Synthesizes high-fidelity audio/mpeg stream (44.1kHz, 128kbps)</div>
          <div style={{ color: 'var(--accent-emerald)' }}>&nbsp;&nbsp;▼</div>
          <div>[Client Waveform Audio Deck + Browser Blob Storage]</div>
        </div>
      </div>
    </div>
  );
}
