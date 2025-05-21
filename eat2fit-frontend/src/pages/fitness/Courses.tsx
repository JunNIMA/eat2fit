import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Card, List, Tag, Button, Row, Col, Input, Select, Empty, Spin, message, Tabs } from 'antd';
import { SearchOutlined, FireOutlined, VideoCameraOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCourses } from '@/store/slices/fitnessSlice';
import { createCancelToken } from '@/utils/request';
import axios, { CancelTokenSource } from 'axios';

const { Option } = Select;
const { Search } = Input;
const { TabPane } = Tabs;

const Courses: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { list: courses, loading, total } = useAppSelector(state => state.fitness.courses);
  
  const [activeTab, setActiveTab] = useState('all');
  const [difficulty, setDifficulty] = useState<number | undefined>(undefined);
  const [keyword, setKeyword] = useState('');
  const [current, setCurrent] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // 用于取消API请求的令牌
  const coursesTokenRef = useRef<CancelTokenSource | null>(null);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const fetchData = useCallback(() => {
    // 取消上一个未完成的请求
    if (coursesTokenRef.current) {
      coursesTokenRef.current.cancel('新请求发起，取消旧请求');
    }
    
    // 创建新的取消令牌
    coursesTokenRef.current = createCancelToken();
    
    const params: any = {
      current,
      size: 8,
      keyword: keyword || undefined,
      cancelToken: coursesTokenRef.current
    };
    
    if (activeTab !== 'all') {
      const goalMap: Record<string, number> = {
        '增肌': 1,
        '减脂': 2,
        '塑形': 3,
        '维持': 4
      };
      params.fitnessGoal = goalMap[activeTab];
    }
    
    if (difficulty !== undefined) {
      params.difficulty = difficulty;
    }
    
    dispatch(fetchCourses(params));
  }, [current, activeTab, difficulty, keyword, dispatch]);
  
  // 初始加载数据
  useEffect(() => {
    fetchData();
    
    // 组件卸载时取消未完成的请求
    return () => {
      if (coursesTokenRef.current) {
        coursesTokenRef.current.cancel('组件卸载，取消请求');
      }
    };
  }, [fetchData]);
  
  const handleSearch = (value: string) => {
    setKeyword(value);
    setCurrent(1);
  };
  
  const handleCourseDetail = (id: number) => {
    navigate(`/fitness/courses/${id}`);
  };
  
  // 移动端课程列表
  const renderMobileList = () => (
    <List
      dataSource={courses}
      renderItem={course => (
        <List.Item 
          onClick={() => handleCourseDetail(course.id)}
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
                backgroundImage: course.coverImg ? `url(${course.coverImg})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                {!course.coverImg && <VideoCameraOutlined style={{ fontSize: 24, color: '#52c41a' }} />}
              </div>
              <div style={{ flex: 1, marginLeft: 12 }}>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                  {course.title}
                </div>
                <div style={{ display: 'flex', marginBottom: 4 }}>
                  <Tag color={getColorByGoal(course.fitnessGoal)} style={{ margin: 0, marginRight: 4 }}>
                    {course.fitnessGoalText}
                  </Tag>
                  <Tag color={getColorByDifficulty(course.difficulty)} style={{ margin: 0 }}>
                    {course.difficultyText}
                  </Tag>
                </div>
                <div style={{ color: '#999', fontSize: '0.8rem' }}>
                  {course.duration}分钟 · {course.calories}千卡
                </div>
              </div>
              <div>
                <RightOutlined style={{ color: '#ccc' }} />
              </div>
            </div>
          </Card>
        </List.Item>
      )}
    />
  );
  
  // 桌面端课程列表
  const renderDesktopList = () => (
    <List
      grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
      dataSource={courses}
      renderItem={course => (
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
                  backgroundImage: course.coverImg ? `url(${course.coverImg})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}
                onClick={() => handleCourseDetail(course.id)}
              >
                {!course.coverImg && <VideoCameraOutlined style={{ fontSize: 40, color: '#52c41a' }} />}
              </div>
            }
            onClick={() => handleCourseDetail(course.id)}
          >
            <Card.Meta
              title={course.title}
              description={
                <>
                  <div style={{ marginBottom: 8 }}>
                    <Tag color={getColorByGoal(course.fitnessGoal)}>{course.fitnessGoalText}</Tag>
                    <Tag color={getColorByDifficulty(course.difficulty)}>{course.difficultyText}</Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#999', fontSize: 12 }}>
                    <span>{course.duration}分钟</span>
                    <span>{course.calories}千卡</span>
                    <span>已观看{course.viewCount}</span>
                  </div>
                </>
              }
            />
          </Card>
        </List.Item>
      )}
      pagination={{
        current,
        pageSize: 8,
        total,
        onChange: (page) => setCurrent(page),
        style: { textAlign: 'center', marginTop: 16 }
      }}
    />
  );
  
  const getColorByGoal = (goal: number): string => {
    const colors = ['', 'green', 'blue', 'purple', 'orange'];
    return colors[goal] || 'default';
  };
  
  const getColorByDifficulty = (difficulty: number): string => {
    const colors = ['', 'cyan', 'gold', 'magenta'];
    return colors[difficulty] || 'default';
  };
  
  return (
    <div className="courses-page">
      <Card 
        title="训练课程" 
        bordered={false}
        bodyStyle={{ padding: isMobile ? 12 : 24 }}
      >
        {/* 搜索和筛选区域 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12}>
            <Search
              placeholder="搜索课程名称、描述或部位"
              allowClear
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={24} md={12}>
            <Select
              style={{ width: '100%' }}
              placeholder="按难度筛选"
              allowClear
              onChange={(value) => {
                setDifficulty(value);
                setCurrent(1);
              }}
            >
              <Option value={1}>初级</Option>
              <Option value={2}>中级</Option>
              <Option value={3}>高级</Option>
            </Select>
          </Col>
        </Row>
        
        {/* 标签页导航 */}
        <Tabs 
          activeKey={activeTab} 
          onChange={(key) => {
            setActiveTab(key);
            setCurrent(1);
          }}
          style={{ marginBottom: 16 }}
          centered={isMobile}
        >
          <TabPane tab="全部" key="all" />
          <TabPane tab="增肌" key="增肌" />
          <TabPane tab="减脂" key="减脂" />
          <TabPane tab="塑形" key="塑形" />
          <TabPane tab="维持" key="维持" />
        </Tabs>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : courses.length > 0 ? (
          isMobile ? renderMobileList() : renderDesktopList()
        ) : (
          <Empty description="没有找到匹配的训练课程" />
        )}
      </Card>
    </div>
  );
};

export default Courses; 