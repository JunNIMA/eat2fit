import React, { useEffect, useState, useRef } from 'react';
import { Card, List, Tag, Button, Empty, Spin, message } from 'antd';
import { HeartFilled, AppleOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getFavoriteRecipes, removeRecipeFavorite, FavoriteRecipe } from '@/api/diet';
import { createCancelToken } from '@/utils/request';
import axios, { CancelTokenSource } from 'axios';

const RecipeFavorites: React.FC = () => {
  const navigate = useNavigate();
  
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // 用于取消API请求的令牌
  const favoritesTokenRef = useRef<CancelTokenSource | null>(null);
  const removeTokenRef = useRef<CancelTokenSource | null>(null);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    fetchFavorites();
    
    // 组件卸载或依赖项变化时取消上一个未完成的请求
    return () => {
      if (favoritesTokenRef.current) {
        favoritesTokenRef.current.cancel('依赖项变化，取消上一个请求');
      }
    };
  }, [current]);
  
  const fetchFavorites = async () => {
    try {
      // 取消上一个未完成的请求
      if (favoritesTokenRef.current) {
        favoritesTokenRef.current.cancel('新请求发起，取消旧请求');
      }
      
      // 创建新的取消令牌
      favoritesTokenRef.current = createCancelToken();
      
      setLoading(true);
      const res = await getFavoriteRecipes(current, 10, favoritesTokenRef.current);
      if (res.code === 200) {
        setFavorites(res.data.records || []);
        setTotal(res.data.total || 0);
      } else {
        message.error(res.message || '获取收藏列表失败');
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('收藏列表请求已取消:', error.message);
      } else {
        console.error('获取收藏列表出错', error);
        message.error('获取收藏列表失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleRecipeDetail = (id: number) => {
    navigate(`/diet/recipes/${id}`);
  };
  
  const handleRemoveFavorite = async (recipeId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // 取消上一个未完成的请求
      if (removeTokenRef.current) {
        removeTokenRef.current.cancel('新请求发起，取消旧请求');
      }
      
      // 创建新的取消令牌
      removeTokenRef.current = createCancelToken();
      
      await removeRecipeFavorite(recipeId);
      message.success('已取消收藏');
      fetchFavorites();
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('取消收藏请求已取消:', error.message);
      } else {
        message.error('操作失败，请稍后重试');
      }
    }
  };
  
  const getColorByGoal = (goal: number): string => {
    const colors = ['', 'green', 'blue', 'purple', 'orange'];
    return colors[goal] || 'default';
  };
  
  const getColorByDifficulty = (difficulty: number): string => {
    const colors = ['', 'cyan', 'gold', 'magenta'];
    return colors[difficulty] || 'default';
  };
  
  const renderMobileList = () => (
    <List
      dataSource={favorites}
      renderItem={item => (
        <List.Item 
          onClick={() => handleRecipeDetail(item.recipe.id)}
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
                backgroundImage: item.recipe.coverImg ? `url(${item.recipe.coverImg})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                {!item.recipe.coverImg && <AppleOutlined style={{ fontSize: 24, color: '#52c41a' }} />}
              </div>
              <div style={{ flex: 1, marginLeft: 12 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                  {item.recipe.title}
                </div>
                <div style={{ display: 'flex', marginBottom: 4 }}>
                  <Tag color={getColorByGoal(item.recipe.fitnessGoal)} style={{ margin: 0, marginRight: 4 }}>
                    {item.recipe.fitnessGoalText}
                  </Tag>
                  <Tag color={getColorByDifficulty(item.recipe.difficulty)} style={{ margin: 0 }}>
                    {item.recipe.difficultyText}
                  </Tag>
                </div>
                <div style={{ color: '#999', fontSize: '0.8rem' }}>
                  收藏于 {new Date(item.favoriteTime).toLocaleDateString()}
                </div>
              </div>
              <div>
                <HeartFilled 
                  style={{ color: '#ff4d4f', fontSize: 20, marginRight: 8 }} 
                  onClick={(e) => handleRemoveFavorite(item.recipe.id, e)}
                />
                <RightOutlined style={{ color: '#ccc' }} />
              </div>
            </div>
          </Card>
        </List.Item>
      )}
      pagination={{
        current,
        pageSize: 10,
        total,
        onChange: (page) => setCurrent(page),
        style: { textAlign: 'center', marginTop: 16 }
      }}
    />
  );
  
  const renderDesktopList = () => (
    <List
      grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
      dataSource={favorites}
      renderItem={item => (
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
                  backgroundImage: item.recipe.coverImg ? `url(${item.recipe.coverImg})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}
                onClick={() => handleRecipeDetail(item.recipe.id)}
              >
                {!item.recipe.coverImg && <AppleOutlined style={{ fontSize: 40, color: '#52c41a' }} />}
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
                  onClick={(e) => handleRemoveFavorite(item.recipe.id, e)}
                >
                  <HeartFilled style={{ color: '#ff4d4f', fontSize: 18 }} />
                </div>
              </div>
            }
            onClick={() => handleRecipeDetail(item.recipe.id)}
          >
            <Card.Meta
              title={item.recipe.title}
              description={
                <>
                  <div style={{ marginBottom: 8 }}>
                    <Tag color={getColorByGoal(item.recipe.fitnessGoal)}>{item.recipe.fitnessGoalText}</Tag>
                    <Tag color={getColorByDifficulty(item.recipe.difficulty)}>{item.recipe.difficultyText}</Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', fontSize: 12 }}>
                    <span>{item.recipe.prepTime + item.recipe.cookTime}分钟</span>
                    <span>{item.recipe.calories}千卡</span>
                  </div>
                </>
              }
            />
          </Card>
        </List.Item>
      )}
      pagination={{
        current,
        pageSize: 10,
        total,
        onChange: (page) => setCurrent(page),
        style: { textAlign: 'center', marginTop: 16 }
      }}
    />
  );
  
  return (
    <div className="recipe-favorites-page">
      <Card 
        title="我的收藏" 
        bordered={false}
        bodyStyle={{ padding: isMobile ? 12 : 24 }}
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : favorites.length > 0 ? (
          isMobile ? renderMobileList() : renderDesktopList()
        ) : (
          <Empty description="暂无收藏的食谱" />
        )}
      </Card>
    </div>
  );
};

export default RecipeFavorites; 