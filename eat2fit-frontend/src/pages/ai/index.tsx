import React from 'react';
import { Card, Row, Col, Typography, Button } from 'antd';
import { RobotOutlined, BookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const AiIndex: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>智能助手</Title>
      <Paragraph>
        Eat2Fit智能助手提供健身和营养相关的AI智能服务，帮助您更好地实现健身目标。
      </Paragraph>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12}>
          <Card 
            hoverable 
            style={{ height: '100%' }}
            onClick={() => navigate('/ai/coach')}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <RobotOutlined style={{ fontSize: 36, color: '#52c41a', marginRight: 16 }} />
              <Title level={3} style={{ margin: 0 }}>智能健身教练</Title>
            </div>
            <Paragraph>
              与专业健身教练"奶刚"对话，获取个性化的健身训练和营养饮食建议。无论您是健身新手还是有经验的健身爱好者，都能获取专业指导。
            </Paragraph>
            <ul>
              <li>定制健身训练计划</li>
              <li>营养饮食指导</li>
              <li>训练动作解析</li>
              <li>健身常见问题解答</li>
            </ul>
            <Button 
              type="primary" 
              style={{ background: '#52c41a', borderColor: '#52c41a', marginTop: 16 }}
              onClick={() => navigate('/ai/coach')}
            >
              开始对话
            </Button>
          </Card>
        </Col>

        <Col xs={24} sm={12}>
          <Card 
            hoverable 
            style={{ height: '100%' }}
            onClick={() => navigate('/ai/quiz')}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
              <BookOutlined style={{ fontSize: 36, color: '#722ed1', marginRight: 16 }} />
              <Title level={3} style={{ margin: 0 }}>健康知识问答</Title>
            </div>
            <Paragraph>
              参加"健身智慧王"知识问答游戏，在趣味互动中学习健康知识。提供多种难度和主题，让您在游戏中成为健康达人。
            </Paragraph>
            <ul>
              <li>健身训练知识</li>
              <li>营养学基础</li>
              <li>健康生活方式</li>
              <li>体脂管理</li>
              <li>运动恢复</li>
            </ul>
            <Button 
              type="primary" 
              style={{ background: '#722ed1', borderColor: '#722ed1', marginTop: 16 }}
              onClick={() => navigate('/ai/quiz')}
            >
              开始问答
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AiIndex; 