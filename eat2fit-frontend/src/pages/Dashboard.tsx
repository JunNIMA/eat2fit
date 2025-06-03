import { useEffect, useState, useRef } from 'react';
import { Row, Col, Card, Statistic, Progress, List, Typography, Skeleton, Space, Divider, Avatar, Tag, Button, message } from 'antd';
import { 
  FireOutlined, 
  AimOutlined, 
  LineChartOutlined, 
  ClockCircleOutlined, 
  RightOutlined,
  HeartOutlined,
  HeartFilled,
  PictureOutlined
} from '@ant-design/icons';
import { useAppSelector } from '@/store/hooks';
import { 
  getRecommendRecipes, 
  addRecipeFavorite, 
  removeRecipeFavorite,
  checkRecipeFavorite,
  Recipe
} from '@/api/diet';
import { 
  getCheckInStats, 
  getCurrentPlan, 
  UserPlan, 
  getCheckInList, 
  CheckIn
} from '@/api/fitness';
import { createCancelToken } from '@/utils/request';
import { useNavigate } from 'react-router-dom';
import axios, { CancelTokenSource } from 'axios';

const { Title, Paragraph } = Typography;

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>([]);
  
  // 统计数据状态
  const [stats, setStats] = useState({
    workoutCount: 0,
    caloriesBurned: 0,
    workoutMinutes: 0,
    completionRate: 0,
    recentActivities: [] as {id: number, type: string, name: string, date: string}[]
  });
  
  // 计划进度状态
  const [fitnessProgress, setFitnessProgress] = useState({
    percent: 0,
    message: '',
    weeklyTarget: 0,
    weeklyCompleted: 0
  });
  
  const [dietProgress, setDietProgress] = useState({
    percent: 0,
    message: '',
    dailyCalories: 0,
    consumedCalories: 0
  });
  
  // 当前计划
  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(null);
  
  // 打卡记录
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  
  // 请求令牌 - 使用useRef替代useState
  const statsTokenRef = useRef<CancelTokenSource | null>(null);
  const planTokenRef = useRef<CancelTokenSource | null>(null);
  const checkInsTokenRef = useRef<CancelTokenSource | null>(null);
  const recipesTokenRef = useRef<CancelTokenSource | null>(null);
  
  // 请求状态跟踪
  const isDataFetchedRef = useRef(false);
  
  // 图片加载错误处理
  const [imgErrorMap, setImgErrorMap] = useState<Record<number, boolean>>({});
  // 图片加载状态跟踪
  const [imgLoadingMap, setImgLoadingMap] = useState<Record<number, boolean>>({});
  
  // 获取仪表盘数据
  const getDashboardData = async () => {
    try {
      setLoading(true);
      
      // 取消之前的请求
      if (statsTokenRef.current) {
        statsTokenRef.current.cancel('新请求取消之前的请求');
      }
      if (planTokenRef.current) {
        planTokenRef.current.cancel('新请求取消之前的请求');
      }
      if (checkInsTokenRef.current) {
        checkInsTokenRef.current.cancel('新请求取消之前的请求');
      }
      
      // 创建新的取消令牌
      statsTokenRef.current = createCancelToken();
      planTokenRef.current = createCancelToken();
      checkInsTokenRef.current = createCancelToken();
      
      // 获取打卡统计数据
      const statsRes = await getCheckInStats(statsTokenRef.current);
      if (statsRes.code === 200 && statsRes.data) {
        const statsData = statsRes.data;
        setStats({
          workoutCount: statsData.thisMonthCount,
          caloriesBurned: statsData.totalCalories,
          workoutMinutes: statsData.totalDuration,
          completionRate: statsData.totalCount > 0 ? Math.round((statsData.thisWeekCount / statsData.totalCount) * 100) : 0,
          recentActivities: [] // 将在获取打卡记录后填充
        });
      }
      
      // 获取当前计划
      const planRes = await getCurrentPlan(planTokenRef.current);
      if (planRes.code === 200 && planRes.data) {
        setCurrentPlan(planRes.data);
        
        // 计算健身计划进度
        const plan = planRes.data;
        if (plan.plan && plan.completionRate) {
          const percent = parseInt(plan.progressPercent) || 0;
          const message = '您的健身计划正在进行中，继续保持！';
          
          // 计算每周目标和已完成数量
          const weeklyTarget = plan.plan.sessionsPerWeek || 0;
          const weeklyCompleted = Math.round(weeklyTarget * (plan.completionRate || 0));
          
          setFitnessProgress({
            percent,
            message,
            weeklyTarget,
            weeklyCompleted
          });
        }
        
        // 假设饮食计划的进度（这个需要根据实际API调整）
        setDietProgress({
          percent: 78,
          message: '您的饮食计划执行情况良好，加油！',
          dailyCalories: 2000,
          consumedCalories: 1590
        });
      }
      
      // 获取最近打卡记录
      const checkInsRes = await getCheckInList(undefined, undefined, 1, 4, checkInsTokenRef.current);
      if (checkInsRes.code === 200 && checkInsRes.data && checkInsRes.data.records) {
        setCheckIns(checkInsRes.data.records);
        
        // 格式化最近活动
        const activities = checkInsRes.data.records.map(checkIn => {
          let date = '未知时间';
          try {
            const checkInDate = new Date(checkIn.checkInDate);
            const today = new Date();
            const diffDays = Math.floor((today.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) date = '今天';
            else if (diffDays === 1) date = '昨天';
            else if (diffDays < 7) date = `${diffDays}天前`;
            else date = `${checkInDate.getMonth() + 1}月${checkInDate.getDate()}日`;
          } catch (e) {}
          
          return {
            id: checkIn.id,
            type: '健身',
            name: checkIn.content || '完成训练',
            date
          };
        });
        
        setStats(prev => ({
          ...prev,
          recentActivities: activities
        }));
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('请求已取消', error.message);
      } else {
        console.error('获取仪表盘数据失败', error);
        message.error('获取数据失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // 获取推荐食谱
  const fetchRecommendRecipes = async () => {
    try {
      setRecipesLoading(true);
      
      // 取消之前的请求
      if (recipesTokenRef.current) {
        recipesTokenRef.current.cancel('新请求取消之前的请求');
      }
      
      // 创建新的取消令牌
      recipesTokenRef.current = createCancelToken();
      
      const res = await getRecommendRecipes(4, recipesTokenRef.current); // 获取4个推荐食谱
      if (res.code === 200) {
        // 确保每个食谱的图片URL都是有效的
        const recipes = res.data || [];
        
        // 清除错误状态
        setImgErrorMap({});
        
        // 设置推荐食谱数据
        setRecommendedRecipes(recipes);
        
        // 预加载图片
        recipes.forEach(recipe => {
          if (recipe.coverImg) {
            // 设置图片为加载中状态
            setImgLoadingMap(prev => ({
              ...prev,
              [recipe.id]: true
            }));
            
            const img = new Image();
            const imageUrl = getImageUrl(recipe.coverImg) || '';
            img.src = imageUrl;
            img.onload = () => {
              // 确保图片成功加载时清除错误状态并更新加载状态
              setImgErrorMap(prev => ({
                ...prev,
                [recipe.id]: false
              }));
              handleImageLoad(recipe.id);
            };
            img.onerror = () => handleImageError(recipe.id);
          }
        });
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('食谱请求已取消', error.message);
      } else {
        console.error('获取推荐食谱出错', error);
      }
    } finally {
      setRecipesLoading(false);
    }
  };

  useEffect(() => {
    // 每次组件装载都重新获取数据
    isDataFetchedRef.current = false;
    
    // 获取仪表盘数据
    getDashboardData();
    
    // 获取推荐食谱
    fetchRecommendRecipes();
    
    // 组件卸载时取消所有请求
    return () => {
      if (statsTokenRef.current) statsTokenRef.current.cancel('组件卸载');
      if (planTokenRef.current) planTokenRef.current.cancel('组件卸载');
      if (checkInsTokenRef.current) checkInsTokenRef.current.cancel('组件卸载');
      if (recipesTokenRef.current) recipesTokenRef.current.cancel('组件卸载');
    };
  }, []);
  
  // 前往食谱详情页
  const goToRecipeDetail = (id: number) => {
    navigate(`/diet/recipes/${id}`);
  };
  
  // 前往食谱列表页
  const goToRecipes = () => {
    navigate('/diet/recipes');
  };
  
  // 前往健身计划页
  const goToFitnessPlan = () => {
    navigate('/fitness');
  };
  
  // 前往饮食计划页
  const goToDietPlan = () => {
    navigate('/diet/meals');
  };
  
  // 添加收藏/取消收藏功能
  const handleToggleFavorite = async (e: React.MouseEvent, recipe: Recipe) => {
    e.stopPropagation();
    try {
      if (recipe.isFavorite) {
        await removeRecipeFavorite(recipe.id);
        message.success('已取消收藏');
      } else {
        await addRecipeFavorite(recipe.id);
        message.success('收藏成功');
      }
      
      // 更新本地收藏状态
      setRecommendedRecipes(prev => 
        prev.map(item => 
          item.id === recipe.id ? { ...item, isFavorite: !recipe.isFavorite } : item
        )
      );
      
      // 单独检查收藏状态
      setTimeout(async () => {
        try {
          const res = await checkRecipeFavorite(recipe.id);
          if (res.code === 200) {
            setRecommendedRecipes(prev => 
              prev.map(item => 
                item.id === recipe.id ? { ...item, isFavorite: res.data } : item
              )
            );
          }
        } catch (error) {
          console.error('检查收藏状态出错', error);
        }
      }, 300);
    } catch (error) {
      console.error('收藏操作出错', error);
      message.error('操作失败，请稍后重试');
      fetchRecommendRecipes();
    }
  };
  
  // 获取健身目标对应的颜色
  const getColorByGoal = (goal: number): string => {
    const colors = ['', 'green', 'blue', 'purple', 'orange'];
    return colors[goal] || 'default';
  };
  
  // 处理图片URL，确保完整路径
  const getImageUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    
    // 如果已经是完整URL（以http或https开头），则直接返回
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // 如果是相对路径，添加基础URL（根据实际API调整）
    if (url.startsWith('/')) {
      return `${process.env.REACT_APP_API_BASE_URL || '/api'}${url}`;
    }
    
    // 其他情况，假设是相对于API的路径
    return `${process.env.REACT_APP_API_BASE_URL || '/api'}/${url}`;
  };
  
  const handleImageError = (recipeId: number) => {
    setImgErrorMap(prev => ({
      ...prev,
      [recipeId]: true
    }));
    // 结束加载状态
    setImgLoadingMap(prev => ({
      ...prev,
      [recipeId]: false
    }));
  };

  // 处理图片加载状态
  const handleImageLoad = (recipeId: number) => {
    setImgLoadingMap(prev => ({
      ...prev,
      [recipeId]: false
    }));
  };

  return (
    <div className="dashboard">
      <Title level={2} style={{ marginBottom: 8, fontSize: '1.5rem' }}>
        欢迎回来, {user?.nickname || user?.username || '健身达人'}
      </Title>
      <Paragraph style={{ marginBottom: 24, color: '#666' }}>
        这是您的健康仪表盘，在这里查看您的健身和饮食概览
      </Paragraph>
      
      <Row gutter={[16, 16]}>
        {/* 四个主要指标卡片 */}
        <Col xs={12} sm={12} md={6}>
          <Card bordered={false} bodyStyle={{ padding: 16 }} loading={loading}>
            <Statistic 
              title="本月训练"
              value={stats.workoutCount}
              prefix={<AimOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a', fontSize: '1.5rem' }}
              suffix="次"
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card bordered={false} bodyStyle={{ padding: 16 }} loading={loading}>
            <Statistic 
              title="消耗热量"
              value={stats.caloriesBurned}
              prefix={<FireOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16', fontSize: '1.5rem' }}
              suffix="千卡"
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card bordered={false} bodyStyle={{ padding: 16 }} loading={loading}>
            <Statistic 
              title="训练时长"
              value={stats.workoutMinutes}
              prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontSize: '1.5rem' }}
              suffix="分钟"
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card bordered={false} bodyStyle={{ padding: 16 }} loading={loading}>
            <Statistic 
              title="完成率"
              value={stats.completionRate}
              prefix={<LineChartOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontSize: '1.5rem' }}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 健身/饮食进度 */}
        <Col xs={24} md={12}>
          <Card 
            title="健身计划进度" 
            bordered={false} 
            loading={loading}
            bodyStyle={{ padding: '12px 16px' }}
            extra={<Button type="link" onClick={goToFitnessPlan}>查看计划</Button>}
          >
            <div style={{ margin: '8px 0' }}>
              <span>{fitnessProgress.message}</span>
              <div style={{ marginTop: 16 }}>
                <Progress 
                  percent={fitnessProgress.percent} 
                  status="active" 
                  strokeColor="#52c41a"
                  strokeWidth={8}
                  trailColor="#f0f0f0"
                />
              </div>
            </div>
            <Space 
              style={{ 
                marginTop: 16, 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '0.9rem',
                color: '#666'
              }}
            >
              <span>本周还需完成{Math.max(0, fitnessProgress.weeklyTarget - fitnessProgress.weeklyCompleted)}次训练</span>
              <span>{fitnessProgress.weeklyCompleted}/{fitnessProgress.weeklyTarget}次</span>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card 
            title="饮食计划进度" 
            bordered={false} 
            loading={loading}
            bodyStyle={{ padding: '12px 16px' }}
            extra={<Button type="link" onClick={goToDietPlan}>查看计划</Button>}
          >
            <div style={{ margin: '8px 0' }}>
              <span>{dietProgress.message}</span>
              <div style={{ marginTop: 16 }}>
                <Progress 
                  percent={dietProgress.percent} 
                  status="active" 
                  strokeColor="#1890ff"
                  strokeWidth={8}
                  trailColor="#f0f0f0"
                />
              </div>
            </div>
            <Space 
              style={{ 
                marginTop: 16, 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '0.9rem',
                color: '#666'
              }}
            >
              <span>今日摄入热量达标</span>
              <span>{dietProgress.consumedCalories}/{dietProgress.dailyCalories}千卡</span>
            </Space>
          </Card>
        </Col>
      </Row>
      
      {/* 推荐食谱 */}
      <Card 
        title="为您推荐的食谱"
        style={{ marginTop: 16 }} 
        bordered={false}
        extra={<Button type="link" onClick={goToRecipes}>更多食谱</Button>}
        loading={recipesLoading}
      >
        <Row gutter={[16, 16]}>
          {recommendedRecipes.map(recipe => {
            // 检查图片是否有错误
            const hasImageError = imgErrorMap[recipe.id];
            // 检查图片是否正在加载中
            const isImageLoading = imgLoadingMap[recipe.id];
            // 获取图片URL
            const imageUrl = getImageUrl(recipe.coverImg);
            // 是否显示默认图标
            const showDefaultIcon = !recipe.coverImg || hasImageError;
            
            return (
              <Col key={recipe.id} xs={24} sm={12} md={8} lg={6}>
                <Card 
                  hoverable 
                  style={{ height: '100%' }}
                  onClick={() => goToRecipeDetail(recipe.id)}
                  cover={
                    <div 
                      style={{ 
                        height: 120, 
                        backgroundImage: !showDefaultIcon ? `url(${imageUrl})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: showDefaultIcon ? '#f0f2f5' : undefined,
                        position: 'relative'
                      }}
                    >
                      {showDefaultIcon && (
                        <PictureOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                      )}
                      {isImageLoading && (
                        <div style={{ 
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(255,255,255,0.7)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <div className="ant-spin ant-spin-spinning">
                            <span className="ant-spin-dot ant-spin-dot-spin">
                              <i className="ant-spin-dot-item"></i>
                              <i className="ant-spin-dot-item"></i>
                              <i className="ant-spin-dot-item"></i>
                              <i className="ant-spin-dot-item"></i>
                            </span>
                          </div>
                        </div>
                      )}
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
                        onClick={(e) => handleToggleFavorite(e, recipe)}
                      >
                        {recipe.isFavorite ? 
                          <HeartFilled style={{ color: '#ff4d4f', fontSize: 18 }} /> : 
                          <HeartOutlined style={{ color: '#999', fontSize: 18 }} />
                        }
                      </div>
                    </div>
                  }
                >
                  <Card.Meta
                    title={recipe.title}
                    description={
                      <>
                        <Tag color={getColorByGoal(recipe.fitnessGoal)}>{recipe.fitnessGoalText}</Tag>
                        <div style={{ marginTop: 8, color: '#999', fontSize: 12 }}>
                          {recipe.calories}千卡 · {recipe.prepTime + recipe.cookTime}分钟
                        </div>
                      </>
                    }
                  />
                </Card>
              </Col>
            );
          })}
        </Row>
      </Card>
      
      {/* 最近活动 */}
      <Card 
        title="最近活动" 
        style={{ marginTop: 16 }} 
        bordered={false}
        bodyStyle={{ padding: '8px 0' }}
        loading={loading}
      >
        <List
          itemLayout="horizontal"
          dataSource={stats.recentActivities}
          renderItem={item => (
            <List.Item>
              <List.Item.Meta
                title={
                  <div style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>
                    {item.name}
                  </div>
                }
                description={
                  <div style={{ fontSize: '0.85rem', color: '#999' }}>
                    {item.type} · {item.date}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default Dashboard; 