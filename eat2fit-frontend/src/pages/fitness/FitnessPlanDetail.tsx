import React, { useEffect, useState } from 'react';
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
  Empty 
} from 'antd';
import { 
  ArrowLeftOutlined, 
  ClockCircleOutlined, 
  CalendarOutlined, 
  DashboardOutlined, 
  HeartOutlined, 
  HeartFilled,
  PlayCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { getPlanDetail, getPlanDetailsById, Plan, PlanDetail, addFavorite, removeFavorite, checkFavorite, choosePlan } from '@/api/fitness';
import { handlePlanSelectionError, handleApiError } from '@/utils/errorHandler';

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
        if (response.success) {
          console.log('计划基本信息:', response.data);
          planData = response.data.plan;
          setPlan(planData);
          
          // 检查是否已收藏
          checkFavoriteStatus(Number(id));
        } else {
          console.error('获取计划基本信息失败:', response.message);
        }
        
        // 获取计划训练安排 - 即使基本信息获取失败也尝试获取详情
        const detailsResponse = await getPlanDetailsById(Number(id));
        if (detailsResponse.success && Array.isArray(detailsResponse.data)) {
          console.log('计划详情API响应:', detailsResponse.data);
          setDetails(detailsResponse.data);
          
          // 如果没有获取到计划基本信息但有详情数据，可以从详情中提取一些基本信息
          if (!planData && detailsResponse.data.length > 0) {
            const firstDetail = detailsResponse.data[0];
            const dummyPlan: Plan = {
              id: firstDetail.planId,
              name: '训练计划',
              description: '计划详情',
              fitnessGoal: 1,
              fitnessGoalText: '健身',
              difficulty: 1,
              difficultyText: '普通',
              bodyFocus: '',
              durationWeeks: Math.max(...detailsResponse.data.map(d => d.weekNum || 0)),
              sessionsPerWeek: 7,
              coverImg: '',
              equipmentNeeded: '',
              totalDays: detailsResponse.data.length
            };
            setPlan(dummyPlan);
          }
        } else {
          console.error('获取训练安排失败，响应:', detailsResponse);
          message.error(detailsResponse.message || '获取训练安排失败');
        }
      } catch (error) {
        console.error('获取计划详情出错:', error);
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
    } catch (error) {
      handleApiError(error);
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
  const getWeeklyDetails = () => {
    const weekMap: {[key: number]: PlanDetail[]} = {};
    
    console.log('组织训练日程，原始数据:', details);
    
    if (!Array.isArray(details) || details.length === 0) {
      console.log('无训练安排数据或数据格式不正确');
      return [];
    }
    
    details.forEach(detail => {
      const weekNum = detail.weekNum || 1; // 默认为第1周
      if (!weekMap[weekNum]) {
        weekMap[weekNum] = [];
      }
      weekMap[weekNum].push(detail);
    });
    
    const result = Object.keys(weekMap).map(week => ({
      week: parseInt(week),
      details: weekMap[parseInt(week)].sort((a, b) => (a.dayNum || 0) - (b.dayNum || 0))
    }));
    
    console.log('训练日程分组结果:', result);
    return result;
  };
  
  // 生成周按计划
  const weeklyDetails = getWeeklyDetails();
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" tip="加载训练计划中..." />
      </div>
    );
  }
  
  // 如果有训练日程但没有计划信息，直接显示训练日程
  const hasPlanDetails = Array.isArray(weeklyDetails) && weeklyDetails.length > 0;
  
  if (!plan && !hasPlanDetails) {
    return (
      <Card>
        <div style={{ textAlign: 'center' }}>
          <Title level={4}>未找到训练计划</Title>
          <Button 
            type="primary" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/fitness')}
            style={{ marginTop: 16, background: '#52c41a', borderColor: '#52c41a' }}
          >
            返回列表
          </Button>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="fitness-plan-detail">
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/fitness')}
        style={{ marginBottom: 16 }}
      >
        返回列表
      </Button>
      
      <Card bordered={false}>
        {plan && (
          <Row gutter={[24, 16]}>
            <Col xs={24} md={16}>
              <div 
                style={{ 
                  height: isMobile ? 200 : 300,
                  background: '#f0f2f5', 
                  borderRadius: 8,
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '16px',
                  backgroundImage: plan.coverImg ? `url(${plan.coverImg})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div 
                  style={{ 
                    background: 'rgba(0,0,0,0.6)', 
                    color: 'white', 
                    padding: '8px 16px', 
                    borderRadius: 4,
                    width: '100%'
                  }}
                >
                  <h2 style={{ color: 'white', margin: 0 }}>{plan.name}</h2>
                  <div style={{ marginTop: 8 }}>
                    <Tag color={getGoalColor(plan.fitnessGoal)}>{plan.fitnessGoalText}</Tag>
                    <Tag color={getDifficultyColor(plan.difficulty)}>{plan.difficultyText}</Tag>
                  </div>
                </div>
              </div>
              
              <Title level={2}>{plan.name}</Title>
              <Space style={{ marginBottom: 16 }}>
                <Tag color={getGoalColor(plan.fitnessGoal)}>{plan.fitnessGoalText}</Tag>
                <Tag color={getDifficultyColor(plan.difficulty)}>{plan.difficultyText}</Tag>
                <Tag icon={<ClockCircleOutlined />}>{plan.durationWeeks} 周计划</Tag>
                <Tag icon={<CalendarOutlined />}>每周 {plan.sessionsPerWeek} 次</Tag>
              </Space>
              
              <Paragraph>{plan.description}</Paragraph>
              
              {plan.bodyFocus && (
                <>
                  <Divider orientation="left">重点锻炼部位</Divider>
                  <div>
                    {plan.bodyFocus.split(',').map((part, index) => (
                      <Tag key={index} style={{ marginBottom: 8 }}>{part.trim()}</Tag>
                    ))}
                  </div>
                </>
              )}
              
              {plan.equipmentNeeded && (
                <>
                  <Divider orientation="left">所需器材</Divider>
                  <div>
                    {plan.equipmentNeeded.split(',').map((item, index) => (
                      <Tag key={index} style={{ marginBottom: 8 }}>{item.trim()}</Tag>
                    ))}
                  </div>
                </>
              )}
            </Col>
            
            <Col xs={24} md={8}>
              <Card 
                title="计划信息" 
                style={{ marginBottom: 16 }}
                actions={[
                  <Button 
                    type="text" 
                    icon={isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                    onClick={handleToggleFavorite}
                  >
                    {isFavorite ? '取消收藏' : '收藏'}
                  </Button>
                ]}
              >
                <p><DashboardOutlined /> 难度: {plan.difficultyText}</p>
                <p><ClockCircleOutlined /> 持续时间: {plan.durationWeeks} 周</p>
                <p><CalendarOutlined /> 训练频率: 每周 {plan.sessionsPerWeek} 次</p>
                <p><DashboardOutlined /> 总训练天数: {plan.totalDays} 天</p>
              </Card>
              
              <Card title="开始训练">
                <p>准备好开始这个训练计划了吗？</p>
                <Button 
                  type="primary" 
                  icon={<PlayCircleOutlined />} 
                  block
                  onClick={handleChoosePlan}
                  style={{ background: '#52c41a', borderColor: '#52c41a' }}
                >
                  选择此计划
                </Button>
              </Card>
            </Col>
          </Row>
        )}
        
        {/* 训练日程部分 - 始终显示，即使没有计划基本信息 */}
        <Divider orientation="left">训练日程</Divider>
        {weeklyDetails && weeklyDetails.length > 0 ? (
          <Collapse defaultActiveKey={['1']}>
            {weeklyDetails.map(week => (
              <Panel 
                header={`第 ${week.week} 周`} 
                key={week.week}
              >
                <Timeline>
                  {week.details.map((detail, index) => (
                    <Timeline.Item key={detail.id || index}>
                      <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                        第 {detail.dayNum || '?'} 天: {detail.title || '未命名训练'}
                      </div>
                      <div style={{ marginBottom: 4 }}>{detail.description || '无描述'}</div>
                      {detail.courseId && (
                        <Button 
                          type="link" 
                          style={{ padding: 0, height: 'auto' }}
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
      </Card>
    </div>
  );
};

export default FitnessPlanDetail; 