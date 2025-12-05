import { Card, Row, Col, Statistic, Progress, List, Tag, Typography, Button, message } from 'antd';
import { UserOutlined, ProjectOutlined, FileTextOutlined, ClockCircleOutlined, CheckCircleOutlined, WarningOutlined, DatabaseOutlined, SettingOutlined, FileDoneOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import axios from 'axios';

const { Title } = Typography;

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalProjects: 0,
    pendingProjects: 0,
    completedProjects: 0,
    totalKnowledge: 0,
    totalProductSpecs: 0,
    totalTemplates: 0,
    totalGeneratedBids: 0,
    qualificationAlerts: 0,
    recentActivities: [],
  });

  // 模拟数据，实际项目中应从API获取
  useEffect(() => {
    // 获取仪表盘数据
    const fetchDashboardData = async () => {
      try {
        // 这里可以添加实际的API调用
        // const response = await axios.get('/api/admin/dashboard');
        // setDashboardData(response.data);
        
        // 模拟数据
        setDashboardData({
          totalUsers: 15,
          totalProjects: 23,
          pendingProjects: 8,
          completedProjects: 15,
          totalKnowledge: 256,
          totalProductSpecs: 89,
          totalTemplates: 12,
          totalGeneratedBids: 34,
          qualificationAlerts: 2,
          recentActivities: [
            { id: 1, user: 'admin', action: '创建了新用户', time: '2023-12-01 14:30' },
            { id: 2, user: 'manager1', action: '上传了招标文件', time: '2023-12-01 13:15' },
            { id: 3, user: 'operator1', action: '生成了偏离表', time: '2023-12-01 12:45' },
            { id: 4, user: 'admin', action: '更新了系统设置', time: '2023-12-01 11:20' },
            { id: 5, user: 'manager2', action: '创建了新项目', time: '2023-12-01 10:05' },
          ],
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>仪表盘</Title>
        <Button type="primary" icon={<FileTextOutlined />} onClick={() => window.location.href = '/'}>
          前往前台首页
        </Button>
      </div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card onClick={() => window.location.href = '/admin/users'} hoverable>
            <Statistic
              title="总用户数"
              value={dashboardData.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card onClick={() => window.location.href = '/'} hoverable>
            <Statistic
              title="总项目数"
              value={dashboardData.totalProjects}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card onClick={() => window.location.href = '/'} hoverable>
            <Statistic
              title="待处理项目"
              value={dashboardData.pendingProjects}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card onClick={() => window.location.href = '/'} hoverable>
            <Statistic
              title="已完成项目"
              value={dashboardData.completedProjects}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 新增前台数据统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={4.8}>
          <Card onClick={() => window.location.href = '/knowledge-base'} hoverable>
            <Statistic
              title="知识库数量"
              value={dashboardData.totalKnowledge}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col span={4.8}>
          <Card onClick={() => window.location.href = '/product-specs'} hoverable>
            <Statistic
              title="产品参数"
              value={dashboardData.totalProductSpecs}
              prefix={<SettingOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={4.8}>
          <Card onClick={() => window.location.href = '/template-management'} hoverable>
            <Statistic
              title="模板数量"
              value={dashboardData.totalTemplates}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={4.8}>
          <Card onClick={() => window.location.href = '/ai-bid-generation'} hoverable>
            <Statistic
              title="生成标书"
              value={dashboardData.totalGeneratedBids}
              prefix={<FileDoneOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col span={4.8}>
          <Card onClick={() => window.location.href = '/qualification-alert'} hoverable>
            <Statistic
              title="资质预警"
              value={dashboardData.qualificationAlerts}
              prefix={<WarningOutlined />}
              valueStyle={{ color: '#fa541c' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="项目完成进度" headStyle={{ textAlign: 'center' }}>
            <Progress percent={65} status="active" format={percent => `${percent}%`} />
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-around' }}>
              <div>
                <span style={{ color: '#1890ff', marginRight: 8 }}>●</span>
                <span>进行中</span>
              </div>
              <div>
                <span style={{ color: '#52c41a', marginRight: 8 }}>●</span>
                <span>已完成</span>
              </div>
              <div>
                <span style={{ color: '#faad14', marginRight: 8 }}>●</span>
                <span>待处理</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="系统运行状态" headStyle={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: 120 }}>
              <div style={{ textAlign: 'center' }}>
                <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                <div style={{ marginTop: 8 }}>服务正常</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                <div style={{ marginTop: 8 }}>数据库连接</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                <div style={{ marginTop: 8 }}>AI服务</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="最近活动" headStyle={{ textAlign: 'center' }}>
        <List
          dataSource={dashboardData.recentActivities}
          renderItem={item => (
            <List.Item
              actions={[<Tag color="blue" onClick={() => message.info(`查看${item.action}的详情`)} style={{ cursor: 'pointer' }}>查看详情</Tag>]}
            >
              <List.Item.Meta
                title={item.action}
                description={`${item.user} - ${item.time}`}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default AdminDashboard;