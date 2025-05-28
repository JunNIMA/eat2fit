import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, Modal, Form, Input, Select, message, Tooltip, Row, Col, InputNumber } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, SearchOutlined, ReloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { getUserList, updateUserInfo, updateUserStatus, updateUserRole, resetUserPassword } from '@/api/user';
import { handleApiError } from '@/utils/errorHandler';
import { UserVO } from '@/types';
import { useAppSelector } from '@/store/hooks';

const { Option } = Select;
const { confirm } = Modal;

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAppSelector(state => state.auth);
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserVO | null>(null);
  const [users, setUsers] = useState<UserVO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchParams, setSearchParams] = useState<Record<string, any>>({});

  // 获取用户列表
  const fetchUsers = async (page = 1, size = 10, params = {}) => {
    setLoading(true);
    try {
      const response = await getUserList({
        page,
        size,
        ...params
      });
      
      if (handleApiError(response)) {
        setUsers(response.data.records);
        setPagination({
          ...pagination,
          current: page,
          total: response.data.total,
        });
      }
    } catch (error) {
      message.error('获取用户列表失败');
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取用户列表
  useEffect(() => {
    fetchUsers(pagination.current, pagination.pageSize);
  }, []);

  // 处理表格分页变化
  const handleTableChange = (pagination: any) => {
    fetchUsers(pagination.current, pagination.pageSize, searchParams);
  };

  // 处理用户编辑
  const handleEdit = (user: UserVO) => {
    // 检查是否为管理员用户，如果是则不允许编辑
    if (user.role === 1 && user.id !== currentUser?.userId) {
      message.warning('不能编辑其他管理员用户');
      return;
    }
    
    setSelectedUser(user);
    form.setFieldsValue({
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      phone: user.phone,
      status: user.status,
      role: user.role || 0, // 如果UserVO没有role字段，默认为0
      gender: user.gender,
      age: user.age,
      height: user.height,
      weight: user.weight,
      fitnessGoal: user.fitnessGoal
    });
    setEditModalVisible(true);
  };

  // 保存用户编辑
  const handleSave = async () => {
    if (!selectedUser) return;
    
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // 调用API更新用户信息
      const response = await updateUserInfo(selectedUser.id, values);
      
      if (handleApiError(response)) {
        message.success('用户信息更新成功');
        setEditModalVisible(false);
        // 重新获取用户列表
        fetchUsers(pagination.current, pagination.pageSize, searchParams);
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 切换用户状态
  const handleToggleStatus = (user: UserVO) => {
    // 检查是否为管理员用户，如果是则不允许修改状态
    if (user.role === 1 && user.id !== currentUser?.userId) {
      message.warning('不能修改其他管理员用户的状态');
      return;
    }
    
    const newStatus = user.status === 1 ? 0 : 1;
    const statusText = newStatus === 1 ? '启用' : '禁用';
    
    confirm({
      title: `确定要${statusText}用户 "${user.username}" 吗？`,
      icon: <ExclamationCircleOutlined />,
      content: newStatus === 0 ? '禁用后该用户将无法登录系统。' : '启用后该用户将恢复正常使用。',
      onOk: async () => {
        try {
          const response = await updateUserStatus(user.id, newStatus);
          
          if (handleApiError(response)) {
            message.success(`${statusText}成功`);
            // 重新获取用户列表
            fetchUsers(pagination.current, pagination.pageSize, searchParams);
          }
        } catch (error) {
          message.error(`${statusText}失败`);
          console.error(`${statusText}失败:`, error);
        }
      },
    });
  };

  // 修改用户角色
  const handleChangeRole = (user: UserVO) => {
    // 检查是否为管理员用户，如果是则不允许修改角色
    if (user.role === 1 && user.id !== currentUser?.userId) {
      message.warning('不能修改其他管理员用户的角色');
      return;
    }
    
    const newRole = user.role === 1 ? 0 : 1;
    const roleText = newRole === 1 ? '管理员' : '普通用户';
    
    confirm({
      title: `确定要将用户 "${user.username}" 的角色修改为${roleText}吗？`,
      icon: <ExclamationCircleOutlined />,
      content: newRole === 1 ? '设为管理员后，该用户将有权管理所有数据。' : '降为普通用户后，该用户将失去管理权限。',
      onOk: async () => {
        try {
          const response = await updateUserRole(user.id, newRole);
          
          if (handleApiError(response)) {
            message.success(`角色修改成功`);
            // 重新获取用户列表
            fetchUsers(pagination.current, pagination.pageSize, searchParams);
          }
        } catch (error) {
          message.error(`角色修改失败`);
          console.error(`角色修改失败:`, error);
        }
      },
    });
  };

  // 重置用户密码
  const handleResetPassword = (user: UserVO) => {
    // 检查是否为管理员用户，如果是则不允许重置密码
    if (user.role === 1 && user.id !== currentUser?.userId) {
      message.warning('不能重置其他管理员用户的密码');
      return;
    }
    
    confirm({
      title: `确定要重置用户 "${user.username}" 的密码吗？`,
      icon: <ExclamationCircleOutlined />,
      content: '重置后将生成随机密码，请妥善保存并及时通知用户。',
      onOk: async () => {
        try {
          const response = await resetUserPassword(user.id);
          
          if (handleApiError(response)) {
            Modal.success({
              title: '密码重置成功',
              content: (
                <div>
                  <p>用户"{user.username}"的新密码是：</p>
                  <p style={{ fontWeight: 'bold', fontSize: '18px', textAlign: 'center' }}>{response.data}</p>
                  <p>请妥善保存此密码并及时通知用户。</p>
                </div>
              ),
            });
          }
        } catch (error) {
          message.error(`密码重置失败`);
          console.error(`密码重置失败:`, error);
        }
      },
    });
  };

  // 处理搜索
  const handleSearch = (values: any) => {
    const params = Object.entries(values)
      .filter(([_, value]) => value !== undefined && value !== '')
      .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
    
    setSearchParams(params);
    fetchUsers(1, pagination.pageSize, params);
  };

  // 重置搜索
  const handleResetSearch = () => {
    searchForm.resetFields();
    setSearchParams({});
    fetchUsers(1, pagination.pageSize, {});
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 80,
      render: (role: number) => (
        <Tag color={role === 1 ? 'blue' : 'default'}>
          {role === 1 ? '管理员' : '普通用户'}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: UserVO) => {
        // 判断是否为管理员用户且不是当前用户
        const isOtherAdmin = record.role === 1 && record.id !== currentUser?.userId;
        
        return (
          <Space size="small">
            <Button 
              type="link" 
              onClick={() => handleEdit(record)}
              disabled={isOtherAdmin}
            >
              编辑
            </Button>
            <Button 
              type="link" 
              danger={record.status === 1}
              onClick={() => handleToggleStatus(record)}
              disabled={isOtherAdmin}
            >
              {record.status === 1 ? '禁用' : '启用'}
            </Button>
            <Button 
              type="link" 
              onClick={() => handleChangeRole(record)}
              disabled={isOtherAdmin}
            >
              {record.role === 1 ? '降级' : '升级'}
            </Button>
            <Tooltip title={isOtherAdmin ? "无法重置管理员密码" : "重置密码"}>
              <Button 
                type="link" 
                danger 
                onClick={() => handleResetPassword(record)}
                disabled={isOtherAdmin}
              >
                <LockOutlined />
              </Button>
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="user-management">
      <Card title="用户管理" style={{ marginBottom: 16 }}>
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: 16 }}
        >
          <Form.Item name="username">
            <Input placeholder="用户名" prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item name="nickname">
            <Input placeholder="昵称" />
          </Form.Item>
          <Form.Item name="status">
            <Select placeholder="状态" style={{ width: 100 }} allowClear>
              <Option value={1}>正常</Option>
              <Option value={0}>禁用</Option>
            </Select>
          </Form.Item>
          <Form.Item name="role">
            <Select placeholder="角色" style={{ width: 100 }} allowClear>
              <Option value={1}>管理员</Option>
              <Option value={0}>普通用户</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
              搜索
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={handleResetSearch} icon={<ReloadOutlined />}>
              重置
            </Button>
          </Form.Item>
        </Form>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          loading={loading}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title="编辑用户"
        open={editModalVisible}
        onOk={handleSave}
        onCancel={() => setEditModalVisible(false)}
        destroyOnClose
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input prefix={<UserOutlined />} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nickname"
                label="昵称"
                rules={[{ required: true, message: '请输入昵称' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="邮箱"
                rules={[{ type: 'email', message: '请输入有效的邮箱地址' }]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="手机号"
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="status"
                label="状态"
                rules={[{ required: true, message: '请选择状态' }]}
              >
                <Select>
                  <Option value={1}>正常</Option>
                  <Option value={0}>禁用</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="role"
                label="角色"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select>
                  <Option value={0}>普通用户</Option>
                  <Option value={1}>管理员</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="gender"
                label="性别"
              >
                <Select>
                  <Option value={1}>男</Option>
                  <Option value={2}>女</Option>
                  <Option value={0}>保密</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="age"
                label="年龄"
              >
                <InputNumber min={1} max={120} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="height"
                label="身高(cm)"
              >
                <InputNumber min={50} max={250} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="weight"
                label="体重(kg)"
              >
                <InputNumber min={20} max={300} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="fitnessGoal"
                label="健身目标"
              >
                <Select>
                  <Option value={1}>增肌</Option>
                  <Option value={2}>减脂</Option>
                  <Option value={3}>塑形</Option>
                  <Option value={4}>维持</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement; 