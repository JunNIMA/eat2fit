import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  message, 
  Popconfirm,
  Tag,
  Upload,
  Row,
  Col,
  Image,
  Avatar
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UploadOutlined,
  LoadingOutlined,
  AppleOutlined
} from '@ant-design/icons';
import { getFoods, getFoodDetail, Food, FoodQueryParams } from '@/api/diet';
import { createCancelToken } from '@/utils/request';
import axios, { CancelTokenSource } from 'axios';
import { useAppSelector } from '@/store/hooks';
import { getToken } from '@/utils/auth';

const { Option } = Select;
const { TextArea } = Input;

// 扩展API接口定义，添加食物管理所需接口
const addFood = (food: Omit<Food, 'id'>): Promise<any> => {
  return axios.post('/api/diet/foods', food, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });
};

const updateFood = (food: Partial<Food> & { id: number }): Promise<any> => {
  return axios.put('/api/diet/foods', food, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });
};

const deleteFood = (id: number): Promise<any> => {
  return axios.delete(`/api/diet/foods/${id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });
};

const uploadFoodImage = (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  
  return axios.post('/api/diet/foods/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${getToken()}`
    }
  });
};

const FoodManagement: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [foods, setFoods] = useState<Food[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentFood, setCurrentFood] = useState<Partial<Food>>({});
  const [form] = Form.useForm();
  const [categories, setCategories] = useState<string[]>([]);

  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);

  // 用于取消API请求的令牌
  const foodsTokenRef = useRef<CancelTokenSource | null>(null);
  const actionTokenRef = useRef<CancelTokenSource | null>(null);

  // 检查当前用户是否有管理权限
  const isAdmin = user?.role === 1;

  // 加载食物列表
  const fetchFoods = useCallback(async () => {
    // 取消先前的请求
    if (foodsTokenRef.current) {
      foodsTokenRef.current.cancel('新请求发起，取消旧请求');
    }
    
    // 创建新的取消令牌
    foodsTokenRef.current = createCancelToken();
    
    setLoading(true);
    try {
      const params: FoodQueryParams = {
        current,
        size: pageSize
      };
      
      const response = await getFoods(params, foodsTokenRef.current);
      if (response.success || response.code === 200) {
        setFoods(response.data.records);
        setTotal(response.data.total);
        
        console.log('食物管理分页数据:', {
          current,
          pageSize,
          total: response.data.total,
          hasMore: current * pageSize < response.data.total
        });
        
        // 提取所有分类，去重
        const allCategories = Array.from(new Set(response.data.records.map(food => food.category)));
        setCategories(allCategories);
      } else {
        message.error(response.message || '获取食物列表失败');
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log('获取食物列表请求已取消:', error.message);
      } else {
        message.error('网络错误，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  }, [current, pageSize]);

  useEffect(() => {
    fetchFoods();
    
    // 组件卸载时取消所有请求
    return () => {
      if (foodsTokenRef.current) {
        foodsTokenRef.current.cancel('组件卸载，取消请求');
      }
      if (actionTokenRef.current) {
        actionTokenRef.current.cancel('组件卸载，取消请求');
      }
    };
  }, [fetchFoods]);

  const handleAdd = () => {
    setCurrentFood({});
    form.resetFields();
    setImageUrl('');
    setModalVisible(true);
  };

  const handleEdit = (record: Food) => {
    setCurrentFood(record);
    form.setFieldsValue({
      ...record
    });
    setImageUrl(record.imageUrl || '');
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await deleteFood(id);
      if (response.data.success) {
        message.success('删除食物成功');
        fetchFoods();
      } else {
        message.error(response.data.message || '删除失败');
      }
    } catch (error: any) {
      message.error('删除失败，请稍后重试');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      let response;
      if (currentFood.id) {
        // 更新食物
        const updateData = {
          ...values,
          id: currentFood.id
        };
        response = await updateFood(updateData);
      } else {
        // 添加食物
        response = await addFood(values);
      }
      
      if (response.data.success) {
        message.success(currentFood.id ? '更新食物成功' : '添加食物成功');
        handleCloseModal();
        fetchFoods();
      } else {
        message.error(response.data.message || '操作失败');
      }
    } catch (error: any) {
      message.error('表单验证失败，请检查输入');
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    form.resetFields();
    setImageUrl('');
  };

  const handleImageUpload = async (info: any) => {
    if (info.file.status === 'uploading') {
      setUploadLoading(true);
      return;
    }
    
    if (info.file.status === 'done') {
      setUploadLoading(false);
      // 获取上传后的URL
      const imageUrl = info.file.response.data;
      // 设置表单值
      form.setFieldsValue({ imageUrl });
      setImageUrl(imageUrl);
      message.success('图片上传成功');
    } else if (info.file.status === 'error') {
      setUploadLoading(false);
      message.error('图片上传失败');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70
    },
    {
      title: '图片',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 80,
      render: (imageUrl: string) => (
        <Avatar 
          src={imageUrl} 
          icon={!imageUrl && <AppleOutlined />} 
          style={{ backgroundColor: !imageUrl ? '#52c41a' : undefined }}
          size={40}
        />
      )
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => (
        <Tag color="green">{category}</Tag>
      )
    },
    {
      title: '卡路里',
      dataIndex: 'calories',
      key: 'calories',
      width: 100,
      render: (calories: number) => (
        <span>{calories} 千卡</span>
      )
    },
    {
      title: '蛋白质',
      dataIndex: 'protein',
      key: 'protein',
      width: 80,
      render: (protein: number) => (
        <span>{protein} 克</span>
      )
    },
    {
      title: '脂肪',
      dataIndex: 'fat',
      key: 'fat',
      width: 80,
      render: (fat: number) => (
        <span>{fat} 克</span>
      )
    },
    {
      title: '碳水',
      dataIndex: 'carbs',
      key: 'carbs',
      width: 80,
      render: (carbs: number) => (
        <span>{carbs} 克</span>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: Food) => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  if (!isAdmin) {
    return (
      <Card title="食物管理">
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <p>您没有权限访问此页面</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="food-management">
      <Card 
        title="食物管理" 
        bordered={false}
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            添加食物
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={foods}
          rowKey="id"
          loading={loading}
          pagination={{
            current,
            pageSize,
            total,
            onChange: (page) => {
              console.log('切换到页码:', page);
              setCurrent(page);
            },
            onShowSizeChange: (current, size) => {
              console.log('修改每页条数:', size);
              setPageSize(size);
              setCurrent(1); // 切换每页数量时，重置到第一页
            },
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      <Modal
        title={currentFood.id ? '编辑食物' : '添加食物'}
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Row gutter={16}>
            <Col span={16}>
              <Form.Item
                name="name"
                label="食物名称"
                rules={[{ required: true, message: '请输入食物名称' }]}
              >
                <Input placeholder="请输入食物名称" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="category"
                label="食物分类"
                rules={[{ required: true, message: '请选择或输入分类' }]}
              >
                <Select
                  placeholder="请选择分类"
                  showSearch
                  allowClear
                  mode="tags"
                >
                  {categories.map(category => (
                    <Option key={category} value={category}>{category}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="imageUrl"
                label="食物图片"
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {imageUrl && (
                    <div style={{ marginBottom: 16 }}>
                      <Image 
                        src={imageUrl} 
                        width={150}
                        style={{ borderRadius: '4px' }}
                        preview={{ 
                          mask: '点击预览'
                        }}
                      />
                    </div>
                  )}
                  <Upload
                    name="file"
                    action="/api/diet/foods/upload/image"
                    headers={{
                      Authorization: `Bearer ${getToken()}`
                    }}
                    showUploadList={false}
                    onChange={handleImageUpload}
                  >
                    <Button icon={uploadLoading ? <LoadingOutlined /> : <UploadOutlined />}>
                      {uploadLoading ? '上传中...' : (imageUrl ? '更换图片' : '上传图片')}
                    </Button>
                  </Upload>
                  <Input 
                    value={imageUrl}
                    placeholder="图片URL" 
                    style={{ marginTop: 8, display: 'none' }} 
                  />
                </div>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unit"
                label="计量单位"
                initialValue="克"
                rules={[{ required: true, message: '请输入计量单位' }]}
              >
                <Input placeholder="请输入计量单位，如：克、毫升等" />
              </Form.Item>
              
              <Form.Item
                name="calories"
                label="卡路里(每100克)"
                rules={[{ required: true, message: '请输入卡路里' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="请输入卡路里值" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="protein"
                label="蛋白质(克)"
                rules={[{ required: true, message: '请输入蛋白质含量' }]}
              >
                <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="蛋白质" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="fat"
                label="脂肪(克)"
                rules={[{ required: true, message: '请输入脂肪含量' }]}
              >
                <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="脂肪" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="carbs"
                label="碳水化合物(克)"
                rules={[{ required: true, message: '请输入碳水化合物含量' }]}
              >
                <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="碳水化合物" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="fiber"
                label="纤维素(克)"
              >
                <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="纤维素" />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Button style={{ marginRight: 8 }} onClick={handleCloseModal}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" style={{ background: '#52c41a', borderColor: '#52c41a' }}>
              保存
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default FoodManagement; 