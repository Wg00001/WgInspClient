import React from 'react';

interface MetricProps {
  title: string;
  value: number;
  trend?: 'up' | 'down';
  threshold?: number;
}

export const MetricItem = ({ title, value, trend, threshold }: MetricProps) => (
  <div className="metric-item">
    <h3>{title}</h3>
    <div className={`value ${trend || ''}`}>{value}</div>
    {threshold && <div className="threshold">阈值: {threshold}</div>}
  </div>
); 