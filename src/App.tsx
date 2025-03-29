import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { wsClient } from './services/wsClient';
import './styles/login.css';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const storedAuth = localStorage.getItem('isAuthenticated');
    if (storedAuth === 'true') {
      const username = localStorage.getItem('username');
      const password = localStorage.getItem('password');
      if (username && password) {
        wsClient.connectWithAuth(username, password)
          .then(() => setIsAuthenticated(true))
          .catch(() => {
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('username');
            localStorage.removeItem('password');
            setIsAuthenticated(false);
          });
      }
    }
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      await wsClient.connectWithAuth(username, password);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', username);
      localStorage.setItem('password', password);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    wsClient.disconnect();
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    localStorage.removeItem('password');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Dashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App; 