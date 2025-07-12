import React, { useState } from 'react';
import { FaBoxOpen, FaPlus, FaEdit, FaArchive, FaSearch, FaTags } from 'react-icons/fa';
import '../components/Dashboard.css';

const initialProducts = [
  { name: 'Organic Carrot', category: 'Vegetables', price: 2.5, stock: 120, tags: ['Organic', 'Fresh'], desc: 'Fresh organic carrots from local farms.' },
  { name: 'Classic T-shirt', category: 'Fashion', price: 15, stock: 60, tags: ['Clothing'], desc: '100% cotton, available in all sizes.' },
  { name: 'Smartphone X', category: 'Mobiles', price: 299, stock: 30, tags: ['Electronics'], desc: 'Latest model with advanced features.' },
  { name: 'Office Chair', category: 'Office', price: 85, stock: 20, tags: ['Furniture'], desc: 'Ergonomic and comfortable.' },
];

const ProductsPage = () => {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // 'add' | 'edit' | 'archive' | null
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (type, product = null) => {
    setModal(type);
    setSelectedProduct(product);
  };
  const closeModal = () => {
    setModal(null);
    setSelectedProduct(null);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <FaBoxOpen size={28} style={{ marginRight: 8 }} />
        <h2>Products</h2>
        <button className="dashboard-btn" onClick={() => openModal('add')}><FaPlus /> Add Product</button>
      </div>
      <div className="dashboard-search">
        <FaSearch />
        <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Price ($)</th>
            <th>Stock</th>
            <th>Tags</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p, idx) => (
            <tr key={idx}>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{p.price}</td>
              <td>{p.stock}</td>
              <td>{p.tags.map(t => <span key={t} className="dashboard-tag"><FaTags /> {t}</span>)}</td>
              <td>
                <button onClick={() => openModal('edit', p)}><FaEdit /></button>
                <button onClick={() => openModal('archive', p)}><FaArchive /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modal implementation would go here */}
      {modal && (
        <div className="dashboard-modal">
          <div className="dashboard-modal-content">
            <button className="dashboard-modal-close" onClick={closeModal}>×</button>
            <h3>{modal === 'add' ? 'Add Product' : modal === 'edit' ? 'Edit Product' : 'Archive Product'}</h3>
            {/* Form or confirmation UI here */}
            <p>Feature coming soon.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
