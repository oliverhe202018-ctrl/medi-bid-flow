import React from 'react';
import { Form, Input, Button, Checkbox, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      console.log('登录请求开始', values);
      // 调用后端登录API（使用相对URL，适配不同环境）
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: values.username,
          password: values.password
        })
      });
      
      console.log('登录请求响应', response);
      const data = await response.json();
      
      console.log('登录响应数据', data);
      if (response.ok) {
        // 保存token和用户信息到localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        message.success('登录成功');
        // 根据用户角色决定跳转页面
        if (data.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        message.error(data.detail || '登录失败');
      }
    } catch (error) {
      console.error('登录请求错误', error);
      message.error(`网络错误: ${error.message}`);
    }
  };

  return (
    <div className="login-container">
      <Card title="医中标系统登录" className="login-card">
        <Form
          name="login"
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder="密码"
            />
          </Form.Item>
          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>记住我</Checkbox>
            </Form.Item>
            <a className="login-form-forgot" href="#">
              忘记密码
            </a>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-form-button">
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;