import React, { useState } from 'react';
import { Table, Button, Upload, Card, Tag, Modal, message, Select, DatePicker, Progress } from 'antd';
import { UploadOutlined, FileTextOutlined, CheckCircleOutlined, WarningOutlined, CloseCircleOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { RangePicker, DatePicker: SingleDatePicker } = DatePicker;

const BidCheckup = () => {
  const [selectedProject, setSelectedProject] = useState('all');
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [currentCheckup, setCurrentCheckup] = useState(null);
  const [uploading, setUploading] = useState(false);

  // 模拟体检记录数据
  const [checkupRecords, setCheckupRecords] = useState([
    {
      id: '1',
      projectName: 'XX医院CT设备采购项目',
      bidFileName: 'XX医院CT设备投标文件.pdf',
      checkupDate: '2025-12-03',
      status: 'warning',
      totalChecks: 15,
      passed: 12,
      warnings: 2,
      errors: 1,
      progress: 80,
    },
    {
      id: '2',
      projectName: 'YY医院MRI设备采购项目',
      bidFileName: 'YY医院MRI设备投标文件.pdf',
      checkupDate: '2025-12-02',
      status: 'success',
      totalChecks: 15,
      passed: 15,
      warnings: 0,
      errors: 0,
      progress: 100,
    },
    {
      id: '3',
      projectName: 'ZZ医院超声设备采购项目',
      bidFileName: 'ZZ医院超声设备投标文件.pdf',
      checkupDate: '2025-12-01',
      status: 'error',
      totalChecks: 15,
      passed: 10,
      warnings: 1,
      errors: 4,
      progress: 67,
    },
  ]);

  // 模拟体检详情数据
  const checkupDetails = {
    '1': {
      id: '1',
      projectName: 'XX医院CT设备采购项目',
      bidFileName: 'XX医院CT设备投标文件.pdf',
      checkupDate: '2025-12-03',
      status: 'warning',
      totalChecks: 15,
      passed: 12,
      warnings: 2,
      errors: 1,
      progress: 80,
      results: [
        {
          id: '101',
          category: '商务部分',
          checkItem: '金额大小写一致',
          status: 'passed',
          description: '所有金额的大小写格式一致，无错误',
          suggestion: '',
        },
        {
          id: '102',
          category: '商务部分',
          checkItem: '投标保证金金额',
          status: 'passed',
          description: '投标保证金金额符合招标文件要求',
          suggestion: '',
        },
        {
          id: '103',
          category: '商务部分',
          checkItem: '投标有效期',
          status: 'passed',
          description: '投标有效期符合招标文件要求',
          suggestion: '',
        },
        {
          id: '104',
          category: '技术部分',
          checkItem: '参数响应完整性',
          status: 'passed',
          description: '所有技术参数均已响应',
          suggestion: '',
        },
        {
          id: '105',
          category: '技术部分',
          checkItem: '偏离表完整性',
          status: 'passed',
          description: '技术规格偏离表完整',
          suggestion: '',
        },
        {
          id: '106',
          category: '技术部分',
          checkItem: '资质文件完整性',
          status: 'passed',
          description: '所有资质文件均已提供',
          suggestion: '',
        },
        {
          id: '107',
          category: '合规性',
          checkItem: '竞品名称检查',
          status: 'warning',
          description: '检测到可能的竞品名称："ABC公司"',
          suggestion: '请确认是否需要修改为符合要求的表述',
        },
        {
          id: '108',
          category: '合规性',
          checkItem: '其他医院名称检查',
          status: 'warning',
          description: '检测到其他医院名称："DEF医院"',
          suggestion: '请确认是否需要删除或修改',
        },
        {
          id: '109',
          category: '合规性',
          checkItem: '废标条款检查',
          status: 'error',
          description: '未提供部分资质文件的原件扫描件',
          suggestion: '请补充提供所有资质文件的原件扫描件',
        },
        {
          id: '110',
          category: '格式检查',
          checkItem: '字体格式一致性',
          status: 'passed',
          description: '字体格式符合要求',
          suggestion: '',
        },
        {
          id: '111',
          category: '格式检查',
          checkItem: '页码连续性',
          status: 'passed',
          description: '页码连续，无缺失',
          suggestion: '',
        },
        {
          id: '112',
          category: '格式检查',
          checkItem: '目录与内容一致性',
          status: 'passed',
          description: '目录与内容一致',
          suggestion: '',
        },
        {
          id: '113',
          category: '响应性',
          status: 'passed',
          checkItem: '招标要求响应完整性',
          description: '所有招标要求均已响应',
          suggestion: '',
        },
        {
          id: '114',
          category: '响应性',
          checkItem: '评分项响应',
          status: 'passed',
          description: '所有评分项均已响应',
          suggestion: '',
        },
        {
          id: '115',
          category: '响应性',
          checkItem: '废标项响应',
          status: 'passed',
          description: '所有废标项均已满足',
          suggestion: '',
        },
      ],
    },
  };

  // 项目列表
  const projects = [
    { id: 'all', name: '全部项目' },
    { id: '1', name: 'XX医院CT设备采购项目' },
    { id: '2', name: 'YY医院MRI设备采购项目' },
    { id: '3', name: 'ZZ医院超声设备采购项目' },
  ];

  // 过滤体检记录
  const filteredRecords = checkupRecords.filter(record => {
    if (selectedProject === 'all') return true;
    // 这里根据项目ID匹配，实际应该根据项目ID字段匹配
    return record.id === selectedProject;
  });

  // 体检记录表格列配置
  const columns = [
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: '投标文件',
      dataIndex: 'bidFileName',
      key: 'bidFileName',
    },
    {
      title: '体检日期',
      dataIndex: 'checkupDate',
      key: 'checkupDate',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'blue';
        let icon = <CheckCircleOutlined />;
        if (status === 'warning') {
          color = 'orange';
          icon = <WarningOutlined />;
        } else if (status === 'error') {
          color = 'red';
          icon = <CloseCircleOutlined />;
        } else if (status === 'success') {
          color = 'green';
          icon = <CheckCircleOutlined />;
        }
        return (
          <Tag color={color} icon={icon}>
            {status === 'success' ? '通过' : status === 'warning' ? '警告' : '错误'}
          </Tag>
        );
      },
    },
    {
      title: '体检进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress) => (
        <Progress percent={progress} size="small" />
      ),
    },
    {
      title: '检查结果',
      key: 'resultSummary',
      render: (_, record) => (
        <div>
          <Tag color="green">通过：{record.passed}项</Tag>
          <Tag color="orange">警告：{record.warnings}项</Tag>
          <Tag color="red">错误：{record.errors}项</Tag>
          <Tag color="blue">总计：{record.totalChecks}项</Tag>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <span>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleViewCheckup(record.id)}
          >
            查看报告
          </Button>
          <Button 
            type="link" 
            icon={<ReloadOutlined />}
            onClick={() => handleRecheck(record.id)}
          >
            重新体检
          </Button>
        </span>
      ),
    },
  ];

  // 体检详情表格列配置
  const detailColumns = [
    {
      title: '检查类别',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '检查项',
      dataIndex: 'checkItem',
      key: 'checkItem',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'blue';
        let icon = <CheckCircleOutlined />;
        if (status === 'warning') {
          color = 'orange';
          icon = <WarningOutlined />;
        } else if (status === 'error') {
          color = 'red';
          icon = <CloseCircleOutlined />;
        } else if (status === 'passed') {
          color = 'green';
          icon = <CheckCircleOutlined />;
        }
        return (
          <Tag color={color} icon={icon}>
            {status === 'passed' ? '通过' : status === 'warning' ? '警告' : '错误'}
          </Tag>
        );
      },
    },
    {
      title: '问题描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '建议',
      dataIndex: 'suggestion',
      key: 'suggestion',
    },
  ];

  // 上传文件进行体检
  const uploadProps = {
    name: 'bidFile',
    action: '/api/bid-checkup',
    headers: {
      authorization: 'authorization-text',
    },
    beforeUpload: (file) => {
      const isPDF = file.type === 'application/pdf';
      const isWord = file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const isLt100M = file.size / 1024 / 1024 < 100;
      
      if (!isPDF && !isWord) {
        message.error('只能上传PDF或Word文件！');
        return Upload.LIST_IGNORE;
      }
      if (!isLt100M) {
        message.error('文件大小不能超过100MB！');
        return Upload.LIST_IGNORE;
      }
      return true;
    },
    onChange(info) {
      if (info.file.status === 'uploading') {
        setUploading(true);
        return;
      }
      if (info.file.status === 'done') {
        setUploading(false);
        message.success(`${info.file.name} 文件上传成功，正在进行体检...`);
        // 这里应该调用体检API，然后更新体检记录
        // 模拟体检完成
        setTimeout(() => {
          message.success('标书体检完成！');
        }, 2000);
      } else if (info.file.status === 'error') {
        setUploading(false);
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
  };

  // 查看体检报告
  const handleViewCheckup = (id) => {
    const checkup = checkupDetails[id];
    if (checkup) {
      setCurrentCheckup(checkup);
      setIsViewModalVisible(true);
    }
  };

  const handleViewCancel = () => {
    setIsViewModalVisible(false);
    setCurrentCheckup(null);
  };

  // 重新体检
  const handleRecheck = (id) => {
    message.success(`正在重新体检...`);
    // 这里应该调用重新体检API
    setTimeout(() => {
      message.success('重新体检完成！');
    }, 2000);
  };

  return (
    <div>
      <h2>标书体检</h2>
      
      {/* 操作区 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Select 
            value={selectedProject} 
            onChange={setSelectedProject} 
            style={{ width: 200 }}
          >
            {projects.map(project => (
              <Option key={project.id} value={project.id}>{project.name}</Option>
            ))}
          </Select>
        </div>
      </div>

      {/* 上传文件卡片 */}
      <Card title="上传标书文件进行体检" style={{ marginBottom: 24 }}>
        <Upload.Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
          <p className="ant-upload-hint">
            支持PDF、Word格式，单个文件不超过100MB
          </p>
        </Upload.Dragger>
      </Card>

      {/* 体检记录表格 */}
      <Card title="体检记录">
        <Table columns={columns} dataSource={filteredRecords} rowKey="id" />
      </Card>

      {/* 体检报告详情模态框 */}
      <Modal
        title="标书体检报告"
        open={isViewModalVisible}
        onCancel={handleViewCancel}
        footer={[
          <Button key="close" onClick={handleViewCancel}>
            关闭
          </Button>,
          <Button key="recheck" type="primary" onClick={() => handleRecheck(currentCheckup?.id)}>
            重新体检
          </Button>,
        ]}
        width={900}
        scroll={{ y: 600 }}
      >
        {currentCheckup && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h3>{currentCheckup.projectName}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
                <div>
                  <p><strong>投标文件：</strong>{currentCheckup.bidFileName}</p>
                  <p><strong>体检日期：</strong>{currentCheckup.checkupDate}</p>
                </div>
                <div>
                  <p><strong>状态：</strong>
                    {currentCheckup.status === 'success' && (
                      <Tag color="green">通过</Tag>
                    )}
                    {currentCheckup.status === 'warning' && (
                      <Tag color="orange">警告</Tag>
                    )}
                    {currentCheckup.status === 'error' && (
                      <Tag color="red">错误</Tag>
                    )}
                  </p>
                  <p><strong>体检进度：</strong>
                    <Progress percent={currentCheckup.progress} size="small" style={{ marginLeft: 8 }} />
                  </p>
                </div>
                <div>
                  <p><strong>检查结果：</strong></p>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <Tag color="green">通过：{currentCheckup.passed}项</Tag>
                    <Tag color="orange">警告：{currentCheckup.warnings}项</Tag>
                    <Tag color="red">错误：{currentCheckup.errors}项</Tag>
                    <Tag color="blue">总计：{currentCheckup.totalChecks}项</Tag>
                  </div>
                </div>
              </div>
            </div>

            {/* 体检详情表格 */}
            <Table 
              columns={detailColumns} 
              dataSource={currentCheckup.results} 
              rowKey="id" 
              pagination={false}
              scroll={{ y: 400 }}
            />

            {/* 体检总结 */}
            <div style={{ marginTop: 24, padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
              <h4>体检总结</h4>
              <p style={{ marginTop: 8 }}>
                {currentCheckup.status === 'success' ? (
                  '恭喜！您的投标文件通过了所有检查项，请继续保持！'
                ) : currentCheckup.status === 'warning' ? (
                  '您的投标文件存在一些警告项，请根据建议进行修改，以确保投标成功。'
                ) : (
                  '您的投标文件存在错误项，请务必根据建议进行修改，否则可能导致废标！'
                )}
              </p>
              <h4 style={{ marginTop: 16 }}>修改建议</h4>
              <ul style={{ marginTop: 8 }}>
                <li>请仔细检查所有警告和错误项，根据建议进行修改</li>
                <li>修改后建议重新进行体检</li>
                <li>确保所有废标条款均已满足</li>
                <li>检查是否存在其他可能导致废标的问题</li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BidCheckup;