import React, { useState, useEffect } from 'react';
import { FaShoppingCart, FaTrash, FaSave, FaRupeeSign, FaPlus, FaMinus, FaRegCopy, FaRegHeart, FaHeart, FaShareAlt } from 'react-icons/fa';
import '../components/Dashboard.css';

const API_URL = 'http://localhost:5000/api/cart';
const DEMO_USER = 'guna4soc@gmail.com'; // Replace with logged-in user email if available

const CartPage = ({ user }) => {
  const userEmail = user?.email || '';
  // Cart Persistence (localStorage)
  const [cart, setCart] = useState([]);
  const [loadingCart, setLoadingCart] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [selected, setSelected] = useState([]);
  const [savedForLater, setSavedForLater] = useState(() => {
    const saved = localStorage.getItem('savedForLater');
    if (saved) return JSON.parse(saved);
    return [];
  });
  const [copied, setCopied] = useState(null);
  const [bulkQty, setBulkQty] = useState(1);
  const [showBulkQty, setShowBulkQty] = useState(false);
  const [showPriceHistory, setShowPriceHistory] = useState(null);

  useEffect(() => {
    // Fetch cart from backend
    const fetchCart = async () => {
      setLoadingCart(true);
      setFetchError('');
      try {
        const res = await fetch(`${API_URL}?user=${encodeURIComponent(userEmail)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch cart');
        setCart(data.items || []);
      } catch (err) {
        setFetchError(err.message || 'Network error');
      } finally {
        setLoadingCart(false);
      }
    };
    if (userEmail) fetchCart();
  }, [userEmail]);
  useEffect(() => {
    localStorage.setItem('savedForLater', JSON.stringify(savedForLater));
  }, [savedForLater]);

  const updateCartBackend = async (newCart) => {
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userEmail, items: newCart, total: newCart.reduce((sum, item) => sum + item.price * item.quantity, 0) })
      });
    } catch (err) {
      // Optionally show error
    }
  };

  // Stock check: don't allow quantity > stock
  const updateQuantity = (idx, qty) => {
    if (qty < 1) return;
    const newCart = cart.map((item, i) => {
      if (i === idx) {
        const newQty = Math.min(qty, item.stock ?? 99);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCart(newCart);
    updateCartBackend(newCart);
  };

  // Bulk quantity update for selected
  const updateBulkQuantity = () => {
    const newCart = cart.map((item, i) => selected.includes(i) ? { ...item, quantity: Math.min(bulkQty, item.stock ?? 99) } : item);
    setCart(newCart);
    setShowBulkQty(false);
    setBulkQty(1);
    updateCartBackend(newCart);
  };
  const removeItem = idx => {
    const newCart = cart.filter((_, i) => i !== idx);
    setCart(newCart);
    updateCartBackend(newCart);
  };
  const clearCart = () => {
    setCart([]);
    updateCartBackend([]);
  };
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const applyCoupon = () => {
    if (coupon === 'SAVE10') setDiscount(0.1);
    else if (coupon === 'FREESHIP') setDiscount(0.05);
    else setDiscount(0);
  };
  const saveForLater = idx => {
    setSavedForLater([...savedForLater, { ...cart[idx], saved: true }]);
    setCart(cart.filter((_, i) => i !== idx));
  };
  const moveToCart = idx => {
    setCart([...cart, { ...savedForLater[idx], saved: false }]);
    setSavedForLater(savedForLater.filter((_, i) => i !== idx));
  };
  const selectAll = () => setSelected(cart.map((_, i) => i));
  const removeSelected = () => {
    const newCart = cart.filter((_, i) => !selected.includes(i));
    setCart(newCart);
    updateCartBackend(newCart);
  };
  const toggleFav = idx => setCart(cart.map((item, i) => i === idx ? { ...item, fav: !item.fav } : item));
  const copyInfo = idx => {
    const item = cart[idx];
    navigator.clipboard.writeText(`${item.name} - Qty: ${item.quantity}, Price: ₹${item.price}`);
    setCopied(idx);
    setTimeout(() => setCopied(null), 1200);
  };
  const shareItem = idx => {
    alert(`Share link for ${cart[idx].name}: https://marketapp.com/product/${encodeURIComponent(cart[idx].name)}`);
  };

  // Checkout handler
  const handleCheckout = async () => {
    if (!userEmail) {
      alert('Please log in to checkout.');
      return;
    }
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    try {
      // Create order in backend
      const res = await fetch('http://localhost:5000/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userEmail, products: cart, total })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order');
      // Clear cart
      clearCart();
      alert('Order placed successfully!');
    } catch (err) {
      alert(err.message || 'Failed to place order.');
    }
  };

return (
  <div style={{ background: '#f7fafc', minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
    <div style={{ width: 48, minWidth: 32, maxWidth: 80 }} />
    <div className="dashboard-main-card" style={{ maxWidth: 1100, width: '100%', margin: '32px 0', background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px #e3e3e3', padding: '32px 36px', minHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      <div className="dashboard-header" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <FaShoppingCart size={28} style={{ marginRight: 8, color: '#43a047' }} />
        <h2 style={{ margin: 0, fontWeight: 800, letterSpacing: 1 }}>Cart</h2>
      </div>
      {loadingCart ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 32, background: '#fff', borderRadius: 8, fontSize: 18, boxShadow: '0 1px 4px #e3e3e3', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <img src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png" alt="Empty Cart" style={{ width: 90, height: 90, opacity: 0.7, marginBottom: 8 }} />
          <div>Loading your cart...</div>
        </div>
      ) : fetchError ? (
        <div style={{ color: '#e53935', textAlign: 'center', padding: 32, background: '#fff', borderRadius: 8, fontSize: 18, boxShadow: '0 1px 4px #e3e3e3', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <img src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png" alt="Empty Cart" style={{ width: 90, height: 90, opacity: 0.7, marginBottom: 8 }} />
          <div>{fetchError}</div>
          <button style={{ background: '#1976d2', color: '#fff', borderRadius: 6, padding: '10px 28px', border: 'none', fontWeight: 700, fontSize: 16, marginTop: 8, boxShadow: '0 1px 4px #e3e3e3', cursor: 'pointer' }} onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : cart.length === 0 ? (
        <div style={{ color: '#888', textAlign: 'center', padding: 32, background: '#fff', borderRadius: 8, fontSize: 18, boxShadow: '0 1px 4px #e3e3e3', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <img src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png" alt="Empty Cart" style={{ width: 90, height: 90, opacity: 0.7, marginBottom: 8 }} />
          <div>Your cart is empty. Add products to your cart to see them here.</div>
          <button style={{ background: '#1976d2', color: '#fff', borderRadius: 6, padding: '10px 28px', border: 'none', fontWeight: 700, fontSize: 16, marginTop: 8, boxShadow: '0 1px 4px #e3e3e3', cursor: 'pointer' }}>Browse Products</button>
        </div>
      ) : (
        <>
          <table className="dashboard-table" style={{ width: '100%', background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #e3e3e3', marginBottom: 18, borderCollapse: 'separate', borderSpacing: 0 }}>
            <colgroup>
              <col style={{ width: '6%' }} />
              <col style={{ width: '28%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '12%' }} />
            </colgroup>
            <thead style={{ background: '#e3eaf2' }}>
              <tr>
                <th style={{ textAlign: 'center', padding: '12px 0', fontWeight: 700 }}>Select</th>
                <th style={{ textAlign: 'left', padding: '12px 0', fontWeight: 700 }}>Product</th>
                <th style={{ textAlign: 'center', padding: '12px 0', fontWeight: 700 }}>Quantity</th>
                <th style={{ textAlign: 'center', padding: '12px 0', fontWeight: 700 }}>MRP</th>
                <th style={{ textAlign: 'center', padding: '12px 0', fontWeight: 700 }}>Price</th>
                <th style={{ textAlign: 'center', padding: '12px 0', fontWeight: 700 }}>Subtotal</th>
                <th style={{ textAlign: 'center', padding: '12px 0', fontWeight: 700 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, idx) => (
                <tr key={idx} style={{ verticalAlign: 'middle', borderBottom: '1px solid #f0f0f0', background: idx % 2 === 0 ? '#f9fbfd' : '#fff' }}>
                  <td style={{ textAlign: 'center', padding: '10px 0' }}>
                    <input type="checkbox" checked={selected.includes(idx)} onChange={e => setSelected(sel => e.target.checked ? [...sel, idx] : sel.filter(i => i !== idx))} style={{ width: 18, height: 18, accentColor: '#1976d2', verticalAlign: 'middle' }} />
                  </td>
                  <td style={{ fontWeight: 700, color: '#1976d2', padding: '10px 0', textAlign: 'left', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 2, width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 700, fontSize: 16, maxWidth: 170 }}>{item.name}</span>
                        <button onClick={() => toggleFav(idx)} style={{ background: 'none', border: 'none', color: item.fav ? '#e53935' : '#bbb', fontSize: 16, cursor: 'pointer', marginLeft: 0, verticalAlign: 'middle', alignSelf: 'center', padding: 0 }} title={item.fav ? 'Remove from Favourites' : 'Add to Favourites'}>{item.fav ? <FaHeart /> : <FaRegHeart />}</button>
                        {item.mrp > item.price && <span style={{ background: '#ffeb3b', color: '#b28704', fontWeight: 700, fontSize: 11, borderRadius: 4, padding: '2px 6px', marginLeft: 0, display: 'inline-block' }}>-{Math.round(100 - (item.price / item.mrp) * 100)}% OFF</span>}
                      </div>
                      <span style={{ fontSize: 12, color: item.stock === 0 ? '#e53935' : item.stock <= 2 ? '#ff9800' : '#43a047', fontWeight: 600, marginLeft: 0, display: 'block', marginTop: 2 }}>
                        {item.stock === 0 ? 'Out of Stock' : item.stock <= 2 ? `Only ${item.stock} left!` : 'In Stock'}
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', padding: '10px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                      <input type="number" min={1} max={item.stock ?? 99} value={item.quantity} onChange={e => updateQuantity(idx, Number(e.target.value))} style={{ width: 38, textAlign: 'center', borderRadius: 6, border: '1px solid #ddd', fontWeight: 600, fontSize: 15, margin: '0 2px' }} />
                      <button onClick={() => updateQuantity(idx, item.quantity - 1)} style={{ background: '#e3eaf2', border: 'none', borderRadius: '50%', width: 22, height: 22, fontSize: 13, color: '#1976d2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={item.quantity <= 1}><FaMinus /></button>
                      <button onClick={() => updateQuantity(idx, item.quantity + 1)} style={{ background: '#e3eaf2', border: 'none', borderRadius: '50%', width: 22, height: 22, fontSize: 13, color: '#1976d2', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={item.quantity >= (item.stock ?? 99)}><FaPlus /></button>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', padding: '10px 0', textDecoration: 'line-through', color: '#888', fontWeight: 500, position: 'relative' }}>
                    <span
                      style={{ cursor: 'pointer', borderBottom: '1px dotted #888' }}
                      onMouseEnter={() => setShowPriceHistory(idx)}
                      onMouseLeave={() => setShowPriceHistory(null)}
                    >
                      ₹{item.mrp}
                    </span>
                    {/* Price history tooltip */}
                    {showPriceHistory === idx && item.priceHistory && (
                      <div style={{ position: 'absolute', top: 28, left: 0, background: '#fff', border: '1px solid #ddd', borderRadius: 6, boxShadow: '0 2px 8px #e3e3e3', padding: 8, zIndex: 10, minWidth: 120 }}>
                        <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 13 }}>Price History</div>
                        {item.priceHistory.slice(-3).reverse().map((ph, i) => (
                          <div key={i} style={{ fontSize: 13, color: '#888' }}>₹{ph}</div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'center', padding: '10px 0', color: '#43a047', fontWeight: 700 }}>₹{item.price}</td>
                  <td style={{ textAlign: 'center', padding: '10px 0', fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'center', padding: '10px 0' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
                      <button onClick={() => removeItem(idx)} style={{ background: 'none', color: '#e53935', border: 'none', fontSize: 18, cursor: 'pointer' }} title="Remove"><FaTrash /></button>
                      <button onClick={() => saveForLater(idx)} style={{ background: 'none', color: '#ffb300', border: 'none', fontSize: 18, cursor: 'pointer' }} title="Save for Later"><FaSave /></button>
                      <button onClick={() => copyInfo(idx)} style={{ background: 'none', color: '#1976d2', border: 'none', fontSize: 18, cursor: 'pointer' }} title="Copy Info"><FaRegCopy /></button>
                      <button onClick={() => shareItem(idx)} style={{ background: 'none', color: '#43a047', border: 'none', fontSize: 18, cursor: 'pointer' }} title="Share"><FaShareAlt /></button>
                      {copied === idx && <span style={{ color: '#43a047', fontWeight: 600, fontSize: 13, marginLeft: 4 }}>Copied!</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
            <button className="dashboard-btn" onClick={selectAll} style={{ background: '#1976d2', color: '#fff', borderRadius: 6, padding: '8px 16px', border: 'none' }}>Select All</button>
            <button className="dashboard-btn" onClick={removeSelected} style={{ background: '#e53935', color: '#fff', borderRadius: 6, padding: '8px 16px', border: 'none' }}>Remove Selected</button>
            {/* Bulk quantity update */}
            <button className="dashboard-btn" onClick={() => setShowBulkQty(true)} disabled={selected.length === 0} style={{ background: '#ffb300', color: '#fff', borderRadius: 6, padding: '8px 16px', border: 'none', opacity: selected.length === 0 ? 0.5 : 1, cursor: selected.length === 0 ? 'not-allowed' : 'pointer' }}>Bulk Update Qty</button>
            {showBulkQty && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
                <input type="number" min={1} max={99} value={bulkQty} onChange={e => setBulkQty(Number(e.target.value))} style={{ width: 60, borderRadius: 6, border: '1px solid #ddd', padding: 6, fontSize: 15 }} />
                <button className="dashboard-btn" onClick={updateBulkQuantity} style={{ background: '#43a047', color: '#fff', borderRadius: 6, padding: '8px 12px', border: 'none' }}>Apply</button>
                <button className="dashboard-btn" onClick={() => setShowBulkQty(false)} style={{ background: '#e53935', color: '#fff', borderRadius: 6, padding: '8px 12px', border: 'none' }}>Cancel</button>
              </span>
            )}
          </div>
          <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <input placeholder="Coupon code" value={coupon} onChange={e => setCoupon(e.target.value)} style={{ marginRight: 8, borderRadius: 6, border: '1px solid #ddd', padding: 8, fontSize: 15 }} />
            <button className="dashboard-btn" onClick={applyCoupon} style={{ background: '#43a047', color: '#fff', borderRadius: 6, padding: '8px 16px', border: 'none' }}>Apply Coupon</button>
            {discount > 0 && <span style={{ color: '#2ecc71', marginLeft: 8 }}>Discount applied!</span>}
          </div>
          <div className="dashboard-cart-summary" style={{ display: 'flex', alignItems: 'center', gap: 18, background: '#fff', borderRadius: 8, padding: 18, boxShadow: '0 1px 4px #e3e3e3', fontSize: 18, fontWeight: 700 }}>
            <span>Total: <FaRupeeSign style={{ verticalAlign: 'middle' }} />{(total * (1 - discount)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            {discount > 0 && <span style={{ color: '#43a047', fontWeight: 600 }}>(You saved ₹{(total * discount).toLocaleString('en-IN', { maximumFractionDigits: 2 })})</span>}
            <button className="dashboard-btn" onClick={clearCart} style={{ background: '#e53935', color: '#fff', borderRadius: 6, padding: '8px 16px', border: 'none' }}>Clear Cart</button>
            <button className="dashboard-btn" onClick={handleCheckout} style={{ background: '#1976d2', color: '#fff', borderRadius: 6, padding: '8px 22px', border: 'none' }}>Proceed to Checkout</button>
          </div>
        </>
      )}

      {/* Saved for Later Section */}
      {savedForLater.length > 0 && (
        <div style={{ marginTop: 32, background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #e3e3e3', padding: 18 }}>
          <h3 style={{ marginTop: 0, color: '#ffb300', fontWeight: 700 }}>Saved for Later</h3>
          <table style={{ width: '100%' }}>
            <thead>
              <tr style={{ textAlign: 'center' }}>
                <th>Product</th>
                <th>MRP</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {savedForLater.map((item, idx) => (
                <tr key={idx} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  <td style={{ fontWeight: 700, color: '#1976d2' }}>{item.name}</td>
                  <td style={{ textDecoration: 'line-through', color: '#888' }}>₹{item.mrp}</td>
                  <td style={{ color: '#43a047', fontWeight: 700 }}>₹{item.price}</td>
                  <td>{item.quantity}</td>
                  <td style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
                    <button onClick={() => moveToCart(idx)} style={{ background: 'none', color: '#43a047', border: 'none', fontSize: 18 }} title="Move to Cart"><FaPlus /></button>
                    <button onClick={() => setSavedForLater(savedForLater.filter((_, i) => i !== idx))} style={{ background: 'none', color: '#e53935', border: 'none', fontSize: 18 }} title="Remove"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    <div style={{ width: 48, minWidth: 32, maxWidth: 80 }} />
  </div>
);
};

export default CartPage;
