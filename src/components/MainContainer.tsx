import React, { useState, useEffect } from 'react';
import TopNavbar from './TopNavbar';
import ConfigTree from './ConfigTree';
import Notifications from './Notifications';
import Dashboard from './Dashboard';
import { wsClient } from '../services/wsClient';
import '../styles/MainContainer.css';

interface MainContainerProps {
  onLogout: () => void;
}

const MainContainer: React.FC<MainContainerProps> = ({ onLogout }) => {
  const [currentPage, setCurrentPage] = useState<string>('config');

  useEffect(() => {
    // 在组件挂载时获取通知列表
    wsClient.getNotices(1, 20);
  }, []);

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    
    // 如果切换到通知页面，刷新通知列表
    if (page === 'notifications') {
      wsClient.getNotices(1, 20);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'config':
        return <ConfigTree onLogout={onLogout} />;
      case 'notifications':
        return <Notifications />;
      case 'dashboard':
        return <Dashboard />;
      default:
        return <ConfigTree onLogout={onLogout} />;
    }
  };

  return (
    <div className="main-container">
      <TopNavbar 
        currentPage={currentPage} 
        onPageChange={handlePageChange} 
        onLogout={onLogout} 
      />
      <div className="page-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default MainContainer; 