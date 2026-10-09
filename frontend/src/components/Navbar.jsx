import React from 'react';
import { 
  Mic2, 
  Sparkles, 
  Sun, 
  Moon, 
  Activity, 
  Layers, 
  History, 
  Info, 
  Mail, 
  Volume2 
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  theme, 
  toggleTheme, 
  subscription, 
  backendStatus 
}) {
  return (
    <header className="header-nav">
      <div className="header-content">
        {/* Brand Logo */}
        <div className="brand-wrapper" onClick={() => setCurrentTab('studio')}>
          <div className="brand-icon-box">
            <Mic2 size={22} />
          </div>
          <div className="brand-title">
            <span>Beta AI</span>
            <span className="brand-badge">Voice Studio</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs">
          <button 
            className={`nav-tab-btn ${currentTab === 'studio' ? 'active' : ''}`}
            onClick={() => setCurrentTab('studio')}
            id="nav-studio-tab"
          >
            <Sparkles size={16} />
            <span>Studio</span>
          </button>
          <button 
            className={`nav-tab-btn ${currentTab === 'library' ? 'active' : ''}`}
            onClick={() => setCurrentTab('library')}
            id="nav-library-tab"
          >
            <Layers size={16} />
            <span>Voices</span>
          </button>
          <button 
            className={`nav-tab-btn ${currentTab === 'history' ? 'active' : ''}`}
            onClick={() => setCurrentTab('history')}
            id="nav-history-tab"
          >
            <History size={16} />
            <span>History</span>
          </button>
          <button 
            className={`nav-tab-btn ${currentTab === 'about' ? 'active' : ''}`}
            onClick={() => setCurrentTab('about')}
            id="nav-about-tab"
          >
            <Info size={16} />
            <span>About</span>
          </button>
          <button 
            className={`nav-tab-btn ${currentTab === 'contact' ? 'active' : ''}`}
            onClick={() => setCurrentTab('contact')}
            id="nav-contact-tab"
          >
            <Mail size={16} />
            <span>Contact</span>
          </button>
        </nav>

        {/* Right Actions: Quota, Theme Toggle */}
        <div className="header-actions">
          {subscription ? (
            <div className="quota-pill" title={`${subscription.characterCount} / ${subscription.characterLimit} used`}>
              <span className="quota-indicator" />
              <span>
                {subscription.charactersRemaining?.toLocaleString()} chars left
              </span>
            </div>
          ) : (
            <div className="quota-pill" title="Connecting to ElevenLabs API...">
              <Activity size={14} className={backendStatus ? 'text-emerald-400' : 'animate-spin'} />
              <span>{backendStatus ? 'Connected' : 'Connecting...'}</span>
            </div>
          )}

          <button 
            className="icon-button" 
            onClick={toggleTheme} 
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            id="theme-toggle-btn"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
