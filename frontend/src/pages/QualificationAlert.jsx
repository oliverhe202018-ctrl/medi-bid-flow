import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, Select, message, Popconfirm, Tag, Card, Statistic } from 'antd';
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const { RangePicker, DatePicker: SingleDatePicker } = DatePicker;

const QualificationAlert = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentQualification, setCurrentQualification] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [filterStatus, setFilterStatus] = useState('all');

  // 模拟资质数据
  const [qualifications, setQualifications] = useState([
    {
      id: '1',
      name: '医疗器械注册证',
      productModel: 'CT-Scan-X1',
      licenseNumber: '国械注准20233060123',
      issuer: '国家药品监督管理局',
      issueDate: '2023-06-15',
      expireDate: '2028-06-14',
      status: '有效',
      daysToExpire: 920,
    },
    {
      id: '2',
      name: '医疗器械生产许可证',
      productModel: 'CT-Scan-X1',
      licenseNumber: '沪食药监械生产许20210001号',
      issuer: '上海市药品监督管理局',
      issueDate: '2021-03-01',
      expireDate: '2026-02-28',
      status: '有效',
      daysToExpire: 452,
    },
    {
      id: '3',
      name: '医疗器械注册证',
      productModel: 'MRI-Scan-Y2',
      licenseNumber: '国械注准20223060456',
      issuer: '国家药品监督管理局',
      issueDate: '2022-12-01',
      expireDate: '2025-11-30',
      status: '即将过期',
      daysToExpire: 360,
    },
    {
      id: '4',
      name: '医疗器械注册证',
      productModel: 'US-Scan-Z3',
      licenseNumber: '国械注准20203060789',
      issuer: '国家药品监督管理局',
      issueDate: '2020-05-20',
      expireDate: '2025-05-19',
      status: '即将过期',
      daysToExpire: 168,
    },
    {
      id: '5',
      name: '医疗器械注册证',
      productModel: 'US-Scan-Z2',
      licenseNumber: '国械注准20193060321',
      issuer: '国家药品监督管理局',
      issueDate: '2019-04-10',
      expireDate: '2024-04-09',
      status: '已过期',
      daysToExpire: -240,
    },
  ]);

  // 计算状态统计
  const calculateStatusStats = () => {
    const stats = {
      total: qualifications.length,
      valid: 0,
      expiring: 0,
      expired: 0,
    };

    qualifications.forEach(qual => {
      if (qual.status === '有效') {
        stats.valid++;
      } else if (qual.status === '即将过期') {
        stats.expiring++;
      } else if (qual.status === '已过期') {
        stats.expired++;
      }
    });

    return stats;
  };

  // 过滤资质数据
  const filteredQualifications = qualifications.filter(qual => {
    if (filterStatus === 'all') return true;
    return qual.status === filterStatus;
  });

  const columns = [
    {
      title: '资质名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '产品型号',
      dataIndex: 'productModel',
      key: 'productModel',
    },
    {
      title: '证书编号',
      dataIndex: 'licenseNumber',
      key: 'licenseNumber',
    },
    {
      title: '发证机关',
      dataIndex: 'issuer',
      key: 'issuer',
    },
    {
      title: '签发日期',
      dataIndex: 'issueDate',
      key: 'issueDate',
    },
    {
      title: '有效期至',
      dataIndex: 'expireDate',
      key: 'expireDate',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'blue';
        let icon = <CheckCircleOutlined />;
        if (status === '即将过期') {
          color = 'orange';
          icon = <ClockCircleOutlined />;
        } else if (status === '已过期') {
          color = 'red';
          icon = <CloseCircleOutlined />;
        }
        return (
          <Tag color={color} icon={icon}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: '剩余天数',
      dataIndex: 'daysToExpire',
      key: 'daysToExpire',
      render: (days) => {
        if (days < 0) {
          return <span style={{ color: '#ff4d4f' }}>已过期 {-days} 天</span>;
        }
        if (days < 365) {
          return <span style={{ color: '#fa8c16' }}>还有 {days} 天过期</span>;
        }
        return <span style={{ color: '#52c41a' }}>还有 {days} 天过期</span>;
      },
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
            title="确定要删除这个资质吗？"
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

  // 新建资质
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
        // 计算剩余天数
        const today = new Date();
        const expireDate = new Date(values.expireDate);
        const daysToExpire = Math.ceil((expireDate - today) / (1000 * 60 * 60 * 24));
        
        // 确定状态
        let status = '有效';
        if (daysToExpire < 0) {
          status = '已过期';
        } else if (daysToExpire < 365) {
          status = '即将过期';
        }

        // 格式化日期为YYYY-MM-DD格式
        const formatDate = (date) => {
          return date.toISOString().split('T')[0];
        };

        const newQualification = {
          id: String(qualifications.length + 1),
          ...values,
          issueDate: formatDate(values.issueDate),
          expireDate: formatDate(values.expireDate),
          status: status,
          daysToExpire: daysToExpire,
        };
        
        setQualifications([...qualifications, newQualification]);
        message.success('资质添加成功');
        setIsModalVisible(false);
        form.resetFields();
      })
      .catch(errorInfo => {
        console.log('表单验证失败:', errorInfo);
      });
  };

  // 查看资质
  const handleView = (qualification) => {
    setCurrentQualification(qualification);
    setIsViewModalVisible(true);
  };

  const handleViewCancel = () => {
    setIsViewModalVisible(false);
    setCurrentQualification(null);
  };

  // 编辑资质
  const handleEdit = (qualification) => {
    setCurrentQualification(qualification);
    // 转换日期格式为moment对象
    const formValues = {
      ...qualification,
      issueDate: new Date(qualification.issueDate),
      expireDate: new Date(qualification.expireDate),
    };
    editForm.setFieldsValue(formValues);
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setCurrentQualification(null);
    editForm.resetFields();
  };

  const handleEditOk = () => {
    editForm.validateFields()
      .then(values => {
        // 计算剩余天数
        const today = new Date();
        const expireDate = new Date(values.expireDate);
        const daysToExpire = Math.ceil((expireDate - today) / (1000 * 60 * 60 * 24));
        
        // 确定状态
        let status = '有效';
        if (daysToExpire < 0) {
          status = '已过期';
        } else if (daysToExpire < 365) {
          status = '即将过期';
        }

        // 格式化日期为YYYY-MM-DD格式
        const formatDate = (date) => {
          return date.toISOString().split('T')[0];
        };

        const updatedQualification = {
          ...values,
          issueDate: formatDate(values.issueDate),
          expireDate: formatDate(values.expireDate),
          status: status,
          daysToExpire: daysToExpire,
        };

        const updatedQualifications = qualifications.map(qual => 
          qual.id === currentQualification.id ? updatedQualification : qual
        );
        
        setQualifications(updatedQualifications);
        message.success('资质编辑成功');
        setIsEditModalVisible(false);
        setCurrentQualification(null);
        editForm.resetFields();
      })
      .catch(errorInfo => {
        console.log('表单验证失败:', errorInfo);
      });
  };

  // 删除资质
  const handleDelete = (id) => {
    const updatedQualifications = qualifications.filter(qual => qual.id !== id);
    setQualifications(updatedQualifications);
    message.success('资质删除成功');
  };

  const statusStats = calculateStatusStats();

  return (
    <div>
      <h2>资质预警</h2>
      
      {/* 状态统计卡片 */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
        <Card>
          <Statistic title="总资质数" value={statusStats.total} />
        </Card>
        <Card>
          <Statistic 
            title="有效" 
            value={statusStats.valid} 
            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          />
        </Card>
        <Card>
          <Statistic 
            title="即将过期" 
            value={statusStats.expiring} 
            prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
          />
        </Card>
        <Card>
          <Statistic 
            title="已过期" 
            value={statusStats.expired} 
            prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
          />
        </Card>
      </div>

      {/* 操作栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Select 
            value={filterStatus} 
            onChange={setFilterStatus} 
            style={{ width: 200, marginRight: 16 }}
          >
            <Option value="all">全部状态</Option>
            <Option value="有效">有效</Option>
            <Option value="即将过期">即将过期</Option>
            <Option value="已过期">已过期</Option>
          </Select>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
          添加资质
        </Button>
      </div>
      
      <Table columns={columns} dataSource={filteredQualifications} rowKey="id" />

      {/* 新建资质模态框 */}
      <Modal
        title="添加资质"
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
            name="name"
            label="资质名称"
            rules={[{ required: true, message: '请输入资质名称' }]}
          >
            <Select placeholder="请选择资质类型">
              <Option value="医疗器械注册证">医疗器械注册证</Option>
              <Option value="医疗器械生产许可证">医疗器械生产许可证</Option>
              <Option value="医疗器械经营许可证">医疗器械经营许可证</Option>
              <Option value="ISO9001认证">ISO9001认证</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="productModel"
            label="产品型号"
            rules={[{ required: true, message: '请输入产品型号' }]}
          >
            <Select placeholder="请选择产品型号">
              <Option value="CT-Scan-X1">CT-Scan-X1</Option>
              <Option value="MRI-Scan-Y2">MRI-Scan-Y2</Option>
              <Option value="US-Scan-Z3">US-Scan-Z3</Option>
              <Option value="US-Scan-Z2">US-Scan-Z2</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="licenseNumber"
            label="证书编号"
            rules={[{ required: true, message: '请输入证书编号' }]}
          >
            <Input placeholder="请输入证书编号" />
          </Form.Item>
          
          <Form.Item
            name="issuer"
            label="发证机关"
            rules={[{ required: true, message: '请输入发证机关' }]}
          >
            <Input placeholder="请输入发证机关" />
          </Form.Item>
          
          <Form.Item
            name="issueDate"
            label="签发日期"
            rules={[{ required: true, message: '请选择签发日期' }]}
          >
            <SingleDatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="expireDate"
            label="有效期至"
            rules={[{ required: true, message: '请选择有效期至' }]}
          >
            <SingleDatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看资质模态框 */}
      <Modal
        title="资质详情"
        open={isViewModalVisible}
        onCancel={handleViewCancel}
        footer={[
          <Button key="close" onClick={handleViewCancel}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {currentQualification && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h3>{currentQualification.name}</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <p><strong>产品型号：</strong>{currentQualification.productModel}</p>
                <p><strong>证书编号：</strong>{currentQualification.licenseNumber}</p>
                <p><strong>发证机关：</strong>{currentQualification.issuer}</p>
              </div>
              <div>
                <p><strong>签发日期：</strong>{currentQualification.issueDate}</p>
                <p><strong>有效期至：</strong>{currentQualification.expireDate}</p>
                <p><strong>状态：</strong>
                  {currentQualification.status === '有效' && (
                    <Tag color="green">有效</Tag>
                  )}
                  {currentQualification.status === '即将过期' && (
                    <Tag color="orange">即将过期</Tag>
                  )}
                  {currentQualification.status === '已过期' && (
                    <Tag color="red">已过期</Tag>
                  )}
                </p>
                <p><strong>剩余天数：</strong>
                  <span style={{
                    color: currentQualification.daysToExpire < 0 ? '#ff4d4f' : 
                           currentQualification.daysToExpire < 365 ? '#fa8c16' : '#52c41a'
                  }}>
                    {currentQualification.daysToExpire < 0 ? `已过期 ${-currentQualification.daysToExpire} 天` : `还有 ${currentQualification.daysToExpire} 天过期`}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* 编辑资质模态框 */}
      <Modal
        title="编辑资质"
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
            label="资质名称"
            rules={[{ required: true, message: '请输入资质名称' }]}
          >
            <Select placeholder="请选择资质类型">
              <Option value="医疗器械注册证">医疗器械注册证</Option>
              <Option value="医疗器械生产许可证">医疗器械生产许可证</Option>
              <Option value="医疗器械经营许可证">医疗器械经营许可证</Option>
              <Option value="ISO9001认证">ISO9001认证</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="productModel"
            label="产品型号"
            rules={[{ required: true, message: '请输入产品型号' }]}
          >
            <Select placeholder="请选择产品型号">
              <Option value="CT-Scan-X1">CT-Scan-X1</Option>
              <Option value="MRI-Scan-Y2">MRI-Scan-Y2</Option>
              <Option value="US-Scan-Z3">US-Scan-Z3</Option>
              <Option value="US-Scan-Z2">US-Scan-Z2</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="licenseNumber"
            label="证书编号"
            rules={[{ required: true, message: '请输入证书编号' }]}
          >
            <Input placeholder="请输入证书编号" />
          </Form.Item>
          
          <Form.Item
            name="issuer"
            label="发证机关"
            rules={[{ required: true, message: '请输入发证机关' }]}
          >
            <Input placeholder="请输入发证机关" />
          </Form.Item>
          
          <Form.Item
            name="issueDate"
            label="签发日期"
            rules={[{ required: true, message: '请选择签发日期' }]}
          >
            <SingleDatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="expireDate"
            label="有效期至"
            rules={[{ required: true, message: '请选择有效期至' }]}
          >
            <SingleDatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default QualificationAlert;