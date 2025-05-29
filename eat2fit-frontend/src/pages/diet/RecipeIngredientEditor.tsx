import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Input, InputNumber, Select, Popconfirm, message, Space, Spin } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import { getToken } from '@/utils/auth';
import { RecipeIngredient, Food } from '@/api/diet';

interface RecipeIngredientEditorProps {
  recipeId: number;
}

const { Option } = Select;

const RecipeIngredientEditor: React.FC<RecipeIngredientEditorProps> = ({ recipeId }) => {
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [foods, setFoods] = useState<Food[]>([]);
  const [foodsLoading, setFoodsLoading] = useState(false);
  const [foodPagination, setFoodPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
    hasMore: true
  });
  const [foodKeyword, setFoodKeyword] = useState('');
  
  // 获取食谱食材
  const fetchIngredients = async () => {
    if (!recipeId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/diet/recipes/${recipeId}/ingredients`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      if (response.data.success) {
        setIngredients(response.data.data || []);
      } else {
        message.error(response.data.message || '获取食材列表失败');
      }
    } catch (error) {
      console.error('获取食材列表失败:', error);
      message.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 获取食物列表
  const fetchFoods = async (page = 1, keyword = '') => {
    if (page === 1) {
      setFoodsLoading(true);
    }
    
    try {
      const response = await axios.get('/api/diet/foods/page', {
        params: {
          current: page,
          size: foodPagination.pageSize,
          keyword
        },
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      
      if (response.data.success) {
        const { records, total } = response.data.data;
        
        if (page === 1) {
          setFoods(records || []);
        } else {
          setFoods(prevFoods => [...prevFoods, ...(records || [])]);
        }
        
        setFoodPagination({
          current: page,
          pageSize: foodPagination.pageSize,
          total,
          hasMore: (page * foodPagination.pageSize) < total
        });
      } else {
        message.error(response.data.message || '获取食物列表失败');
      }
    } catch (error) {
      console.error('获取食物列表失败:', error);
      message.error('网络错误，请稍后重试');
    } finally {
      setFoodsLoading(false);
    }
  };
  
  // 初始加载
  useEffect(() => {
    fetchIngredients();
    fetchFoods(1);
  }, [recipeId]);
  
  // 处理食物搜索
  const handleFoodSearch = (value: string) => {
    setFoodKeyword(value);
    if (value !== foodKeyword) {
      fetchFoods(1, value);
    }
  };
  
  // 加载更多食物
  const handleLoadMoreFoods = () => {
    if (foodPagination.hasMore && !foodsLoading) {
      fetchFoods(foodPagination.current + 1, foodKeyword);
    }
  };
  
  // 添加食材
  const handleAddIngredient = () => {
    const newIngredient: RecipeIngredient = {
      recipeId,
      name: '',
      amount: 0,
      unit: '克'
    };
    setIngredients([...ingredients, newIngredient]);
  };
  
  // 删除食材
  const handleDeleteIngredient = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };
  
  // 更新食材字段
  const handleIngredientChange = (index: number, field: keyof RecipeIngredient, value: any) => {
    const newIngredients = [...ingredients];
    
    if (field === 'foodId' && value) {
      // 如果选择了食物，自动填充食物名称
      const selectedFood = foods.find(food => food.id === value);
      if (selectedFood) {
        newIngredients[index] = {
          ...newIngredients[index],
          [field]: value,
          name: selectedFood.name,
          unit: selectedFood.unit || '克'
        };
      }
    } else {
      newIngredients[index] = { ...newIngredients[index], [field]: value };
    }
    
    setIngredients(newIngredients);
  };
  
  // 保存食材列表
  const handleSave = async () => {
    // 验证所有食材是否都填写了必要信息
    const isValid = ingredients.every(item => item.name && item.amount > 0 && item.unit);
    
    if (!isValid) {
      message.error('请确保所有食材都填写了名称、数量和单位');
      return;
    }
    
    setSaving(true);
    try {
      // 确保字段类型正确
      const formattedIngredients = ingredients.map(item => ({
        ...item,
        foodId: item.foodId || null,
        amount: Number(item.amount)
      }));
      
      // 使用axios直接发送请求
      const response = await axios.post(`/api/diet/recipes/${recipeId}/ingredients`, formattedIngredients, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      if (response.data.success) {
        message.success('保存食材列表成功');
        fetchIngredients(); // 重新加载最新数据
      } else {
        message.error(response.data.message || '保存食材列表失败');
      }
    } catch (error) {
      console.error('保存食材列表失败:', error);
      message.error('网络错误，请稍后重试');
    } finally {
      setSaving(false);
    }
  };
  
  // 自定义下拉菜单的滚动加载
  const dropdownRender = (menu: React.ReactElement) => (
    <div>
      {menu}
      {foodPagination.hasMore && (
        <div 
          style={{ 
            textAlign: 'center', 
            padding: '8px', 
            cursor: 'pointer',
            borderTop: '1px solid #e8e8e8'
          }}
          onClick={handleLoadMoreFoods}
        >
          {foodsLoading ? <Spin size="small" /> : '加载更多'}
        </div>
      )}
    </div>
  );
  
  // 处理滚动到底部加载更多
  const handlePopupScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { target } = e;
    if (target) {
      const div = target as HTMLDivElement;
      if (div.scrollHeight - div.scrollTop - div.clientHeight < 50) { // 滚动到距离底部50px以内时加载更多
        if (foodPagination.hasMore && !foodsLoading) {
          handleLoadMoreFoods();
        }
      }
    }
  };
  
  // 表格列定义
  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1
    },
    {
      title: '食物',
      dataIndex: 'foodId',
      key: 'foodId',
      width: 200,
      render: (foodId: number, _: any, index: number) => (
        <Select
          placeholder="选择食物(可选)"
          value={foodId}
          onChange={(value) => handleIngredientChange(index, 'foodId', value)}
          style={{ width: '100%' }}
          loading={foodsLoading}
          allowClear
          showSearch
          optionFilterProp="children"
          onSearch={handleFoodSearch}
          filterOption={false}
          dropdownRender={dropdownRender}
          onPopupScroll={handlePopupScroll}
          listHeight={250}
        >
          {foods.map(food => (
            <Option key={food.id} value={food.id}>{food.name}</Option>
          ))}
        </Select>
      )
    },
    {
      title: '食材名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string, _: any, index: number) => (
        <Input 
          placeholder="输入食材名称" 
          value={name} 
          onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
        />
      )
    },
    {
      title: '数量',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number, _: any, index: number) => (
        <InputNumber
          min={0}
          precision={2}
          placeholder="数量"
          value={amount}
          onChange={(value) => handleIngredientChange(index, 'amount', value)}
          style={{ width: '100%' }}
        />
      )
    },
    {
      title: '单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 120,
      render: (unit: string, _: any, index: number) => (
        <Input
          placeholder="单位"
          value={unit}
          onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
        />
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Popconfirm
          title="确定要删除此食材吗?"
          onConfirm={() => handleDeleteIngredient(index)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      )
    }
  ];
  
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddIngredient}
          >
            添加食材
          </Button>
          <Button 
            type="primary" 
            onClick={handleSave} 
            loading={saving}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            保存食材列表
          </Button>
        </Space>
      </div>
      
      <Table
        rowKey={(record, index) => index?.toString() || '0'}
        columns={columns}
        dataSource={ingredients}
        pagination={false}
        loading={loading}
        size="middle"
        scroll={{ x: 800 }}
      />
    </div>
  );
};

export default RecipeIngredientEditor; 