import { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Progress, Statistic, Table, Tag, Button, Typography, Divider, Skeleton, Empty, message } from 'antd';
import { FireOutlined, CalendarOutlined, CheckCircleOutlined, LineChartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios, { CancelTokenSource } from 'axios';
import { createCancelToken } from '@/utils/request';

const { Title, Paragraph } = Typography;

// 模拟的饮食计划数据类型
interface MealPlan {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  dailyCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  progress: number;
  status: 'active' | 'completed' | 'paused';
}

// 模拟的每日饮食记录类型
interface DailyMealRecord {
  id: number;
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: {
    mealType: string;
    foods: {
      name: string;
      amount: number;
      unit: string;
      calories: number;
    }[];
  }[];
  completed: boolean;
}

// 模拟数据 - 实际应用中应该从API获取
const mockMealPlan: MealPlan = {
  id: 1,
  name: '减脂饮食计划',
  startDate: '2023-06-01',
  endDate: '2023-07-01',
  dailyCalories: 2000,
  protein: 150,
  carbs: 200,
  fat: 60,
  progress: 78,
  status: 'active'
};

// 模拟每日记录数据
const mockDailyRecords: DailyMealRecord[] = [
  {
    id: 1,
    date: '2023-06-15',
    totalCalories: 1850,
    totalProtein: 140,
    totalCarbs: 180,
    totalFat: 55,
    meals: [
      {
        mealType: '早餐',
        foods: [
          { name: '全麦面包', amount: 2, unit: '片', calories: 160 },
          { name: '鸡蛋', amount: 2, unit: '个', calories: 140 },
          { name: '牛奶', amount: 1, unit: '杯', calories: 120 }
        ]
      },
      {
        mealType: '午餐',
        foods: [
          { name: '糙米饭', amount: 1, unit: '碗', calories: 200 },
          { name: '鸡胸肉', amount: 100, unit: '克', calories: 165 },
          { name: '西兰花', amount: 100, unit: '克', calories: 55 }
        ]
      }
    ],
    completed: true
  },
  {
    id: 2,
    date: '2023-06-14',
    totalCalories: 1920,
    totalProtein: 145,
    totalCarbs: 190,
    totalFat: 58,
    meals: [
      {
        mealType: '早餐',
        foods: [
          { name: '燕麦粥', amount: 1, unit: '碗', calories: 150 },
          { name: '香蕉', amount: 1, unit: '个', calories: 105 }
        ]
      },
      {
        mealType: '午餐',
        foods: [
          { name: '意面', amount: 1, unit: '份', calories: 320 },
          { name: '牛肉', amount: 100, unit: '克', calories: 250 }
        ]
      }
    ],
    completed: true
  }
];

const MealPlans = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<MealPlan | null>(null);
  const [dailyRecords, setDailyRecords] = useState<DailyMealRecord[]>([]);
  
  // 请求令牌引用
  const planTokenRef = useRef<CancelTokenSource | null>(null);
  const recordsTokenRef = useRef<CancelTokenSource | null>(null);
  
  // 获取饮食计划数据
  const fetchMealPlanData = async () => {
    try {
      setLoading(true);
      
      // 取消之前的请求
      if (planTokenRef.current) {
        planTokenRef.current.cancel('新请求取消之前的请求');
      }
      if (recordsTokenRef.current) {
        recordsTokenRef.current.cancel('新请求取消之前的请求');
      }
      
      // 创建新的取消令牌
      planTokenRef.current = createCancelToken();
      recordsTokenRef.current = createCancelToken();
      
      // 模拟API请求延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 设置模拟数据
      setCurrentPlan(mockMealPlan);
      setDailyRecords(mockDailyRecords);
      
      // 实际应用中应该从API获取数据
      // const planRes = await getMealPlan(planTokenRef.current);
      // if (planRes.code === 200 && planRes.data) {
      //   setCurrentPlan(planRes.data);
      // }
      
      // const recordsRes = await getDailyMealRecords(recordsTokenRef.current);
      // if (recordsRes.code === 200 && recordsRes.data) {
      //   setDailyRecords(recordsRes.data);
      // }
      
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('请求已取消', error.message);
      } else {
        console.error('获取饮食计划数据失败', error);
        message.error('获取数据失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // 获取饮食计划数据
    fetchMealPlanData();
    
    // 组件卸载时取消所有请求
    return () => {
      if (planTokenRef.current) planTokenRef.current.cancel('组件卸载');
      if (recordsTokenRef.current) recordsTokenRef.current.cancel('组件卸载');
    };
  }, []);
  
  // 获取状态标签颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'green';
      case 'completed':
        return 'blue';
      case 'paused':
        return 'orange';
      default:
        return 'default';
    }
  };
  
  // 获取状态显示文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '进行中';
      case 'completed':
        return '已完成';
      case 'paused':
        return '已暂停';
      default:
        return '未知';
    }
  };
  
  // 记录表格列定义
  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => {
        const date = new Date(text);
        return `${date.getMonth() + 1}月${date.getDate()}日`;
      }
    },
    {
      title: '热量',
      dataIndex: 'totalCalories',
      key: 'totalCalories',
      render: (text: number) => `${text} 千卡`
    },
    {
      title: '蛋白质',
      dataIndex: 'totalProtein',
      key: 'totalProtein',
      render: (text: number) => `${text}g`
    },
    {
      title: '碳水',
      dataIndex: 'totalCarbs',
      key: 'totalCarbs',
      render: (text: number) => `${text}g`
    },
    {
      title: '脂肪',
      dataIndex: 'totalFat',
      key: 'totalFat',
      render: (text: number) => `${text}g`
    },
    {
      title: '状态',
      dataIndex: 'completed',
      key: 'completed',
      render: (completed: boolean) => (
        <Tag color={completed ? 'green' : 'orange'}>
          {completed ? '已完成' : '未完成'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: DailyMealRecord) => (
        <Button type="link" size="small" onClick={() => navigate(`/diet/daily-record/${record.id}`)}>
          查看详情
        </Button>
      )
    }
  ];
  
  return (
    <div className="meal-plans-page">
      <Title level={2}>饮食计划</Title>
      <Paragraph>查看和管理您的饮食计划和每日记录</Paragraph>
      
      <Card loading={loading} title="当前饮食计划" bordered={false}>
        {currentPlan ? (
          <>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <Card bordered={false}>
                  <Statistic
                    title="每日目标热量"
                    value={currentPlan.dailyCalories}
                    suffix="千卡"
                    prefix={<FireOutlined style={{ color: '#ff4d4f' }} />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card bordered={false}>
                  <Statistic
                    title="计划进度"
                    value={currentPlan.progress}
                    suffix="%"
                    prefix={<LineChartOutlined style={{ color: '#1890ff' }} />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card bordered={false}>
                  <Statistic
                    title="计划状态"
                    value={getStatusText(currentPlan.status)}
                    prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div>
                  <h3>计划详情</h3>
                  <p><strong>计划名称:</strong> {currentPlan.name}</p>
                  <p><strong>开始日期:</strong> {currentPlan.startDate}</p>
                  <p><strong>结束日期:</strong> {currentPlan.endDate}</p>
                  <p><strong>状态:</strong> <Tag color={getStatusColor(currentPlan.status)}>{getStatusText(currentPlan.status)}</Tag></p>
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div>
                  <h3>每日营养目标</h3>
                  <p><strong>热量:</strong> {currentPlan.dailyCalories} 千卡</p>
                  <p><strong>蛋白质:</strong> {currentPlan.protein}g ({Math.round(currentPlan.protein * 4 / currentPlan.dailyCalories * 100)}%)</p>
                  <p><strong>碳水化合物:</strong> {currentPlan.carbs}g ({Math.round(currentPlan.carbs * 4 / currentPlan.dailyCalories * 100)}%)</p>
                  <p><strong>脂肪:</strong> {currentPlan.fat}g ({Math.round(currentPlan.fat * 9 / currentPlan.dailyCalories * 100)}%)</p>
                </div>
              </Col>
            </Row>
            
            <Divider />
            
            <div>
              <h3>计划进度</h3>
              <Progress 
                percent={currentPlan.progress} 
                status="active" 
                strokeColor="#1890ff"
                strokeWidth={10}
              />
            </div>
          </>
        ) : (
          <Empty
            description="您还没有饮食计划"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => navigate('/diet/create-plan')}>
              创建饮食计划
            </Button>
          </Empty>
        )}
      </Card>
      
      <Card 
        title="每日饮食记录" 
        style={{ marginTop: 16 }} 
        bordered={false}
        loading={loading}
      >
        <Table 
          dataSource={dailyRecords} 
          columns={columns} 
          rowKey="id"
          pagination={{ pageSize: 7 }}
        />
      </Card>
      
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
        <Button type="primary" onClick={() => navigate('/diet/record-meal')}>
          记录今日饮食
        </Button>
      </div>
    </div>
  );
};

export default MealPlans; 