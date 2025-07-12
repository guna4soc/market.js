import React, { useState } from 'react';
import './AuthPage.css';

const initialState = {
  email: '',
  password: '',
  name: '',
  confirmPassword: '',
};

const API_URL = 'http://localhost:5000/api/auth';

const AuthPage = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState('login'); // login | register | forgot
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [resetToken, setResetToken] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  // Only allow @gmail.com or @outlook.com emails
  // Only allow @gmail.com or @outlook.com emails (strict)
  const validateEmail = email => {
    if (!email) return false;
    // Only allow exact @gmail.com or @outlook.com, no subdomains
    return /^[^@\s]+@(gmail\.com|outlook\.com)$/.test(email.toLowerCase());
  };

  const handleLogin = async e => {
    e.preventDefault();
    setError('');
    if (!validateEmail(form.email)) return setError('Only @gmail.com or @outlook.com emails are accepted.');
    if (!form.password) return setError('Password is required.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.email, password: form.password })
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) return setError(data.error || 'Login failed.');
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', form.email); // Save user email for Settings page
      // Optionally fetch user info here
      const userInfo = { name: form.name || 'User', email: form.email };
      setUser(userInfo);
      onAuthSuccess && onAuthSuccess(userInfo);
    } catch (err) {
      setLoading(false);
      setError('Network error.');
    }
  };

  const handleRegister = async e => {
    e.preventDefault();
    setError('');
    if (!form.name) return setError('Name is required.');
    if (!validateEmail(form.email)) return setError('Only @gmail.com or @outlook.com emails are accepted.');
    if (!form.password || form.password.length < 8) return setError('Password must be at least 8 characters.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: form.email, email: form.email, password: form.password, name: form.name })
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) return setError(data.error || 'Registration failed.');
      setMode('login');
      setForm(initialState);
      setError('Account created! Please login.');
    } catch (err) {
      setLoading(false);
      setError('Network error.');
    }
  };

  const handleForgot = async e => {
    e.preventDefault();
    setError('');
    if (!validateEmail(form.email)) return setError('Only @gmail.com or @outlook.com emails are accepted.');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email })
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) return setError(data.error || 'Failed to send reset link.');
      setMode('login');
      setError('Password reset link sent to your email.');
    } catch (err) {
      setLoading(false);
      setError('Network error.');
    }
  };

  const handleReset = async e => {
    e.preventDefault();
    setError('');
    if (!resetToken) return setError('Reset token is required.');
    if (!resetPassword || resetPassword.length < 8) return setError('Password must be at least 8 characters.');
    if (resetPassword !== resetConfirm) return setError('Passwords do not match.');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, newPassword: resetPassword })
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) return setError(data.error || 'Failed to reset password.');
      setMode('login');
      setForm(initialState);
      setResetToken('');
      setResetPassword('');
      setResetConfirm('');
      setError('Password has been reset! Please login.');
    } catch (err) {
      setLoading(false);
      setError('Network error.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setForm(initialState);
    setMode('login');
    setError('');
  };

  if (user) {
    return (
      <div className="auth-loggedin">
        <div className="auth-profile">
          <div className="auth-avatar">{user.name[0]}</div>
          <div>
            <div style={{ fontWeight: 700 }}>{user.name}</div>
            <div style={{ color: '#888', fontSize: 14 }}>{user.email}</div>
          </div>
        </div>
        <button className="auth-logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div className="auth-container">
      {/* Left side: Typing animation and circles */}
      <div className="auth-left">
        <div className="auth-bg-circle auth-bg-circle1"></div>
        <div className="auth-bg-circle auth-bg-circle2"></div>
        <div className="auth-bg-circle auth-bg-circle3"></div>
        <div style={{ position: 'relative', zIndex: 1, marginLeft: 40 }}>
          <div className="typing-demo">Astrolite Tech Solutions Private Ltd.</div>
        </div>
      </div>
      {/* Right side: Login card */}
      <div className="auth-card">
        <h2 className="auth-title">{mode === 'login' ? 'Login' : mode === 'register' ? 'Create New Account' : 'Forgot Password'}</h2>
        {error && <div className="auth-error">{error}</div>}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="auth-form">
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} autoFocus className="auth-input" />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="auth-input" />
            <button className="auth-btn" type="submit" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
            <div className="auth-links">
              <span onClick={() => { setMode('register'); setError(''); }} className="auth-link">Create new account</span>
              <span onClick={() => { setMode('forgot'); setError(''); }} className="auth-link">Forgot password?</span>
            </div>
          </form>
        )}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="auth-form">
            <input name="name" type="text" placeholder="Full Name" value={form.name} onChange={handleChange} autoFocus className="auth-input" />
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="auth-input" />
            <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="auth-input" />
            <input name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} className="auth-input" />
            <button className="auth-btn" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
            <div className="auth-links">
              <span onClick={() => { setMode('login'); setError(''); }} className="auth-link">Back to login</span>
            </div>
          </form>
        )}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="auth-form">
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} autoFocus className="auth-input" />
            <button className="auth-btn" type="submit" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
            <div className="auth-links">
              <span onClick={() => { setMode('login'); setError(''); }} className="auth-link">Back to login</span>
              <span onClick={() => { setMode('reset'); setError(''); }} className="auth-link">Have a token? Reset password</span>
            </div>
          </form>
        )}
        {mode === 'reset' && (
          <form onSubmit={handleReset} className="auth-form">
            <input name="resetToken" type="text" placeholder="Enter OTP" value={resetToken} onChange={e => { setResetToken(e.target.value); setError(''); }} autoFocus className="auth-input" />
            <input name="resetPassword" type="password" placeholder="New Password" value={resetPassword} onChange={e => { setResetPassword(e.target.value); setError(''); }} className="auth-input" />
            <input name="resetConfirm" type="password" placeholder="Confirm New Password" value={resetConfirm} onChange={e => { setResetConfirm(e.target.value); setError(''); }} className="auth-input" />
            <button className="auth-btn" type="submit" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</button>
            <div className="auth-links">
              <span onClick={() => { setMode('login'); setError(''); }} className="auth-link">Back to login</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
