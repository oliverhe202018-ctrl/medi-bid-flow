import React, { useState, useEffect, useCallback } from 'react';
import { Table, DatePicker, Select, Button, message, Typography } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AdminOperationLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // 从localStorage加载保存的筛选条件
  const loadFiltersFromStorage = () => {
    try {
      const savedFilters = localStorage.getItem('adminOperationLogFilters');
      if (savedFilters) {
        const parsed = JSON.parse(savedFilters);
        // 恢复日期对象
        if (parsed.dateRange) {
          parsed.dateRange = parsed.dateRange.map(date => date ? new Date(date) : null);
        }
        return parsed;
      }
    } catch (error) {
      console.error('加载筛选条件失败:', error);
    }
    return {
      dateRange: null,
      operationType: null,
      resourceType: null
    };
  };
  
  const [filters, setFilters] = useState(loadFiltersFromStorage);

  // 模拟操作类型
  const operationTypes = ['create', 'update', 'delete', 'login', 'generate', 'upload'];
  const resourceTypes = ['project', 'product_spec', 'knowledge', 'rfp', 'deviation_table', 'user', 'bid_template', 'bid_generation_task', 'generated_bid'];

  // 获取操作日志
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // 构建查询参数
      const params = new URLSearchParams();
      
      if (filters.operationType) {
        params.append('operation_type', filters.operationType);
      }
      
      if (filters.resourceType) {
        params.append('resource_type', filters.resourceType);
      }
      
      if (filters.dateRange) {
        const [startDate, endDate] = filters.dateRange;
        if (startDate) {
          params.append('start_date', startDate.toISOString());
        }
        if (endDate) {
          params.append('end_date', endDate.toISOString());
        }
      }
      
      const url = `http://localhost:8000/api/operation-logs/?${params.toString()}`;
      const response = await fetch(url, {
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
    } catch {
      message.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // 初始化加载日志
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // 刷新日志
  const handleRefresh = () => {
    fetchLogs();
  };

  // 搜索日志
  const handleSearch = () => {
    // 实际项目中应根据筛选条件调用API搜索日志
    message.info('搜索功能已触发');
    // 这里可以添加筛选逻辑
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
    user: '用户',
    bid_template: '标书模板',
    bid_generation_task: '标书生成任务',
    generated_bid: '生成的标书'
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
      key: 'content',
      ellipsis: true
    },
    {
      title: '操作人ID',
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
      <Title level={2}>操作日志</Title>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <RangePicker 
            placeholder={['开始时间', '结束时间']} 
            style={{ width: 300 }}
            onChange={(date) => {
              const newFilters = { ...filters, dateRange: date };
              setFilters(newFilters);
              localStorage.setItem('adminOperationLogFilters', JSON.stringify(newFilters));
            }}
          />
          <Select
            placeholder="操作类型"
            style={{ width: 120 }}
            onChange={(value) => {
              const newFilters = { ...filters, operationType: value };
              setFilters(newFilters);
              localStorage.setItem('adminOperationLogFilters', JSON.stringify(newFilters));
            }}
            value={filters.operationType}
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
            onChange={(value) => {
              const newFilters = { ...filters, resourceType: value };
              setFilters(newFilters);
              localStorage.setItem('adminOperationLogFilters', JSON.stringify(newFilters));
            }}
            value={filters.resourceType}
          >
            {resourceTypes.map(type => (
              <Option key={type} value={type}>
                {resourceTypeMap[type]}
              </Option>
            ))}
          </Select>
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>搜索</Button>
          <Button 
            onClick={() => {
              const resetFilters = { dateRange: null, operationType: null, resourceType: null };
              setFilters(resetFilters);
              localStorage.setItem('adminOperationLogFilters', JSON.stringify(resetFilters));
            }}
          >
            重置
          </Button>
        </div>
        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>刷新</Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={logs}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 15 }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default AdminOperationLogs;