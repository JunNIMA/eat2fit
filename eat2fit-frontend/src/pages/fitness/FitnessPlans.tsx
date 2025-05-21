import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Button, Row, Col, Input, Select, Empty, Spin, message, Tabs, Divider } from 'antd';
import { 
  SearchOutlined, 
  FilterOutlined, 
  VideoCameraOutlined, 
  RightOutlined,
  CalendarOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getPlans, getRecommendPlans, Plan, QueryParams } from '@/api/fitness';

const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;

const FitnessPlans: React.FC = () => {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [recommendLoading, setRecommendLoading] = useState<boolean>(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [recommendPlans, setRecommendPlans] = useState<Plan[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [current, setCurrent] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 加载训练计划列表
  const loadPlans = async () => {
    setLoading(true);
    try {
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

      const response = await getPlans(params);
      if (response.success) {
        setPlans(response.data.records);
        setTotal(response.data.total);
      } else {
        message.error(response.message || '获取训练计划列表失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 加载推荐计划
  const loadRecommendPlans = async () => {
    setRecommendLoading(true);
    try {
      const response = await getRecommendPlans(4);
      if (response.success) {
        setRecommendPlans(response.data);
      }
    } catch (error) {
      console.error('获取推荐计划失败', error);
    } finally {
      setRecommendLoading(false);
    }
  };

  // 初始加载和筛选条件变化时加载数据
  useEffect(() => {
    loadPlans();
  }, [current, pageSize, activeTab, filterLevel, searchTerm]);

  // 初始加载推荐计划
  useEffect(() => {
    loadRecommendPlans();
  }, []);
  
  // 查看计划详情
  const handleViewDetail = (id: number) => {
    navigate(`/fitness/${id}`);
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
            onClick={() => handleViewDetail(plan.id)}
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
                type="primary" 
                onClick={() => handleViewDetail(plan.id)}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                查看详情
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

  // 渲染推荐计划
  const renderRecommendPlans = () => {
    if (recommendLoading) {
      return (
        <div style={{ textAlign: 'center', padding: 16 }}>
          <Spin size="small" />
        </div>
      );
    }

    if (recommendPlans.length === 0) {
      return null;
    }

    return (
      <Card 
        title="推荐训练计划" 
        bordered={false} 
        style={{ marginBottom: 16 }}
        bodyStyle={{ padding: 16 }}
      >
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
          dataSource={recommendPlans}
          renderItem={(plan) => (
            <List.Item>
              <Card
                hoverable
                size="small"
                cover={
                  <div style={{ 
                    height: 100, 
                    background: '#f0f2f5',
                    backgroundImage: plan.coverImg ? `url(${plan.coverImg})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}>
                    {!plan.coverImg && <VideoCameraOutlined style={{ fontSize: 24, color: '#52c41a' }} />}
                  </div>
                }
                onClick={() => handleViewDetail(plan.id)}
              >
                <Card.Meta
                  title={
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      {plan.name}
                    </div>
                  }
                  description={
                    <div>
                      <Tag color={getGoalColor(plan.fitnessGoal)} style={{ fontSize: '12px' }}>{plan.fitnessGoalText}</Tag>
                      <Tag color={getDifficultyColor(plan.difficulty)} style={{ fontSize: '12px' }}>{plan.difficultyText}</Tag>
                    </div>
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </Card>
    );
  };
  
  return (
    <div className="fitness-plans-page">
      {/* 推荐计划区域 */}
      {renderRecommendPlans()}
      
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

export default FitnessPlans; 