import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { wsClient } from './services/wsClient';
import './index.css';  // 添加样式导入
import './styles/config.css';  // 添加 config.css 导入

// 调试环境变量
console.log('Environment variables:', {
  REACT_APP_WS_URL: process.env.REACT_APP_WS_URL,
  NODE_ENV: process.env.NODE_ENV
});

const wsUrl = process.env.REACT_APP_WS_URL || 'ws://127.0.0.1:8899';
console.log('Using WebSocket URL:', wsUrl);

// 初始化WebSocket连接
wsClient.connect(wsUrl);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 