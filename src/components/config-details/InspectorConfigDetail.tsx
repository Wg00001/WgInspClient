import React, { useState } from 'react';
import { InspectorConfig } from '../../types/config';
import ConfigEditForm from '../ConfigEditForm';

interface InspectorConfigDetailProps {
  config: InspectorConfig;
  onEdit: (config: InspectorConfig) => void;
  onDelete?: () => void;
}

const InspectorConfigDetail: React.FC<InspectorConfigDetailProps> = ({ config, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = (updatedConfig: InspectorConfig) => {
    onEdit(updatedConfig);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };


  if (isEditing) {
    return (
      <div className="config-edit-container">
        <ConfigEditForm
          config={config}
          onCancel={handleCancel}
          onSave={handleSave}
          onDelete={handleDelete}
          type="Inspector"
        />
      </div>
    );
  }

  return (
    <div className="config-detail-card">
      <div className="config-detail-header">
        <h3>{config.Name}</h3>
        <div className="header-buttons">
          <button onClick={handleEdit} className="btn-edit">修改配置</button>
        </div>
      </div>
      <div className="config-detail-content">
        <div className="config-detail-item">
          <span className="config-detail-label">SQL</span>
          <span className="config-detail-value">{config.SQL}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">告警条件</span>
          <span className="config-detail-value">{config.AlertWhen || '无'}</span>
        </div>
      </div>
    </div>
  );
};

export default InspectorConfigDetail;
