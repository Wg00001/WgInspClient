import React, { useState } from 'react';
import { AgentConfig } from '../../types/config';
import ConfigEditForm from '../ConfigEditForm';

interface AgentConfigDetailProps {
  config: AgentConfig;
  onEdit: (config: AgentConfig) => void;
  onDelete?: () => void;
}

const AgentConfigDetail: React.FC<AgentConfigDetailProps> = ({ config, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = (updatedConfig: AgentConfig) => {
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
          type="agent_config"
        />
      </div>
    );
  }

  return (
    <div className="config-detail-card">
      <div className="config-detail-header">
        <h3>智能体 {config.Name}</h3>
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
        <div className="config-detail-item">
          <span className="config-detail-label">URL</span>
          <span className="config-detail-value">{config.Url}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">模型</span>
          <span className="config-detail-value">{config.Model}</span>
        </div>
        
        {showDetails && (
          <div className="config-details-section">
            <h4>详细配置</h4>
            <div className="config-detail-item">
              <span className="config-detail-label">温度</span>
              <span className="config-detail-value">{config.Temperature}</span>
            </div>
            <div className="config-detail-item">
              <span className="config-detail-label">系统消息</span>
              <span className="config-detail-value">{config.SystemMessage}</span>
            </div>
            <div className="config-detail-item">
              <span className="config-detail-label">API Key</span>
              <span className="config-detail-value">******</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentConfigDetail; 