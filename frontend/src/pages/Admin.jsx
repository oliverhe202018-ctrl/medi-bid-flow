import { useState, useEffect } from 'react';
import { Layout, Menu, theme } from 'antd';
import { UserOutlined, LogoutOutlined, SettingOutlined, TableOutlined, DashboardOutlined } from '@ant-design/icons';
import { Outlet, Link, useNavigate } from 'react-router-dom';

const { Header, Content, Sider } = Layout;

const Admin = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [companyName, setCompanyName] = useState('示例公司');
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  
  // 加载公司信息
  useEffect(() => {
    const loadCompanyName = () => {
      try {
        const systemConfig = JSON.parse(localStorage.getItem('systemConfig'));
        if (systemConfig && systemConfig.company && systemConfig.company.name) {
          setCompanyName(systemConfig.company.name);
        }
      } catch (error) {
        console.error('加载公司名称失败:', error);
      }
    };
    
    loadCompanyName();
    
    // 监听localStorage变化，实时更新公司名称
    const handleStorageChange = (e) => {
      if (e.key === 'systemConfig') {
        loadCompanyName();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // 后台管理菜单
  const adminMenuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="dashboard">仪表盘</Link>,
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: <Link to="users">用户管理</Link>,
    },
    {
      key: '/admin/operation-logs',
      icon: <TableOutlined />,
      label: <Link to="operation-logs">操作日志</Link>,
    },
    {
      key: '/admin/system-settings',
      icon: <SettingOutlined />,
      label: <Link to="system-settings">系统设置</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} theme="dark">
        <div className="admin-logo" style={{ color: '#fff', fontSize: '18px', padding: '16px', textAlign: 'center', fontWeight: 'bold' }}>
          后台管理
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['/admin/dashboard']} items={adminMenuItems} />
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{companyName}</span> - 医中标后台管理系统
          </div>
          <div>
            {/* 这里可以添加用户信息和退出登录按钮 */}
          </div>
        </Header>
        <Content style={{ margin: '16px', padding: 24, background: colorBgContainer, borderRadius: borderRadiusLG }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Admin;