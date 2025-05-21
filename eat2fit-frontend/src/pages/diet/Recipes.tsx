import React, { useEffect, useState, useRef } from 'react';
import { Card, List, Tag, Button, Row, Col, Input, Select, Empty, Spin, message, Tabs } from 'antd';
import { SearchOutlined, AppleOutlined, FireOutlined, RightOutlined, HeartOutlined, HeartFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getRecipes, addRecipeFavorite, removeRecipeFavorite, checkRecipeFavorite, Recipe } from '@/api/diet';
import { createCancelToken } from '@/utils/request';
import axios, { CancelTokenSource } from 'axios';

const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;

const Recipes: React.FC = () => {
  const navigate = useNavigate();
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  
  const [activeTab, setActiveTab] = useState('all');
  const [difficulty, setDifficulty] = useState<number | undefined>(undefined);
  const [mealType, setMealType] = useState<number | undefined>(undefined);
  const [keyword, setKeyword] = useState('');
  const [current, setCurrent] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // 用于取消API请求的令牌
  const recipesTokenRef = useRef<CancelTokenSource | null>(null);
  const favoriteTokenRef = useRef<CancelTokenSource | null>(null);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    fetchData();
    
    // 组件卸载或依赖项变化时取消上一个未完成的请求
    return () => {
      if (recipesTokenRef.current) {
        recipesTokenRef.current.cancel('依赖项变化，取消上一个请求');
      }
    };
  }, [activeTab, difficulty, mealType, current]);
  
  // 对于关键词搜索，单独处理
  useEffect(() => {
    if (keyword !== '') {
      fetchData();
    }
  }, [keyword]);
  
  const fetchData = async () => {
    try {
      // 取消上一个未完成的请求
      if (recipesTokenRef.current) {
        recipesTokenRef.current.cancel('新请求发起，取消旧请求');
      }
      
      // 创建新的取消令牌
      recipesTokenRef.current = createCancelToken();
      
      setLoading(true);
      const params: any = {
        current,
        size: 8,
        keyword: keyword || undefined
      };
      
      if (activeTab !== 'all') {
        const goalMap: Record<string, number> = {
          '增肌': 1,
          '减脂': 2,
          '塑形': 3,
          '维持': 4
        };
        params.fitnessGoal = goalMap[activeTab];
      }
      
      if (difficulty !== undefined) {
        params.difficulty = difficulty;
      }
      
      if (mealType !== undefined) {
        params.mealType = mealType;
      }
      
      const res = await getRecipes(params, recipesTokenRef.current);
      if (res.code === 200) {
        setRecipes(res.data.records || []);
        setTotal(res.data.total || 0);
      } else {
        message.error(res.message || '获取食谱列表失败');
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('食谱列表请求已取消:', error.message);
      } else {
        console.error('获取食谱列表出错', error);
        message.error('获取食谱列表失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (value: string) => {
    setKeyword(value);
    setCurrent(1);
  };
  
  const handleRecipeDetail = (id: number) => {
    navigate(`/diet/recipes/${id}`);
  };
  
  const handleToggleFavorite = async (recipeId: number, isFavorite: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // 取消上一个未完成的收藏请求
      if (favoriteTokenRef.current) {
        favoriteTokenRef.current.cancel('新收藏请求发起，取消旧请求');
      }
      
      // 创建新的取消令牌
      favoriteTokenRef.current = createCancelToken();
      
      if (isFavorite) {
        await removeRecipeFavorite(recipeId, favoriteTokenRef.current);
        message.success('已取消收藏');
      } else {
        await addRecipeFavorite(recipeId, favoriteTokenRef.current);
        message.success('收藏成功');
      }

      // 单独检查收藏状态并更新特定食谱的收藏状态
      setTimeout(async () => {
        try {
          const checkToken = createCancelToken();
          const res = await checkRecipeFavorite(recipeId, checkToken);
          if (res.code === 200) {
            // 只更新变更的那一项，避免整页刷新
            setRecipes(prev => 
              prev.map(recipe => 
                recipe.id === recipeId ? { ...recipe, isFavorite: res.data } : recipe
              )
            );
          }
        } catch (error) {
          if (!axios.isCancel(error)) {
            console.error('检查收藏状态出错', error);
          }
        }
      }, 300);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('收藏请求已取消:', error.message);
      } else {
        console.error('收藏操作出错', error);
        message.error('操作失败，请稍后重试');
        
        // 刷新列表
        fetchData();
      }
    }
  };
  
  // 移动端食谱列表
  const renderMobileList = () => (
    <List
      dataSource={recipes}
      renderItem={recipe => (
        <List.Item 
          onClick={() => handleRecipeDetail(recipe.id)}
          style={{ padding: 0, marginBottom: 8 }}
        >
          <Card
            bodyStyle={{ padding: 12 }}
            style={{ width: '100%' }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                width: 80, 
                height: 80, 
                background: '#f0f2f5', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: 8,
                backgroundImage: recipe.coverImg ? `url(${recipe.coverImg})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                {!recipe.coverImg && <AppleOutlined style={{ fontSize: 24, color: '#52c41a' }} />}
              </div>
              <div style={{ flex: 1, marginLeft: 12 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                  {recipe.title}
                </div>
                <div style={{ display: 'flex', marginBottom: 4 }}>
                  <Tag color={getColorByGoal(recipe.fitnessGoal)} style={{ margin: 0, marginRight: 4 }}>
                    {recipe.fitnessGoalText}
                  </Tag>
                  <Tag color={getColorByDifficulty(recipe.difficulty)} style={{ margin: 0 }}>
                    {recipe.difficultyText}
                  </Tag>
                </div>
                <div style={{ color: '#999', fontSize: '0.8rem' }}>
                  {recipe.prepTime + recipe.cookTime}分钟 · {recipe.calories}千卡
                </div>
              </div>
              <div>
                {recipe.isFavorite ? (
                  <HeartFilled 
                    style={{ color: '#ff4d4f', fontSize: 20, marginRight: 8 }} 
                    onClick={(e) => handleToggleFavorite(recipe.id, true, e)}
                  />
                ) : (
                  <HeartOutlined 
                    style={{ color: '#d9d9d9', fontSize: 20, marginRight: 8 }} 
                    onClick={(e) => handleToggleFavorite(recipe.id, false, e)}
                  />
                )}
                <RightOutlined style={{ color: '#ccc' }} />
              </div>
            </div>
          </Card>
        </List.Item>
      )}
    />
  );
  
  // 桌面端食谱列表
  const renderDesktopList = () => (
    <List
      grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
      dataSource={recipes}
      renderItem={recipe => (
        <List.Item>
          <Card
            hoverable
            cover={
              <div 
                style={{ 
                  height: 160, 
                  background: '#f0f2f5', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundImage: recipe.coverImg ? `url(${recipe.coverImg})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}
                onClick={() => handleRecipeDetail(recipe.id)}
              >
                {!recipe.coverImg && <AppleOutlined style={{ fontSize: 40, color: '#52c41a' }} />}
                <div 
                  style={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8,
                    background: 'rgba(255,255,255,0.8)',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={(e) => handleToggleFavorite(recipe.id, recipe.isFavorite ?? false, e)}
                >
                  {recipe.isFavorite ? 
                    <HeartFilled style={{ color: '#ff4d4f', fontSize: 18 }} /> : 
                    <HeartOutlined style={{ color: '#999', fontSize: 18 }} />
                  }
                </div>
              </div>
            }
            onClick={() => handleRecipeDetail(recipe.id)}
          >
            <Card.Meta
              title={recipe.title}
              description={
                <>
                  <div style={{ marginBottom: 8 }}>
                    <Tag color={getColorByGoal(recipe.fitnessGoal)}>{recipe.fitnessGoalText}</Tag>
                    <Tag color={getColorByDifficulty(recipe.difficulty)}>{recipe.difficultyText}</Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', fontSize: 12 }}>
                    <span>{recipe.prepTime + recipe.cookTime}分钟</span>
                    <span>{recipe.calories}千卡</span>
                    <span>已观看{recipe.viewCount}</span>
                  </div>
                </>
              }
            />
          </Card>
        </List.Item>
      )}
      pagination={{
        current,
        pageSize: 8,
        total,
        onChange: (page) => setCurrent(page),
        style: { textAlign: 'center', marginTop: 16 }
      }}
    />
  );
  
  const getColorByGoal = (goal: number): string => {
    const colors = ['', 'green', 'blue', 'purple', 'orange'];
    return colors[goal] || 'default';
  };
  
  const getColorByDifficulty = (difficulty: number): string => {
    const colors = ['', 'cyan', 'gold', 'magenta'];
    return colors[difficulty] || 'default';
  };
  
  return (
    <div className="recipes-page">
      <Card 
        title="健康食谱" 
        bordered={false}
        bodyStyle={{ padding: isMobile ? 12 : 24 }}
      >
        {/* 搜索和筛选区域 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={8}>
            <Search
              placeholder="搜索食谱名称、描述或食材"
              allowClear
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={12} md={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="按难度筛选"
              allowClear
              onChange={(value) => {
                setDifficulty(value);
                setCurrent(1);
              }}
            >
              <Option value={1}>简单</Option>
              <Option value={2}>中等</Option>
              <Option value={3}>困难</Option>
            </Select>
          </Col>
          <Col xs={12} md={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="按餐型筛选"
              allowClear
              onChange={(value) => {
                setMealType(value);
                setCurrent(1);
              }}
            >
              <Option value={1}>早餐</Option>
              <Option value={2}>午餐</Option>
              <Option value={3}>晚餐</Option>
              <Option value={4}>小食</Option>
            </Select>
          </Col>
        </Row>
        
        {/* 标签页导航 */}
        <Tabs 
          activeKey={activeTab} 
          onChange={(key) => {
            setActiveTab(key);
            setCurrent(1);
          }}
          style={{ marginBottom: 16 }}
          centered={isMobile}
        >
          <TabPane tab="全部" key="all" />
          <TabPane tab="增肌" key="增肌" />
          <TabPane tab="减脂" key="减脂" />
          <TabPane tab="塑形" key="塑形" />
          <TabPane tab="维持" key="维持" />
        </Tabs>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : recipes.length > 0 ? (
          isMobile ? renderMobileList() : renderDesktopList()
        ) : (
          <Empty description="没有找到匹配的食谱" />
        )}
      </Card>
    </div>
  );
};

export default Recipes; 