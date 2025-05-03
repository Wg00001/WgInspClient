import React, { useState, useEffect } from 'react';
import '../styles/ConfigEditForm.css';
import { Identity, ConfigType } from '../types/config';
import { wsClient } from '../services/wsClient';

// 日期时间选择器接口定义
interface DateTimeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

// 日期时间选择器组件
const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({ value, onChange, placeholder }) => {
  // 检查是否为默认空日期
  const isDefaultDate = value === '0001-01-01T00:00:00Z';
  
  // 从ISO格式转换为本地日期时间格式
  const getLocalDateTimeValue = () => {
    if (isDefaultDate) return '';
    
    try {
      const date = new Date(value);
      // 格式化为YYYY-MM-DDThh:mm (HTML datetime-local格式)
      return date.toISOString().slice(0, 16);
    } catch (error) {
      return '';
    }
  };

  // 处理日期时间变更
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!newValue) {
      // 如果清空，使用默认值
      onChange('0001-01-01T00:00:00Z');
      return;
    }
    
    try {
      // 将本地日期时间转换为ISO格式
      const date = new Date(newValue);
      onChange(date.toISOString());
    } catch (error) {
      console.error('日期转换错误:', error);
    }
  };

  return (
    <div className="datetime-selector">
      <input
        type="datetime-local"
        value={getLocalDateTimeValue()}
        onChange={handleChange}
        className="form-control"
        placeholder={placeholder || "选择日期和时间"}
      />
      {value && !isDefaultDate && (
        <button
          type="button"
          onClick={() => onChange('0001-01-01T00:00:00Z')}
          className="btn-clear-date"
        >
          清除
        </button>
      )}
    </div>
  );
};

// Cron表达式选择器接口定义
interface CronSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

// Cron表达式选择器组件
const CronSelector: React.FC<CronSelectorProps> = ({ value, onChange, onClose }) => {
  // 解析初始Cron表达式
  const parseCronExpression = (cronExpression: string): string[] => {
    // 默认值: 每分钟 (0 * * * * *)
    const defaultValues = ['0', '*', '*', '*', '*', '*'];
    
    if (!cronExpression) return defaultValues;
    
    const parts = cronExpression.split(' ');
    return parts.length === 6 ? parts : defaultValues;
  };

  const [cronParts, setCronParts] = useState<string[]>(parseCronExpression(value));
  
  // 字段名称和选项
  const fields = [
    { name: '秒', options: ['0', '*/5', '*/10', '*/15', '*/30', '*'] },
    { name: '分', options: ['0', '*/5', '*/10', '*/15', '*/30', '*'] },
    { name: '时', options: ['0', '*/1', '*/2', '*/4', '*/6', '*/12', '*'] },
    { name: '日', options: ['1', '15', '*'] },
    { name: '月', options: ['*', '1', '3', '6', '9', '12'] },
    { name: '周', options: ['*', '1', '2', '3', '4', '5', '6', '0'] }
  ];

  // 字段中文描述映射
  const fieldDescriptions = [
    { name: '秒', map: { '0': '0秒', '*/5': '每5秒', '*/10': '每10秒', '*/15': '每15秒', '*/30': '每30秒', '*': '每秒' } },
    { name: '分', map: { '0': '0分', '*/5': '每5分钟', '*/10': '每10分钟', '*/15': '每15分钟', '*/30': '每30分钟', '*': '每分钟' } },
    { name: '时', map: { '0': '0点', '*/1': '每小时', '*/2': '每2小时', '*/4': '每4小时', '*/6': '每6小时', '*/12': '每12小时', '*': '每小时' } },
    { name: '日', map: { '1': '1日', '15': '15日', '*': '每天' } },
    { name: '月', map: { '*': '每月', '1': '1月', '3': '3月', '6': '6月', '9': '9月', '12': '12月' } },
    { name: '周', map: { '*': '每天', '1': '周一', '2': '周二', '3': '周三', '4': '周四', '5': '周五', '6': '周六', '0': '周日' } }
  ];

  // 预设Cron表达式
  const presets = [
    { name: '每分钟', value: '0 * * * * *' },
    { name: '每小时', value: '0 0 * * * *' },
    { name: '每天午夜', value: '0 0 0 * * *' },
    { name: '每周一早上', value: '0 0 9 * * 1' },
    { name: '每月1号', value: '0 0 0 1 * *' }
  ];

  // 更新单个Cron字段
  const updateCronPart = (index: number, value: string) => {
    const newParts = [...cronParts];
    newParts[index] = value;
    setCronParts(newParts);
    onChange(newParts.join(' '));
  };

  // 使用预设
  const applyPreset = (presetValue: string) => {
    setCronParts(parseCronExpression(presetValue));
    onChange(presetValue);
  };

  // 获取当前表达式的描述
  const getCronDescription = () => {
    try {
      return cronParts.map((part, index) => 
        fieldDescriptions[index].map[part] || part
      ).join(', ');
    } catch (error) {
      return '自定义表达式';
    }
  };

  // 自定义输入表达式
  const handleManualInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCronParts(parseCronExpression(newValue));
    onChange(newValue);
  };

  return (
    <div className="cron-selector-overlay">
      <div className="cron-selector">
        <h3>定时表达式配置</h3>
        
        <div className="cron-preset-section">
          <h4>常用表达式</h4>
          <div className="cron-presets">
            {presets.map((preset, index) => (
              <button 
                key={index}
                type="button"
                className="cron-preset-button"
                onClick={() => applyPreset(preset.value)}
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        <div className="cron-custom-section">
          <h4>自定义表达式</h4>
          <div className="cron-input-container">
            <input 
              type="text"
              value={cronParts.join(' ')}
              onChange={handleManualInput}
              className="cron-manual-input"
              placeholder="秒 分 时 日 月 周"
            />
          </div>
          
          <div className="cron-fields">
            {fields.map((field, index) => (
              <div key={index} className="cron-field">
                <label>{field.name}</label>
                <select 
                  value={cronParts[index]} 
                  onChange={(e) => updateCronPart(index, e.target.value)}
                >
                  {field.options.map(option => (
                    <option key={option} value={option}>
                      {fieldDescriptions[index].map[option] || option}
                    </option>
                  ))}
                  {!field.options.includes(cronParts[index]) && (
                    <option value={cronParts[index]}>自定义: {cronParts[index]}</option>
                  )}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="cron-description">
          当前表达式: <strong>{cronParts.join(' ')}</strong>
          <p>{getCronDescription()}</p>
        </div>

        <div className="cron-actions">
          <button type="button" onClick={onClose} className="btn-confirm">
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

interface ConfigEditFormProps {
  config: any;
  onCancel: () => void;
  onSave: (updatedConfig: any) => void;
  onDelete?: () => void;
  type: ConfigType | string;
}

// 标识哪些字段是 Identity[] 类型，以便特殊处理
const identityArrayFields: Record<string, { type: ConfigType }> = {
  // TaskConfig 相关字段
  'TargetDB': { type: 'db_config' },
  'Todo': { type: 'inspector_config' },
  'NotTodo': { type: 'inspector_config' },
  'TargetLogID': { type: 'log_config' },
  
  // AgentTaskConfig 相关字段
  'KBase': { type: 'kbase_config' },
  'LogID': { type: 'log_config' },
  'AgentID': { type: 'agent_config' },
  'AlertID': { type: 'alert_config' },
  'KBaseAgentID': { type: 'agent_config' },
  
  // LogFilter 子字段
  'TaskNames': { type: 'task_config' },
  'DBNames': { type: 'db_config' },
  'InspNames': { type: 'inspector_config' }
};

// LogFilter 时间字段
const logFilterTimeFields = ['StartTime', 'EndTime'];

// 数字字段配置
const numericFields: Record<string, { min?: number; max?: number; step?: number }> = {
  'Temperature': { min: 0, max: 1, step: 0.1 },
  'KBaseResults': { min: 0, step: 1 },
  'KBaseMaxLen': { min: 0, step: 1 }
};

const ConfigEditForm: React.FC<ConfigEditFormProps> = ({ config, onCancel, onSave, onDelete, type }) => {
  const [formData, setFormData] = React.useState(config);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [identityOptions, setIdentityOptions] = useState<Record<string, Identity[]>>({});
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showCronSelector, setShowCronSelector] = useState(false);
  
  useEffect(() => {
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

  // 当用户点击添加按钮时，加载相应类型的配置项列表
  const loadIdentityOptions = (configType: ConfigType) => {
    // 检查是否已经加载过
    if (!identityOptions[configType] || identityOptions[configType].length === 0) {
      wsClient.sendGetIdRequest(configType);
    }
  };

  // 处理展示 Identity 选择器
  const handleShowIdentitySelector = (field: string, configType: ConfigType) => {
    loadIdentityOptions(configType);
    setSelectedField(field);
  };

  // 处理展示嵌套字段的 Identity 选择器
  const handleShowNestedIdentitySelector = (parent: string, field: string, configType: ConfigType) => {
    loadIdentityOptions(configType);
    setSelectedField(`${parent}.${field}`);
  };

  const handleChange = (field: string, value: any) => {
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

  // 准备提交前的数据处理
  const prepareDataForSubmit = (data: any) => {
    // 创建一个副本，避免修改原始数据
    const processedData = { ...data };
    
    // 注意：不再处理LogFilter中的Identity数组，保留完整的Identity对象
    
    // 确保所有数字字段都是数字类型
    Object.keys(numericFields).forEach(field => {
      if (field in processedData && processedData[field] !== undefined && processedData[field] !== null) {
        // 如果字段值是字符串，尝试转换为数字
        if (typeof processedData[field] === 'string') {
          const numValue = parseFloat(processedData[field]);
          if (!isNaN(numValue)) {
            processedData[field] = numValue;
          }
        }
      }
    });
    
    return processedData;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证必填字段
    const errors: Record<string, string> = {};
    
    // Name 是必填的
    if (!formData.Name || formData.Name.trim() === '') {
      errors.Name = '名称不能为空';
    }
    
    // 如果有错误，显示错误并阻止提交
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // 验证 Identity 格式
    if (formData.Identity && !/^[a-z0-9-_]+$/.test(formData.Identity)) {
      alert('Identity 只能包含小写字母、数字、连字符(-)和下划线(_)');
      return;
    }
    
    // 处理数据并保存
    const processedData = prepareDataForSubmit(formData);
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
    // 检查字段是否是嵌套字段
    if (field.includes('.')) {
      const [parent, childField] = field.split('.');
      handleAddNestedIdentity(parent, childField, identity);
      return;
    }
    
    // 检查字段当前值类型
    const currentValue = formData[field];
    
    // 如果当前值是数组，将 identity 添加到数组
    if (Array.isArray(currentValue)) {
      // 检查是否已存在该 Identity
      const exists = currentValue.some((item: Identity) => item.ID === identity.ID);
      
      if (!exists) {
        handleChange(field, [...currentValue, identity]);
      }
    } else {
      // 如果当前值不是数组，直接将 identity 赋值给该字段
      handleChange(field, identity);
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
          onClick={() => handleShowIdentitySelector(field, configType as ConfigType)}
          className="btn-add-identity"
        >
          添加{label}
        </button>
        
        {selectedField === field && renderIdentitySelector(field, configType as ConfigType)}
      </div>
    );
  };

  // 渲染嵌套字段的 Identity 数组选择器
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
                x
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => handleShowNestedIdentitySelector(parent, field, configType as ConfigType)}
          className="btn-add-identity"
        >
          添加{label}
        </button>
        
        {selectedField === `${parent}.${field}` && 
          renderNestedIdentitySelector(parent, field, configType as ConfigType)}
      </div>
    );
  };

  // 渲染Cron表达式选择器
  const renderCronField = (field: string, value: any, label: string) => {
    return (
      <div className="form-group" key={field}>
        <label>{label}</label>
        <div className="cron-editor-container">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            className="form-control cron-input"
            placeholder="秒 分 时 日 月 周 (例如: 0 * * * * *)"
          />
          <button
            type="button"
            onClick={() => setShowCronSelector(true)}
            className="btn-cron-edit"
          >
            图形化编辑
          </button>
        </div>
        
        {showCronSelector && (
          <CronSelector
            value={value || '0 * * * * *'}
            onChange={(newValue) => handleChange(field, newValue)}
            onClose={() => setShowCronSelector(false)}
          />
        )}
      </div>
    );
  };

  // 渲染日期时间字段
  const renderDateTimeField = (parent: string, field: string, value: string, label: string) => {
    return (
      <div key={`${parent}.${field}`} className="nested-field">
        <label>{label}</label>
        <DateTimeSelector
          value={value}
          onChange={(newValue) => handleNestedChange(parent, field, newValue)}
          placeholder={`选择${label}`}
        />
      </div>
    );
  };

  // 渲染数字输入字段
  const renderNumericField = (field: string, value: any, label: string) => {
    const config = numericFields[field] || { step: 1 };
    
    // 确保值是数字
    const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      // 如果输入为空，保持为空（允许用户清除输入）
      if (inputValue === '') {
        handleChange(field, '');
        return;
      }
      
      // 尝试转换为数字
      const parsedValue = parseFloat(inputValue);
      if (!isNaN(parsedValue)) {
        // 检查是否在允许范围内
        if (config.min !== undefined && parsedValue < config.min) {
          handleChange(field, config.min);
        } else if (config.max !== undefined && parsedValue > config.max) {
          handleChange(field, config.max);
        } else {
          handleChange(field, parsedValue);
        }
      }
    };
    
    const incrementValue = () => {
      const step = config.step || 1;
      const newValue = Math.round((numericValue + step) * 100) / 100; // 处理浮点数精度问题
      
      if (config.max !== undefined && newValue > config.max) {
        handleChange(field, config.max);
      } else {
        handleChange(field, newValue);
      }
    };
    
    const decrementValue = () => {
      const step = config.step || 1;
      const newValue = Math.round((numericValue - step) * 100) / 100; // 处理浮点数精度问题
      
      if (config.min !== undefined && newValue < config.min) {
        handleChange(field, config.min);
      } else {
        handleChange(field, newValue);
      }
    };
    
    return (
      <div className="form-group" key={field}>
        <label>{label}</label>
        <div className="numeric-input-container">
          <input
            type="number"
            value={value === '' ? '' : numericValue}
            onChange={handleNumberChange}
            min={config.min}
            max={config.max}
            step={config.step || 1}
            className="form-control numeric-input"
          />
          <div className="numeric-controls">
            <button 
              type="button" 
              onClick={incrementValue}
              className="btn-numeric"
            >
              +
            </button>
            <button 
              type="button" 
              onClick={decrementValue}
              className="btn-numeric"
            >
              -
            </button>
          </div>
        </div>
        {field === 'Temperature' && (
          <div className="field-hint">
            请输入0到1之间的值
          </div>
        )}
      </div>
    );
  };

  const renderField = (field: string, value: any, label: string) => {
    // 处理数字类型字段
    if (field in numericFields) {
      return renderNumericField(field, value, label);
    }

    // 处理Cron表达式字段
    if (field === 'Cron') {
      return renderCronField(field, value, label);
    }

    // 处理 Identity 数组类型字段
    if (field in identityArrayFields && Array.isArray(value)) {
      return renderIdentityArrayField(field, value, label);
    }

    // 处理单个 Identity 类型字段（例如 TargetLogID, AgentID 等）
    if (field in identityArrayFields && !Array.isArray(value)) {
      const configType = identityArrayFields[field].type;
      // 是否已选择值
      const hasValue = value && typeof value === 'object' && 'ID' in value;
      
      return (
        <div className="form-group" key={field}>
          <label>{label}</label>
          <div className="form-control-identity">
            {hasValue ? (
              <div className="selected-identities">
                <div className="selected-identity">
                  <span>{value.Name}</span>
                  <button
                    type="button"
                    onClick={() => handleChange(field, null)}
                    className="btn-remove-identity"
                  >
                    x
                  </button>
                </div>
              </div>
            ) : null}
            
            <button
              type="button"
              onClick={() => handleShowIdentitySelector(field, configType)}
              className="btn-add-identity"
            >
              {hasValue ? `更改${label}` : `选择${label}`}
            </button>
          </div>
          
          {selectedField === field && renderIdentitySelector(field, configType)}
        </div>
      );
    }

    if (field === 'ID' || (field === 'Name' && config.ID) || (field === 'Identity' && config.ID)) {
      return (
        <div className="form-group" key={field}>
          <label>{label}</label>
          <div className="form-control-static">
            {value || '-'}
          </div>
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
            // 时间字段使用日期时间选择器
            if (logFilterTimeFields.includes(key)) {
              return renderDateTimeField(field, key, val as string, key);
            }
            
            // Identity 数组字段
            if (key in identityArrayFields && Array.isArray(val)) {
              const configType = identityArrayFields[key].type;
              return renderNestedIdentityArrayField(field, key, val as Identity[], key);
            }
            
            // Identity 数组字段 (可能为null)
            if (key in identityArrayFields && !val) {
              const configType = identityArrayFields[key].type;
              // 初始化为空数组
              handleNestedChange(field, key, []);
              return renderNestedIdentityArrayField(field, key, [], key);
            }
            
            // TaskIDs 字段 (普通字符串数组)
            if (key === 'TaskIDs') {
              return (
                <div key={`${field}.${key}`} className="nested-field">
                  <label>{key}</label>
                  <input
                    type="text"
                    value={Array.isArray(val) ? (val as string[]).join(', ') : ''}
                    onChange={(e) => handleNestedChange(
                      field, 
                      key, 
                      e.target.value ? e.target.value.split(',').map(v => v.trim()) : null
                    )}
                    className="form-control"
                    placeholder="多个值请用逗号分隔"
                  />
                </div>
              );
            }
            
            // 其他字段
            return (
              <div key={`${field}.${key}`} className="nested-field">
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

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // 特殊处理 kbase_config 下的 Value.embedding
      if (type === 'kbase_config' && field === 'Value') {
        return (
          <div className="form-group" key={field}>
            <label>{label}</label>
            {Object.entries(value).map(([key, val]) => {
              if (key === 'embedding' && typeof val === 'object' && val !== null) {
                return (
                  <div key={key} className="nested-field-group">
                    <label>{key}</label>
                    {Object.entries(val).map(([embedKey, embedVal]) => (
                      <div key={embedKey} className="nested-field">
                        <label>{embedKey}</label>
                        <input
                          type="text"
                          value={embedVal as string || ''}
                          onChange={(e) => {
                            const newValue = {
                              ...value,
                              [key]: {
                                ...(value[key] || {}),
                                [embedKey]: e.target.value
                              }
                            };
                            handleChange(field, newValue);
                          }}
                          className="form-control"
                        />
                      </div>
                    ))}
                  </div>
                );
              } else {
                // Value 下的其他字段
                return (
                  <div key={key} className="nested-field">
                    <label>{key}</label>
                    <input
                      type="text"
                      value={val as string || ''}
                      onChange={(e) => {
                        const newValue = { ...value, [key]: e.target.value };
                        handleChange(field, newValue);
                      }}
                      className="form-control"
                    />
                  </div>
                );
              }
            })}
          </div>
        );
      }

      // 通用对象渲染逻辑 (保持不变，以防其他地方用到)
      return (
        <div className="form-group" key={field}>
          <label>{label}</label>
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="nested-field">
              <label>{key}</label>
              <input
                type="text"
                value={val as string || ''}
                onChange={(e) => {
                  const newValue = { ...value, [key]: e.target.value };
                  handleChange(field, newValue);
                }}
                className="form-control"
              />
            </div>
          ))}
        </div>
      );
    }

    // 处理常规的输入字段
    if (field === 'Name') {
      return (
        <div className="form-group" key={field}>
          <label>{label} <span className="required">*</span></label>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(field, e.target.value)}
            className={`form-control ${formErrors.Name ? 'error' : ''}`}
          />
          {formErrors.Name && <div className="error-message">{formErrors.Name}</div>}
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