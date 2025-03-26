import React, { useState } from 'react';

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
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    onDelete?.();
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const renderField = (field: string, value: any, label: string) => {
    if (field === 'Identity') {
      return (
        <div className="form-group">
          <label>{label}</label>
          <input
            type="text"
            value={value}
            disabled
            className="form-control"
          />
        </div>
      );
    }

    if (Array.isArray(value)) {
      return (
        <div className="form-group">
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
        <div className="form-group">
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
      <div className="form-group">
        <label>{label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          className="form-control"
        />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="config-edit-form">
      {Object.entries(config).map(([field, value]) => (
        <div key={field}>
          {renderField(field, value, field)}
        </div>
      ))}
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
              <button onClick={confirmDelete} className="btn-confirm-delete">
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