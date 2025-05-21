import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Card, Tabs, List, Tag, Button, Empty, Spin, message } from 'antd';
import { HeartFilled, VideoCameraOutlined, FireOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getFavoriteCourses, getFavoritePlans, removeFavorite } from '@/api/fitness';
import type { Course, Plan } from '@/api/fitness';
import { handleApiError } from '@/utils/errorHandler';
import { ApiResponse } from '@/types';
import { createCancelToken } from '@/utils/request';
import axios, { CancelTokenSource } from 'axios';

const { TabPane } = Tabs;

// 添加收藏数据接口定义
interface FavoriteCourse {
  favorite: {
    id: number;
    userId: number;
    type: number;
    targetId: number;
    createTime: string;
  };
  course: Course;
}

interface FavoritePlan {
  favorite: {
    id: number;
    userId: number;
    type: number;
    targetId: number;
    createTime: string;
  };
  plan: Plan;
}

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('1');
  const [loading, setLoading] = useState(false);
  // 修改数据结构类型
  const [courses, setCourses] = useState<FavoriteCourse[]>([]);
  const [plans, setPlans] = useState<FavoritePlan[]>([]);
  const [coursesTotal, setCoursesTotal] = useState(0);
  const [plansTotal, setPlansTotal] = useState(0);
  const [currentCourses, setCurrentCourses] = useState(1);
  const [currentPlans, setCurrentPlans] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // 用于取消API请求的令牌
  const coursesTokenRef = useRef<CancelTokenSource | null>(null);
  const plansTokenRef = useRef<CancelTokenSource | null>(null);
  const actionTokenRef = useRef<CancelTokenSource | null>(null);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const fetchCourses = useCallback(async () => {
    // 取消先前的请求
    if (coursesTokenRef.current) {
      coursesTokenRef.current.cancel('新请求发起，取消旧请求');
    }
    
    // 创建新的取消令牌
    coursesTokenRef.current = createCancelToken();
    
    setLoading(true);
    try {
      const response = await getFavoriteCourses(currentCourses, 10, coursesTokenRef.current);
      if (response.success) {
        // 确保类型正确转换
        const favoriteCoursesData = response.data.records as unknown as FavoriteCourse[];
        setCourses(favoriteCoursesData);
        setCoursesTotal(response.data.total);
      } else {
        message.error(response.message || '获取收藏课程失败');
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log('获取收藏课程请求已取消:', error.message);
      } else {
        message.error('网络错误，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  }, [currentCourses]);
  
  const fetchPlans = useCallback(async () => {
    // 取消先前的请求
    if (plansTokenRef.current) {
      plansTokenRef.current.cancel('新请求发起，取消旧请求');
    }
    
    // 创建新的取消令牌
    plansTokenRef.current = createCancelToken();
    
    setLoading(true);
    try {
      const response = await getFavoritePlans(currentPlans, 10, plansTokenRef.current);
      if (response.success) {
        // 确保类型正确转换
        const favoritePlansData = response.data.records as unknown as FavoritePlan[];
        setPlans(favoritePlansData);
        setPlansTotal(response.data.total);
      } else {
        message.error(response.message || '获取收藏计划失败');
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log('获取收藏计划请求已取消:', error.message);
      } else {
        message.error('网络错误，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  }, [currentPlans]);
  
  useEffect(() => {
    if (activeTab === '1') {
      fetchCourses();
    } else {
      fetchPlans();
    }
    
    // 组件卸载时取消所有请求
    return () => {
      if (coursesTokenRef.current) {
        coursesTokenRef.current.cancel('组件卸载，取消请求');
      }
      if (plansTokenRef.current) {
        plansTokenRef.current.cancel('组件卸载，取消请求');
      }
      if (actionTokenRef.current) {
        actionTokenRef.current.cancel('组件卸载，取消请求');
      }
    };
  }, [activeTab, fetchCourses, fetchPlans]);
  
  const handleRemoveFavorite = async (type: number, id: number) => {
    try {
      // 取消先前的请求
      if (actionTokenRef.current) {
        actionTokenRef.current.cancel('新请求发起，取消旧请求');
      }
      
      // 创建新的取消令牌
      actionTokenRef.current = createCancelToken();
      
      const response = await removeFavorite(type, id, actionTokenRef.current);
      if (response.success) {
        message.success('取消收藏成功');
        if (type === 1) {
          fetchCourses();
        } else {
          fetchPlans();
        }
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log('取消收藏请求已取消:', error.message);
      } else {
        handleApiError(error as ApiResponse<any>);
      }
    }
  };
  
  const handleViewCourse = (id: number) => {
    navigate(`/fitness/courses/${id}`);
  };
  
  const handleViewPlan = (id: number) => {
    navigate(`/fitness/plans/${id}`);
  };
  
  // 渲染课程列表
  const renderCoursesList = () => (
    <List
      dataSource={courses}
      renderItem={favoriteCourse => {
        // 从嵌套结构中获取课程数据
        const course = favoriteCourse.course;
        if (!course) return null;
        
        return (
          <List.Item 
            onClick={() => handleViewCourse(course.id)}
            style={{ padding: 0, marginBottom: 8, cursor: 'pointer' }}
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
                  <Button 
                    type="text" 
                    icon={<HeartFilled style={{ color: '#ff4d4f' }} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(1, course.id);
                    }}
                  />
                  <RightOutlined style={{ color: '#ccc' }} />
                </div>
              </div>
            </Card>
          </List.Item>
        );
      }}
      pagination={{
        current: currentCourses,
        pageSize: 10,
        total: coursesTotal,
        onChange: (page) => setCurrentCourses(page),
        style: { marginTop: 16, textAlign: 'center' }
      }}
      locale={{
        emptyText: <Empty description="还没有收藏任何课程" />
      }}
    />
  );
  
  // 渲染计划列表
  const renderPlansList = () => (
    <List
      dataSource={plans}
      renderItem={favoritePlan => {
        // 从嵌套结构中获取计划数据
        const plan = favoritePlan.plan;
        if (!plan) return null;
        
        return (
          <List.Item 
            onClick={() => handleViewPlan(plan.id)}
            style={{ padding: 0, marginBottom: 8, cursor: 'pointer' }}
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
                  backgroundImage: plan.coverImg ? `url(${plan.coverImg})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}>
                  {!plan.coverImg && <FireOutlined style={{ fontSize: 24, color: '#52c41a' }} />}
                </div>
                <div style={{ flex: 1, marginLeft: 12 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
                    {plan.name}
                  </div>
                  <div style={{ display: 'flex', marginBottom: 4 }}>
                    <Tag color={getColorByGoal(plan.fitnessGoal)} style={{ margin: 0, marginRight: 4 }}>
                      {plan.fitnessGoalText}
                    </Tag>
                    <Tag color={getColorByDifficulty(plan.difficulty)} style={{ margin: 0 }}>
                      {plan.difficultyText}
                    </Tag>
                  </div>
                  <div style={{ color: '#999', fontSize: '0.8rem' }}>
                    {plan.durationWeeks}周 · 每周{plan.sessionsPerWeek}次
                  </div>
                </div>
                <div>
                  <Button 
                    type="text" 
                    icon={<HeartFilled style={{ color: '#ff4d4f' }} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFavorite(2, plan.id);
                    }}
                  />
                  <RightOutlined style={{ color: '#ccc' }} />
                </div>
              </div>
            </Card>
          </List.Item>
        );
      }}
      pagination={{
        current: currentPlans,
        pageSize: 10,
        total: plansTotal,
        onChange: (page) => setCurrentPlans(page),
        style: { marginTop: 16, textAlign: 'center' }
      }}
      locale={{
        emptyText: <Empty description="还没有收藏任何计划" />
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
    <div className="favorites-page">
      <Card 
        title="我的收藏" 
        bordered={false}
        bodyStyle={{ padding: isMobile ? 12 : 24 }}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          centered={isMobile}
        >
          <TabPane 
            tab={<span><VideoCameraOutlined />收藏的课程</span>} 
            key="1"
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin size="large" />
              </div>
            ) : (
              renderCoursesList()
            )}
          </TabPane>
          <TabPane 
            tab={<span><FireOutlined />收藏的计划</span>} 
            key="2"
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <Spin size="large" />
              </div>
            ) : (
              renderPlansList()
            )}
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Favorites; 