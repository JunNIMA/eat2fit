import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  InputNumber, 
  message, 
  Popconfirm,
  Tag,
  Upload,
  Row,
  Col,
  Image
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  UploadOutlined,
  LoadingOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import { getCourses, addCourse, updateCourse, deleteCourse, Course } from '@/api/fitness';
import type { QueryParams } from '@/api/fitness';
import { useAppSelector } from '@/store/hooks';
import { createCancelToken } from '@/utils/request';
import axios, { CancelTokenSource } from 'axios';
import type { RcFile, UploadProps } from 'antd/es/upload';
import { getToken } from '@/utils/auth';

const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

const CourseManagement: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<Partial<Course>>({});
  const [form] = Form.useForm();

  const [coverImgUrl, setCoverImgUrl] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [coverUploadLoading, setCoverUploadLoading] = useState<boolean>(false);
  const [videoUploadLoading, setVideoUploadLoading] = useState<boolean>(false);

  // 用于取消API请求的令牌
  const coursesTokenRef = useRef<CancelTokenSource | null>(null);
  const actionTokenRef = useRef<CancelTokenSource | null>(null);

  // 检查当前用户是否有管理权限
  const isAdmin = user?.role === 1;

  const fetchCourses = useCallback(async () => {
    // 取消先前的请求
    if (coursesTokenRef.current) {
      coursesTokenRef.current.cancel('新请求发起，取消旧请求');
    }
    
    // 创建新的取消令牌
    coursesTokenRef.current = createCancelToken();
    
    setLoading(true);
    try {
      const params: QueryParams = {
        current,
        size: pageSize
      };
      
      const response = await getCourses(params, coursesTokenRef.current);
      if (response.success) {
        setCourses(response.data.records);
        setTotal(response.data.total);
      } else {
        message.error(response.message || '获取课程列表失败');
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log('获取课程列表请求已取消:', error.message);
      } else {
        message.error('网络错误，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  }, [current, pageSize]);

  useEffect(() => {
    fetchCourses();
    
    // 组件卸载时取消所有请求
    return () => {
      if (coursesTokenRef.current) {
        coursesTokenRef.current.cancel('组件卸载，取消请求');
      }
      if (actionTokenRef.current) {
        actionTokenRef.current.cancel('组件卸载，取消请求');
      }
    };
  }, [fetchCourses]);

  const handleAdd = () => {
    setCurrentCourse({});
    form.resetFields();
    setCoverImgUrl('');
    setVideoUrl('');
    setModalVisible(true);
  };

  const handleEdit = (record: Course) => {
    setCurrentCourse(record);
    form.setFieldsValue({
      ...record
    });
    setCoverImgUrl(record.coverImg || '');
    setVideoUrl(record.videoUrl || '');
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      // 取消先前的请求
      if (actionTokenRef.current) {
        actionTokenRef.current.cancel('新请求发起，取消旧请求');
      }
      
      // 创建新的取消令牌
      actionTokenRef.current = createCancelToken();
      
      const response = await deleteCourse(id);
      if (response.success) {
        message.success('删除课程成功');
        fetchCourses();
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log('删除课程请求已取消:', error.message);
      } else {
        message.error('删除失败，请稍后重试');
      }
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // 取消先前的请求
      if (actionTokenRef.current) {
        actionTokenRef.current.cancel('新请求发起，取消旧请求');
      }
      
      // 创建新的取消令牌
      actionTokenRef.current = createCancelToken();
      
      let response;
      if (currentCourse.id) {
        // 更新课程
        const updateData = {
          ...values,
          id: currentCourse.id
        };
        response = await updateCourse(updateData);
      } else {
        // 添加课程
        response = await addCourse(values);
      }
      
      if (response.success) {
        message.success(currentCourse.id ? '更新课程成功' : '添加课程成功');
        handleCloseModal();
        fetchCourses();
      } else {
        message.error(response.message || '操作失败');
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log('保存课程请求已取消:', error.message);
      } else {
        message.error('表单验证失败，请检查输入');
      }
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    form.resetFields();
    setCoverImgUrl('');
    setVideoUrl('');
  };

  const handleCoverUpload = (info: any) => {
    if (info.file.status === 'uploading') {
      setCoverUploadLoading(true);
      return;
    }
    
    if (info.file.status === 'done') {
      setCoverUploadLoading(false);
      // 获取上传后的URL
      const imgUrl = info.file.response.data;
      // 设置表单值
      form.setFieldsValue({ coverImg: imgUrl });
      setCoverImgUrl(imgUrl);
      message.success('封面图片上传成功');
    } else if (info.file.status === 'error') {
      setCoverUploadLoading(false);
      message.error('封面图片上传失败');
    }
  };

  const handleVideoUpload = (info: any) => {
    if (info.file.status === 'uploading') {
      setVideoUploadLoading(true);
      return;
    }
    
    if (info.file.status === 'done') {
      setVideoUploadLoading(false);
      // 获取上传后的URL
      const videoUrl = info.file.response.data;
      // 设置表单值
      form.setFieldsValue({ videoUrl: videoUrl });
      setVideoUrl(videoUrl);
      message.success('视频上传成功');
    } else if (info.file.status === 'error') {
      setVideoUploadLoading(false);
      message.error('视频上传失败');
    }
  };

  const getDifficultyText = (difficulty: number) => {
    switch (difficulty) {
      case 1: return '初级';
      case 2: return '中级';
      case 3: return '高级';
      default: return '未知';
    }
  };

  const getFitnessGoalText = (goal: number) => {
    switch (goal) {
      case 1: return '增肌';
      case 2: return '减脂';
      case 3: return '塑形';
      case 4: return '维持';
      default: return '未知';
    }
  };

  const getDifficultyColor = (difficulty: number): string => {
    switch (difficulty) {
      case 1: return 'cyan';
      case 2: return 'gold';
      case 3: return 'magenta';
      default: return 'default';
    }
  };

  const getGoalColor = (goal: number): string => {
    switch (goal) {
      case 1: return 'green';
      case 2: return 'blue';
      case 3: return 'purple';
      case 4: return 'orange';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70
    },
    {
      title: '封面',
      dataIndex: 'coverImg',
      key: 'coverImg',
      width: 100,
      render: (coverImg: string) => (
        coverImg ? (
          <Image 
            src={coverImg} 
            width={80} 
            height={45} 
            style={{ objectFit: 'cover', borderRadius: '4px' }} 
            preview={{ 
              src: coverImg,
              mask: '预览'
            }}
          />
        ) : '无封面'
      )
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: '时长(分钟)',
      dataIndex: 'duration',
      key: 'duration',
      width: 100
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 80,
      render: (difficulty: number) => (
        <Tag color={getDifficultyColor(difficulty)}>
          {getDifficultyText(difficulty)}
        </Tag>
      )
    },
    {
      title: '健身目标',
      dataIndex: 'fitnessGoal',
      key: 'fitnessGoal',
      width: 80,
      render: (goal: number) => (
        <Tag color={getGoalColor(goal)}>
          {getFitnessGoalText(goal)}
        </Tag>
      )
    },
    {
      title: '锻炼部位',
      dataIndex: 'bodyParts',
      key: 'bodyParts',
      width: 150,
      ellipsis: true
    },
    {
      title: '观看/点赞',
      key: 'stats',
      width: 100,
      render: (_: unknown, record: Course) => (
        <span>{record.viewCount}/{record.likeCount}</span>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: Course) => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              danger 
              size="small" 
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  if (!isAdmin) {
    return (
      <Card title="课程管理">
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <p>您没有权限访问此页面</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="course-management">
      <Card 
        title="课程管理" 
        bordered={false}
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            添加课程
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={courses}
          rowKey="id"
          loading={loading}
          pagination={{
            current,
            pageSize,
            total,
            onChange: (page) => setCurrent(page),
            onShowSizeChange: (current, size) => setPageSize(size),
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`
          }}
        />
      </Card>

      <Modal
        title={currentCourse.id ? '编辑课程' : '添加课程'}
        open={modalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="课程标题"
                rules={[{ required: true, message: '请输入课程标题' }]}
              >
                <Input placeholder="请输入课程标题" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="duration"
                label="时长(分钟)"
                rules={[{ required: true, message: '请输入课程时长' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入课程时长(分钟)" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="课程描述"
            rules={[{ required: true, message: '请输入课程描述' }]}
          >
            <TextArea rows={4} placeholder="请输入课程描述" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="coverImg"
                label="封面图片"
                rules={[{ required: true, message: '请上传封面图片' }]}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {coverImgUrl && (
                    <div style={{ marginBottom: 16 }}>
                      <Image 
                        src={coverImgUrl} 
                        width={200}
                        style={{ borderRadius: '4px' }}
                        preview={{ 
                          mask: '点击预览'
                        }}
                      />
                    </div>
                  )}
                  <Upload
                    name="file"
                    action="/api/fitness/courses/upload/cover"
                    headers={{
                      Authorization: `Bearer ${getToken()}`
                    }}
                    showUploadList={false}
                    onChange={handleCoverUpload}
                  >
                    <Button icon={coverUploadLoading ? <LoadingOutlined /> : <UploadOutlined />}>
                      {coverUploadLoading ? '上传中...' : (coverImgUrl ? '更换封面图片' : '上传封面图片')}
                    </Button>
                  </Upload>
                  <Input 
                    value={coverImgUrl}
                    placeholder="图片URL" 
                    style={{ marginTop: 8, display: 'none' }} 
                  />
                </div>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="videoUrl"
                label="课程视频"
                rules={[{ required: false, message: '请上传课程视频' }]}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {videoUrl && (
                    <div style={{ marginBottom: 16 }}>
                      <video 
                        src={videoUrl} 
                        width={200}
                        height={112}
                        style={{ borderRadius: '4px' }}
                        controls
                      />
                    </div>
                  )}
                  <Upload
                    name="file"
                    action="/api/fitness/courses/upload/video"
                    headers={{
                      Authorization: `Bearer ${getToken()}`
                    }}
                    showUploadList={false}
                    onChange={handleVideoUpload}
                  >
                    <Button icon={videoUploadLoading ? <LoadingOutlined /> : <VideoCameraOutlined />}>
                      {videoUploadLoading ? '上传中...' : (videoUrl ? '更换视频' : '上传视频(选填)')}
                    </Button>
                  </Upload>
                  <Input 
                    value={videoUrl}
                    placeholder="视频URL" 
                    style={{ marginTop: 8, display: 'none' }} 
                  />
                </div>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="difficulty"
                label="难度等级"
                rules={[{ required: true, message: '请选择难度等级' }]}
              >
                <Select placeholder="请选择难度等级">
                  <Option value={1}>初级</Option>
                  <Option value={2}>中级</Option>
                  <Option value={3}>高级</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="fitnessGoal"
                label="健身目标"
                rules={[{ required: true, message: '请选择健身目标' }]}
              >
                <Select placeholder="请选择健身目标">
                  <Option value={1}>增肌</Option>
                  <Option value={2}>减脂</Option>
                  <Option value={3}>塑形</Option>
                  <Option value={4}>维持</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="calories"
                label="消耗卡路里"
                rules={[{ required: true, message: '请输入消耗卡路里' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入消耗卡路里" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="bodyParts"
                label="锻炼部位"
                rules={[{ required: true, message: '请输入锻炼部位' }]}
              >
                <Input placeholder="如：胸部,手臂,腹部（多个用逗号分隔）" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="equipment"
                label="所需器材"
              >
                <Input placeholder="如：哑铃,瑜伽垫（多个用逗号分隔）" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="instructor"
            label="教练名称"
          >
            <Input placeholder="请输入教练名称" />
          </Form.Item>
          
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Button style={{ marginRight: 8 }} onClick={handleCloseModal}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" style={{ background: '#52c41a', borderColor: '#52c41a' }}>
              保存
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseManagement; 