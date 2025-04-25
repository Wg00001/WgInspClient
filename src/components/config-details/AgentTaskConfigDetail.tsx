import React, { useState } from 'react';
import { AgentTaskConfig } from '../../types/config';
import ConfigEditForm from '../ConfigEditForm';

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
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  // Helper to display array of Identity names or '无'
  const displayIdentityArray = (identities: { Name: string }[] | undefined | null) => {
    return identities && identities.length > 0 ? identities.map(item => item.Name).join(', ') : '无';
  };

  // Helper to display single Identity name or '无'
  const displayIdentityName = (identity: { Name: string } | undefined | null) => {
    return identity ? identity.Name : '无';
  };

  // Helper to display array of strings or '无'
  const displayStringArray = (arr: string[] | undefined | null) => {
    return arr && arr.length > 0 ? arr.join(', ') : '无';
  };

  if (isEditing) {
    return (
      <div className="config-edit-container">
        <ConfigEditForm
          config={config}
          onCancel={handleCancel}
          onSave={handleSave}
          onDelete={handleDelete}
          type="agent_task_config"
        />
      </div>
    );
  }

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
          <span className="config-detail-label">分析AI</span>
          <span className="config-detail-value">{displayIdentityName(config.AgentID)}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">日志ID</span>
          <span className="config-detail-value">{displayIdentityName(config.LogID)}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">告警ID</span>
          <span className="config-detail-value">{displayIdentityName(config.AlertID)}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">知识库</span>
          <span className="config-detail-value">{displayIdentityArray(config.KBase)}</span>
        </div>
        <div className="config-detail-item">
          <span className="config-detail-label">知识库AI</span>
          <span className="config-detail-value">{displayIdentityName(config.KBaseAgentID)}</span>
        </div>


        {showDetails && (
          <>
            <h4>Cron 配置</h4>
            <div className="config-detail-item">
              <span className="config-detail-label">定时表达式</span>
              <span className="config-detail-value">{config.Cron.CronTab}</span>
            </div>
            <div className="config-detail-item">
              <span className="config-detail-label">持续时间(纳秒)</span>
              <span className="config-detail-value">{config.Cron.Duration}</span>
            </div>
            <div className="config-detail-item">
              <span className="config-detail-label">执行时间</span>
              <span className="config-detail-value">{displayStringArray(config.Cron.AtTime)}</span>
            </div>
            <div className="config-detail-item">
              <span className="config-detail-label">每周执行</span>
              <span className="config-detail-value">{displayStringArray(config.Cron.Weekly?.map(String))}</span>
            </div>
            <div className="config-detail-item">
              <span className="config-detail-label">每月执行</span>
              <span className="config-detail-value">{displayStringArray(config.Cron.Monthly?.map(String))}</span>
            </div>

            <h4>知识库配置</h4>
            <div className="config-detail-item">
              <span className="config-detail-label">知识库结果数</span>
              <span className="config-detail-value">{config.KBaseResults}</span>
            </div>
            <div className="config-detail-item">
              <span className="config-detail-label">知识库最大长度</span>
              <span className="config-detail-value">{config.KBaseMaxLen}</span>
            </div>

            <h4>日志过滤配置</h4>
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
              <span className="config-detail-value">{displayIdentityArray(config.LogFilter.TaskNames)}</span>
            </div>
            <div className="config-detail-item">
              <span className="config-detail-label">日志过滤数据库名称</span>
              <span className="config-detail-value">{displayIdentityArray(config.LogFilter.DBNames)}</span>
            </div>
            <div className="config-detail-item">
              <span className="config-detail-label">日志过滤任务ID</span>
              <span className="config-detail-value">{displayStringArray(config.LogFilter.TaskIDs)}</span>
            </div>
            <div className="config-detail-item">
              <span className="config-detail-label">日志过滤巡检名称</span>
              <span className="config-detail-value">{displayIdentityArray(config.LogFilter.InspNames)}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AgentTaskConfigDetail; 