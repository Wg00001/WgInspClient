import React, { useState } from 'react';
import { AgentConfig } from '../../types/config';
import ConfigEditForm from '../ConfigEditForm';
import { wsClient } from '../../services/wsClient';

interface AgentConfigDetailProps {
  config: AgentConfig;
  onEdit: (config: AgentConfig) => void;
  onDelete?: () => void;
}

const AgentConfigDetail: React.FC<AgentConfigDetailProps> = ({ config, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [configData, setConfigData] = useState<AgentConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: any) => {
    console.error('Error:', error);
    setError('处理配置时发生错误');
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = (updatedConfig: AgentConfig) => {
    onEdit(updatedConfig);
    setIsEditing(false);
    wsClient.sendUpdate('Agent', updatedConfig);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    wsClient.sendDelete('Agent', config.Driver);
  };

  const handleCreate = (newConfig: AgentConfig) => {
    wsClient.sendCreate('Agent', newConfig);
  };

  if (isEditing) {
    return (
      <div className="config-edit-container">
        <ConfigEditForm
          config={config}
          onCancel={handleCancel}
          onSave={handleSave}
          onDelete={handleDelete}
          type="Agent"
        />
      </div>
    );
  }

  return (
    <div className="config-detail-card">
      <div className="config-detail-header">
        <h3>Agent 配置</h3>
        <div className="header-buttons">
          <button onClick={handleEdit} className="btn-edit">修改配置</button>
          <button onClick={() => handleCreate(config)} className="btn-create">创建配置</button>
        </div>
      </div>
      <div className="config-detail-content">
        {error && <div className="error-message">{error}</div>}
        <div className="config-detail-item">
          <span className="config-detail-label">驱动</span>
          <span className="config-detail-value">{config.Driver}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">URL</span>
          <span className="config-detail-value">{config.Url}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">API密钥</span>
          <span className="config-detail-value">******</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">模型</span>
          <span className="config-detail-value">{config.Model}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">温度</span>
          <span className="config-detail-value">{config.Temperature}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">系统消息</span>
          <span className="config-detail-value">{config.SystemMessage}</span>
        </div>
      </div>
    </div>
  );
};

export default AgentConfigDetail; 