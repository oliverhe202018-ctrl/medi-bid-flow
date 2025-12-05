import { useState, useEffect } from 'react';
import { Table, Upload, Button, Modal, Form, Input, Select, message, Space, Card } from 'antd';
import { UploadOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const BidTemplateManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  // 模拟数据，实际应从API获取
  const mockTemplates = [
    {
      id: '1',
      company_id: '1',
      name: 'CT设备投标模板',
      file_url: '/templates/ct-template.docx',
      template_type: 'CT',
      created_at: '2024-01-15T10:30:00'
    },
    {
      id: '2',
      company_id: '1',
      name: 'MRI设备投标模板',
      file_url: '/templates/mri-template.docx',
      template_type: 'MRI',
      created_at: '2024-01-16T14:20:00'
    },
    {
      id: '3',
      company_id: '1',
      name: '超声设备投标模板',
      file_url: '/templates/ultrasound-template.docx',
      template_type: '超声',
      created_at: '2024-01-17T09:15:00'
    }
  ];

  useEffect(() => {
    // 实际项目中应从API获取数据
    // axios.get('http://localhost:8000/api/bid-templates/').then(res => setTemplates(res.data));
    setTemplates(mockTemplates);
  }, []);

  const handleModalOk = () => {
    form.validateFields()
      .then(values => {
        if (editingId) {
          // 编辑模板
          const updatedTemplates = templates.map(template => 
            template.id === editingId ? { ...template, ...values } : template
          );
          setTemplates(updatedTemplates);
          message.success('模板编辑成功');
        } else {
          // 添加模板
          const newTemplate = {
            id: Math.random().toString(36).substr(2, 9),
            company_id: '1',
            ...values,
            created_at: new Date().toISOString()
          };
          setTemplates([...templates, newTemplate]);
          message.success('模板添加成功');
        }
        setIsModalVisible(false);
        form.resetFields();
        setEditingId(null);
      })
      .catch(info => {
        message.error('表单验证失败');
      });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingId(null);
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该模板吗？',
      onOk: () => {
        const updatedTemplates = templates.filter(template => template.id !== id);
        setTemplates(updatedTemplates);
        message.success('模板删除成功');
      }
    });
  };

  const columns = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '模板类型',
      dataIndex: 'template_type',
      key: 'template_type',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => new Date(text).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />}>查看</Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  const uploadProps = {
    name: 'file',
    action: 'http://localhost:8000/api/bid-templates/upload',
    headers: {
      authorization: localStorage.getItem('token'),
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
        // 刷新模板列表
        // axios.get('http://localhost:8000/api/bid-templates/').then(res => setTemplates(res.data));
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
  };

  return (
    <div>
      <Card title="标书模板管理" extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加模板</Button>}>
        <div style={{ marginBottom: 16 }}>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>上传新模板</Button>
          </Upload>
        </div>
        <Table columns={columns} dataSource={templates} rowKey="id" />
      </Card>

      <Modal
        title={editingId ? '编辑模板' : '添加模板'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ template_type: 'CT' }}
        >
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: '请输入模板名称' }]}
          >
            <Input placeholder="请输入模板名称" />
          </Form.Item>

          <Form.Item
            name="template_type"
            label="模板类型"
            rules={[{ required: true, message: '请选择模板类型' }]}
          >
            <Select placeholder="请选择模板类型">
              <Option value="CT">CT</Option>
              <Option value="MRI">MRI</Option>
              <Option value="超声">超声</Option>
              <Option value="X光">X光</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="file_url"
            label="模板文件URL"
            rules={[{ required: true, message: '请输入模板文件URL' }]}
          >
            <Input placeholder="请输入模板文件URL" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BidTemplateManagement;