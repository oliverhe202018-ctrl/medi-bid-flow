import React, { useState, useEffect } from 'react';
import { Table, DatePicker, Select, Button, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;

const OperationLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});

  // 模拟操作类型
  const operationTypes = ['create', 'update', 'delete', 'login', 'generate', 'upload'];
  const resourceTypes = ['project', 'product_spec', 'knowledge', 'rfp', 'deviation_table', 'user'];

  // 获取操作日志
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/operation-logs/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      } else {
        message.error('获取操作日志失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载日志
  useEffect(() => {
    fetchLogs();
  }, []);

  // 刷新日志
  const handleRefresh = () => {
    fetchLogs();
  };

  // 操作类型中文映射
  const operationTypeMap = {
    create: '创建',
    update: '更新',
    delete: '删除',
    login: '登录',
    generate: '生成',
    upload: '上传'
  };

  // 资源类型中文映射
  const resourceTypeMap = {
    project: '项目',
    product_spec: '产品参数',
    knowledge: '知识库',
    rfp: '招标文件',
    deviation_table: '偏离表',
    user: '用户'
  };

  const columns = [
    {
      title: '操作时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time) => new Date(time).toLocaleString(),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      width: 200
    },
    {
      title: '操作类型',
      dataIndex: 'operation_type',
      key: 'operation_type',
      render: (type) => operationTypeMap[type] || type,
      filters: operationTypes.map(type => ({ text: operationTypeMap[type], value: type })),
      onFilter: (value, record) => record.operation_type === value,
      width: 120
    },
    {
      title: '资源类型',
      dataIndex: 'resource_type',
      key: 'resource_type',
      render: (type) => resourceTypeMap[type] || type,
      filters: resourceTypes.map(type => ({ text: resourceTypeMap[type], value: type })),
      onFilter: (value, record) => record.resource_type === value,
      width: 120
    },
    {
      title: '资源ID',
      dataIndex: 'resource_id',
      key: 'resource_id',
      width: 150
    },
    {
      title: '操作内容',
      dataIndex: 'content',
      key: 'content'
    },
    {
      title: '操作人',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 120
    },
    {
      title: '公司ID',
      dataIndex: 'company_id',
      key: 'company_id',
      width: 120
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>操作日志</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <RangePicker placeholder={['开始时间', '结束时间']} style={{ width: 300 }} />
          <Select
            placeholder="操作类型"
            style={{ width: 120 }}
          >
            {operationTypes.map(type => (
              <Option key={type} value={type}>
                {operationTypeMap[type]}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="资源类型"
            style={{ width: 120 }}
          >
            {resourceTypes.map(type => (
              <Option key={type} value={type}>
                {resourceTypeMap[type]}
              </Option>
            ))}
          </Select>
          <Button type="primary" icon={<SearchOutlined />}>搜索</Button>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>刷新</Button>
        </div>
      </div>
      
      <Table
        columns={columns}
        dataSource={logs}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default OperationLogs;