export interface BaseConfig {
  Identity: string;
  type: string;
  // 其他公共字段
  LastModified?: number;
  Driver?: string;
}

// 新增配置索引类型
export interface ConfigIndexItem {
  identity: string;
  type: ConfigType;
  parent?: string;
}

export type ConfigIndex = ConfigIndexItem[];

// 补充ConfigType定义
export type ConfigType = 'DB' | 'Task' | 'Log' | 'Alert' | 'Agent' | 'Common'; 