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
import ConfigEditForm from './config-details/ConfigEditForm';

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

const ConfigTree = () => {
  const [configData, setConfigData] = useState<ConfigMeta | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<string>('dbs');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 处理配置更新的函数
  const handleConfigUpdate = (type: string, data: any) => {
    if (!configData) return;

    const newConfigData = { ...configData };
    
    switch (type) {
      case 'Log':
        // 更新日志配置
        newConfigData.Logs = newConfigData.Logs.map(log => 
          log.Identity === data.Identity ? data : log
        );
        if (!newConfigData.Logs.find(log => log.Identity === data.Identity)) {
          newConfigData.Logs.push(data);
        }
        break;
      case 'DB':
        // 更新数据库配置
        newConfigData.DBs = newConfigData.DBs.map(db => 
          db.Identity === data.Identity ? data : db
        );
        if (!newConfigData.DBs.find(db => db.Identity === data.Identity)) {
          newConfigData.DBs.push(data);
        }
        break;
      case 'Alert':
        // 更新告警配置
        newConfigData.Alerts = newConfigData.Alerts.map(alert => 
          alert.Identity === data.Identity ? data : alert
        );
        if (!newConfigData.Alerts.find(alert => alert.Identity === data.Identity)) {
          newConfigData.Alerts.push(data);
        }
        break;
      case 'Task':
        // 更新任务配置
        newConfigData.Tasks = newConfigData.Tasks.map(task => 
          task.Identity === data.Identity ? data : task
        );
        if (!newConfigData.Tasks.find(task => task.Identity === data.Identity)) {
          newConfigData.Tasks.push(data);
        }
        break;
      case 'Agent':
        // 更新Agent配置
        newConfigData.Agent = data;
        break;
      case 'AgentTask':
        // 更新Agent任务配置
        newConfigData.AgentTasks = newConfigData.AgentTasks.map(task => 
          task.Identity === data.Identity ? data : task
        );
        if (!newConfigData.AgentTasks.find(task => task.Identity === data.Identity)) {
          newConfigData.AgentTasks.push(data);
        }
        break;
      case 'KBase':
        // 更新知识库配置
        newConfigData.KnowledgeBases = newConfigData.KnowledgeBases.map(kb => 
          kb.Identity === data.Identity ? data : kb
        );
        if (!newConfigData.KnowledgeBases.find(kb => kb.Identity === data.Identity)) {
          newConfigData.KnowledgeBases.push(data);
        }
        break;
      case 'Inspector':
        // 更新巡检配置
        if (newConfigData.Insp && newConfigData.Insp.AllInsp) {
          newConfigData.Insp.AllInsp = newConfigData.Insp.AllInsp.map(insp => 
            insp.ID === data.ID ? data : insp
          );
          if (!newConfigData.Insp.AllInsp.find(insp => insp.ID === data.ID)) {
            newConfigData.Insp.AllInsp.push(data);
          }
        }
        break;
    }

    setConfigData(newConfigData);
  };

  useEffect(() => {
    const handleError = (error: any) => {
      console.error('ConfigTree error:', error);
      setError('加载配置失败，请检查网络连接');
      setIsLoading(false);
    };

    const handleConfigMeta = (meta: ConfigMeta) => {
      try {
        console.log('Received config meta:', meta);
        if (meta && typeof meta === 'object' && 'DBs' in meta) {
          setConfigData(meta);
          setError(null);
        } else {
          console.error('Invalid config meta format:', meta);
          setError('配置数据格式无效');
        }
      } catch (err) {
        console.error('Error processing config meta:', err);
        handleError(err);
      } finally {
        setIsLoading(false);
      }
    };

    // 订阅配置元数据
    wsClient.subscribe<ConfigMeta>('ConfigMeta', handleConfigMeta);

    // 订阅各种配置类型的更新
    const configTypes = ['Log', 'DB', 'Alert', 'Task', 'Agent', 'AgentTask', 'KBase', 'Inspector'];
    configTypes.forEach(type => {
      wsClient.subscribe(type, (data: any) => handleConfigUpdate(type, data));
    });

    // 请求配置数据
    wsClient.send({
      action: 'config_get',
      config_type: 'Meta'
    });

    return () => {
      wsClient.unsubscribe('ConfigMeta');
      configTypes.forEach(type => {
        wsClient.unsubscribe(type);
      });
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

  const renderConfigContent = () => {
    if (!configData) return null;

    switch (selectedMenu) {
      case 'dbs':
        return (
          <div className="config-list">
            <h2>数据库配置</h2>
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
            <h2>日志配置</h2>
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
            <h2>告警配置</h2>
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
            <h2>任务配置</h2>
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
            <h2>Agent任务配置</h2>
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
            <h2>知识库配置</h2>
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
            <h2>巡检配置</h2>
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