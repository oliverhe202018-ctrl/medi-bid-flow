import React, { useState } from 'react';
import { Table, Button, Select, Tag, Card, message, Modal, Form, Input, InputNumber } from 'antd';
import { DownloadOutlined, ReloadOutlined, EditOutlined } from '@ant-design/icons';

const { Option } = Select;

const DeviationTable = () => {
  const [selectedProject, setSelectedProject] = useState('1');
  const [selectedProduct, setSelectedProduct] = useState('CT-Scan-X1');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [form] = Form.useForm();

  // 模拟偏离表数据
  const [deviationTable, setDeviationTable] = useState([
    {
      id: '1',
      paramName: '扫描速度',
      tenderValue: '≥100mm/s',
      ourValue: '120mm/s',
      deviation: '正偏离',
      remark: '',
    },
    {
      id: '2',
      paramName: '探测器排数',
      tenderValue: '≥64排',
      ourValue: '128排',
      deviation: '无偏离',
      remark: '',
    },
    {
      id: '3',
      paramName: '空间分辨率',
      tenderValue: '≤0.3mm',
      ourValue: '0.25mm',
      deviation: '正偏离',
      remark: '',
    },
    {
      id: '4',
      paramName: '磁场强度',
      tenderValue: '≥1.5T',
      ourValue: '1.5T',
      deviation: '无偏离',
      remark: '',
    },
    {
      id: '5',
      paramName: '设备重量',
      tenderValue: '≤500kg',
      ourValue: '550kg',
      deviation: '负偏离',
      remark: '需提前确认安装场地承重',
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
      title: '我方值',
      dataIndex: 'ourValue',
      key: 'ourValue',
    },
    {
      title: '偏离情况',
      dataIndex: 'deviation',
      key: 'deviation',
      render: (deviation) => {
        let color = 'blue';
        if (deviation === '正偏离') {
          color = 'green';
        } else if (deviation === '负偏离') {
          color = 'red';
        }
        return <Tag color={color}>{deviation}</Tag>;
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
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

  // 计算偏离统计
  const calculateDeviationSummary = () => {
    const summary = {
      positive: 0,
      negative: 0,
      no_deviation: 0,
      total: deviationTable.length,
    };

    deviationTable.forEach(item => {
      if (item.deviation === '正偏离') {
        summary.positive++;
      } else if (item.deviation === '负偏离') {
        summary.negative++;
      } else {
        summary.no_deviation++;
      }
    });

    return summary;
  };

  // 生成偏离表
  const handleGenerateTable = () => {
    // 这里将实现调用后端API生成偏离表的逻辑
    message.success('技术规格偏离表生成成功');
    console.log('生成偏离表，项目：', selectedProject, '产品：', selectedProduct);
  };

  // 下载偏离表
  const handleDownload = () => {
    // 这里将实现下载偏离表的逻辑
    message.success('技术规格偏离表下载成功');
    console.log('下载偏离表');
  };

  // 编辑偏离表项
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
        const updatedTable = deviationTable.map(item => 
          item.id === currentItem.id ? { ...item, ...values } : item
        );
        setDeviationTable(updatedTable);
        message.success('偏离表项编辑成功');
        setIsEditModalVisible(false);
        setCurrentItem(null);
        form.resetFields();
      })
      .catch(errorInfo => {
        console.log('表单验证失败:', errorInfo);
      });
  };

  const deviationSummary = calculateDeviationSummary();

  return (
    <div>
      <h2>技术规格偏离表生成</h2>
      
      <Card title="生成设置" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label>选择项目：</label>
            <Select 
              value={selectedProject} 
              onChange={setSelectedProject} 
              style={{ width: 200 }}
            >
              <Option value="1">XX医院CT设备采购项目</Option>
              <Option value="2">YY医院MRI设备采购项目</Option>
              <Option value="3">ZZ医院超声设备采购项目</Option>
            </Select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label>选择产品：</label>
            <Select 
              value={selectedProduct} 
              onChange={setSelectedProduct} 
              style={{ width: 200 }}
            >
              <Option value="CT-Scan-X1">CT-Scan-X1</Option>
              <Option value="MRI-Scan-Y2">MRI-Scan-Y2</Option>
              <Option value="US-Scan-Z3">US-Scan-Z3</Option>
            </Select>
          </div>
          
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={handleGenerateTable}
          >
            重新生成
          </Button>
          
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={handleDownload}
          >
            下载Excel
          </Button>
        </div>
      </Card>
      
      <Card title="技术规格偏离表">
        <Table 
          columns={columns} 
          dataSource={deviationTable} 
          rowKey="id" 
          pagination={false}
        />
        
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Tag color="green">正偏离：{deviationSummary.positive}项</Tag>
            <Tag color="blue">无偏离：{deviationSummary.no_deviation}项</Tag>
            <Tag color="red">负偏离：{deviationSummary.negative}项</Tag>
          </div>
          <div>
            <strong>总计：{deviationSummary.total}项参数，其中负偏离{deviationSummary.negative}项，需重点关注</strong>
          </div>
        </div>
      </Card>

      {/* 编辑偏离表项模态框 */}
      <Modal
        title="编辑偏离表项"
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
            <Input placeholder="请输入招标要求，如：≥100mm/s" />
          </Form.Item>
          
          <Form.Item
            name="ourValue"
            label="我方值"
            rules={[{ required: true, message: '请输入我方值' }]}
          >
            <Input placeholder="请输入我方值" />
          </Form.Item>
          
          <Form.Item
            name="deviation"
            label="偏离情况"
            rules={[{ required: true, message: '请选择偏离情况' }]}
          >
            <Select placeholder="请选择偏离情况">
              <Option value="正偏离">正偏离</Option>
              <Option value="无偏离">无偏离</Option>
              <Option value="负偏离">负偏离</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="remark"
            label="备注"
          >
            <Input.TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DeviationTable;