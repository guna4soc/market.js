import React, { useState, useEffect } from 'react';
import './Header.css';
import { FaMoon, FaSun, FaBell, FaEnvelope, FaChevronDown, FaSignOutAlt, FaUser } from 'react-icons/fa';

const searchHints = [
  'Search products...',
  'Search categories...',
  'Search stock...',
  'Search orders...'
];

const Header = ({ onMenuToggle, mode, onModeToggle, activeTab, setActiveTab, user, onLogout }) => {
  const [hintIdx, setHintIdx] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [notifications] = useState([
    { text: 'Order #1234 placed', time: '2 min ago' },
    { text: 'Stock running low', time: '10 min ago' },
    { text: 'New message from admin', time: 'Today' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHintIdx(idx => (idx + 1) % searchHints.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <div className="astrolite-logo-block">
          <div className="astrolite-logo-horizontal pro">
            <span className="astro">ASTR</span>
            <span className="o-red">O</span>
            <span className="lite">LITE</span>
          </div>
          <div className="astrolite-tagline pro-tagline">
            <span className="tagline-key">The future begins here</span>
          </div>
        </div>
        <button className="menu-btn small" onClick={onMenuToggle} aria-label="Toggle menu">
          <span className="menu-icon">☰</span>
        </button>
        <div className="buy-sell-toggle small">
          <button className={activeTab === 'buy' ? 'active' : ''} onClick={() => setActiveTab('buy')}>BUY</button>
          <button className={activeTab === 'sell' ? 'active' : ''} onClick={() => setActiveTab('sell')}>SELL</button>
        </div>
      </div>
      <div className="header-center">
        <input
          type="text"
          placeholder={searchHints[hintIdx]}
          className="search creative"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
        />
      </div>
      <div className="header-right">
        <button className="mode-toggle right-icon" onClick={onModeToggle} aria-label="Toggle dark/light mode">
          {mode === 'dark' ? <FaSun /> : <FaMoon />}
        </button>
        <div className="notif-wrapper">
          <button className="notif-btn right-icon" onClick={() => setNotifOpen(v => !v)} aria-label="Notifications">
            <FaBell />
            <span className="notif-dot" />
          </button>
          {notifOpen && (
            <div className="notif-dropdown">
              <div className="notif-title">Notifications</div>
              <ul>
                {notifications.map((n, i) => (
                  <li key={i}><span className="notif-text">{n.text}</span><span className="notif-time">{n.time}</span></li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="email-wrapper">
          <button className="email-btn right-icon" onClick={() => setEmailOpen(v => !v)} aria-label="Email notifications">
            <FaEnvelope />
            {notifications.some(n => n.text.toLowerCase().includes('email')) && (
              <span className="notif-dot" />
            )}
          </button>
          {emailOpen && (
            <div className="email-dropdown">
              <div className="email-title">No new emails</div>
            </div>
          )}
        </div>
        <div className="user-profile-wrapper">
          <button className="user-profile-btn right-icon" onClick={() => setProfileOpen(v => !v)} aria-label="User profile">
            <FaUser />
          </button>
          {profileOpen && user && (
            <div className="profile-dropdown">
              <div className="profile-email">{user.email}</div>
              <button className="logout-btn" onClick={onLogout}><FaSignOutAlt /> Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
