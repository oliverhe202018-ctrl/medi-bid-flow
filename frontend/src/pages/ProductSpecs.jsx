import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Switch, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

const ProductSpecs = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [currentSpec, setCurrentSpec] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // 模拟产品参数数据
  const [productSpecs, setProductSpecs] = useState([
    {
      id: '1',
      category: '影像设备',
      subCategory: 'CT',
      productModel: 'CT-Scan-X1',
      paramName: '扫描速度',
      paramValue: '120mm/s',
      isCoreParam: true,
    },
    {
      id: '2',
      category: '影像设备',
      subCategory: 'CT',
      productModel: 'CT-Scan-X1',
      paramName: '探测器排数',
      paramValue: '128排',
      isCoreParam: true,
    },
    {
      id: '3',
      category: '影像设备',
      subCategory: 'CT',
      productModel: 'CT-Scan-X1',
      paramName: '空间分辨率',
      paramValue: '0.25mm',
      isCoreParam: false,
    },
    {
      id: '4',
      category: '影像设备',
      subCategory: 'MRI',
      productModel: 'MRI-Scan-Y2',
      paramName: '磁场强度',
      paramValue: '3.0T',
      isCoreParam: true,
    },
    {
      id: '5',
      category: '手术设备',
      subCategory: '腹腔镜',
      productModel: 'Laparo-Z3',
      paramName: '摄像头分辨率',
      paramValue: '4K',
      isCoreParam: true,
    },
    {
      id: '6',
      category: '药品',
      subCategory: '心内科',
      productModel: 'Cardio-Med',
      paramName: '规格',
      paramValue: '10mg/片',
      isCoreParam: true,
    },
    {
      id: '7',
      category: '检验科设备',
      subCategory: '生化分析仪',
      productModel: 'BioChem-A1',
      paramName: '测试速度',
      paramValue: '1000测试/小时',
      isCoreParam: true,
    },
    {
      id: '8',
      category: '试剂',
      subCategory: '免疫试剂',
      productModel: 'Immuno-Reagent',
      paramName: '有效期',
      paramValue: '18个月',
      isCoreParam: true,
    },
  ]);

  // 产品类别配置
  const productCategories = {
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
      title: '产品型号',
      dataIndex: 'productModel',
      key: 'productModel',
    },
    {
      title: '参数名称',
      dataIndex: 'paramName',
      key: 'paramName',
    },
    {
      title: '参数值',
      dataIndex: 'paramValue',
      key: 'paramValue',
    },
    {  
      title: '是否核心参数',
      dataIndex: 'isCoreParam',
      key: 'isCoreParam',
      render: (isCoreParam, record) => (
        <Switch 
          checked={isCoreParam} 
          onChange={(checked) => handleToggleCoreParam(record.id, checked)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <span>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个参数吗？"
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

  // 新建参数
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
        const newSpec = {
          id: String(productSpecs.length + 1),
          ...values,
        };
        setProductSpecs([...productSpecs, newSpec]);
        message.success('参数添加成功');
        setIsModalVisible(false);
        form.resetFields();
      })
      .catch(errorInfo => {
        console.log('表单验证失败:', errorInfo);
      });
  };

  // 编辑参数
  const handleEdit = (spec) => {
    setCurrentSpec(spec);
    editForm.setFieldsValue(spec);
    setIsEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setIsEditModalVisible(false);
    setCurrentSpec(null);
    editForm.resetFields();
  };

  const handleEditOk = () => {
    editForm.validateFields()
      .then(values => {
        const updatedSpecs = productSpecs.map(spec => 
          spec.id === currentSpec.id ? { ...spec, ...values } : spec
        );
        setProductSpecs(updatedSpecs);
        message.success('参数编辑成功');
        setIsEditModalVisible(false);
        setCurrentSpec(null);
        editForm.resetFields();
      })
      .catch(errorInfo => {
        console.log('表单验证失败:', errorInfo);
      });
  };

  // 删除参数
  const handleDelete = (id) => {
    const updatedSpecs = productSpecs.filter(spec => spec.id !== id);
    setProductSpecs(updatedSpecs);
    message.success('参数删除成功');
  };

  // 切换核心参数状态
  const handleToggleCoreParam = (id, checked) => {
    const updatedSpecs = productSpecs.map(spec => 
      spec.id === id ? { ...spec, isCoreParam: checked } : spec
    );
    setProductSpecs(updatedSpecs);
    message.success(`参数已${checked ? '标记为' : '取消标记为'}核心参数`);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>产品参数库</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
          添加参数
        </Button>
      </div>
      
      <Table columns={columns} dataSource={productSpecs} rowKey="id" />

      {/* 新建参数模态框 */}
      <Modal
        title="添加产品参数"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ isCoreParam: false, category: '影像设备', subCategory: 'CT' }}
        >
          <Form.Item
            name="category"
            label="产品类别"
            rules={[{ required: true, message: '请选择产品类别' }]}
          >
            <Select placeholder="请选择产品类别" onChange={(value) => {
              form.setFieldsValue({ subCategory: productCategories[value][0] });
            }}>
              {Object.keys(productCategories).map(category => (
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
              {(form.getFieldValue('category') && productCategories[form.getFieldValue('category')] || productCategories['影像设备']).map(subCategory => (
                <Option key={subCategory} value={subCategory}>{subCategory}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="productModel"
            label="产品型号"
            rules={[{ required: true, message: '请输入产品型号' }]}
          >
            <Select placeholder="请选择或输入产品型号" showSearch allowClear>
              <Option value="CT-Scan-X1">CT-Scan-X1</Option>
              <Option value="MRI-Scan-Y2">MRI-Scan-Y2</Option>
              <Option value="US-Scan-Z3">US-Scan-Z3</Option>
              <Option value="Laparo-Z3">Laparo-Z3</Option>
              <Option value="Cardio-Med">Cardio-Med</Option>
              <Option value="BioChem-A1">BioChem-A1</Option>
              <Option value="Immuno-Reagent">Immuno-Reagent</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="paramName"
            label="参数名称"
            rules={[{ required: true, message: '请输入参数名称' }]}
          >
            <Input placeholder="请输入参数名称" />
          </Form.Item>
          
          <Form.Item
            name="paramValue"
            label="参数值"
            rules={[{ required: true, message: '请输入参数值' }]}
          >
            <Input placeholder="请输入参数值" />
          </Form.Item>
          
          <Form.Item
            name="isCoreParam"
            label="是否核心参数"
            valuePropName="checked"
          >
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑参数模态框 */}
      <Modal
        title="编辑产品参数"
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
            name="category"
            label="产品类别"
            rules={[{ required: true, message: '请选择产品类别' }]}
          >
            <Select placeholder="请选择产品类别" onChange={(value) => {
              editForm.setFieldsValue({ subCategory: productCategories[value][0] });
            }}>
              {Object.keys(productCategories).map(category => (
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
              {(editForm.getFieldValue('category') && productCategories[editForm.getFieldValue('category')] || productCategories['影像设备']).map(subCategory => (
                <Option key={subCategory} value={subCategory}>{subCategory}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="productModel"
            label="产品型号"
            rules={[{ required: true, message: '请输入产品型号' }]}
          >
            <Select placeholder="请选择或输入产品型号" showSearch allowClear>
              <Option value="CT-Scan-X1">CT-Scan-X1</Option>
              <Option value="MRI-Scan-Y2">MRI-Scan-Y2</Option>
              <Option value="US-Scan-Z3">US-Scan-Z3</Option>
              <Option value="Laparo-Z3">Laparo-Z3</Option>
              <Option value="Cardio-Med">Cardio-Med</Option>
              <Option value="BioChem-A1">BioChem-A1</Option>
              <Option value="Immuno-Reagent">Immuno-Reagent</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="paramName"
            label="参数名称"
            rules={[{ required: true, message: '请输入参数名称' }]}
          >
            <Input placeholder="请输入参数名称" />
          </Form.Item>
          
          <Form.Item
            name="paramValue"
            label="参数值"
            rules={[{ required: true, message: '请输入参数值' }]}
          >
            <Input placeholder="请输入参数值" />
          </Form.Item>
          
          <Form.Item
            name="isCoreParam"
            label="是否核心参数"
            valuePropName="checked"
          >
            <Switch checkedChildren="是" unCheckedChildren="否" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductSpecs;