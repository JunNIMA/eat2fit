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
  Divider,
  Tabs
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UploadOutlined,
  LoadingOutlined,
  TagsOutlined
} from '@ant-design/icons';
import { useAppSelector } from '@/store/hooks';
import { createCancelToken } from '@/utils/request';
import { getToken } from '@/utils/auth';
import axios, { CancelTokenSource } from 'axios';
import { Recipe } from '@/api/diet';
import RecipeIngredientEditor from './RecipeIngredientEditor';
import RecipeStepsEditor from './RecipeStepsEditor';

const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

// 查询食谱列表
const getRecipes = (params: any, cancelToken?: CancelTokenSource): Promise<any> => {
  return axios.get('/api/diet/recipes/page', { 
    params,
    headers: { Authorization: `Bearer ${getToken()}` },
    cancelToken: cancelToken?.token
  });
};

// 添加食谱
const addRecipe = (recipe: any): Promise<any> => {
  return axios.post('/api/diet/recipes', recipe, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
};

// 更新食谱
const updateRecipe = (recipe: any): Promise<any> => {
  return axios.put('/api/diet/recipes', recipe, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
};

// 删除食谱
const deleteRecipe = (id: number): Promise<any> => {
  return axios.delete(`/api/diet/recipes/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
};

// 上传封面图片
const uploadCoverImage = (file: File): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  
  return axios.post('/api/diet/recipes/upload/cover', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${getToken()}`
    }
  });
};

const RecipeManagement: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentRecipe, setCurrentRecipe] = useState<Partial<Recipe>>({});
  const [form] = Form.useForm();
  
  const [coverImgUrl, setCoverImgUrl] = useState<string>('');
  const [coverUploadLoading, setCoverUploadLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('basic');

  // 用于取消API请求的令牌
  const recipesTokenRef = useRef<CancelTokenSource | null>(null);
  const actionTokenRef = useRef<CancelTokenSource | null>(null);

  // 检查当前用户是否有管理权限
  const isAdmin = user?.role === 1;

  // 加载食谱列表
  const fetchRecipes = useCallback(async () => {
    // 取消先前的请求
    if (recipesTokenRef.current) {
      recipesTokenRef.current.cancel('新请求发起，取消旧请求');
    }
    
    // 创建新的取消令牌
    recipesTokenRef.current = createCancelToken();
    
    setLoading(true);
    try {
      const params = {
        current,
        size: pageSize
      };
      
      const response = await getRecipes(params, recipesTokenRef.current);
      if (response.data.success) {
        setRecipes(response.data.data.records);
        setTotal(response.data.data.total);
      } else {
        message.error(response.data.message || '获取食谱列表失败');
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log('获取食谱列表请求已取消:', error.message);
      } else {
        message.error('网络错误，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  }, [current, pageSize]);

  useEffect(() => {
    fetchRecipes();
    
    // 组件卸载时取消所有请求
    return () => {
      if (recipesTokenRef.current) {
        recipesTokenRef.current.cancel('组件卸载，取消请求');
      }
      if (actionTokenRef.current) {
        actionTokenRef.current.cancel('组件卸载，取消请求');
      }
    };
  }, [fetchRecipes]);

  const handleAdd = () => {
    setCurrentRecipe({});
    form.resetFields();
    setCoverImgUrl('');
    setModalVisible(true);
    setActiveTab('basic');
  };

  const handleEdit = (record: Recipe) => {
    setCurrentRecipe(record);
    form.setFieldsValue({
      ...record,
      tags: record.tags ? record.tags.split(',') : []
    });
    setCoverImgUrl(record.coverImg || '');
    setModalVisible(true);
    setActiveTab('basic');
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await deleteRecipe(id);
      if (response.data.success) {
        message.success('删除食谱成功');
        fetchRecipes();
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
      
      // 处理标签，将数组转为逗号分隔的字符串
      if (values.tags && Array.isArray(values.tags)) {
        values.tags = values.tags.join(',');
      }
      
      let response;
      if (currentRecipe.id) {
        // 更新食谱
        const updateData = {
          ...values,
          id: currentRecipe.id
        };
        response = await updateRecipe(updateData);
      } else {
        // 添加食谱
        response = await addRecipe(values);
      }
      
      if (response.data.success) {
        message.success(currentRecipe.id ? '更新食谱成功' : '添加食谱成功');
        handleCloseModal();
        fetchRecipes();
      } else {
        message.error(response.data.message || '操作失败');
      }
    } catch (error: any) {
      console.error('保存失败:', error);
      message.error('表单验证失败，请检查输入');
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    form.resetFields();
    setCoverImgUrl('');
  };

  const handleCoverUpload = (info: any) => {
    if (info.file.status === 'uploading') {
      setCoverUploadLoading(true);
      return;
    }
    
    if (info.file.status === 'done') {
      setCoverUploadLoading(false);
      // 获取上传后的URL
      const imgUrl = info.file.response.data;
      // 设置表单值
      form.setFieldsValue({ coverImg: imgUrl });
      setCoverImgUrl(imgUrl);
      message.success('封面图片上传成功');
    } else if (info.file.status === 'error') {
      setCoverUploadLoading(false);
      message.error('封面图片上传失败');
    }
  };

  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1: return '简单';
      case 2: return '中等';
      case 3: return '复杂';
      default: return '未知';
    }
  };

  const getFitnessGoalText = (goal: number) => {
    switch (goal) {
      case 1: return '增肌';
      case 2: return '减脂';
      case 3: return '塑形';
      case 4: return '维持';
      default: return '未知';
    }
  };

  const getDifficultyColor = (difficulty: number): string => {
    switch (difficulty) {
      case 1: return 'cyan';
      case 2: return 'gold';
      case 3: return 'magenta';
      default: return 'default';
    }
  };

  const getGoalColor = (goal: number): string => {
    switch (goal) {
      case 1: return 'green';
      case 2: return 'blue';
      case 3: return 'purple';
      case 4: return 'orange';
      default: return 'default';
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
      title: '封面',
      dataIndex: 'coverImg',
      key: 'coverImg',
      width: 100,
      render: (coverImg: string) => (
        coverImg ? (
          <Image 
            src={coverImg} 
            width={80} 
            height={45} 
            style={{ objectFit: 'cover', borderRadius: '4px' }} 
            preview={{ 
              src: coverImg,
              mask: '预览'
            }}
          />
        ) : '无封面'
      )
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 80,
      render: (difficulty: number) => (
        <Tag color={getDifficultyColor(difficulty)}>
          {getDifficultyText(difficulty)}
        </Tag>
      )
    },
    {
      title: '健身目标',
      dataIndex: 'fitnessGoal',
      key: 'fitnessGoal',
      width: 80,
      render: (goal: number) => (
        <Tag color={getGoalColor(goal)}>
          {getFitnessGoalText(goal)}
        </Tag>
      )
    },
    {
      title: '卡路里',
      dataIndex: 'calories',
      key: 'calories',
      width: 80,
      render: (calories: number) => (
        <span>{calories} 千卡</span>
      )
    },
    {
      title: '餐食类型',
      dataIndex: 'mealType',
      key: 'mealType',
      width: 80
    },
    {
      title: '浏览/点赞',
      key: 'stats',
      width: 100,
      render: (_: unknown, record: Recipe) => (
        <span>{record.viewCount}/{record.likeCount}</span>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: Recipe) => (
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
      <Card title="食谱管理">
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <p>您没有权限访问此页面</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="recipe-management">
      <Card 
        title="食谱管理" 
        bordered={false}
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            添加食谱
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={recipes}
          rowKey="id"
          loading={loading}
          pagination={{
            current,
            pageSize,
            total,
            onChange: (page) => setCurrent(page),
            onShowSizeChange: (current, size) => setPageSize(size),
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      <Modal
        title={currentRecipe.id ? '编辑食谱' : '添加食谱'}
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="基本信息" key="basic">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="title"
                    label="食谱标题"
                    rules={[{ required: true, message: '请输入食谱标题' }]}
                  >
                    <Input placeholder="请输入食谱标题" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="coverImg"
                    label="封面图片"
                    rules={[{ required: true, message: '请上传封面图片' }]}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {coverImgUrl && (
                        <div style={{ marginBottom: 16 }}>
                          <Image 
                            src={coverImgUrl} 
                            width={200}
                            style={{ borderRadius: '4px' }}
                            preview={{ 
                              mask: '点击预览'
                            }}
                          />
                        </div>
                      )}
                      <Upload
                        name="file"
                        action="/api/diet/recipes/upload/cover"
                        headers={{
                          Authorization: `Bearer ${getToken()}`
                        }}
                        showUploadList={false}
                        onChange={handleCoverUpload}
                      >
                        <Button icon={coverUploadLoading ? <LoadingOutlined /> : <UploadOutlined />}>
                          {coverUploadLoading ? '上传中...' : (coverImgUrl ? '更换封面图片' : '上传封面图片')}
                        </Button>
                      </Upload>
                      <Input 
                        value={coverImgUrl}
                        placeholder="图片URL" 
                        style={{ marginTop: 8, display: 'none' }} 
                      />
                    </div>
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="description"
                label="食谱描述"
                rules={[{ required: true, message: '请输入食谱描述' }]}
              >
                <TextArea rows={4} placeholder="请输入食谱描述" />
              </Form.Item>
              
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="difficulty"
                    label="难度等级"
                    rules={[{ required: true, message: '请选择难度等级' }]}
                  >
                    <Select placeholder="请选择难度等级">
                      <Option value={1}>简单</Option>
                      <Option value={2}>中等</Option>
                      <Option value={3}>复杂</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="fitnessGoal"
                    label="健身目标"
                    rules={[{ required: true, message: '请选择健身目标' }]}
                  >
                    <Select placeholder="请选择健身目标">
                      <Option value={1}>增肌</Option>
                      <Option value={2}>减脂</Option>
                      <Option value={3}>塑形</Option>
                      <Option value={4}>维持</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="mealType"
                    label="餐食类型"
                    rules={[{ required: true, message: '请选择餐食类型' }]}
                  >
                    <Select placeholder="请选择餐食类型">
                      <Option value="早餐">早餐</Option>
                      <Option value="午餐">午餐</Option>
                      <Option value="晚餐">晚餐</Option>
                      <Option value="加餐">加餐</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    name="prepTime"
                    label="准备时间(分钟)"
                    rules={[{ required: true, message: '请输入准备时间' }]}
                  >
                    <InputNumber min={1} style={{ width: '100%' }} placeholder="准备时间" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="cookTime"
                    label="烹饪时间(分钟)"
                    rules={[{ required: true, message: '请输入烹饪时间' }]}
                  >
                    <InputNumber min={1} style={{ width: '100%' }} placeholder="烹饪时间" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="servings"
                    label="份量(人份)"
                    rules={[{ required: true, message: '请输入份量' }]}
                  >
                    <InputNumber min={1} style={{ width: '100%' }} placeholder="份量" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="calories"
                    label="卡路里"
                    rules={[{ required: true, message: '请输入卡路里' }]}
                  >
                    <InputNumber min={1} style={{ width: '100%' }} placeholder="卡路里" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    name="protein"
                    label="蛋白质(克)"
                    rules={[{ required: true, message: '请输入蛋白质含量' }]}
                  >
                    <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="蛋白质" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="fat"
                    label="脂肪(克)"
                    rules={[{ required: true, message: '请输入脂肪含量' }]}
                  >
                    <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="脂肪" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    name="carbs"
                    label="碳水化合物(克)"
                    rules={[{ required: true, message: '请输入碳水化合物含量' }]}
                  >
                    <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="碳水化合物" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item
                name="tags"
                label="标签"
              >
                <Select
                  mode="tags"
                  placeholder="请输入标签，按回车确认"
                  tokenSeparators={[',']}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              
              <Form.Item
                name="authorName"
                label="作者"
              >
                <Input placeholder="请输入作者名称" />
              </Form.Item>
              
              <Divider />
              
              <div style={{ marginTop: 24, textAlign: 'right' }}>
                <Button style={{ marginRight: 8 }} onClick={handleCloseModal}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit" style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                  保存
                </Button>
              </div>
            </Form>
          </TabPane>
          <TabPane tab="食材列表" key="ingredients" disabled={!currentRecipe.id}>
            <div style={{ padding: '20px 0' }}>
              {currentRecipe.id ? (
                <RecipeIngredientEditor recipeId={currentRecipe.id} />
              ) : (
                <p>请先保存基本信息，然后才能编辑食材列表</p>
              )}
            </div>
          </TabPane>
          <TabPane tab="烹饪步骤" key="steps" disabled={!currentRecipe.id}>
            <div style={{ padding: '20px 0' }}>
              {currentRecipe.id ? (
                <RecipeStepsEditor recipeId={currentRecipe.id} />
              ) : (
                <p>请先保存基本信息，然后才能编辑烹饪步骤</p>
              )}
            </div>
          </TabPane>
        </Tabs>
      </Modal>
    </div>
  );
};

export default RecipeManagement; 