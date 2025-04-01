import React, { useState, useEffect } from 'react';
import { wsClient } from '../services/wsClient';
import { ConfigMeta, ConfigType } from '../types/config';
import DBConfigDetail from './config-details/DBConfigDetail';
import LogConfigDetail from './config-details/LogConfigDetail';
import AlertConfigDetail from './config-details/AlertConfigDetail';
import TaskConfigDetail from './config-details/TaskConfigDetail';
import AgentConfigDetail from './config-details/AgentConfigDetail';
import AgentTaskConfigDetail from './config-details/AgentTaskConfigDetail';
import KBaseConfigDetail from './config-details/KBaseConfigDetail';
import InspectorConfigDetail from './config-details/InspectorConfigDetail';
import ConfigEditForm from './ConfigEditForm';

interface MenuItem {
  id: string;
  name: string;
  type: ConfigType;
  icon?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'dbs', name: '数据库配置', type: 'DB' },
  { id: 'logs', name: '日志配置', type: 'Log' },
  { id: 'alerts', name: '告警配置', type: 'Alert' },
  { id: 'tasks', name: '任务配置', type: 'Task' },
  { id: 'agent', name: 'Agent配置', type: 'Agent' },
  { id: 'agent-tasks', name: 'Agent任务配置', type: 'Agent' },
  { id: 'knowledge-bases', name: '知识库配置', type: 'Common' },
  { id: 'inspectors', name: '巡检配置', type: 'Common' }
];

interface ConfigTreeProps {
  onLogout: () => void;
}

const ConfigTree: React.FC<ConfigTreeProps> = ({ onLogout }) => {
  const [configData, setConfigData] = useState<ConfigMeta | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<string>('dbs');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [creatingType, setCreatingType] = useState<ConfigType | null>(null);

  // 初始化请求函数
  const initializeData = () => {
    console.log('正在初始化配置数据...');
    wsClient.send({
      action: 'config_get',
      config_type: 'Meta',
      config_data: null
    });
  };

  useEffect(() => {
    console.log('ConfigTree useEffect triggered');
    const handleError = (error: any) => {
      console.error('ConfigTree error:', error);
      setError('加载配置失败，请检查网络连接');
      setIsLoading(false);
    };

    const handleConfigMeta = (meta: any) => {
      try {
        console.log('接收到配置元数据:', meta);
        if (meta && meta.success && meta.config_data) {
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

    const handleConfigUpdate = (message: { config_type: string; config_data: any[] }) => {
      console.log('ConfigTree接收到配置更新:', message);
      if (!configData) {
        console.log('configData为空，跳过更新');
        return;
      }

      const newConfigData = { ...configData };
      console.log('更新前的配置数据:', newConfigData);
      
      switch (message.config_type) {
        case 'DB':
          newConfigData.DBs = message.config_data;
          break;
        case 'Log':
          newConfigData.Logs = message.config_data;
          break;
        case 'Alert':
          newConfigData.Alerts = message.config_data;
          break;
        case 'Task':
          console.log('更新任务配置数据:', message.config_data);
          newConfigData.Tasks = message.config_data;
          break;
        case 'Agent':
          if (message.config_data.length === 1) {
            newConfigData.Agent = message.config_data[0];
          }
          break;
        case 'AgentTask':
          newConfigData.AgentTasks = message.config_data;
          break;
        case 'KBase':
          newConfigData.KnowledgeBases = message.config_data;
          break;
        case 'Inspector':
          if (newConfigData.Insp) {
            newConfigData.Insp.AllInsp = message.config_data;
          }
          break;
      }

      console.log('更新后的配置数据:', newConfigData);
      console.log('当前选中的菜单:', selectedMenu);
      setConfigData(newConfigData);
    };

    // 订阅配置元数据
    wsClient.subscribe<ConfigMeta>('ConfigMeta', handleConfigMeta);

    // 订阅配置更新消息
    wsClient.subscribe('config_update', (message: any) => {
      console.log('ConfigTree收到config_update消息:', message);
      handleConfigUpdate({ config_type: message.type, config_data: message.data });
    });

    // // 订阅配置保存响应
    // wsClient.subscribe('config_save', (message: { config_type: string; config_data: any }) => {
    //   console.log('ConfigTree收到config_save响应:', message);
    //   if (message.config_data) {
    //     handleConfigUpdate({ 
    //       config_type: message.config_type, 
    //       config_data: Array.isArray(message.config_data) ? message.config_data : [message.config_data] 
    //     });
    //   }
    // });

    // 发送初始化请求
    initializeData();

    return () => {
      wsClient.unsubscribe('ConfigMeta');
      wsClient.unsubscribe('config_update');
      wsClient.unsubscribe('config_save');
    };
  }, []);

  const handleConfigEdit = (type: ConfigType, updatedConfig: any) => {
    console.log('Saving config update:', { type, config: updatedConfig });
    wsClient.send({
      action: 'config_save',
      config_type: type,
      config_data: updatedConfig
    });
  };

  const handleConfigDelete = (type: ConfigType, identity: string) => {
    console.log('Deleting config:', { type, identity });
    wsClient.send({
      action: 'config_delete',
      config_type: type,
      config_data: { Identity: identity }
    });
  };

  const handleCreate = (type: ConfigType) => {
    setIsCreating(true);
    setCreatingType(type);
  };

  const handleCreateSave = (newConfig: any) => {
    if (creatingType) {
      console.log('创建新配置:', { type: creatingType, config: newConfig });
      // 先发送创建请求
      wsClient.send({
        action: 'config_save',
        config_type: creatingType,
        config_data: newConfig
      });
      
      // 等待服务端响应后再关闭创建表单
      const handleConfigSave = (message: any) => {
        if (message.config_type === creatingType) {
          setIsCreating(false);
          setCreatingType(null);
          // 取消订阅，避免重复处理
          wsClient.unsubscribe('config_save');
        }
      };
      
      // 订阅配置保存响应
      wsClient.subscribe('config_save', handleConfigSave);
    }
  };

  const handleCreateCancel = () => {
    setIsCreating(false);
    setCreatingType(null);
  };

  const renderConfigContent = () => {
    if (!configData) return null;

    if (isCreating && creatingType) {
      return (
        <div className="config-edit-container">
          <ConfigEditForm
            config={getEmptyConfig(creatingType)}
            onCancel={handleCreateCancel}
            onSave={handleCreateSave}
            type={creatingType}
          />
        </div>
      );
    }

    switch (selectedMenu) {
      case 'dbs':
        return (
          <div className="config-list">
            <div className="page-header">
              <h2>数据库配置</h2>
              <button onClick={() => handleCreate('DB')} className="btn-create">
                创建
              </button>
            </div>
            {configData.DBs.map((db, index) => (
              <DBConfigDetail
                key={index}
                config={db}
                onEdit={(config) => handleConfigEdit('DB', config)}
                onDelete={() => handleConfigDelete('DB', db.Identity)}
              />
            ))}
          </div>
        );
      case 'logs':
        return (
          <div className="config-list">
            <div className="page-header">
              <h2>日志配置</h2>
              <button onClick={() => handleCreate('Log')} className="btn-create">
                创建
              </button>
            </div>
            {configData.Logs.map((log, index) => (
              <LogConfigDetail
                key={index}
                config={log}
                onEdit={(config) => handleConfigEdit('Log', config)}
                onDelete={() => handleConfigDelete('Log', log.Identity)}
              />
            ))}
          </div>
        );
      case 'alerts':
        return (
          <div className="config-list">
            <div className="page-header">
              <h2>告警配置</h2>
              <button onClick={() => handleCreate('Alert')} className="btn-create">
                创建
              </button>
            </div>
            {configData.Alerts.map((alert, index) => (
              <AlertConfigDetail
                key={index}
                config={alert}
                onEdit={(config) => handleConfigEdit('Alert', config)}
                onDelete={() => handleConfigDelete('Alert', alert.Identity)}
              />
            ))}
          </div>
        );
      case 'tasks':
        return (
          <div className="config-list">
            <div className="page-header">
              <h2>任务配置</h2>
              <button onClick={() => handleCreate('Task')} className="btn-create">
                创建
              </button>
            </div>
            {configData.Tasks.map((task, index) => (
              <TaskConfigDetail
                key={index}
                config={task}
                onEdit={(config) => handleConfigEdit('Task', config)}
                onDelete={() => handleConfigDelete('Task', task.Identity)}
              />
            ))}
          </div>
        );
      case 'agent':
        return (
          <div className="config-detail">
            <h2>Agent配置</h2>
            <AgentConfigDetail
              config={configData.Agent}
              onEdit={(config) => handleConfigEdit('Agent', config)}
              onDelete={() => handleConfigDelete('Agent', configData.Agent.Driver)}
            />
          </div>
        );
      case 'agent-tasks':
        return (
          <div className="config-list">
            <div className="page-header">
              <h2>Agent任务配置</h2>
              <button onClick={() => handleCreate('AgentTask')} className="btn-create">
                创建
              </button>
            </div>
            {configData.AgentTasks.map((task, index) => (
              <AgentTaskConfigDetail
                key={index}
                config={task}
                onEdit={(config) => handleConfigEdit('Agent', config)}
                onDelete={() => handleConfigDelete('Agent', task.Identity)}
              />
            ))}
          </div>
        );
      case 'knowledge-bases':
        return (
          <div className="config-list">
            <div className="page-header">
              <h2>知识库配置</h2>
              <button onClick={() => handleCreate('KBase')} className="btn-create">
                创建
              </button>
            </div>
            {configData.KnowledgeBases.map((kb, index) => (
              <KBaseConfigDetail
                key={index}
                config={kb}
                onEdit={(config) => handleConfigEdit('Common', config)}
                onDelete={() => handleConfigDelete('Common', kb.Identity)}
              />
            ))}
          </div>
        );
      case 'inspectors':
        return (
          <div className="config-list">
            <div className="page-header">
              <h2>巡检配置</h2>
              <button onClick={() => handleCreate('Inspector')} className="btn-create">
                创建
              </button>
            </div>
            {configData.Insp.AllInsp.map((insp, index) => (
              <InspectorConfigDetail
                key={index}
                config={insp}
                onEdit={(config) => handleConfigEdit('Common', config)}
                onDelete={() => handleConfigDelete('Common', insp.ID)}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const getEmptyConfig = (type: ConfigType): any => {
    switch (type) {
      case 'DB':
        return {
          Identity: '',
          Driver: '',
          DSN: ''
        };
      case 'Log':
        return {
          Identity: '',
          Driver: '',
          Header: {}
        };
      case 'Alert':
        return {
          Identity: '',
          Driver: '',
          Header: {}
        };
      case 'Task':
        return {
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
        };
      case 'Agent':
        return {
          Identity: '',
          Driver: '',
          Url: '',
          ApiKey: '',
          Model: '',
          Temperature: 0,
          SystemMessage: ''
        };
      case 'AgentTask':
        return {
          Identity: '',
          Driver: '',
          Cron: {
            CronTab: '',
            Duration: 0,
            AtTime: null,
            Weekly: null,
            Monthly: null
          },
          LogID: '',
          LogFilter: {
            StartTime: '',
            EndTime: '',
            TaskNames: null,
            DBNames: null,
            TaskIDs: null,
            InspNames: null
          },
          AlertID: '',
          KBase: [],
          KBaseResults: 0,
          KBaseMaxLen: 0,
          SystemMessage: ''
        };
      case 'KBase':
        return {
          Identity: '',
          Driver: '',
          Value: {
            collection: '',
            path: '',
            embedding: {
              driver: '',
              baseurl: '',
              model: ''
            }
          }
        };
      case 'Inspector':
        return {
          ID: '',
          Name: '',
          SQL: '',
          AlertID: '',
          AlertWhen: '',
          Children: []
        };
      default:
        return {};
    }
  };

  return (
    <div className="config-container">
      <div className="config-sidebar">
        <div className="sidebar-header">
          <h2>配置管理</h2>
        </div>
        <div className="sidebar-menu">
          {MENU_ITEMS.map(item => (
            <div
              key={item.id}
              className={`menu-item ${selectedMenu === item.id ? 'selected' : ''}`}
              onClick={() => setSelectedMenu(item.id)}
            >
              <span className="menu-item-name">{item.name}</span>
            </div>
          ))}
        </div>
        <div className="sidebar-footer">
          <button onClick={onLogout} className="logout-button">
            退出
          </button>
        </div>
      </div>
      <div className="config-content">
        {isLoading ? (
          <div className="loading">加载中...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          renderConfigContent()
        )}
      </div>
    </div>
  );
};

export default ConfigTree; 