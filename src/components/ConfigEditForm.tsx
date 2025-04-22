import React, { useState } from 'react';
import '../styles/ConfigEditForm.css';

interface ConfigEditFormProps {
  config: any;
  onCancel: () => void;
  onSave: (updatedConfig: any) => void;
  onDelete?: () => void;
  type: string;
}

const ConfigEditForm: React.FC<ConfigEditFormProps> = ({ config, onCancel, onSave, onDelete, type }) => {
  const [formData, setFormData] = React.useState(config);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleChange = (field: string, value: any) => {
    if (field === 'Cron' && typeof value === 'object' && 'Duration' in value) {
      // 确保 Duration 是数字类型
      const duration = parseInt(value.Duration, 10);
      value = {
        ...value,
        Duration: isNaN(duration) ? 0 : duration
      };
    }
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 在提交前确保 Cron.Duration 是数字
    const processedData = { ...formData };
    if (processedData.Cron?.Duration) {
      processedData.Cron.Duration = parseInt(processedData.Cron.Duration, 10) || 0;
    }
    // 验证 Identity 格式
    if (processedData.Identity && !/^[a-z0-9-_]+$/.test(processedData.Identity)) {
      alert('Identity 只能包含小写字母、数字、连字符(-)和下划线(_)');
      return;
    }
    onSave(processedData);
    // 直接关闭编辑模式，因为会很快收到 config_update 消息
    onCancel();
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setShowDeleteConfirm(false);
    if (onCancel) {
      onCancel(); // 删除后退出编辑页面
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const renderField = (field: string, value: any, label: string) => {
    if (field === 'Identity') {
      return (
        <div className="form-group" key={field}>
          <label>{label}</label>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            className="form-control"
          />
        </div>
      );
    }

    if (field === 'Option' && typeof value === 'object') {
      return (
        <div className="form-group" key={field}>
          <label>{label}</label>
          <div className="option-list">
            {Object.entries(value).map(([key, val], index) => (
              <div key={index} className="option-item">
                <input
                  type="text"
                  value={key}
                  onChange={(e) => {
                    const newOption = { ...value };
                    delete newOption[key];
                    newOption[e.target.value] = val;
                    handleChange(field, newOption);
                  }}
                  className="option-key"
                  placeholder="键"
                />
                <input
                  type="text"
                  value={val as string}
                  onChange={(e) => {
                    const newOption = { ...value };
                    newOption[key] = e.target.value;
                    handleChange(field, newOption);
                  }}
                  className="option-value"
                  placeholder="值"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newOption = { ...value };
                    delete newOption[key];
                    handleChange(field, newOption);
                  }}
                  className="btn-delete-option"
                >
                  删除
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newOption = { ...value, '': '' };
                handleChange(field, newOption);
              }}
              className="btn-add-option"
            >
              添加键值对
            </button>
          </div>
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div className="form-group" key={field}>
          <label>{label}</label>
          <input
            type="text"
            value={value.join(', ')}
            onChange={(e) => handleChange(field, e.target.value.split(',').map(v => v.trim()))}
            className="form-control"
          />
        </div>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <div className="form-group" key={field}>
          <label>{label}</label>
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="nested-field">
              <label>{key}</label>
              <input
                type="text"
                value={val as string}
                onChange={(e) => handleChange(field, { ...value, [key]: e.target.value })}
                className="form-control"
              />
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="form-group" key={field}>
        <label>{label}</label>
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleChange(field, e.target.value)}
          className="form-control"
        />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="config-edit-form">
      {Object.entries(formData).map(([field, value]) => renderField(field, value, field))}
      <div className="form-actions">
        {onDelete && (
          <button 
            type="button" 
            onClick={handleDelete} 
            className="btn-delete"
          >
            删除
          </button>
        )}
        <button type="button" onClick={onCancel} className="btn-cancel">
          取消
        </button>
        <button type="submit" className="btn-save">
          确认修改
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="delete-confirm-modal">
          <div className="modal-content">
            <p>确定要删除此配置吗？此操作不可恢复。</p>
            <div className="modal-actions">
              <button onClick={cancelDelete} className="btn-cancel">
                取消
              </button>
              <button onClick={handleConfirmDelete} className="btn-confirm-delete">
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default ConfigEditForm; 