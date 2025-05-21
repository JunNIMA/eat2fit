import React, { useEffect, useState } from 'react';
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
  Tag
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { getCourses, addCourse, updateCourse, deleteCourse, Course } from '@/api/fitness';
import type { QueryParams } from '@/api/fitness';
import { useAppSelector } from '@/store/hooks';

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

  // 检查当前用户是否有管理权限
  const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN');

  useEffect(() => {
    fetchCourses();
  }, [current, pageSize]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params: QueryParams = {
        current,
        size: pageSize
      };
      const response = await getCourses(params);
      if (response.success) {
        setCourses(response.data.records);
        setTotal(response.data.total);
      } else {
        message.error(response.message || '获取课程列表失败');
      }
    } catch (error) {
      message.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentCourse({});
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Course) => {
    setCurrentCourse(record);
    form.setFieldsValue({
      ...record
    });
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '删除后将无法恢复，是否确认删除？',
      onOk: async () => {
        try {
          const response = await deleteCourse(id);
          if (response.success) {
            message.success('删除成功');
            fetchCourses();
          } else {
            message.error(response.message || '删除失败');
          }
        } catch (error) {
          message.error('网络错误，请稍后重试');
        }
      }
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const saveData = {
        ...values,
        id: currentCourse.id
      };

      let response;
      if (currentCourse.id) {
        response = await updateCourse(saveData);
      } else {
        response = await addCourse(saveData);
      }

      if (response.success) {
        message.success(`${currentCourse.id ? '更新' : '添加'}成功`);
        setModalVisible(false);
        fetchCourses();
      } else {
        message.error(response.message || `${currentCourse.id ? '更新' : '添加'}失败`);
      }
    } catch (error) {
      message.error('表单验证失败，请检查输入');
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

  const getColorByGoal = (goal: number): string => {
    const colors = ['', 'green', 'blue', 'purple', 'orange'];
    return colors[goal] || 'default';
  };

  const getColorByDifficulty = (difficulty: number): string => {
    const colors = ['', 'cyan', 'gold', 'magenta'];
    return colors[difficulty] || 'default';
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70
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
      width: 100,
      render: (difficulty: number) => (
        <Tag color={getColorByDifficulty(difficulty)}>
          {getDifficultyText(difficulty)}
        </Tag>
      )
    },
    {
      title: '健身目标',
      dataIndex: 'fitnessGoal',
      key: 'fitnessGoal',
      width: 100,
      render: (goal: number) => (
        <Tag color={getColorByGoal(goal)}>
          {getFitnessGoalText(goal)}
        </Tag>
      )
    },
    {
      title: '观看次数',
      dataIndex: 'viewCount',
      key: 'viewCount',
      width: 100
    },
    {
      title: '点赞次数',
      dataIndex: 'likeCount',
      key: 'likeCount',
      width: 100
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Course) => (
        <Space size="small">
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
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
            >
              删除
            </Button>
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
            onShowSizeChange: (_, size) => setPageSize(size),
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`
          }}
        />
      </Card>

      <Modal
        title={currentCourse.id ? '编辑课程' : '添加课程'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        width={800}
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="title"
            label="课程标题"
            rules={[{ required: true, message: '请输入课程标题' }]}
          >
            <Input placeholder="请输入课程标题" />
          </Form.Item>

          <Form.Item
            name="description"
            label="课程描述"
            rules={[{ required: true, message: '请输入课程描述' }]}
          >
            <TextArea rows={4} placeholder="请输入课程描述" />
          </Form.Item>

          <Form.Item
            name="coverImg"
            label="封面图片URL"
          >
            <Input placeholder="请输入封面图片URL" />
          </Form.Item>

          <Form.Item
            name="videoUrl"
            label="视频URL"
          >
            <Input placeholder="请输入视频URL" />
          </Form.Item>

          <Form.Item
            name="duration"
            label="时长(分钟)"
            rules={[{ required: true, message: '请输入课程时长' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入课程时长(分钟)" />
          </Form.Item>

          <Form.Item
            name="difficulty"
            label="难度"
            rules={[{ required: true, message: '请选择难度' }]}
          >
            <Select placeholder="请选择难度">
              <Option value={1}>初级</Option>
              <Option value={2}>中级</Option>
              <Option value={3}>高级</Option>
            </Select>
          </Form.Item>

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

          <Form.Item
            name="bodyParts"
            label="锻炼部位"
            rules={[{ required: true, message: '请输入锻炼部位' }]}
          >
            <Input placeholder="请输入锻炼部位，多个用逗号分隔" />
          </Form.Item>

          <Form.Item
            name="calories"
            label="消耗卡路里"
            rules={[{ required: true, message: '请输入消耗卡路里' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} placeholder="请输入消耗卡路里" />
          </Form.Item>

          <Form.Item
            name="instructor"
            label="教练名称"
          >
            <Input placeholder="请输入教练名称" />
          </Form.Item>

          <Form.Item
            name="equipment"
            label="所需器材"
          >
            <Input placeholder="请输入所需器材，多个用逗号分隔" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseManagement; 