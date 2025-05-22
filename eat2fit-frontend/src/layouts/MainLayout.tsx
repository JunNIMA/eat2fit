import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, Drawer } from 'antd';
import { 
  DashboardOutlined, 
  UserOutlined, 
  MenuOutlined,
  FireOutlined, 
  AppleOutlined,
  LogoutOutlined,
  VideoCameraOutlined,
  HeartOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  UnorderedListOutlined,
  BookOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';

const { Header, Content, Sider } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { info } = useAppSelector(state => state.user);
  
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setDrawerVisible(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };
  
  const menu = (
    <Menu>
      <Menu.Item key="profile" onClick={() => navigate('/user/profile')}>
        <UserOutlined /> 个人资料
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" onClick={handleLogout}>
        <LogoutOutlined /> 退出登录
      </Menu.Item>
    </Menu>
  );
  
  const fitnessItems = [
    {
      key: '/fitness',
      label: '健身计划',
      icon: <FireOutlined />,
      onClick: () => navigate('/fitness')
    },
    {
      key: '/fitness/courses',
      label: '训练课程',
      icon: <VideoCameraOutlined />,
      onClick: () => navigate('/fitness/courses')
    },
    {
      key: '/fitness/myplans',
      label: '我的训练',
      icon: <HeartOutlined />,
      onClick: () => navigate('/fitness/myplans')
    },
    {
      key: '/fitness/checkin',
      label: '训练打卡',
      icon: <CheckCircleOutlined />,
      onClick: () => navigate('/fitness/checkin')
    },
    {
      key: '/fitness/favorites',
      label: '我的收藏',
      icon: <HeartOutlined />,
      onClick: () => navigate('/fitness/favorites')
    },
    {
      key: '/fitness/manage/plans',
      label: '计划管理',
      icon: <SettingOutlined />,
      onClick: () => navigate('/fitness/manage/plans')
    }
  ];
  
  const dietItems = [
    {
      key: '/diet/foods',
      label: '食物列表',
      icon: <UnorderedListOutlined />,
      onClick: () => navigate('/diet/foods')
    },
    {
      key: '/diet/recipes',
      label: '食谱列表',
      icon: <BookOutlined />,
      onClick: () => navigate('/diet/recipes')
    },
    {
      key: '/diet/favorites',
      label: '我的收藏',
      icon: <HeartOutlined />,
      onClick: () => navigate('/diet/favorites')
    }
  ];
  
  // AI功能菜单项
  const aiItems = [
    {
      key: '/ai/coach',
      label: '智能教练',
      icon: <RobotOutlined />,
      onClick: () => navigate('/ai/coach')
    },
    {
      key: '/ai/quiz',
      label: '健康问答',
      icon: <BookOutlined />,
      onClick: () => navigate('/ai/quiz')
    }
  ];
  
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
      onClick: () => navigate('/dashboard')
    },
    {
      key: 'fitness',
      icon: <FireOutlined />,
      label: '健身',
      children: fitnessItems
    },
    {
      key: 'diet',
      icon: <AppleOutlined />,
      label: '饮食',
      children: dietItems
    },
    {
      key: 'ai',
      icon: <RobotOutlined />,
      label: '智能助手',
      children: aiItems
    },
    {
      key: '/user/profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/user/profile')
    }
  ];
  
  // 确定当前选中的菜单项
  const getSelectedKeys = () => {
    const path = location.pathname;
    
    // 如果是根路径
    if (path === '/') {
      return ['/'];
    }
    
    // 检查是否是健身子菜单路径
    if (path.startsWith('/fitness/')) {
      // 获取完整路径用于子菜单高亮
      for (const item of fitnessItems) {
        if (path === item.key) {
          return [item.key];
        }
      }
      // 尝试前缀匹配
      for (const item of fitnessItems) {
        if (path.startsWith(item.key + '/')) {
          return [item.key];
        }
      }
      return [path];
    }
    
    // 检查是否是饮食子菜单路径
    if (path.startsWith('/diet/')) {
      // 获取完整路径用于子菜单高亮
      for (const item of dietItems) {
        if (path === item.key) {
          return [item.key];
        }
      }
      // 尝试前缀匹配
      for (const item of dietItems) {
        if (path.startsWith(item.key + '/')) {
          return [item.key];
        }
      }
      return [path];
    }
    
    // 检查是否是AI子菜单路径
    if (path.startsWith('/ai/')) {
      // 获取完整路径用于子菜单高亮
      for (const item of aiItems) {
        if (path === item.key) {
          return [item.key];
        }
      }
      // 尝试前缀匹配
      for (const item of aiItems) {
        if (path.startsWith(item.key + '/')) {
          return [item.key];
        }
      }
      return [path];
    }
    
    // 其他一级菜单路径
    return [`/${path.split('/')[1]}`];
  };
  
  const selectedKeys = getSelectedKeys();
  
  // 确定哪些子菜单应该展开
  const getOpenKeys = () => {
    if (location.pathname === '/fitness' || location.pathname.startsWith('/fitness/')) {
      return ['fitness'];
    }
    if (location.pathname === '/diet' || location.pathname.startsWith('/diet/')) {
      return ['diet'];
    }
    if (location.pathname === '/ai' || location.pathname.startsWith('/ai/')) {
      return ['ai'];
    }
    return [];
  };
  
  const [openKeys, setOpenKeys] = useState(getOpenKeys());
  
  // 当路径变化时，更新openKeys
  useEffect(() => {
    setOpenKeys(prev => {
      const newOpenKeys = getOpenKeys();
      // 保留用户手动展开的其他菜单，同时确保当前路径相关的菜单展开
      return [...new Set([...prev, ...newOpenKeys])];
    });
  }, [location.pathname]);
  
  // 底部导航栏
  const mobileNavItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      onClick: () => navigate('/dashboard')
    },
    {
      key: '/fitness',
      icon: <FireOutlined />,
      onClick: () => setDrawerVisible(true)
    },
    {
      key: '/diet',
      icon: <AppleOutlined />,
      onClick: () => setDrawerVisible(true)
    },
    {
      key: '/ai',
      icon: <RobotOutlined />,
      onClick: () => navigate('/ai')
    },
    {
      key: '/user/profile',
      icon: <UserOutlined />,
      onClick: () => navigate('/user/profile')
    }
  ];
  
  // 底部导航条
  const renderMobileNav = () => (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      background: '#fff',
      padding: '8px 0',
      boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.15)',
      zIndex: 999
    }}>
      {mobileNavItems.map(item => (
        <div 
          key={item.key}
          onClick={item.onClick}
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            color: location.pathname.startsWith(item.key) ? '#52c41a' : 'inherit',
            fontSize: 20,
            padding: '4px 0'
          }}
        >
          {item.icon}
        </div>
      ))}
    </div>
  );
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={setCollapsed}
          theme="light"
          style={{
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 10
          }}
        >
          <div style={{ 
            height: '64px', 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            margin: '16px 0'
          }}>
            <div style={{ 
              color: '#52c41a',
              fontSize: collapsed ? '16px' : '24px',
              fontWeight: 'bold'
            }}>
              {collapsed ? 'E2F' : 'Eat2Fit'}
            </div>
          </div>
          
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            onOpenChange={(keys) => setOpenKeys(keys as string[])}
            items={menuItems}
          />
        </Sider>
      )}
      
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 9
        }}>
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button 
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setDrawerVisible(true)}
              />
              <span style={{ marginLeft: 12, fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>
                Eat2Fit
              </span>
            </div>
          )}
          
          <div style={{ marginLeft: 'auto' }}>
            <Dropdown overlay={menu} placement="bottomRight">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  size="large" 
                  src={info?.avatar}
                  icon={!info?.avatar && <UserOutlined />} 
                />
                {!isMobile && (
                  <span style={{ marginLeft: 8 }}>
                    {info?.nickname || user?.username || '用户'}
                  </span>
                )}
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content style={{ 
          margin: '16px',
          padding: isMobile ? '16px 8px 72px' : '24px',
          background: '#fff',
          borderRadius: '8px',
          minHeight: 'auto'
        }}>
          <Outlet />
        </Content>
        
        {isMobile && renderMobileNav()}
      </Layout>
      
      {/* 移动端侧边菜单抽屉 */}
      <Drawer
        title="菜单"
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={250}
      >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={[
            {
              key: '/dashboard',
              icon: <DashboardOutlined />,
              label: '仪表盘',
              onClick: () => {
                navigate('/dashboard');
                setDrawerVisible(false);
              }
            },
            {
              key: '/fitness',
              icon: <FireOutlined />,
              label: '健身计划',
              onClick: () => {
                navigate('/fitness');
                setDrawerVisible(false);
              }
            },
            {
              key: '/fitness/courses',
              icon: <VideoCameraOutlined />,
              label: '训练课程',
              onClick: () => {
                navigate('/fitness/courses');
                setDrawerVisible(false);
              }
            },
            {
              key: '/fitness/myplans',
              icon: <HeartOutlined />,
              label: '我的训练',
              onClick: () => {
                navigate('/fitness/myplans');
                setDrawerVisible(false);
              }
            },
            {
              key: '/fitness/checkin',
              icon: <CheckCircleOutlined />,
              label: '训练打卡',
              onClick: () => {
                navigate('/fitness/checkin');
                setDrawerVisible(false);
              }
            },
            {
              key: '/fitness/favorites',
              icon: <HeartOutlined />,
              label: '我的收藏',
              onClick: () => {
                navigate('/fitness/favorites');
                setDrawerVisible(false);
              }
            },
            {
              key: '/fitness/manage/plans',
              icon: <SettingOutlined />,
              label: '计划管理',
              onClick: () => {
                navigate('/fitness/manage/plans');
                setDrawerVisible(false);
              }
            },
            {
              key: '/diet/foods',
              icon: <UnorderedListOutlined />,
              label: '食物列表',
              onClick: () => {
                navigate('/diet/foods');
                setDrawerVisible(false);
              }
            },
            {
              key: '/diet/recipes',
              icon: <BookOutlined />,
              label: '食谱列表',
              onClick: () => {
                navigate('/diet/recipes');
                setDrawerVisible(false);
              }
            },
            {
              key: '/diet/favorites',
              icon: <HeartOutlined />,
              label: '我的收藏',
              onClick: () => {
                navigate('/diet/favorites');
                setDrawerVisible(false);
              }
            },
            {
              key: '/ai',
              icon: <RobotOutlined />,
              label: '智能助手',
              onClick: () => {
                navigate('/ai');
                setDrawerVisible(false);
              }
            },
            {
              key: '/ai/coach',
              icon: <RobotOutlined />,
              label: '智能教练',
              onClick: () => {
                navigate('/ai/coach');
                setDrawerVisible(false);
              }
            },
            {
              key: '/ai/quiz',
              icon: <BookOutlined />,
              label: '健康问答',
              onClick: () => {
                navigate('/ai/quiz');
                setDrawerVisible(false);
              }
            },
            {
              key: '/user/profile',
              icon: <UserOutlined />,
              label: '个人资料',
              onClick: () => {
                navigate('/user/profile');
                setDrawerVisible(false);
              }
            },
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: '退出登录',
              onClick: handleLogout
            }
          ]}
        />
      </Drawer>
    </Layout>
  );
};

export default MainLayout; 