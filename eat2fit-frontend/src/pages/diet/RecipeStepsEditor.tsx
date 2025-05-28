import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Input, InputNumber, Upload, Popconfirm, message, Space } from 'antd';
import { DeleteOutlined, PlusOutlined, UploadOutlined, LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';
import { getToken } from '@/utils/auth';

interface RecipeStepsEditorProps {
  recipeId: number;
}

interface StepItem {
  id?: number;
  recipeId?: number;
  stepNumber: number;
  description: string;
  imageUrl?: string;
}

const { TextArea } = Input;

const RecipeStepsEditor: React.FC<RecipeStepsEditorProps> = ({ recipeId }) => {
  const [steps, setSteps] = useState<StepItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  
  // 获取食谱步骤
  const fetchSteps = async () => {
    if (!recipeId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/api/diet/recipes/${recipeId}/steps`, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      if (response.data.success) {
        setSteps(response.data.data || []);
      } else {
        message.error(response.data.message || '获取烹饪步骤失败');
      }
    } catch (error) {
      console.error('获取烹饪步骤失败:', error);
      message.error('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 初始加载
  useEffect(() => {
    fetchSteps();
  }, [recipeId]);
  
  // 添加步骤
  const handleAddStep = () => {
    const newStep: StepItem = {
      recipeId,
      stepNumber: steps.length + 1,
      description: ''
    };
    setSteps([...steps, newStep]);
  };
  
  // 删除步骤
  const handleDeleteStep = (index: number) => {
    const newSteps = [...steps];
    newSteps.splice(index, 1);
    
    // 重新计算步骤编号
    const updatedSteps = newSteps.map((step, idx) => ({
      ...step,
      stepNumber: idx + 1
    }));
    
    setSteps(updatedSteps);
  };
  
  // 更新步骤字段
  const handleStepChange = (index: number, field: keyof StepItem, value: any) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };
  
  // 上传步骤图片
  const handleImageUpload = (info: any, index: number) => {
    if (info.file.status === 'uploading') {
      setUploadingIndex(index);
      return;
    }
    
    if (info.file.status === 'done') {
      setUploadingIndex(null);
      // 获取上传后的URL
      const imageUrl = info.file.response.data;
      handleStepChange(index, 'imageUrl', imageUrl);
      message.success('图片上传成功');
    } else if (info.file.status === 'error') {
      setUploadingIndex(null);
      message.error('图片上传失败');
    }
  };
  
  // 保存步骤列表
  const handleSave = async () => {
    // 验证所有步骤是否都填写了必要信息
    const isValid = steps.every(item => item.description);
    
    if (!isValid) {
      message.error('请确保所有步骤都填写了描述');
      return;
    }
    
    setSaving(true);
    try {
      const response = await axios.post(`/api/diet/recipes/${recipeId}/steps`, steps, {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      });
      if (response.data.success) {
        message.success('保存烹饪步骤成功');
        fetchSteps(); // 重新加载最新数据
      } else {
        message.error(response.data.message || '保存烹饪步骤失败');
      }
    } catch (error) {
      console.error('保存烹饪步骤失败:', error);
      message.error('网络错误，请稍后重试');
    } finally {
      setSaving(false);
    }
  };
  
  // 表格列定义
  const columns = [
    {
      title: '步骤',
      dataIndex: 'stepNumber',
      key: 'stepNumber',
      width: 80,
      render: (_: any, __: any, index: number) => index + 1
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (description: string, _: any, index: number) => (
        <TextArea
          rows={3}
          placeholder="输入步骤描述"
          value={description}
          onChange={(e) => handleStepChange(index, 'description', e.target.value)}
        />
      )
    },
    {
      title: '图片',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 200,
      render: (imageUrl: string, _: any, index: number) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {imageUrl && (
            <div style={{ marginBottom: 8 }}>
              <img 
                src={imageUrl} 
                alt={`步骤${index + 1}`} 
                style={{ width: 100, height: 60, objectFit: 'cover', borderRadius: '4px' }} 
              />
            </div>
          )}
          <Upload
            name="file"
            action="/api/diet/recipes/upload/step-image"
            headers={{
              Authorization: `Bearer ${getToken()}`
            }}
            showUploadList={false}
            onChange={(info) => handleImageUpload(info, index)}
          >
            <Button 
              icon={uploadingIndex === index ? <LoadingOutlined /> : <UploadOutlined />} 
              size="small"
            >
              {uploadingIndex === index ? '上传中...' : (imageUrl ? '更换图片' : '上传图片')}
            </Button>
          </Upload>
        </div>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Popconfirm
          title="确定要删除此步骤吗?"
          onConfirm={() => handleDeleteStep(index)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      )
    }
  ];
  
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddStep}
          >
            添加步骤
          </Button>
          <Button 
            type="primary" 
            onClick={handleSave} 
            loading={saving}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
          >
            保存步骤
          </Button>
        </Space>
      </div>
      
      <Table
        rowKey={(record, index) => index?.toString() || '0'}
        columns={columns}
        dataSource={steps}
        pagination={false}
        loading={loading}
        size="middle"
      />
    </div>
  );
};

export default RecipeStepsEditor; 