export type Identity = string;

export interface DefaultConfig {
  ConfigReader: string;
  ConfigParser: string;
  ClientDriver: string;
  ClientURL: string;
}

export interface BaseConfig {
  Identity: Identity;
  Driver?: string;
  type: ConfigType;
}

export interface DBConfig extends BaseConfig {
  DSN: string;
}

export interface LogConfig extends BaseConfig {
  Header: Record<string, string>;
}

export interface AlertConfig extends BaseConfig {
  Header: Record<string, string>;
}

export interface Cron {
  CronTab: string;
  Duration: number; // time.Duration in nanoseconds
  AtTime: string[] | null;
  Weekly: number[] | null; // time.Weekday values
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

export interface AgentConfig {
  Driver: string;
  Url: string;
  ApiKey: string;
  Model: string;
  Temperature: number;
  SystemMessage: string;
}

export interface LogFilter {
  StartTime: string; // time.Time as ISO string
  EndTime: string; // time.Time as ISO string
  TaskNames: Identity[];
  DBNames: Identity[];
  TaskIDs: string[];
  InspNames: Identity[];
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
  ID: string;
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

export interface ConfigMeta {
  DBs: DBConfig[];
  Logs: LogConfig[];
  Alerts: AlertConfig[];
  Tasks: TaskConfig[];
  Agent: AgentConfig;
  AgentTasks: AgentTaskConfig[];
  KnowledgeBases: KnowledgeBaseConfig[];
  Insp: InspTree;
}

export interface ConfigIndex {
  Default: DefaultConfig;
  Task: Record<Identity, TaskConfig>;
  DB: Record<Identity, DBConfig>;
  Log: Record<Identity, LogConfig>;
  Alert: Record<Identity, AlertConfig>;
  Agent: AgentConfig;
  AgentTask: Record<Identity, AgentTaskConfig>;
  KBase: Record<Identity, KnowledgeBaseConfig>;
}

export type ConfigType = 'DB' | 'Task' | 'Log' | 'Alert' | 'Agent' | 'Common';

export interface ClientMessage {
  action: string;
  config_type: ConfigType;
  config_data?: any;
  config_id?: string; // 新增，用于删除操作
} 