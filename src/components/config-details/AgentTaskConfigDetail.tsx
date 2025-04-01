import React, { useState } from 'react';
import { AgentTaskConfig } from '../../types/config';
import ConfigEditForm from '../ConfigEditForm';
import { wsClient } from '../../services/wsClient';

interface AgentTaskConfigDetailProps {
  config: AgentTaskConfig;
  onEdit: (config: AgentTaskConfig) => void;
  onDelete?: () => void;
}

const AgentTaskConfigDetail: React.FC<AgentTaskConfigDetailProps> = ({ config, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = (updatedConfig: AgentTaskConfig) => {
    onEdit(updatedConfig);
    setIsEditing(false);
    wsClient.sendUpdate('AgentTask', updatedConfig);
  };

  const handleDelete = () => {
    onDelete?.();
    wsClient.sendDelete('AgentTask', config.Identity);
  };

  const handleCreate = (newConfig: AgentTaskConfig) => {
    wsClient.sendCreate('AgentTask', newConfig);
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
          type="Agent"
        />
      </div>
    );
  }

  return (
    <div className="config-detail-card">
      <div className="config-detail-header">
        <h3>{config.Identity}</h3>
        <div className="header-buttons">
          <button onClick={toggleDetails} className="btn-details">
            {showDetails ? '收起详情' : '详细信息'}
          </button>
          <button onClick={handleEdit} className="btn-edit">修改配置</button>
          <button onClick={() => handleCreate(config)} className="btn-create">创建配置</button>
        </div>
      </div>
      <div className="config-detail-content">
        <div className="config-detail-item">
          <span className="config-detail-label">驱动</span>
          <span className="config-detail-value">{config.Driver}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">日志ID</span>
          <span className="config-detail-value">{config.LogID}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">告警ID</span>
          <span className="config-detail-value">{config.AlertID}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">知识库</span>
          <span className="config-detail-value">{config.KBase?.join(', ') || '无'}</span>
        </div>

        {showDetails && (
          <>
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
              <span className="config-detail-label">知识库结果数</span>
              <span className="config-detail-value">{config.KBaseResults}</span>
            </div>
            <div className="config-detail-item">
              <span className="config-detail-label">知识库最大长度</span>
              <span className="config-detail-value">{config.KBaseMaxLen}</span>
            </div>
            <div className="config-detail-item">
              <span className="config-detail-label">系统消息</span>
              <span className="config-detail-value">{config.SystemMessage}</span>
            </div>
            <div className="config-detail-item">
              <span className="config-detail-label">日志过滤开始时间</span>
              <span className="config-detail-value">{config.LogFilter.StartTime}</span>
            </div>
            <div className="config-detail-item">
              <span className="config-detail-label">日志过滤结束时间</span>
              <span className="config-detail-value">{config.LogFilter.EndTime}</span>
            </div>
            <div className="config-detail-item">
              <span className="config-detail-label">日志过滤任务名称</span>
              <span className="config-detail-value">{config.LogFilter.TaskNames?.join(', ') || '无'}</span>
            </div>
            <div className="config-detail-item">
              <span className="config-detail-label">日志过滤数据库名称</span>
              <span className="config-detail-value">{config.LogFilter.DBNames?.join(', ') || '无'}</span>
            </div>
            <div className="config-detail-item">
              <span className="config-detail-label">日志过滤任务ID</span>
              <span className="config-detail-value">{config.LogFilter.TaskIDs?.join(', ') || '无'}</span>
            </div>
            <div className="config-detail-item">
              <span className="config-detail-label">日志过滤巡检名称</span>
              <span className="config-detail-value">{config.LogFilter.InspNames?.join(', ') || '无'}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AgentTaskConfigDetail; 