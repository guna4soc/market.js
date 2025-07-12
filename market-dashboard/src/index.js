import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import AuthPage from './pages/AuthPage';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));


function Root() {
  const [authenticated, setAuthenticated] = React.useState(false);
  const [user, setUser] = React.useState(null);
  // Pass user info and logout to App, and set user on login
  const handleAuthSuccess = (userInfo) => {
    setUser(userInfo);
    setAuthenticated(true);
  };
  const handleLogout = () => {
    setUser(null);
    setAuthenticated(false);
  };
  return authenticated ? <App user={user} onLogout={handleLogout} /> : <AuthPage onAuthSuccess={handleAuthSuccess} />;
}

root.render(
  <Root />
);

reportWebVitals();
