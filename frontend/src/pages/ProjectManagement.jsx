import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, DatePicker, Upload, message, Popconfirm } from 'antd';
import { PlusOutlined, UploadOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;

const ProjectManagement = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // 模拟项目数据
  const [projects, setProjects] = useState([
    {
      id: '1',
      name: 'XX医院CT设备采购项目',
      status: 'parsing',
      rfpFile: '招标文件.pdf',
      owner: '张三',
      createdAt: '2025-12-01',
      deadline: '2025-12-15',
      description: 'XX医院CT设备采购项目，包含2台64排CT设备',
    },
    {
      id: '2',
      name: 'YY医院MRI设备采购项目',
      status: 'drafting',
      rfpFile: '招标文件.pdf',
      owner: '李四',
      createdAt: '2025-11-28',
      deadline: '2025-12-20',
      description: 'YY医院MRI设备采购项目，包含1台3.0T MRI设备',
    },
    {
      id: '3',
      name: 'ZZ医院超声设备采购项目',
      status: 'reviewing',
      rfpFile: '招标文件.pdf',
      owner: '王五',
      createdAt: '2025-11-25',
      deadline: '2025-12-10',
      description: 'ZZ医院超声设备采购项目，包含5台彩色多普勒超声设备',
    },
  ]);

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          parsing: '解析中',
          drafting: '起草中',
          reviewing: '审核中',
          sealed: '已封标',
        };
        return statusMap[status] || status;
      },
    },
    {
      title: '招标文件',
      dataIndex: 'rfpFile',
      key: 'rfpFile',
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      key: 'owner',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <span>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个项目吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </span>
      ),
    },
  ];

  // 新建项目
  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleOk = () => {
    form.validateFields()
      .then(values => {
        const newProject = {
          id: String(projects.length + 1),
          ...values,
          rfpFile: '招标文件.pdf',
          createdAt: new Date().toISOString().split('T')[0],
        };
        setProjects([...projects, newProject]);
        message.success('项目创建成功');
        setIsModalVisible(false);
        form.resetFields();
      })
      .catch(errorInfo => {
        console.log('表单验证失败:', errorInfo);
      });
  };

  // 查看项目
  const handleView = (project) => {
    setCurrentProject(project);
    setIsViewModalVisible(true);
  };

  const handleViewCancel = () => {
    setIsViewModalVisible(false);
    setCurrentProject(null);
  };

  // 编辑项目
  const handleEdit = (project) => {
    setCurrentProject(project);
    editForm.setFieldsValue(project);
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setCurrentProject(null);
    editForm.resetFields();
  };

  const handleEditOk = () => {
    editForm.validateFields()
      .then(values => {
        const updatedProjects = projects.map(project => 
          project.id === currentProject.id ? { ...project, ...values } : project
        );
        setProjects(updatedProjects);
        message.success('项目编辑成功');
        setIsEditModalVisible(false);
        setCurrentProject(null);
        editForm.resetFields();
      })
      .catch(errorInfo => {
        console.log('表单验证失败:', errorInfo);
      });
  };

  // 删除项目
  const handleDelete = (id) => {
    const updatedProjects = projects.filter(project => project.id !== id);
    setProjects(updatedProjects);
    message.success('项目删除成功');
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h2>项目管理</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
            新建项目
          </Button>
        </div>
      </div>
      
      <Table columns={columns} dataSource={projects} rowKey="id" />

      {/* 新建项目模态框 */}
      <Modal
        title="新建项目"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'parsing' }}
        >
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="项目描述"
          >
            <Input.TextArea rows={3} placeholder="请输入项目描述" />
          </Form.Item>
          
          <Form.Item
            name="owner"
            label="负责人"
            rules={[{ required: true, message: '请选择负责人' }]}
          >
            <Select placeholder="请选择负责人">
              <Option value="张三">张三</Option>
              <Option value="李四">李四</Option>
              <Option value="王五">王五</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="rfpFile"
            label="上传招标文件"
            rules={[{ required: true, message: '请上传招标文件' }]}
          >
            <Upload beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
            <p className="ant-form-text" style={{ color: '#666' }}>
              支持PDF、Word格式，单个文件不超过50MB
            </p>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="项目状态"
          >
            <Select placeholder="请选择项目状态">
              <Option value="parsing">解析中</Option>
              <Option value="drafting">起草中</Option>
              <Option value="reviewing">审核中</Option>
              <Option value="sealed">已封标</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="deadline"
            label="投标截止时间"
            rules={[{ required: true, message: '请选择投标截止时间' }]}
          >
            <DatePicker placeholder="请选择投标截止时间" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看项目详情模态框 */}
      <Modal
        title="项目详情"
        open={isViewModalVisible}
        onCancel={handleViewCancel}
        footer={[
          <Button key="close" onClick={handleViewCancel}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {currentProject && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h3>{currentProject.name}</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <p><strong>项目状态：</strong>{currentProject.status}</p>
                <p><strong>负责人：</strong>{currentProject.owner}</p>
                <p><strong>创建时间：</strong>{currentProject.createdAt}</p>
              </div>
              <div>
                <p><strong>招标文件：</strong>{currentProject.rfpFile}</p>
                <p><strong>投标截止时间：</strong>{currentProject.deadline}</p>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <p><strong>项目描述：</strong></p>
              <p>{currentProject.description}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* 编辑项目模态框 */}
      <Modal
        title="编辑项目"
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
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="项目描述"
          >
            <Input.TextArea rows={3} placeholder="请输入项目描述" />
          </Form.Item>
          
          <Form.Item
            name="owner"
            label="负责人"
            rules={[{ required: true, message: '请选择负责人' }]}
          >
            <Select placeholder="请选择负责人">
              <Option value="张三">张三</Option>
              <Option value="李四">李四</Option>
              <Option value="王五">王五</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="项目状态"
          >
            <Select placeholder="请选择项目状态">
              <Option value="parsing">解析中</Option>
              <Option value="drafting">起草中</Option>
              <Option value="reviewing">审核中</Option>
              <Option value="sealed">已封标</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="deadline"
            label="投标截止时间"
            rules={[{ required: true, message: '请选择投标截止时间' }]}
          >
            <DatePicker placeholder="请选择投标截止时间" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectManagement;