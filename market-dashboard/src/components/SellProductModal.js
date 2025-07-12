import React, { useState } from 'react';

const defaultProduct = { label: '', price: '', category: '', stock: '', icon: '' };

const SellProductModal = ({ open, onClose, onSave, product, categories }) => {
  const [form, setForm] = useState(product || defaultProduct);

  if (!open) return null;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.label || !form.price || !form.category || !form.stock) return;
    onSave({ ...form, price: parseFloat(form.price), stock: parseInt(form.stock, 10) });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
        <form onSubmit={handleSubmit}>
          <input name="label" placeholder="Product Name" value={form.label} onChange={handleChange} required />
          <input name="price" type="number" step="0.01" placeholder="Price" value={form.price} onChange={handleChange} required />
          <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} required />
          <select name="category" value={form.category} onChange={handleChange} required>
            <option value="">Select Category</option>
            {categories.map(cat => <option key={cat.label} value={cat.label}>{cat.label}</option>)}
          </select>
          <div className="modal-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellProductModal;
