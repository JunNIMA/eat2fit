import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Upload, Avatar, Select, InputNumber, message, Tabs } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, UploadOutlined } from '@ant-design/icons';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateUserInfo } from '@/api/user';
import { fetchUserInfo } from '@/store/slices/userSlice';
import { handleApiError } from '@/utils/errorHandler';
import { getToken } from '@/utils/auth';

const { Option } = Select;
const { TabPane } = Tabs;

// 移除全局的hasRequestedData标记
// let hasRequestedData = false;

const Profile = () => {
  const [form] = Form.useForm();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { info, loading } = useAppSelector(state => state.user);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // 每次组件挂载时都获取用户资料，不依赖缓存
    console.log('Profile组件：初始化获取用户资料');
    
    if (user?.userId) {
      console.log('Profile组件：获取用户资料，ID:', user.userId);
      dispatch(fetchUserInfo(user.userId));
    } else {
      console.warn('无法加载用户资料：用户ID未找到');
      // 如果通过localStorage有userId但auth中没有，尝试从localStorage获取
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        console.log('Profile组件：从localStorage恢复用户ID:', storedUserId);
        dispatch(fetchUserInfo(parseInt(storedUserId)));
      }
    }
  }, [dispatch, user?.userId]); // 添加user?.userId作为依赖项，确保用户变化时重新获取数据

  useEffect(() => {
    if (info) {
      form.setFieldsValue({
        username: info.username,
        nickname: info.nickname,
        email: info.email,
        phone: info.phone,
        gender: info.gender,
        age: info.age,
        height: info.height,
        weight: info.weight,
        fitnessGoal: info.fitnessGoal,
      });
    }
  }, [info, form]);

  const handleSave = async (values: any) => {
    if (!user?.userId) return;
    
    setSaving(true);
    try {
      const response = await updateUserInfo(user.userId, values);
      if (handleApiError(response, true, '更新失败')) {
        message.success('信息更新成功');
        dispatch(fetchUserInfo(user.userId));
      }
    } catch (error: any) {
      handleApiError({
        success: false,
        code: 500,
        message: error?.message || '保存失败，请重试',
        data: null
      }, true, '更新失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <Card 
        title="个人资料"
        loading={loading}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="基本信息" key="1">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <Avatar 
                  size={100} 
                  src={info?.avatar} 
                  icon={<UserOutlined />} 
                  style={{ marginBottom: 16 }}
                />
                <Upload 
                  showUploadList={false}
                  action="/api/user/profile"
                  name="file"
                  headers={{
                    Authorization: `Bearer ${getToken()}`
                  }}
                  onChange={(info) => {
                    if (info.file.status === 'done') {
                      const avatarUrl = info.file.response.data;
                      // 更新用户头像
                      if (user?.userId) {
                        updateUserInfo(user.userId, { avatar: avatarUrl })
                          .then(() => {
                            message.success('头像更新成功');
                            // 重新获取用户信息
                            dispatch(fetchUserInfo(user.userId));
                          })
                          .catch(() => {
                            message.error('头像更新失败');
                          });
                      }
                    } else if (info.file.status === 'error') {
                      message.error('头像上传失败');
                    }
                  }}
                >
                  <Button icon={<UploadOutlined />}>更换头像</Button>
                </Upload>
              </div>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
            >
              <Form.Item label="用户名" name="username">
                <Input disabled prefix={<UserOutlined />} placeholder="用户名" />
              </Form.Item>

              <Form.Item label="昵称" name="nickname">
                <Input prefix={<UserOutlined />} placeholder="昵称" />
              </Form.Item>

              <Form.Item label="邮箱" name="email">
                <Input prefix={<MailOutlined />} placeholder="邮箱" />
              </Form.Item>

              <Form.Item label="手机号" name="phone">
                <Input prefix={<PhoneOutlined />} placeholder="手机号" />
              </Form.Item>

              <Form.Item label="性别" name="gender">
                <Select placeholder="选择性别">
                  <Option value={1}>男</Option>
                  <Option value={2}>女</Option>
                  <Option value={0}>保密</Option>
                </Select>
              </Form.Item>

              <Button 
                type="primary" 
                htmlType="submit" 
                loading={saving}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                保存
              </Button>
            </Form>
          </TabPane>

          <TabPane tab="健康信息" key="2">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
            >
              <Form.Item label="年龄" name="age">
                <InputNumber min={1} max={120} />
              </Form.Item>

              <Form.Item label="身高 (CM)" name="height">
                <InputNumber min={50} max={250} step={0.1} />
              </Form.Item>

              <Form.Item label="体重 (KG)" name="weight">
                <InputNumber min={20} max={300} step={0.1} />
              </Form.Item>

              <Form.Item label="健身目标" name="fitnessGoal">
                <Select placeholder="选择您的健身目标">
                  <Option value={1}>增肌</Option>
                  <Option value={2}>减脂</Option>
                  <Option value={3}>塑形</Option>
                  <Option value={4}>维持</Option>
                </Select>
              </Form.Item>

              <Button 
                type="primary" 
                htmlType="submit" 
                loading={saving}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                保存
              </Button>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Profile;