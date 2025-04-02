export type Identity = string;

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
  Task: Record<Identity, TaskConfig>;
  DB: Record<Identity, DBConfig>;
  Log: Record<Identity, LogConfig>;
  Alert: Record<Identity, AlertConfig>;
  Agent: AgentConfig;
  AgentTask: Record<Identity, AgentTaskConfig>;
  KBase: Record<Identity, KnowledgeBaseConfig>;
}

export interface BaseConfig {
  Identity: Identity;
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
  LogID: Identity;
  TargetDB: Identity[];
  Todo: Identity[];
  NotTodo: Identity[] | null;
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
  TaskNames: Identity[] | null;
  DBNames: Identity[] | null;
  TaskIDs: string[] | null;
  InspNames: Identity[] | null;
}

export interface AgentTaskConfig extends BaseConfig {
  Cron: Cron;
  LogID: Identity;
  LogFilter: LogFilter;
  AlertID: Identity;
  KBase: Identity[];
  KBaseResults: number;
  KBaseMaxLen: number;
  SystemMessage: string;
}

export interface KnowledgeBaseConfig extends BaseConfig {
  Value: Record<string, any>;
}

export interface InspectorConfig {
  Identity: string;
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

export type ConfigType = 'DB' | 'Task' | 'Log' | 'Alert' | 'Agent' | 'Common' | 'AgentTask' | 'KBase' | 'Inspector';

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
