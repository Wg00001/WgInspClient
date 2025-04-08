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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 组件挂载时发送监听请求
    wsClient.send({
      action: 'task_listen'
    });

    // 订阅任务状态更新
    const handleTaskStatus = (message: any) => {
      setLoading(false);
      console.log('收到任务状态更新1:', message);
      if (message.success && Array.isArray(message.config_data)) {
        console.log('收到任务状态更新:', message.config_data);
        setTasks(message.config_data);
      }
    };

    wsClient.subscribe('task_listen', handleTaskStatus);

    // 组件卸载时发送关闭请求并取消订阅
    return () => {
      wsClient.send({
        action: 'task_close'
      });
      wsClient.unsubscribe('task_listen');
    };
  }, []);

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
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="loading-message">加载中...</td>
              </tr>
            ) : tasks.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-message">暂无任务数据</td>
              </tr>
            ) : (
              tasks.map(task => (
                <tr key={task.UUID}>
                  <td>{task.UUID}</td>
                  <td>{task.TaskName}</td>
                  <td>{formatTime(task.NextStart)}</td>
                  <td>{formatTime(task.LastStart)}</td>
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