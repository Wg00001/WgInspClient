import React, { useState } from 'react';
import { KnowledgeBaseConfig } from '../../types/config';
import ConfigEditForm from '../ConfigEditForm';

interface KBaseConfigDetailProps {
  config: KnowledgeBaseConfig;
  onEdit: (config: KnowledgeBaseConfig) => void;
  onDelete?: () => void;
}

const KBaseConfigDetail: React.FC<KBaseConfigDetailProps> = ({ config, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = (updatedConfig: KnowledgeBaseConfig) => {
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
          type="kbase_config"
        />
      </div>
    );
  }

  // 获取配置中所有字段
  const renderConfigDetails = () => {
    if (!config.Option) return null;
    
    return Object.entries(config.Option).map(([key, value]) => {
      return (
        <div key={key} className="config-detail-item">
          <span className="config-detail-label">{key}</span>
          <span className="config-detail-value">{String(value)}</span>
        </div>
      );
    });
  };

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
        {/* 显示 AgentID (如果存在) */}
        {config.AgentID && (
          <div className="config-detail-item">
            <span className="config-detail-label">Agent ID</span>
            <span className="config-detail-value">{config.AgentID.Name} (ID: {config.AgentID.ID})</span>
          </div>
        )}
        {/* 点击详细信息后显示所有 Option 字段 */}
        {showDetails && (
          <div className="config-details-section">
            <h4>详细配置 (Option)</h4>
            {renderConfigDetails()}
          </div>
        )}
      </div>
    </div>
  );
};

export default KBaseConfigDetail; 