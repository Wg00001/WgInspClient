import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { wsClient } from './services/wsClient';
import './index.css';  // 添加样式导入
import './styles/config.css';  // 添加 config.css 导入
import './styles/ConfigEditForm.css';  // 添加 ConfigEditForm.css 导入
import './styles/ConfigTree.css';  // 添加 ConfigTree.css 导入
import './styles/TopNavbar.css';  // 添加 TopNavbar.css 导入
import './styles/Notifications.css';  // 添加 Notifications.css 导入
import './styles/Dashboard.css';  // 添加 Dashboard.css 导入
import './styles/MainContainer.css';  // 添加 MainContainer.css 导入

// 调试环境变量
console.log('Environment variables:', {
  REACT_APP_WS_URL: process.env.REACT_APP_WS_URL,
  NODE_ENV: process.env.NODE_ENV
});

const wsUrl = process.env.REACT_APP_WS_URL || 'ws://127.0.0.1:8899';
console.log('Using WebSocket URL:', wsUrl);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 