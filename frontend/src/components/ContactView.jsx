import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  CheckCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

export default function ContactView({ onNotify }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Feedback & Feature Request',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      if (onNotify) onNotify('Please fill in all required fields.', 'error');
      return;
    }

    setSubmitted(true);
    if (onNotify) onNotify('Your message has been sent successfully!', 'success');
  };

  const faqs = [
    {
      q: 'How does Beta AI synthesize speech?',
      a: 'Beta AI uses advanced neural acoustic synthesis engines to generate natural, emotion-infused human speech with realistic breathing, inflections, and pacing.'
    },
    {
      q: 'What is the maximum text length I can synthesize?',
      a: 'Beta AI supports up to 5,000 characters per single narration generation request, which provides roughly 5 to 7 minutes of continuous, natural speech.'
    },
    {
      q: 'How can I change voice emotion and variability?',
      a: 'In the Studio editor, toggle the "Voice Tuning" drawer. Decrease Stability (e.g. to 30%) to make speech more expressive and dramatic. Increase Stability (e.g. to 75%) for smooth, consistent audiobook reading.'
    },
    {
      q: 'Can I download the generated audio files for offline use?',
      a: 'Yes! Generated audio can be played directly in the browser or downloaded as high-quality standard MP3 files with 1 click.'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Get In Touch & Support
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Have questions, ideas for new audio features, or need assistance? Reach out to our team.
        </p>
      </div>

      <div className="content-grid-2col">
        {/* Contact Form */}
        <div className="glass-card">
          <div className="card-header">
            <div className="card-title-group">
              <Mail size={18} className="text-indigo-400" />
              <h2 className="card-title">Send Feedback</h2>
            </div>
          </div>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <CheckCircle size={48} style={{ color: 'var(--accent-emerald)', margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Thank You!</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Your message has been received. We appreciate your feedback to improve Beta AI.
              </p>
              <button
                className="action-pill-btn primary"
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: 'Feedback & Feature Request', message: '' });
                }}
                style={{ margin: '0 auto' }}
              >
                Send Another Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="control-label">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Prateek Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="control-label">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. prateek@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="control-label">Category</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="custom-select"
                >
                  <option value="Feedback & Feature Request">Feedback & Feature Request</option>
                  <option value="Voice Synthesis Quality">Voice Synthesis Quality</option>
                  <option value="Feature Suggestion">Feature Suggestion</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>

              <div className="form-group">
                <label className="control-label">Message</label>
                <textarea
                  rows={4}
                  placeholder="Share your thoughts, suggestions, or report any issue..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="form-input"
                  style={{ resize: 'vertical' }}
                  required
                />
              </div>

              <button
                type="submit"
                className="generate-btn"
                style={{ marginTop: '0.5rem' }}
              >
                <Send size={16} />
                <span>Submit Feedback</span>
              </button>
            </form>
          )}
        </div>

        {/* Interactive FAQs & Information */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card">
            <div className="card-header">
              <div className="card-title-group">
                <HelpCircle size={18} className="text-purple-400" />
                <h2 className="card-title">Frequently Asked Questions</h2>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(0,0,0,0.1)',
                      overflow: 'hidden'
                    }}
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontWeight: 600,
                        fontSize: '0.875rem'
                      }}
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {isOpen && (
                      <div style={{ padding: '0 1rem 0.85rem', fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Studio Tips Card */}
          <div className="glass-card">
            <div className="card-header">
              <div className="card-title-group">
                <Sparkles size={18} className="text-indigo-400" />
                <h3 className="card-title">Studio Pro Tips</h3>
              </div>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <li>• Use <code>&lt;break time="1.0s" /&gt;</code> tags between paragraphs for cinematic dramatic pauses.</li>
              <li>• Use <b>Multilingual v2</b> for rich foreign accents and multiple languages.</li>
              <li>• Use <b>Turbo v2.5</b> when you need lightning-fast synthesis turnaround.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
