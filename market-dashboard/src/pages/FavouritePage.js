import React, { useState, useEffect } from 'react';
import { FaHeart, FaPlus, FaTrash, FaEdit, FaDownload, FaSortAlphaDown, FaLayerGroup, FaSyncAlt, FaStar, FaRegStar, FaRegCopy, FaShareAlt } from 'react-icons/fa';
import '../components/Dashboard.css';

const API_URL = 'http://localhost:5000/api/favourite';
const DEMO_USER = 'guna4soc@gmail.com'; // Replace with logged-in user email if available

const initialFavourites = [
  { name: 'Organic Carrot', type: 'Product', desc: 'Fresh organic carrots from local farms.' },
  { name: 'Vegetables', type: 'Category', desc: 'All fresh vegetables.' },
];


const FavouritePage = ({ user }) => {
  const userEmail = user?.email || '';
  const [favourites, setFavourites] = useState([]);
  const [loadingFavourites, setLoadingFavourites] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [favForm, setFavForm] = useState({ name: '', type: 'Product', desc: '' });
  const [selected, setSelected] = useState([]);
  const [starred, setStarred] = useState([]); // array of favourite names
  const [copied, setCopied] = useState(null); // for copy feedback
  // Star/unstar a favourite
  const toggleStar = (name) => {
    setStarred(starred => starred.includes(name) ? starred.filter(n => n !== name) : [...starred, name]);
  };

  // Copy favourite info to clipboard
  const copyFavourite = (f) => {
    const text = `${f.name} (${f.type}): ${f.desc}`;
    navigator.clipboard.writeText(text);
    setCopied(f.name);
    setTimeout(() => setCopied(null), 1200);
  };

  // Share favourite (dummy, just alert for now)
  const shareFavourite = (f) => {
    alert(`Share link for ${f.name}: https://marketapp.com/favourite/${encodeURIComponent(f.name)}`);
  };

  useEffect(() => {
    // Fetch favourites from backend
    const fetchFavourites = async () => {
      setLoadingFavourites(true);
      setFetchError('');
      try {
        const res = await fetch(`${API_URL}?user=${encodeURIComponent(userEmail)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch favourites');
        setFavourites(data.map(f => ({ name: f.name, type: f.type, desc: f.description })));
      } catch (err) {
        setFetchError(err.message || 'Network error');
      } finally {
        setLoadingFavourites(false);
      }
    };
    if (userEmail) fetchFavourites();
  }, [userEmail]);

  const filtered = favourites.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.type.toLowerCase().includes(search.toLowerCase())
  );


  // Remove by index for accurate action
  const removeFavourite = (idx) => {
    setFavourites(favourites.filter((_, i) => i !== idx));
    setSelected(selected.filter(i => i !== idx));
  };

  const handleSelect = idx => setSelected(sel => sel.includes(idx) ? sel.filter(i => i !== idx) : [...sel, idx]);
  const handleSelectAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map((_, i) => i));
  const removeSelected = () => {
    // Remove by index in filtered, map to original index
    const toRemove = selected.map(i => favourites.indexOf(filtered[i]));
    setFavourites(favourites.filter((_, i) => !toRemove.includes(i)));
    setSelected([]);
  };

  // Add/Edit modal handlers
  const openAddModal = () => {
    setFavForm({ name: '', type: 'Product', desc: '' });
    setEditIdx(null);
    setModalOpen(true);
  };
  const openEditModal = idx => {
    setFavForm({ ...favourites[idx] });
    setEditIdx(idx);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditIdx(null);
    setFavForm({ name: '', type: 'Product', desc: '' });
  };
  const handleFormChange = e => {
    const { name, value } = e.target;
    setFavForm(f => ({ ...f, [name]: value }));
  };
  const handleSave = async () => {
    if (!favForm.name || !favForm.desc) return;
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userEmail, name: favForm.name, type: favForm.type, description: favForm.desc })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add favourite');
      setFavourites([{ name: data.name, type: data.type, desc: data.description }, ...favourites]);
      closeModal();
    } catch (err) {
      alert(err.message || 'Network error');
    }
  };

  const reorderFavourites = () => {
    setFavourites([...favourites].reverse());
  };
  const sortFavourites = () => {
    setFavourites([...favourites].sort((a, b) => a.name.localeCompare(b.name)));
  };
  const groupByType = () => {
    const grouped = [];
    ['Product', 'Category'].forEach(type => {
      favourites.filter(f => f.type === type).forEach(f => grouped.push(f));
    });
    setFavourites(grouped);
  };
  const exportFavourites = () => {
    const data = JSON.stringify(favourites, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'favourites.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', background: '#f7fafc', minHeight: '100vh' }}>
      {/* Sidebar placeholder (if you have a sidebar, render it here) */}
      <div style={{ width: 24, flexShrink: 0 }} />
      {/* Main Card */}
      <div style={{ flex: 1, maxWidth: '100%', background: 'none', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div className="dashboard-container" style={{ background: 'white', borderRadius: 16, boxShadow: '0 2px 16px #e3e3e3', minHeight: 'calc(100vh - 48px)', padding: 24, margin: '24px 0', display: 'flex', flexDirection: 'column' }}>
          {/* ...existing code... (everything inside the previous dashboard-container) */}
          {/* Dashboard Header */}
          <div className="dashboard-header" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <FaHeart size={28} style={{ marginRight: 8, color: '#e53935' }} />
            <h2 style={{ margin: 0, fontWeight: 800, letterSpacing: 1 }}>Favourites</h2>
            <button onClick={openAddModal} title="Add Favourite" style={{ marginLeft: 'auto', background: '#43a047', color: '#fff', borderRadius: '50%', width: 36, height: 36, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}><FaPlus /></button>
          </div>
          {/* ...existing code... (rest of the content remains unchanged) */}
          <div className="dashboard-search" style={{ marginBottom: 16 }}>
            <input placeholder="Search favourites..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd', width: 260, fontSize: 15 }} />
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
            <button className="dashboard-btn" onClick={reorderFavourites} style={{ background: '#1976d2', color: '#fff', borderRadius: 6, padding: '8px 16px', border: 'none', display: 'flex', alignItems: 'center', gap: 6 }}><FaSyncAlt /> Reorder</button>
            <button className="dashboard-btn" onClick={sortFavourites} style={{ background: '#1976d2', color: '#fff', borderRadius: 6, padding: '8px 16px', border: 'none', display: 'flex', alignItems: 'center', gap: 6 }}><FaSortAlphaDown /> Sort A-Z</button>
            <button className="dashboard-btn" onClick={groupByType} style={{ background: '#1976d2', color: '#fff', borderRadius: 6, padding: '8px 16px', border: 'none', display: 'flex', alignItems: 'center', gap: 6 }}><FaLayerGroup /> Group by Type</button>
            <button className="dashboard-btn" onClick={exportFavourites} style={{ background: '#1976d2', color: '#fff', borderRadius: 6, padding: '8px 16px', border: 'none', display: 'flex', alignItems: 'center', gap: 6 }}><FaDownload /> Export</button>
            {selected.length > 0 && (
              <button className="dashboard-btn" onClick={removeSelected} style={{ background: '#e53935', color: '#fff', borderRadius: 6, padding: '8px 16px', border: 'none', display: 'flex', alignItems: 'center', gap: 6 }}><FaTrash /> Remove Selected</button>
            )}
          </div>
          {filtered.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', padding: 32, background: '#fff', borderRadius: 8, fontSize: 18, boxShadow: '0 1px 4px #e3e3e3' }}>No favourites found. Add products or categories to your favourites for quick access.</p>
          ) : (
            <ul className="dashboard-list" style={{ padding: 0, margin: 0, listStyle: 'none' }}>
              <li style={{ background: '#e3eaf2', borderRadius: 8, padding: 12, display: 'grid', gridTemplateColumns: '36px 1.5fr 1fr 2fr 160px', alignItems: 'center', gap: 0, fontWeight: 700, fontSize: 15, boxShadow: '0 1px 4px #e3e3e3', marginBottom: 8 }}>
                <button onClick={handleSelectAll} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}>{selected.length === filtered.length && filtered.length > 0 ? <FaTrash /> : <FaPlus />}</button>
                Name
                Type
                Description
                Actions
              </li>
              {filtered.map((f, idx) => (
                <li key={idx} className="dashboard-list-item" style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #e3e3e3', marginBottom: 10, padding: '14px 10px', display: 'grid', gridTemplateColumns: '36px 1.5fr 1fr 2fr 160px', alignItems: 'center', gap: 0, fontSize: 15 }}>
                  <input type="checkbox" checked={selected.includes(idx)} onChange={() => handleSelect(idx)} style={{ width: 18, height: 18, accentColor: '#1976d2', margin: 0 }} />
                  <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button onClick={() => toggleStar(f.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: starred.includes(f.name) ? '#ffb300' : '#bbb', fontSize: 18, padding: 0 }} title={starred.includes(f.name) ? 'Unstar' : 'Star'}>
                      {starred.includes(f.name) ? <FaStar /> : <FaRegStar />}
                    </button>
                    {f.name}
                  </span>
                  <span style={{ color: '#1976d2', fontWeight: 600 }}>{f.type}</span>
                  <span style={{ color: '#444' }}>{f.desc}</span>
                  <span style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
                    <button className="dashboard-btn" onClick={() => openEditModal(favourites.indexOf(f))} style={{ background: 'none', color: '#ffb300', borderRadius: '50%', width: 32, height: 32, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }} title="Edit"><FaEdit /></button>
                    <button className="dashboard-btn" onClick={() => removeFavourite(favourites.indexOf(f))} style={{ background: 'none', color: '#e53935', borderRadius: '50%', width: 32, height: 32, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }} title="Remove"><FaTrash /></button>
                    <button className="dashboard-btn" onClick={() => copyFavourite(f)} style={{ background: 'none', color: '#1976d2', borderRadius: '50%', width: 32, height: 32, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }} title="Copy Info"><FaRegCopy /></button>
                    <button className="dashboard-btn" onClick={() => shareFavourite(f)} style={{ background: 'none', color: '#43a047', borderRadius: '50%', width: 32, height: 32, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }} title="Share"><FaShareAlt /></button>
                    {copied === f.name && <span style={{ color: '#43a047', fontWeight: 600, fontSize: 13, marginLeft: 4 }}>Copied!</span>}
                  </span>
                </li>
              ))}
          {/* Feature: Show only starred toggle */}
          <div style={{ margin: '12px 0 0 0', display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#1976d2', fontWeight: 600 }}>Total: {favourites.length}</span>
            {favourites.length > 0 && <button onClick={() => { setFavourites([]); setSelected([]); }} style={{ background: '#e53935', color: '#fff', borderRadius: 6, padding: '4px 14px', border: 'none', fontWeight: 600 }}>Clear All</button>}
            <button onClick={() => setFavourites(favourites.filter(f => starred.includes(f.name)))} style={{ background: '#ffb300', color: '#fff', borderRadius: 6, padding: '4px 14px', border: 'none', fontWeight: 600 }}>Show Only Starred</button>
            <button onClick={() => setFavourites(initialFavourites)} style={{ background: '#1976d2', color: '#fff', borderRadius: 6, padding: '4px 14px', border: 'none', fontWeight: 600 }}>Reset</button>
          </div>
          {/* Feature: Search suggestions dropdown */}
          {search && filtered.length > 0 && (
            <div style={{ position: 'absolute', background: '#fff', border: '1px solid #ddd', borderRadius: 6, boxShadow: '0 2px 8px #e3e3e3', width: 260, zIndex: 10, marginTop: -8, left: 24 }}>
              {filtered.slice(0, 5).map((f, idx) => (
                <div key={idx} style={{ padding: 8, cursor: 'pointer', color: '#1976d2', fontWeight: 600 }} onClick={() => setSearch(f.name)}>
                  {f.name} <span style={{ color: '#888', fontWeight: 400 }}>({f.type})</span>
                </div>
              ))}
            </div>
          )}

          {/* Feature: Quick Add from search */}
          {search && !filtered.some(f => f.name.toLowerCase() === search.toLowerCase()) && (
            <div style={{ position: 'absolute', background: '#fff', border: '1px solid #43a047', borderRadius: 6, boxShadow: '0 2px 8px #e3e3e3', width: 260, zIndex: 10, marginTop: 36, left: 24, color: '#43a047', fontWeight: 600, padding: 8, cursor: 'pointer' }}
              onClick={() => { setFavForm({ name: search, type: 'Product', desc: '' }); setEditIdx(null); setModalOpen(true); }}>
              Add "{search}" to Favourites
            </div>
          )}

          {/* Feature: Show count and clear all */}
          <div style={{ margin: '12px 0 0 0', display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#1976d2', fontWeight: 600 }}>Total: {favourites.length}</span>
            {favourites.length > 0 && <button onClick={() => { setFavourites([]); setSelected([]); }} style={{ background: '#e53935', color: '#fff', borderRadius: 6, padding: '4px 14px', border: 'none', fontWeight: 600 }}>Clear All</button>}
          </div>
            </ul>
          )}

          {/* Add/Edit Modal */}
          {modalOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: '#fff', borderRadius: 10, padding: 36, minWidth: 340, boxShadow: '0 2px 16px #aaa', maxWidth: '90vw' }}>
                <h3 style={{ marginTop: 0, fontWeight: 800, fontSize: 22 }}>{editIdx !== null ? 'Edit Favourite' : 'Add Favourite'}</h3>
                <div style={{ marginBottom: 18 }}>
                  <b>Name:</b> <input name="name" value={favForm.name} onChange={handleFormChange} style={{ width: '70%', marginLeft: 8, borderRadius: 6, border: '1px solid #ddd', padding: 8, fontSize: 15 }} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <b>Type:</b> <select name="type" value={favForm.type} onChange={handleFormChange} style={{ width: '50%', marginLeft: 8, borderRadius: 6, border: '1px solid #ddd', padding: 8, fontSize: 15 }}>
                    <option value="Product">Product</option>
                    <option value="Category">Category</option>
                  </select>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <b>Description:</b> <textarea name="desc" value={favForm.desc} onChange={handleFormChange} style={{ width: '100%', minHeight: 54, borderRadius: 6, border: '1px solid #ddd', padding: 10, fontSize: 15 }} />
                </div>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 24 }}>
                  <button className="dashboard-btn" onClick={handleSave} style={{ fontWeight: 600, background: '#43a047', color: '#fff', borderRadius: 6, padding: '8px 22px', border: 'none', fontSize: 15 }}>{editIdx !== null ? 'Save' : 'Add'}</button>
                  <button className="dashboard-btn" onClick={closeModal} style={{ fontWeight: 600, background: '#e53935', color: '#fff', borderRadius: 6, padding: '8px 22px', border: 'none', fontSize: 15 }}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Right empty space */}
      <div style={{ width: 24, flexShrink: 0 }} />
    </div>
  );
};

export default FavouritePage;
