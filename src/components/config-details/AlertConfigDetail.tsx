import React, { useState } from 'react';
import { AlertConfig } from '../../types/config';
import ConfigEditForm from '../ConfigEditForm';
import { wsClient } from '../../services/wsClient';

interface AlertConfigDetailProps {
  config: AlertConfig;
  onEdit: (config: AlertConfig) => void;
  onDelete?: () => void;
}

const AlertConfigDetail: React.FC<AlertConfigDetailProps> = ({ config, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = (updatedConfig: AlertConfig) => {
    onEdit(updatedConfig);
    wsClient.sendUpdate('Alert', updatedConfig);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    wsClient.sendDelete('Alert', config.Identity);
  };

  const handleCreate = (newConfig: AlertConfig) => {
    wsClient.sendCreate('Alert', newConfig);
  };

  if (isEditing) {
    return (
      <div className="config-edit-container">
        <ConfigEditForm
          config={config}
          onCancel={handleCancel}
          onSave={handleSave}
          onDelete={handleDelete}
          type="Alert"
        />
      </div>
    );
  }

  return (
    <div className="config-detail-card">
      <div className="config-detail-header">
        <h3>{config.Identity}</h3>
        <button onClick={handleEdit} className="btn-edit">修改配置</button>
        <button onClick={() => handleCreate(config)} className="btn-create">创建配置</button>
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

export default AlertConfigDetail; 