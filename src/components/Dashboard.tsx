import React from 'react';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <iframe 
          src="http://localhost:3000/dashboards"
          title="Grafana Dashboard"
          className="dashboard-iframe"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default Dashboard; 