// 系统配置文件
// 用于存储系统设置的默认值和持久化存储

// 默认配置
const defaultConfig = {
  company: {
    name: '示例公司',
    contactPerson: '张三',
    contactEmail: 'contact@example.com',
    contactPhone: '13800138000',
  },
  performance: {
    aiGenerationTimeout: 300,
    maxConcurrentTasks: 5,
    cacheEnabled: true,
  },
  email: {
    enabled: true,
    smtpServer: 'smtp.example.com',
    smtpPort: 587,
    smtpUsername: 'noreply@example.com',
    smtpPassword: '',
    useSSL: true,
  },
  system: {
    gzipEnabled: false,
    redisEnabled: false,
    redisHost: 'localhost',
    redisPort: 6379,
    redisPassword: '',
    redisDb: 0,
    defaultHomePage: 'project_management',
  },
};

// 从localStorage读取配置
export const loadConfig = () => {
  try {
    const savedConfig = localStorage.getItem('systemConfig');
    return savedConfig ? JSON.parse(savedConfig) : defaultConfig;
  } catch (error) {
    console.error('Failed to load config from localStorage:', error);
    return defaultConfig;
  }
};

// 保存配置到localStorage
export const saveConfig = (config) => {
  try {
    localStorage.setItem('systemConfig', JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('Failed to save config to localStorage:', error);
    return false;
  }
};

// 重置配置到默认值
export const resetConfig = () => {
  saveConfig(defaultConfig);
  return defaultConfig;
};

export default defaultConfig;
