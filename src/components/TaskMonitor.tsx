import React, { useEffect, useState, useRef } from 'react';
import { wsClient } from '../services/wsClient';
import '../styles/TaskMonitor.css';

interface TaskStatus {
  UUID: string;
  TaskName: string;
  NextStart: string;
  LastStart: string;
}

interface ConfirmDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  visible: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  visible 
}) => {
  if (!visible) return null;

  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-dialog-buttons">
          <button className="cancel-button" onClick={onCancel}>取消</button>
          <button className="confirm-button" onClick={onConfirm}>确认</button>
        </div>
      </div>
    </div>
  );
};

interface AlertDialogProps {
  title: string;
  message: string;
  onClose: () => void;
  visible: boolean;
}

const AlertDialog: React.FC<AlertDialogProps> = ({
  title,
  message,
  onClose,
  visible
}) => {
  if (!visible) return null;

  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-dialog-buttons">
          <button className="confirm-button" onClick={onClose}>确定</button>
        </div>
      </div>
    </div>
  );
};

const TaskMonitor: React.FC = () => {
  const [tasks, setTasks] = useState<TaskStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningTasks, setRunningTasks] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [pendingCronRefresh, setPendingCronRefresh] = useState(false);
  const [showTaskSuccessDialog, setShowTaskSuccessDialog] = useState(false);
  const [successTaskName, setSuccessTaskName] = useState<string>('');
  
  // 使用ref来跟踪最新的tasks状态
  const tasksRef = useRef<TaskStatus[]>([]);
  
  // 当tasks更新时，同步更新ref
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  // 设置监听任务
  const setupTaskListener = () => {
    // 发送监听请求
    wsClient.send({
      action: 'task_listen'
    });
  };

  // 停止监听任务
  const stopTaskListener = () => {
    wsClient.send({
      action: 'task_close'
    });
  };

  useEffect(() => {
    // 组件挂载时发送监听请求
    setupTaskListener();

    // 订阅任务状态更新
    const handleTaskStatus = (message: any) => {
      setLoading(false);
      if (message.success && Array.isArray(message.config_data)) {
        setTasks(message.config_data);
        
        // 如果是调度器刷新后的任务列表更新
        if (pendingCronRefresh) {
          setPendingCronRefresh(false);
          setShowSuccessDialog(true);
        }
      }
    };

    // 处理任务执行响应
    const handleTaskDoResponse = (message: any) => {
      const taskId = message.config_data;
      
      setRunningTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(taskId);
        return newSet;
      });
      
      if (!message.success) {
        setError(message.message);
      } else {
        // 使用ref获取最新的tasks状态
        const currentTasks = tasksRef.current;
        const taskName = currentTasks.find(task => task.UUID === taskId)?.TaskName || taskId;
        setSuccessTaskName(taskName);
        setShowTaskSuccessDialog(true);
      }
    };

    // 处理调度器刷新响应
    const handleCronRefreshResponse = (message: any) => {
      setRefreshing(false);
      
      if (!message.success) {
        setError(message.message);
      } else {
        // 标记正在等待调度器刷新后的任务列表更新
        setPendingCronRefresh(true);
        
        // 取消旧的调度器订阅
        stopTaskListener();
        
        // 重新订阅到新的调度器
        setupTaskListener();
      }
    };

    wsClient.subscribe('task_listen', handleTaskStatus);
    wsClient.subscribe('task_do', handleTaskDoResponse);
    wsClient.subscribe('task_cron_refresh', handleCronRefreshResponse);

    // 组件卸载时发送关闭请求并取消订阅
    return () => {
      stopTaskListener();
      wsClient.unsubscribe('task_listen');
      wsClient.unsubscribe('task_do');
      wsClient.unsubscribe('task_cron_refresh');
    };
  }, [pendingCronRefresh]);

  const handleRunTask = (name: string) => {
    setRunningTasks(prev => new Set(prev).add(name));
    wsClient.send({
      action: 'task_do',
      config_data: name
    });
  };

  const handleRefreshCronRequest = () => {
    // 显示确认对话框
    setShowConfirmDialog(true);
  };

  const handleConfirmRefresh = () => {
    // 隐藏确认对话框
    setShowConfirmDialog(false);
    // 设置刷新状态
    setRefreshing(true);
    // 发送刷新请求
    wsClient.send({
      action: 'task_cron_refresh'
    });
  };

  const handleCancelRefresh = () => {
    // 隐藏确认对话框
    setShowConfirmDialog(false);
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
  };

  const handleCloseTaskSuccessDialog = () => {
    setShowTaskSuccessDialog(false);
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
        <div className="header-content">
          <h2>任务监控</h2>
          <button 
            className={`refresh-cron-button ${refreshing ? 'refreshing' : ''}`}
            onClick={handleRefreshCronRequest}
            disabled={refreshing}
          >
            {refreshing ? '重启中...' : '重启调度器'}
          </button>
        </div>
      </div>
      
      <div className="task-list">
        <table>
          <thead>
            <tr>
              <th>任务名称</th>
              <th>下次开始时间</th>
              <th>上次开始时间</th>
              <th>操作</th>
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
                  <td>{task.TaskName}</td>
                  <td>{formatTime(task.NextStart)}</td>
                  <td>{formatTime(task.LastStart)}</td>
                  <td>
                    <button
                      className={`run-button ${runningTasks.has(task.UUID) ? 'running' : ''}`}
                      onClick={() => handleRunTask(task.UUID)}
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

      {/* 确认对话框 */}
      <ConfirmDialog
        title="重启调度器"
        message="确定要重启调度器吗？这将会重置所有定时任务的计划。"
        onConfirm={handleConfirmRefresh}
        onCancel={handleCancelRefresh}
        visible={showConfirmDialog}
      />

      {/* 调度器重启成功提示框 */}
      <AlertDialog
        title="操作成功"
        message="调度器已成功重启！"
        onClose={handleCloseSuccessDialog}
        visible={showSuccessDialog}
      />

      {/* 任务执行成功提示框 */}
      <AlertDialog
        title="任务执行成功"
        message={`任务 "${successTaskName}" 已成功执行!`}
        onClose={handleCloseTaskSuccessDialog}
        visible={showTaskSuccessDialog}
      />
    </div>
  );
};

export default TaskMonitor; 