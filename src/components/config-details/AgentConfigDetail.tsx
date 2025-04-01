import React, { useState } from 'react';
import { AgentConfig } from '../../types/config';
import ConfigEditForm from './ConfigEditForm';

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
  };

  const handleConfigMeta = (meta: any) => {
    try {
      console.log('接收到配置元数据:', meta);
      if (meta.action === 'config_save') {
        if (meta.success) {
          console.log('配置保存成功，更新状态');
          setConfigData(meta.config_data);
          setError(null);
        } else {
          console.error('配置保存失败:', meta.message);
          setError(meta.message || '配置保存失败');
        }
      } else if (meta && meta.success && meta.config_data) {
        console.log('配置数据有效，更新状态');
        setConfigData(meta.config_data);
        setError(null);
      } else {
        console.error('无效的配置元数据格式:', meta);
        setError(meta.message || '配置数据格式无效');
      }
    } catch (err) {
      console.error('处理配置元数据时出错:', err);
      handleError(err);
    } finally {
      console.log('设置加载状态为 false');
      setIsLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="config-edit-container">
        <ConfigEditForm
          config={config}
          onCancel={handleCancel}
          onSave={handleSave}
          onDelete={onDelete}
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