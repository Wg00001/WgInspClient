// 新增类型声明
type ServerMessage = {
  type: string;
  data: any;
  timestamp?: number;
};

export interface ClientMessage {
  action: string;
  old_password?: string;
  new_password?: string;
  config_id?: string;
  config_type?: string;
  config_data?: any;
}

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

export class WSClient {
  private ws: WebSocket | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private credentials: { username: string; password: string } | null = null;
  private listeners = new Map<string, Function[]>();
  private messageQueue: ClientMessage[] = [];
  private isConnected = false;
  private connectionUrl: string | null = null;
  private subscriptions = new Set<string>();
  private hasInitialized = false;

  constructor() {
    this.messageHandlers = new Map();
  }

  public connectWithAuth(username: string, password: string): Promise<void> {
    this.credentials = { username, password };
    return new Promise((resolve, reject) => {
      try {
        const authHeader = `Basic ${btoa(`${username}:${password}`)}`;
        const wsUrl = process.env.REACT_APP_WS_URL || 'ws://127.0.0.1:9999';
        
        // 使用 URL 参数传递认证信息
        const wsUrlWithAuth = `${wsUrl}?Authorization=${encodeURIComponent(authHeader)}`;
        this.ws = new WebSocket(wsUrlWithAuth);

        this.ws.onopen = () => {
          console.log('WebSocket connected with authentication');
          this.reconnectAttempts = 0;
          this.isConnected = true;
          this.hasInitialized = true;
          resolve();
        };

        this.ws.onclose = () => {
          console.log('WebSocket connection closed');
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnected = false;
          reject(error);
        };

        this.ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          const handler = this.messageHandlers.get(message.action);
          if (handler) {
            handler(message);
          } else {
            console.warn(`No handler for message action: ${message.action}`);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.credentials) {
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
        this.connectWithAuth(this.credentials.username, this.credentials.password)
          .catch(() => {
            this.reconnectAttempts++;
          });
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
    }
  }

  public async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    if (!this.ws || !this.credentials) {
      throw new Error('Not connected or no credentials available');
    }

    return new Promise((resolve, reject) => {
      const message: ClientMessage = {
        action: 'change_password',
        old_password: oldPassword,
        new_password: newPassword,
        config_type: 'auth'
      };

      const handler = (response: any) => {
        if (response.action === 'change_password_response') {
          this.messageHandlers.delete('change_password_response');
          if (response.success) {
            this.credentials.password = newPassword;
            resolve();
          } else {
            reject(new Error(response.error || 'Failed to change password'));
          }
        }
      };

      this.messageHandlers.set('change_password_response', handler);
      this.send(message);
    });
  }

  public send(message: ClientMessage) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }

  public onMessage(action: string, handler: (data: any) => void) {
    this.messageHandlers.set(action, handler);
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.credentials = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
      this.hasInitialized = false;
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

  private connect(url: string) {
    if (!url) {
      console.error('WebSocket URL is required');
      return;
    }

    this.connectionUrl = url;
    console.log('Attempting to connect to WebSocket:', url);
    
    try {
      this.ws = new WebSocket(url);
      
      this.ws.onopen = () => {
        console.log('WebSocket Connected Successfully');
        this.reconnectAttempts = 0;
        this.isConnected = true;
        
        // 发送队列中的消息
        while (this.messageQueue.length > 0) {
          const message = this.messageQueue.shift();
          if (message) {
            this.send(message);
          }
        }
      };

      this.ws.onmessage = (event) => {
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

      this.ws.onerror = (error) => {
        console.error('WebSocket Error:', error);
        this.isConnected = false;
      };

      this.ws.onclose = (event) => {
        console.log('WebSocket Connection Closed:', event.code, event.reason);
        this.isConnected = false;
        const delay = RECONNECT_INTERVALS[this.reconnectAttempts] || 10000;
        console.log(`Attempting to reconnect in ${delay}ms`);
        setTimeout(() => {
          if (this.connectionUrl) {
            this.connect(this.connectionUrl);
          }
        }, delay);
        this.reconnectAttempts = Math.min(this.reconnectAttempts + 1, RECONNECT_INTERVALS.length - 1);
      };
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.isConnected = false;
    }
  }
}

export const wsClient = new WSClient(); 