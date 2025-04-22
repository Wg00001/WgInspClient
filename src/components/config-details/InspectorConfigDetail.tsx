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

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const hasChildren = !!(config.Children && config.Children.length > 0);

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
        <h3>{config.Name || config.ID}</h3>
        <div className="header-buttons">
          {hasChildren && (
            <button onClick={toggleDetails} className="btn-details">
              {showDetails ? '收起详情' : '详细信息'}
            </button>
          )}
          <button onClick={handleEdit} className="btn-edit">修改配置</button>
        </div>
      </div>
      <div className="config-detail-content">
        <div className="config-detail-item">
          <span className="config-detail-label">SQL</span>
          <span className="config-detail-value">{config.SQL}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">告警ID</span>
          <span className="config-detail-value">{config.AlertID || '无'}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">告警条件</span>
          <span className="config-detail-value">{config.AlertWhen || '无'}</span>
        </div>

        {showDetails && hasChildren && (
          <div className="inspector-children">
            <div className="children-header">
              <h4>子巡检项</h4>
            </div>
            <div className="children-list">
              {config.Children.map((child, index) => (
                <div key={index} className="inspector-child">
                  <div className="child-header" onClick={() => {}}>
                    <span className="child-name">{child.Name || child.ID}</span>
                  </div>
                  <div className="child-details">
                    <div className="config-detail-item">
                      <span className="config-detail-label">名称</span>
                      <span className="config-detail-value">{child.Name || child.ID}</span>
                    </div>
                    <div className="config-detail-item">
                      <span className="config-detail-label">SQL</span>
                      <span className="config-detail-value">{child.SQL}</span>
                    </div>
                    {child.AlertID && (
                      <div className="config-detail-item">
                        <span className="config-detail-label">告警ID</span>
                        <span className="config-detail-value">{child.AlertID}</span>
                      </div>
                    )}
                    {child.AlertWhen && (
                      <div className="config-detail-item">
                        <span className="config-detail-label">告警条件</span>
                        <span className="config-detail-value">{child.AlertWhen}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectorConfigDetail;
