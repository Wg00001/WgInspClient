const SENSITIVE_FIELDS = ['DSN', 'apiKey', 'password'];

export const maskSensitiveData = (config: any) => {
  return Object.keys(config).reduce((acc, key) => {
    acc[key] = SENSITIVE_FIELDS.includes(key) 
      ? '******' 
      : config[key];
    return acc;
  }, {} as any);
}; 