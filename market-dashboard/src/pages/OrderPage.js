import React, { useState, useEffect } from 'react';
import { FaUserCheck, FaUserClock, FaUserAlt, FaUserTie, FaSearch, FaEye, FaCheck, FaTimes, FaPhone, FaEnvelope, FaFileExport, FaTag, FaClipboardList, FaStickyNote, FaUser, FaSquare, FaCheckSquare, FaPlus, FaEdit } from 'react-icons/fa';
import '../components/Dashboard.css';

const API_URL = 'http://localhost:5000/api/order';

const initialOrders = [
  { name: 'Suman', goods: 'Carrot (5)', status: 'Accept', icon: <FaUserCheck />, time: '6:55 AM', details: 'Order placed for 5 carrots. Address: 123 Main St.', contact: 'suman@gmail.com', phone: '9876543210', tags: ['Urgent'], notes: 'Deliver before 8am.' },
  { name: 'Naveen', goods: 'Fruits', status: 'Accept', icon: <FaUserClock />, time: '6:50 AM', details: 'Order for mixed fruits. Address: 456 Oak Ave.', contact: 'naveen@outlook.com', phone: '9123456789', tags: ['Gift'], notes: '' },
  { name: 'Ariana', goods: 'Table 4*4', status: 'Accepted', icon: <FaUserAlt />, time: '6:48 AM', details: 'Order for 1 table. Address: 789 Pine Rd.', contact: 'ariana@gmail.com', phone: '9988776655', tags: [], notes: '' },
  { name: 'Reshmi', goods: 'Pure Ghee', status: 'Accepted', icon: <FaUserTie />, time: '6:40 AM', details: 'Order for 2 jars. Address: 321 Maple St.', contact: 'reshmi@outlook.com', phone: '9001122334', tags: ['Repeat'], notes: 'Call before delivery.' },
  { name: 'Priya', goods: 'Pizza', status: 'Pending', icon: <FaUserAlt />, time: '6:30 AM', details: 'Order for 1 pizza. Address: 654 Cedar Blvd.', contact: 'priya@gmail.com', phone: '9876512345', tags: [], notes: '' },
  { name: 'Ravi', goods: 'Ice Cream', status: 'Delivered', icon: <FaUserCheck />, time: '6:20 AM', details: 'Order for 3 ice creams. Address: 987 Birch Ln.', contact: 'ravi@outlook.com', phone: '9090909090', tags: ['Gift'], notes: '' },
];

const statusOptions = ['Accept', 'Accepted', 'Pending', 'Delivered', 'Cancelled'];
const tagOptions = ['Urgent', 'Gift', 'Repeat', 'Bulk'];
const PAGE_SIZE = 5;

// Accept user prop
const OrdersPage = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOrder, setModalOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState([]);
  const [note, setNote] = useState('');
  // Add state for edit modal
  const [editModal, setEditModal] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [orderForm, setOrderForm] = useState({ name: '', goods: '', status: 'Pending', time: '', contact: '', phone: '', notes: '' });

  useEffect(() => {
    // Fetch orders from backend
    const fetchOrders = async () => {
      setLoadingOrders(true);
      setFetchError('');
      try {
        let url = API_URL;
        // If not admin, fetch only user orders
        const isAdmin = user?.email && user.email.startsWith('admin');
        if (!isAdmin && user?.email) {
          url += `?user=${encodeURIComponent(user.email)}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');
        setOrders(data);
      } catch (err) {
        setFetchError(err.message || 'Network error');
      } finally {
        setLoadingOrders(false);
      }
    };
    if (user?.email) fetchOrders();
  }, [user]);

  const filtered = orders.filter(o =>
    (((o.user || '').toLowerCase().includes(search.toLowerCase())) ||
      ((o.products && o.products[0] && o.products[0].name) ? o.products[0].name.toLowerCase().includes(search.toLowerCase()) : false) ||
      ((o.status || '').toLowerCase().includes(search.toLowerCase()))) &&
    (statusFilter ? (o.status || '') === statusFilter : true)
  );
  const shown = showAll ? filtered : filtered.slice(0, PAGE_SIZE);

  const openModal = order => { setModalOrder(order); setNote(order.notes || ''); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setModalOrder(null); setNote(''); };
  const updateStatus = (idx, status) => {
    setOrders(orders => orders.map((o, i) => i === idx ? { ...o, status } : o));
    closeModal();
  };
  const exportCSV = () => {
    const csv = [
      ['Name', 'Goods', 'Status', 'Time', 'Contact', 'Phone', 'Tags', 'Notes'],
      ...orders.map(o => [o.name, o.goods, o.status, o.time, o.contact, o.phone, o.tags.join('|'), o.notes])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleSelect = idx => setSelected(sel => sel.includes(idx) ? sel.filter(i => i !== idx) : [...sel, idx]);
  const handleSelectAll = () => setSelected(selected.length === shown.length ? [] : shown.map((_, i) => i));
  const handleBulkStatus = status => {
    setOrders(orders => orders.map((o, i) => selected.includes(i) ? { ...o, status } : o));
    setSelected([]);
  };
  const handleTag = (idx, tag) => {
    setOrders(orders => orders.map((o, i) => i === idx ? { ...o, tags: o.tags.includes(tag) ? o.tags.filter(t => t !== tag) : [...o.tags, tag] } : o));
  };
  const handleNoteSave = idx => {
    setOrders(orders => orders.map((o, i) => i === idx ? { ...o, notes: note } : o));
    closeModal();
  };

  // Edit modal handlers
  const openEditModal = idx => {
    setEditIdx(idx);
    setOrderForm({ ...orders[idx] });
    setEditModal(true);
  };
  const closeEditModal = () => {
    setEditModal(false);
    setEditIdx(null);
    setOrderForm({ name: '', goods: '', status: 'Pending', time: '', contact: '', phone: '', notes: '' });
  };
  const handleFormChange = e => {
    const { name, value } = e.target;
    setOrderForm(f => ({ ...f, [name]: value }));
  };
  // Validation helpers
  const validateName = name => name && name.trim().length > 1;
  const validateContact = contact => /^[^@\s]+@(gmail\.com|outlook\.com)$/.test(contact.trim());
  const validatePhone = phone => /^\d{10}$/.test((phone || '').replace(/[^\d]/g, ''));

  // Auto-fill name based on email (if possible)
  const autofillNameFromEmail = email => {
    if (!email) return '';
    const namePart = email.split('@')[0];
    // Capitalize first letter, replace dots/underscores with spaces
    return namePart.replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  // Update orderForm when contact (email) changes
  useEffect(() => {
    if (orderForm.contact && !orderForm.name) {
      setOrderForm(f => ({ ...f, name: autofillNameFromEmail(f.contact) }));
    }
  }, [orderForm.contact]);

  const [formErrors, setFormErrors] = useState({});

  const handleEditSave = () => {
    const errors = {};
    if (!validateName(orderForm.name)) errors.name = 'Name must be at least 2 letters.';
    if (!validateContact(orderForm.contact)) errors.contact = 'Email must be a valid @gmail.com or @outlook.com address.';
    if (!validatePhone(orderForm.phone)) errors.phone = 'Phone must be exactly 10 digits.';
    if (Object.keys(errors).length) { setFormErrors(errors); return; }
    setOrders(orders => orders.map((o, i) => i === editIdx ? { ...orderForm, time: o.time } : o));
    setFormErrors({});
    closeEditModal();
  };

  // Add button handler
  const handleAddOrder = () => {
    setOrderForm({ name: '', goods: '', status: 'Pending', time: '', contact: '', phone: '', notes: '' });
    setEditIdx(null);
    setEditModal(true);
    setFormErrors({});
  };
  const handleAddSave = () => {
    const errors = {};
    if (!validateName(orderForm.name)) errors.name = 'Name must be at least 2 letters.';
    if (!validateContact(orderForm.contact)) errors.contact = 'Email must be a valid @gmail.com or @outlook.com address.';
    if (!validatePhone(orderForm.phone)) errors.phone = 'Phone must be exactly 10 digits.';
    if (Object.keys(errors).length) { setFormErrors(errors); return; }
    setOrders(orders => [...orders, { ...orderForm, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setFormErrors({});
    closeEditModal();
  };

  // Layout: Add wrapper for equal left/right spacing, clean look, and fix table header and status alignment
  return (
    <div style={{ background: '#f4f7fa', minHeight: '100vh', paddingLeft: 26, paddingRight: 26 }}>
      <div style={{
        maxWidth: 1100,
        margin: '32px auto',
        padding: '0 28px',
        boxSizing: 'border-box',
        borderRadius: 16,
        boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
        border: '1px solid #e5e7eb',
        background: '#fff',
        minHeight: 'calc(100vh - 64px)',
        position: 'relative',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontWeight: 800, letterSpacing: 1 }}>Orders</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="add-product-btn" onClick={exportCSV} style={{ fontWeight: 600, background: '#1976d2', color: '#fff', borderRadius: 6, padding: '8px 18px', border: 'none', display: 'flex', alignItems: 'center', gap: 6 }}><FaFileExport /> Export CSV</button>
          <button className="add-product-btn" onClick={handleAddOrder} style={{ background: '#43a047', color: '#fff', borderRadius: '50%', width: 38, height: 38, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }} title="Add Order"><FaPlus /></button>
          {selected.length > 0 && (
            <>
              <button className="edit-btn" onClick={() => handleBulkStatus('Delivered')} style={{ fontWeight: 600, background: '#43a047', color: '#fff', borderRadius: 6, padding: '8px 18px', border: 'none' }}>Mark Delivered</button>
              <button className="edit-btn" onClick={() => handleBulkStatus('Cancelled')} style={{ fontWeight: 600, background: '#e53935', color: '#fff', borderRadius: 6, padding: '8px 18px', border: 'none' }}>Cancel</button>
            </>
          )}
        </div>
      </div>
      <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 18, background: '#f8fafc', borderRadius: 8, padding: 16, boxShadow: '0 1px 4px #e3e3e3' }}>
        <FaSearch style={{ marginRight: 8, color: '#888' }} />
        <input
          type="text"
          placeholder="Search orders by name, product, or status..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd', width: 260, fontSize: 15 }}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd', fontSize: 15 }}>
          <option value="">All Statuses</option>
          {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="view-all-btn" onClick={() => setShowAll(v => !v)} style={{ fontWeight: 600, background: '#1976d2', color: '#fff', borderRadius: 6, padding: '8px 22px', border: 'none', fontSize: 15, marginLeft: 'auto' }}>{showAll ? 'Show Less' : 'View All'}</button>
      </div>
      <ul className="order-list" style={{ padding: 0, margin: 0, listStyle: 'none' }}>
        {/* Table header row with equal column widths and clear labels */}
        <li style={{ background: '#e3eaf2', borderRadius: 8, padding: 12, display: 'grid', gridTemplateColumns: '48px 1.2fr 1.2fr 1fr 1fr 1.5fr 90px', alignItems: 'center', gap: 0, fontWeight: 700, fontSize: 15, boxShadow: '0 1px 4px #e3e3e3', textAlign: 'center' }}>
          <span style={{ textAlign: 'center' }}>
            <button onClick={handleSelectAll} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22 }}>{selected.length === shown.length ? <FaCheckSquare /> : <FaSquare />}</button>
          </span>
          <span>Customer</span>
          <span>Product</span>
          <span>Status</span>
          <span>Time</span>
          <span>Contact</span>
          <span>Actions</span>
        </li>
        {shown.map((o, i) => (
          <li key={i} className="order-item" style={{ background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #e3e3e3', marginBottom: 12, padding: '14px 10px', display: 'grid', gridTemplateColumns: '48px 1.2fr 1.2fr 1fr 1fr 1.5fr 90px', alignItems: 'center', gap: 0, fontSize: 15, transition: 'box-shadow 0.2s', borderLeft: o.status === 'Delivered' ? '6px solid #43a047' : o.status === 'Cancelled' ? '6px solid #e53935' : '6px solid #1976d2', textAlign: 'center' }}>
            <span>
              <button onClick={() => handleSelect(orders.indexOf(o))} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22 }}>{selected.includes(orders.indexOf(o)) ? <FaCheckSquare /> : <FaSquare />}</button>
            </span>
            <span className="order-name" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>{o.name || '—'}</span>
            <span className="order-goods" style={{ fontWeight: 500 }}>{o.goods || '—'}</span>
            <span className={`order-status ${(o.status || '').toLowerCase()}`}
              style={{
                display: 'inline-block',
                minWidth: 90,
                maxWidth: 110,
                textAlign: 'center',
                fontWeight: 700,
                color: o.status === 'Delivered' ? '#43a047' : o.status === 'Cancelled' ? '#e53935' : '#1976d2',
                background: '#f4f7fa',
                borderRadius: 6,
                padding: '4px 10px',
                margin: '0 auto',
                fontSize: 15,
                letterSpacing: 0.2,
              }}>
              {o.status || '—'}
            </span>
            <span style={{ fontSize: 13, color: '#1976d2', textAlign: 'center' }}>{o.time || '—'}</span>
            <span style={{ fontSize: 13, color: '#1976d2', textAlign: 'center' }}>{o.email || '—'}</span>
            <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
              <button className="edit-btn" onClick={() => openModal(o)} style={{ background: '#1976d2', color: '#fff', borderRadius: '50%', padding: 0, border: 'none', fontSize: 16, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px #e3eaf2', marginRight: 2 }} title="View Order"><FaEye /></button>
              <button className="edit-btn" onClick={() => openEditModal(orders.indexOf(o))} style={{ background: '#ffb300', color: '#fff', borderRadius: '50%', padding: 0, border: 'none', fontSize: 15, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px #e3eaf2' }} title="Edit Order"><FaEdit /></button>
            </span>
          </li>
        ))}
        {shown.length === 0 && <li style={{ color: '#888', textAlign: 'center', padding: 32, background: '#fff', borderRadius: 8, fontSize: 18, boxShadow: '0 1px 4px #e3e3e3' }}>No orders found.</li>}
      </ul>
      {modalOpen && modalOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 36, minWidth: 420, boxShadow: '0 2px 16px #aaa', maxWidth: '90vw' }}>
            <h3 style={{ marginTop: 0, fontWeight: 800, fontSize: 22 }}>Order Details</h3>
            <div style={{ marginBottom: 18 }}><b>Customer:</b> {modalOrder.name || '—'}</div>
            <div style={{ marginBottom: 18 }}><b>Product:</b> {modalOrder.goods || '—'}</div>
            <div style={{ marginBottom: 18 }}><b>Status:</b> {modalOrder.status || '—'}</div>
            <div style={{ marginBottom: 18 }}><b>Time:</b> {modalOrder.time || '—'}</div>
            <div style={{ marginBottom: 18 }}><b>Contact:</b> {modalOrder.email || '—'}</div>
            <div style={{ marginBottom: 18 }}><b>Tags:</b> {tagOptions.map(tag => (
              <button
                key={tag}
                className="edit-btn"
                style={{
                  marginRight: 6,
                  background: modalOrder.tags.includes(tag) ? '#1976d2' : '#e3eaf2',
                  color: modalOrder.tags.includes(tag) ? '#fff' : '#1976d2',
                  fontWeight: 600,
                  borderRadius: 6,
                  padding: '4px 12px',
                  border: 'none',
                }}
                onClick={() => handleTag(orders.indexOf(modalOrder), tag)}
              >
                {tag}
              </button>
            ))}
            </div>
            <div style={{ marginBottom: 18 }}>
              <b>Notes:</b>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                style={{ width: '100%', minHeight: 54, borderRadius: 6, border: '1px solid #ddd', padding: 10, fontSize: 15 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 24 }}>
              {statusOptions.filter(s => s !== modalOrder.status).map(status => (
                <button
                  key={status}
                  className="edit-btn"
                  onClick={() => updateStatus(orders.findIndex(o => o === modalOrder), status)}
                  style={{ fontWeight: 600, background: '#1976d2', color: '#fff', borderRadius: 6, padding: '8px 22px', border: 'none', fontSize: 15 }}
                >
                  {status}
                </button>
              ))}
              <button
                className="edit-btn"
                onClick={() => handleNoteSave(orders.findIndex(o => o === modalOrder))}
                style={{ fontWeight: 600, background: '#43a047', color: '#fff', borderRadius: 6, padding: '8px 22px', border: 'none', fontSize: 15 }}
              >
                <FaStickyNote /> Save Note
              </button>
              <button
                className="delete-btn"
                onClick={closeModal}
                style={{ fontWeight: 600, background: '#e53935', color: '#fff', borderRadius: 6, padding: '8px 22px', border: 'none', fontSize: 15 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit/Add Order Modal */}
      {editModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 10, padding: 36, minWidth: 420, boxShadow: '0 2px 16px #aaa', maxWidth: '90vw' }}>
            <h3 style={{ marginTop: 0, fontWeight: 800, fontSize: 22 }}>{editIdx !== null ? 'Edit Order' : 'Add Order'}</h3>
            <div style={{ marginBottom: 18 }}>
              <b>Name:</b> <input name="name" value={orderForm.name} onChange={handleFormChange} style={{ width: '70%', marginLeft: 8, borderRadius: 6, border: formErrors.name ? '1.5px solid #e53935' : '1px solid #ddd', padding: 8, fontSize: 15 }} />
              {formErrors.name && <span style={{ color: '#e53935', fontSize: 13, marginLeft: 8 }}>{formErrors.name}</span>}
            </div>
            <div style={{ marginBottom: 18 }}>
              <b>Product:</b> <input name="goods" value={orderForm.goods} onChange={handleFormChange} style={{ width: '70%', marginLeft: 8, borderRadius: 6, border: '1px solid #ddd', padding: 8, fontSize: 15 }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <b>Status:</b> <select name="status" value={orderForm.status} onChange={handleFormChange} style={{ width: '50%', marginLeft: 8, borderRadius: 6, border: '1px solid #ddd', padding: 8, fontSize: 15 }}>{statusOptions.map(s => <option key={s} value={s}>{s}</option>)}</select>
            </div>
            <div style={{ marginBottom: 18 }}>
              <b>Contact (Email):</b> <input name="contact" value={orderForm.contact} onChange={handleFormChange} style={{ width: '70%', marginLeft: 8, borderRadius: 6, border: formErrors.contact ? '1.5px solid #e53935' : '1px solid #ddd', padding: 8, fontSize: 15 }} />
              {formErrors.contact && <span style={{ color: '#e53935', fontSize: 13, marginLeft: 8 }}>{formErrors.contact}</span>}
            </div>
            <div style={{ marginBottom: 18 }}>
              <b>Phone:</b> <input name="phone" value={orderForm.phone} onChange={handleFormChange} style={{ width: '70%', marginLeft: 8, borderRadius: 6, border: formErrors.phone ? '1.5px solid #e53935' : '1px solid #ddd', padding: 8, fontSize: 15 }} />
              {formErrors.phone && <span style={{ color: '#e53935', fontSize: 13, marginLeft: 8 }}>{formErrors.phone}</span>}
            </div>
            <div style={{ marginBottom: 18 }}>
              <b>Notes:</b> <textarea name="notes" value={orderForm.notes} onChange={handleFormChange} style={{ width: '100%', minHeight: 54, borderRadius: 6, border: '1px solid #ddd', padding: 10, fontSize: 15 }} />
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', marginTop: 24 }}>
              <button className="edit-btn" onClick={editIdx !== null ? handleEditSave : handleAddSave} style={{ fontWeight: 600, background: '#43a047', color: '#fff', borderRadius: 6, padding: '8px 22px', border: 'none', fontSize: 15 }}>{editIdx !== null ? 'Save' : 'Add'}</button>
              <button className="delete-btn" onClick={closeEditModal} style={{ fontWeight: 600, background: '#e53935', color: '#fff', borderRadius: 6, padding: '8px 22px', border: 'none', fontSize: 15 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default OrdersPage;
