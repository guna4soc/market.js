
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCog, FaUserEdit, FaPalette, FaBell, FaLock, FaTrashAlt, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import '../components/Dashboard.css';

const initialProfile = {
  username: '',
  email: '',
  password: '',
  phone: '',
  avatar: '',
};

const initialSettings = {
  theme: 'light',
  notifications: true,
  language: 'en',
  privacy: 'public',
  twoFactor: false,
};

const languages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
];

const SettingPage = () => {
  const [profile, setProfile] = useState(initialProfile);
  const [settings, setSettings] = useState(initialSettings);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Replace with actual user email from auth context or localStorage
  const userEmail = localStorage.getItem('userEmail');

  // Fetch profile and settings from backend
  useEffect(() => {
    if (!userEmail) return;
    setLoading(true);
    axios.get(`/api/user/profile?email=${encodeURIComponent(userEmail)}`)
      .then(res => {
        setProfile({
          username: res.data.username || '',
          email: userEmail, // Always set from localStorage
          password: '',
          phone: res.data.phone || '',
          avatar: res.data.avatar || '',
        });
        setSettings({
          ...initialSettings,
          ...res.data.preferences
        });
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load profile.');
        setLoading(false);
      });
  }, [userEmail]);

  // Profile Handlers
  const handleProfileChange = e => {
    const { name, value, files } = e.target;
    if (name === 'avatar' && files && files[0]) {
      const reader = new FileReader();
      reader.onload = e2 => {
        setProfile(p => ({ ...p, avatar: e2.target.result }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setProfile(p => ({ ...p, [name]: value }));
    }
  };

  const handleProfileSubmit = e => {
    e.preventDefault();
    setLoading(true);
    axios.patch('/api/user/profile', {
      email: userEmail, // Always use userEmail
      username: profile.username,
      phone: profile.phone,
      password: profile.password,
      avatar: profile.avatar
    })
      .then(res => {
        setProfile({
          username: res.data.username || '',
          email: userEmail, // Always set from localStorage
          password: '',
          phone: res.data.phone || '',
          avatar: res.data.avatar || '',
        });
        setMessage('Profile updated successfully!');
        setError('');
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to update profile.');
        setMessage('');
        setLoading(false);
      });
  };

  // Settings Handlers
  const handleSettingsChange = e => {
    const { name, value, type, checked } = e.target;
    setSettings(s => ({ ...s, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSettingsSubmit = e => {
    e.preventDefault();
    setLoading(true);
    axios.patch('/api/user/preferences', {
      email: profile.email,
      preferences: settings
    })
      .then(res => {
        setSettings({ ...initialSettings, ...res.data.preferences });
        setMessage('Preferences saved successfully!');
        setError('');
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to update preferences.');
        setMessage('');
        setLoading(false);
      });
  };

  // Account Management
  const handleDeleteAccount = () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    setLoading(true);
    axios.delete('/api/user/delete', { data: { email: profile.email } })
      .then(() => {
        setMessage('Account deleted.');
        setError('');
        setLoading(false);
        // Optionally, log out user or redirect
      })
      .catch(() => {
        setError('Failed to delete account.');
        setMessage('');
        setLoading(false);
      });
  };

  // UI helpers
  const handlePasswordVisibility = () => setShowPassword(v => !v);

  return (
    <div style={{ display: 'flex', background: '#f7fafc', minHeight: '100vh' }}>
      {/* Sidebar placeholder (if you have a sidebar, render it here) */}
      <div style={{ width: 24, flexShrink: 0 }} />
      {/* Main Card */}
      <div style={{ flex: 1, maxWidth: '100%', background: 'none', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div className="dashboard-container" style={{ maxWidth: 900, margin: '24px 0', padding: 32, background: 'white', borderRadius: 16, boxShadow: '0 2px 16px #e3e3e3', minHeight: 'calc(100vh - 48px)', display: 'flex', flexDirection: 'column' }}>
          <div className="dashboard-header" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <FaCog size={32} style={{ color: '#2d7ff9' }} />
            <h2 style={{ fontWeight: 700, fontSize: 28, margin: 0 }}>Settings</h2>
          </div>
          {(message || error) && (
            <div className={`dashboard-alert ${error ? 'dashboard-alert-error' : 'dashboard-alert-success'}`} style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              {error ? <FaTimesCircle color="#e74c3c" /> : <FaCheckCircle color="#27ae60" />} {error || message}
            </div>
          )}
          {loading && <div style={{ marginBottom: 20 }}>Loading...</div>}
          <div className="dashboard-settings-section" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e9e9e9', padding: 28, marginBottom: 32 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FaUserEdit /> Profile Settings</h3>
            <form className="dashboard-form" onSubmit={handleProfileSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center', marginTop: 18 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <label style={{ fontWeight: 500 }}>Name:
                  <input type="text" name="username" value={profile.username} onChange={handleProfileChange} required className="dashboard-input" />
                </label>
                <label style={{ fontWeight: 500 }}>Email:
                  <input type="email" name="email" value={profile.email} onChange={handleProfileChange} required className="dashboard-input" disabled />
                </label>
                <label style={{ fontWeight: 500 }}>Phone:
                  <input type="tel" name="phone" value={profile.phone} onChange={handleProfileChange} placeholder="Phone number" className="dashboard-input" />
                </label>
                <label style={{ fontWeight: 500 }}>Password:
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type={showPassword ? 'text' : 'password'} name="password" value={profile.password} onChange={handleProfileChange} placeholder="New password" className="dashboard-input" />
                    <button type="button" onClick={handlePasswordVisibility} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                      <FaLock color={showPassword ? '#2d7ff9' : '#888'} />
                    </button>
                  </div>
                </label>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <label style={{ fontWeight: 500, marginBottom: 8 }}>Avatar:</label>
                <div style={{ marginBottom: 8 }}>
                  <img src={profile.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(profile.username)} alt="avatar" style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e9e9e9' }} />
                </div>
                <input type="file" name="avatar" accept="image/*" onChange={handleProfileChange} style={{ marginBottom: 8 }} />
                <button type="submit" className="dashboard-btn" style={{ width: 160 }} disabled={loading}>{loading ? 'Updating...' : 'Update Profile'}</button>
              </div>
            </form>
          </div>
          <div className="dashboard-settings-section" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e9e9e9', padding: 28, marginBottom: 32 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FaPalette /> Preferences</h3>
            <form className="dashboard-form" onSubmit={handleSettingsSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'center', marginTop: 18 }}>
              <label style={{ fontWeight: 500 }}>Theme:
                <select name="theme" value={settings.theme} onChange={handleSettingsChange} className="dashboard-input">
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </label>
              <label style={{ fontWeight: 500 }}>Language:
                <select name="language" value={settings.language} onChange={handleSettingsChange} className="dashboard-input">
                  {languages.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.label}</option>
                  ))}
                </select>
              </label>
              <label style={{ fontWeight: 500, gridColumn: '1/3' }}>
                <input type="checkbox" name="notifications" checked={settings.notifications} onChange={handleSettingsChange} style={{ marginRight: 8 }} />
                <FaBell style={{ marginRight: 4 }} /> Enable Notifications
              </label>
              <label style={{ fontWeight: 500, gridColumn: '1/3' }}>
                <input type="checkbox" name="twoFactor" checked={settings.twoFactor} onChange={handleSettingsChange} style={{ marginRight: 8 }} />
                <FaLock style={{ marginRight: 4 }} /> Enable Two-Factor Authentication
              </label>
              <label style={{ fontWeight: 500, gridColumn: '1/3' }}>Privacy:
                <select name="privacy" value={settings.privacy} onChange={handleSettingsChange} className="dashboard-input">
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="friends">Friends Only</option>
                </select>
              </label>
              <button type="submit" className="dashboard-btn" style={{ width: 180, gridColumn: '1/3' }} disabled={loading}>{loading ? 'Saving...' : 'Save Preferences'}</button>
            </form>
          </div>
          <div className="dashboard-settings-section" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e9e9e9', padding: 28, marginBottom: 32 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FaLock /> Security</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FaLock color="#2d7ff9" />
                <span>Password last changed: <b>2 months ago</b></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <FaLock color="#2d7ff9" />
                <span>Two-Factor Authentication: <b>{settings.twoFactor ? 'Enabled' : 'Disabled'}</b></span>
              </div>
            </div>
          </div>
          <div className="dashboard-settings-section" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e9e9e9', padding: 28, marginBottom: 32 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#e74c3c' }}><FaTrashAlt /> Account Management</h3>
            <button className="dashboard-btn dashboard-btn-danger" style={{ width: 180, fontWeight: 600, fontSize: 16 }} onClick={handleDeleteAccount} disabled={loading}>{loading ? 'Deleting...' : 'Delete Account'}</button>
          </div>
        </div>
      </div>
      {/* Right empty space */}
      <div style={{ width: 24, flexShrink: 0 }} />
    </div>
  );
};

export default SettingPage;
