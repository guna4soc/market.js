import React, { useState, useEffect, useRef } from 'react';
import { FaEnvelope, FaReply, FaArchive, FaTrash, FaCheck, FaTimes, FaStar, FaRegStar, FaPaperPlane, FaSearch, FaInbox, FaExclamationCircle } from 'react-icons/fa';
import '../components/Dashboard.css';

const API_URL = 'http://localhost:5000/api/message';

const MessagePage = ({ user }) => {
  const userEmail = user?.email || '';
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [archive, setArchive] = useState(() => {
    const saved = localStorage.getItem('archive');
    if (saved) return JSON.parse(saved);
    return [];
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ to: '', subject: '', content: '' });
  // Search state with localStorage persistence
  const [search, setSearch] = useState(() => {
    return localStorage.getItem('messageSearch') || '';
  });
  const searchInputRef = useRef(null);
  // Persist search value to localStorage
  useEffect(() => {
    localStorage.setItem('messageSearch', search);
  }, [search]);

  // Restore search value on theme toggle (listen for custom event)
  useEffect(() => {
    const handler = () => {
      setSearch(localStorage.getItem('messageSearch') || '');
    };
    window.addEventListener('color-scheme-toggle', handler);
    return () => window.removeEventListener('color-scheme-toggle', handler);
  }, []);
  const [showReply, setShowReply] = useState(null); // index of message being replied to
  const [showDetails, setShowDetails] = useState(null); // index of message for details modal
  const [showConfirm, setShowConfirm] = useState({ idx: null, type: '' });
  const [starredOnly, setStarredOnly] = useState(false);
  const [importantOnly, setImportantOnly] = useState(false);
  const [selected, setSelected] = useState([]);
  const [snackbar, setSnackbar] = useState(null);
  const replyRef = useRef(null);

  // Add missing handler for form input changes
  const handleFormChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Add missing handler to mark all messages as read
  const markAllRead = () => {
    messages.forEach(msg => {
      if (!msg.read) updateMessage(msg._id, { read: true });
    });
  };

  // Fetch messages from backend
  const fetchMessages = async () => {
    setLoading(true);
    setFetchError('');
    try {
      // Fetch received messages
      const res1 = await fetch(`${API_URL}?user=${encodeURIComponent(userEmail)}`);
      let received = await res1.json();
      if (!Array.isArray(received)) received = [];
      // Fetch sent messages
      const res2 = await fetch(`${API_URL}?from=${encodeURIComponent(userEmail)}`);
      let sent = await res2.json();
      if (!Array.isArray(sent)) sent = [];
      // Combine and remove duplicates (if any)
      const all = [...received, ...sent].filter(
        (msg, idx, arr) => arr.findIndex(m => m._id === msg._id) === idx
      );
      setMessages(all);
    } catch (err) {
      setFetchError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userEmail) fetchMessages();
  }, [userEmail]);

  // Send message
  const sendMsg = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: form.to, from: userEmail, subject: form.subject, content: form.content })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');
      setForm({ to: '', subject: '', content: '' });
      setShowForm(false);
      setShowReply(null);
      setSnackbar({ msg: 'Message sent!' });
      fetchMessages(); // Always fetch from backend after sending
    } catch (err) {
      alert(err.message || 'Failed to send message.');
    }
  };

  // Update message (read, starred, important, archived)
  const updateMessage = async (id, update) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update message');
      setMessages(msgs => msgs.map(m => m._id === id ? data : m));
    } catch (err) {
      alert(err.message || 'Failed to update message.');
    }
  };

  // Delete message
  const deleteMsg = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete message');
      setSnackbar({ msg: 'Message deleted' });
      fetchMessages(); // Always fetch from backend after deleting
    } catch (err) {
      alert(err.message || 'Failed to delete message.');
    }
  };

  // Mark as read
  const markRead = idx => {
    const msg = messages[idx];
    if (!msg.read) updateMessage(msg._id, { read: true });
  };
  // Archive
  const archiveMsg = idx => {
    const msg = messages[idx];
    updateMessage(msg._id, { archived: true });
  };
  // Star/Unstar
  const toggleStar = idx => {
    const msg = messages[idx];
    updateMessage(msg._id, { starred: !msg.starred });
  };
  // Mark as important
  const toggleImportant = idx => {
    const msg = messages[idx];
    updateMessage(msg._id, { important: !msg.important });
  };
  // Bulk actions, reply, etc. should use the same updateMessage/deleteMsg logic.

  // Advanced: Snackbar for undo
  const showUndo = (msg, undoFn) => {
    setSnackbar({ msg, undoFn });
    setTimeout(() => setSnackbar(null), 3500);
  };

  // Reply
  const replyMsg = (idx) => {
    setForm({ to: messages[idx].from, subject: 'Re: ' + messages[idx].subject, content: '' });
    setShowForm(true);
    setShowReply(idx);
    setTimeout(() => replyRef.current && replyRef.current.focus(), 100);
  };
  // Select for bulk
  const toggleSelect = idx => setSelected(sel => sel.includes(idx) ? sel.filter(i => i !== idx) : [...sel, idx]);
  const selectAll = () => setSelected(messages.map((_, i) => i));
  const clearSelected = () => setSelected([]);
  // Bulk delete/archive/read
  const bulkDelete = () => {
    const deleted = selected.map(i => messages[i]);
    setMessages(messages.filter((_, i) => !selected.includes(i)));
    showUndo('Messages deleted', () => setMessages(msgs => {
      let arr = [...msgs];
      deleted.forEach((msg, j) => arr.splice(selected[j], 0, msg));
      return arr;
    }));
    setSelected([]);
  };
  const bulkArchive = () => {
    const archived = selected.map(i => messages[i]);
    setArchive([...archived, ...archive]);
    setMessages(messages.filter((_, i) => !selected.includes(i)));
    showUndo('Messages archived', () => {
      setArchive(a => a.slice(archived.length));
      setMessages(msgs => {
        let arr = [...msgs];
        archived.forEach((msg, j) => arr.splice(selected[j], 0, msg));
        return arr;
      });
    });
    setSelected([]);
  };
  const bulkRead = () => setMessages(messages.map((m, i) => selected.includes(i) ? { ...m, read: true } : m));

  // Details modal
  const openDetails = idx => setShowDetails(idx);
  const closeDetails = () => setShowDetails(null);

  return (
    <div style={{ display: 'flex', background: '#f7fafc', minHeight: '100vh' }}>
      {/* Sidebar placeholder (if you have a sidebar, render it here) */}
      <div style={{ width: 24, flexShrink: 0 }} />
      {/* Main Card */}
      <div style={{ flex: 1, maxWidth: '100%', background: 'none', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div className="dashboard-container" style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 16px #e3e3e3', minHeight: 'calc(100vh - 48px)', padding: 24, margin: '24px 0', display: 'flex', flexDirection: 'column' }}>
          {/* ...existing code... (everything inside the previous dashboard-container) */}
          {/* Header */}
          <div className="dashboard-header" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <FaEnvelope size={28} style={{ marginRight: 8, color: '#1976d2' }} />
            <h2 style={{ margin: 0, fontWeight: 800, letterSpacing: 1 }}>Messages</h2>
            <button className="dashboard-btn" onClick={() => setShowForm(!showForm)} style={{ marginLeft: 'auto', background: showForm ? '#e53935' : '#43a047', color: '#fff', borderRadius: 6, padding: '8px 18px', border: 'none' }}>{showForm ? <><FaTimes /> Cancel</> : <><FaPaperPlane /> Compose</>}</button>
          </div>
          {/* ...existing code... (rest of the content remains unchanged) */}
          {/* Compose Form */}
          {showForm && (
            <form className="dashboard-form" onSubmit={sendMsg} style={{ marginBottom: 24, background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #e3e3e3', padding: 18, maxWidth: 500 }}>
              <label style={{ fontWeight: 600 }}>To: <input name="to" value={form.to} onChange={handleFormChange} required style={{ marginLeft: 8, borderRadius: 6, border: '1px solid #ddd', padding: 8, fontSize: 15, width: '80%' }} /></label>
              <label style={{ fontWeight: 600 }}>Subject: <input name="subject" value={form.subject} onChange={handleFormChange} required style={{ marginLeft: 8, borderRadius: 6, border: '1px solid #ddd', padding: 8, fontSize: 15, width: '80%' }} /></label>
              <label style={{ fontWeight: 600 }}>Message: <textarea name="content" value={form.content} onChange={handleFormChange} required ref={replyRef} style={{ marginLeft: 8, borderRadius: 6, border: '1px solid #ddd', padding: 8, fontSize: 15, width: '80%', minHeight: 80 }} /></label>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button type="submit" className="dashboard-btn" style={{ background: '#1976d2', color: '#fff', borderRadius: 6, padding: '8px 18px', border: 'none' }}><FaPaperPlane style={{ marginRight: 6 }} />Send</button>
                <button type="button" className="dashboard-btn" onClick={() => { setShowForm(false); setShowReply(null); }} style={{ background: '#e53935', color: '#fff', borderRadius: 6, padding: '8px 18px', border: 'none' }}><FaTimes style={{ marginRight: 6 }} />Cancel</button>
              </div>
            </form>
          )}
          {/* Bulk Actions & Filters */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
            <button className="dashboard-btn" onClick={markAllRead} style={{ background: '#1976d2', color: '#fff', borderRadius: 6, padding: '6px 10px', border: 'none', fontSize: 14 }}><FaCheck style={{ marginRight: 5 }} />Mark All as Read</button>
            <button className="dashboard-btn" onClick={selectAll} style={{ background: '#43a047', color: '#fff', borderRadius: 6, padding: '6px 10px', border: 'none', fontSize: 14 }}>Select All</button>
            <button className="dashboard-btn" onClick={clearSelected} style={{ background: '#bbb', color: '#fff', borderRadius: 6, padding: '6px 10px', border: 'none', fontSize: 14 }}>Clear Selection</button>
            <button className="dashboard-btn" onClick={bulkRead} disabled={selected.length === 0} style={{ background: '#1976d2', color: '#fff', borderRadius: 6, padding: '6px 10px', border: 'none', fontSize: 14, opacity: selected.length === 0 ? 0.5 : 1, cursor: selected.length === 0 ? 'not-allowed' : 'pointer' }}>Mark Selected Read</button>
            <button className="dashboard-btn" onClick={bulkArchive} disabled={selected.length === 0} style={{ background: '#ffb300', color: '#fff', borderRadius: 6, padding: '6px 10px', border: 'none', fontSize: 14, opacity: selected.length === 0 ? 0.5 : 1, cursor: selected.length === 0 ? 'not-allowed' : 'pointer' }}><FaArchive style={{ marginRight: 5 }} />Archive Selected</button>
            <button className="dashboard-btn" onClick={bulkDelete} disabled={selected.length === 0} style={{ background: '#e53935', color: '#fff', borderRadius: 6, padding: '6px 10px', border: 'none', fontSize: 14, opacity: selected.length === 0 ? 0.5 : 1, cursor: selected.length === 0 ? 'not-allowed' : 'pointer' }}><FaTrash style={{ marginRight: 5 }} />Delete Selected</button>
            <button className="dashboard-btn" onClick={() => setStarredOnly(s => !s)} style={{ background: starredOnly ? '#ffb300' : '#fff', color: starredOnly ? '#fff' : '#ffb300', borderRadius: 6, padding: '6px 10px', border: '1px solid #ffb300', fontSize: 14 }}>{starredOnly ? <FaStar style={{ marginRight: 5 }} /> : <FaRegStar style={{ marginRight: 5 }} />}Starred</button>
            <button className="dashboard-btn" onClick={() => setImportantOnly(s => !s)} style={{ background: importantOnly ? '#e53935' : '#fff', color: importantOnly ? '#fff' : '#e53935', borderRadius: 6, padding: '6px 10px', border: '1px solid #e53935', fontSize: 14 }}><FaExclamationCircle style={{ marginRight: 5 }} />Important</button>
          </div>
          {/* ...existing code... (rest of the content remains unchanged) */}
          {/* Search Bar with icon on the right, persistent value */}
          <div className="dashboard-search" style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 0, position: 'relative', width: 340 }}>
            <input
              ref={searchInputRef}
              placeholder="Search messages..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                borderRadius: '6px',
                border: '1px solid #ddd',
                padding: 8,
                fontSize: 15,
                width: 280,
                outline: 'none',
                background: 'var(--input-bg, #fff)',
                color: 'var(--input-color, #222)',
                boxShadow: '0 1px 4px #e3e3e3',
                marginRight: 12,
                transition: 'background 0.2s, color 0.2s',
              }}
            />
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: '6px',
                height: 32,
                width: 32,
                cursor: 'pointer',
                position: 'relative',
                zIndex: 2,
                boxShadow: '0 1px 4px #e3e3e3',
                transition: 'background 0.2s',
              }}
              onClick={() => searchInputRef.current && searchInputRef.current.focus()}
            >
              <FaSearch style={{ color: '#1976d2', fontSize: 13 }} />
            </span>
          </div>
          {/* ...existing code... (rest of the content remains unchanged) */}
          {/* Message List */}
          {loading ? (
            <div style={{ color: '#888', textAlign: 'center', padding: 32, background: '#fff', borderRadius: 8, fontSize: 18, boxShadow: '0 1px 4px #e3e3e3' }}>
              <FaInbox style={{ fontSize: 32, marginBottom: 8 }} />
              <div>Loading messages...</div>
            </div>
          ) : fetchError ? (
            <div style={{ color: '#e53935', textAlign: 'center', padding: 32, background: '#fff', borderRadius: 8, fontSize: 18, boxShadow: '0 1px 4px #e3e3e3' }}>
              <FaExclamationCircle style={{ fontSize: 32, marginBottom: 8 }} />
              <div>{fetchError}</div>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ color: '#888', textAlign: 'center', padding: 32, background: '#fff', borderRadius: 8, fontSize: 18, boxShadow: '0 1px 4px #e3e3e3' }}>
              <FaInbox style={{ fontSize: 32, marginBottom: 8 }} />
              <div>No messages yet. Your messages and notifications will appear here.</div>
            </div>
          ) : (
            <table style={{ width: '100%', background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #e3e3e3', marginBottom: 18, borderCollapse: 'separate', borderSpacing: 0 }}>
              <colgroup>
                <col style={{ width: '4%' }} />
                <col style={{ width: '6%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '40%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>
              <thead style={{ background: '#e3eaf2' }}>
                <tr>
                  <th></th>
                  <th>Star</th>
                  <th>Important</th>
                  <th>From</th>
                  <th>Subject & Content</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages
                  .map((m, idx) => ({ ...m, idx }))
                  .filter(m => (starredOnly ? m.starred : true) && (importantOnly ? m.important : true))
                  .filter(m => m.subject.toLowerCase().includes(search.toLowerCase()) || m.from.toLowerCase().includes(search.toLowerCase()) || m.content.toLowerCase().includes(search.toLowerCase()))
                  .map((m, i) => (
                    <tr
                      key={m.idx}
                      className={m.read ? '' : 'unread'}
                      style={{
                        background: m.read ? (i % 2 === 0 ? 'var(--card-bg, #f9fbfd)' : 'var(--card-bg-alt, #fff)') : 'var(--card-bg-unread, #fffbe7)',
                        fontWeight: m.read ? 400 : 600,
                        borderBottom: '1px solid var(--card-border, #f0f0f0)',
                        verticalAlign: 'middle',
                        height: 88,
                        minHeight: 88,
                        boxSizing: 'border-box',
                        boxShadow: selected.includes(m.idx)
                          ? '0 0 0 2px var(--selected-outline, #1976d2)' : 'none',
                        transition: 'box-shadow 0.2s, background 0.2s',
                      }}
                    >
                      <td style={{ textAlign: 'center' }}>
                        <input type="checkbox" checked={selected.includes(m.idx)} onChange={() => toggleSelect(m.idx)} />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button onClick={() => toggleStar(m.idx)} style={{ background: 'none', border: 'none', color: m.starred ? '#ffb300' : '#bbb', fontSize: 18, cursor: 'pointer' }}>{m.starred ? <FaStar /> : <FaRegStar />}</button>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button onClick={() => toggleImportant(m.idx)} style={{ background: 'none', border: 'none', color: m.important ? '#e53935' : '#bbb', fontSize: 18, cursor: 'pointer' }}>{m.important ? <FaExclamationCircle /> : <FaExclamationCircle />}</button>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: '#1976d2' }}>{m.from}</td>
                      <td style={{
                        textAlign: 'left',
                        cursor: 'pointer',
                        padding: '10px 0',
                        verticalAlign: 'middle',
                        height: 68,
                        minHeight: 68,
                        boxSizing: 'border-box',
                      }} onClick={() => openDetails(m.idx)}>
                        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2, color: 'var(--text-title, #222)', lineHeight: 1.3 }}>{m.subject}</div>
                        <div style={{
                          color: 'var(--text-content, #444)',
                          fontSize: 15,
                          background: 'var(--content-bg, #f7fafc)',
                          borderRadius: 6,
                          padding: '8px 14px',
                          marginTop: 4,
                          marginBottom: 2,
                          maxWidth: 420,
                          minHeight: 32,
                          height: 32,
                          whiteSpace: 'pre-line',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          boxShadow: selected.includes(m.idx)
                            ? '0 0 0 2px var(--selected-outline, #1976d2), 0 1px 2px var(--content-shadow, #e3e3e3)'
                            : '0 1px 2px var(--content-shadow, #e3e3e3)',
                          border: '1px solid var(--content-border, #f0f0f0)',
                          lineHeight: 1.5,
                          boxSizing: 'border-box',
                          display: 'block',
                          backgroundClip: 'padding-box',
                          transition: 'box-shadow 0.2s, background 0.2s',
                        }}>{m.content}</div>
                      </td>
                      <td style={{ textAlign: 'center', fontSize: 14 }}>{m.date}</td>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle', height: 88 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, height: '100%' }}>
                      {!m.read && <button onClick={() => markRead(m.idx)} title="Mark as Read" style={{ background: 'none', border: 'none', color: '#43a047', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaCheck /></button>}
                      <button onClick={() => replyMsg(m.idx)} title="Reply" style={{ background: 'none', border: 'none', color: '#1976d2', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaReply /></button>
                      <button onClick={() => archiveMsg(m.idx)} title="Archive" style={{ background: 'none', border: 'none', color: '#ffb300', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaArchive /></button>
                      <button onClick={() => deleteMsg(m._id)} title="Delete" style={{ background: 'none', border: 'none', color: '#e53935', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTrash /></button>
                    </div>
                  </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
          {/* ...existing code... (rest of the content remains unchanged) */}
          {/* Message Details Modal */}
          {showDetails !== null && messages[showDetails] && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={closeDetails}>
              <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 12px #bbb', padding: 32, minWidth: 340, maxWidth: 480, position: 'relative' }} onClick={e => e.stopPropagation()}>
                <button onClick={closeDetails} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', fontSize: 22, color: '#e53935', cursor: 'pointer' }}><FaTimes /></button>
                <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>{messages[showDetails].subject}</div>
                <div style={{ color: '#1976d2', fontWeight: 600, marginBottom: 4 }}>From: {messages[showDetails].from}</div>
                <div style={{ color: '#888', fontSize: 14, marginBottom: 8 }}>Date: {messages[showDetails].date}</div>
                <div style={{
                  fontSize: 16,
                  marginBottom: 18,
                  color: '#444',
                  background: '#f7fafc',
                  borderRadius: 6,
                  padding: '12px 18px',
                  minHeight: 40,
                  whiteSpace: 'pre-line',
                  boxShadow: '0 1px 2px #e3e3e3',
                  border: '1px solid #f0f0f0',
                  lineHeight: 1.6
                }}>{messages[showDetails].content}</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {!messages[showDetails].read && <button onClick={() => { markRead(showDetails); closeDetails(); }} className="dashboard-btn" style={{ background: '#43a047', color: '#fff', borderRadius: 6, padding: '8px 16px', border: 'none' }}><FaCheck style={{ marginRight: 6 }} />Mark as Read</button>}
                  <button onClick={() => { replyMsg(showDetails); closeDetails(); }} className="dashboard-btn" style={{ background: '#1976d2', color: '#fff', borderRadius: 6, padding: '8px 16px', border: 'none' }}><FaReply style={{ marginRight: 6 }} />Reply</button>
                  <button onClick={() => { archiveMsg(showDetails); closeDetails(); }} className="dashboard-btn" style={{ background: '#ffb300', color: '#fff', borderRadius: 6, padding: '8px 16px', border: 'none' }}><FaArchive style={{ marginRight: 6 }} />Archive</button>
                  <button onClick={() => { deleteMsg(messages[showDetails]._id); closeDetails(); }} className="dashboard-btn" style={{ background: '#e53935', color: '#fff', borderRadius: 6, padding: '8px 16px', border: 'none' }}><FaTrash style={{ marginRight: 6 }} />Delete</button>
                </div>
              </div>
            </div>
          )}
          {/* ...existing code... (rest of the content remains unchanged) */}
          {/* Snackbar for Undo */}
          {snackbar && (
            <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', background: '#1976d2', color: '#fff', borderRadius: 8, padding: '14px 32px', fontWeight: 600, fontSize: 16, boxShadow: '0 2px 8px #bbb', zIndex: 2000, display: 'flex', alignItems: 'center', gap: 18 }}>
              {snackbar.msg}
              {snackbar.undoFn && <button onClick={() => { snackbar.undoFn(); setSnackbar(null); }} style={{ background: '#fff', color: '#1976d2', border: 'none', borderRadius: 6, padding: '6px 18px', fontWeight: 700, cursor: 'pointer' }}>Undo</button>}
              <button onClick={() => setSnackbar(null)} style={{ background: 'none', color: '#fff', border: 'none', fontSize: 18, marginLeft: 8, cursor: 'pointer' }}><FaTimes /></button>
            </div>
          )}
          {/* ...existing code... (rest of the content remains unchanged) */}
          {/* Archived Messages Section */}
          {archive.length > 0 && (
            <div style={{ marginTop: 32, background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #e3e3e3', padding: 18 }}>
              <h3 style={{ color: '#888', fontWeight: 700, marginTop: 0, marginBottom: 12 }}><FaArchive style={{ marginRight: 8 }} />Archived Messages</h3>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr style={{ textAlign: 'center' }}>
                    <th>From</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Content</th>
                  </tr>
                </thead>
                <tbody>
                  {archive.map((m, idx) => (
                    <tr key={idx} style={{ textAlign: 'center', verticalAlign: 'middle', background: idx % 2 === 0 ? '#f9fbfd' : '#fff' }}>
                      <td style={{ fontWeight: 600, color: '#1976d2' }}>{m.from}</td>
                      <td style={{ fontWeight: 700 }}>{m.subject}</td>
                      <td>{m.date}</td>
                      <td style={{
                        textAlign: 'left',
                        color: '#444',
                        background: '#f7fafc',
                        borderRadius: 6,
                        padding: '8px 14px',
                        minWidth: 120,
                        whiteSpace: 'pre-line',
                        boxShadow: '0 1px 2px #e3e3e3',
                        border: '1px solid #f0f0f0',
                        lineHeight: 1.5
                      }}>{m.content}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* Right empty space */}
      <div style={{ width: 24, flexShrink: 0 }} />
    </div>
  );
};

export default MessagePage;
