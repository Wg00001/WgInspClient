import React, { useState, useEffect } from 'react';
import { MetricItem } from './MetricItem';
import { wsClient } from '../services/wsClient';
import { SystemMetrics } from '../types/metrics';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    connections: 0,
    queueSize: 0,
    lastUpdated: Date.now()
  });

  useEffect(() => {
    wsClient.subscribe<SystemMetrics>('Metrics', (data) => {
      setMetrics(prev => ({ ...prev, ...data }));
    });
  }, []);

  return (
    <div className="dashboard">
      <MetricItem 
        title="活跃连接" 
        value={metrics.connections}
        trend={metrics.connections > 0 ? 'up' : 'down'} 
      />
      <MetricItem
        title="任务队列"
        value={metrics.queueSize}
        threshold={100}
      />
    </div>
  );
};

export default Dashboard; 