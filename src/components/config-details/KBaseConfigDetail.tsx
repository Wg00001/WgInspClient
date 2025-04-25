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
    if (!config.Value) return null;
    
    return Object.entries(config.Value).map(([key, value]) => {
      // 对于嵌套对象，如 embedding
      if (typeof value === 'object' && value !== null) {
        return (
          <React.Fragment key={key}>
            <div className="config-detail-item">
              <span className="config-detail-label">{key}</span>
              <span className="config-detail-value">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
            {typeof value === 'object' && Object.entries(value as Record<string, any>).map(([nestedKey, nestedValue]) => (
              <div key={`${key}-${nestedKey}`} className="config-detail-item nested-item">
                <span className="config-detail-label">{key}.{nestedKey}</span>
                <span className="config-detail-value">
                  {typeof nestedValue === 'object' ? JSON.stringify(nestedValue) : String(nestedValue)}
                </span>
              </div>
            ))}
          </React.Fragment>
        );
      }
      
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
        {/* 基本字段始终显示 */}
        {config.Value && (
          <>
            <div className="config-detail-item">
              <span className="config-detail-label">集合</span>
              <span className="config-detail-value">{config.Value.collection}</span>
            </div>
            <div className="config-detail-item">
              <span className="config-detail-label">路径</span>
              <span className="config-detail-value">{config.Value.path}</span>
            </div>
          </>
        )}
        {/* 点击详细信息后显示所有字段 */}
        {showDetails && (
          <div className="config-details-section">
            <h4>详细配置</h4>
            {renderConfigDetails()}
          </div>
        )}
      </div>
    </div>
  );
};

export default KBaseConfigDetail; 