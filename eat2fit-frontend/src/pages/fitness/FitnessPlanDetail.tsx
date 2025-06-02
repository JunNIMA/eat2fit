import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Tag, 
  Button, 
  Row, 
  Col, 
  Divider, 
  Space, 
  Spin, 
  message, 
  Timeline, 
  Collapse, 
  Modal, 
  Empty,
  Skeleton,
  Tabs
} from 'antd';
import { 
  ArrowLeftOutlined, 
  ClockCircleOutlined, 
  CalendarOutlined, 
  DashboardOutlined, 
  HeartOutlined, 
  HeartFilled,
  PlayCircleOutlined,
  ExclamationCircleOutlined,
  FireOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { getPlanDetail, getPlanDetailsById, Plan, PlanDetail, addFavorite, removeFavorite, checkFavorite, choosePlan } from '@/api/fitness';
import { handlePlanSelectionError, handleApiError } from '@/utils/errorHandler';
import './FitnessPlanDetail.less';

const { Title, Paragraph } = Typography;
const { Panel } = Collapse;
const { confirm } = Modal;

const FitnessPlanDetail: React.FC = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(true);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [details, setDetails] = useState<PlanDetail[]>([]);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 加载计划详情
  useEffect(() => {
    const fetchPlanDetail = async () => {
      if (!id) return;
      
      setLoading(true);
      let planData = null;
      
      try {
        // 获取计划基本信息
        const response = await getPlanDetail(Number(id));
        
        if (response.success || response.code === 200) {
          let data = response.data;
          
          // 支持两种可能的数据结构
          planData = data.plan || data;
          
          // 确保coverImg属性存在并且是有效的URL
          if (planData) {
            // 处理封面图片URL
            if (planData.coverImg) {
              // 如果封面URL是相对路径，需要添加正确的前缀
              if (!planData.coverImg.startsWith('http') && !planData.coverImg.startsWith('/')) {
                planData.coverImg = '/' + planData.coverImg;
              }
              
              // 如果不包含域名但以/api开头，去掉/api前缀（因为baseURL已经包含了/api）
              if (planData.coverImg.startsWith('/api/') && !planData.coverImg.includes('://')) {
                planData.coverImg = planData.coverImg.substring(4);
              }
              
              // 添加随机参数以避免缓存问题
              const timestamp = new Date().getTime();
              const randomStr = Math.random().toString(36).substring(2, 8);
              const separator = planData.coverImg.includes('?') ? '&' : '?';
              planData.coverImg = `${planData.coverImg}${separator}v=${timestamp}-${randomStr}`;
            }
            
            setPlan(planData);
          }
          
          // 如果响应中包含details，直接使用
          if (data.details && Array.isArray(data.details)) {
            setDetails(data.details);
          } else {
            // 否则单独请求训练安排
            try {
              const detailsResponse = await getPlanDetailsById(Number(id));
              if (detailsResponse.success && Array.isArray(detailsResponse.data)) {
                setDetails(detailsResponse.data);
              }
            } catch (error) {
              console.error('获取训练安排失败:', error);
            }
          }
          
          // 检查是否已收藏
          checkFavoriteStatus(Number(id));
        } else {
          message.error(response.message || '获取计划信息失败');
        }
      } catch (error) {
        message.error('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlanDetail();
  }, [id]);
  
  // 检查收藏状态
  const checkFavoriteStatus = async (planId: number) => {
    try {
      const response = await checkFavorite(2, planId);
      if (response.success) {
        setIsFavorite(response.data);
      }
    } catch (error) {
      console.error('检查收藏状态失败', error);
    }
  };
  
  // 切换收藏状态
  const handleToggleFavorite = async () => {
    if (!plan) return;
    
    try {
      if (isFavorite) {
        const response = await removeFavorite(2, plan.id);
        if (handleApiError(response)) {
          setIsFavorite(false);
          message.success('已取消收藏');
        }
      } else {
        const response = await addFavorite(2, plan.id);
        if (handleApiError(response)) {
          setIsFavorite(true);
          message.success('收藏成功');
        }
      }
    } catch (error: any) {
      if (error?.response?.data) {
        handleApiError(error.response.data);
      } else {
        message.error(error?.message || '操作失败，请稍后重试');
      }
    }
  };
  
  // 选择计划
  const handleChoosePlan = () => {
    if (!plan) return;
    
    confirm({
      title: '选择训练计划',
      icon: <ExclamationCircleOutlined />,
      content: '确定要选择这个训练计划吗？开始后将会安排每天的训练内容。',
      onOk: async () => {
        try {
          const response = await choosePlan(plan.id);
          if (handleApiError(response, true, '已有进行中的计划，请先完成或放弃当前计划')) {
            message.success('计划选择成功，现在可以开始训练了！');
            navigate('/fitness/myplans');
          }
        } catch (error: any) {
          if (!handlePlanSelectionError(error)) {
            handleApiError(error, true, '已有进行中的计划，请先完成或放弃当前计划');
          }
        }
      }
    });
  };
  
  // 获取健身目标颜色
  const getGoalColor = (goal?: number): string => {
    const colors = ['', 'green', 'blue', 'purple', 'orange'];
    return goal ? colors[goal] : 'default';
  };
  
  // 获取难度颜色
  const getDifficultyColor = (difficulty?: number): string => {
    const colors = ['', 'cyan', 'gold', 'magenta'];
    return difficulty ? colors[difficulty] : 'default';
  };
  
  // 根据周信息对训练日程进行分组
  const weeklyDetails = useMemo(() => {
    const weekMap: {[key: number]: PlanDetail[]} = {};
    
    if (!Array.isArray(details) || details.length === 0) {
      return [];
    }
    
    details.forEach(detail => {
      const weekNum = detail.weekNum || 1; // 默认为第1周
      if (!weekMap[weekNum]) {
        weekMap[weekNum] = [];
      }
      weekMap[weekNum].push(detail);
    });
    
    return Object.keys(weekMap).map(week => ({
      week: parseInt(week),
      details: weekMap[parseInt(week)].sort((a, b) => (a.dayNum || 0) - (b.dayNum || 0))
    }));
  }, [details]);
  
  if (loading) {
    return (
      <div className="fitness-plan-loading">
        <Skeleton active avatar paragraph={{ rows: 10 }} />
      </div>
    );
  }
  
  // 如果有训练日程但没有计划信息，直接显示训练日程
  const hasPlanDetails = Array.isArray(weeklyDetails) && weeklyDetails.length > 0;
  
  if (!plan && !hasPlanDetails) {
    return (
      <Card className="not-found-card">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="未找到训练计划"
        />
          <Button 
            type="primary" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/fitness')}
          className="back-button"
          >
            返回列表
          </Button>
      </Card>
    );
  }
  
  const tabItems = [
    {
      key: 'overview',
      label: '计划概览',
      icon: <InfoCircleOutlined />,
      children: (
        <>
          <Paragraph>{plan?.description}</Paragraph>
          
          {plan?.bodyFocus && (
            <>
              <Divider orientation="left">重点锻炼部位</Divider>
              <div className="tag-container">
                {plan.bodyFocus.split(',').map((part, index) => (
                  <Tag key={index} className="body-part-tag">{part.trim()}</Tag>
                ))}
              </div>
            </>
          )}
          
          {plan?.equipmentNeeded && (
            <>
              <Divider orientation="left">所需器材</Divider>
              <div className="tag-container">
                {plan.equipmentNeeded.split(',').map((item, index) => (
                  <Tag key={index} className="equipment-tag">{item.trim()}</Tag>
                ))}
              </div>
            </>
          )}
        </>
      )
    },
    {
      key: 'schedule',
      label: '训练日程',
      icon: <CalendarOutlined />,
      children: (
        <>
          {weeklyDetails && weeklyDetails.length > 0 ? (
            <Collapse defaultActiveKey={['1']} className="schedule-collapse">
              {weeklyDetails.map(week => (
                <Panel 
                  header={`第 ${week.week} 周`} 
                  key={week.week}
                  className="week-panel"
                >
                  <Timeline className="training-timeline">
                    {week.details.map((detail, index) => (
                      <Timeline.Item key={detail.id || index} className="timeline-item">
                        <div className="day-title">
                          第 {detail.dayNum || '?'} 天: {detail.title || '未命名训练'}
                        </div>
                        <div className="day-description">{detail.description || '无描述'}</div>
                        {detail.courseId && (
                          <Button 
                            type="link" 
                            className="view-course-btn"
                            onClick={() => navigate(`/fitness/courses/${detail.courseId}`)}
                          >
                            查看相关课程
                          </Button>
                        )}
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Panel>
              ))}
            </Collapse>
          ) : (
            <Empty description="暂无训练日程信息" />
          )}
        </>
      )
    }
  ];
  
  return (
    <div className="fitness-plan-detail">
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/fitness')}
        className="back-button"
      >
        返回列表
      </Button>
      
      <Card bordered={false} className="main-card">
        {plan && (
          <Row gutter={[24, 16]}>
            <Col xs={24} md={16}>
              <div 
                className="plan-cover-container"
                style={{ 
                  backgroundImage: plan.coverImg ? `url(${plan.coverImg})` : undefined,
                }}
              >
                <div 
                  className="plan-cover-placeholder"
                  style={{
                    display: plan.coverImg ? 'none' : 'flex',
                  }}
                >
                  训练计划封面
                </div>
                
                <img 
                  src={plan.coverImg} 
                  alt="计划封面" 
                  style={{ display: 'none' }}
                  onLoad={() => {
                    const placeholderEl = document.querySelector('.plan-cover-placeholder');
                    if (placeholderEl) (placeholderEl as HTMLElement).style.display = 'none';
                  }}
                  onError={() => {
                    const placeholderEl = document.querySelector('.plan-cover-placeholder');
                    if (placeholderEl) (placeholderEl as HTMLElement).style.display = 'flex';
                    
                    const containerEl = document.querySelector('.plan-cover-container');
                    if (containerEl) (containerEl as HTMLElement).style.backgroundImage = 'none';
                  }}
                />
                
                <div className="cover-info">
                  <h2>{plan.name}</h2>
                  <div className="cover-tags">
                    <Tag color={getGoalColor(plan.fitnessGoal)}>{plan.fitnessGoalText}</Tag>
                    <Tag color={getDifficultyColor(plan.difficulty)}>{plan.difficultyText}</Tag>
                  </div>
                </div>
              </div>
              
              <Title level={2} className="plan-title">{plan.name}</Title>
              <Space className="plan-info-tags">
                <Tag color={getGoalColor(plan.fitnessGoal)}>{plan.fitnessGoalText}</Tag>
                <Tag color={getDifficultyColor(plan.difficulty)}>{plan.difficultyText}</Tag>
                <Tag icon={<ClockCircleOutlined />}>{plan.durationWeeks} 周计划</Tag>
                <Tag icon={<CalendarOutlined />}>每周 {plan.sessionsPerWeek} 次</Tag>
              </Space>
              
              <Tabs 
                activeKey={activeTab} 
                onChange={setActiveTab}
                items={tabItems}
                className="plan-tabs"
              />
            </Col>
            
            <Col xs={24} md={8}>
              <Card 
                title="计划信息" 
                className="info-card"
                actions={[
                  <Button 
                    type="text" 
                    icon={isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                    onClick={handleToggleFavorite}
                    className="favorite-btn"
                  >
                    {isFavorite ? '取消收藏' : '收藏'}
                  </Button>
                ]}
              >
                {plan.coverImg && (
                  <div className="card-cover-container">
                    <div 
                      className="card-cover-image"
                      style={{ 
                        background: `url(${plan.coverImg}) center/cover no-repeat`,
                      }}
                    >
                      <div 
                        className="card-image-placeholder"
                        style={{
                          display: 'none',
                        }}
                      >
                        图片加载失败
                      </div>
                      
                      <img 
                        src={plan.coverImg} 
                        alt={plan.name} 
                        className="hidden-image" 
                        onLoad={() => {}}
                        onError={() => {
                          const placeholder = document.querySelector('.card-image-placeholder');
                          if (placeholder) (placeholder as HTMLElement).style.display = 'flex';
                          
                          const imgContainer = document.querySelector('.card-cover-image');
                          if (imgContainer) {
                            (imgContainer as HTMLElement).style.backgroundImage = 'none';
                            (imgContainer as HTMLElement).style.backgroundColor = '#f9f9f9';
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="plan-stats">
                <p><DashboardOutlined /> 难度: {plan.difficultyText}</p>
                <p><ClockCircleOutlined /> 持续时间: {plan.durationWeeks} 周</p>
                <p><CalendarOutlined /> 训练频率: 每周 {plan.sessionsPerWeek} 次</p>
                  <p><FireOutlined /> 总训练天数: {plan.totalDays} 天</p>
                </div>
              </Card>
              
              <Card title="开始训练" className="start-card">
                <p>准备好开始这个训练计划了吗？</p>
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />} 
                  block
                  onClick={handleChoosePlan}
                  className="choose-plan-btn"
                >
                  选择此计划
                </Button>
              </Card>
            </Col>
          </Row>
        )}
      </Card>
    </div>
  );
};

export default FitnessPlanDetail; 