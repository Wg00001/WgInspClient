import React, { useState, useEffect } from 'react';
import { wsClient } from '../services/wsClient';
import { ConfigMeta, ConfigType, InspectorConfig, ResponseMsg } from '../types/config';
import DBConfigDetail from './config-details/DBConfigDetail';
import LogConfigDetail from './config-details/LogConfigDetail';
import AlertConfigDetail from './config-details/AlertConfigDetail';
import TaskConfigDetail from './config-details/TaskConfigDetail';
import AgentConfigDetail from './config-details/AgentConfigDetail';
import AgentTaskConfigDetail from './config-details/AgentTaskConfigDetail';
import KBaseConfigDetail from './config-details/KBaseConfigDetail';
import InspectorConfigTable from './config-details/InspectorConfigTable';
import ConfigEditForm from './ConfigEditForm';
import '../styles/ConfigTree.css';

interface MenuItem {
  id: string;
  name: string;
  type: ConfigType;
  icon?: string;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'dbs', name: '数据库配置', type: 'db_config' },
  { id: 'logs', name: '日志配置', type: 'log_config' },
  { id: 'alerts', name: '告警配置', type: 'alert_config' },
  { id: 'agent', name: 'Agent配置', type: 'agent_config' },
  { id: 'knowledge-bases', name: '知识库配置', type: 'kbase_config' },
  { id: 'inspectors', name: '巡检配置', type: 'inspector_config' },
  { id: 'tasks', name: '任务配置', type: 'task_config' },
  { id: 'agent-tasks', name: 'Agent任务配置', type: 'agent_task_config' }
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [runningTasks, setRunningTasks] = useState<Set<string>>(new Set());
  const [creatingChildParent, setCreatingChildParent] = useState<InspectorConfig | null>(null);
  const [showNavigationConfirm, setShowNavigationConfirm] = useState<boolean>(false);
  const [pendingNavigation, setPendingNavigation] = useState<{menuId?: string, action?: () => void} | null>(null);

  // 处理错误消息的函数
  const handleErrorMessage = (message: string) => {
    setErrorMessage(message);
  };

  // 关闭错误弹窗
  const closeErrorModal = () => {
    setErrorMessage(null);
  };

  // 初始化请求函数
  const initializeData = () => {
    console.log('正在初始化配置数据...');
    // 重置状态
    setIsLoading(true); 
    setError(null);
    
    // 发送请求
    wsClient.send({
      action: 'config_get',
      config_type: 'Meta',
      config_data: null
    });
    
    // 设置超时，防止请求永远不返回
    setTimeout(() => {
      setIsLoading((current) => {
        if (current) {
          console.error('配置请求超时，未收到响应');
          setError('加载超时，请刷新页面重试');
          return false;
        }
        return current;
      });
    }, 5000);
  };

  useEffect(() => {
    console.log('ConfigTree useEffect triggered');
    const handleError = (error: any) => {
      console.error('ConfigTree error:', error);
      setError('加载配置失败，请检查网络连接');
      setIsLoading(false);
    };

    const handleConfigMeta = (meta: ResponseMsg) => {
      try {
        console.log('接收到配置元数据:', JSON.stringify(meta, null, 2));
        
        if (meta && meta.success && meta.config_data) {
          console.log('配置数据有效，尝试更新状态');
          console.log('配置数据字段:', Object.keys(meta.config_data));
          
          // 直接尝试使用响应的config_data
          setConfigData(meta.config_data);
          console.log('状态更新后的ConfigData:', meta.config_data);
          
          setError(null);
        } else {
          console.error('无效的配置元数据格式:', meta);
          if (!meta.success && meta.message) {
            handleErrorMessage(meta.message);
          }
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

    // 订阅配置元数据
    console.log('正在订阅config_get消息...');
    wsClient.subscribe('config_get', (message: ResponseMsg) => {
      console.log('ConfigTree收到config_get消息:', message);
      if (message.success === false) {
        handleErrorMessage(message.message || '配置获取失败');
        setIsLoading(false);
        return;
      }
      handleConfigMeta(message);
    });

    // 添加全局配置更新/创建/删除处理器
    const handleConfigChange = (message: ResponseMsg) => {
      console.log('收到配置变更消息:', message.action, message.config_type);
      
      if (message.success && message.config_data && message.config_type) {
        // 如果configData为null，防止错误
        if (!configData) {
          console.warn('configData为null，等待初始化完成后再更新');
          return;
        }
        
        // 只更新特定类型的数据
        const newConfigData = { ...configData };
        
        console.log(`正在更新${message.config_type}类型的配置数据`);
        
        switch (message.config_type) {
          case 'db_config':
            newConfigData.DBs = message.config_data;
            break;
          case 'log_config':
            newConfigData.Logs = message.config_data;
            break;
          case 'alert_config':
            newConfigData.Alerts = message.config_data;
            break;
          case 'task_config':
            newConfigData.Tasks = message.config_data;
            break;
          case 'agent_config':
            newConfigData.Agents = message.config_data;
            break;
          case 'agent_task_config':
            newConfigData.AgentTasks = message.config_data;
            break;
          case 'kbase_config':
            newConfigData.KBases = message.config_data;
            break;
          case 'inspector_config':
            console.log('更新inspector_config数据:', message.config_data);
            newConfigData.InspNodes = message.config_data;
            break;
          default:
            console.warn(`未知的配置类型: ${message.config_type}`);
            return; // 不处理未知类型
        }
        
        setConfigData(newConfigData);
      } else if (!message.success) {
        // 处理失败
        handleErrorMessage(message.message || `${message.action}操作失败`);
      }
    };

    // 订阅配置变更
    wsClient.subscribe('config_change', handleConfigChange);

    // 确保已订阅后再发送请求
    setTimeout(() => {
      console.log('开始初始化数据...');
      initializeData();
    }, 500);

    // Cleanup function
    return () => {
      console.log('ConfigTree组件卸载，清理订阅');
      wsClient.unsubscribe('config_get');
      wsClient.unsubscribe('config_change');
    };
  }, []);

  const handleConfigEdit = (type: ConfigType, updatedConfig: any) => {
    console.log('Saving config update:', { type, config: updatedConfig });
    
    // 发送更新请求 - 依赖全局监听器处理响应
    wsClient.send({
      action: 'config_update',
      config_type: type,
      config_data: updatedConfig
    });
  };

  const handleConfigDelete = (type: ConfigType, identity: number) => {
    console.log('Deleting config:', { type, identity });
    
    // 发送删除请求 - 依赖全局监听器处理响应
    wsClient.send({
      action: 'config_delete',
      config_type: type,
      config_data: { id: identity }
    });
  };

  // 菜单项切换处理
  const handleMenuSelect = (menuId: string) => {
    // 如果当前处于编辑或创建状态，显示确认对话框
    if (isCreating || creatingChildParent) {
      setShowNavigationConfirm(true);
      setPendingNavigation({ menuId });
    } else {
      // 否则直接切换
      setSelectedMenu(menuId);
    }
  };

  // 确认放弃编辑并导航
  const confirmNavigation = () => {
    if (pendingNavigation) {
      if (pendingNavigation.menuId) {
        setSelectedMenu(pendingNavigation.menuId);
      }
      if (pendingNavigation.action) {
        pendingNavigation.action();
      }
    }
    
    // 重置状态
    setIsCreating(false);
    setCreatingType(null);
    setCreatingChildParent(null);
    setShowNavigationConfirm(false);
    setPendingNavigation(null);
  };

  // 取消导航，保持在当前编辑状态
  const cancelNavigation = () => {
    setShowNavigationConfirm(false);
    setPendingNavigation(null);
  };

  // 保存并导航
  const saveAndNavigate = () => {
    // 获取当前表单引用
    const formElement = document.querySelector('.config-edit-form') as HTMLFormElement;
    if (formElement) {
      // 找到保存按钮并触发点击
      const saveButton = formElement.querySelector('.btn-save') as HTMLButtonElement;
      if (saveButton) {
        saveButton.click();
        // 保存后进行导航
        setTimeout(() => {
          confirmNavigation();
        }, 100);
        return;
      }
    }
    
    // 如果没有找到表单或按钮，直接导航
    confirmNavigation();
  };

  const handleCreate = (type: ConfigType) => {
    // 如果当前正在编辑或创建其他内容，需要确认
    if (isCreating || creatingChildParent) {
      setShowNavigationConfirm(true);
      setPendingNavigation({ 
        action: () => {
          setIsCreating(true);
          setCreatingType(type);
        }
      });
    } else {
      setIsCreating(true);
      setCreatingType(type);
    }
  };

  const handleConfigCreate = (newConfig: any) => {
    if (creatingType) {
      console.log('创建新配置:', { type: creatingType, config: newConfig });
      
      // 发送创建请求 - 不再需要创建一次性监听器，因为已有全局监听器
      wsClient.send({
        action: 'config_create',
        config_type: creatingType,
        config_data: newConfig
      });
      
      setIsCreating(false);
    }
  };

  const handleCreateCancel = () => {
    setIsCreating(false);
    setCreatingType(null);
  };

  const renderConfigContent = () => {
    if (!configData) {
      return <div>加载中...</div>;
    }

    if (isCreating && creatingType) {
      return (
        <div className="config-edit-container">
          <ConfigEditForm
            config={getEmptyConfig(creatingType)}
            onCancel={handleCreateCancel}
            onSave={handleConfigCreate}
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
              <button onClick={() => handleCreate('db_config')} className="btn-create">
                创建
              </button>
            </div>
            {configData.DBs?.map((db, index) => (
              <DBConfigDetail
                key={index}
                config={db}
                onEdit={(config) => handleConfigEdit('db_config', config)}
                onDelete={() => handleConfigDelete('db_config', db.ID)}
              />
            ))}
          </div>
        );
      case 'logs':
        return (
          <div className="config-list">
            <div className="page-header">
              <h2>日志配置</h2>
              <button onClick={() => handleCreate('log_config')} className="btn-create">
                创建
              </button>
            </div>
            {configData.Logs?.map((log, index) => (
              <LogConfigDetail
                key={index}
                config={log}
                onEdit={(config) => handleConfigEdit('log_config', config)}
                onDelete={() => handleConfigDelete('log_config', log.ID)}
              />
            ))}
          </div>
        );
      case 'alerts':
        return (
          <div className="config-list">
            <div className="page-header">
              <h2>告警配置</h2>
              <button onClick={() => handleCreate('alert_config')} className="btn-create">
                创建
              </button>
            </div>
            {configData.Alerts?.map((alert, index) => (
              <AlertConfigDetail
                key={index}
                config={alert}
                onEdit={(config) => handleConfigEdit('alert_config', config)}
                onDelete={() => handleConfigDelete('alert_config', alert.ID)}
              />
            ))}
          </div>
        );
      case 'tasks':
        return (
          <div className="config-list">
            <div className="page-header">
              <h2>任务配置</h2>
              <button onClick={() => handleCreate('task_config')} className="btn-create">
                创建
              </button>
            </div>
            {configData.Tasks?.map((task, index) => (
              <TaskConfigDetail
                key={index}
                config={task}
                onEdit={(config) => handleConfigEdit('task_config', config)}
                onDelete={() => handleConfigDelete('task_config', task.ID)}
              />
            ))}
          </div>
        );
      case 'agent':
        return (
          <div className="config-list">
            <div className="page-header">
              <h2>Agent配置</h2>
              <button onClick={() => handleCreate('agent_config')} className="btn-create">
                创建
              </button>
            </div>
            {configData.Agents && configData.Agents.length > 0 && configData.Agents.map((agent, index) => (
              <AgentConfigDetail
                key={index}
                config={agent}
                onEdit={(config) => handleConfigEdit('agent_config', config)}
                onDelete={() => handleConfigDelete('agent_config', agent.ID)}
              />
            ))}
          </div>
        );
      case 'agent-tasks':
        return (
          <div className="config-list">
            <div className="page-header">
              <h2>Agent任务配置</h2>
              <button onClick={() => handleCreate('agent_task_config')} className="btn-create">
                创建
              </button>
            </div>
            {configData.AgentTasks?.map((task, index) => (
              <AgentTaskConfigDetail
                key={index}
                config={task}
                onEdit={(config) => handleConfigEdit('agent_task_config', config)}
                onDelete={() => handleConfigDelete('agent_task_config', task.ID)}
              />
            ))}
          </div>
        );
      case 'knowledge-bases':
        return (
          <div className="config-list">
            <div className="page-header">
              <h2>知识库配置</h2>
              <button onClick={() => handleCreate('kbase_config')} className="btn-create">
                创建
              </button>
            </div>
            {configData.KBases?.map((kb, index) => (
              <KBaseConfigDetail
                key={index}
                config={kb}
                onEdit={(config) => handleConfigEdit('kbase_config', config)}
                onDelete={() => handleConfigDelete('kbase_config', kb.ID)}
              />
            ))}
          </div>
        );
      case 'inspectors':
        return (
          <div className="config-list">
            <div className="page-header">
              <h2>巡检配置</h2>
              <button onClick={() => handleCreate('inspector_config')} className="btn-create">
                创建
              </button>
            </div>
            {creatingChildParent && (
              <div className="config-edit-container">
                <ConfigEditForm
                  config={{ Name: '', SQL: '', AlertWhen: '', Parent: { ID: creatingChildParent.ID, Name: creatingChildParent.Name } }}
                  onCancel={() => setCreatingChildParent(null)}
                  onSave={(newConfig) => {
                    // 发送创建请求 - 依赖全局监听器处理响应
                    wsClient.send({
                      action: 'config_create',
                      config_type: 'inspector_config',
                      config_data: newConfig
                    });
                    
                    setCreatingChildParent(null);
                  }}
                  type="inspector_config"
                />
              </div>
            )}
            <InspectorConfigTable
              data={configData.InspNodes || []}
              onEdit={(config) => handleConfigEdit('inspector_config', config)}
              onDelete={(id) => handleConfigDelete('inspector_config', id)}
              onCreate={(parent) => setCreatingChildParent(parent)}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const getEmptyConfig = (type: ConfigType): any => {
    switch (type) {
      case 'db_config':
        return {
          Name: '',
          Driver: '',
          DSN: ''
        };
      case 'log_config':
        return {
          Name: '',
          Driver: '',
          Option: {}
        };
      case 'alert_config':
        return {
          Name: '',
          Driver: '',
          Option: {}
        };
      case 'task_config':
        return {
          Name: '',
          Cron: '',
          AllInspector: false,
          TargetLogID: {},
          TargetDB: [],
          Todo: [],
          NotTodo: null
        };
      case 'agent_config':
        return {
          Name: '',
          Driver: '',
          Url: '',
          ApiKey: '',
          Model: '',
          Temperature: 0.6,
        };
      case 'agent_task_config':
        return {
          Name: '',
          Cron: '',
          LogID: { ID: 0, Name: '' },
          LogFilter: {
            StartTime: '0001-01-01T00:00:00Z',
            EndTime: '0001-01-01T00:00:00Z',
            TaskNames: null,
            DBNames: null,
            InspNames: null
            // TaskIDs: null,
          },
          AgentID: { ID: 0, Name: '' },
          AlertID: { ID: 0, Name: '' },
          KBaseAgentID: { ID: 0, Name: '' },
          KBase: [],
          KBaseResults: 5,
          KBaseMaxLen: 1000
        };
      case 'kbase_config':
        return {
          Name: '',
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
      case 'inspector_config':
        return {
          Name: '',
          SQL: '',
          AlertWhen: ''
        };
      default:
        return {};
    }
  };

  return (
    <div className="config-container">
      {errorMessage && (
        <div className="error-modal">
          <div className="error-modal-content">
            <h3 className="error-title">操作失败</h3>
            <p className="error-message">{errorMessage}</p>
            <button 
              onClick={closeErrorModal} 
              className="error-close-button"
            >
              关闭
            </button>
          </div>
        </div>
      )}
      
      {showNavigationConfirm && (
        <div className="navigation-confirm-modal" style={{ zIndex: 1200 }}>
          <div className="modal-content">
            <h3>未保存的更改</h3>
            <p>您有未保存的更改，是否要保存这些更改？</p>
            <div className="modal-actions">
              <button onClick={cancelNavigation} className="btn-cancel">取消</button>
              <button onClick={confirmNavigation} className="btn-discard">不保存</button>
              <button onClick={saveAndNavigate} className="btn-save">保存</button>
            </div>
          </div>
        </div>
      )}
      
      <div className="config-sidebar">
        <div className="sidebar-header">
          <h2>配置管理</h2>
        </div>
        <div className="sidebar-menu">
          {MENU_ITEMS.map(item => (
            <div
              key={item.id}
              className={`menu-item ${selectedMenu === item.id ? 'selected' : ''}`}
              onClick={() => handleMenuSelect(item.id)}
            >
              <span className="menu-item-name">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="config-content">

        
        {isLoading ? (
          <div className="loading">加载中...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : configData ? (
          renderConfigContent()
        ) : (
          <div className="error">加载配置失败，未收到有效数据</div>
        )}
      </div>
    </div>
  );
};

export default ConfigTree; 