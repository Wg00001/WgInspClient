import React, { useState } from 'react';
import { InspectorConfig } from '../../types/config';
import ConfigEditForm from './ConfigEditForm';

interface InspectorConfigDetailProps {
  config: InspectorConfig;
  onEdit: (config: InspectorConfig) => void;
  onDelete?: () => void;
}

const InspectorConfigDetail: React.FC<InspectorConfigDetailProps> = ({ config, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [expandedChildren, setExpandedChildren] = useState<Record<string, boolean>>({});

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

  const toggleChild = (childId: string) => {
    setExpandedChildren(prev => ({
      ...prev,
      [childId]: !prev[childId]
    }));
  };

  if (isEditing) {
    return (
      <div className="config-edit-container">
        <ConfigEditForm
          config={config}
          onCancel={handleCancel}
          onSave={handleSave}
          onDelete={onDelete}
          type="Inspector"
        />
      </div>
    );
  }

  return (
    <div className="config-detail-card">
      <div className="config-detail-header">
        <h3>{config.Name}</h3>
        <button onClick={handleEdit} className="btn-edit">修改配置</button>
      </div>
      <div className="config-detail-content">
        <div className="config-detail-item">
          <span className="config-detail-label">SQL语句</span>
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

        {config.Children && config.Children.length > 0 && (
          <div className="inspector-children">
            <div className="children-header">
              <h4>子配置项</h4>
            </div>
            {config.Children.map(child => (
              <div key={child.ID} className="inspector-child">
                <div 
                  className="child-header"
                  onClick={() => toggleChild(child.ID)}
                >
                  <span className="child-name">{child.Name}</span>
                  <span className="child-toggle">
                    {expandedChildren[child.ID] ? '收起' : '展开'}
                  </span>
                </div>
                {expandedChildren[child.ID] && (
                  <div className="child-details">
                    <InspectorConfigDetail
                      config={child}
                      onEdit={onEdit}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InspectorConfigDetail;
