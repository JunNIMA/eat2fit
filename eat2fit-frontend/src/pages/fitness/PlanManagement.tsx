import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Card, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Tag, 
  Modal, 
  message, 
  Spin, 
  Upload, 
  Popconfirm,
  Drawer,
  Row,
  Col,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  FileAddOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { 
  getPlans, 
  addPlan, 
  updatePlan, 
  deletePlan, 
  Plan, 
  QueryParams, 
  PlanCreateDTO, 
  PlanDetail
} from '@/api/fitness';
import { createCancelToken } from '@/utils/request';
import axios, { CancelTokenSource } from 'axios';
import type { RcFile, UploadProps } from 'antd/es/upload';

const { Option } = Select;
const { TextArea } = Input;

const PlanManagement: React.FC = () => {
  const [form] = Form.useForm();
  const [detailForm] = Form.useForm();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [current, setCurrent] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState<boolean>(false);
  const [currentDetails, setCurrentDetails] = useState<PlanDetail[]>([]);
  
  // 用于取消API请求的令牌
  const plansTokenRef = useRef<CancelTokenSource | null>(null);
  const actionTokenRef = useRef<CancelTokenSource | null>(null);
  
  // 加载训练计划列表
  const loadPlans = useCallback(async () => {
    // 取消先前的请求
    if (plansTokenRef.current) {
      plansTokenRef.current.cancel('新请求发起，取消旧请求');
    }
    
    // 创建新的取消令牌
    plansTokenRef.current = createCancelToken();
    
    setLoading(true);
    try {
      const params: QueryParams = {
        current,
        size: pageSize
      };
      
      const response = await getPlans(params, plansTokenRef.current);
      if (response.success) {
        setPlans(response.data.records);
        setTotal(response.data.total);
      } else {
        message.error(response.message || '获取训练计划列表失败');
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log('获取训练计划列表请求已取消:', error.message);
      } else {
        message.error('网络错误，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  }, [current, pageSize]);
  
  // 初始加载和页码变化时重新加载数据
  useEffect(() => {
    loadPlans();
    
    // 组件卸载时取消所有请求
    return () => {
      if (plansTokenRef.current) {
        plansTokenRef.current.cancel('组件卸载，取消请求');
      }
      if (actionTokenRef.current) {
        actionTokenRef.current.cancel('组件卸载，取消请求');
      }
    };
  }, [loadPlans]);
  
  // 添加或更新计划
  const handleSave = async (values: any) => {
    try {
      // 取消先前的请求
      if (actionTokenRef.current) {
        actionTokenRef.current.cancel('新请求发起，取消旧请求');
      }
      
      // 创建新的取消令牌
      actionTokenRef.current = createCancelToken();
      
      const planData: PlanCreateDTO = {
        ...values,
        details: currentDetails
      };
      
      let response;
      if (editingPlan) {
        response = await updatePlan(editingPlan.id, planData);
      } else {
        response = await addPlan(planData);
      }
      
      if (response.success) {
        message.success(editingPlan ? '更新计划成功' : '添加计划成功');
        setShowForm(false);
        setEditingPlan(null);
        setCurrentDetails([]);
        loadPlans();
      } else {
        message.error(response.message || '操作失败');
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log('保存计划请求已取消:', error.message);
      } else {
        message.error('操作失败，请稍后重试');
      }
    }
  };
  
  // 删除计划
  const handleDelete = async (id: number) => {
    try {
      // 取消先前的请求
      if (actionTokenRef.current) {
        actionTokenRef.current.cancel('新请求发起，取消旧请求');
      }
      
      // 创建新的取消令牌
      actionTokenRef.current = createCancelToken();
      
      const response = await deletePlan(id);
      if (response.success) {
        message.success('删除计划成功');
        loadPlans();
      } else {
        message.error(response.message || '删除失败');
      }
    } catch (error: any) {
      if (axios.isCancel(error)) {
        console.log('删除计划请求已取消:', error.message);
      } else {
        message.error('删除失败，请稍后重试');
      }
    }
  };
  
  // 添加训练详情
  const handleAddDetail = () => {
    detailForm.validateFields().then(values => {
      const newDetail: PlanDetail = {
        ...values,
        id: Date.now(), // 临时ID，提交时会被后端替换
        planId: editingPlan?.id || 0
      };
      setCurrentDetails([...currentDetails, newDetail]);
      detailForm.resetFields();
      message.success('添加训练安排成功');
    });
  };
  
  // 删除训练详情
  const handleRemoveDetail = (index: number) => {
    const newDetails = [...currentDetails];
    newDetails.splice(index, 1);
    setCurrentDetails(newDetails);
  };
  
  // 编辑计划
  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    form.setFieldsValue({
      name: plan.name,
      description: plan.description,
      fitnessGoal: plan.fitnessGoal,
      difficulty: plan.difficulty,
      bodyFocus: plan.bodyFocus,
      durationWeeks: plan.durationWeeks,
      sessionsPerWeek: plan.sessionsPerWeek,
      coverImg: plan.coverImg,
      equipmentNeeded: plan.equipmentNeeded
    });
    setShowForm(true);
  };
  
  // 添加新计划
  const handleAdd = () => {
    setEditingPlan(null);
    form.resetFields();
    setCurrentDetails([]);
    setShowForm(true);
  };
  
  // 表格列定义
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '难度',
      dataIndex: 'difficultyText',
      key: 'difficultyText',
      render: (text: string, record: Plan) => (
        <Tag color={record.difficulty === 1 ? 'cyan' : record.difficulty === 2 ? 'gold' : 'magenta'}>
          {text}
        </Tag>
      )
    },
    {
      title: '目标',
      dataIndex: 'fitnessGoalText',
      key: 'fitnessGoalText',
      render: (text: string, record: Plan) => {
        const colors = ['', 'green', 'blue', 'purple', 'orange'];
        const color = record.fitnessGoal && record.fitnessGoal <= 4 ? colors[record.fitnessGoal] : 'default';
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '时长',
      key: 'duration',
      render: (text: string, record: Plan) => (
        <span>{record.durationWeeks}周 / 每周{record.sessionsPerWeek}次</span>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: Plan) => (
        <Space size="small">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="确定要删除这个训练计划吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              size="small" 
            />
          </Popconfirm>
        </Space>
      )
    }
  ];
  
  // 渲染训练详情表
  const renderDetailsTable = () => (
    <Table
      dataSource={currentDetails}
      rowKey="id"
      pagination={false}
      columns={[
        {
          title: '周',
          dataIndex: 'weekNum',
          key: 'weekNum',
          width: 60
        },
        {
          title: '天',
          dataIndex: 'dayNum',
          key: 'dayNum',
          width: 60
        },
        {
          title: '标题',
          dataIndex: 'title',
          key: 'title'
        },
        {
          title: '描述',
          dataIndex: 'description',
          key: 'description',
          ellipsis: true
        },
        {
          title: '课程ID',
          dataIndex: 'courseId',
          key: 'courseId',
          width: 80
        },
        {
          title: '操作',
          key: 'action',
          width: 80,
          render: (text: string, record: PlanDetail, index: number) => (
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              size="small" 
              onClick={() => handleRemoveDetail(index)}
            />
          )
        }
      ]}
    />
  );
  
  return (
    <div className="plan-management">
      <Card 
        title="训练计划管理" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            添加计划
          </Button>
        }
      >
        <Table
          dataSource={plans}
          columns={columns}
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
      
      {/* 添加/编辑表单模态框 */}
      <Modal
        title={editingPlan ? '编辑训练计划' : '添加训练计划'}
        open={showForm}
        onCancel={() => setShowForm(false)}
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
                name="name"
                label="计划名称"
                rules={[{ required: true, message: '请输入计划名称' }]}
              >
                <Input placeholder="输入计划名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="coverImg"
                label="封面图片"
              >
                <Input placeholder="输入图片URL" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="description"
            label="计划描述"
            rules={[{ required: true, message: '请输入计划描述' }]}
          >
            <TextArea rows={4} placeholder="输入计划描述" />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="fitnessGoal"
                label="健身目标"
                rules={[{ required: true, message: '请选择健身目标' }]}
              >
                <Select placeholder="选择健身目标">
                  <Option value={1}>增肌</Option>
                  <Option value={2}>减脂</Option>
                  <Option value={3}>塑形</Option>
                  <Option value={4}>维持</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="difficulty"
                label="难度等级"
                rules={[{ required: true, message: '请选择难度等级' }]}
              >
                <Select placeholder="选择难度等级">
                  <Option value={1}>初级</Option>
                  <Option value={2}>中级</Option>
                  <Option value={3}>高级</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="bodyFocus"
                label="锻炼部位"
                rules={[{ required: true, message: '请输入锻炼部位' }]}
              >
                <Input placeholder="如：胸部,手臂,腹部" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="durationWeeks"
                label="持续周数"
                rules={[{ required: true, message: '请输入持续周数' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="sessionsPerWeek"
                label="每周训练次数"
                rules={[{ required: true, message: '请输入每周训练次数' }]}
              >
                <InputNumber min={1} max={7} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="equipmentNeeded"
                label="所需器材"
              >
                <Input placeholder="如：哑铃,瑜伽垫" />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider orientation="left">训练安排</Divider>
          
          {/* 训练详情表格 */}
          {renderDetailsTable()}
          
          <Button 
            type="dashed" 
            block 
            icon={<FileAddOutlined />} 
            onClick={() => setShowDetailDrawer(true)}
            style={{ marginTop: 16 }}
          >
            添加训练安排
          </Button>
          
          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <Button style={{ marginRight: 8 }} onClick={() => setShowForm(false)}>
              取消
            </Button>
            <Button type="primary" htmlType="submit" style={{ background: '#52c41a', borderColor: '#52c41a' }}>
              保存
            </Button>
          </div>
        </Form>
      </Modal>
      
      {/* 添加训练详情抽屉 */}
      <Drawer
        title="添加训练安排"
        width={500}
        onClose={() => setShowDetailDrawer(false)}
        open={showDetailDrawer}
        extra={
          <Button 
            type="primary" 
            onClick={handleAddDetail}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            添加
          </Button>
        }
      >
        <Form
          form={detailForm}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="weekNum"
                label="周数"
                rules={[{ required: true, message: '请输入周数' }]}
              >
                <InputNumber 
                  min={1} 
                  max={editingPlan?.durationWeeks || 12} 
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dayNum"
                label="天数"
                rules={[{ required: true, message: '请输入天数' }]}
              >
                <InputNumber 
                  min={1} 
                  max={editingPlan?.sessionsPerWeek || 7} 
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="title"
            label="训练标题"
            rules={[{ required: true, message: '请输入训练标题' }]}
          >
            <Input placeholder="如：上肢力量训练" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="训练描述"
            rules={[{ required: true, message: '请输入训练描述' }]}
          >
            <TextArea rows={4} placeholder="详细描述这天的训练内容" />
          </Form.Item>
          
          <Form.Item
            name="courseId"
            label="关联课程ID"
          >
            <InputNumber style={{ width: '100%' }} placeholder="可选，关联的课程ID" />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default PlanManagement; 