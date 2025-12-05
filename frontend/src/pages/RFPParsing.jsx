import React, { useState } from 'react';
import { Upload, Button, Card, Table, Progress, Tag, Modal, Form, Input, Select, message, Tabs } from 'antd';
import { UploadOutlined, FileTextOutlined, CheckCircleOutlined, WarningOutlined, EditOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

const { Option } = Select;

const RFPParsing = () => {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [form] = Form.useForm();

  // 模拟解析结果数据
  const [parsingResults, setParsingResults] = useState([
    {
      id: '1',
      category: '技术参数',
      paramName: '扫描速度',
      tenderValue: '≥100mm/s',
      extractedKey: '扫描速度',
      extractedValue: '100mm/s',
      operator: '≥',
      status: 'success',
    },
    {
      id: '2',
      category: '技术参数',
      paramName: '探测器排数',
      tenderValue: '≥64排',
      extractedKey: '探测器排数',
      extractedValue: '64排',
      operator: '≥',
      status: 'success',
    },
    {
      id: '3',
      category: '技术参数',
      paramName: '空间分辨率',
      tenderValue: '≤0.3mm',
      extractedKey: '空间分辨率',
      extractedValue: '0.3mm',
      operator: '≤',
      status: 'warning',
    },
    {
      id: '4',
      category: '资质要求',
      paramName: '医疗器械生产许可证',
      tenderValue: '必须具备',
      extractedKey: '医疗器械生产许可证',
      extractedValue: '具备',
      operator: '包含',
      status: 'success',
    },
    {
      id: '5',
      category: '资质要求',
      paramName: 'ISO9001认证',
      tenderValue: '必须具备',
      extractedKey: 'ISO9001认证',
      extractedValue: '具备',
      operator: '包含',
      status: 'success',
    },
    {
      id: '6',
      category: '废标条款',
      paramName: '投标文件完整性',
      tenderValue: '所有文件必须齐全',
      extractedKey: '投标文件完整性',
      extractedValue: '齐全',
      operator: '包含',
      status: 'success',
    },
    {
      id: '7',
      category: '废标条款',
      paramName: '投标保证金',
      tenderValue: '必须缴纳',
      extractedKey: '投标保证金',
      extractedValue: '已缴纳',
      operator: '包含',
      status: 'warning',
    },
  ]);

  const columns = [
    {
      title: '参数名称',
      dataIndex: 'paramName',
      key: 'paramName',
    },
    {
      title: '招标要求',
      dataIndex: 'tenderValue',
      key: 'tenderValue',
    },
    {
      title: '提取关键词',
      dataIndex: 'extractedKey',
      key: 'extractedKey',
    },
    {
      title: '提取值',
      dataIndex: 'extractedValue',
      key: 'extractedValue',
    },
    {
      title: '运算符',
      dataIndex: 'operator',
      key: 'operator',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (status === 'success') {
          return <Tag color="success">已确认</Tag>;
        } else if (status === 'warning') {
          return <Tag color="warning">待确认</Tag>;
        }
        return <Tag color="default">未处理</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>
      ),
    },
  ];

  // 模拟文件上传
  const uploadProps = {
    name: 'file',
    action: '/api/upload-rfp',
    headers: {
      authorization: 'authorization-text',
    },
    beforeUpload: (file) => {
      const isPDF = file.type === 'application/pdf';
      const isWord = file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const isLt50M = file.size / 1024 / 1024 < 50;
      
      if (!isPDF && !isWord) {
        alert('请上传PDF或Word文件！');
        return Upload.LIST_IGNORE;
      }
      if (!isLt50M) {
        alert('文件大小不能超过50MB！');
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    onChange(info) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        // 这里可以添加解析逻辑或跳转到解析结果页面
        console.log('文件上传成功，开始解析...');
      } else if (info.file.status === 'error') {
        console.log('文件上传失败');
      }
    },
  };

  // 编辑解析项
  const handleEdit = (item) => {
    setCurrentItem(item);
    form.setFieldsValue(item);
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setCurrentItem(null);
    form.resetFields();
  };

  const handleEditOk = () => {
    form.validateFields()
      .then(values => {
        const updatedResults = parsingResults.map(item => 
          item.id === currentItem.id ? { ...item, ...values } : item
        );
        setParsingResults(updatedResults);
        message.success('解析项编辑成功');
        setIsEditModalVisible(false);
        setCurrentItem(null);
        form.resetFields();
      })
      .catch(errorInfo => {
        console.log('表单验证失败:', errorInfo);
      });
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2>RFP解析</h2>
      </div>
      
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <Card title="上传招标文件" style={{ width: 350 }}>
          <Upload.Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
            <p className="ant-upload-hint">
              支持PDF、Word格式，单个文件不超过50MB
            </p>
          </Upload.Dragger>
        </Card>
        
        <Card title="解析进度" style={{ flex: 1 }}>
          <div style={{ marginBottom: 16 }}>
            <h4>XX医院CT设备采购项目.pdf</h4>
            <Progress percent={75} status="active" style={{ margin: '16px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>解析中...</span>
              <span>预计剩余时间：15秒</span>
            </div>
          </div>
          
          <div>
            <h4>解析结果概览</h4>
            <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                <span>技术参数：24/30 项已提取</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                <span>资质要求：8/10 项已提取</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <WarningOutlined style={{ color: '#faad14', marginRight: 8 }} />
                <span>废标条款：2/5 项已提取</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      <Card title="解析结果明细">
        <Tabs defaultActiveKey="technical">
          <TabPane tab="技术参数" key="technical">
            <Table 
              columns={columns} 
              dataSource={parsingResults.filter(item => item.category === '技术参数')} 
              rowKey="id" 
            />
          </TabPane>
          <TabPane tab="资质要求" key="qualification">
            <Table 
              columns={columns} 
              dataSource={parsingResults.filter(item => item.category === '资质要求')} 
              rowKey="id" 
            />
          </TabPane>
          <TabPane tab="废标条款" key="disqualification">
            <Table 
              columns={columns} 
              dataSource={parsingResults.filter(item => item.category === '废标条款')} 
              rowKey="id" 
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 编辑解析项模态框 */}
      <Modal
        title="编辑解析项"
        open={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="paramName"
            label="参数名称"
            rules={[{ required: true, message: '请输入参数名称' }]}
          >
            <Input placeholder="请输入参数名称" />
          </Form.Item>
          
          <Form.Item
            name="tenderValue"
            label="招标要求"
            rules={[{ required: true, message: '请输入招标要求' }]}
          >
            <Input placeholder="请输入招标要求" />
          </Form.Item>
          
          <Form.Item
            name="extractedKey"
            label="提取关键词"
            rules={[{ required: true, message: '请输入提取关键词' }]}
          >
            <Input placeholder="请输入提取关键词" />
          </Form.Item>
          
          <Form.Item
            name="extractedValue"
            label="提取值"
            rules={[{ required: true, message: '请输入提取值' }]}
          >
            <Input placeholder="请输入提取值" />
          </Form.Item>
          
          <Form.Item
            name="operator"
            label="运算符"
            rules={[{ required: true, message: '请选择运算符' }]}
          >
            <Select placeholder="请选择运算符">
              <Option value="">无</Option>
              <Option value="=">等于</Option>
              <Option value="!=">不等于</Option>
              <Option value=">">大于</Option>
              <Option value=">=">大于等于</Option>
              <Option value="<">小于</Option>
              <Option value="<=">小于等于</Option>
              <Option value="包含">包含</Option>
              <Option value="不包含">不包含</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="success">已确认</Option>
              <Option value="warning">待确认</Option>
              <Option value="error">错误</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RFPParsing;