export interface ConfigMeta{
  DBs: DBConfig[];
  Logs: LogConfig[];
  Alerts: AlertConfig[];
  Tasks: TaskConfig[];
  Agents: AgentConfig[];
  AgentTasks: AgentTaskConfig[];
  KBases: KnowledgeBaseConfig[];
  InspNodes: InspectorConfig[];
}

export interface Identity {
  ID: number;
  Name: string;
}

export interface DBConfig extends Identity {
  Driver: string;
  DSN: string;
}

export interface LogConfig extends Identity {
  Driver: string;
  Option: Record<string, string>;
}

export interface AlertConfig extends Identity {
  Driver: string;
  Option: Record<string, string>;
}

export interface Cron {
  CronTab: string;
  Duration: number; // 这里需要注意：服务端是 time.Duration，我们用 number 表示纳秒数
  AtTime: string[] | null;
  Weekly: number[] | null; // time.Weekday 值 (0-6)
  Monthly: number[] | null;
}

export interface TaskConfig extends Identity {
  Cron: Cron;
  AllInspector: boolean;
  TargetLogID: Identity;
  TargetDB: Identity[];
  Todo: Identity[];
  NotTodo: Identity[] | null;
}

export interface AgentConfig extends Identity{
  Driver: string;
  Url: string;
  ApiKey: string;
  Model: string;
  Temperature: number;
  SystemMessage: string;
}

export interface LogFilter {
  StartTime: string; // ISO 格式的时间字符串
  EndTime: string; // ISO 格式的时间字符串
  TaskNames: Identity[] | null;
  DBNames: Identity[] | null;
  TaskIDs: string[] | null;
  InspNames: Identity[] | null;
}

export interface AgentTaskConfig extends Identity {
  Cron: Cron;
  LogID: Identity;
  LogFilter: LogFilter;
  AgentID: Identity;
  AlertID: Identity;
  KBaseAgentID: Identity;
  KBase: Identity[];
  KBaseResults: number;
  KBaseMaxLen: number;
}

export interface KnowledgeBaseConfig extends Identity {
  Driver: string;
  Value: Record<string, any>;
}

export interface InspectorConfig extends Identity{
  SQL: string;
  AlertWhen?: string;
  Children?: InspectorConfig[];
}

export type ConfigType = 'db_config' | 'task_config' | 'log_config' | 'alert_config' | 'agent_config' | 'Common' | 'agent_task_config' | 'kbase_config' | 'inspector_config';

export interface ClientMessage {
  action: string;
  config_type?: ConfigType | string;
  config_data?: any;
  old_password?: string;
  new_password?: string;
  auth_token?: string;
}

export interface ResponseMsg {
  action: string;
  config_type: ConfigType | string;
  success: boolean;
  message: string;
  config_data: any;
}
