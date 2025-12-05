import { useState, useEffect } from 'react';
import { Layout, Menu, theme, Button, Dropdown, message } from 'antd';
import { BrowserRouter as Router, Route, Routes, Link, Navigate, useNavigate } from 'react-router-dom';
import { ProjectOutlined, DatabaseOutlined, FileTextOutlined, CheckCircleOutlined, WarningOutlined, UserOutlined, RobotOutlined, FormOutlined, SettingOutlined } from '@ant-design/icons';
import './App.css';

// 导入页面组件
import Login from './pages/Login';
import ProjectManagement from './pages/ProjectManagement';
import KnowledgeBase from './pages/KnowledgeBase';
import ProductSpecs from './pages/ProductSpecs';
import RFPParsing from './pages/RFPParsing';
import DeviationTable from './pages/DeviationTable';
import QualificationAlert from './pages/QualificationAlert';
import BidCheckup from './pages/BidCheckup';
import OperationLogs from './pages/OperationLogs';
import BidTemplateManagement from './pages/BidTemplateManagement';
import AIBidGeneration from './pages/AIBidGeneration';
import AdminUserManagement from './pages/AdminUserManagement';
// 导入后台管理组件
import Admin from './pages/Admin';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminOperationLogs from './pages/AdminOperationLogs';
import AdminSystemSettings from './pages/AdminSystemSettings';

const { Header, Content, Sider } = Layout;

// 受保护路由组件
function ProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// 页面布局组件
function PageLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [companyName, setCompanyName] = useState('示例公司');
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // 加载用户信息和公司信息
  useEffect(() => {
    // 加载用户信息
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
    
    // 加载公司信息
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

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    message.success('退出成功');
    navigate('/login');
  };

  // 用户菜单
  const userMenu = [
    {
      label: <span>个人信息</span>,
      key: 'profile',
    },
    {
      label: <span onClick={handleLogout}>退出登录</span>,
      key: 'logout',
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <div className="logo" style={{ color: '#fff', fontSize: '18px', padding: '16px', textAlign: 'center', fontWeight: 'bold' }}>
          医中标
        </div>
        <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
            <Menu.Item key="1" icon={<ProjectOutlined />}>
              <Link to="/">项目管理</Link>
            </Menu.Item>
            <Menu.Item key="2" icon={<FileTextOutlined />}>
              <Link to="/rfp-parsing">RFP解析</Link>
            </Menu.Item>
            <Menu.Item key="3" icon={<DatabaseOutlined />}>
              <Link to="/product-specs">产品参数库</Link>
            </Menu.Item>
            <Menu.Item key="4" icon={<DatabaseOutlined />}>
              <Link to="/knowledge-base">知识库</Link>
            </Menu.Item>
            <Menu.Item key="5" icon={<CheckCircleOutlined />}>
              <Link to="/deviation-table">偏离表生成</Link>
            </Menu.Item>
            <Menu.Item key="6" icon={<WarningOutlined />}>
              <Link to="/qualification-alert">资质预警</Link>
            </Menu.Item>
            <Menu.Item key="7" icon={<CheckCircleOutlined />}>
              <Link to="/bid-checkup">标书体检</Link>
            </Menu.Item>
            <Menu.Item key="8" icon={<FormOutlined />}>
              <Link to="/template-management">标书模板管理</Link>
            </Menu.Item>
            <Menu.Item key="9" icon={<RobotOutlined />}>
              <Link to="/ai-bid-generation">AI标书生成</Link>
            </Menu.Item>
            <Menu.Item key="10" icon={<UserOutlined />}>
              <Link to="/operation-logs">操作日志</Link>
            </Menu.Item>
            {user?.role === 'admin' && (
              <Menu.Item key="11" icon={<SettingOutlined />}>
                <Link to="/admin">后台管理</Link>
              </Menu.Item>
            )}
          </Menu>
      </Sider>
      <Layout>
        <Header style={{ padding: '0 24px', background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '16px' }}>
            当前公司：<span style={{ color: '#1890ff', fontWeight: 'bold' }}>{companyName}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>欢迎, {user?.username}</span>
            <Dropdown menu={{ items: userMenu }} trigger={['click']}>
              <Button type="text" icon={<UserOutlined />}>
                {user?.role === 'admin' ? '管理员' : user?.role === 'manager' ? '经理' : '操作员'}
              </Button>
            </Dropdown>
          </div>
        </Header>
        <Content style={{ margin: '16px', padding: 24, background: colorBgContainer, borderRadius: borderRadiusLG }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

// 管理员路由保护组件
function AdminProtectedRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* 登录页面 */}
        <Route path="/login" element={<Login />} />
        
        {/* 受保护的前台路由 */}
        <Route path="/" element={<ProtectedRoute><PageLayout><ProjectManagement /></PageLayout></ProtectedRoute>} />
        <Route path="/rfp-parsing" element={<ProtectedRoute><PageLayout><RFPParsing /></PageLayout></ProtectedRoute>} />
        <Route path="/product-specs" element={<ProtectedRoute><PageLayout><ProductSpecs /></PageLayout></ProtectedRoute>} />
        <Route path="/knowledge-base" element={<ProtectedRoute><PageLayout><KnowledgeBase /></PageLayout></ProtectedRoute>} />
        <Route path="/deviation-table" element={<ProtectedRoute><PageLayout><DeviationTable /></PageLayout></ProtectedRoute>} />
        <Route path="/qualification-alert" element={<ProtectedRoute><PageLayout><QualificationAlert /></PageLayout></ProtectedRoute>} />
        <Route path="/bid-checkup" element={<ProtectedRoute><PageLayout><BidCheckup /></PageLayout></ProtectedRoute>} />
        <Route path="/template-management" element={<ProtectedRoute><PageLayout><BidTemplateManagement /></PageLayout></ProtectedRoute>} />
        <Route path="/ai-bid-generation" element={<ProtectedRoute><PageLayout><AIBidGeneration /></PageLayout></ProtectedRoute>} />
        <Route path="/operation-logs" element={<ProtectedRoute><PageLayout><OperationLogs /></PageLayout></ProtectedRoute>} />
        
        {/* 受保护的后台管理路由 */}
        <Route path="/admin" element={<AdminProtectedRoute><Admin /></AdminProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="operation-logs" element={<AdminOperationLogs />} />
          <Route path="system-settings" element={<AdminSystemSettings />} />
        </Route>
        
        {/* 重定向所有其他路由 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
