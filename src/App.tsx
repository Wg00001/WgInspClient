import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import MainContainer from './components/MainContainer';
import { wsClient } from './services/wsClient';
import './styles/login.css';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    console.log('App mounted, checking authentication state');
    const storedAuth = localStorage.getItem('isAuthenticated');
    console.log('Stored auth state:', storedAuth);
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
      console.log('Attempting to login...');
      await wsClient.connectWithAuth(username, password);
      console.log('WebSocket connection successful');
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', username);
      localStorage.setItem('password', password);
      console.log('Authentication state updated, setting isAuthenticated to true');
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
              <MainContainer onLogout={handleLogout} />
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