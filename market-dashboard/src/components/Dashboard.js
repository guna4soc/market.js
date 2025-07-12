import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import MiniChart from './MiniChart';
import { FaCarrot, FaTshirt, FaMobileAlt, FaBuilding, FaDesktop, FaLeaf, FaAppleAlt, FaFish, FaDrumstickBite, FaSeedling, FaBacon, FaBell, FaCheckCircle, FaFilter, FaShoppingBasket, FaSeedling as FaKale, FaLeaf as FaCelery, FaLemon, FaCookieBite, FaIceCream, FaHamburger, FaPizzaSlice, FaChevronRight, FaChevronDown, FaUserCheck, FaUserClock, FaUserAlt, FaUserTie } from 'react-icons/fa';
import SellProductModal from './SellProductModal';

// Icon mapping for categories (for UI only)
const categoryIcons = {
  'Vegetables': <FaCarrot />, 'Fashion': <FaTshirt />, 'Mobiles': <FaMobileAlt />, 'Office': <FaBuilding />, 'Computers': <FaDesktop />, 'Fruits': <FaLemon />, 'Snacks': <FaCookieBite />, 'Ice Cream': <FaIceCream />, 'Fast Food': <FaHamburger />, 'Pizza': <FaPizzaSlice />, 'Seafood': <FaFish />, 'Meat': <FaDrumstickBite />, 'Organic': <FaSeedling />, 'Apples': <FaAppleAlt />, 'Herbs': <FaLeaf />
};
const userIcons = [<FaUserCheck />, <FaUserClock />, <FaUserAlt />, <FaUserTie />];

const API_URL = 'http://localhost:5000/api/market';
const CATEGORY_URL = 'http://localhost:5000/api/category';
const NOTIF_URL = 'http://localhost:5000/api/notification';
const ORDER_URL = 'http://localhost:5000/api/order';
const STOCK_THRESHOLD = 20;

// Remove all local/sample arrays for products, categories, orders, notifications, and stock. All such data should be fetched from backend APIs.
// Update all useState and useEffect hooks to fetch and update data via backend endpoints as mapped above.
// Implement add/edit/delete for products in Sell tab using backend (POST, PUT, DELETE to /api/market).
// Implement add to cart and order placement using backend (POST to /api/cart and /api/order).
// Always fetch notifications and orders from backend (GET /api/notification, /api/order).
// Fallback to sample data only if backend is unreachable.

const Dashboard = ({ activeTab, setActiveTab, user }) => {
  // State for dynamic data
  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [orders, setOrders] = useState([]);

  // Default notifications in case API fails
  const defaultNotifications = [
    { icon: <FaBell />, text: 'New order received', time: '2 min ago' },
    { icon: <FaCheckCircle />, text: 'Payment confirmed', time: '5 min ago' },
    { icon: <FaBell />, text: 'Stock refill needed', time: '10 min ago' },
    { icon: <FaCheckCircle />, text: 'Order delivered', time: '15 min ago' }
  ];

  // Default orders in case API fails
  const defaultOrders = [
    { icon: <FaUserCheck />, name: 'John Doe', goods: 'Fresh Vegetables', status: 'Delivered', time: '2 min ago' },
    { icon: <FaUserClock />, name: 'Jane Smith', goods: 'Organic Fruits', status: 'Pending', time: '5 min ago' },
    { icon: <FaUserAlt />, name: 'Mike Johnson', goods: 'Premium Meat', status: 'Processing', time: '10 min ago' },
    { icon: <FaUserTie />, name: 'Sarah Wilson', goods: 'Fresh Seafood', status: 'Delivered', time: '15 min ago' }
  ];
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Default products in case API fails
  const defaultProducts = [
    { name: 'Fresh Vegetables', price: 45.99, icon: <FaCarrot /> },
    { name: 'Organic Fruits', price: 67.50, icon: <FaLemon /> },
    { name: 'Premium Meat', price: 89.99, icon: <FaDrumstickBite /> },
    { name: 'Fresh Seafood', price: 120.00, icon: <FaFish /> },
    { name: 'Organic Herbs', price: 23.45, icon: <FaLeaf /> },
    { name: 'Fresh Apples', price: 34.99, icon: <FaAppleAlt /> }
  ];

  // UI state for filters, toggles, modals, etc.
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [productFilter, setProductFilter] = useState('');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showProductFilter, setShowProductFilter] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [allRead, setAllRead] = useState(false);
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [showAllSellStock, setShowAllSellStock] = useState(false);
  const [showSellStockFilter, setShowSellStockFilter] = useState(false);
  const [sellStockFilter, setSellStockFilter] = useState('');
  const [showAllBuyCategories, setShowAllBuyCategories] = useState(false);
  const [showBuyCategoryFilter, setShowBuyCategoryFilter] = useState(false);
  const [buyCategoryFilter, setBuyCategoryFilter] = useState('');
  const [showAllBuyStock, setShowAllBuyStock] = useState(false);
  const [showBuyStockFilter, setShowBuyStockFilter] = useState(false);
  const [buyStockFilter, setBuyStockFilter] = useState('');
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [sellProducts, setSellProducts] = useState([]);
  // Add state for sales notifications toggle
  const [showAllSalesNotifications, setShowAllSalesNotifications] = useState(false);
  // Add state for category management
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState('');

  // Computed filtered variables
  const filteredBuyCategories = categories.filter(cat => 
    cat && cat.name && cat.name.toLowerCase().includes(buyCategoryFilter.toLowerCase())
  );

  const filteredBuyStock = categories.filter(s => 
    s && s.name && s.name.toLowerCase().includes(buyStockFilter.toLowerCase())
  );

  const filteredCategories = categories.filter(cat => 
    cat && cat.name && cat.name.toLowerCase().includes(categoryFilter.toLowerCase())
  );

  const filteredSellStock = categories.filter(s => 
    s && s.name && s.name.toLowerCase().includes(sellStockFilter.toLowerCase())
  );

  const filteredProducts = products.filter(p => 
    (p.name || p.label || '').toLowerCase().includes(productFilter.toLowerCase())
  );

  const fetchProducts = async () => {
    setLoadingProducts(true);
    setFetchError('');
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch products');
      setProducts(data);
    } catch (err) {
      setFetchError(err.message || 'Network error');
      setProducts(defaultProducts); // Use default products if API fails
    } finally {
      setLoadingProducts(false);
    }
  };

  // Add fetchCategories and fetchOrders as named functions so they can be called after CRUD actions
  const fetchCategories = async () => {
    try {
      const res = await fetch(CATEGORY_URL);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setCategories([]);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(ORDER_URL);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setOrders(defaultOrders);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const res = await fetch(NOTIF_URL);
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        setNotifications(defaultNotifications);
      }
    };
    fetchNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log('Dashboard activeTab:', activeTab);
  }, [activeTab]);

  const displayedProducts = products.slice(0, 4);

  // Favorite toggle handler
  const toggleFavorite = (label) => {
    // This functionality needs to be implemented with backend calls
    // For now, it will just toggle in local state
    setFavoriteProducts(favs => favs.includes(label) ? favs.filter(f => f !== label) : [...favs, label]);
  };
  // Add to cart handler (calls backend)
  const addToCart = async (product) => {
    if (!user?.email) {
      alert('Please log in to add to cart.');
      return;
    }
    try {
      // Fetch current cart
      const res = await fetch(`http://localhost:5000/api/cart?user=${encodeURIComponent(user.email)}`);
      const data = await res.json();
      let items = data.items || [];
      // Check if product already in cart
      const idx = items.findIndex(item => item._id === product._id || item.name === product.name);
      if (idx !== -1) {
        // Increment quantity
        items[idx].quantity = (items[idx].quantity || 1) + 1;
      } else {
        // Add new product with quantity 1
        items.push({ ...product, quantity: 1 });
      }
      // Update cart in backend
      await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: user.email, items, total: items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0) })
      });
      alert('Added to cart!');
    } catch (err) {
      alert('Failed to add to cart. Please try again.');
    }
  };
  // Mark all notifications as read
  const markAllAsRead = () => {
    setAllRead(true);
  };
  // Handler to add or update a product
  const handleSaveProduct = async (product) => {
    try {
      if (editProduct && product._id) {
        // Edit mode: PUT to backend
        await fetch(`${API_URL}/${product._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product)
        });
      } else {
        // Add mode: POST to backend
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product)
        });
      }
      setEditProduct(null);
      setSellModalOpen(false);
      // Refresh products from backend
      fetchProducts();
    } catch (err) {
      alert('Failed to save product.');
    }
  };
  // Handler to edit a product
  const handleEditProduct = (product) => {
    setEditProduct(product);
    setSellModalOpen(true);
  };
  // Handler to delete a product
  const handleDeleteProduct = async (product) => {
    try {
      await fetch(`${API_URL}/${product._id}`, { method: 'DELETE' });
      // Refresh products from backend
      fetchProducts();
    } catch (err) {
      alert('Failed to delete product.');
    }
  };

  // Category CRUD handlers
  const handleAddCategory = async () => {
    if (!categoryName.trim()) return;
    setCategoryLoading(true);
    setCategoryError('');
    try {
      await fetch(CATEGORY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName })
      });
      setCategoryName('');
      setCategoryModalOpen(false);
      fetchCategories();
    } catch (err) {
      setCategoryError('Failed to add category');
    } finally {
      setCategoryLoading(false);
    }
  };
  const handleEditCategory = (cat) => {
    setEditCategory(cat);
    setCategoryName(cat.name);
    setCategoryModalOpen(true);
  };
  const handleUpdateCategory = async () => {
    if (!categoryName.trim() || !editCategory) return;
    setCategoryLoading(true);
    setCategoryError('');
    try {
      await fetch(`${CATEGORY_URL}/${editCategory._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: categoryName })
      });
      setEditCategory(null);
      setCategoryName('');
      setCategoryModalOpen(false);
      fetchCategories();
    } catch (err) {
      setCategoryError('Failed to update category');
    } finally {
      setCategoryLoading(false);
    }
  };
  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    setCategoryLoading(true);
    setCategoryError('');
    try {
      await fetch(`${CATEGORY_URL}/${cat._id}`, { method: 'DELETE' });
      fetchCategories();
    } catch (err) {
      setCategoryError('Failed to delete category');
    } finally {
      setCategoryLoading(false);
    }
  };

  return (
    <main className="dashboard">
      {/* BUY content: Only show when not in 'sell' tab */}
      {activeTab !== 'sell' && (
        <>
          {/* Special Discount & Income Card */}
          <section className="banner special-income-wrapper">
            <div
              className="special-discount-card enhanced"
              style={{
                flex: 2,
                minHeight: 380,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 32,
                boxSizing: 'border-box',
              }}
            >
              <div
                className="discount-content"
                style={{
                  width: '100%',
                  maxWidth: 400,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <h2 style={{ textAlign: 'center', marginBottom: 8 }}>
                  Special Discount <span className="discount-badge">45% OFF</span>
                </h2>
                <p className="discount-desc" style={{ textAlign: 'center', marginBottom: 0 }}>
                  Enjoy our fresh vegetables at a special price! Use code <b>VEG45</b> at checkout and save big on your next purchase.
                </p>
                <ul className="discount-details" style={{ margin: '12px 0 0 0', padding: 0, listStyle: 'none', textAlign: 'center' }}>
                  <li>• Limited time offer</li>
                  <li>• Applies to all vegetables</li>
                  <li>• Use before 30th June</li>
                </ul>
                <div className="discount-extra" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <span className="discount-icon" style={{ fontSize: 24 }}>🥦</span>
                  <span className="discount-highlight">Freshness Guaranteed</span>
                </div>
              </div>
              <button
                className="use-now-btn"
                style={{ marginTop: 'auto', alignSelf: 'center', width: '100%', maxWidth: 220 }}
                onClick={() => alert('Discount code VEG45 applied!')}
              >
                Use Now
              </button>
            </div>
            <div className="income-card">
              <h3>Income</h3>
              <div className="income-stats">
                <div>
                  Daily<br />
                  <b>₹129.80</b>
                  <MiniChart data={[12, 18, 10, 15, 20, 14, 19]} color="#2ecc71" />
                </div>
                <div>
                  Weekly<br />
                  <b>₹347.62</b>
                  <MiniChart data={[60, 80, 70, 90, 100, 85, 95]} color="#1976d2" />
                </div>
                <div>
                  Monthly<br />
                  <b>₹897.66</b>
                  <MiniChart data={[200, 250, 220, 270, 300, 280, 290]} color="#e67e22" />
                </div>
              </div>
            </div>
          </section>
          {/* Categories */}
          <section className="categories">
            <div className="categories-header">
              <h3>Popular Categories</h3>
              <button className="view-all-btn" onClick={() => setShowAllBuyCategories(v => !v)}>{showAllBuyCategories ? <>Less <FaChevronDown /></> : <>View All <FaChevronRight /></>}</button>
              <button className="filter-icon-btn" onClick={() => setShowBuyCategoryFilter(v => !v)}><FaFilter /></button>
              {showBuyCategoryFilter && (
                <input className="filter-input" autoFocus placeholder="Search..." value={buyCategoryFilter} onChange={e => setBuyCategoryFilter(e.target.value)} />
              )}
            </div>
            <div className="category-list">
              {filteredBuyCategories.length === 0 ? (
                <div className="empty-msg">No categories found.</div>
              ) : (
                (showAllBuyCategories ? filteredBuyCategories : filteredBuyCategories.slice(0, 6)).map(cat => (
                  <div className="category-item" key={cat.name}>
                    <span className="cat-icon">{categoryIcons[cat.name] || <FaCarrot />}</span>
                    <span>{cat.name}</span>
                  </div>
                ))
              )}
            </div>
          </section>
          {/* Stock */}
          <section className="stock">
            <div className="categories-header">
              <h3>Categories and Stock</h3>
              <button className="view-all-btn" onClick={() => setShowAllBuyStock(v => !v)}>{showAllBuyStock ? <>Less <FaChevronDown /></> : <>View All <FaChevronRight /></>}</button>
              <button className="filter-icon-btn" onClick={() => setShowBuyStockFilter(v => !v)}><FaFilter /></button>
              {showBuyStockFilter && (
                <input className="filter-input" autoFocus placeholder="Search..." value={buyStockFilter} onChange={e => setBuyStockFilter(e.target.value)} />
              )}
            </div>
            <div className="stock-list">
              {filteredBuyStock.length === 0 ? (
                <div className="empty-msg">No stock found.</div>
              ) : (
                (showAllBuyStock ? filteredBuyStock : filteredBuyStock.slice(0, 6)).map(s => (
                  <div className="stock-item" key={s.name}>
                    <span className="cat-icon">{categoryIcons[s.name] || <FaCarrot />}</span>
                    <span>{s.name}</span>
                    <b>{s.stock || 0} stock</b>
                    {(s.stock || 0) < STOCK_THRESHOLD && <span style={{color:'#e74c3c',marginLeft:8,fontWeight:600}}>Low!</span>}
                  </div>
                ))
              )}
            </div>
          </section>
          {/* Products */}
          <section className="products">
            <div className="categories-header">
              <h3>Popular Product</h3>
              <button className="view-all-btn" onClick={() => setShowAllProducts(v => !v)}>{showAllProducts ? <>Less <FaChevronDown /></> : <>View All <FaChevronRight /></>}</button>
              <button className="filter-icon-btn" onClick={() => setShowProductFilter(v => !v)}><FaFilter /></button>
              {showProductFilter && (
                <input className="filter-input" autoFocus placeholder="Search..." value={productFilter} onChange={e => setProductFilter(e.target.value)} />
              )}
            </div>
            <div className="product-list">
              {filteredProducts.length === 0 ? (
                <div className="empty-msg">No products found.</div>
              ) : (
                (showAllProducts ? filteredProducts : filteredProducts.slice(0, 4)).map(p => (
                  <div className="product-item" key={p._id || Math.random()}>
                    <span className="cat-icon">{categoryIcons[p.category] || <FaCarrot />}</span>
                    <span>{p.name || p.label || 'Unknown Product'}</span>
                    <span className="product-price">₹{(p.price || 0).toFixed(2)}</span>
                    <button
                      className={favoriteProducts.includes(p.name || p.label) ? 'fav-btn active' : 'fav-btn'}
                      onClick={() => toggleFavorite(p.name || p.label)}
                      aria-label="Toggle favorite"
                    >
                      <span role="img" aria-label="favorite">{favoriteProducts.includes(p.name || p.label) ? '★' : '☆'}</span>
                    </button>
                    <button className="add-item-btn" onClick={() => addToCart(p)}>
                      Add Item
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
          {/* Notifications & Orders */}
          <section className="side-info">
            <div className="notifications">
              <div className="side-header">
                <h4>Notifications</h4>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="notif-btn" onClick={markAllAsRead}>Mark all as read</button>
                  <button className="view-all-btn" onClick={() => setShowAllNotifications(v => !v)}>
                    {showAllNotifications ? 'Show Less' : 'View All'}
                  </button>
                </div>
              </div>
              <ul>
                {(showAllNotifications ? notifications : notifications.slice(0, 5)).map((n, i) => (
                  <li key={i} className={allRead ? 'notif-item read' : 'notif-item'}>
                    <span className="notif-icon">{n.icon || '🔔'}</span>
                    <span className="notif-text">{n.text || n.message || 'Notification'}</span>
                    <span className="notif-time">{n.time || 'Just now'}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="orders">
              <div className="side-header">
                <h4>Latest Orders</h4>
                <button className="order-btn" onClick={() => setShowAllOrders(v => !v)}>{showAllOrders ? 'Show Less' : 'View All'}</button>
              </div>
              <ul>
                {/* Header row for alignment */}
                <li className="order-item order-header" style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 90px 1fr 90px 70px',
                  alignItems: 'center',
                  fontWeight: 700,
                  fontSize: 15,
                  background: '#f4f7fa',
                  borderRadius: 6,
                  marginBottom: 4,
                  padding: '6px 0',
                  color: '#1976d2',
                  boxShadow: 'none',
                  borderBottom: '1px solid #e6f4ea',
                  minHeight: 36,
                  height: 44,
                  alignItems: 'center'
                }}>
                  <span></span>
                  <span style={{display:'flex',alignItems:'center',height:'100%',fontWeight:700, justifyContent:'flex-start', paddingLeft:12}}>Name</span>
                  <span style={{display:'flex',alignItems:'center',height:'100%',fontWeight:700}}>Product</span>
                  <span style={{display:'flex',alignItems:'center',height:'100%',fontWeight:700}}>Status</span>
                  <span style={{display:'flex',alignItems:'center',height:'100%',fontWeight:700}}>Time</span>
                </li>
                {(showAllOrders ? orders : orders.slice(0, 4)).map((o, i) => (
                  <li
                    key={i}
                    className="order-item"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '32px 90px 1fr 90px 70px',
                      alignItems: 'center',
                      gap: 0,
                      padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0',
                      background: '#fff',
                      borderRadius: 6,
                      marginBottom: 6,
                      fontSize: 15,
                      boxShadow: '0 1px 2px #f0f1f2',
                      minHeight: 36
                    }}
                  >
                    <span className="order-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#1976d2', background: '#e6f4ea', borderRadius: '50%', width: 28, height: 28 }}>{o.icon}</span>
                    <span className="order-name" style={{ fontWeight: 600, color: '#1976d2' }}>{o.name}</span>
                    <span className="order-goods" style={{ color: '#333', fontStyle: 'italic', marginLeft: 4 }}>{o.goods}</span>
                    <span className={`sales-order-status ${o.status.toLowerCase()}`}>{o.status}</span>
                    <span className="order-time" style={{ color: '#888', fontSize: 13 }}>{o.time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}
      {/* SELL content (mirroring BUY structure, but for selling) */}
      {activeTab === 'sell' && (
        <section className="sell-content">
          {/* Top 5 Selling Products */}
          <div className="categories-header">
            <h3>Top 5 Selling Products</h3>
          </div>
          <div className="top-selling-list">
            {products.map((item, idx) => { // Changed to use products for top selling
              let chartColor = '#1976d2';
              if (item.stock > STOCK_THRESHOLD) chartColor = '#2ecc71';
              else if (item.stock < STOCK_THRESHOLD && item.stock >= 50) chartColor = '#e67e22';
              else if (item.stock < 50) chartColor = '#e74c3c';
              return (
                <div
                  className="top-selling-item"
                  key={item._id || Math.random()}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 100px 180px 1fr', // removed spacer, made status column wider
                    alignItems: 'center',
                    marginBottom: 12,
                    background: '#fff',
                    borderRadius: 8,
                    padding: 12,
                    boxShadow: '0 1px 4px #eee',
                    minHeight: 56,
                    gap: 0
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{item.name || item.label}</span>
                  <span>Stock: <b>{item.stock}</b></span>
                  <span style={{ display: 'flex', alignItems: 'center', height: 32, minWidth: 120, marginRight: 32 }}>
                    <span style={{ fontWeight: 500, marginRight: 6 }}>Status:</span>
                    <span style={{ color: item.stock < STOCK_THRESHOLD ? '#e74c3c' : item.stock < 50 ? '#f39c12' : '#2ecc71', fontWeight: 600, whiteSpace: 'nowrap' }}>{item.stock < STOCK_THRESHOLD ? 'Critical' : item.stock < 50 ? 'Low Stock' : 'In Stock'}</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', height: 32 }}>
                    <MiniChart data={Array.isArray(item.sales) ? item.sales : []} color={chartColor} height={32} />
                  </span>
                  {item.stock < STOCK_THRESHOLD && (
                    <span style={{ color: '#e74c3c', fontWeight: 600, textAlign: 'right', gridColumn: '1 / -1' }}>Stock Alert!</span>
                  )}
                </div>
              );
            })}
          </div>
          {/* Sell Categories */}
          <div className="categories-header">
            <h3>Sell Categories</h3>
            <button className="view-all-btn" onClick={() => setShowAllCategories(v => !v)}>{showAllCategories ? <>Less <FaChevronDown /></> : <>View All <FaChevronRight /></>}</button>
            <button className="filter-icon-btn" onClick={() => setShowCategoryFilter(v => !v)}><FaFilter /></button>
            {showCategoryFilter && (
              <input className="filter-input" autoFocus placeholder="Search..." value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} />
            )}
          </div>
          <div className="category-list">
            {(showAllCategories ? filteredCategories : filteredCategories.slice(0, 6)).map(cat => (
              <div className="category-item" key={cat.name}>
                <span className="cat-icon">{categoryIcons[cat.name] || <FaCarrot />}</span>
                <span>{cat.name}</span>
              </div>
            ))}
          </div>
          {/* Sell Stock with View All and Filter */}
          <div className="categories-header" style={{marginTop: 24}}>
            <h3>Sell Stock</h3>
            <button className="view-all-btn" onClick={() => setShowAllSellStock(v => !v)}>{showAllSellStock ? <>Less <FaChevronDown /></> : <>View All <FaChevronRight /></>}</button>
            <button className="filter-icon-btn" onClick={() => setShowSellStockFilter(v => !v)}><FaFilter /></button>
            {showSellStockFilter && (
              <input className="filter-input" style={{display:'inline-block',marginLeft:8}} placeholder="Search..." value={sellStockFilter} onChange={e => setSellStockFilter(e.target.value)} />
            )}
          </div>
          <div className="stock-list">
            {filteredSellStock.length === 0 ? (
              <div className="empty-msg">No stock found.</div>
            ) : (
              (showAllSellStock ? filteredSellStock : filteredSellStock.slice(0, 6)).map(s => (
                <div className="stock-item" key={s.name}>
                  <span className="cat-icon">{categoryIcons[s.name] || <FaCarrot />}</span>
                  <span>{s.name}</span>
                  <b>{s.stock} stock</b>
                  {s.stock < STOCK_THRESHOLD && <span style={{color:'#e74c3c',marginLeft:8,fontWeight:600}}>Low!</span>}
                </div>
              ))
            )}
          </div>
          {/* Products for Sale */}
          <div className="categories-header" style={{marginTop: 24}}>
            <h3>Products for Sale</h3>
            <button className="add-product-btn" onClick={() => { setEditProduct(null); setSellModalOpen(true); }}>+ Add Product</button>
          </div>
          <div className="product-list">
            {products.length === 0 ? (
              <div className="empty-msg">No products listed for sale yet.</div>
            ) : (
              <table className="sell-products-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => (
                    <tr key={prod._id || Math.random()}>
                      <td>{prod.name || prod.label}</td>
                      <td>{prod.category}</td>
                      <td style={{textAlign:'right'}}>₹{prod.price}</td>
                      <td style={{textAlign:'right'}}>{prod.stock}</td>
                      <td style={{textAlign:'center'}}>
                        <button className="edit-btn" onClick={() => handleEditProduct(prod)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDeleteProduct(prod)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* Sales Notifications & Orders - creative */}
          <div className="side-info" style={{ marginTop: 24, display: 'flex', gap: 24 }}>
            <div className="notifications" style={{ flex: 1, background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #eee', padding: 16 }}>
              <div className="side-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <h4 style={{ margin: 0 }}>Sales Notifications</h4>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="notif-btn" onClick={markAllAsRead}>Mark all as read</button>
                  <button className="view-all-btn" onClick={() => setShowAllSalesNotifications(v => !v)}>
                    {showAllSalesNotifications ? 'Show Less' : 'View All'}
                  </button>
                </div>
              </div>
              <ul className="sales-notif-list" style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                {(showAllSalesNotifications ? notifications : notifications.slice(0, 5)).map((n, i) => (
                  <li
                    key={n._id || Math.random()}
                    className={allRead ? 'notif-item read' : 'notif-item'}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '32px 1fr 60px 80px',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0',
                      position: 'relative',
                      minHeight: 36
                    }}
                  >
                    <span className="sales-notif-icon" style={{ fontSize: 18, justifySelf: 'center' }}>{n.icon || '🔔'}</span>
                    <span className="notif-text" style={{}}>{n.text || n.message || 'Notification'}</span>
                    {i < 2 && !allRead ? (
                      <span className="sales-notif-badge" style={{ background: '#e74c3c', color: '#fff', borderRadius: 8, padding: '2px 8px', fontSize: 12, marginLeft: 0, justifySelf: 'center' }}>NEW</span>
                    ) : <span></span>}
                    <span className="sales-notif-time" style={{ color: '#888', fontSize: 12, justifySelf: 'end' }}>{n.time || 'Just now'}</span>
                    {(n.text || n.message || '').toLowerCase().includes('refill') && (
                      <span style={{ gridColumn: '2 / span 3', marginLeft: 0, color: '#e74c3c', fontWeight: 600, fontSize: '0.85rem', marginTop: 2 }}>Action Needed</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="orders" style={{ flex: 1, background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px #eee', padding: 16 }}>
              <div className="side-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <h4 style={{ margin: 0 }}>Sales Orders</h4>
                <button className="order-btn" onClick={() => setShowAllOrders(v => !v)}>{showAllOrders ? 'Show Less' : 'View All'}</button>
              </div>
              <ul className="sales-order-list" style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                {(showAllOrders ? orders : orders.slice(0, 4)).map((o, i) => (
                  <li
                    key={o._id || Math.random()}
                    className="order-item"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '36px 80px 1fr 90px 70px',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 0',
                      borderBottom: '1px solid #f0f0f0',
                      position: 'relative',
                      minHeight: 36
                    }}
                  >
                    <span className="sales-order-avatar" style={{ background: '#1976d2', color: '#fff', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 15, justifySelf: 'center' }}>{o.name[0]}</span>
                    <span className="order-name" style={{ fontWeight: 500 }}>{o.name}</span>
                    <span className="order-goods" style={{}}>{o.goods}</span>
                    <span className={`sales-order-status ${o.status.toLowerCase()}`} style={{ textAlign: 'center', fontWeight: 600 }}>{o.status}</span>
                    <span className="sales-order-time" style={{ color: '#888', fontSize: 12, justifySelf: 'end' }}>{o.time}</span>
                    {o.status === 'Pending' && <span style={{ gridColumn: '4 / span 2', color: '#f39c12', fontWeight: 600, fontSize: '0.85rem', marginTop: 2 }}>Awaiting Action</span>}
                    {o.status === 'Delivered' && <span style={{ gridColumn: '4 / span 2', color: '#2ecc71', fontWeight: 600, fontSize: '0.85rem', marginTop: 2 }}>Completed</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <SellProductModal
            open={sellModalOpen}
            onClose={() => { setSellModalOpen(false); setEditProduct(null); }}
            onSave={handleSaveProduct}
            product={editProduct}
            categories={categories.map(c => ({ label: c.name }))}
          />
        </section>
      )}
      {/* Add Category Management UI in the dashboard (e.g., above categories list) */}
      {/* (Removed 'Manage Categories' section as per user request) */}
    </main>
  );
};

export default Dashboard;
