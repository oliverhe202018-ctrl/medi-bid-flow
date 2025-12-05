import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Upload, message, Popconfirm } from 'antd';
import { PlusOutlined, UploadOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

const KnowledgeBase = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentChunk, setCurrentChunk] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // 模拟知识库数据
  const [knowledgeChunks, setKnowledgeChunks] = useState([
    {
      id: '1',
      category: '影像设备',
      subCategory: 'CT',
      content: 'XX医院CT设备维保方案：响应时间小于2小时，24小时在线技术支持，定期维护保养，故障响应时间不超过2小时，备件更换周期不超过48小时。',
      source: '2023年协和医院中标书',
      type: '售后方案',
      tenantId: 'tenant1',
    },
    {
      id: '2',
      category: '影像设备',
      subCategory: 'MRI',
      content: 'YY医院MRI设备实施案例：包括场地准备、设备安装、人员培训、系统调试等环节，总周期为15天。场地要求：电源380V，接地电阻小于1欧姆，温度18-22℃，湿度40-60%。',
      source: '2024年同济医院中标书',
      type: '实施案例',
      tenantId: 'tenant1',
    },
    {
      id: '3',
      category: '影像设备',
      subCategory: '超声',
      content: 'ZZ医院超声设备技术参数响应：详细列出了设备的各项技术指标，包括探头频率、成像深度、分辨率等，所有参数均符合或优于招标要求。',
      source: '2024年华山医院中标书',
      type: '技术响应',
      tenantId: 'tenant1',
    },
    {
      id: '4',
      category: '手术设备',
      subCategory: '腹腔镜',
      content: 'AA医院腹腔镜设备采购项目：详细列出了设备的技术参数、配置清单、售后服务要求等。',
      source: '2023年中山医院中标书',
      type: '技术响应',
      tenantId: 'tenant1',
    },
  ]);

  // 知识库类别配置
  const knowledgeCategories = {
    '影像设备': ['CT', 'MRI', '超声', 'X光', 'DSA'],
    '手术设备': ['腹腔镜', '内窥镜', '手术机器人', '麻醉机'],
    '药品': ['心内科', '神经内科', '呼吸科', '消化科', '骨科'],
    '检验科设备': ['生化分析仪', '血液分析仪', '免疫分析仪', '微生物分析仪'],
    '试剂': ['免疫试剂', '生化试剂', '微生物试剂', '分子诊断试剂']
  };

  const columns = [
    {
      title: '产品类别',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '子类别',
      dataIndex: 'subCategory',
      key: 'subCategory',
    },
    {
      title: '内容摘要',
      dataIndex: 'content',
      key: 'content',
      render: (content) => content.slice(0, 100) + '...',
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
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
            查看详情
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个知识库条目吗？"
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

  // 新建知识库条目
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
        const newChunk = {
          id: String(knowledgeChunks.length + 1),
          ...values,
          tenantId: 'tenant1',
        };
        setKnowledgeChunks([...knowledgeChunks, newChunk]);
        message.success('知识库条目添加成功');
        setIsModalVisible(false);
        form.resetFields();
      })
      .catch(errorInfo => {
        console.log('表单验证失败:', errorInfo);
      });
  };

  // 查看知识库条目
  const handleView = (chunk) => {
    setCurrentChunk(chunk);
    setIsViewModalVisible(true);
  };

  const handleViewCancel = () => {
    setIsViewModalVisible(false);
    setCurrentChunk(null);
  };

  // 编辑知识库条目
  const handleEdit = (chunk) => {
    setCurrentChunk(chunk);
    editForm.setFieldsValue(chunk);
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setCurrentChunk(null);
    editForm.resetFields();
  };

  const handleEditOk = () => {
    editForm.validateFields()
      .then(values => {
        const updatedChunks = knowledgeChunks.map(chunk => 
          chunk.id === currentChunk.id ? { ...chunk, ...values } : chunk
        );
        setKnowledgeChunks(updatedChunks);
        message.success('知识库条目编辑成功');
        setIsEditModalVisible(false);
        setCurrentChunk(null);
        editForm.resetFields();
      })
      .catch(errorInfo => {
        console.log('表单验证失败:', errorInfo);
      });
  };

  // 删除知识库条目
  const handleDelete = (id) => {
    const updatedChunks = knowledgeChunks.filter(chunk => chunk.id !== id);
    setKnowledgeChunks(updatedChunks);
    message.success('知识库条目删除成功');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>知识库管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
          添加知识库条目
        </Button>
      </div>
      
      <Table columns={columns} dataSource={knowledgeChunks} rowKey="id" />

      {/* 新建知识库条目模态框 */}
      <Modal
        title="添加知识库条目"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ category: '影像设备', subCategory: 'CT', type: '技术响应' }}
        >
          <Form.Item
            name="category"
            label="产品类别"
            rules={[{ required: true, message: '请选择产品类别' }]}
          >
            <Select placeholder="请选择产品类别" onChange={(value) => {
              form.setFieldsValue({ subCategory: knowledgeCategories[value][0] });
            }}>
              {Object.keys(knowledgeCategories).map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="subCategory"
            label="子类别"
            rules={[{ required: true, message: '请选择子类别' }]}
          >
            <Select placeholder="请选择子类别">
              {(form.getFieldValue('category') && knowledgeCategories[form.getFieldValue('category')] || knowledgeCategories['影像设备']).map(subCategory => (
                <Option key={subCategory} value={subCategory}>{subCategory}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入知识库内容' }]}
          >
            <Input.TextArea rows={6} placeholder="请输入知识库内容" />
          </Form.Item>
          
          <Form.Item
            name="source"
            label="来源"
            rules={[{ required: true, message: '请输入来源信息' }]}
          >
            <Input placeholder="请输入来源信息，如：2023年协和医院中标书" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select placeholder="请选择知识库条目类型">
              <Option value="售后方案">售后方案</Option>
              <Option value="实施案例">实施案例</Option>
              <Option value="技术响应">技术响应</Option>
              <Option value="资质文件">资质文件</Option>
              <Option value="商务方案">商务方案</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="file"
            label="关联文件"
          >
            <Upload beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
            <p className="ant-form-text" style={{ color: '#666' }}>
              可选，支持PDF、Word格式
            </p>
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看知识库条目模态框 */}
      <Modal
        title="知识库条目详情"
        open={isViewModalVisible}
        onCancel={handleViewCancel}
        footer={[
          <Button key="close" onClick={handleViewCancel}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        {currentChunk && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h3>{currentChunk.type}</h3>
              <p style={{ color: '#666', marginTop: 4 }}>来源：{currentChunk.source}</p>
            </div>
            <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
              <p>{currentChunk.content}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* 编辑知识库条目模态框 */}
      <Modal
        title="编辑知识库条目"
        open={isEditModalVisible}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
        width={700}
      >
        <Form
          form={editForm}
          layout="vertical"
        >
          <Form.Item
            name="category"
            label="产品类别"
            rules={[{ required: true, message: '请选择产品类别' }]}
          >
            <Select placeholder="请选择产品类别" onChange={(value) => {
              editForm.setFieldsValue({ subCategory: knowledgeCategories[value][0] });
            }}>
              {Object.keys(knowledgeCategories).map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="subCategory"
            label="子类别"
            rules={[{ required: true, message: '请选择子类别' }]}
          >
            <Select placeholder="请选择子类别">
              {(editForm.getFieldValue('category') && knowledgeCategories[editForm.getFieldValue('category')] || knowledgeCategories['影像设备']).map(subCategory => (
                <Option key={subCategory} value={subCategory}>{subCategory}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入知识库内容' }]}
          >
            <Input.TextArea rows={6} placeholder="请输入知识库内容" />
          </Form.Item>
          
          <Form.Item
            name="source"
            label="来源"
            rules={[{ required: true, message: '请输入来源信息' }]}
          >
            <Input placeholder="请输入来源信息，如：2023年协和医院中标书" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择类型' }]}
          >
            <Select placeholder="请选择知识库条目类型">
              <Option value="售后方案">售后方案</Option>
              <Option value="实施案例">实施案例</Option>
              <Option value="技术响应">技术响应</Option>
              <Option value="资质文件">资质文件</Option>
              <Option value="商务方案">商务方案</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default KnowledgeBase;