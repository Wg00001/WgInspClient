import React, { useState } from 'react';
import { LogConfig } from '../../types/config';
import ConfigEditForm from '../ConfigEditForm';

interface LogConfigDetailProps {
  config: LogConfig;
  onEdit: (config: LogConfig) => void;
  onDelete?: () => void;
}

const LogConfigDetail: React.FC<LogConfigDetailProps> = ({ config, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  if (isEditing) {
    return (
      <div className="config-edit-container">
        <ConfigEditForm
          config={config}
          onCancel={handleCancel}
          onSave={handleSave}
          onDelete={handleDelete}
          type="Log"
        />
      </div>
    );
  }

  return (
    <div className="config-detail-card">
      <div className="config-detail-header">
        <h3>{config.Name}</h3>
        <div className="header-buttons">
          <button onClick={toggleDetails} className="btn-details">
            {showDetails ? '收起详情' : '详细信息'}
          </button>
          <button onClick={handleEdit} className="btn-edit">修改配置</button>
        </div>
      </div>
      <div className="config-detail-content">
        <div className="config-detail-item">
          <span className="config-detail-label">驱动</span>
          <span className="config-detail-value">{config.Driver}</span>
        </div>
        {showDetails && (
          <>
            {Object.entries(config.Option).map(([key, value]) => (
              <div key={key} className="config-detail-item">
                <span className="config-detail-label">{key}</span>
                <span className="config-detail-value">{value}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default LogConfigDetail; 