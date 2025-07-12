import React from 'react';
import Dashboard from '../components/Dashboard';
import '../components/Dashboard.css';

const MarketPage = ({ activeTab, setActiveTab, user }) => {
  return (
    <div style={{ padding: 0 }}>
      <Dashboard activeTab={activeTab} setActiveTab={setActiveTab} user={user} />
    </div>
  );
};

export default MarketPage;
