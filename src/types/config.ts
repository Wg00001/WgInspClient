export type Name = string;

export interface InitConfig {
  ConfigReader: string;
  ConfigParser: string;
  ClientDriver: string;
  ClientURL: string;
  Option: Record<string, any>;
}

export interface CommonConfigGroup {
  DBs: DBConfig[];
  Logs: LogConfig[];
  Alerts: AlertConfig[];
}

export interface TaskConfigGroup {
  Tasks: TaskConfig[];
}

export interface AgentConfigGroup {
  Agent: AgentConfig;
  AgentTasks: AgentTaskConfig[];
  KnowledgeBases: KnowledgeBaseConfig[];
}

export interface ConfigMeta extends CommonConfigGroup, TaskConfigGroup, AgentConfigGroup {
  Insp: InspTree;
}

export interface ConfigIndex {
  Default: InitConfig;
  Task: Record<Name, TaskConfig>;
  DB: Record<Name, DBConfig>;
  Log: Record<Name, LogConfig>;
  Alert: Record<Name, AlertConfig>;
  Agent: AgentConfig;
  AgentTask: Record<Name, AgentTaskConfig>;
  KBase: Record<Name, KnowledgeBaseConfig>;
}

export interface BaseConfig {
  ID: number;
  Name: Name;
  Driver?: string;
}

export interface DBConfig extends BaseConfig {
  DSN: string;
}

export interface LogConfig extends BaseConfig {
  Option: Record<string, string>;
}

export interface AlertConfig extends BaseConfig {
  Option: Record<string, string>;
}

export interface Cron {
  CronTab: string;
  Duration: number; // 这里需要注意：服务端是 time.Duration，我们用 number 表示纳秒数
  AtTime: string[] | null;
  Weekly: number[] | null; // time.Weekday 值 (0-6)
  Monthly: number[] | null;
}

export interface TaskConfig extends BaseConfig {
  Cron: Cron;
  AllInspector: boolean;
  TargetLogID: Name;
  TargetDB: Name[];
  Todo: Name[];
  NotTodo: Name[] | null;
}

export interface AgentConfig extends BaseConfig{
  Url: string;
  ApiKey: string;
  Model: string;
  Temperature: number;
  SystemMessage: string;
}

export interface LogFilter {
  StartTime: string; // ISO 格式的时间字符串
  EndTime: string; // ISO 格式的时间字符串
  TaskNames: Name[] | null;
  DBNames: Name[] | null;
  TaskIDs: string[] | null;
  InspNames: Name[] | null;
}

export interface AgentTaskConfig extends BaseConfig {
  Cron: Cron;
  LogID: Name;
  LogFilter: LogFilter;
  AlertID: Name;
  KBase: Name[];
  KBaseResults: number;
  KBaseMaxLen: number;
  SystemMessage: string;
}

export interface KnowledgeBaseConfig extends BaseConfig {
  Value: Record<string, any>;
}

export interface InspectorConfig {
  ID: number;
  Name: string;
  SQL: string;
  AlertID?: string;
  AlertWhen?: string;
  Children?: InspectorConfig[];
}

export interface InspTree {
  Roots: Record<string, InspectorConfig>;
  Num: number;
  AllInsp: InspectorConfig[];
}

export type ConfigType = 'db_config' | 'task_config' | 'log_config' | 'alert_config' | 'agent_config' | 'Common' | 'agent_task_config' | 'kbase_config' | 'inspector_config';

export interface ClientMessage {
  action: string;
  config_type?: string;
  config_data?: any;
  old_password?: string;
  new_password?: string;
  auth_token?: string;
} 

export interface ResponseMsg {
  action: string;
  config_type: string;
  success: boolean;
  message: string;
  config_data: any;
}
