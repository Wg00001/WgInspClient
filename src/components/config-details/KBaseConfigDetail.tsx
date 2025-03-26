import React, { useState } from 'react';
import { KnowledgeBaseConfig } from '../../types/config';
import ConfigEditForm from './ConfigEditForm';

interface KBaseConfigDetailProps {
  config: KnowledgeBaseConfig;
  onEdit: (config: KnowledgeBaseConfig) => void;
  onDelete?: () => void;
}

const KBaseConfigDetail: React.FC<KBaseConfigDetailProps> = ({ config, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);

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

  if (isEditing) {
    return (
      <div className="config-edit-container">
        <ConfigEditForm
          config={config}
          onCancel={handleCancel}
          onSave={handleSave}
          onDelete={onDelete}
          type="KBase"
        />
      </div>
    );
  }

  return (
    <div className="config-detail-card">
      <div className="config-detail-header">
        <h3>{config.Identity || '知识库配置'}</h3>
        <button onClick={handleEdit} className="btn-edit">修改配置</button>
      </div>
      <div className="config-detail-content">
        <div className="config-detail-item">
          <span className="config-detail-label">驱动</span>
          <span className="config-detail-value">{config.Driver}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">集合名称</span>
          <span className="config-detail-value">{config.Value.collection}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">路径</span>
          <span className="config-detail-value">{config.Value.path}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">嵌入驱动</span>
          <span className="config-detail-value">{config.Value.embedding.driver}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">基础URL</span>
          <span className="config-detail-value">{config.Value.embedding.baseurl}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">模型</span>
          <span className="config-detail-value">{config.Value.embedding.model}</span>
        </div>
      </div>
    </div>
  );
};

export default KBaseConfigDetail; 