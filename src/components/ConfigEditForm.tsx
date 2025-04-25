import React, { useState, useEffect } from 'react';
import '../styles/ConfigEditForm.css';
import { Identity, ConfigType } from '../types/config';
import { wsClient } from '../services/wsClient';

interface ConfigEditFormProps {
  config: any;
  onCancel: () => void;
  onSave: (updatedConfig: any) => void;
  onDelete?: () => void;
  type: ConfigType | string;
}

// 标识哪些字段是 Identity[] 类型，以便特殊处理
const identityArrayFields: Record<string, Record<string, ConfigType>> = {
  // TaskConfig 相关字段
  'TargetDB': { type: 'db_config' },
  'Todo': { type: 'inspector_config' },
  'NotTodo': { type: 'inspector_config' },
  // AgentTaskConfig 相关字段
  'KBase': { type: 'kbase_config' },
  'TaskNames': { type: 'task_config' }, // LogFilter 子字段
  'DBNames': { type: 'db_config' }, // LogFilter 子字段
  'InspNames': { type: 'inspector_config' } // LogFilter 子字段
};

const ConfigEditForm: React.FC<ConfigEditFormProps> = ({ config, onCancel, onSave, onDelete, type }) => {
  const [formData, setFormData] = React.useState(config);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [identityOptions, setIdentityOptions] = useState<Record<string, Identity[]>>({});
  const [selectedField, setSelectedField] = useState<string | null>(null);
  
  useEffect(() => {
    // 为所有 Identity[] 类型的字段预先加载可选值
    Object.entries(identityArrayFields).forEach(([field, { type }]) => {
      wsClient.sendGetIdRequest(type as ConfigType);
    });
    
    // 监听服务端响应
    const handleGetIdResponse = (response: any) => {
      if (response.action === 'config_get_id' && response.success && response.config_data) {
        setIdentityOptions(prev => ({
          ...prev,
          [response.config_type]: response.config_data
        }));
      }
    };
    
    wsClient.subscribe('config_get_id', handleGetIdResponse);
    
    return () => {
      wsClient.unsubscribe('config_get_id');
    };
  }, []);

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

  // 处理嵌套字段的值更新，例如 LogFilter.TaskNames
  const handleNestedChange = (parent: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
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

  // 处理添加 Identity 到数组
  const handleAddIdentity = (field: string, identity: Identity) => {
    // 检查是否已存在该 Identity
    const currentArray = formData[field] || [];
    const exists = currentArray.some((item: Identity) => item.ID === identity.ID);
    
    if (!exists) {
      handleChange(field, [...currentArray, identity]);
    }
    
    // 关闭选择面板
    setSelectedField(null);
  };

  // 处理添加 Identity 到嵌套字段
  const handleAddNestedIdentity = (parent: string, field: string, identity: Identity) => {
    const parentObj = formData[parent] || {};
    const currentArray = parentObj[field] || [];
    const exists = currentArray.some((item: Identity) => item.ID === identity.ID);
    
    if (!exists) {
      handleNestedChange(parent, field, [...currentArray, identity]);
    }
    
    // 关闭选择面板
    setSelectedField(null);
  };

  // 从数组中移除 Identity
  const handleRemoveIdentity = (field: string, id: number) => {
    const newArray = (formData[field] || []).filter((item: Identity) => item.ID !== id);
    handleChange(field, newArray);
  };

  // 从嵌套字段中移除 Identity
  const handleRemoveNestedIdentity = (parent: string, field: string, id: number) => {
    const parentObj = formData[parent] || {};
    const newArray = (parentObj[field] || []).filter((item: Identity) => item.ID !== id);
    handleNestedChange(parent, field, newArray);
  };

  // 渲染 Identity 数组选择器
  const renderIdentitySelector = (field: string, configType: ConfigType) => {
    return (
      <div className="identity-selector">
        <h4>选择 {field}</h4>
        <div className="identity-list">
          {identityOptions[configType]?.map((identity) => (
            <div 
              key={identity.ID} 
              className="identity-option"
              onClick={() => handleAddIdentity(field, identity)}
            >
              {identity.Name}
            </div>
          ))}
        </div>
        <button 
          type="button" 
          className="btn-cancel"
          onClick={() => setSelectedField(null)}
        >
          关闭
        </button>
      </div>
    );
  };

  // 渲染嵌套字段的 Identity 数组选择器
  const renderNestedIdentitySelector = (parent: string, field: string, configType: ConfigType) => {
    return (
      <div className="identity-selector">
        <h4>选择 {field}</h4>
        <div className="identity-list">
          {identityOptions[configType]?.map((identity) => (
            <div 
              key={identity.ID} 
              className="identity-option"
              onClick={() => handleAddNestedIdentity(parent, field, identity)}
            >
              {identity.Name}
            </div>
          ))}
        </div>
        <button 
          type="button" 
          className="btn-cancel"
          onClick={() => setSelectedField(null)}
        >
          关闭
        </button>
      </div>
    );
  };

  // 渲染 Identity 数组字段
  const renderIdentityArrayField = (field: string, value: Identity[], label: string) => {
    const configType = identityArrayFields[field]?.type;
    if (!configType) return null;

    return (
      <div className="form-group identity-array-field" key={field}>
        <label>{label}</label>
        <div className="selected-identities">
          {value?.map((identity: Identity) => (
            <div key={identity.ID} className="selected-identity">
              <span>{identity.Name}</span>
              <button
                type="button"
                onClick={() => handleRemoveIdentity(field, identity.ID)}
                className="btn-remove-identity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSelectedField(field)}
          className="btn-add-identity"
        >
          添加{label}
        </button>
        
        {selectedField === field && renderIdentitySelector(field, configType as ConfigType)}
      </div>
    );
  };

  // 渲染嵌套的 Identity 数组字段
  const renderNestedIdentityArrayField = (parent: string, field: string, value: Identity[], label: string) => {
    const configType = identityArrayFields[field]?.type;
    if (!configType) return null;

    return (
      <div className="nested-field identity-array-field" key={`${parent}.${field}`}>
        <label>{label}</label>
        <div className="selected-identities">
          {value?.map((identity: Identity) => (
            <div key={identity.ID} className="selected-identity">
              <span>{identity.Name}</span>
              <button
                type="button"
                onClick={() => handleRemoveNestedIdentity(parent, field, identity.ID)}
                className="btn-remove-identity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSelectedField(`${parent}.${field}`)}
          className="btn-add-identity"
        >
          添加{label}
        </button>
        
        {selectedField === `${parent}.${field}` && 
          renderNestedIdentitySelector(parent, field, configType as ConfigType)}
      </div>
    );
  };

  const renderField = (field: string, value: any, label: string) => {
    // 处理 Identity 数组类型字段
    if (field in identityArrayFields && Array.isArray(value)) {
      return renderIdentityArrayField(field, value, label);
    }

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

    if (field === 'LogFilter' && typeof value === 'object') {
      return (
        <div className="form-group" key={field}>
          <label>{label}</label>
          {Object.entries(value).map(([key, val]) => {
            // 特殊处理 LogFilter 中的 Identity 数组字段
            if (key in identityArrayFields && Array.isArray(val)) {
              return renderNestedIdentityArrayField(field, key, val as Identity[], key);
            }
            
            return (
              <div key={key} className="nested-field">
                <label>{key}</label>
                <input
                  type="text"
                  value={val as string}
                  onChange={(e) => handleNestedChange(field, key, e.target.value)}
                  className="form-control"
                />
              </div>
            );
          })}
        </div>
      );
    }

    if (Array.isArray(value) && !Object.keys(identityArrayFields).includes(field)) {
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