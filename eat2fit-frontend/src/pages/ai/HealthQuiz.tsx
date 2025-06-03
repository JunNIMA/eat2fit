import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Card, Typography, Avatar, List, Spin, Radio, Space, Tag, message, Tooltip, Alert } from 'antd';
import { SendOutlined, TrophyOutlined, QuestionCircleOutlined, BookOutlined, PlusCircleOutlined, DeleteOutlined, HistoryOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { healthQA, getChatHistoryList, getChatHistory, MessageVO } from '@/api/ai';
import { generateUUID } from '@/utils/helpers';
import './HealthQuiz.css'; // 导入CSS文件

const { TextArea } = Input;
const { Title, Paragraph, Text } = Typography;
const { Group: RadioGroup } = Radio;

// 解析处理AI回复内容函数
const processMessageContent = (content: string): string => {
  if (!content) return '';
  
  // 临时变量存储结果
  let processedContent = content;
  
  // 移除可能的data:前缀（SSE流式传输时的特征）
  processedContent = processedContent.replace(/data:/g, '');
  
  // 标准化题目文本
  // 合并连续的换行
  processedContent = processedContent.replace(/\n{3,}/g, '\n\n');
  
  // 检测是否选项都在一行中（如"A. 只可能多地增加负重B. 保持正确的动作姿势C.每次训练"）
  const singleLineMultipleOptions = /([A-D])[.、：:\s]\s*([^A-D\n]{2,}?)([A-D])[.、：:\s]/;
  if (singleLineMultipleOptions.test(processedContent)) {
    // 在每个选项前分行 (A., B., C., D.)
    processedContent = processedContent.replace(/([A-D])[.、：:\s]/g, '\n$1. ');
    
    // 确保第一个选项前只有一个换行
    processedContent = processedContent.replace(/^\n/, '');
  }
  
  // 提取选项文本前，先识别并提取提示性文本
  let promptText = '';
  const promptPattern = /(请在\d+秒内选择答案.*|你可以直接回复选项字母.*|（如[""]?[A-D][""]?、[""]?[A-D][""]?或[""]?[A-D][""]?）)/g;
  const promptMatches = processedContent.match(promptPattern);
  
  if (promptMatches) {
    promptText = promptMatches.join(' ');
    // 从内容中移除提示文本，防止被错误地包含到选项中
    processedContent = processedContent.replace(promptPattern, '');
  }
  
  // 格式化答案解析部分
  // 寻找包含答题结果的模式
  const resultPattern = /你的回答[：:]\s*([A-D])\s*(.*?)\s*正确答案[：:]\s*([A-D])\s*(.*?)\s*得分[：:]\s*(\+?\d+分.*?)/s;
  const resultMatch = processedContent.match(resultPattern);
  
  if (resultMatch) {
    // 提取各部分内容
    const userAnswer = `你的回答: ${resultMatch[1]}`;
    const correctAnswer = `正确答案: ${resultMatch[3]}`;
    const score = `得分: ${resultMatch[5]}`;
    
    // 替换原文本为格式化后的文本
    processedContent = processedContent.replace(resultPattern, `${userAnswer}\n${correctAnswer}\n${score}`);
  }
  
  // 另一种常见模式：选项后直接跟随"正确答案"
  const answerPattern = /([A-D])[.、：:\s]\s*(.*?)(?:\s+|。|，|,)正确答案[：:]\s*([A-D])/g;
  processedContent = processedContent.replace(answerPattern, '$1. $2\n\n正确答案: $3');
  
  // 统一得分显示格式
  processedContent = processedContent.replace(/(\+?\d+分)\s*\(总分[:：]\s*(\d+分)\)/g, '$1 (总分: $2)');
  
  // 提取题目的选项，确保一个选项只出现一次
  const uniqueOptions: Map<string, string> = new Map();
  // 使用更严格的正则表达式匹配选项，确保捕获完整选项
  const optionRegex = /\n?([A-D])[.、：:\s]\s*(.*?)(?=\n[A-D][.、：:\s]|\n\n|$)/gs;
  let match;
  
  // 查找所有选项
  while ((match = optionRegex.exec(processedContent)) !== null) {
    const option = match[1]; // A, B, C, D
    const text = match[2].trim(); // 选项内容
    
    if (text) { // 确保选项内容不为空
      // 检查提示文本是否被错误地包含在选项中
      if (text.includes('请在') || text.includes('你可以直接回复')) {
        const splitIndex = text.indexOf('请在');
        if (splitIndex > 0) {
          // 只保留选项的实际内容部分
          uniqueOptions.set(option, text.substring(0, splitIndex).trim());
        } else {
          // 如果整个文本看起来像提示，就跳过
          continue;
        }
      } else {
        // 避免"其他选项"这样的默认值，只有当该选项不存在或当前文本更长更有意义时才更新
        if (!uniqueOptions.has(option) || 
            (text.length > uniqueOptions.get(option)!.length && !text.includes('其他选项'))) {
          uniqueOptions.set(option, text);
        }
      }
    }
  }
  
  // 如果找到了选项，重构问题
  if (uniqueOptions.size > 0) {
    // 提取问题部分（选项之前的文本）
    const questionEndIndex = processedContent.search(/\n[A-D][.、：:\s]/);
    let questionPart = questionEndIndex !== -1 ? 
      processedContent.substring(0, questionEndIndex) : 
      processedContent;
    
    // 移除问题中可能包含的选项文本
    questionPart = questionPart.replace(/([A-D])[.、：:\s]\s*([^\n]+)/g, '');
    
    let questionText = questionPart;
    
    // 重新构建问题文本
    let newContent = questionText.trim();
    
    // 确保题目标题格式正确
    if (!newContent.includes('【题目') && !newContent.includes('第')) {
      // 提取题号
      const titleMatch = newContent.match(/(\d+)\s*[-—]\s*([初中高]级难度)/);
      if (titleMatch) {
        const [fullMatch, number, level] = titleMatch;
        newContent = newContent.replace(fullMatch, `【题目${number} - ${level}】`);
      }
    }
    
    // 确保问题后面有换行
    if (!newContent.endsWith('\n')) {
      newContent += '\n';
    }
    
    // 添加所有选项，按A,B,C,D顺序，确保每个选项独占一行
    ['A', 'B', 'C', 'D'].forEach(option => {
      if (uniqueOptions.has(option)) {
        newContent += `\n${option}. ${uniqueOptions.get(option)}`;
      }
    });
    
    // 如果有提示文本，添加到选项后面
    if (promptText) {
      newContent += `\n\n${promptText}`;
    }
    
    // 检查是否有答案解析部分需要添加
    const analysisMatch = processedContent.match(/\n正确答案[：:]\s*([A-D]).*?\n解析[：:](.*?)$/s);
    if (analysisMatch) {
      const correctAnswer = analysisMatch[1];
      const analysis = analysisMatch[2].trim();
      newContent += `\n\n正确答案: ${correctAnswer}\n解析: ${analysis}`;
    }
    
    // 提取评分信息
    const scoreMatch = processedContent.match(/你的回答[：:]\s*([A-D])[。，,.\s]*正确答案[：:]\s*([A-D])[。，,.\s]*得分[：:]\s*(\+?\d+分.*?)(?:\n|$)/s);
    if (scoreMatch) {
      const userAnswer = scoreMatch[1];
      const correctAnswer = scoreMatch[2];
      const score = scoreMatch[3];
      
      newContent += `\n\n你的回答: ${userAnswer}\n正确答案: ${correctAnswer}\n得分: ${score}`;
    }
    
    processedContent = newContent;
  }
  
  // 添加空行使解析部分更加清晰
  processedContent = processedContent.replace(/(解析)[：:]/g, '\n$1:');
  
  // 检查是否有选项被连到一起的情况
  let finalContent = processedContent;
  const options = ['A', 'B', 'C', 'D'];
  options.forEach((option, index) => {
    if (index < options.length - 1) {
      const nextOption = options[index + 1];
      const pattern = new RegExp(`${option}\\. .*?${nextOption}\\.`, 's');
      if (pattern.test(finalContent)) {
        finalContent = finalContent.replace(
          new RegExp(`(${option}\\. .*?)${nextOption}\\.`, 's'), 
          `$1\n\n${nextOption}.`
        );
      }
    }
  });
  
  return finalContent;
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

// 确保问题包含所有ABCD四个选项
const ensureAllOptions = (currentMessages: QuizMessage[]): QuizMessage[] => {
  if (currentMessages.length === 0) return currentMessages;
  
  // 获取最后一条消息
  const lastMessage = currentMessages[currentMessages.length - 1];
  
  // 如果是AI的消息，且包含选项，检查是否包含所有ABCD选项
  if (lastMessage.role === 'assistant') {
    // 通过重新处理内容来确保正确显示所有选项
    const processedContent = processMessageContent(lastMessage.content);
    
    // 检查处理后的内容是否发生变化
    if (processedContent !== lastMessage.content) {
      console.log('选项内容已优化');
      // 更新最后一条消息
      const updatedMessage = { ...lastMessage, content: processedContent };
      return [...currentMessages.slice(0, -1), updatedMessage];
    }
  }
  
  // 无需修改
  return currentMessages;
};

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
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null);
  const initialized = useRef(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 处理选项点击事件
  const handleOptionClick = (option: string) => {
    if (loading || selectedOption) return; // 如果正在加载或已选择，不允许点击
    
    setSelectedOption(option);
    
    // 显示选择结果的提示
    message.info(`已选择选项 ${option}`);
    
    // 发送选择的选项
    sendMessage(`我选择选项${option}`).then(() => {
      // 发送完成后重置选择状态
      setSelectedOption(null);
    });
  };

  // 简单的文本格式化函数
  const formatText = (text: string, onClickOption?: (option: string) => void): JSX.Element => {
    // 先处理内容，分行显示选项
    const processedText = processMessageContent(text);
    // 按行分割文本
    const lines = processedText.split('\n');
    
    // 提取所有选项，确保它们能正确显示
    const options: {key: string, value: string}[] = [];
    const filteredLines: string[] = [];
    
    // 提取答案解析相关内容
    let userAnswer = '';
    let correctAnswer = '';
    let scoreInfo = '';
    let analysisContent = '';
    
    // 标记是否处于题目中或已经到达答案部分
    let isInQuestion = true;
    let hasAnswerInfo = false;
    
    // 先扫描一次，查找是否有答案信息
    for (const line of lines) {
      if ((line.includes('你的回答') && line.match(/[A-D]/)) || 
          (line.includes('正确答案') && line.match(/[A-D]/)) ||
          line.includes('得分:') ||
          line.match(/^解析[：:]/)) {
        hasAnswerInfo = true;
        break;
      }
    }
    
    // 过滤出要显示的行
    lines.forEach(line => {
      // 检测题目选项
      const optionMatch = line.match(/^([A-D])[.、：:\s]\s*(.*)/);
      if (optionMatch) {
        options.push({
          key: optionMatch[1],
          value: optionMatch[2].trim()
        });
        
        // 当有答案信息时，不显示选项按钮
        if (!hasAnswerInfo) {
          filteredLines.push(line);
        }
      } 
      // 检测答案相关行
      else if ((line.includes('你的回答') && line.match(/[A-D]/))) {
        userAnswer = line;
        isInQuestion = false;
      }
      else if ((line.includes('正确答案') && line.match(/[A-D]/))) {
        correctAnswer = line;
        isInQuestion = false;
      }
      else if (line.includes('得分:')) {
        scoreInfo = line;
        isInQuestion = false;
      }
      else if (line.match(/^解析[：:]/)) {
        analysisContent = line;
        isInQuestion = false;
      }
      // 跳过只有选项的行
      else if (line.trim().match(/^[A-D]$/)) {
        isInQuestion = false; // 标记已经进入答案区
        return;
      }
      // 跳过单独的"你的回答:"和"正确答案:"行
      else if (/^(你的回答|正确答案)[：:]\s*$/.test(line.trim())) {
        isInQuestion = false; // 标记已经进入答案区
        return;
      }
      // 其他行
      else {
        // 如果有答案信息，只保留标题和提示性文本
        if (hasAnswerInfo) {
          if (line.match(/题目|问题|第[一二三四五六七八九十\d]+题/) || 
              line.includes('准备好查看下一题') || 
              line.includes('请回复"继续"')) {
            filteredLines.push(line);
          }
        }
        // 如果没有答案信息，显示所有行
        else if (line.trim()) {
          filteredLines.push(line);
        }
      }
    });
    
    // 尝试从文本中提取用户选择的选项和正确选项
    if (!userAnswer || !correctAnswer) {
      // 尝试多种可能的匹配模式
      const userPatterns = [
        /你(?:选择了|的回答[是：:])\s*([A-D])/,
        /你的回答(?:是|：|:)?\s*选?项?\s*([A-D])/i,
        /选择(?:了|的是|)(?:选项|)?([A-D])/
      ];
      
      const correctPatterns = [
        /正确(?:的?|答案[是：:])\s*([A-D])/,
        /正确答案(?:是|：|:)?\s*选?项?\s*([A-D])/i
      ];
      
      for (const pattern of userPatterns) {
        const userMatch = text.match(pattern);
        if (userMatch) {
          userAnswer = `你的回答: ${userMatch[1]}`;
          break;
        }
      }
      
      for (const pattern of correctPatterns) {
        const correctMatch = text.match(pattern);
        if (correctMatch) {
          correctAnswer = `正确答案: ${correctMatch[1]}`;
          break;
        }
      }
    }
    
    // 提取得分信息
    if (!scoreInfo) {
      const scoreMatch = text.match(/得分[：:]\s*(\+?\d+分[\s\S]*?(?:\(总分.*?\)|$))/);
      if (scoreMatch) {
        scoreInfo = `得分: ${scoreMatch[1].trim()}`;
      }
    }
    
    // 提取解析文本
    if (!analysisContent) {
      const analysisText = text.match(/解析[：:]([\s\S]*?)(?=你已完成|准备好|请回复|$)/i);
      if (analysisText) {
        analysisContent = `解析: ${analysisText[1].trim()}`;
      }
    }
    
    // 检查答案结果是否存在
    const hasAnswerResult = userAnswer || correctAnswer || scoreInfo || analysisContent;
    
    return (
      <>
        {/* 只有在没有答案信息时，才显示题目和选项 */}
        {!hasAnswerResult && filteredLines.map((line, index) => {
          // 检查提示文本
          if (line.includes('请在') && line.includes('选择答案') || 
              line.includes('你可以直接回复选项字母')) {
            return (
              <p key={index} style={{ 
                margin: '8px 0', 
                color: '#666',
                fontSize: '14px',
                fontStyle: 'italic'
              }}>
                {line}
              </p>
            );
          }
          
          // 检查选项（多种格式：A.、A、A:、A：、A选项 等）
          const optionMatch = line.match(/^([A-D])[.、：:\s]\s*(.*)/);
          if (optionMatch && onClickOption) {
            // 是否禁用（如果已选择选项或正在加载）
            const isDisabled = loading || selectedOption !== null;
            
            // 是否是当前选中的选项
            const isSelected = selectedOption === optionMatch[1];
            
            // 选项可点击，使用更紧凑的按钮样式
            return (
              <div 
                key={index} 
                className={`option-button ${isSelected ? 'selected-option' : ''}`}
                onClick={() => !isDisabled && onClickOption(optionMatch[1])}
                style={{ 
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled && !isSelected ? 0.7 : 1,
                  backgroundColor: isSelected ? '#e6f7ff' : undefined,
                  borderColor: isSelected ? '#1890ff' : undefined,
                  padding: '8px 12px',
                  margin: '4px 0',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <span className="option-marker" style={{
                  backgroundColor: isSelected ? '#1890ff' : '#722ed1',
                  display: 'inline-flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '24px',
                  height: '24px',
                  fontSize: '14px'
                }}>
                  {optionMatch[1]}
                </span>
                <span style={{ marginLeft: '8px' }}>
                  {optionMatch[2]}
                </span>
                {isSelected && <Spin size="small" style={{ marginLeft: 8 }} />}
              </div>
            );
          } else if (optionMatch) {
            // 选项不可点击（用于历史消息），但仍然使用统一的样式
            return (
              <div key={index} className="option-button" style={{ 
                padding: '8px 12px',
                margin: '4px 0',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span className="option-marker" style={{
                  display: 'inline-flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: '24px',
                  height: '24px',
                  fontSize: '14px'
                }}>
                  {optionMatch[1]}
                </span>
                <span style={{ marginLeft: '8px' }}>
                  {optionMatch[2]}
                </span>
              </div>
            );
          }

          // 检查问题标题（通常包含"题目"、"问题"等字眼）
          if (line.match(/题目|问题|第[一二三四五六七八九十\d]+题/)) {
            return (
              <p key={index} className="question-title">
                {line}
              </p>
            );
          }

          // 检查继续游戏的提示文本
          if (line.includes('准备好查看下一题') || 
              line.includes('请回复') && (line.includes('继续') || line.includes('退出'))) {
            return (
              <p key={index} style={{ 
                margin: '10px 0', 
                color: '#722ed1',
                fontWeight: '500'
              }}>
                {line}
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
          if (segments.length === 0 && line.trim()) {
            return <p key={index} style={{ margin: '6px 0' }}>{line}</p>;
          } else if (segments.length > 0) {
            // 返回包含格式化元素的段落
            return <p key={index} style={{ margin: '6px 0' }}>{segments}</p>;
          }
          
          // 空行返回换行元素
          return line.trim() ? <p key={index}>{line}</p> : <br key={index} />;
        })}
        
        {/* 仅当有答案内容时，统一展示答案相关信息 */}
        {hasAnswerResult && (
          <div className="answer-result-container" style={{ 
            marginTop: '16px',
            paddingTop: '16px'
          }}>
            {/* 如果有答案信息，显示问题标题 */}
            {filteredLines.length > 0 && filteredLines.map((line, index) => {
              if (line.match(/题目|问题|第[一二三四五六七八九十\d]+题/)) {
                return (
                  <p key={`title-${index}`} className="question-title" style={{ 
                    marginBottom: '16px',
                    fontWeight: 'bold'
                  }}>
                    {line}
                  </p>
                );
              }
              if (line.includes('准备好查看下一题') || 
                  line.includes('请回复') && (line.includes('继续') || line.includes('退出'))) {
                return (
                  <p key={`prompt-${index}`} style={{ 
                    margin: '16px 0 10px 0', 
                    color: '#722ed1',
                    fontWeight: '500'
                  }}>
                    {line}
                  </p>
                );
              }
              return null;
            })}
            
            {userAnswer && (
              <div className="user-answer" style={{
                padding: '10px 16px',
                margin: '4px 0',
                backgroundColor: '#e6f7ff',
                borderRadius: '8px',
                borderLeft: '4px solid #1890ff',
                fontWeight: 500
              }}>
                <span style={{ fontWeight: 'bold' }}>你的回答: </span>
                <span>{userAnswer.replace(/^你的回答[：:]\s*/, '')}</span>
              </div>
            )}
            
            {correctAnswer && (
              <div className="correct-answer" style={{
                padding: '10px 16px',
                margin: '4px 0',
                backgroundColor: '#f6ffed',
                borderRadius: '8px',
                borderLeft: '4px solid #52c41a',
                fontWeight: 500
              }}>
                <span style={{ fontWeight: 'bold' }}>正确答案: </span>
                <span>{correctAnswer.replace(/^正确答案[：:]\s*/, '')}</span>
              </div>
            )}
            
            {scoreInfo && (
              <div className="score-display" style={{
                padding: '10px 16px',
                margin: '4px 0',
                backgroundColor: '#fff7e6',
                borderRadius: '8px',
                borderLeft: '4px solid #fa8c16',
                fontWeight: 500
              }}>
                <span style={{ fontWeight: 'bold' }}>得分: </span>
                <span>{scoreInfo.replace(/^得分[：:]\s*/, '')}</span>
              </div>
            )}
            
            {analysisContent && (
              <div className="answer-analysis" style={{
                padding: '12px 16px',
                margin: '12px 0 4px 0',
                backgroundColor: '#f9f0ff',
                borderRadius: '8px',
                borderLeft: '4px solid #722ed1',
                fontSize: '14px'
              }}>
                <span style={{ fontWeight: 'bold' }}>解析: </span>
                <span>{analysisContent.replace(/^解析[：:]\s*/, '')}</span>
              </div>
            )}
          </div>
        )}
      </>
    );
  };

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
        
        // 添加欢迎消息
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
      }
    } catch (error) {
      console.error('加载聊天历史ID失败:', error);
      setErrorMessage('无法加载聊天历史，请刷新页面重试');
      
      // 如果加载失败，仍然创建新会话作为备用方案
      const newId = generateUUID();
      setChatId(newId);
      setChatIds([newId]);
      
      // 添加欢迎消息
      setMessages([{
        role: 'assistant',
        content: `欢迎参加健康知识问答游戏！现在我们将开始一个新的问答会话。`
      }]);
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
        // 将API返回的MessageVO转换为QuizMessage，并处理选项格式化
        const convertedMessages: QuizMessage[] = historyMessages.map(msg => {
          // 如果是助手消息，处理选项格式
          let content = msg.content;
          if (msg.role === 'ASSISTANT') {
            content = processMessageContent(content);
          }
          
          return {
            role: msg.role === 'USER' ? 'user' : 'assistant',
            content: content
          };
        });
        
        // 确保所有选项都存在
        const messagesWithAllOptions = ensureAllOptions(convertedMessages);
        setMessages(messagesWithAllOptions);
        
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
        
        // 确保在初始化失败的情况下，用户仍然可以看到一些内容
        if (!chatId) {
          const newId = generateUUID();
          setChatId(newId);
          setChatIds([]);
          
          setMessages([{
            role: 'assistant',
            content: '欢迎参加健康知识问答游戏！系统遇到了一点问题，但您仍然可以尝试开始新的问答游戏。'
          }]);
        }
        
        // 确保加载状态被重置
        setLoadingHistory(false);
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
        let errorText = `网络请求失败: ${response.status} ${response.statusText}`;
        // 尝试解析详细的错误信息
        const errorData = await response.text();
        console.error('错误详情:', errorData);
        throw new Error(errorText);
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
      let completeDataChunks: string[] = [];
      
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
              completeDataChunks.push(content);
              responseText += content;
            }
          } else if (line.trim() && !line.startsWith(':')) {
            // 如果不是空行、注释行或标准SSE格式，直接添加
            completeDataChunks.push(line.trim());
            responseText += line.trim();
          }
          // 忽略空行和注释行
        }
        
        // 在更新消息前对内容进行处理，确保选项格式正确
        // 定期对完整的消息内容进行处理，而不仅仅是当前块
        const processedResponseText = processMessageContent(responseText);
        
        // 更新消息内容
        setMessages(prev => {
          const updated = [...prev];
          if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: processedResponseText
            };
            // 确保所有选项都存在
            return ensureAllOptions(updated);
          }
          return updated;
        });
        
        // 确保滚动到最新消息
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
      
      // 在完成流式读取后，再次处理完整消息以确保格式正确
      // 收集所有数据块，确保我们有完整的消息
      const finalContent = completeDataChunks.join('');
      const finalProcessedContent = processMessageContent(finalContent);
      
      setMessages(prev => {
        const updated = [...prev];
        if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: finalProcessedContent
          };
        }
        return ensureAllOptions(updated);
      });
      
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
        if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
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
      
      // 重置选中状态
      setSelectedOption(null);
    }
    
    // 返回Promise以便调用者可以在发送完成后执行回调
    return Promise.resolve();
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
                  className="message-bubble"
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
                    {formatText(item.content, (option: string) => {
                      handleOptionClick(option);
                    })}
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