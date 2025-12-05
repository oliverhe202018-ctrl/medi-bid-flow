import { useState, useEffect } from 'react';
import { Card, Upload, Button, Select, Form, Table, Progress, Space, message, Modal, Tabs } from 'antd';
import { UploadOutlined, PlayCircleOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TabPane } = Tabs;

const AIBidGeneration = () => {
  const [form] = Form.useForm();
  const [templates, setTemplates] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [generatedBids, setGeneratedBids] = useState([]);
  const [activeTab, setActiveTab] = useState('generate');

  // 模拟数据
  const mockTemplates = [
    { id: '1', name: 'CT设备投标模板', template_type: 'CT' },
    { id: '2', name: 'MRI设备投标模板', template_type: 'MRI' },
    { id: '3', name: '超声设备投标模板', template_type: '超声' }
  ];

  const mockTasks = [
    {
      id: '1',
      company_id: '1',
      project_id: 'proj-001',
      template_id: '1',
      status: 'completed',
      progress: 100,
      rfp_file_url: '/rfps/ct-project.pdf',
      result_file_url: '/generated-bids/ct-project-bid.docx',
      created_at: '2024-01-18T10:00:00',
      updated_at: '2024-01-18T10:30:00'
    },
    {
      id: '2',
      company_id: '1',
      project_id: 'proj-002',
      template_id: '2',
      status: 'processing',
      progress: 65,
      rfp_file_url: '/rfps/mri-project.pdf',
      result_file_url: null,
      created_at: '2024-01-18T11:00:00',
      updated_at: '2024-01-18T11:15:00'
    },
    {
      id: '3',
      company_id: '1',
      project_id: 'proj-003',
      template_id: '3',
      status: 'pending',
      progress: 0,
      rfp_file_url: '/rfps/ultrasound-project.pdf',
      result_file_url: null,
      created_at: '2024-01-18T12:00:00',
      updated_at: '2024-01-18T12:00:00'
    }
  ];

  const mockGeneratedBids = [
    {
      id: '1',
      company_id: '1',
      project_id: 'proj-001',
      task_id: '1',
      template_id: '1',
      file_url: '/generated-bids/ct-project-bid.docx',
      status: 'draft',
      ai_generated_content: {
        product_params: { model: 'CT-2000', resolution: '0.35mm' },
        deviations: [{ param: '扫描速度', required: '≤1秒', provided: '0.8秒', deviation: '正偏离' }],
        company_qualifications: ['ISO9001认证', '医疗器械生产许可证']
      },
      manual_review_notes: null,
      created_at: '2024-01-18T10:30:00',
      updated_at: '2024-01-18T10:30:00'
    }
  ];

  useEffect(() => {
    // 实际项目中应从API获取数据
    setTemplates(mockTemplates);
    setTasks(mockTasks);
    setGeneratedBids(mockGeneratedBids);
  }, []);

  const handleGenerateBid = () => {
    form.validateFields()
      .then(values => {
        // 实际项目中应调用API生成标书
        message.success('标书生成任务已提交');
        // 模拟添加任务
        const newTask = {
          id: Math.random().toString(36).substr(2, 9),
          company_id: '1',
          project_id: 'proj-' + Math.random().toString(36).substr(2, 5),
          template_id: values.template_id,
          status: 'pending',
          progress: 0,
          rfp_file_url: '/rfps/new-project.pdf',
          result_file_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setTasks([newTask, ...tasks]);
        form.resetFields();
        // 切换到任务列表标签
        setActiveTab('tasks');
      })
      .catch(info => {
        message.error('表单验证失败');
      });
  };

  const handleTaskRefresh = () => {
    // 模拟任务进度更新
    const updatedTasks = tasks.map(task => {
      if (task.status === 'processing' && task.progress < 100) {
        return {
          ...task,
          progress: Math.min(100, task.progress + 10),
          status: Math.min(100, task.progress + 10) === 100 ? 'completed' : 'processing',
          updated_at: new Date().toISOString()
        };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  const handleViewBid = (bid) => {
    Modal.info({
      title: '生成的标书详情',
      width: 800,
      content: (
        <div>
          <h3>产品参数</h3>
          <pre>{JSON.stringify(bid.ai_generated_content.product_params, null, 2)}</pre>
          <h3>偏离情况</h3>
          <pre>{JSON.stringify(bid.ai_generated_content.deviations, null, 2)}</pre>
          <h3>公司资质</h3>
          <pre>{JSON.stringify(bid.ai_generated_content.company_qualifications, null, 2)}</pre>
          <h3>需要人工复核的内容</h3>
          <ul>
            <li>价格信息</li>
            <li>服务承诺</li>
            <li>交付时间</li>
            <li>其他关键商务条款</li>
          </ul>
        </div>
      )
    });
  };

  const taskColumns = [
    {
      title: '项目ID',
      dataIndex: 'project_id',
      key: 'project_id',
    },
    {
      title: '模板ID',
      dataIndex: 'template_id',
      key: 'template_id',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          pending: <span style={{ color: '#faad14' }}>等待中</span>,
          processing: <span style={{ color: '#1890ff' }}>处理中</span>,
          completed: <span style={{ color: '#52c41a' }}>已完成</span>,
          failed: <span style={{ color: '#f5222d' }}>失败</span>
        };
        return statusMap[status] || status;
      }
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => <Progress percent={progress} size="small" />
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
          {record.status === 'completed' && (
            <Button type="link" icon={<EyeOutlined />} onClick={() => {
              const bid = generatedBids.find(b => b.task_id === record.id);
              if (bid) handleViewBid(bid);
            }}>查看结果</Button>
          )}
        </Space>
      ),
    },
  ];

  const generatedBidColumns = [
    {
      title: '项目ID',
      dataIndex: 'project_id',
      key: 'project_id',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          draft: <span style={{ color: '#faad14' }}>草稿</span>,
          reviewed: <span style={{ color: '#52c41a' }}>已审核</span>,
          finalized: <span style={{ color: '#1890ff' }}>已定稿</span>
        };
        return statusMap[status] || status;
      }
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
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewBid(record)}>查看详情</Button>
          <Button type="link" icon={<CheckCircleOutlined />}>审核</Button>
          <Button type="link" icon={<CloseCircleOutlined />}>下载</Button>
        </Space>
      ),
    },
  ];

  const uploadProps = {
    name: 'file',
    action: 'http://localhost:8000/api/upload-rfp/',
    headers: {
      authorization: localStorage.getItem('token'),
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
        // 实际项目中应保存文件URL到表单
        form.setFieldsValue({ rfp_file_url: info.file.response.file_url });
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
  };

  return (
    <div>
      <Card title="AI标书自动生成">
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="生成标书" key="generate">
            <Form
              form={form}
              layout="vertical"
              initialValues={{ template_id: '1' }}
            >
              <Form.Item
                name="rfp_file"
                label="上传招标文件"
                rules={[{ required: true, message: '请上传招标文件' }]}
              >
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>点击上传招标文件</Button>
                </Upload>
              </Form.Item>

              <Form.Item
                name="template_id"
                label="选择投标模板"
                rules={[{ required: true, message: '请选择投标模板' }]}
              >
                <Select placeholder="请选择投标模板">
                  {templates.map(template => (
                    <Option key={template.id} value={template.id}>
                      {template.name} ({template.template_type})
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item>
                <Button type="primary" icon={<PlayCircleOutlined />} onClick={handleGenerateBid}>
                  开始生成标书
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="生成任务" key="tasks">
            <div style={{ marginBottom: 16 }}>
              <Button onClick={handleTaskRefresh}>刷新任务状态</Button>
            </div>
            <Table columns={taskColumns} dataSource={tasks} rowKey="id" />
          </TabPane>

          <TabPane tab="生成的标书" key="generated-bids">
            <Table columns={generatedBidColumns} dataSource={generatedBids} rowKey="id" />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default AIBidGeneration;