import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  Card, 
  Tabs, 
  List, 
  Tag, 
  Button, 
  Progress, 
  Empty, 
  Spin, 
  Row, 
  Col, 
  message, 
  Modal,
  Statistic,
  Divider
} from 'antd';
import { 
  ClockCircleOutlined, 
  CalendarOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  RightOutlined,
  PlayCircleOutlined,
  DashboardOutlined,
  HistoryOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getUserPlans, abandonPlan, completePlan, updatePlanProgress, getCurrentPlan, UserPlan, PlanDetail, getTodayWorkout, isWorkoutCompletedToday } from '@/api/fitness';
import { handleApiError } from '@/utils/errorHandler';
import { createCancelToken } from '@/utils/request';
import axios, { CancelTokenSource } from 'axios';

const { TabPane } = Tabs;
const { confirm } = Modal;

const UserPlans: React.FC = () => {
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState<string>('current');
  const [loading, setLoading] = useState<boolean>(false);
  const [userPlans, setUserPlans] = useState<UserPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [current, setCurrent] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [todayWorkoutVisible, setTodayWorkoutVisible] = useState<boolean>(false);
  const [todayWorkout, setTodayWorkout] = useState<PlanDetail | null>(null);
  const [todayWorkoutCompleted, setTodayWorkoutCompleted] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  
  // 用于取消API请求的令牌
  const currentPlanTokenRef = useRef<CancelTokenSource | null>(null);
  const userPlansTokenRef = useRef<CancelTokenSource | null>(null);
  const actionTokenRef = useRef<CancelTokenSource | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 检查今日训练是否已完成
  const checkTodayWorkoutStatus = useCallback(async (userPlanId: number) => {
    try {
      console.log('检查今日训练是否已完成...');
      const response = await isWorkoutCompletedToday(userPlanId);
      console.log('今日训练完成状态:', response);
      
      if (response.success) {
        setTodayWorkoutCompleted(response.data);
      }
    } catch (error) {
      console.error('检查今日训练状态失败:', error);
    }
  }, []);

  // 加载当前计划
  const loadCurrentPlan = useCallback(async () => {
    // 取消先前的请求
    if (currentPlanTokenRef.current) {
      currentPlanTokenRef.current.cancel('新请求发起，取消旧请求');
    }
    
    // 创建新的取消令牌
    currentPlanTokenRef.current = createCancelToken();
    
    setLoading(true);
    try {
      const response = await getCurrentPlan(currentPlanTokenRef.current);
      if (handleApiError(response)) {
        setCurrentPlan(response.data);
        
        // 如果有当前计划，立即获取今日训练详情
        if (response.data && response.data.id) {
          try {
            console.log('获取今日训练内容...');
            const todayWorkoutResponse = await getTodayWorkout(response.data.id);
            console.log('今日训练响应:', todayWorkoutResponse);
            
            if (todayWorkoutResponse.success && todayWorkoutResponse.data) {
              setTodayWorkout(todayWorkoutResponse.data);
              console.log('今日训练周期:', todayWorkoutResponse.data.weekNum, '天:', todayWorkoutResponse.data.dayNum);
            } else if (response.data.todayWorkout) {
              // 如果获取今日训练失败，使用计划中的训练信息
              console.log('使用后备训练数据');
              setTodayWorkout(response.data.todayWorkout);
            }

            // 检查今日训练是否已完成
            await checkTodayWorkoutStatus(response.data.id);
          } catch (error) {
            console.error('获取今日训练失败:', error);
            // 出错时使用计划中的训练信息作为备选
        if (response.data.todayWorkout) {
          setTodayWorkout(response.data.todayWorkout);
            }
          }
        }
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log('当前计划请求已取消:', error.message);
      } else {
        handleApiError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [checkTodayWorkoutStatus]);

  // 加载用户计划列表
  const loadUserPlans = useCallback(async (status?: number) => {
    // 取消先前的请求
    if (userPlansTokenRef.current) {
      userPlansTokenRef.current.cancel('新请求发起，取消旧请求');
    }
    
    // 创建新的取消令牌
    userPlansTokenRef.current = createCancelToken();
    
    setLoading(true);
    try {
      const response = await getUserPlans(status, current, pageSize, userPlansTokenRef.current);
      if (handleApiError(response)) {
        setUserPlans(response.data.records);
        setTotal(response.data.total);
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log('计划列表请求已取消:', error.message);
      } else {
        handleApiError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [current, pageSize]);

  // 初始化
  useEffect(() => {
    if (activeKey === 'current') {
      loadCurrentPlan();
    } else {
      const status = activeKey === 'completed' ? 2 : (activeKey === 'abandoned' ? 3 : undefined);
      loadUserPlans(status);
    }
    
    // 组件卸载时取消所有请求
    return () => {
      if (currentPlanTokenRef.current) {
        currentPlanTokenRef.current.cancel('组件卸载，取消请求');
      }
      if (userPlansTokenRef.current) {
        userPlansTokenRef.current.cancel('组件卸载，取消请求');
      }
      if (actionTokenRef.current) {
        actionTokenRef.current.cancel('组件卸载，取消请求');
      }
    };
  }, [activeKey, loadCurrentPlan, loadUserPlans]);

  // 标签切换
  const handleTabChange = (key: string) => {
    setActiveKey(key);
    setCurrent(1);
  };

  // 查看详情
  const handleViewDetail = (planId: number) => {
    navigate(`/fitness/${planId}`);
  };

  // 放弃计划
  const handleAbandonPlan = (userPlanId: number) => {
    confirm({
      title: '确认放弃',
      icon: <ExclamationCircleOutlined />,
      content: '确定要放弃这个训练计划吗？放弃后进度将无法恢复。',
      onOk: async () => {
        try {
          // 取消先前的请求
          if (actionTokenRef.current) {
            actionTokenRef.current.cancel('新请求发起，取消旧请求');
          }
          
          // 创建新的取消令牌
          actionTokenRef.current = createCancelToken();
          
          const response = await abandonPlan(userPlanId);
          if (handleApiError(response, true, '放弃计划失败')) {
            message.success('已放弃训练计划');
            if (activeKey === 'current') {
              loadCurrentPlan();
            } else {
              loadUserPlans(undefined);
            }
          }
        } catch (error: any) {
          if (axios.isCancel(error)) {
            console.log('放弃计划请求已取消:', error.message);
          } else {
            handleApiError(error, true, '放弃计划失败');
          }
        }
      }
    });
  };

  // 完成计划
  const handleCompletePlan = (userPlanId: number) => {
    confirm({
      title: '确认完成',
      icon: <ExclamationCircleOutlined />,
      content: '确定要标记此训练计划为已完成吗？',
      onOk: async () => {
        try {
          // 取消先前的请求
          if (actionTokenRef.current) {
            actionTokenRef.current.cancel('新请求发起，取消旧请求');
          }
          
          // 创建新的取消令牌
          actionTokenRef.current = createCancelToken();
          
          const response = await completePlan(userPlanId);
          if (handleApiError(response, true, '完成计划失败')) {
            message.success('恭喜你完成了训练计划！');
            if (activeKey === 'current') {
              loadCurrentPlan();
            } else {
              loadUserPlans(undefined);
            }
          }
        } catch (error: any) {
          if (axios.isCancel(error)) {
            console.log('完成计划请求已取消:', error.message);
          } else {
            handleApiError(error, true, '完成计划失败');
          }
        }
      }
    });
  };

  // 更新进度
  const handleUpdateProgress = async (userPlanId: number, completed: boolean) => {
    try {
      setLoading(true);
      console.log('调用更新进度接口:', userPlanId, completed);
      const response = await updatePlanProgress(userPlanId, completed);
      console.log('更新进度接口返回:', response);
      
      if (response.success) {
        message.success(completed ? '已标记为完成' : '已标记为未完成');
        // 标记今日训练已完成
        setTodayWorkoutCompleted(true);
        // 重新加载当前计划，获取最新进度
        loadCurrentPlan();
      } else {
        message.error(response.message || '操作失败');
      }
    } catch (error) {
      console.error('更新进度失败:', error);
      message.error('操作失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 查看今日训练
  const handleViewTodayWorkout = async () => {
    if (!currentPlan) {
      message.info('没有进行中的训练计划');
      return;
    }
    
    try {
      setLoading(true);
      const response = await getTodayWorkout(currentPlan.id);
      console.log('获取今日训练响应:', response);
      
      if (response.success) {
        // 保存今日训练数据
        setTodayWorkout(response.data);
        setTodayWorkoutVisible(true);
        
        // 显示今日实际对应的周/天信息
        if (response.data) {
          const todayWeek = response.data.weekNum;
          const todayDay = response.data.dayNum;
          console.log(`今日训练: 第${todayWeek}周 第${todayDay}天`);
          
          // 如果当前进度与实际日期不符，可以提示用户
          if (currentPlan.currentWeek !== todayWeek || currentPlan.currentDay !== todayDay) {
            message.info(`今天是计划的第${todayWeek}周 第${todayDay}天，与当前进度不同`);
          }
        }
      } else {
        // 后备方案：使用currentPlan中的todayWorkout
        if (currentPlan?.todayWorkout) {
          setTodayWorkout(currentPlan.todayWorkout);
          setTodayWorkoutVisible(true);
        } else {
          message.info('今日没有训练安排');
        }
      }
    } catch (error) {
      console.error('获取今日训练失败:', error);
      // 后备方案
    if (currentPlan?.todayWorkout) {
      setTodayWorkout(currentPlan.todayWorkout);
      setTodayWorkoutVisible(true);
    } else {
      message.info('今日没有训练安排');
      }
    } finally {
      setLoading(false);
    }
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    } catch (error) {
      return dateStr;
    }
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

  // 获取状态颜色
  const getStatusColor = (status?: number): string => {
    switch (status) {
      case 1: return 'processing';
      case 2: return 'success';
      case 3: return 'error';
      default: return 'default';
    }
  };

  // 当前计划视图
  const renderCurrentPlan = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      );
    }

    if (!currentPlan) {
      return (
        <Empty 
          description="你还没有进行中的训练计划" 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button 
            type="primary" 
            onClick={() => navigate('/fitness')}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            去选择训练计划
          </Button>
        </Empty>
      );
    }

    return (
      <Card bordered={false}>
        <Row gutter={[24, 16]}>
          <Col xs={24} md={16}>
            <div 
              style={{ 
                height: 200, 
                background: '#f0f2f5', 
                marginBottom: 16, 
                borderRadius: 8,
                backgroundImage: currentPlan.plan?.coverImg ? `url(${currentPlan.plan.coverImg})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '16px'
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
                <h2 style={{ color: 'white', margin: 0 }}>{currentPlan.plan?.name}</h2>
                <div style={{ marginTop: 8 }}>
                  <Tag color={getGoalColor(currentPlan.plan?.fitnessGoal)}>{currentPlan.plan?.fitnessGoalText}</Tag>
                  <Tag color={getDifficultyColor(currentPlan.plan?.difficulty)}>{currentPlan.plan?.difficultyText}</Tag>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Progress 
                percent={parseFloat(currentPlan.progressPercent || '0')} 
                status="active" 
                strokeColor="#52c41a"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span>
                  <ClockCircleOutlined /> 进度: 第{currentPlan.currentWeek}周 第{currentPlan.currentDay}天
                </span>
                <span>
                  {currentPlan.progressPercent}
                </span>
              </div>
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <Statistic 
                  title="开始日期" 
                  value={formatDate(currentPlan.startDate)}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="结束日期" 
                  value={formatDate(currentPlan.endDate)}
                  prefix={<CalendarOutlined />}
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
            </Row>

            <Divider />

            <div style={{ marginBottom: 16 }}>
              <h3>今日训练</h3>
              {todayWorkout ? (
                <Card
                  hoverable
                  onClick={handleViewTodayWorkout}
                  style={{ marginBottom: 16 }}
                >
                  <Row align="middle" gutter={16}>
                    <Col xs={24} sm={16}>
                      <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                        {todayWorkout.title}
                      </div>
                      <div style={{ color: '#666' }}>
                        {todayWorkout.description}
                      </div>
                    </Col>
                    <Col xs={24} sm={8} style={{ textAlign: 'right' }}>
                      <Button 
                        type="primary" 
                        icon={<PlayCircleOutlined />}
                        style={{ background: '#52c41a', borderColor: '#52c41a' }}
                        onClick={(e) => {
                          e.stopPropagation(); // 阻止事件冒泡，避免触发卡片的点击事件
                          if (todayWorkout?.course?.id) {
                            navigate(`/fitness/courses/${todayWorkout.course.id}`);
                          } else {
                            handleViewTodayWorkout();
                          }
                        }}
                      >
                        开始训练
                      </Button>
                    </Col>
                  </Row>
                </Card>
              ) : (
                <Empty description="今日无训练安排" />
              )}
            </div>
          </Col>

          <Col xs={24} md={8}>
            <Card title="训练计划操作" bordered={false}>
              <div style={{ marginBottom: 16 }}>
                <Button 
                  type="primary" 
                  block 
                  icon={<CheckCircleOutlined />} 
                  onClick={() => {
                    Modal.confirm({
                      title: '确认完成训练',
                      content: <>
                        <p>标记完成后，训练进度会更新到下一天。</p>
                        <p>请确保您已完成今天的训练内容。</p>
                      </>,
                      onOk: () => {
                        if (currentPlan) {
                          handleUpdateProgress(currentPlan.id, true);
                        }
                      }
                    });
                  }}
                  disabled={!currentPlan || !todayWorkout || todayWorkoutCompleted}
                  loading={loading}
                  style={{ marginBottom: 12, background: '#52c41a', borderColor: '#52c41a' }}
                >
                  {todayWorkoutCompleted ? '今日训练已完成' : '标记今日训练已完成'}
                </Button>
                <Button 
                  block 
                  icon={<DashboardOutlined />}
                  onClick={() => handleViewDetail(currentPlan.plan.id)}
                  style={{ marginBottom: 12 }}
                >
                  查看计划详情
                </Button>
                <Button 
                  block 
                  icon={<TrophyOutlined />}
                  onClick={() => handleCompletePlan(currentPlan.id)}
                  style={{ marginBottom: 12 }}
                >
                  标记全部完成
                </Button>
                <Button 
                  block 
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleAbandonPlan(currentPlan.id)}
                >
                  放弃此计划
                </Button>
              </div>
            </Card>

            {currentPlan.plan?.bodyFocus && (
              <Card title="主要锻炼部位" bordered={false} style={{ marginTop: 16 }}>
                <div>
                  {currentPlan.plan.bodyFocus.split(',').map((part, index) => (
                    <Tag key={index} style={{ margin: '0 8px 8px 0' }}>{part.trim()}</Tag>
                  ))}
                </div>
              </Card>
            )}

            {currentPlan.plan?.equipmentNeeded && (
              <Card title="所需器材" bordered={false} style={{ marginTop: 16 }}>
                <div>
                  {currentPlan.plan.equipmentNeeded.split(',').map((item, index) => (
                    <Tag key={index} style={{ margin: '0 8px 8px 0' }}>{item.trim()}</Tag>
                  ))}
                </div>
              </Card>
            )}
          </Col>
        </Row>
      </Card>
    );
  };

  // 列表视图
  const renderPlanList = () => {
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      );
    }

    if (userPlans.length === 0) {
      return (
        <Empty 
          description={`没有${activeKey === 'completed' ? '已完成' : '已放弃'}的训练计划`} 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      );
    }

    return (
      <List
        itemLayout="vertical"
        dataSource={userPlans}
        pagination={{
          current,
          pageSize,
          total,
          onChange: (page) => setCurrent(page),
          showSizeChanger: false
        }}
        renderItem={(plan) => (
          <List.Item
            key={plan.id}
            actions={[
              <Button 
                type="link" 
                key="detail"
                onClick={() => handleViewDetail(plan.plan.id)}
              >
                查看详情
              </Button>
            ]}
          >
            <List.Item.Meta
              title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{plan.plan.name}</span>
                  <Tag color={getStatusColor(plan.status)}>{plan.statusText}</Tag>
                </div>
              }
              description={
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <Tag color={getGoalColor(plan.plan.fitnessGoal)}>{plan.plan.fitnessGoalText}</Tag>
                    <Tag color={getDifficultyColor(plan.plan.difficulty)}>{plan.plan.difficultyText}</Tag>
                    <Tag icon={<ClockCircleOutlined />}>
                      {plan.plan.durationWeeks}周 {plan.plan.sessionsPerWeek}次/周
                    </Tag>
                  </div>
                  <div>
                    <div><CalendarOutlined /> 开始时间: {formatDate(plan.startDate)}</div>
                    <div><CalendarOutlined /> 结束时间: {formatDate(plan.endDate)}</div>
                    <div><HistoryOutlined /> 完成进度: {plan.progressPercent}</div>
                  </div>
                </div>
              }
            />
          </List.Item>
        )}
      />
    );
  };

  return (
    <div className="user-plans">
      <Card 
        title="我的训练计划" 
        bordered={false}
        bodyStyle={{ padding: isMobile ? 12 : 24 }}
      >
        <Tabs 
          activeKey={activeKey} 
          onChange={handleTabChange}
          centered={isMobile}
        >
          <TabPane tab="进行中" key="current" />
          <TabPane tab="已完成" key="completed" />
          <TabPane tab="已放弃" key="abandoned" />
        </Tabs>

        {activeKey === 'current' ? renderCurrentPlan() : renderPlanList()}
      </Card>

      <Modal
        title="今日训练详情"
        open={todayWorkoutVisible}
        onCancel={() => setTodayWorkoutVisible(false)}
        footer={[
          <Button key="back" onClick={() => setTodayWorkoutVisible(false)}>
            关闭
          </Button>,
          <Button 
            key="complete" 
            type="primary" 
            loading={loading}
            disabled={todayWorkoutCompleted}
            style={{ background: '#52c41a', borderColor: '#52c41a', marginRight: 8 }}
            onClick={() => {
              if (currentPlan) {
                handleUpdateProgress(currentPlan.id, true);
              }
            }}
          >
            {todayWorkoutCompleted ? '今日训练已完成' : '标记完成'}
          </Button>,
          <Button 
            key="start" 
            type="primary" 
            style={{ background: '#1890ff', borderColor: '#1890ff' }}
            onClick={() => {
              setTodayWorkoutVisible(false);
              if (todayWorkout?.course?.id) {
                navigate(`/fitness/courses/${todayWorkout.course.id}`);
              }
            }}
            disabled={!todayWorkout?.course?.id}
          >
            开始训练
          </Button>,
        ]}
        width={700}
      >
        {todayWorkout ? (
          <div>
            <h3>{todayWorkout.title}</h3>
            <p>{todayWorkout.description}</p>
            
            {todayWorkout.course && (
              <Card
                hoverable
                style={{ marginTop: 16 }}
                cover={
                  todayWorkout.course.coverImg ? (
                    <img 
                      alt={todayWorkout.course.title} 
                      src={todayWorkout.course.coverImg}
                      style={{ height: 200, objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ height: 200, background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <PlayCircleOutlined style={{ fontSize: 40, color: '#52c41a' }} />
                    </div>
                  )
                }
              >
                <Card.Meta
                  title={todayWorkout.course.title}
                  description={
                    <>
                      <div style={{ marginBottom: 8 }}>
                        <Tag color={getGoalColor(todayWorkout.course.fitnessGoal)}>{todayWorkout.course.fitnessGoalText}</Tag>
                        <Tag color={getDifficultyColor(todayWorkout.course.difficulty)}>{todayWorkout.course.difficultyText}</Tag>
                        <Tag icon={<ClockCircleOutlined />}>{todayWorkout.course.duration} 分钟</Tag>
                      </div>
                      <div>{todayWorkout.course.description}</div>
                    </>
                  }
                />
              </Card>
            )}
          </div>
        ) : (
          <Empty description="没有训练详情" />
        )}
      </Modal>
    </div>
  );
};

export default UserPlans; 