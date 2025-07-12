import React, { useState } from 'react';
import { FaUserFriends, FaSearch, FaEnvelope, FaPhone, FaPlus, FaEdit } from 'react-icons/fa';
import '../components/Dashboard.css';

const initialCustomers = [
  { name: 'Suman', email: 'suman@email.com', phone: '555-1234', orders: 12 },
  { name: 'Naveen', email: 'naveen@email.com', phone: '555-5678', orders: 8 },
  { name: 'Ariana', email: 'ariana@email.com', phone: '555-8765', orders: 15 },
  { name: 'Reshmi', email: 'reshmi@email.com', phone: '555-4321', orders: 5 },
];

const CustomersPage = () => {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // 'add' | 'edit' | null
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (type, customer = null) => {
    setModal(type);
    setSelectedCustomer(customer);
  };
  const closeModal = () => {
    setModal(null);
    setSelectedCustomer(null);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <FaUserFriends size={28} style={{ marginRight: 8 }} />
        <h2>Customers</h2>
        <button className="dashboard-btn" onClick={() => openModal('add')}><FaPlus /> Add Customer</button>
      </div>
      <div className="dashboard-search">
        <FaSearch />
        <input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Orders</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((c, idx) => (
            <tr key={idx}>
              <td>{c.name}</td>
              <td><FaEnvelope /> {c.email}</td>
              <td><FaPhone /> {c.phone}</td>
              <td>{c.orders}</td>
              <td>
                <button onClick={() => openModal('edit', c)}><FaEdit /></button>
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
            <h3>{modal === 'add' ? 'Add Customer' : 'Edit Customer'}</h3>
            {/* Form or confirmation UI here */}
            <p>Feature coming soon.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
