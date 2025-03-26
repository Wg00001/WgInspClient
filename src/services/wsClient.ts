// 新增类型声明
type ServerMessage = {
  type: string;
  data: any;
  timestamp?: number;
};

type ClientMessage = {
  action: string;
  config_type: string;
  config_data?: any;
  config_id?: string;
};

const RECONNECT_INTERVALS = [1000, 3000, 5000, 10000];

const CONFIG_TYPES = [
  'Log',
  'DB',
  'Alert',
  'Task',
  'Agent',
  'AgentTask',
  'KBase',
  'Inspector'
];

class WSClient {
  private socket: WebSocket | null = null;
  private reconnectAttempt = 0;
  private listeners = new Map<string, Function[]>();
  private messageQueue: ClientMessage[] = [];
  private isConnected = false;
  private connectionUrl: string | null = null;
  private subscriptions = new Set<string>();
  private hasInitialized = false;

  connect(url: string) {
    if (!url) {
      console.error('WebSocket URL is required');
      return;
    }

    this.connectionUrl = url;
    console.log('Attempting to connect to WebSocket:', url);
    
    try {
      this.socket = new WebSocket(url);
      
      this.socket.onopen = () => {
        console.log('WebSocket Connected Successfully');
        this.reconnectAttempt = 0;
        this.isConnected = true;
        
        // 发送队列中的消息
        while (this.messageQueue.length > 0) {
          const message = this.messageQueue.shift();
          if (message) {
            this.send(message);
          }
        }
      };

      this.socket.onmessage = (event) => {
        try {
          console.log('Received WebSocket message:', event.data);
          const msg = JSON.parse(event.data);
          console.log('Parsed message:', msg);
          
          // 检查消息格式
          if (msg.type && msg.data) {
            // 如果是配置更新消息
            if (CONFIG_TYPES.includes(msg.type)) {
              console.log(`Handling ${msg.type} config update:`, msg.data);
              this.listeners.get(msg.type)?.forEach(fn => fn(msg.data));
              return;
            }
            
            // 标准格式：包含 type 和 data 字段
            if (this.listeners.has(msg.type)) {
              this.listeners.get(msg.type)?.forEach(fn => fn(msg.data));
            } else {
              console.warn(`No listeners for message type: ${msg.type}`);
            }
          } else if (msg.DBs) {
            // 直接返回配置数据的情况
            console.log('Handling direct config data');
            this.listeners.get('ConfigMeta')?.forEach(fn => fn(msg));
          } else if (msg.action === 'config_delete') {
            console.log('Handling config delete:', msg);
            // 处理删除逻辑
          } else {
            console.warn('Unknown message format:', msg);
          }
        } catch (error) {
          console.error('Error processing message:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
        this.isConnected = false;
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket Connection Closed:', event.code, event.reason);
        this.isConnected = false;
        const delay = RECONNECT_INTERVALS[this.reconnectAttempt] || 10000;
        console.log(`Attempting to reconnect in ${delay}ms`);
        setTimeout(() => {
          if (this.connectionUrl) {
            this.connect(this.connectionUrl);
          }
        }, delay);
        this.reconnectAttempt = Math.min(this.reconnectAttempt + 1, RECONNECT_INTERVALS.length - 1);
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.isConnected = false;
    }
  }

  subscribe<T>(type: string, callback: (data: T) => void) {
    console.log(`Subscribing to message type: ${type}`);
    const listeners = this.listeners.get(type) || [];
    this.listeners.set(type, [...listeners, callback]);
    this.subscriptions.add(type);
  }

  unsubscribe(type: string) {
    console.log(`Unsubscribing from message type: ${type}`);
    this.listeners.delete(type);
    this.subscriptions.delete(type);
  }

  send(message: ClientMessage) {
    console.log('Sending WebSocket message:', message);
    if (!this.isConnected) {
      console.log('WebSocket not connected, queueing message');
      this.messageQueue.push(message);
      return;
    }
    try {
      this.socket?.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending message:', error);
      this.messageQueue.push(message);
    }
  }
}

export const wsClient = new WSClient(); 