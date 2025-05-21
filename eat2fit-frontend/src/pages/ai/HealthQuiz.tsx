import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Card, Typography, Avatar, List, Spin, Radio, Space, Tag, message, Tooltip, Alert } from 'antd';
import { SendOutlined, TrophyOutlined, QuestionCircleOutlined, BookOutlined, PlusCircleOutlined, DeleteOutlined, HistoryOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { healthQA, getChatHistoryList, getChatHistory, MessageVO } from '@/api/ai';
import { generateUUID } from '@/utils/helpers';

const { TextArea } = Input;
const { Title, Paragraph, Text } = Typography;
const { Group: RadioGroup } = Radio;

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
        
        // 检查选项（如A. B. C. D.）
        const optionMatch = line.match(/^([A-D])\.\s+(.*)/);
        if (optionMatch) {
          return (
            <p key={index} style={{ margin: '4px 0', fontWeight: 'bold' }}>
              <span style={{ 
                display: 'inline-block', 
                width: '24px', 
                height: '24px', 
                lineHeight: '24px', 
                textAlign: 'center',
                borderRadius: '50%',
                backgroundColor: '#722ed1',
                color: 'white',
                marginRight: '8px'
              }}>
                {optionMatch[1]}
              </span>
              {optionMatch[2]}
            </p>
          );
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

interface QuizMessage {
  role: 'user' | 'assistant';
  content: string;
}

const difficultyOptions = [
  { label: '初级', value: '初级' },
  { label: '中级', value: '中级' },
  { label: '高级', value: '高级' },
];

const topicOptions = [
  { label: '健身训练', value: '健身训练' },
  { label: '营养学基础', value: '营养学基础' },
  { label: '健康生活方式', value: '健康生活方式' },
  { label: '体脂管理', value: '体脂管理' },
  { label: '运动恢复', value: '运动恢复' },
];

const HealthQuiz: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<QuizMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState('');
  const [chatIds, setChatIds] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState('初级');
  const [selectedTopic, setSelectedTopic] = useState('健身训练');
  const [questionCount, setQuestionCount] = useState('5');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const initialized = useRef(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 加载聊天历史ID列表
  const loadChatHistoryIds = async () => {
    try {
      setLoadingHistory(true);
      const historyIds = await getChatHistoryList('health-qa');
      if (historyIds && historyIds.length > 0) {
        setChatIds(historyIds);
        
        // 如果没有设置当前会话ID，则使用第一个历史ID
        if (!chatId && historyIds.length > 0) {
          setChatId(historyIds[0]);
          await loadChatHistory(historyIds[0]);
        }
      } else {
        // 如果没有历史记录，创建新会话
        const newId = generateUUID();
        setChatId(newId);
        setChatIds([newId]);
      }
    } catch (error) {
      console.error('加载聊天历史ID失败:', error);
      setErrorMessage('无法加载聊天历史，请刷新页面重试');
    } finally {
      setLoadingHistory(false);
    }
  };

  // 加载特定聊天的历史记录
  const loadChatHistory = async (id: string) => {
    try {
      setLoadingHistory(true);
      const historyMessages = await getChatHistory('health-qa', id);
      
      if (historyMessages && historyMessages.length > 0) {
        // 将API返回的MessageVO转换为QuizMessage
        const convertedMessages: QuizMessage[] = historyMessages.map(msg => ({
          role: msg.role === 'USER' ? 'user' : 'assistant',
          content: msg.content
        }));
        
        setMessages(convertedMessages);
        
        // 检查最后一条消息，判断游戏是否已开始
        const lastMessage = convertedMessages[convertedMessages.length - 1];
        setGameStarted(lastMessage && (
          lastMessage.content.includes('题目') || 
          lastMessage.content.includes('请在30秒内选择') ||
          lastMessage.content.includes('得分')
        ));
      } else {
        // 如果没有历史记录，显示欢迎消息
        setMessages([{
          role: 'assistant',
          content: `这是问答会话 ${id.substring(0, 8)}\n\n准备开始一轮新的健康知识问答吗？请选择难度和主题！`
        }]);
        setGameStarted(false);
      }
    } catch (error) {
      console.error('加载聊天历史失败:', error);
      setErrorMessage('无法加载聊天内容，请刷新页面重试');
    } finally {
      setLoadingHistory(false);
    }
  };

  // 组件加载时初始化，使用useRef避免重复调用
  useEffect(() => {
    const initComponent = async () => {
      try {
        if (!initialized.current) {
          initialized.current = true;
          
          // 加载历史聊天记录
          await loadChatHistoryIds();
        }
      } catch (error) {
        console.error('组件初始化失败:', error);
        setErrorMessage('应用初始化失败，请刷新页面重试');
      }
    };
    
    initComponent();
    
    // 组件卸载时取消进行中的请求
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (readerRef.current) {
        readerRef.current.cancel().catch(err => console.error('取消读取器失败:', err));
      }
    };
  }, []);

  // 切换到指定会话
  const switchToChat = async (id: string) => {
    if (id === chatId) return;
    
    setChatId(id);
    await loadChatHistory(id);
  };

  // 开始新游戏
  const startNewQuiz = () => {
    const newId = generateUUID();
    setChatId(newId);
    setChatIds(prevIds => [...prevIds, newId]);
    
    setMessages([{
      role: 'assistant',
      content: `欢迎参加健身智慧王知识问答游戏！让我们一起在游戏中学习健康知识吧！

游戏规则：
- 初始分数：0分
- 计分规则：答对+10分，答错不扣分
- 难度级别：初级、中级、高级（请选择）
- 题目范围：健身训练、营养学基础、健康生活方式、体脂管理、运动恢复
- 题目数量：5题（可调整）
- 每题回答时间：建议30秒内作答

准备好了吗？请选择难度级别和你感兴趣的主题！`
    }]);
    setGameStarted(false);
  };

  // 开始游戏
  const startGame = async () => {
    setGameStarted(true);
    await sendMessage(`我想开始健康知识问答游戏，选择${selectedDifficulty}难度，主题是${selectedTopic}，题目数量${questionCount}道。请直接出第一题。`);
  };

  // 检查是否为等待继续或退出的提示
  const checkContinuePrompt = (content: string): boolean => {
    return content.includes('准备好查看下一题了吗') || 
           content.includes('请回复\'继续\'或\'退出\'') ||
           content.includes('请继续健康知识问答游戏') ||
           content.includes('你已完成当前题目') ||
           (content.includes('得分') && content.includes('解析'));
  };
  
  // 检查是否为选择题
  const isMultipleChoiceQuestion = (content: string): boolean => {
    // 如果包含A、B、C、D选项，且包含"请在30秒内选择"或"选择答案"，则判定为选择题
    return (content.includes('A.') || content.includes('A ')) && 
           (content.includes('B.') || content.includes('B ')) && 
           (content.includes('请在30秒内选择') || content.includes('选择答案') || content.includes('请在30秒内作答'));
  };
  
  // 检查文本是否是单个字母答案
  const isSingleLetterAnswer = (text: string): boolean => {
    // 移除空格并转为大写
    const cleanedText = text.trim().toUpperCase();
    // 检查是否为单个字母A、B、C或D
    return /^[A-D]$/.test(cleanedText);
  };

  // 发送消息
  const sendMessage = async (content: string = inputValue) => {
    if (!content.trim() || loading) return;
    
    let processedContent = content.trim();
    
    // 如果是单个字母回答，且用户尝试回答选择题，自动格式化为大写
    if (messages.length > 0 && 
        isMultipleChoiceQuestion(messages[messages.length - 1].content) && 
        isSingleLetterAnswer(processedContent)) {
      processedContent = processedContent.toUpperCase();
      console.log('检测到单字母回答:', processedContent);
      
      // 为单字母回答添加额外的处理标记，帮助AI理解这是一个选项回答
      if (!processedContent.includes('我选择')) {
        processedContent = `我选择选项${processedContent}`;
      }
    }
    
    // 清除错误消息
    setErrorMessage(null);
    
    // 添加用户消息
    const userMessage = { role: 'user' as const, content: processedContent };
    setMessages(prev => [...prev, userMessage]);
    
    // 清空输入框
    setInputValue('');
    
    // 准备接收AI回复
    setLoading(true);
    let assistantMessage = { role: 'assistant' as const, content: '' };
    setMessages(prev => [...prev, assistantMessage]);
    
    try {
      // 创建可取消的请求
      const controller = new AbortController();
      abortControllerRef.current = controller;
      
      // 发送请求
      const response = await healthQA(processedContent, chatId);
      
      if (!response.ok) {
        throw new Error(`网络请求失败: ${response.status} ${response.statusText}`);
      }
      
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
        
        // 解码并添加到响应文本
        const chunk = decoder.decode(value, { stream: true });
        responseText += chunk;
        
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
      console.error('知识问答请求失败:', error);
      
      // 设置详细的错误消息以在UI中显示
      let errorText = '知识问答请求失败';
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
  
  // 提取题目选项（如果存在）
  const extractOptions = (content: string): { id: string, label: string }[] => {
    const options: { id: string, label: string }[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^([A-D])\.\s+(.*)/);
      if (match) {
        options.push({
          id: match[1],
          label: match[2]
        });
      }
    }
    
    return options;
  };
  
  // 渲染游戏界面
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
            onClick={startNewQuiz}
            style={{ width: '100%', background: '#722ed1', borderColor: '#722ed1' }}
          >
            新问答游戏
          </Button>
        </div>
        
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loadingHistory ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <Spin size="small" />
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#999' }}>加载历史会话...</div>
            </div>
          ) : chatIds.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
              没有历史会话
            </div>
          ) : (
          <List
            dataSource={chatIds}
            renderItem={id => (
              <div 
                key={id}
                onClick={() => switchToChat(id)}
                style={{ 
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: id === chatId ? '#f0e6ff' : 'transparent',
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
                  <QuestionCircleOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                  <span>问答 {id.substring(0, 8)}</span>
                </div>
                {id === chatId && (
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                        
                        // 确认删除对话
                        if (window.confirm('确定要删除这个会话吗？')) {
                          // 从列表中移除
                          setChatIds(prev => prev.filter(cid => cid !== id));
                          
                          // 如果删除的是当前会话，切换到另一个会话或创建新会话
                          if (id === chatId) {
                            const remainingIds = chatIds.filter(cid => cid !== id);
                            if (remainingIds.length > 0) {
                              switchToChat(remainingIds[0]);
                            } else {
                              startNewQuiz();
                            }
                          }
                        }
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
          )}
        </div>
      </div>
      
      {/* 右侧聊天界面 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', padding: '16px' }}>
        {/* 对话标题 */}
        <div style={{ marginBottom: 16 }}>
          <Title level={4} style={{ margin: 0 }}>健康知识问答游戏</Title>
          <Text type="secondary">参加"健身智慧王"知识问答游戏，测试你的健康知识水平！</Text>
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
          {!gameStarted && (
            <div style={{ marginBottom: 20 }}>
              <Card title="游戏设置" bordered={false} style={{ background: 'white' }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>
                    <Title level={5}>选择难度级别:</Title>
                    <RadioGroup 
                      options={difficultyOptions} 
                      value={selectedDifficulty} 
                      onChange={e => setSelectedDifficulty(e.target.value)} 
                      optionType="button" 
                      buttonStyle="solid"
                    />
                  </div>
                  
                  <div>
                    <Title level={5}>选择知识主题:</Title>
                    <RadioGroup 
                      options={topicOptions} 
                      value={selectedTopic} 
                      onChange={e => setSelectedTopic(e.target.value)} 
                      optionType="button" 
                      buttonStyle="solid"
                    />
                  </div>
                  
                  <div>
                    <Title level={5}>题目数量:</Title>
                    <RadioGroup 
                      options={[
                        { label: '5题', value: '5' },
                        { label: '10题', value: '10' },
                        { label: '15题', value: '15' },
                      ]} 
                      value={questionCount} 
                      onChange={e => setQuestionCount(e.target.value)} 
                      optionType="button" 
                      buttonStyle="solid"
                    />
                  </div>
                  
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<TrophyOutlined />} 
                    onClick={startGame}
                    style={{ background: '#722ed1', borderColor: '#722ed1' }}
                  >
                    开始游戏
                  </Button>
                </Space>
              </Card>
            </div>
          )}
          
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
                    backgroundColor: item.role === 'user' ? '#722ed11a' : '#ffffff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                  }}
                >
                  <div style={{ marginRight: 12 }}>
                    <Avatar 
                      icon={item.role === 'user' ? <BookOutlined /> : <QuestionCircleOutlined />} 
                      style={{ 
                        backgroundColor: item.role === 'user' ? '#722ed1' : '#1890ff'
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
        {gameStarted && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-end', 
            gap: 16,
            padding: '16px',
            borderRadius: 8,
            background: '#fff',
            boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
          }}>
            {messages.length > 0 && checkContinuePrompt(messages[messages.length - 1].content) ? (
              /* 显示快速响应按钮 */
              <div style={{ 
                display: 'flex', 
                width: '100%', 
                justifyContent: 'center', 
                gap: 16 
              }}>
                <Button
                  type="primary"
                  onClick={() => sendMessage("继续")}
                  style={{ 
                    height: 40, 
                    width: 120,
                    background: '#722ed1', 
                    borderColor: '#722ed1',
                    borderRadius: 4 
                  }}
                >
                  继续游戏
                </Button>
                <Button
                  onClick={() => sendMessage("退出")}
                  style={{ 
                    height: 40, 
                    width: 120,
                    borderRadius: 4 
                  }}
                >
                  结束游戏
                </Button>
              </div>
            ) : (
              /* 正常输入框 */
              <>
                <TextArea
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="输入您的答案..."
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
                      sendMessage();
                    }
                  }}
                  disabled={loading}
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={() => sendMessage()}
                  loading={loading}
                  style={{ 
                    height: 40, 
                    width: 80,
                    background: '#722ed1', 
                    borderColor: '#722ed1',
                    borderRadius: 4 
                  }}
                >
                  提交
                </Button>
              </>
            )}
          </div>
        )}
        
        {loading && (
          <div style={{ textAlign: 'center', margin: '8px 0' }}>
            <Spin size="small" /> <span style={{ marginLeft: 8, fontSize: 12 }}>正在出题或评判答案...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthQuiz; 