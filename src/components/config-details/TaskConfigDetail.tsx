import React, { useState } from 'react';
import { TaskConfig } from '../../types/config';
import ConfigEditForm from './ConfigEditForm';

interface TaskConfigDetailProps {
  config: TaskConfig;
  onEdit: (config: TaskConfig) => void;
  onDelete?: () => void;
  onCreate?: (config: TaskConfig) => void;
}

const TaskConfigDetail: React.FC<TaskConfigDetailProps> = ({ config, onEdit, onDelete, onCreate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = (updatedConfig: TaskConfig) => {
    onEdit(updatedConfig);
    setIsEditing(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
  };

  const handleCreateSave = (newConfig: TaskConfig) => {
    onCreate?.(newConfig);
    setIsCreating(false);
  };

  const handleCreateCancel = () => {
    setIsCreating(false);
  };

  if (isEditing) {
    return (
      <div className="config-edit-container">
        <ConfigEditForm
          config={config}
          onCancel={handleCancel}
          onSave={handleSave}
          onDelete={onDelete}
          type="Task"
        />
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="config-edit-container">
        <ConfigEditForm
          config={{
            Identity: '',
            Driver: '',
            Cron: {
              CronTab: '',
              Duration: 0,
              AtTime: null,
              Weekly: null,
              Monthly: null
            },
            AllInspector: false,
            LogID: '',
            TargetDB: [],
            Todo: [],
            NotTodo: null
          }}
          onCancel={handleCreateCancel}
          onSave={handleCreateSave}
          type="Task"
        />
      </div>
    );
  }

  return (
    <div className="config-detail-card">
      <div className="config-detail-header">
        <h3>{config.Identity}</h3>
        <div className="header-buttons">
          <button onClick={handleEdit} className="btn-edit">修改配置</button>
        </div>
      </div>
      <div className="config-detail-content">
        <div className="config-detail-item">
          <span className="config-detail-label">驱动</span>
          <span className="config-detail-value">{config.Driver}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">定时表达式</span>
          <span className="config-detail-value">{config.Cron.CronTab}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">持续时间</span>
          <span className="config-detail-value">{config.Cron.Duration}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">执行时间</span>
          <span className="config-detail-value">{config.Cron.AtTime?.join(', ') || '无'}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">每周执行</span>
          <span className="config-detail-value">{config.Cron.Weekly?.join(', ') || '无'}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">每月执行</span>
          <span className="config-detail-value">{config.Cron.Monthly?.join(', ') || '无'}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">全量巡检</span>
          <span className="config-detail-value">{config.AllInspector ? '是' : '否'}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">日志ID</span>
          <span className="config-detail-value">{config.LogID}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">目标数据库</span>
          <span className="config-detail-value">{config.TargetDB.join(', ')}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">执行项</span>
          <span className="config-detail-value">{config.Todo.join(', ')}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">排除项</span>
          <span className="config-detail-value">{config.NotTodo?.join(', ') || '无'}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskConfigDetail; 