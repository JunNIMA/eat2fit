import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Card, Typography, Avatar, List, Spin, Divider, Menu, message, Tooltip, Alert } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined, PlusCircleOutlined, DeleteOutlined, HistoryOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { chatWithCoach, getChatHistoryList, getChatHistory, MessageVO } from '@/api/ai';
import { generateUUID } from '@/utils/helpers';
import { ApiResponse } from '@/types';

const { TextArea } = Input;
const { Title, Paragraph, Text } = Typography;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// 简单的文本格式化函数
const formatText = (text: string): JSX.Element => {
  // 按行分割文本
  const lines = text.split('\n');
  
  return (
    <>
      {lines.map((line, index) => {
        // 检查列表项
        if (line.match(/^[\*\-\•]\s+/)) {
          return <p key={index} style={{ margin: '4px 0', paddingLeft: '12px' }}>• {line.replace(/^[\*\-\•]\s+/, '')}</p>;
        }
        
        // 检查加粗文本
        const boldPattern = /\*\*(.*?)\*\*/g;
        let formattedLine = line;
        let match;
        let segments = [];
        let lastIndex = 0;
        
        while ((match = boldPattern.exec(line)) !== null) {
          // 添加匹配前的文本
          segments.push(line.substring(lastIndex, match.index));
          // 添加加粗的文本
          segments.push(<strong key={`bold-${match.index}`}>{match[1]}</strong>);
          lastIndex = match.index + match[0].length;
        }
        
        // 添加剩余的文本
        if (lastIndex < line.length) {
          segments.push(line.substring(lastIndex));
        }
        
        // 如果没有特殊格式，直接返回行
        if (segments.length === 0) {
          return <p key={index} style={{ margin: '8px 0' }}>{line}</p>;
        }
        
        // 返回包含格式化元素的段落
        return <p key={index} style={{ margin: '8px 0' }}>{segments}</p>;
      })}
    </>
  );
};

const CoachChat: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState('');
  const [historyIds, setHistoryIds] = useState<string[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const historyControllerRef = useRef<AbortController | null>(null);
  const initialized = useRef(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 组件加载时初始化，使用useRef避免重复调用
  useEffect(() => {
    const initComponent = async () => {
      try {
        if (!initialized.current) {
          initialized.current = true;
          
          // 加载历史对话列表
          try {
            await fetchHistoryList();
          } catch (error) {
            console.error('获取历史记录失败但继续初始化:', error);
          }
          
          // 首次加载时创建本地会话ID，但不发送网络请求
          if (!chatId) {
            const newId = generateUUID();
            setChatId(newId);
            setMessages([{
              role: 'assistant',
              content: '你好！我是你的健身教练奶刚，有什么关于健身或营养方面的问题我可以帮你解答吗？'
            }]);
          }
        }
      } catch (error) {
        console.error('组件初始化失败:', error);
        setErrorMessage('应用初始化失败，请刷新页面重试');
      }
    };
    
    initComponent();
    
    // 组件卸载时取消进行中的请求和关闭流
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (readerRef.current) {
        readerRef.current.cancel().catch(err => console.error('取消读取器失败:', err));
      }
      if (historyControllerRef.current) {
        historyControllerRef.current.abort();
      }
    };
  }, []);

  // 获取历史会话列表
  const fetchHistoryList = async () => {
    try {
      setHistoryLoading(true);
      setErrorMessage(null);
      
      // 取消之前的请求
      if (historyControllerRef.current) {
        historyControllerRef.current.abort();
      }
      
      // 创建可取消的请求
      const controller = new AbortController();
      historyControllerRef.current = controller;
      
      // 设置超时
      const timeoutId = setTimeout(() => {
        controller.abort('获取历史会话超时');
      }, 5000);
      
      try {
        // 请求历史会话列表 (API已修改为直接返回字符串数组)
        const historyIds = await getChatHistoryList('chat');
        setHistoryIds(historyIds);
      } finally {
        // 清除超时计时器
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('获取历史会话失败:', error);
      if (error instanceof Error) {
        console.error('错误详情:', error.message);
        message.error('获取历史会话失败: ' + error.message);
      }
    } finally {
      setHistoryLoading(false);
      historyControllerRef.current = null;
    }
  };

  // 加载特定会话的历史记录
  const loadChatHistory = async (selectedChatId: string) => {
    // 如果是当前会话，不重复加载
    if (selectedChatId === chatId) return;
    
    // 取消之前的请求
    if (historyControllerRef.current) {
      historyControllerRef.current.abort();
    }
    
    // 创建可取消的请求
    const controller = new AbortController();
    historyControllerRef.current = controller;
    
    try {
      setLoading(true);
      setErrorMessage(null);
      
      // 设置超时
      const timeoutId = setTimeout(() => {
        controller.abort('获取聊天历史超时');
      }, 5000);
      
      try {
        // 请求聊天历史 (API已修改为直接返回消息数组)
        const historyMessages = await getChatHistory('chat', selectedChatId);
        
        if (historyMessages && historyMessages.length > 0) {
          // 转换消息格式
          const formattedMessages = historyMessages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          }));
          
          // 更新消息列表和当前会话ID
          setMessages(formattedMessages);
          setChatId(selectedChatId);
        } else {
          // 如果获取失败但API返回成功，也显示提示
          message.warning('该会话没有历史记录');
        }
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('获取聊天历史失败:', error);
      
      let errorText = '获取聊天历史失败';
      if (error instanceof Error) {
        errorText = `获取聊天历史失败: ${error.message}`;
        console.error('错误详情:', error.stack);
      }
      
      message.error(errorText);
    } finally {
      setLoading(false);
      historyControllerRef.current = null;
    }
  };

  // 创建新会话
  const newChat = () => {
    // 清空当前消息，显示欢迎消息
    setMessages([{
      role: 'assistant',
      content: '你好！我是你的健身教练奶刚，有什么关于健身或营养方面的问题我可以帮你解答吗？'
    }]);
    
    // 生成新会话ID
    const newId = generateUUID();
    setChatId(newId);
  };

  // 发送消息
  const handleSend = async () => {
    if (!inputValue.trim() || loading) return;
    
    // 清除任何显示的错误
    setErrorMessage(null);
    
    // 添加用户消息
    const userMessage = { role: 'user' as const, content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    
    // 准备接收AI回复
    setLoading(true);
    let assistantMessage = { role: 'assistant' as const, content: '' };
    setMessages(prev => [...prev, assistantMessage]);
    
    // 保存输入值并清空输入框，提高响应感
    const currentInput = inputValue;
    setInputValue('');
    
    try {
      // 创建可取消的请求
      const controller = new AbortController();
      abortControllerRef.current = controller;
      
      // 确保发送非空内容
      if (!currentInput.trim()) {
        throw new Error('不能发送空消息');
      }
      
      // 发送请求，此处会自动将当前chatId保存到服务器
      const response = await chatWithCoach(currentInput, chatId);
      
      if (!response.ok) {
        throw new Error(`网络请求失败: ${response.status} ${response.statusText}`);
      }
      
      // 将当前chatId添加到本地历史ID列表（如果不存在）
      setHistoryIds(prev => {
        if (!prev.includes(chatId)) {
          return [chatId, ...prev];
        }
        return prev;
      });
      
      // 获取响应流
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }
      
      // 保存reader到引用中，以便可以在组件卸载时取消
      readerRef.current = reader;
      
      // 设置解码器
      const decoder = new TextDecoder();
      let responseText = '';
      
      // 读取流
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // 解码并处理数据块
        const chunk = decoder.decode(value, { stream: true });
        console.log('收到数据块:', chunk);
        
        // 处理SSE格式的数据，每行可能以"data:"开头
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data:')) {
            // 移除"data:"前缀并处理内容
            const content = line.substring(5).trim();
            if (content) {
              responseText += content;
            }
          } else if (line.trim() && !line.startsWith(':')) {
            // 如果不是空行、注释行或标准SSE格式，直接添加
            responseText += line.trim();
          }
          // 忽略空行和注释行
        }
        
        // 更新消息内容
        setMessages(prev => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: responseText
            };
          }
          return updated;
        });
        
        // 确保滚动到最新消息
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (error) {
      console.error('聊天请求失败:', error);
      
      // 设置详细的错误消息以在UI中显示
      let errorText = '聊天请求失败';
      if (error instanceof Error) {
        errorText = error.message;
        console.log('错误详情:', error.stack);
      }
      
      setErrorMessage(errorText);
      
      // 更新最后一条消息为错误提示，而不是完全移除它
      setMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: '抱歉，我暂时无法回应，请稍后再试。'
          };
        }
        return updated;
      });
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
      readerRef.current = null;
    }
  };
  
  // 消息列表滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // 手动触发窗口大小调整，确保布局更新
    window.dispatchEvent(new Event('resize'));
  }, [messages]);

  // 计算侧边栏的高度
  useEffect(() => {
    const updateHeight = () => {
      if (chatContainerRef.current) {
        const windowHeight = window.innerHeight;
        const headerHeight = 64; // 预估的头部高度
        const footerHeight = 16; // 预估的底部间距
        chatContainerRef.current.style.height = `${windowHeight - headerHeight - footerHeight}px`;
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    
    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  // 查看历史对话列表按钮的点击处理
  const handleViewHistory = async () => {
    if (historyLoading) return;
    
    try {
      setHistoryLoading(true);
      setErrorMessage(null);
      
      // 取消之前的请求
      if (historyControllerRef.current) {
        historyControllerRef.current.abort();
      }
      
      // 创建可取消的请求
      const controller = new AbortController();
      historyControllerRef.current = controller;
      
      // 设置超时
      const timeoutId = setTimeout(() => {
        controller.abort('获取历史会话超时');
      }, 5000);
      
      try {
        // 请求历史会话列表 (API已修改为直接返回字符串数组)
        const historyIds = await getChatHistoryList('chat');
        setHistoryIds(historyIds);
      } finally {
        // 清除超时计时器
        clearTimeout(timeoutId);
      }
    } catch (error) {
      console.error('获取历史会话失败:', error);
      if (error instanceof Error) {
        console.error('错误详情:', error.message);
        message.error('获取历史会话失败: ' + error.message);
      }
    } finally {
      setHistoryLoading(false);
      historyControllerRef.current = null;
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }} ref={chatContainerRef}>
      {/* 左侧会话列表 */}
      <div style={{ 
        width: '250px', 
        borderRight: '1px solid #e8e8e8', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f9f9f9'
      }}>
        <div style={{ padding: '16px' }}>
          <Button 
            type="primary" 
            icon={<PlusCircleOutlined />} 
            onClick={newChat}
            style={{ width: '100%', background: '#52c41a', borderColor: '#52c41a', marginBottom: '8px' }}
          >
            开启新对话
          </Button>
          <Button 
            icon={<HistoryOutlined />} 
            onClick={handleViewHistory}
            loading={historyLoading}
            style={{ width: '100%' }}
          >
            查看历史对话
          </Button>
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <List
            loading={historyLoading}
            dataSource={historyIds.includes(chatId) ? historyIds : [chatId, ...historyIds].filter(id => id)}
            renderItem={id => (
              <div 
                key={id}
                onClick={() => loadChatHistory(id)}
                style={{ 
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: id === chatId ? '#e6f7ff' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '180px'
                }}>
                  <HistoryOutlined style={{ marginRight: 8 }} />
                  <span>对话 {id.substring(0, 8)}</span>
                </div>
                {id === chatId && (
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      // 这里可以添加删除会话的功能
                      message.info('删除会话功能待实现');
                    }}
                  >
                    <Tooltip title="删除会话">
                      <DeleteOutlined style={{ color: '#999' }} />
                    </Tooltip>
                  </div>
                )}
              </div>
            )}
          />
        </div>
      </div>
      
      {/* 右侧聊天界面 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', padding: '16px' }}>
        {/* 对话标题 */}
        <div style={{ marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>与健身教练奶刚对话</Title>
          <Text type="secondary">获取健身和营养方面的专业建议</Text>
        </div>
        
        {/* 错误提示 */}
        {errorMessage && (
          <Alert
            message={errorMessage}
            type="error"
            showIcon
            closable
            onClose={() => setErrorMessage(null)}
            style={{ marginBottom: 16 }}
            icon={<CloseCircleOutlined />}
          />
        )}
        
        {/* 聊天消息区域 */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto',
          marginBottom: 16,
          padding: '16px',
          background: '#f9f9f9',
          borderRadius: 8,
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.05)'
        }}>
          <List
            itemLayout="horizontal"
            dataSource={messages}
            renderItem={item => (
              <List.Item
                style={{
                  flexDirection: 'column',
                  alignItems: item.role === 'user' ? 'flex-end' : 'flex-start',
                  padding: '8px 0',
                  border: 'none'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    maxWidth: '80%',
                    padding: 16,
                    borderRadius: 8,
                    backgroundColor: item.role === 'user' ? '#52c41a1a' : '#ffffff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ marginRight: 12 }}>
                    <Avatar 
                      icon={item.role === 'user' ? <UserOutlined /> : <RobotOutlined />} 
                      style={{ 
                        backgroundColor: item.role === 'user' ? '#52c41a' : '#1890ff'
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    {formatText(item.content)}
                  </div>
                </div>
              </List.Item>
            )}
          />
          <div ref={messagesEndRef} />
        </div>
        
        {/* 输入框和发送按钮 */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          gap: 16,
          padding: '16px',
          borderRadius: 8,
          background: '#fff',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
        }}>
          <TextArea
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="输入您的问题..."
            autoSize={{ minRows: 1, maxRows: 6 }}
            style={{ 
              flex: 1,
              borderRadius: 4,
              resize: 'none',
              padding: '8px 12px'
            }}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={loading}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={loading}
            style={{ 
              height: 40, 
              width: 80,
              background: '#52c41a', 
              borderColor: '#52c41a',
              borderRadius: 4 
            }}
          >
            发送
          </Button>
        </div>
        
        {loading && (
          <div style={{ textAlign: 'center', margin: '8px 0' }}>
            <Spin size="small" /> <span style={{ marginLeft: 8, fontSize: 12 }}>奶刚教练正在回复...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoachChat; 