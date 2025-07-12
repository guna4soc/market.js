import React, { useState, useRef, useEffect } from 'react';
import { FaCommentDots, FaStar, FaRegStar, FaEdit, FaTrash, FaReply, FaFilter, FaSearch, FaCheckCircle, FaTimesCircle, FaUndo, FaUserCircle, FaShareAlt, FaCopy, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import '../components/Dashboard.css';

const API_URL = 'http://localhost:5000/api/feedback';

const FeedbackPage = ({ user }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [form, setForm] = useState({ feedback: '', editIdx: undefined });
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showStarred, setShowStarred] = useState(false);
  const [sortBy, setSortBy] = useState('date-desc');
  const [replyIdx, setReplyIdx] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);

  // Fetch feedback from backend
  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      setFetchError('');
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch feedback');
        setFeedbacks(data);
      } catch (err) {
        setFetchError(err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  // Persist feedbacks
  useEffect(() => {
    // This useEffect is no longer needed as feedbacks are fetched from backend
    // localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(feedbacks));
  }, [feedbacks]);

  // Handlers
  const handleChange = e => setForm({ ...form, feedback: e.target.value });
  const handleRating = r => setRating(r);
  const handleSearch = e => setSearch(e.target.value);
  const handleSort = () => setSortBy(sortBy === 'date-desc' ? 'date-asc' : 'date-desc');
  const handleStar = idx => setFeedbacks(feedbacks.map((f, i) => i === idx ? { ...f, starred: !f.starred } : f));
  const handleCopy = idx => {
    navigator.clipboard.writeText(feedbacks[idx].feedback);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1200);
  };
  const handleShare = idx => {
    if (navigator.share) {
      navigator.share({ text: feedbacks[idx].feedback });
    } else {
      setMessage('Share not supported on this device.');
      setTimeout(() => setMessage(''), 2000);
    }
  };
  const editFeedback = idx => {
    setForm({ feedback: feedbacks[idx].feedback, editIdx: idx });
    setRating(feedbacks[idx].rating);
  };
  const deleteFeedback = async id => {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete feedback');
      setFeedbacks(fbs => fbs.filter(f => f._id !== id));
    } catch (err) {
      setMessage(err.message || 'Failed to delete feedback.');
      setTimeout(() => setMessage(''), 2000);
    }
  };
  const undoDelete = () => {
    // This function is no longer needed as undo is removed
    // if (undoStack.length > 0) {
    //   const { idx, ...rest } = undoStack[0];
    //   const restored = [...feedbacks];
    //   restored.splice(idx, 0, rest);
    //   setFeedbacks(restored);
    //   setUndoStack(undoStack.slice(1));
    //   setShowUndo(false);
    // }
  };
  const filterStatus = status => setFilter(status);
  const submitFeedback = async e => {
    e.preventDefault();
    if (!rating) {
      setMessage('Please provide a rating.');
      setTimeout(() => setMessage(''), 2000);
      return;
    }
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: user?.email || 'Anonymous',
          feedback: form.feedback,
          rating
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit feedback');
      setFeedbacks([data, ...feedbacks]);
      setForm({ feedback: '', editIdx: undefined });
      setRating(0);
      setMessage('Feedback submitted!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage(err.message || 'Failed to submit feedback.');
      setTimeout(() => setMessage(''), 2000);
    }
  };
  const handleReply = idx => {
    setReplyIdx(idx);
    setReplyText(feedbacks[idx].reply || '');
  };
  const submitReply = async idx => {
    try {
      const res = await fetch(`${API_URL}/${feedbacks[idx]._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText, status: 'Reviewed' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error('Failed to send reply');
      setFeedbacks(fbs => fbs.map(f => f._id === feedbacks[idx]._id ? data : f));
      setReplyIdx(null);
      setReplyText('');
      setMessage('Reply sent!');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage(err.message || 'Failed to send reply.');
      setTimeout(() => setMessage(''), 2000);
    }
  };
  const markReviewed = async id => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Reviewed' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error('Failed to mark as reviewed');
      setFeedbacks(fbs => fbs.map(f => f._id === id ? data : f));
    } catch (err) {
      setMessage(err.message || 'Failed to mark as reviewed.');
      setTimeout(() => setMessage(''), 2000);
    }
  };
  const markPending = async id => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Pending' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error('Failed to mark as pending');
      setFeedbacks(fbs => fbs.map(f => f._id === id ? data : f));
    } catch (err) {
      setMessage(err.message || 'Failed to mark as pending.');
      setTimeout(() => setMessage(''), 2000);
    }
  };
  const clearAll = () => {
    // This function is no longer needed as undo is removed
    // setUndoStack(feedbacks.map((f, i) => ({ ...f, idx: i })));
    // setFeedbacks([]);
    // setShowUndo(true);
    // setTimeout(() => setShowUndo(false), 4000);
  };

  // Filter, search, sort
  let shownFeedbacks = feedbacks
    .filter(f => (filter === 'all' ? true : f.status === filter.charAt(0).toUpperCase() + filter.slice(1)))
    .filter(f => (showStarred ? f.starred : true))
    .filter(f => f.feedback.toLowerCase().includes(search.toLowerCase()) || f.user.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === 'date-desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));

  // Export to CSV function
  function exportToCSV() {
    const headers = ['User', 'Feedback', 'Date', 'Status', 'Rating', 'Starred', 'Reply'];
    const rows = feedbacks.map(f => [f.user, f.feedback, f.date, f.status, f.rating, f.starred ? 'Yes' : 'No', f.reply]);
    let csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map(e => e.map(a => '"' + String(a).replace(/"/g, '""') + '"').join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'feedbacks.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="dashboard-container" style={{
      border: '2px solid #e0e0e0',
      borderRadius: 18,
      margin: '32px 20px', // Bit of space left and right
      background: '#fafbfc',
      boxShadow: '0 4px 24px 0 rgba(60,60,60,0.10)',
      padding: '32px 24px 40px 24px',
      width: 'auto',
      minWidth: 340,
      maxWidth: '1100px',
      alignItems: 'flex-start',
      minHeight: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      boxSizing: 'border-box',
      overflow: 'hidden',
      transition: 'box-shadow 0.2s, border 0.2s',
    }}>
      <div className="dashboard-header" style={{ alignItems: 'center', gap: 8, marginLeft: 8, marginBottom: 8, maxWidth: 900 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 28 }}>
          <span>Feedback</span>
          <FaCommentDots size={28} style={{ marginLeft: 10, color: '#2d7a2d' }} />
        </h2>
        <button className="dashboard-btn" style={{ display: 'flex', alignItems: 'center', gap: 4 }} onClick={clearAll} title="Clear All Feedbacks"><FaTrash /> Clear All</button>
      </div>

      <form className="dashboard-form" onSubmit={submitFeedback} style={{ marginBottom: 24, background: 'var(--card-bg)', borderRadius: 12, boxShadow: 'var(--shadow)', padding: 20 }}>
        <textarea
          placeholder="Your feedback..."
          value={form.feedback}
          onChange={handleChange}
          rows={4}
          style={{
            width: '100%',
            borderRadius: 8,
            border: '2.5px solid #ff9800', // medium official color (orange)
            marginBottom: 12,
            padding: 10,
            background: '#f7fafd',
            color: 'var(--text)',
            boxShadow: 'none',
            fontSize: 17,
            transition: 'border-color 0.2s, box-shadow 0.2s',
            outline: 'none',
          }}
          required
        />
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>Rate us: </span>
          {[1,2,3,4,5].map(r => (
            <span key={r} style={{ cursor: 'pointer', color: rating >= r ? '#f1c40f' : '#ccc', fontSize: 22 }} onClick={() => handleRating(r)}>{rating >= r ? <FaStar /> : <FaRegStar />}</span>
          ))}
          {form.editIdx !== undefined && <span style={{ marginLeft: 16, color: '#888' }}>(Editing)</span>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="submit" className="dashboard-btn">{form.editIdx !== undefined ? 'Update' : 'Submit'} Feedback</button>
          {form.editIdx !== undefined && <button type="button" className="dashboard-btn" style={{ background: '#eee', color: '#333' }} onClick={() => { setForm({ feedback: '', editIdx: undefined }); setRating(0); }}>Cancel</button>}
        </div>
      </form>

      {message && <div className="dashboard-alert">{message}</div>}
      {/* {showUndo && (
        <div className="dashboard-alert" style={{ background: '#ffe9b3', color: '#b36b00', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FaUndo /> Feedback deleted. <button className="dashboard-btn" style={{ background: '#fffbe6', color: '#b36b00', padding: '2px 8px', fontSize: 14 }} onClick={undoDelete}>Undo</button>
        </div>
      )} */}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className={`dashboard-btn${filter==='pending' ? ' dashboard-btn-active' : ''}`} onClick={() => filterStatus('pending')}><FaFilter /> Pending</button>
        <button className={`dashboard-btn${filter==='reviewed' ? ' dashboard-btn-active' : ''}`} onClick={() => filterStatus('reviewed')}><FaCheckCircle /> Reviewed</button>
        <button className={`dashboard-btn${filter==='all' ? ' dashboard-btn-active' : ''}`} onClick={() => filterStatus('all')}><FaCommentDots /> All</button>
        <button className={`dashboard-btn${showStarred ? ' dashboard-btn-active' : ''}`} onClick={() => setShowStarred(s => !s)}><FaStar /> Starred</button>
        <button className="dashboard-btn" style={{ marginLeft: 0 }} onClick={() => exportToCSV()} title="Export Feedbacks">Export</button>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: '#f6faff', borderRadius: 8, border: '1.5px solid #c7d0e2', marginTop: 6, marginBottom: 0, height: 32, minWidth: 180 }}>
          <input type="text" placeholder="Search feedback..." value={search} onChange={handleSearch} style={{ border: 'none', outline: 'none', background: 'transparent', color: 'var(--text)', padding: '2px 10px', minWidth: 120, borderRadius: 8, fontSize: 15, height: 28 }} />
          <FaSearch style={{ color: '#888', marginRight: 8, marginLeft: 0, fontSize: 16, cursor: 'pointer' }} />
        </div>
        <button className="dashboard-btn" style={{ marginLeft: 8 }} onClick={handleSort} title="Sort by date">
          {sortBy === 'date-desc' ? <FaSortAmountDown /> : <FaSortAmountUp />}
        </button>
      </div>

      <div style={{ background: 'var(--card-bg)', borderRadius: 12, boxShadow: 'var(--shadow)', padding: 20 }}>
        <h3 style={{ marginBottom: 16, color: 'var(--primary)', fontWeight: 700, fontSize: 22, letterSpacing: 0.2 }}>Feedback List</h3>
        {loading ? (
          <p style={{ color: '#888' }}>Loading feedbacks...</p>
        ) : fetchError ? (
          <p style={{ color: 'red' }}>{fetchError}</p>
        ) : shownFeedbacks.length === 0 ? (
          <p style={{ color: '#888' }}>No feedback found.</p>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: 'white', borderRadius: 10, boxShadow: '0 2px 8px 0 rgba(60,60,60,0.06)' }}>
              <thead>
                <tr style={{ background: '#f5f6fa', color: '#333', textAlign: 'left', fontWeight: 600, fontSize: 16 }}>
                  <th style={{ padding: '14px 10px', borderBottom: '2px solid #e0e0e0', minWidth: 110, textAlign: 'left' }}>User</th>
                  <th style={{ padding: '14px 10px', borderBottom: '2px solid #e0e0e0', minWidth: 220, textAlign: 'left' }}>Feedback</th>
                  <th style={{ padding: '14px 10px', borderBottom: '2px solid #e0e0e0', minWidth: 90, textAlign: 'center' }}>Rating</th>
                  <th style={{ padding: '14px 10px', borderBottom: '2px solid #e0e0e0', minWidth: 90, textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '14px 10px', borderBottom: '2px solid #e0e0e0', minWidth: 90, textAlign: 'center' }}>Date</th>
                  <th style={{ padding: '14px 10px', borderBottom: '2px solid #e0e0e0', minWidth: 180, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shownFeedbacks.map((f, idx) => (
                  <tr key={f._id || idx} style={{ background: idx % 2 === 0 ? '#fcfcfd' : '#f7f8fa', borderRadius: 8, boxShadow: idx % 2 === 0 ? '0 1px 0 #f0f0f0' : 'none', verticalAlign: 'middle' }}>
                    <td style={{ padding: '13px 10px', verticalAlign: 'middle', minWidth: 110 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FaUserCircle style={{ color: '#888', fontSize: 22 }} />
                        <span style={{ fontWeight: 500, fontSize: 15 }}>{f.user}</span>
                      </div>
                    </td>
                    <td style={{ padding: '13px 10px', verticalAlign: 'middle', minWidth: 220, maxWidth: 340 }}>
                      <div style={{ whiteSpace: 'pre-line', wordBreak: 'break-word', fontSize: 15, color: '#222', lineHeight: 1.5 }}>{f.feedback}</div>
                      {f.reply && (
                        <div style={{ marginTop: 8, background: '#f6f6f6', borderRadius: 6, padding: 8, color: '#2d7a2d', fontSize: 14 }}>
                          <FaReply style={{ marginRight: 4 }} /> <b>Reply:</b> {f.reply}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '13px 10px', textAlign: 'center', verticalAlign: 'middle', minWidth: 90 }}>
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                        {[1,2,3,4,5].map(r => (
                          <span key={r} style={{ color: f.rating >= r ? '#f1c40f' : '#ccc', fontSize: 18 }}>{f.rating >= r ? <FaStar /> : <FaRegStar />}</span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '13px 10px', textAlign: 'center', verticalAlign: 'middle', minWidth: 90 }}>
                      <span style={{ color: f.status === 'Reviewed' ? '#2d7a2d' : '#b36b00', fontWeight: 600, fontSize: 15 }}>{f.status}</span>
                    </td>
                    <td style={{ padding: '13px 10px', textAlign: 'center', verticalAlign: 'middle', minWidth: 90, fontSize: 15 }}>{f.date}</td>
                    <td style={{ padding: '13px 10px', textAlign: 'center', verticalAlign: 'middle', minWidth: 180 }}>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 6,
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexWrap: 'nowrap',
                        minHeight: 40,
                        padding: '2px 0',
                        background: 'transparent',
                        borderRadius: 6,
                        boxShadow: 'none',
                      }}>
                        <button className="dashboard-icon-btn" title="Star" style={{ background: 'none', border: 'none', padding: 0, margin: 0 }} onClick={() => handleStar(feedbacks.indexOf(f))}>{f.starred ? <FaStar style={{ color: '#f1c40f' }} /> : <FaRegStar style={{ color: '#aaa' }} />}</button>
                        <button className="dashboard-icon-btn" title="Edit" style={{ background: 'none', border: 'none', padding: 0, margin: 0 }} onClick={() => editFeedback(feedbacks.indexOf(f))}><FaEdit /></button>
                        <button className="dashboard-icon-btn" title="Delete" style={{ background: 'none', border: 'none', padding: 0, margin: 0 }} onClick={() => deleteFeedback(f._id)}><FaTrash /></button>
                        <button className="dashboard-icon-btn" title="Copy" style={{ background: 'none', border: 'none', padding: 0, margin: 0 }} onClick={() => handleCopy(feedbacks.indexOf(f))}>{copiedIdx === feedbacks.indexOf(f) ? <FaCheckCircle style={{ color: '#2d7a2d' }} /> : <FaCopy />}</button>
                        <button className="dashboard-icon-btn" title="Share" style={{ background: 'none', border: 'none', padding: 0, margin: 0 }} onClick={() => handleShare(feedbacks.indexOf(f))}><FaShareAlt /></button>
                        <button className="dashboard-icon-btn" title="Reply" style={{ background: 'none', border: 'none', padding: 0, margin: 0 }} onClick={() => handleReply(feedbacks.indexOf(f))}><FaReply /></button>
                        {f.status === 'Pending' ? (
                          <button className="dashboard-icon-btn" title="Mark as Reviewed" style={{ background: 'none', border: 'none', padding: 0, margin: 0 }} onClick={() => markReviewed(f._id)}><FaCheckCircle style={{ color: '#2d7a2d' }} /></button>
                        ) : (
                          <button className="dashboard-icon-btn" title="Mark as Pending" style={{ background: 'none', border: 'none', padding: 0, margin: 0 }} onClick={() => markPending(f._id)}><FaTimesCircle style={{ color: '#b36b00' }} /></button>
                        )}
                      </div>
                      {replyIdx === feedbacks.indexOf(f) && (
                        <div style={{ marginTop: 8, background: 'var(--input-bg)', borderRadius: 6, padding: 8 }}>
                          <textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={2} style={{ width: '100%', borderRadius: 4, border: '1px solid var(--border)', marginBottom: 6, padding: 4, background: 'var(--input-bg)', color: 'var(--text)' }} placeholder="Type your reply..." />
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="dashboard-btn" style={{ fontSize: 14, padding: '2px 10px' }} onClick={() => submitReply(feedbacks.indexOf(f))}>Send</button>
                            <button className="dashboard-btn" style={{ fontSize: 14, background: '#eee', color: '#333', padding: '2px 10px' }} onClick={() => { setReplyIdx(null); setReplyText(''); }}>Cancel</button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: 32, background: 'var(--card-bg)', borderRadius: 12, boxShadow: 'var(--shadow)', padding: 20, maxWidth: 900, marginLeft: 8 }}>
        <h3 style={{ color: 'var(--primary)', marginBottom: 12, textAlign: 'left', fontWeight: 700 }}>Feedback Analytics</h3>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'nowrap', justifyContent: 'flex-start', alignItems: 'stretch' }}>
          <div style={{ flex: 1, minWidth: 120, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#f1c40f', lineHeight: 1, textAlign: 'center', width: 80 }}>{feedbacks.length}</div>
            <div style={{ color: '#888', fontWeight: 500, marginTop: 4, textAlign: 'center' }}>Total Feedbacks</div>
          </div>
          <div style={{ flex: 1, minWidth: 120, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#2d7a2d', lineHeight: 1, textAlign: 'center', width: 80 }}>{feedbacks.filter(f => f.status === 'Reviewed').length}</div>
            <div style={{ color: '#888', fontWeight: 500, marginTop: 4, textAlign: 'center' }}>Reviewed</div>
          </div>
          <div style={{ flex: 1, minWidth: 120, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#b36b00', lineHeight: 1, textAlign: 'center', width: 80 }}>{feedbacks.filter(f => f.status === 'Pending').length}</div>
            <div style={{ color: '#888', fontWeight: 500, marginTop: 4, textAlign: 'center' }}>Pending</div>
          </div>
          <div style={{ flex: 1, minWidth: 120, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#f1c40f', lineHeight: 1, textAlign: 'center', width: 80 }}>{(feedbacks.reduce((a, f) => a + (f.rating || 0), 0) / (feedbacks.length || 1)).toFixed(1)}</div>
            <div style={{ color: '#888', fontWeight: 500, marginTop: 4, textAlign: 'center' }}>Avg. Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
