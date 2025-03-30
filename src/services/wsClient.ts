// 新增类型声明
type ServerMessage = {
  type: string;
  data: any;
  timestamp?: number;
};

export interface ClientMessage {
  action: string;
  config_type?: string;
  config_data?: any;
  old_password?: string;
  new_password?: string;
  auth_token?: string;
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
  private isAuthenticated = false;

  constructor() {
    this.messageHandlers = new Map();
  }

  public connectWithAuth(username: string, password: string): Promise<void> {
    this.credentials = { username, password };
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = process.env.REACT_APP_WS_URL || 'ws://127.0.0.1:9999';
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected, sending authentication');
          // 发送认证消息
          const authHeader = `Basic ${btoa(`${username}:${password}`)}`;
          this.send({
            action: 'authenticate',
            auth_token: authHeader
          });
        };

        this.ws.onclose = () => {
          console.log('WebSocket connection closed');
          console.log('Connection state:', this.ws?.readyState);
          this.isAuthenticated = false;
          this.handleReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          console.log('Connection state:', this.ws?.readyState);
          this.isConnected = false;
          this.isAuthenticated = false;
          reject(error);
        };

        this.ws.onmessage = (event) => {
          try {
            console.log('Received WebSocket message:', event.data);
            const msg = JSON.parse(event.data);
            console.log('Parsed message:', msg);
            
            // 处理认证响应
            if (msg.action === 'authenticate_response') {
              if (msg.success) {
                console.log('Authentication successful');
                this.isAuthenticated = true;
                this.isConnected = true;
                this.hasInitialized = true;
                this.reconnectAttempts = 0;
                resolve();
              } else {
                console.error('Authentication failed:', msg.error);
                this.isAuthenticated = false;
                this.disconnect();
                reject(new Error(msg.error || '认证失败'));
              }
              return;
            }

            // 处理配置数据
            if (msg.DBs !== undefined) {
              // 这是配置元数据
              console.log('收到配置元数据');
              this.listeners.get('ConfigMeta')?.forEach(fn => fn(msg));
              return;
            }

            // 处理其他消息
            const handler = this.messageHandlers.get(msg.action);
            if (handler) {
              handler(msg);
            } else {
              console.warn(`No handler for message action: ${msg.action}`);
            }
          } catch (error) {
            console.error('Error processing message:', error);
            reject(error);
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

  private handleMessage = (event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data);
      console.log('收到WebSocket消息:', message);
      console.log('当前所有订阅:', Array.from(this.listeners.keys()));

      // 处理配置更新消息
      if (message.action === 'config_update') {
        console.log('检测到config_update消息');
        const handlers = this.listeners.get('config_update');
        console.log('config_update处理器:', handlers?.length || 0);
        if (handlers) {
          handlers.forEach(handler => {
            console.log('执行config_update处理器');
            handler(message);
          });
        } else {
          console.log('未找到config_update处理器');
        }
        return;
      }

      // 处理其他消息类型
      if (message.type) {
        console.log('检测到类型消息:', message.type);
        const handlers = this.listeners.get(message.type);
        console.log(`${message.type}处理器:`, handlers?.length || 0);
        if (handlers) {
          handlers.forEach(handler => {
            console.log(`执行${message.type}处理器`);
            handler(message.data);
          });
        } else {
          console.log(`未找到${message.type}处理器`);
        }
      }
    } catch (error) {
      console.error('处理WebSocket消息时出错:', error);
    }
  };
}

export const wsClient = new WSClient(); 