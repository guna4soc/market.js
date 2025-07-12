import React, { useState, useRef, useEffect } from 'react';
import { FaCarrot, FaTshirt, FaMobileAlt, FaBuilding, FaDesktop, FaLeaf, FaAppleAlt, FaFish, FaDrumstickBite, FaSeedling, FaBacon, FaLemon, FaCookieBite, FaIceCream, FaHamburger, FaPizzaSlice, FaTag, FaChevronRight, FaChevronDown, FaFilter, FaChartLine, FaPlus, FaEdit, FaArchive, FaFire, FaSyncAlt, FaBoxes, FaSnowflake, FaApple } from 'react-icons/fa';
import '../components/Dashboard.css';
   const PAGE_SIZE = 6;

const API_URL = 'http://localhost:5000/api/category';

const CategoriesPage = () => {
  const [showAll, setShowAll] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter] = useState('');
  const [modal, setModal] = useState(null); // 'add' | 'bulk' | 'archive' | null
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [archived, setArchived] = useState([]); // archived categories
  const [timeline, setTimeline] = useState([
    {
      icon: <FaPlus color="#43a047" />,
      title: 'New Category Added',
      desc: 'Bakery products category was added.',
      time: '2 hours ago',
      color: '#43a047',
    },
    {
      icon: <FaEdit color="#1976d2" />,
      title: 'Category Updated',
      desc: 'Fashion category received 5 new items.',
      time: 'Today',
      color: '#1976d2',
    },
    {
      icon: <FaFire color="#ff7043" />,
      title: 'Best Seller',
      desc: 'Pizza was the top seller in Fast Food.',
      time: 'Yesterday',
      color: '#ff7043',
    },
    {
      icon: <FaArchive color="#bdbdbd" />,
      title: 'Category Archived',
      desc: 'Old Electronics category archived.',
      time: '2 days ago',
      color: '#bdbdbd',
    },
  ]);
  const [bulkSelection, setBulkSelection] = useState([]); // for bulk edit
  const inputRef = useRef();
  const [newCategory, setNewCategory] = useState('');
  const [bulkName, setBulkName] = useState('');

  useEffect(() => {
    // Fetch categories from backend
    const fetchCategories = async () => {
      setLoadingCategories(true);
      setFetchError('');
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch categories');
        setCategories(data);
      } catch (err) {
        setFetchError(err.message || 'Network error');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const filtered = categories.filter(cat => (cat.label || '').toLowerCase().includes(filter.toLowerCase()));
  const shown = showAll ? filtered : filtered.slice(0, PAGE_SIZE);

  // Fruits highlight is always the first non-archived 'Fruits' category
  const featured = categories.find(c => c.label === 'Fruits' && !archived.includes(c.label));

  // Add Category
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    const newCat = {
      icon: <FaPlus color="#43a047" />,
      label: newCategory,
      tag: 'Custom',
      color: '#607d8b',
      desc: 'Newly added category.',
    };
    setCategories([...categories, newCat]);
    setTimeline([
      {
        icon: <FaPlus color="#43a047" />,
        title: 'New Category Added',
        desc: `${newCategory} category was added.`,
        time: 'Just now',
        color: '#43a047',
      },
      ...timeline,
    ]);
    setNewCategory('');
    setModal(null);
  };

  // Bulk Edit
  const handleBulkEdit = () => {
    if (!bulkName.trim() || bulkSelection.length === 0) return;
    setCategories(categories.map(cat => bulkSelection.includes(cat.label) ? { ...cat, label: bulkName } : cat));
    setTimeline([
      {
        icon: <FaEdit color="#1976d2" />,
        title: 'Bulk Edit',
        desc: `Categories renamed to ${bulkName}.`,
        time: 'Just now',
        color: '#1976d2',
      },
      ...timeline,
    ]);
    setBulkName('');
    setBulkSelection([]);
    setModal(null);
  };

  // Archive
  const handleArchive = () => {
    if (bulkSelection.length === 0) return;
    setArchived([...archived, ...bulkSelection]);
    setTimeline([
      {
        icon: <FaArchive color="#bdbdbd" />,
        title: 'Category Archived',
        desc: `${bulkSelection.join(', ')} archived.`,
        time: 'Just now',
        color: '#bdbdbd',
      },
      ...timeline,
    ]);
    setBulkSelection([]);
    setModal(null);
  };

  // Insights data (mocked)
  const insights = [
    {
      icon: <FaFire color="#ff7043" />,
      label: 'Hot Picks',
      stat: '+12%',
      desc: 'Fastest Growing Categories',
      color: '#ff7043',
      bar: [60, 80, 90, 100, 120],
      hint: 'Trending: These categories are seeing the most growth and customer interest this week.',
    },
    {
      icon: <FaSyncAlt color="#1976d2" />,
      label: 'Freshly Updated',
      stat: '3',
      desc: 'New Arrivals & Updates',
      color: '#1976d2',
      bar: [40, 60, 55, 70, 80],
      hint: 'Recently Updated: Categories with the newest products and latest changes.',
    },
    {
      icon: <FaBoxes color="#43a047" />,
      label: 'Bulk Deals',
      stat: 'Office',
      desc: 'Office Essentials in Bulk',
      color: '#43a047',
      bar: [100, 120, 110, 130, 140],
      hint: 'Most Stocked: Categories with the highest inventory, perfect for bulk buyers and businesses.',
    },
    {
      icon: <FaSnowflake color="#00bcd4" />,
      label: 'Summer Favorites',
      stat: 'Fruits & Ice Cream',
      desc: 'Seasonal Delights',
      color: '#00bcd4',
      bar: [30, 50, 80, 120, 160],
      hint: 'Seasonal: Enjoy summer specials like fresh fruits and ice cream, available for a limited time.',
    },
  ];

  return (
    <div className="categories" style={{ background: 'var(--header-bg)', padding: 24, borderRadius: 16, maxWidth: 1100, margin: '32px auto', boxShadow: '0 1px 4px #e6f4ea' }}>
      {/* Category Insights Timeline Section */}
      <div className="category-timeline" style={{ marginBottom: 32, background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px #e6f4ea', padding: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 16, color: '#333' }}>Category Insights Timeline</div>
        <div style={{ display: 'flex', gap: 32, overflowX: 'auto', paddingBottom: 8 }}>
          {timeline.map((item, idx) => (
            <div key={idx} style={{ minWidth: 220, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#fafafa', borderRadius: 10, boxShadow: '0 1px 3px #e6f4ea', padding: 16, borderLeft: `5px solid ${item.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{item.title}</span>
              </div>
              <span style={{ color: '#888', fontSize: 13, marginBottom: 4 }}>{item.desc}</span>
              <span style={{ color: '#bbb', fontSize: 12 }}>{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category Highlights Section */}
      {featured && (
      <div className="category-highlights" style={{ marginBottom: 32, background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px #e6f4ea', padding: 20, display: 'flex', alignItems: 'center', gap: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <span style={{ background: featured.color, borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginRight: 8, boxShadow: '0 1px 4px #e6f4ea', overflow: 'hidden' }}>
            <FaApple style={{ fontSize: 36, color: '#fff', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.18))' }} />
          </span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: '#333' }}>{featured.label} Highlight</div>
            <div style={{ color: '#888', fontSize: 14 }}>{featured.desc}</div>
            <div style={{ color: '#43a047', fontWeight: 700, fontSize: 13, marginTop: 4 }}>Seasonal Pick: Best for summer refreshment!</div>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <span style={{ fontSize: 15, color: '#1976d2', fontWeight: 700 }}>Avg. Price: ₹249/kg</span>
          <span style={{ fontSize: 13, color: '#888' }}>Top Seller: Mango</span>
          <button style={{ background: '#ffb300', color: '#fff', border: 'none', borderRadius: 8, padding: '7px 18px', fontWeight: 700, marginTop: 6, cursor: 'pointer' }}>Shop Fruits</button>
        </div>
      </div>
      )}

      {/* Categories Overview Section */}
      <div className="categories-overview" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 18, color: '#333' }}>Categories Overview</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setModal('add')} style={{ background: '#43a047', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><FaPlus /> Add Category</button>
            <button onClick={() => setModal('bulk')} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><FaEdit /> Bulk Edit</button>
            <button onClick={() => setModal('archive')} style={{ background: '#bdbdbd', color: '#333', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}><FaArchive /> Archive</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'flex-start' }}>
          {insights.map(ins => (
            <div key={ins.label} style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e6f4ea', padding: 18, minWidth: 180, flex: '1 1 200px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', borderLeft: `6px solid ${ins.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 22 }}>{ins.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 16 }}>{ins.label}</span>
                <span style={{ background: ins.color, color: '#fff', borderRadius: 6, fontSize: 13, fontWeight: 700, padding: '2px 8px', marginLeft: 8 }}>{ins.stat}</span>
              </div>
              <span style={{ color: '#888', fontSize: 13, marginBottom: 2 }}>{ins.desc}</span>
              <span style={{ color: ins.color, fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{ins.hint}</span>
              {/* Mini trend bar */}
              <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 24 }}>
                {ins.bar.map((v, i) => (
                  <div key={i} style={{ width: 8, height: v/8, background: ins.color, borderRadius: 2, opacity: 0.7 }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category List Section */}
      <div className="categories-header" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <h4 style={{ fontWeight: 700, fontSize: 20, margin: 0 }}>All Categories</h4>
        <button className="view-all-btn" onClick={() => setShowAll(v => !v)} style={{ marginLeft: 'auto' }}>{showAll ? <>Less <FaChevronDown /></> : <>View All <FaChevronRight /></>}</button>
        <button className="filter-icon-btn" onClick={() => setShowFilter(v => !v)}><FaFilter /></button>
        {showFilter && (
          <input className="filter-input" autoFocus placeholder="Search..." value={filter} onChange={e => setFilter(e.target.value)} />
        )}
      </div>
      <div className="category-list" style={{ display: 'flex', flexWrap: 'wrap', gap: 24, marginTop: 12, justifyContent: 'flex-start' }}>
        {shown.filter(cat => !archived.includes(cat.label)).map(cat => (
          <div className="category-item" key={cat.label} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#fff', padding: '18px 12px', borderRadius: 12, minWidth: 140, maxWidth: 180, boxShadow: '0 1px 4px #e6f4ea', flex: '1 1 180px', margin: 4, gap: 8, borderLeft: `6px solid ${cat.color}`
          }}>
            <span className="cat-icon" style={{ fontSize: 32, background: cat.color, borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: 6, boxShadow: '0 1px 4px #e6f4ea' }}>{cat.icon}</span>
            <span style={{ fontWeight: 600, fontSize: 16, color: '#444', marginBottom: 2 }}>{cat.label}</span>
            <span style={{ color: '#888', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}><FaTag style={{ fontSize: 12, color: '#bbb' }} /> {cat.tag}</span>
            <span style={{ color: '#aaa', fontSize: 12, textAlign: 'center', minHeight: 32 }}>{cat.desc}</span>
          </div>
        ))}
        {shown.filter(cat => !archived.includes(cat.label)).length === 0 && <div style={{ color: '#888', fontSize: 16, padding: 32, background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px #e6f4ea', textAlign: 'center', width: '100%' }}>No categories found.</div>}
      </div>

      {/* Modal (full-featured) */}
      {modal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setModal(null)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 340, boxShadow: '0 2px 12px #b2dfdb', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setModal(null)} style={{ position: 'absolute', top: 10, right: 14, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }}>&times;</button>
            {modal === 'add' && (
              <div>
                <h3>Add Category</h3>
                <input ref={inputRef} value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Category Name" style={{ width: '100%', padding: 8, margin: '12px 0', borderRadius: 6, border: '1px solid #eee' }} autoFocus />
                <button style={{ background: '#43a047', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, marginTop: 8, cursor: 'pointer' }} onClick={handleAddCategory}>Add</button>
              </div>
            )}
            {modal === 'bulk' && (
              <div>
                <h3>Bulk Edit</h3>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontWeight: 600, fontSize: 14 }}>Select Categories:</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '8px 0' }}>
                    {categories.filter(cat => !archived.includes(cat.label)).map(cat => (
                      <label key={cat.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                        <input type="checkbox" checked={bulkSelection.includes(cat.label)} onChange={e => {
                          if (e.target.checked) setBulkSelection([...bulkSelection, cat.label]);
                          else setBulkSelection(bulkSelection.filter(l => l !== cat.label));
                        }} />
                        {cat.label}
                      </label>
                    ))}
                  </div>
                </div>
                <input value={bulkName} onChange={e => setBulkName(e.target.value)} placeholder="New Name for Selected" style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #eee' }} />
                <button style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, marginTop: 8, cursor: 'pointer' }} onClick={handleBulkEdit}>Rename Selected</button>
              </div>
            )}
            {modal === 'archive' && (
              <div>
                <h3>Archive Categories</h3>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ fontWeight: 600, fontSize: 14 }}>Select Categories to Archive:</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '8px 0' }}>
                    {categories.filter(cat => !archived.includes(cat.label)).map(cat => (
                      <label key={cat.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                        <input type="checkbox" checked={bulkSelection.includes(cat.label)} onChange={e => {
                          if (e.target.checked) setBulkSelection([...bulkSelection, cat.label]);
                          else setBulkSelection(bulkSelection.filter(l => l !== cat.label));
                        }} />
                        {cat.label}
                      </label>
                    ))}
                  </div>
                </div>
                <button style={{ background: '#bdbdbd', color: '#333', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 700, marginTop: 8, cursor: 'pointer' }} onClick={handleArchive}>Archive Selected</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
