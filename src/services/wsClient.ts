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
};

const RECONNECT_INTERVALS = [1000, 3000, 5000, 10000];

class WSClient {
  private socket: WebSocket | null = null;
  private reconnectAttempt = 0;
  private listeners = new Map<string, Function[]>();
  private messageQueue: ClientMessage[] = [];
  private isConnected = false;
  private connectionUrl: string | null = null;

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
        // 连接成功后发送队列中的消息
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
          const msg: ServerMessage = JSON.parse(event.data);
          console.log('Parsed message:', msg);
          this.listeners.get(msg.type)?.forEach(fn => fn(msg.data));
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