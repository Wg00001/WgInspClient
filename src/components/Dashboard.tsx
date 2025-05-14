import React from 'react';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const grafanaUrl = process.env.REACT_APP_GRAFANA_URL || "http://localhost:3000/dashboards";
  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <iframe 
          src={grafanaUrl}
          title="Grafana Dashboard"
          className="dashboard-iframe"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default Dashboard; 