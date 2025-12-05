import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/admin/users/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      setUsers(response.data);
    } catch (error) {
      message.error('获取用户列表失败：' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 新建用户
  const showModal = () => {
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleOk = () => {
    form.validateFields()
      .then(values => {
        const token = localStorage.getItem('token');
        axios.post('http://localhost:8000/api/admin/users/', values, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        })
        .then(response => {
          message.success('用户创建成功');
          fetchUsers();
          setIsModalVisible(false);
        })
        .catch(error => {
          message.error('创建用户失败：' + (error.response?.data?.detail || error.message));
        });
      })
      .catch(errorInfo => {
        message.error('表单验证失败');
      });
  };

  // 编辑用户
  const handleEdit = (record) => {
    setCurrentUser(record);
    editForm.setFieldsValue(record);
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setCurrentUser(null);
  };

  const handleEditOk = () => {
    editForm.validateFields()
      .then(values => {
        const token = localStorage.getItem('token');
        axios.put(`http://localhost:8000/api/admin/users/${currentUser.id}`, values, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        })
        .then(response => {
          message.success('用户更新成功');
          fetchUsers();
          setIsEditModalVisible(false);
          setCurrentUser(null);
        })
        .catch(error => {
          message.error('更新用户失败：' + (error.response?.data?.detail || error.message));
        });
      })
      .catch(errorInfo => {
        message.error('表单验证失败');
      });
  };

  // 删除用户
  const handleDelete = (id, username) => {
    const token = localStorage.getItem('token');
    axios.delete(`http://localhost:8000/api/admin/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    })
    .then(response => {
      message.success('用户删除成功');
      fetchUsers();
    })
    .catch(error => {
      message.error('删除用户失败：' + (error.response?.data?.detail || error.message));
    });
  };

  // 更新用户角色
  const handleUpdateRole = (id, username, currentRole) => {
    Modal.confirm({
      title: '更新用户角色',
      content: (
        <Form layout="vertical">
          <Form.Item label="选择新角色">
            <Select
              defaultValue={currentRole}
              style={{ width: '100%' }}
              onChange={(role) => {
                const token = localStorage.getItem('token');
                axios.post(`http://localhost:8000/api/admin/users/${id}/role`, {
                  role: role
                }, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                  }
                })
                .then(response => {
                  message.success('角色更新成功');
                  fetchUsers();
                })
                .catch(error => {
                  message.error('更新角色失败：' + (error.response?.data?.detail || error.message));
                });
              }}
            >
              <Option value="admin">管理员</Option>
              <Option value="manager">经理</Option>
              <Option value="operator">操作员</Option>
            </Select>
          </Form.Item>
        </Form>
      ),
      onCancel: () => {},
      footer: null
    });
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <span><UserOutlined /> {text}</span>,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color = 'blue';
        if (role === 'admin') {
          color = 'red';
        } else if (role === 'manager') {
          color = 'green';
        }
        return (
          <Tag color={color}>{role === 'admin' ? '管理员' : role === 'manager' ? '经理' : '操作员'}</Tag>
        );
      },
    },
    {
      title: '公司ID',
      dataIndex: 'company_id',
      key: 'company_id',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <div>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ marginRight: 8 }}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            icon={<LockOutlined />}
            onClick={() => handleUpdateRole(record.id, record.username, record.role)}
            style={{ marginRight: 8 }}
          >
            角色
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id, record.username)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>用户管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
          添加用户
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* 新建用户模态框 */}
      <Modal
        title="添加用户"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" prefix={<UserOutlined />} />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" prefix={<LockOutlined />} />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="admin">管理员</Option>
              <Option value="manager">经理</Option>
              <Option value="operator">操作员</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑用户模态框 */}
      <Modal
        title="编辑用户"
        open={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" prefix={<UserOutlined />} />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" prefix={<LockOutlined />} />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="admin">管理员</Option>
              <Option value="manager">经理</Option>
              <Option value="operator">操作员</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminUserManagement;