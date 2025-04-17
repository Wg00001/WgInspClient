import React, { useEffect, useState } from 'react';
import { wsClient } from '../services/wsClient';
import '../styles/TaskMonitor.css';

interface TaskStatus {
  UUID: string;
  TaskName: string;
  NextStart: string;
  LastStart: string;
}

const TaskMonitor: React.FC = () => {
  const [tasks, setTasks] = useState<TaskStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningTasks, setRunningTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    // 组件挂载时发送监听请求
    wsClient.send({
      action: 'task_listen'
    });

    // 订阅任务状态更新
    const handleTaskStatus = (message: any) => {
      setLoading(false);
      if (message.success && Array.isArray(message.config_data)) {
        setTasks(message.config_data);
      }
    };

    // 处理任务执行响应
    const handleTaskDoResponse = (message: any) => {
      setRunningTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(message.config_data);
        return newSet;
      });
      if (!message.success){
        setError(message.message);
      }
    };

    wsClient.subscribe('task_listen', handleTaskStatus);
    wsClient.subscribe('task_do', handleTaskDoResponse);

    // 组件卸载时发送关闭请求并取消订阅
    return () => {
      wsClient.send({
        action: 'task_close'
      });
      wsClient.unsubscribe('task_listen');
      wsClient.unsubscribe('task_do');
    };
  }, []);

  const handleRunTask = (name: string) => {
    setRunningTasks(prev => new Set(prev).add(name));
    wsClient.send({
      action: 'task_do',
      config_data: name
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString || timeString === '0001-01-01T00:00:00Z') return '-';
    try {
      const date = new Date(timeString);
      return date.toLocaleString('zh-CN');
    } catch {
      return timeString;
    }
  };

  return (
    <div className="task-monitor-container">
      <div className="task-monitor-header">
        <h2>任务监控</h2>
      </div>
      
      <div className="task-list">
        <table>
          <thead>
            <tr>
              <th>任务ID</th>
              <th>任务名称</th>
              <th>下次开始时间</th>
              <th>上次开始时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="loading-message">加载中...</td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="empty-message">暂无任务数据</td>
              </tr>
            ) : (
              tasks.map(task => (
                <tr key={task.UUID}>
                  <td>{task.UUID}</td>
                  <td>{task.TaskName}</td>
                  <td>{formatTime(task.NextStart)}</td>
                  <td>{formatTime(task.LastStart)}</td>
                  <td>
                    <button
                      className={`run-button ${runningTasks.has(task.UUID) ? 'running' : ''}`}
                      onClick={() => handleRunTask(task.TaskName)}
                      disabled={runningTasks.has(task.UUID)}
                    >
                      {runningTasks.has(task.UUID) ? '正在运行' : '运行'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskMonitor; 