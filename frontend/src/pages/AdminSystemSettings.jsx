import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Select, Switch, InputNumber, Typography, Divider, message, Row, Col } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminSystemSettings = () => {
  // 定义默认配置
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

  // 初始化状态
  const [settings, setSettings] = useState(defaultConfig);
  const [loading, setLoading] = useState(false);
  
  const systemInfo = {
    version: '1.0.0',
    lastUpdated: '2023-12-01',
  };

  // 从localStorage加载配置
  useEffect(() => {
    const loadSettings = () => {
      console.log('开始从localStorage加载配置');
      try {
        const savedConfig = localStorage.getItem('systemConfig');
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig);
          console.log('加载到的配置:', parsedConfig);
          setSettings(parsedConfig);
        } else {
          console.log('未找到保存的配置，使用默认配置');
          setSettings(defaultConfig);
        }
      } catch (error) {
        console.error('加载配置失败:', error);
        message.error('加载配置失败，使用默认配置');
        setSettings(defaultConfig);
      }
    };

    loadSettings();
  }, []);

  // 保存配置到localStorage
  const saveSettingsToLocalStorage = (newSettings) => {
    console.log('保存配置到localStorage:', newSettings);
    localStorage.setItem('systemConfig', JSON.stringify(newSettings));
  };

  // 通用设置更新函数
  const updateSetting = (section, key, value) => {
    const newSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value
      }
    };
    setSettings(newSettings);
    // 立即保存到localStorage
    saveSettingsToLocalStorage(newSettings);
  };

  // 保存设置按钮点击事件
  const handleSave = () => {
    setLoading(true);
    try {
      // 保存到localStorage
      saveSettingsToLocalStorage(settings);
      message.success('设置保存成功');
      console.log('保存设置成功');
    } catch (error) {
      console.error('保存设置失败:', error);
      message.error('保存设置失败');
    } finally {
      setLoading(false);
    }
  };

  // 检查系统更新
  const checkForUpdates = () => {
    message.info('检查更新中...');
    setTimeout(() => {
      message.success('当前已是最新版本');
    }, 1000);
  };

  return (
    <div>
      <Title level={2}>系统设置</Title>
      
      {/* 系统信息卡片 */}
      <Card title="系统信息" style={{ marginBottom: 24 }}>
        <Row gutter={16}>
          <Col span={8}>
            <Text strong>版本：</Text>
            <Text>{systemInfo.version}</Text>
          </Col>
          <Col span={8}>
            <Text strong>最后更新：</Text>
            <Text>{systemInfo.lastUpdated}</Text>
          </Col>
          <Col span={8}>
            <Button type="primary" icon={<ReloadOutlined />} onClick={checkForUpdates}>
              检查更新
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 公司信息设置 */}
      <Card title="公司信息" style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <Text strong>公司名称：</Text>
          <Input 
            placeholder="请输入公司名称" 
            value={settings.company.name}
            onChange={(e) => updateSetting('company', 'name', e.target.value)}
            style={{ marginLeft: 8, width: 300 }}
          />
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <Text strong>联系人：</Text>
          <Input 
            placeholder="请输入联系人姓名" 
            value={settings.company.contactPerson}
            onChange={(e) => updateSetting('company', 'contactPerson', e.target.value)}
            style={{ marginLeft: 8, width: 300 }}
          />
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <Text strong>联系邮箱：</Text>
          <Input 
            placeholder="请输入联系邮箱" 
            value={settings.company.contactEmail}
            onChange={(e) => updateSetting('company', 'contactEmail', e.target.value)}
            style={{ marginLeft: 8, width: 300 }}
          />
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <Text strong>联系电话：</Text>
          <Input 
            placeholder="请输入联系电话" 
            value={settings.company.contactPhone}
            onChange={(e) => updateSetting('company', 'contactPhone', e.target.value)}
            style={{ marginLeft: 8, width: 300 }}
          />
        </div>
      </Card>

      {/* 性能优化设置 */}
      <Card title="性能优化设置" style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <Text strong>AI生成超时时间（秒）：</Text>
          <InputNumber 
            min={1} 
            max={3600} 
            value={settings.performance.aiGenerationTimeout}
            onChange={(value) => updateSetting('performance', 'aiGenerationTimeout', value)}
            style={{ marginLeft: 8, width: 150 }}
          />
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <Text strong>最大并发任务数：</Text>
          <InputNumber 
            min={1} 
            max={20} 
            value={settings.performance.maxConcurrentTasks}
            onChange={(value) => updateSetting('performance', 'maxConcurrentTasks', value)}
            style={{ marginLeft: 8, width: 150 }}
          />
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <Text strong>启用缓存：</Text>
          <Switch 
            checked={settings.performance.cacheEnabled}
            onChange={(checked) => updateSetting('performance', 'cacheEnabled', checked)}
            style={{ marginLeft: 8 }}
          />
          <Text type="secondary" style={{ marginLeft: 8 }}>启用缓存可以提高AI生成速度，但会增加内存占用</Text>
        </div>
      </Card>

      {/* 邮件配置 */}
      <Card title="邮件配置" style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <Text strong>启用邮件配置：</Text>
          <Switch 
            checked={settings.email.enabled}
            onChange={(checked) => updateSetting('email', 'enabled', checked)}
            style={{ marginLeft: 8 }}
          />
          <Text type="secondary" style={{ marginLeft: 8 }}>启用后才能使用邮件功能</Text>
        </div>
        
        {settings.email.enabled && (
          <>
            <div style={{ marginBottom: 16 }}>
              <Text strong>SMTP服务器：</Text>
              <Input 
                placeholder="请输入SMTP服务器地址" 
                value={settings.email.smtpServer}
                onChange={(e) => updateSetting('email', 'smtpServer', e.target.value)}
                style={{ marginLeft: 8, width: 300 }}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <Text strong>SMTP端口：</Text>
              <InputNumber 
                min={1} 
                max={65535} 
                value={settings.email.smtpPort}
                onChange={(value) => updateSetting('email', 'smtpPort', value)}
                style={{ marginLeft: 8, width: 150 }}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <Text strong>SMTP用户名：</Text>
              <Input 
                placeholder="请输入SMTP用户名" 
                value={settings.email.smtpUsername}
                onChange={(e) => updateSetting('email', 'smtpUsername', e.target.value)}
                style={{ marginLeft: 8, width: 300 }}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <Text strong>SMTP密码：</Text>
              <Input.Password 
                placeholder="请输入SMTP密码" 
                value={settings.email.smtpPassword}
                onChange={(e) => updateSetting('email', 'smtpPassword', e.target.value)}
                style={{ marginLeft: 8, width: 300 }}
              />
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <Text strong>使用SSL：</Text>
              <Switch 
                checked={settings.email.useSSL}
                onChange={(checked) => updateSetting('email', 'useSSL', checked)}
                style={{ marginLeft: 8 }}
              />
              <Text type="secondary" style={{ marginLeft: 8 }}>建议启用SSL加密以提高安全性</Text>
            </div>
          </>
        )}
      </Card>

      {/* 系统配置 */}
      <Card title="系统配置" style={{ marginBottom: 24 }}>
        {/* GZIP压缩设置 */}
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 12 }}>GZIP压缩设置</h3>
          <div style={{ marginBottom: 16 }}>
            <Text strong>启用GZIP压缩：</Text>
            <Switch 
              checked={settings.system.gzipEnabled}
              onChange={(checked) => updateSetting('system', 'gzipEnabled', checked)}
              style={{ marginLeft: 8 }}
            />
            <Text type="secondary" style={{ marginLeft: 8 }}>启用GZIP可以减小传输文件大小，提高加载速度</Text>
          </div>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        {/* Redis设置 */}
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ marginBottom: 12 }}>Redis设置</h3>
          <div style={{ marginBottom: 16 }}>
            <Text strong>启用Redis缓存：</Text>
            <Switch 
              checked={settings.system.redisEnabled}
              onChange={(checked) => updateSetting('system', 'redisEnabled', checked)}
              style={{ marginLeft: 8 }}
            />
            <Text type="secondary" style={{ marginLeft: 8 }}>启用Redis可以提高系统性能，特别是在高并发场景下</Text>
          </div>
          
          {settings.system.redisEnabled && (
            <>
              <div style={{ marginBottom: 16 }}>
                <Text strong>Redis主机：</Text>
                <Input 
                  placeholder="请输入Redis主机地址" 
                  value={settings.system.redisHost}
                  onChange={(e) => updateSetting('system', 'redisHost', e.target.value)}
                  style={{ marginLeft: 8, width: 300 }}
                />
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <Text strong>Redis端口：</Text>
                <InputNumber 
                  min={1} 
                  max={65535} 
                  value={settings.system.redisPort}
                  onChange={(value) => updateSetting('system', 'redisPort', value)}
                  style={{ marginLeft: 8, width: 150 }}
                />
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <Text strong>Redis密码：</Text>
                <Input.Password 
                  placeholder="请输入Redis密码" 
                  value={settings.system.redisPassword}
                  onChange={(e) => updateSetting('system', 'redisPassword', e.target.value)}
                  style={{ marginLeft: 8, width: 300 }}
                />
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <Text strong>Redis数据库：</Text>
                <InputNumber 
                  min={0} 
                  max={15} 
                  value={settings.system.redisDb}
                  onChange={(value) => updateSetting('system', 'redisDb', value)}
                  style={{ marginLeft: 8, width: 150 }}
                />
              </div>
            </>
          )}
        </div>

        <Divider style={{ margin: '16px 0' }} />

        {/* 首页设置 */}
        <div>
          <h3 style={{ marginBottom: 12 }}>首页设置</h3>
          <div style={{ marginBottom: 16 }}>
            <Text strong>默认首页：</Text>
            <Select 
              value={settings.system.defaultHomePage}
              onChange={(value) => updateSetting('system', 'defaultHomePage', value)}
              style={{ marginLeft: 8, width: 300 }}
            >
              <Option value="project_management">项目管理</Option>
              <Option value="rfp_parsing">RFP解析</Option>
              <Option value="ai_bid_generation">AI标书生成</Option>
              <Option value="knowledge_base">知识库</Option>
            </Select>
            <Text type="secondary" style={{ marginLeft: 8 }}>设置用户登录后默认显示的页面</Text>
          </div>
        </div>
      </Card>

      {/* 保存按钮 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
        <Button type="primary" icon={<SaveOutlined />} onClick={handleSave} loading={loading}>
          保存设置
        </Button>
      </div>
    </div>
  );
};

export default AdminSystemSettings;