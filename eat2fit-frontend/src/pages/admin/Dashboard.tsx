import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Typography, message } from 'antd';
import { UserOutlined, SolutionOutlined, TeamOutlined, FileOutlined } from '@ant-design/icons';
import { getUserList, getUserStats } from '@/api/user';
import { getFitnessPlanStats } from '@/api/fitness';
import { getDietRecipeStats } from '@/api/diet';
import { handleApiError } from '@/utils/errorHandler';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

interface AdminStats {
  totalUsers: number;
  newUsersToday: number;
  fitnessPlansCount: number;
  dietPlansCount: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    newUsersToday: 0,
    fitnessPlansCount: 0,
    dietPlansCount: 0
  });

  // 获取管理员仪表盘数据
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 获取最近注册的用户
        const response = await getUserList({
          page: 1,
          size: 5,
          // 按注册时间倒序排列
          sort: 'createTime,desc'
        });
        
        if (handleApiError(response, false)) {
          setRecentUsers(response.data.records);
          // 设置总用户数
          setStats(prev => ({
            ...prev,
            totalUsers: response.data.total
          }));
        }
        
        // 获取用户统计数据（包括今日新增用户）
        const userStatsResponse = await getUserStats();
        if (handleApiError(userStatsResponse, false)) {
          setStats(prev => ({
            ...prev,
            newUsersToday: userStatsResponse.data.todayNewCount
          }));
        }
        
        // 获取健身计划统计数据
        const fitnessStatsResponse = await getFitnessPlanStats();
        if (handleApiError(fitnessStatsResponse, false)) {
          setStats(prev => ({
            ...prev,
            fitnessPlansCount: fitnessStatsResponse.data.totalCount
          }));
        }
        
        // 获取饮食方案统计数据
        const dietStatsResponse = await getDietRecipeStats();
        if (handleApiError(dietStatsResponse, false)) {
          setStats(prev => ({
            ...prev,
            dietPlansCount: dietStatsResponse.data.totalCount
          }));
        }
      } catch (error) {
        console.error('获取仪表盘数据失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const columns = [
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <span style={{ color: status === 1 ? 'green' : 'red' }}>
          {status === 1 ? '正常' : '禁用'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <>
          <Button 
            type="link" 
            size="small" 
            onClick={() => navigate(`/admin/users?edit=${record.id}`)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            size="small" 
            danger
          >
            {record.status === 1 ? '禁用' : '启用'}
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="admin-dashboard">
      <Title level={2}>管理员控制台</Title>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={stats.totalUsers}
              loading={loading}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日新增用户"
              value={stats.newUsersToday}
              loading={loading}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="健身计划数"
              value={stats.fitnessPlansCount}
              loading={loading}
              prefix={<SolutionOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="饮食方案数"
              value={stats.dietPlansCount}
              loading={loading}
              prefix={<FileOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="最近注册用户" style={{ marginBottom: 24 }} loading={loading}>
        <Table 
          columns={columns} 
          dataSource={recentUsers} 
          rowKey="id"
          pagination={false} 
        />
      </Card>
      
      <Row gutter={16}>
        <Col span={12}>
          <Button 
            type="primary" 
            style={{ marginRight: 16 }}
            onClick={() => navigate('/admin/users')}
          >
            用户管理
          </Button>
          <Button 
            onClick={() => window.location.reload()}
          >
            刷新数据
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard; 