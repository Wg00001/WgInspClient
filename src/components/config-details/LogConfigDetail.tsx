import React, { useState } from 'react';
import { LogConfig } from '../../types/config';
import ConfigEditForm from './ConfigEditForm';

interface LogConfigDetailProps {
  config: LogConfig;
  onEdit: (config: LogConfig) => void;
  onDelete?: () => void;
}

const LogConfigDetail: React.FC<LogConfigDetailProps> = ({ config, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = (updatedConfig: LogConfig) => {
    onEdit(updatedConfig);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="config-edit-container">
        <ConfigEditForm
          config={config}
          onCancel={handleCancel}
          onSave={handleSave}
          onDelete={onDelete}
          type="Log"
        />
      </div>
    );
  }

  return (
    <div className="config-detail-card">
      <div className="config-detail-header">
        <h3>{config.Identity}</h3>
        <button onClick={handleEdit} className="btn-edit">修改配置</button>
      </div>
      <div className="config-detail-content">
        <div className="config-detail-item">
          <span className="config-detail-label">驱动</span>
          <span className="config-detail-value">{config.Driver}</span>
        </div>
        {Object.entries(config.Header).map(([key, value]) => (
          <div key={key} className="config-detail-item">
            <span className="config-detail-label">{key}</span>
            <span className="config-detail-value">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogConfigDetail; 