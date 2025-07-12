import React, { useState, useEffect, useRef } from 'react';
import { FaQuestionCircle, FaThumbsUp, FaThumbsDown, FaCheckCircle, FaTimesCircle, FaTicketAlt, FaSearch, FaInbox, FaChevronDown, FaChevronUp, FaPaperclip, FaDownload, FaUserCircle, FaTrash } from 'react-icons/fa';
import '../components/Dashboard.css';

const initialFaqs = [
  { q: 'How do I add products to my cart?', a: 'Go to the Market page and click "Add to Cart" on any product.', category: 'Shopping', up: 2, down: 0 },
  { q: 'How do I contact support?', a: 'Use the contact form below or email support@marketjs.com.', category: 'Support', up: 1, down: 0 },
  { q: 'How do I change my password?', a: 'Go to Settings > Profile and update your password.', category: 'Account', up: 0, down: 0 },
];

const TICKET_STORAGE_KEY = 'marketjs_tickets';
const API_URL = 'http://localhost:5000/api/help';

const HelpPage = () => {
  // --- State and Hooks ---
  // All hooks and logic must be declared here, before return
  const [faqs, setFaqs] = useState(initialFaqs);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [msg, setMsg] = useState('');
  const [expanded, setExpanded] = useState([]);
  const [tickets, setTickets] = useState([]); // No localStorage, backend only if needed
  const [ticketStatus, setTicketStatus] = useState({});
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [faqFeedback, setFaqFeedback] = useState({});
  const [showGuides, setShowGuides] = useState(false);
  const [showContactOptions, setShowContactOptions] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const ticketId = useRef(1);

  useEffect(() => {
    localStorage.setItem(TICKET_STORAGE_KEY, JSON.stringify(tickets));
  }, [tickets]);

  // FAQ Filtering
  const categories = ['all', ...Array.from(new Set(initialFaqs.map(f => f.category)))];
  const filteredFaqs = faqs.filter(f => (category === 'all' ? true : f.category === category) && (f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase())));

  // FAQ Feedback
  const handleFaqFeedback = (idx, type) => {
    setFaqs(faqs.map((f, i) => i === idx ? { ...f, [type]: (f[type] || 0) + 1 } : f));
    setFaqFeedback({ ...faqFeedback, [idx]: type });
  };

  // Support Ticket
  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    else if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email address.';
    if (!form.message.trim()) errs.message = 'Message is required.';
    else if (form.message.trim().length < 5) errs.message = 'Message must be at least 5 characters.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submitForm = async e => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit support request');
      setMsg('Support request sent!');
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg(err.message || 'Failed to submit support request.');
      setTimeout(() => setMsg(''), 2000);
    }
  };
  const closeTicket = id => setTickets(tickets.map(t => t.id === id ? { ...t, status: 'Closed' } : t));
  const reopenTicket = id => setTickets(tickets.map(t => t.id === id ? { ...t, status: 'Open' } : t));

  // Chat Simulation
  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    setChatMessages([...chatMessages, { from: 'user', text: chatInput }]);
    setChatInput('');
    setTimeout(() => {
      setChatMessages(msgs => [...msgs, { from: 'support', text: 'Thank you for reaching out! Our team will get back to you soon.' }]);
    }, 1200);
  };

  // FAQ Expand
  const toggleExpand = idx => setExpanded(expanded.includes(idx) ? expanded.filter(i => i !== idx) : [...expanded, idx]);

  // Help Guides
  const guides = [
    { title: 'Getting Started', content: 'Learn how to register, set up your profile, and start using the platform.' },
    { title: 'Buying & Selling', content: 'Step-by-step guide to buying and selling products securely.' },
    { title: 'Account Security', content: 'Tips to keep your account safe, enable 2FA, and recognize phishing.' },
    { title: 'Troubleshooting', content: 'Common issues and how to resolve them quickly.' },
  ];

  // Resource Links
  const resources = [
    { name: 'User Manual (PDF)', url: '/docs/user-manual.pdf' },
    { name: 'Video Tutorials', url: 'https://www.youtube.com/playlist?list=PL-marketjs-tutorials' },
    { name: 'Community Forum', url: 'https://community.marketjs.com' },
    { name: 'API Documentation', url: '/docs/api-docs.html' },
  ];

  // Contact Options
  const contactOptions = [
    { type: 'Email', value: 'support@marketjs.com', icon: <FaInbox /> },
    { type: 'Phone', value: '+1-800-555-1234', icon: <FaUserCircle /> },
    { type: 'Live Chat', value: 'Available 9am-6pm', icon: <FaInbox /> },
  ];

  // SupportForm with basic validation
  function SupportForm({ form, errors, onChange, onSubmit, msg }) {
    return (
      <form className="dashboard-form" onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }} noValidate>
        <label>Name:
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            autoComplete="off"
            style={{ outline: 'none', border: '1.5px solid #d0d7e2', borderRadius: 6, padding: 8, fontSize: 15, boxSizing: 'border-box', background: '#fff', transition: 'border-color 0.2s' }}
          />
          {errors.name && <span style={{ color: '#b30000', fontSize: 13, marginLeft: 8 }}>{errors.name}</span>}
        </label>
        <label>Email:
          <input
            name="email"
            value={form.email}
            onChange={onChange}
            autoComplete="off"
            style={{ outline: 'none', border: '1.5px solid #d0d7e2', borderRadius: 6, padding: 8, fontSize: 15, boxSizing: 'border-box', background: '#fff', transition: 'border-color 0.2s' }}
          />
          {errors.email && <span style={{ color: '#b30000', fontSize: 13, marginLeft: 8 }}>{errors.email}</span>}
        </label>
        <label>Message:
          <textarea
            name="message"
            value={form.message}
            onChange={onChange}
            rows={3}
            style={{ outline: 'none', border: '1.5px solid #d0d7e2', borderRadius: 6, padding: 8, fontSize: 15, boxSizing: 'border-box', background: '#fff', transition: 'border-color 0.2s' }}
          />
          {errors.message && <span style={{ color: '#b30000', fontSize: 13, marginLeft: 8 }}>{errors.message}</span>}
        </label>
        <button type="submit" className="dashboard-btn">Send</button>
        {msg && <div className="dashboard-alert">{msg}</div>}
      </form>
    );
  }

  // --- Main Render ---
  // Main layout: add empty space between sidebar and main card, and wrap main card for shadow and border radius
  return (
    <div className="dashboard-outer" style={{ display: 'flex', minHeight: '100vh', background: '#f4f7fa' }}>
      {/* Sidebar is rendered outside this component. Add a visible empty space for separation. */}
      <div style={{ width: 24, minWidth: 24, flexShrink: 0 }} />
      {/* Main content wrapper with left margin for sidebar gap and centered content */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', paddingLeft: 0, paddingRight: 0 }}>
        <div style={{ width: '100%', maxWidth: 1000, display: 'flex', justifyContent: 'center' }}>
          <div className="dashboard-main-card" style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', padding: 32, margin: '32px 0', width: '100%' }}>
            {/* ...existing code for header, chat, search, guides, resources, contacts, faqs, support form... */}
            <div className="dashboard-header" style={{ alignItems: 'center', gap: 8 }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span>Help & Support</span> <FaQuestionCircle size={28} /></h2>
              <button className="dashboard-btn" style={{ marginLeft: 'auto' }} onClick={() => setShowChat(s => !s)}><FaInbox /> {showChat ? 'Close Chat' : 'Live Chat'}</button>
            </div>
            {showChat && (
              <div style={{ background: 'var(--card-bg)', borderRadius: 10, boxShadow: 'var(--shadow)', padding: 16, margin: '16px 0', maxWidth: 400, position: 'relative' }}>
                <div style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 8 }}>
                  {chatMessages.length === 0 && <div style={{ color: '#888' }}>Start a conversation with support...</div>}
                  {chatMessages.map((m, i) => (
                    <div key={i} style={{ textAlign: m.from === 'user' ? 'right' : 'left', margin: '6px 0' }}>
                      <span style={{ display: 'inline-block', background: m.from === 'user' ? '#e0f7fa' : '#f6f6f6', color: '#333', borderRadius: 8, padding: '6px 12px', maxWidth: 220 }}>{m.text}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message..." style={{ flex: 1, borderRadius: 6, border: '1px solid var(--border)', padding: 6 }} />
                  <button className="dashboard-btn" style={{ padding: '6px 14px' }} onClick={handleChatSend}>Send</button>
                </div>
              </div>
            )}
            {/* Search bar with icon on the right inside the input */}
            <div className="dashboard-search" style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  placeholder="Search FAQs..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="dashboard-search-input"
                  style={{
                    width: '100%',
                    padding: '6px 36px 6px 10px',
                    boxSizing: 'border-box',
                  }}
                />
                <FaSearch style={{ color: '#888', position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
              <select value={category} onChange={e => setCategory(e.target.value)} style={{ borderRadius: 6, border: '1px solid var(--border)', padding: 6 }}>
                {categories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
              </select>
              <button className="dashboard-btn" style={{ fontSize: 14, padding: '2px 10px' }} onClick={() => setShowGuides(g => !g)}>{showGuides ? 'Hide Guides' : 'Show Guides'}</button>
              <button className="dashboard-btn" style={{ fontSize: 14, padding: '2px 10px' }} onClick={() => setShowResources(r => !r)}>{showResources ? 'Hide Resources' : 'Resources'}</button>
              <button className="dashboard-btn" style={{ fontSize: 14, padding: '2px 10px' }} onClick={() => setShowContactOptions(c => !c)}>{showContactOptions ? 'Hide Contacts' : 'Contact Options'}</button>
            </div>
            {showGuides && (
              <div style={{ background: 'var(--card-bg)', borderRadius: 10, boxShadow: 'var(--shadow)', padding: 16, marginBottom: 18 }}>
                <h3 style={{ marginBottom: 10 }}>Help Guides</h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {guides.map((g, i) => (
                    <li key={i} style={{ fontWeight: 500, color: '#2d7a2d', background: 'var(--input-bg)', borderRadius: 6, padding: 10 }}>{g.title}: <span style={{ color: '#333', fontWeight: 400 }}>{g.content}</span></li>
                  ))}
                </ul>
              </div>
            )}
            {showResources && (
              <div style={{ background: 'var(--card-bg)', borderRadius: 10, boxShadow: 'var(--shadow)', padding: 16, marginBottom: 18 }}>
                <h3 style={{ marginBottom: 10 }}>Resources</h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {resources.map((r, i) => (
                    <li key={i}><a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff', textDecoration: 'underline' }}>{r.name}</a></li>
                  ))}
                </ul>
              </div>
            )}
            {showContactOptions && (
              <div style={{ background: 'var(--card-bg)', borderRadius: 10, boxShadow: 'var(--shadow)', padding: 16, marginBottom: 18 }}>
                <h3 style={{ marginBottom: 10 }}>Contact Options</h3>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {contactOptions.map((c, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {c.icon} <span style={{ fontWeight: 500 }}>{c.type}:</span> <span>{c.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="dashboard-faqs" style={{ marginBottom: 32 }}>
              <h3>FAQs</h3>
              {filteredFaqs.length === 0 ? <p>No FAQs found.</p> : (
                <ul className="dashboard-list" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filteredFaqs.map((f, idx) => (
                    <li key={idx} className="dashboard-list-item" style={{ background: 'var(--card-bg)', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.03)', padding: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ fontWeight: 600, fontSize: 16 }}><FaChevronDown style={{ marginRight: 6, transform: expanded.includes(idx) ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />{f.q}</div>
                        <button className="dashboard-btn" style={{ fontSize: 14, padding: '2px 12px' }} onClick={() => toggleExpand(idx)}>{expanded.includes(idx) ? 'Hide' : 'Show'}</button>
                      </div>
                      {expanded.includes(idx) && (
                        <div style={{ marginTop: 8, marginLeft: 24 }}>
                          <div style={{ marginBottom: 8 }}><strong>A:</strong> {f.a}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ color: '#888', fontSize: 13 }}>Was this helpful?</span>
                            <button className="dashboard-icon-btn" style={{ color: faqFeedback[idx]==='up' ? '#2d7a2d' : '#888' }} disabled={faqFeedback[idx]} onClick={() => handleFaqFeedback(idx, 'up')}><FaThumbsUp /> {f.up || 0}</button>
                            <button className="dashboard-icon-btn" style={{ color: faqFeedback[idx]==='down' ? '#b36b00' : '#888' }} disabled={faqFeedback[idx]} onClick={() => handleFaqFeedback(idx, 'down')}><FaThumbsDown /> {f.down || 0}</button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="dashboard-support-form" style={{ background: 'var(--card-bg)', borderRadius: 10, boxShadow: 'var(--shadow)', padding: 20 }}>
              <h3 style={{ marginBottom: 10 }}>Contact Support</h3>
              <SupportForm form={form} errors={errors} onChange={handleFormChange} onSubmit={submitForm} msg={msg} />
              {tickets.length > 0 && (
                <div style={{ marginTop: 24 }}>
                  <h3>Support Ticket History</h3>
                  <ul className="dashboard-list" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {tickets.map((t, idx) => (
                      <li key={t.id || idx} className="dashboard-list-item" style={{ background: 'var(--input-bg)', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.03)', padding: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FaTicketAlt style={{ color: '#888' }} />
                          <span style={{ fontWeight: 600 }}>{t.name}</span>
                          <span style={{ color: '#888', fontSize: 13 }}>{t.email}</span>
                          <span style={{ color: '#888', fontSize: 13 }}>{t.date}</span>
                          <span style={{ fontWeight: 500, color: t.status === 'Open' ? '#2d7a2d' : '#b36b00', marginLeft: 8 }}>{t.status}</span>
                          <button className="dashboard-btn" style={{ fontSize: 13, padding: '2px 8px', color: '#b30000', background: 'none', border: 'none' }} title="Delete Ticket" onClick={() => {
                            // Inline deleteTicket to ensure it's in scope
                            setTickets(tickets => tickets.filter(ticket => ticket.id !== t.id));
                          }}><FaTrash /></button>
                        </div>
                        <div style={{ marginLeft: 32 }}>{t.message}</div>
                        <div style={{ display: 'flex', gap: 8, marginLeft: 32, marginTop: 4 }}>
                          {t.status === 'Open' ? (
                            <button className="dashboard-btn" style={{ fontSize: 13, padding: '2px 10px' }} onClick={() => closeTicket(t.id)}><FaCheckCircle /> Close</button>
                          ) : (
                            <button className="dashboard-btn" style={{ fontSize: 13, padding: '2px 10px' }} onClick={() => reopenTicket(t.id)}><FaTimesCircle /> Reopen</button>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Right side empty space for symmetry */}
        <div style={{ width: 24, minWidth: 24, flexShrink: 0 }} />
      </div>
    </div>
  );

}

export default HelpPage;
