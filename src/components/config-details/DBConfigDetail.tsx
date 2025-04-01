import React, { useState } from 'react';
import { DBConfig } from '../../types/config';
import ConfigEditForm from '../ConfigEditForm';
import { wsClient } from '../../services/wsClient';

interface DBConfigDetailProps {
  config: DBConfig;
  onEdit: (config: DBConfig) => void;
  onDelete?: () => void;
}

const DBConfigDetail: React.FC<DBConfigDetailProps> = ({ config, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = (updatedConfig: DBConfig) => {
    onEdit(updatedConfig);
    wsClient.sendUpdate('DB', updatedConfig);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete?.();
    wsClient.sendDelete('DB', config.Identity);
  };

  const handleCreate = (newConfig: DBConfig) => {
    wsClient.sendCreate('DB', newConfig);
  };

  if (isEditing) {
    return (
      <div className="config-edit-container">
        <ConfigEditForm
          config={config}
          onCancel={handleCancel}
          onSave={handleSave}
          onDelete={handleDelete}
          type="DB"
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
        <div className="config-detail-item">
          <span className="config-detail-label">连接串</span>
          <span className="config-detail-value">{config.DSN}</span>
        </div>
      </div>
    </div>
  );
};

export default DBConfigDetail; 