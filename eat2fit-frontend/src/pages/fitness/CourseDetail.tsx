import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Tag, 
  Button, 
  Row, 
  Col, 
  Statistic, 
  Divider, 
  Space, 
  Spin, 
  message, 
  Modal 
} from 'antd';
import { 
  ArrowLeftOutlined, 
  ClockCircleOutlined, 
  FireOutlined, 
  HeartOutlined, 
  HeartFilled,
  PlayCircleOutlined,
  DashboardOutlined,
  LikeOutlined
} from '@ant-design/icons';
import { getCourseDetail, likeCourse, unlikeCourse, addFavorite, removeFavorite, checkFavorite, Course } from '@/api/fitness';

const { Title, Paragraph } = Typography;

/**
 * 课程详情页面
 * 调用/fitness/courses/{id}接口获取课程详情
 */
const CourseDetail: React.FC = () => {
  const { id } = useParams<{id: string}>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 加载课程详情
  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // 直接调用API获取课程详情
        console.log('开始获取课程详情, ID:', id);
        const response = await getCourseDetail(Number(id));
        console.log('课程详情响应:', response);
        
        if (response.success) {
          setCourseData(response.data);
        } else {
          message.error(response.message || '获取课程详情失败');
        }
      } catch (error) {
        console.error('获取课程详情出错:', error);
        message.error('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
      
      // 检查是否已收藏
      checkFavoriteStatus(Number(id));
    };
    
    fetchData();
  }, [id]);
  
  const checkFavoriteStatus = async (courseId: number) => {
    try {
      const response = await checkFavorite(1, courseId);
      if (response.success && courseData) {
        // 更新课程收藏状态
        setCourseData({
          ...courseData,
          isFavorite: response.data
        });
      }
    } catch (error) {
      console.error('检查收藏状态失败', error);
    }
  };
  
  const handleToggleFavorite = async () => {
    if (!courseData) return;
    
    try {
      if (courseData.isFavorite) {
        await removeFavorite(1, courseData.id);
        message.success('已取消收藏');
        setCourseData({
          ...courseData,
          isFavorite: false
        });
      } else {
        await addFavorite(1, courseData.id);
        message.success('收藏成功');
        setCourseData({
          ...courseData,
          isFavorite: true
        });
      }
    } catch (error) {
      message.error('操作失败，请稍后重试');
    }
  };
  
  const handleLikeCourse = async () => {
    if (!courseData) return;
    
    try {
      await likeCourse(courseData.id);
      message.success('点赞成功');
      
      // 更新点赞数据
      setCourseData({
        ...courseData,
        likeCount: (courseData.likeCount || 0) + 1
      });
      
      // 更新点赞状态
      setIsLiked(true);
    } catch (error) {
      message.error('操作失败，请稍后重试');
    }
  };
  
  const handleUnlikeCourse = async () => {
    if (!courseData) return;
    
    try {
      await unlikeCourse(courseData.id);
      message.success('取消点赞成功');
      
      // 更新点赞数据
      setCourseData({
        ...courseData,
        likeCount: Math.max((courseData.likeCount || 0) - 1, 0)
      });
      
      // 更新点赞状态
      setIsLiked(false);
    } catch (error) {
      message.error('操作失败，请稍后重试');
    }
  };
  
  const handlePlayVideo = () => {
    if (!courseData?.videoUrl) {
      message.info('该课程暂无视频');
      return;
    }
    setVideoModalVisible(true);
  };
  
  const getColorByGoal = (goal?: number): string => {
    const colors = ['', 'green', 'blue', 'purple', 'orange'];
    return goal ? colors[goal] : 'default';
  };
  
  const getColorByDifficulty = (difficulty?: number): string => {
    const colors = ['', 'cyan', 'gold', 'magenta'];
    return difficulty ? colors[difficulty] : 'default';
  };
  
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }
  
  if (!courseData) {
    return (
      <Card>
        <div style={{ textAlign: 'center' }}>
          <Title level={4}>未找到课程</Title>
          <Button 
            type="primary" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/fitness/courses')}
            style={{ marginTop: 16, background: '#52c41a', borderColor: '#52c41a' }}
          >
            返回列表
          </Button>
        </div>
      </Card>
    );
  }
  
  return (
    <div className="course-detail">
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/fitness/courses')}
        style={{ marginBottom: 16 }}
      >
        返回列表
      </Button>
      
      <Card bordered={false}>
        <Row gutter={[24, 16]}>
          <Col xs={24} md={16}>
            <div 
              style={{ 
                height: isMobile ? 200 : 360,
                background: '#f0f2f5', 
                borderRadius: 8,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundImage: courseData.coverImg ? `url(${courseData.coverImg})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
              onClick={handlePlayVideo}
            >
              <PlayCircleOutlined style={{ fontSize: 64, color: 'white' }} />
            </div>
            
            <Title level={2}>{courseData.title}</Title>
            <Space style={{ marginBottom: 16 }}>
              <Tag color={getColorByGoal(courseData.fitnessGoal)}>{courseData.fitnessGoalText}</Tag>
              <Tag color={getColorByDifficulty(courseData.difficulty)}>{courseData.difficultyText}</Tag>
              <Tag icon={<ClockCircleOutlined />}>{courseData.duration} 分钟</Tag>
              <Tag icon={<FireOutlined />}>{courseData.calories} 千卡</Tag>
            </Space>
            
            <Divider orientation="left">课程描述</Divider>
            <Paragraph>{courseData.description}</Paragraph>
            
            {courseData.bodyParts && (
              <>
                <Divider orientation="left">锻炼部位</Divider>
                <div>
                  {courseData.bodyParts.split(',').map((part, index) => (
                    <Tag key={index} style={{ marginBottom: 8 }}>{part.trim()}</Tag>
                  ))}
                </div>
              </>
            )}
            
            {courseData.equipment && (
              <>
                <Divider orientation="left">所需器材</Divider>
                <div>
                  {courseData.equipment.split(',').map((item, index) => (
                    <Tag key={index} style={{ marginBottom: 8 }}>{item.trim()}</Tag>
                  ))}
                </div>
              </>
            )}
          </Col>
          
          <Col xs={24} md={8}>
            <Card 
              style={{ marginBottom: 16 }}
              actions={[
                <Button 
                  type="text" 
                  icon={courseData.isFavorite ? <HeartFilled style={{ color: '#ff4d4f' }} /> : <HeartOutlined />}
                  onClick={handleToggleFavorite}
                >
                  {courseData.isFavorite ? '取消收藏' : '收藏'}
                </Button>,
                <Button 
                  type="text" 
                  icon={isLiked ? <LikeOutlined style={{ color: '#1890ff' }} /> : <LikeOutlined />}
                  onClick={isLiked ? handleUnlikeCourse : handleLikeCourse}
                >
                  {isLiked ? '已点赞' : '点赞'}
                </Button>,
              ]}
            >
              <Statistic 
                title="观看次数" 
                value={courseData.viewCount} 
                prefix={<DashboardOutlined />} 
                style={{ marginBottom: 16 }}
              />
              <Statistic 
                title="点赞次数" 
                value={courseData.likeCount} 
                prefix={<LikeOutlined />}
              />
            </Card>
            
            {courseData.instructor && (
              <Card title="教练信息" style={{ marginBottom: 16 }}>
                <p><strong>讲师：</strong>{courseData.instructor}</p>
              </Card>
            )}
            
            <Card title="开始训练">
              <p>准备好开始训练了吗？点击下方按钮开始！</p>
              <Button 
                type="primary" 
                icon={<PlayCircleOutlined />} 
                block
                onClick={handlePlayVideo}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                开始训练
              </Button>
            </Card>
          </Col>
        </Row>
      </Card>
      
      <Modal
        title={courseData.title}
        open={videoModalVisible}
        onCancel={() => setVideoModalVisible(false)}
        footer={null}
        width={isMobile ? '100%' : '80%'}
        style={{ top: 20 }}
      >
        {courseData.videoUrl ? (
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe
              src={courseData.videoUrl}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={courseData.title}
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p>该课程暂无视频</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CourseDetail; 