import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Tag, 
  Button, 
  Divider, 
  List, 
  Avatar, 
  Statistic, 
  message, 
  Spin, 
  Image,
  Steps
} from 'antd';
import { 
  ClockCircleOutlined, 
  FireOutlined, 
  TeamOutlined, 
  HeartOutlined, 
  HeartFilled, 
  LikeOutlined, 
  LikeFilled, 
  ArrowLeftOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { 
  getRecipeDetail, 
  likeRecipe, 
  unlikeRecipe, 
  addRecipeFavorite, 
  removeRecipeFavorite,
  checkRecipeFavorite
} from '@/api/diet';

const { Title, Text, Paragraph } = Typography;

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState<any>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (id) {
      fetchRecipeDetail(parseInt(id));
    }
  }, [id]);
  
  const fetchRecipeDetail = async (recipeId: number) => {
    try {
      setLoading(true);
      console.log('正在获取食谱详情，ID:', recipeId);
      const res = await getRecipeDetail(recipeId);
      console.log('获取食谱详情响应:', res);
      
      if (res.code === 200 && res.data) {
        setRecipe(res.data);
        setLikeCount(res.data.likeCount || 0);
        setIsFavorite(res.data.isFavorite || false);
        
        // 单独确认收藏状态
        checkFavoriteStatus(recipeId);
      } else {
        console.error('获取食谱详情失败，响应:', res);
        message.error(res.message || '获取食谱详情失败');
      }
    } catch (error) {
      console.error('获取食谱详情出错', error);
      message.error('获取食谱详情失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 单独检查收藏状态，确保UI显示正确
  const checkFavoriteStatus = async (recipeId: number) => {
    try {
      const res = await checkRecipeFavorite(recipeId);
      if (res.code === 200) {
        setIsFavorite(res.data);
      }
    } catch (error) {
      console.error('检查收藏状态出错', error);
    }
  };
  
  const handleLike = async () => {
    try {
      if (!id) return;
      
      if (liked) {
        await unlikeRecipe(parseInt(id));
        setLikeCount(prev => Math.max(0, prev - 1));
        message.success('已取消点赞');
      } else {
        await likeRecipe(parseInt(id));
        setLikeCount(prev => prev + 1);
        message.success('点赞成功');
      }
      
      setLiked(!liked);
    } catch (error) {
      message.error('操作失败，请稍后重试');
    }
  };
  
  const handleFavorite = async () => {
    try {
      if (!id) return;
      
      if (isFavorite) {
        await removeRecipeFavorite(parseInt(id));
        message.success('已取消收藏');
      } else {
        await addRecipeFavorite(parseInt(id));
        message.success('收藏成功');
      }
      
      // 立即更新本地状态
      setIsFavorite(!isFavorite);
      
      // 再次确认服务器端的真实状态，确保UI一致性
      setTimeout(() => {
        if (id) {
          checkFavoriteStatus(parseInt(id));
        }
      }, 300);
    } catch (error) {
      console.error('收藏操作出错', error);
      message.error('操作失败，请稍后重试');
      
      // 发生错误时重新检查状态
      if (id) {
        checkFavoriteStatus(parseInt(id));
      }
    }
  };
  
  const goBack = () => {
    navigate(-1);
  };
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" />
      </div>
    );
  }
  
  if (!recipe) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Title level={4}>食谱不存在或已被删除</Title>
          <Button type="primary" onClick={goBack}>返回</Button>
        </div>
      </Card>
    );
  }
  
  const NutritionCard = ({ label, value, unit, color }: { label: string, value: number | string, unit: string, color: string }) => (
    <Card style={{ textAlign: 'center', height: '100%' }}>
      <Statistic
        title={label}
        value={value}
        suffix={unit}
        valueStyle={{ color }}
      />
    </Card>
  );
  
  return (
    <div className="recipe-detail">
      <Button 
        type="link" 
        icon={<ArrowLeftOutlined />} 
        onClick={goBack}
        style={{ marginBottom: 16, padding: 0 }}
      >
        返回食谱列表
      </Button>
      
      <Card bordered={false}>
        {/* 标题和封面 */}
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <div>
              <Title level={2}>{recipe.title}</Title>
              <div style={{ marginBottom: 16 }}>
                <Tag color="green">{recipe.fitnessGoalText}</Tag>
                <Tag color="blue">{recipe.difficultyText}</Tag>
                <Tag>{recipe.mealType}</Tag>
                {recipe.tagList && recipe.tagList.map((tag: string, index: number) => (
                  <Tag key={index}>{tag}</Tag>
                ))}
              </div>
              <Paragraph>{recipe.description}</Paragraph>
              
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={8}>
                  <div>
                    <ClockCircleOutlined style={{ marginRight: 8 }} />
                    准备时间: {recipe.prepTime}分钟
                  </div>
                </Col>
                <Col span={8}>
                  <div>
                    <ClockCircleOutlined style={{ marginRight: 8 }} />
                    烹饪时间: {recipe.cookTime}分钟
                  </div>
                </Col>
                <Col span={8}>
                  <div>
                    <TeamOutlined style={{ marginRight: 8 }} />
                    份量: {recipe.servings}份
                  </div>
                </Col>
              </Row>
              
              <div style={{ marginTop: 24 }}>
                <Button 
                  type="primary" 
                  icon={isFavorite ? <HeartFilled /> : <HeartOutlined />} 
                  onClick={handleFavorite}
                  style={{ marginRight: 16 }}
                >
                  {isFavorite ? '已收藏' : '收藏'}
                </Button>
                <Button
                  icon={liked ? <LikeFilled /> : <LikeOutlined />}
                  onClick={handleLike}
                >
                  点赞 {likeCount}
                </Button>
              </div>
            </div>
          </Col>
          <Col xs={24} md={12}>
            {recipe.coverImg ? (
              <Image
                src={recipe.coverImg}
                alt={recipe.title}
                style={{ width: '100%', borderRadius: 8 }}
              />
            ) : (
              <div style={{ 
                height: 300, 
                background: '#f0f2f5', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                borderRadius: 8
              }}>
                <FireOutlined style={{ fontSize: 48, color: '#52c41a' }} />
              </div>
            )}
          </Col>
        </Row>
        
        <Divider orientation="left">营养成分</Divider>
        <Row gutter={16}>
          <Col xs={12} md={6}>
            <NutritionCard label="卡路里" value={recipe.calories} unit="千卡" color="#fa541c" />
          </Col>
          <Col xs={12} md={6}>
            <NutritionCard label="蛋白质" value={recipe.protein} unit="克" color="#1890ff" />
          </Col>
          <Col xs={12} md={6}>
            <NutritionCard label="脂肪" value={recipe.fat} unit="克" color="#fa8c16" />
          </Col>
          <Col xs={12} md={6}>
            <NutritionCard label="碳水化合物" value={recipe.carbs} unit="克" color="#52c41a" />
          </Col>
        </Row>
        
        <Divider orientation="left">食材清单</Divider>
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
          dataSource={recipe.ingredients || []}
          renderItem={(item: any) => (
            <List.Item>
              <Card size="small">
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      src={item.food?.imageUrl} 
                      icon={!item.food?.imageUrl && <FireOutlined />}
                      style={{ backgroundColor: !item.food?.imageUrl ? '#52c41a' : undefined }}
                    />
                  }
                  title={item.name}
                  description={`${item.amount} ${item.unit}`}
                />
              </Card>
            </List.Item>
          )}
        />
        
        {recipe.steps && recipe.steps.length > 0 && (
          <>
            <Divider orientation="left">烹饪步骤</Divider>
            <Steps
              direction={isMobile ? 'vertical' : 'horizontal'}
              progressDot
              current={-1}
              style={{ marginBottom: 24 }}
            >
              {recipe.steps.map((step: any, index: number) => (
                <Steps.Step 
                  key={index} 
                  title={`步骤 ${index + 1}`} 
                  description={
                    <div>
                      <Paragraph>{step.description}</Paragraph>
                      {step.imgUrl && (
                        <Image
                          src={step.imgUrl}
                          alt={`步骤 ${index + 1}`}
                          width={200}
                          style={{ borderRadius: 4 }}
                        />
                      )}
                    </div>
                  } 
                />
              ))}
            </Steps>
          </>
        )}
        
        <Divider />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text type="secondary">作者: {recipe.authorName || '未知'}</Text>
          </div>
          <div>
            <Text type="secondary">浏览次数: {recipe.viewCount}</Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RecipeDetail;
 