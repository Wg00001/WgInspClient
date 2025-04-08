import React, { useState } from 'react';
import '../styles/TopNavbar.css';

interface NavItem {
  key: string;
  title: string;
  icon?: string;
}

interface TopNavbarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'config', title: '配置管理' },
  { key: 'notifications', title: '通知' },
  { key: 'task-monitor', title: '任务监控' },
  { key: 'dashboard', title: '仪表盘' }
];

const TopNavbar: React.FC<TopNavbarProps> = ({ currentPage, onPageChange, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="top-navbar">
      <div className="navbar-brand">
        <h1>数据库巡检系统</h1>
      </div>
      
      <div className="navbar-toggle" onClick={toggleMobileMenu}>
        <span className="toggle-bar"></span>
        <span className="toggle-bar"></span>
        <span className="toggle-bar"></span>
      </div>
      
      <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="navbar-start">
          {NAV_ITEMS.map(item => (
            <div
              key={item.key}
              className={`navbar-item ${currentPage === item.key ? 'active' : ''}`}
              onClick={() => {
                onPageChange(item.key);
                setMobileMenuOpen(false);
              }}
            >
              {item.title}
            </div>
          ))}
        </div>
        
        <div className="navbar-end">
          <button onClick={onLogout} className="logout-button">
            退出
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar; 