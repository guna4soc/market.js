import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import MarketPage from './pages/MarketPage';
import CategoriesPage from './pages/CategoriesPage';
import OrderPage from './pages/OrderPage';
import FavouritePage from './pages/FavouritePage';
import CartPage from './pages/CartPage';
import MessagePage from './pages/MessagePage';
import FeedbackPage from './pages/FeedbackPage';
import HelpPage from './pages/HelpPage';
import SettingPage from './pages/SettingPage';
import AuthPage from './pages/AuthPage';
import './App.css';
import './components/DashboardCustom.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarIconsOnly, setSidebarIconsOnly] = useState(false);
  const [mode, setMode] = useState('light');
  const [activeTab, setActiveTab] = useState('buy');
  const [activePage, setActivePage] = useState('Market');

  // User authentication state
  const [user, setUser] = useState(null);

  const handleAuthSuccess = (userInfo) => {
    setUser(userInfo);
  };

  const handleLogout = () => {
    setUser(null);
  };

  // Toggle sidebar: open (full) <-> icons only (never hidden)
  const handleMenuToggle = () => {
    if (!sidebarIconsOnly) {
      setSidebarIconsOnly(true);
    } else {
      setSidebarIconsOnly(false);
    }
    setSidebarOpen(true);
  };

  const handleModeToggle = () => {
    setMode(mode === 'light' ? 'dark' : 'light');
    document.body.setAttribute('data-theme', mode === 'light' ? 'dark' : 'light');
  };

  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className={`app-container ${mode}-mode`}>
      <Header
        onMenuToggle={handleMenuToggle}
        mode={mode}
        onModeToggle={handleModeToggle}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />
      <div className="layout-row">
        {sidebarOpen && (
          <Sidebar iconsOnly={sidebarIconsOnly} mode={mode} onSelect={setActivePage} activePage={activePage} />
        )}
        <div className="main-content">
          {activePage === 'Market' && <MarketPage activeTab={activeTab} setActiveTab={setActiveTab} user={user} />}
          {activePage === 'Categories' && <CategoriesPage />}
          {activePage === 'Order' && <OrderPage user={user} />}
          {activePage === 'Favourite' && <FavouritePage user={user} />}
          {activePage === 'Cart' && <CartPage user={user} />}
          {activePage === 'Message' && <MessagePage user={user} />}
          {activePage === 'Feedback' && <FeedbackPage />}
          {activePage === 'Help' && <HelpPage />}
          {activePage === 'Settings' && <SettingPage />}
          {!(
            activePage === 'Market' ||
            activePage === 'Categories' ||
            activePage === 'Order' ||
            activePage === 'Favourite' ||
            activePage === 'Cart' ||
            activePage === 'Message' ||
            activePage === 'Feedback' ||
            activePage === 'Help' ||
            activePage === 'Settings'
          ) && <Dashboard activeTab={activeTab} mode={mode} />}
        </div>
      </div>
    </div>
  );
}

export default App;
