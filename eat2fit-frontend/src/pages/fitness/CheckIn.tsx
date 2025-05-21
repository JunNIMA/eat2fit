import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  Card, 
  Tabs, 
  Form, 
  Input, 
  InputNumber, 
  DatePicker, 
  Select, 
  Button, 
  List, 
  Table, 
  Tag, 
  Row, 
  Col, 
  Statistic, 
  Divider, 
  Empty, 
  Spin, 
  message, 
  Modal,
  Upload,
  Space
} from 'antd';
import { 
  ClockCircleOutlined, 
  CalendarOutlined, 
  FireOutlined, 
  CheckCircleOutlined,
  PlusOutlined, 
  UploadOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { 
  checkIn, 
  getCheckInList, 
  getCheckInStats, 
  hasCheckedInToday, 
  CheckIn as CheckInType,
  getCurrentPlan
} from '@/api/fitness';
import { handleApiError } from '@/utils/errorHandler';
import { createCancelToken } from '@/utils/request';
import axios, { CancelTokenSource } from 'axios';
import type { UploadProps } from 'antd';

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

// 感受枚举
const FEELING_OPTIONS = [
  { value: 1, label: '非常轻松' },
  { value: 2, label: '轻松' },
  { value: 3, label: '适中' },
  { value: 4, label: '疲惫' },
  { value: 5, label: '非常疲惫' },
];

const CheckInPage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState<string>('form');
  const [loading, setLoading] = useState<boolean>(false);
  const [checkInLoading, setCheckInLoading] = useState<boolean>(false);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [checkInRecords, setCheckInRecords] = useState<CheckInType[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [current, setCurrent] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [stats, setStats] = useState<{
    totalCount: number;
    thisWeekCount: number;
    thisMonthCount: number;
    continuousCount: number;
    totalCalories: number;
    totalDuration: number;
  } | null>(null);
  const [userPlanId, setUserPlanId] = useState<number | null>(null);
  const [todayChecked, setTodayChecked] = useState<boolean>(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  
  // 用于取消API请求的令牌
  const currentPlanTokenRef = useRef<CancelTokenSource | null>(null);
  const checkInListTokenRef = useRef<CancelTokenSource | null>(null);
  const statsTokenRef = useRef<CancelTokenSource | null>(null);
  const checkStatusTokenRef = useRef<CancelTokenSource | null>(null);
  const submitTokenRef = useRef<CancelTokenSource | null>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 加载当前计划
  useEffect(() => {
    const loadCurrentPlan = async () => {
      try {
        // 取消先前的请求
        if (currentPlanTokenRef.current) {
          currentPlanTokenRef.current.cancel('新请求发起，取消旧请求');
        }
        
        // 创建新的取消令牌
        currentPlanTokenRef.current = createCancelToken();
        
        const response = await getCurrentPlan(currentPlanTokenRef.current);
        if (response.success && response.data) {
          setUserPlanId(response.data.id);
          form.setFieldValue('userPlanId', response.data.id);
          
          // 在表单中预填课程ID
          if (response.data.todayWorkout?.courseId) {
            form.setFieldValue('courseId', response.data.todayWorkout.courseId);
          }
          
          // 检查今日是否已打卡
          checkTodayStatus(response.data.id);
        }
      } catch (error: any) {
        if (axios.isCancel(error)) {
          console.log('获取当前计划请求已取消:', error.message);
        } else {
          console.error('获取当前计划失败', error);
        }
      }
    };
    
    loadCurrentPlan();
    
    // 组件卸载时取消请求
    return () => {
      if (currentPlanTokenRef.current) {
        currentPlanTokenRef.current.cancel('组件卸载，取消请求');
      }
    };
  }, [form]);

  // 检查今日是否已打卡
  const checkTodayStatus = useCallback(async (planId: number) => {
    try {
      // 取消先前的请求
      if (checkStatusTokenRef.current) {
        checkStatusTokenRef.current.cancel('新请求发起，取消旧请求');
      }
      
      // 创建新的取消令牌
      checkStatusTokenRef.current = createCancelToken();
      
      const response = await hasCheckedInToday(planId, checkStatusTokenRef.current);
      if (response.success) {
        setTodayChecked(response.data);
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log('检查打卡状态请求已取消:', error.message);
      } else {
        console.error('检查打卡状态失败', error);
      }
    }
  }, []);

  // 加载打卡记录
  const loadCheckInRecords = useCallback(async () => {
    // 取消先前的请求
    if (checkInListTokenRef.current) {
      checkInListTokenRef.current.cancel('新请求发起，取消旧请求');
    }
    
    // 创建新的取消令牌
    checkInListTokenRef.current = createCancelToken();
    
    setLoading(true);
    try {
      const startDate = dateRange ? dateRange[0] : undefined;
      const endDate = dateRange ? dateRange[1] : undefined;
      
      const response = await getCheckInList(startDate, endDate, current, pageSize, checkInListTokenRef.current);
      if (response.success) {
        setCheckInRecords(response.data.records);
        setTotal(response.data.total);
      } else {
        message.error(response.message || '获取打卡记录失败');
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log('获取打卡记录请求已取消:', error.message);
      } else {
        message.error('获取打卡记录失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  }, [current, pageSize, dateRange]);

  // 加载打卡统计
  const loadCheckInStats = useCallback(async () => {
    // 取消先前的请求
    if (statsTokenRef.current) {
      statsTokenRef.current.cancel('新请求发起，取消旧请求');
    }
    
    // 创建新的取消令牌
    statsTokenRef.current = createCancelToken();
    
    setStatsLoading(true);
    try {
      const response = await getCheckInStats(statsTokenRef.current);
      if (response.success) {
        setStats(response.data);
      } else {
        message.error(response.message || '获取打卡统计失败');
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log('获取打卡统计请求已取消:', error.message);
      } else {
        message.error('获取打卡统计失败，请稍后重试');
      }
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // 初始加载打卡记录
  useEffect(() => {
    if (activeTab === 'list') {
      loadCheckInRecords();
    } else if (activeTab === 'stats') {
      loadCheckInStats();
    }
    
    // 组件卸载时取消所有请求
    return () => {
      if (checkInListTokenRef.current) {
        checkInListTokenRef.current.cancel('组件卸载，取消请求');
      }
      if (statsTokenRef.current) {
        statsTokenRef.current.cancel('组件卸载，取消请求');
      }
      if (checkStatusTokenRef.current) {
        checkStatusTokenRef.current.cancel('组件卸载，取消请求');
      }
      if (submitTokenRef.current) {
        submitTokenRef.current.cancel('组件卸载，取消请求');
      }
    };
  }, [activeTab, loadCheckInRecords, loadCheckInStats]);

  // 提交打卡
  const handleSubmit = async (values: any) => {
    // 如果今日已打卡，提示并返回
    if (todayChecked) {
      message.info('今日已完成打卡');
      return;
    }
    
    // 取消先前的请求
    if (submitTokenRef.current) {
      submitTokenRef.current.cancel('新请求发起，取消旧请求');
    }
    
    // 创建新的取消令牌
    submitTokenRef.current = createCancelToken();
    
    setCheckInLoading(true);
    try {
      // 拼接图片路径
      const images = uploadedImages.length > 0 ? uploadedImages.join(',') : undefined;
      
      const data = {
        ...values,
        checkInDate: new Date().toISOString().split('T')[0], // 当前日期
        images
      };
      
      const response = await checkIn(data, submitTokenRef.current);
      if (handleApiError(response)) {
        message.success('打卡成功');
        setTodayChecked(true);
        form.resetFields();
        setUploadedImages([]);
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log('提交打卡请求已取消:', error.message);
      } else {
        handleApiError(error);
      }
    } finally {
      setCheckInLoading(false);
    }
  };

  // 标签切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  // 日期范围变更
  const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
    setDateRange(dateStrings[0] && dateStrings[1] ? dateStrings : null);
  };

  // 图片上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/upload', // 上传接口，需要替换为实际的上传接口
    multiple: true,
    listType: 'picture-card',
    onChange(info) {
      if (info.file.status === 'done') {
        // 上传成功，保存图片URL
        const imageUrl = info.file.response.data;
        setUploadedImages([...uploadedImages, imageUrl]);
        message.success(`${info.file.name} 上传成功`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`);
      }
    },
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

  // 打卡表单
  const renderCheckInForm = () => {
    return (
      <div>
        {todayChecked ? (
          <div style={{ textAlign: 'center', margin: '40px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 60, color: '#52c41a' }} />
            <h2 style={{ marginTop: 16 }}>今日已完成打卡</h2>
            <p>你已经完成了今天的健身打卡，继续保持！</p>
            <Button 
              type="primary" 
              onClick={() => {
                setActiveTab('stats');
                loadCheckInStats();
              }}
              style={{ marginTop: 16, background: '#52c41a', borderColor: '#52c41a' }}
            >
              查看统计数据
            </Button>
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              feeling: 3,
              userPlanId: userPlanId
            }}
          >
            <Form.Item name="userPlanId" hidden>
              <Input />
            </Form.Item>
            
            <Form.Item name="courseId" label="训练课程ID" rules={[{ required: true, message: '请输入课程ID' }]}>
              <InputNumber style={{ width: '100%' }} placeholder="输入你完成的课程ID" />
            </Form.Item>
            
            <Form.Item name="duration" label="训练时长(分钟)" rules={[{ required: true, message: '请输入训练时长' }]}>
              <InputNumber 
                min={1} 
                style={{ width: '100%' }} 
                placeholder="输入训练时长" 
                addonAfter="分钟" 
              />
            </Form.Item>
            
            <Form.Item name="calorieConsumption" label="消耗卡路里" rules={[{ required: true, message: '请输入消耗卡路里' }]}>
              <InputNumber 
                min={1} 
                style={{ width: '100%' }} 
                placeholder="输入消耗卡路里" 
                addonAfter="千卡" 
              />
            </Form.Item>
            
            <Form.Item name="feeling" label="感受" rules={[{ required: true, message: '请选择感受' }]}>
              <Select placeholder="选择训练感受">
                {FEELING_OPTIONS.map(option => (
                  <Option key={option.value} value={option.value}>{option.label}</Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item name="content" label="训练记录">
              <TextArea rows={4} placeholder="记录一下今天的训练感受..." />
            </Form.Item>
            
            <Form.Item label="上传照片">
              <Upload {...uploadProps}>
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              </Upload>
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={checkInLoading}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
                block
              >
                提交打卡
              </Button>
            </Form.Item>
          </Form>
        )}
      </div>
    );
  };

  // 打卡记录
  const renderCheckInList = () => {
    const columns = [
      {
        title: '日期',
        dataIndex: 'checkInDate',
        key: 'checkInDate',
        render: (text: string) => formatDate(text)
      },
      {
        title: '时长',
        dataIndex: 'duration',
        key: 'duration',
        render: (text: number) => `${text} 分钟`
      },
      {
        title: '卡路里',
        dataIndex: 'calorieConsumption',
        key: 'calorieConsumption',
        render: (text: number) => `${text} 千卡`
      },
      {
        title: '感受',
        dataIndex: 'feeling',
        key: 'feeling',
        render: (feeling: number) => {
          const option = FEELING_OPTIONS.find(opt => opt.value === feeling);
          return option ? option.label : '-';
        }
      },
      {
        title: '内容',
        dataIndex: 'content',
        key: 'content',
        ellipsis: true
      }
    ];
    
    return (
      <div>
        <div style={{ marginBottom: 16 }}>
          <RangePicker onChange={handleDateRangeChange} style={{ width: isMobile ? '100%' : 'auto' }} />
        </div>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
          </div>
        ) : checkInRecords.length > 0 ? (
          <Table
            columns={columns}
            dataSource={checkInRecords}
            rowKey="id"
            pagination={{
              current,
              pageSize,
              total,
              onChange: (page) => setCurrent(page),
              showSizeChanger: false
            }}
            scroll={{ x: true }}
          />
        ) : (
          <Empty description="暂无打卡记录" />
        )}
      </div>
    );
  };

  // 打卡统计
  const renderCheckInStats = () => {
    if (statsLoading) {
      return (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      );
    }
    
    if (!stats) {
      return (
        <Empty description="暂无打卡统计数据" />
      );
    }
    
    return (
      <div>
        <Row gutter={[16, 16]}>
          <Col xs={12} md={6}>
            <Card>
              <Statistic 
                title="总打卡次数" 
                value={stats.totalCount} 
                prefix={<CheckCircleOutlined />} 
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card>
              <Statistic 
                title="本周打卡" 
                value={stats.thisWeekCount} 
                suffix={`/ 7`}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card>
              <Statistic 
                title="本月打卡" 
                value={stats.thisMonthCount} 
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card>
              <Statistic 
                title="连续打卡" 
                value={stats.continuousCount} 
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>
        
        <Divider />
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card>
              <Statistic 
                title="累计训练时长" 
                value={stats.totalDuration} 
                suffix="分钟"
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card>
              <Statistic 
                title="累计消耗卡路里" 
                value={stats.totalCalories} 
                suffix="千卡"
                prefix={<FireOutlined />}
              />
            </Card>
          </Col>
        </Row>
        
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p>坚持就是胜利，继续保持！</p>
        </div>
      </div>
    );
  };

  return (
    <div className="check-in-page">
      <Card 
        title="训练打卡" 
        bordered={false}
        bodyStyle={{ padding: isMobile ? 12 : 24 }}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          centered={isMobile}
        >
          <TabPane tab="打卡" key="form" />
          <TabPane tab="统计" key="stats" />
          <TabPane tab="记录" key="list" />
        </Tabs>
        
        {activeTab === 'form' && renderCheckInForm()}
        {activeTab === 'list' && renderCheckInList()}
        {activeTab === 'stats' && renderCheckInStats()}
      </Card>
    </div>
  );
};

export default CheckInPage; 