import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';

const { Content } = Layout;

const AuthLayout = () => {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div 
          style={{ 
            width: '100%', 
            maxWidth: 400, 
            background: '#fff', 
            padding: 24, 
            borderRadius: 4,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 style={{ color: '#52c41a', fontSize: 28 }}>Eat2Fit</h1>
            <div>健康生活解决方案</div>
          </div>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};

export default AuthLayout; 