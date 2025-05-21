import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  Card, 
  List, 
  Tag, 
  Button, 
  Row, 
  Col, 
  Input, 
  Select, 
  Tabs, 
  Empty, 
  Spin, 
  message, 
  Modal,
  Space
} from 'antd';
import { 
  SearchOutlined, 
  ClockCircleOutlined, 
  VideoCameraOutlined, 
  RightOutlined, 
  CalendarOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getPlans, Plan, QueryParams, choosePlan } from '@/api/fitness';
import { handleApiError, handlePlanSelectionError } from '@/utils/errorHandler';
import { createCancelToken } from '@/utils/request';
import axios, { CancelTokenSource } from 'axios';

const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;
const { confirm } = Modal;

const PlanList: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [current, setCurrent] = useState<number>(1);
  const [pageSize] = useState<number>(8);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);

  // 用于取消API请求的令牌
  const plansTokenRef = useRef<CancelTokenSource | null>(null);
  const choosePlanTokenRef = useRef<CancelTokenSource | null>(null);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 加载训练计划列表
  const loadPlans = useCallback(async () => {
    try {
      // 取消上一个未完成的请求
      if (plansTokenRef.current) {
        plansTokenRef.current.cancel('新请求发起，取消旧请求');
      }
      
      // 创建新的取消令牌
      plansTokenRef.current = createCancelToken();
      
      setLoading(true);
      const params: QueryParams = {
        current,
        size: pageSize,
        keyword: searchTerm || undefined
      };

      // 设置筛选参数
      if (filterLevel !== 'all') {
        params.difficulty = parseInt(filterLevel);
      }
      
      if (activeTab !== 'all') {
        params.fitnessGoal = parseInt(activeTab);
      }

      const response = await getPlans(params, plansTokenRef.current);
      if (response.success) {
        setPlans(response.data.records);
        setTotal(response.data.total);
      } else {
        message.error(response.message || '获取训练计划列表失败');
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('训练计划列表请求已取消:', error.message);
      } else {
        console.error('获取训练计划列表出错:', error);
        message.error('网络错误，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  }, [current, pageSize, activeTab, filterLevel, searchTerm]);

  // 初始加载数据
  useEffect(() => {
    loadPlans();
    
    // 组件卸载时取消未完成的请求
    return () => {
      if (plansTokenRef.current) {
        plansTokenRef.current.cancel('组件卸载，取消请求');
      }
      if (choosePlanTokenRef.current) {
        choosePlanTokenRef.current.cancel('组件卸载，取消请求');
      }
    };
  }, [loadPlans]);

  // 查看计划详情
  const handleViewDetail = (id: number) => {
    navigate(`/fitness/${id}`);
  };

  // 选择计划
  const handleChoosePlan = async (id: number) => {
    confirm({
      title: '选择训练计划',
      icon: <ExclamationCircleOutlined />,
      content: '确定要选择这个训练计划吗？开始后将会安排每天的训练内容。',
      onOk: async () => {
        try {
          // 取消上一个未完成的请求
          if (choosePlanTokenRef.current) {
            choosePlanTokenRef.current.cancel('新请求发起，取消旧请求');
          }
          
          // 创建新的取消令牌
          choosePlanTokenRef.current = createCancelToken();
          
          const response = await choosePlan(id, choosePlanTokenRef.current);
          if (handleApiError(response, true, '已有进行中的计划，请先完成或放弃当前计划')) {
            message.success('计划选择成功，现在可以开始训练了！');
            navigate('/fitness/myplans');
          }
        } catch (error: any) {
          if (axios.isCancel(error)) {
            console.log('选择计划请求已取消:', error.message);
            return; // 取消的请求直接返回，不显示错误
          } else if (!handlePlanSelectionError(error)) {
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

  // 移动端显示方式
  const renderMobileList = () => (
    <List
      dataSource={plans}
      pagination={{
        current,
        pageSize,
        total,
        onChange: (page) => setCurrent(page),
        showSizeChanger: false
      }}
      renderItem={plan => (
        <List.Item 
          style={{ padding: 0, marginBottom: 8 }}
        >
          <Card
            bodyStyle={{ padding: 12 }}
            style={{ width: '100%' }}
            actions={[
              <Button type="link" onClick={() => handleViewDetail(plan.id)}>查看详情</Button>,
              <Button type="link" onClick={() => handleChoosePlan(plan.id)}>选择计划</Button>
            ]}
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
                backgroundImage: plan.coverImg ? `url(${plan.coverImg})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} />
              <div style={{ flex: 1, marginLeft: 12 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                  {plan.name}
                </div>
                <div style={{ display: 'flex', marginBottom: 4 }}>
                  <Tag color={getGoalColor(plan.fitnessGoal)} style={{ margin: 0, marginRight: 4 }}>{plan.fitnessGoalText}</Tag>
                  <Tag color={getDifficultyColor(plan.difficulty)} style={{ margin: 0 }}>{plan.difficultyText}</Tag>
                </div>
                <div style={{ color: '#999', fontSize: '0.8rem' }}>
                  <span style={{ marginRight: 8 }}><ClockCircleOutlined /> {plan.durationWeeks}周计划</span>
                  <span><CalendarOutlined /> 每周{plan.sessionsPerWeek}次</span>
                </div>
              </div>
            </div>
          </Card>
        </List.Item>
      )}
    />
  );
  
  // 桌面端显示方式
  const renderDesktopList = () => (
    <List
      grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 4 }}
      dataSource={plans}
      pagination={{
        current,
        pageSize,
        total,
        onChange: (page) => setCurrent(page),
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`
      }}
      renderItem={plan => (
        <List.Item>
          <Card
            hoverable
            cover={
              <div style={{ 
                height: 160, 
                background: '#f0f2f5', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundImage: plan.coverImg ? `url(${plan.coverImg})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                {!plan.coverImg && <VideoCameraOutlined style={{ fontSize: 40, color: '#52c41a' }} />}
              </div>
            }
            actions={[
              <Button 
                key="view"
                type="link" 
                onClick={() => handleViewDetail(plan.id)}
              >
                查看详情
              </Button>,
              <Button 
                key="choose"
                type="primary" 
                onClick={() => handleChoosePlan(plan.id)}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                选择计划
              </Button>
            ]}
          >
            <Card.Meta
              title={plan.name}
              description={
                <>
                  <div style={{ marginBottom: 8 }}>
                    <Tag color={getGoalColor(plan.fitnessGoal)}>{plan.fitnessGoalText}</Tag>
                    <Tag color={getDifficultyColor(plan.difficulty)}>{plan.difficultyText}</Tag>
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ marginRight: 8 }}><ClockCircleOutlined /> {plan.durationWeeks}周计划</span>
                    <span><CalendarOutlined /> 每周{plan.sessionsPerWeek}次</span>
                  </div>
                  <div>{plan.description.substring(0, 60)}{plan.description.length > 60 ? '...' : ''}</div>
                </>
              }
            />
          </Card>
        </List.Item>
      )}
    />
  );

  return (
    <div className="plan-list">
      <Card 
        title="训练计划列表" 
        bordered={false}
        bodyStyle={{ padding: isMobile ? 12 : 24 }}
      >
        {/* 搜索和筛选区域 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12}>
            <Search
              placeholder="搜索计划名称或描述"
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={value => setSearchTerm(value)}
            />
          </Col>
          <Col xs={24} md={12}>
            <Select
              style={{ width: '100%' }}
              placeholder="按难度筛选"
              defaultValue="all"
              onChange={value => setFilterLevel(value)}
            >
              <Option value="all">所有难度</Option>
              <Option value="1">初级</Option>
              <Option value="2">中级</Option>
              <Option value="3">高级</Option>
            </Select>
          </Col>
        </Row>
        
        {/* 标签页导航 */}
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          style={{ marginBottom: 16 }}
          centered={isMobile}
        >
          <TabPane tab="全部" key="all" />
          <TabPane tab="增肌" key="1" />
          <TabPane tab="减脂" key="2" />
          <TabPane tab="塑形" key="3" />
          <TabPane tab="维持" key="4" />
        </Tabs>
        
        {/* 计划列表 */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <Spin size="large" />
          </div>
        ) : plans.length > 0 ? (
          isMobile ? renderMobileList() : renderDesktopList()
        ) : (
          <Empty description="没有找到匹配的训练计划" />
        )}
      </Card>
    </div>
  );
};

export default PlanList; 