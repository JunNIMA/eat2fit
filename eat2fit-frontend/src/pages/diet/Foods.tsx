import React, { useEffect, useState, useRef } from 'react';
import { Card, List, Tag, Row, Col, Input, Select, Empty, Spin, message, Avatar, Modal, Descriptions, Divider } from 'antd';
import { SearchOutlined, AppleOutlined } from '@ant-design/icons';
import { getFoods, getFoodCategories, getFoodDetail, Food, FoodQueryParams } from '@/api/diet';
import { createCancelToken } from '@/utils/request';
import axios, { CancelTokenSource } from 'axios';

const { Option } = Select;
const { Search } = Input;

const Foods: React.FC = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [total, setTotal] = useState(0);
  
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [keyword, setKeyword] = useState('');
  const [current, setCurrent] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // 用于跟踪API请求的取消令牌
  const categoriesTokenRef = useRef<CancelTokenSource | null>(null);
  const foodsTokenRef = useRef<CancelTokenSource | null>(null);
  const detailTokenRef = useRef<CancelTokenSource | null>(null);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // 只在组件挂载时获取食物类别
  useEffect(() => {
    fetchCategories();
    
    // 组件卸载时取消所有未完成的请求
    return () => {
      if (categoriesTokenRef.current) {
        categoriesTokenRef.current.cancel('组件卸载，取消请求');
      }
    };
  }, []);
  
  // 在类别或分页变化时获取食物列表
  useEffect(() => {
    fetchFoods();
    
    // 组件卸载或依赖项变化时取消上一个未完成的请求
    return () => {
      if (foodsTokenRef.current) {
        foodsTokenRef.current.cancel('依赖项变化，取消上一个请求');
      }
    };
  }, [selectedCategory, current, keyword]);
  
  const fetchCategories = async () => {
    try {
      // 取消上一个未完成的请求
      if (categoriesTokenRef.current) {
        categoriesTokenRef.current.cancel('新请求发起，取消旧请求');
      }
      
      // 创建新的取消令牌
      categoriesTokenRef.current = createCancelToken();
      
      setCategoriesLoading(true);
      const res = await getFoodCategories(categoriesTokenRef.current);
      if (res.code === 200) {
        setCategories(res.data || []);
      } else {
        message.error(res.message || '获取食物类别失败');
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('请求已取消', error.message);
      } else {
        console.error('获取食物类别出错', error);
        message.error('获取食物类别失败，请稍后重试');
      }
    } finally {
      setCategoriesLoading(false);
    }
  };
  
  const fetchFoods = async () => {
    try {
      // 取消上一个未完成的请求
      if (foodsTokenRef.current) {
        foodsTokenRef.current.cancel('新请求发起，取消旧请求');
      }
      
      // 创建新的取消令牌
      foodsTokenRef.current = createCancelToken();
      
      setLoading(true);
      const params: FoodQueryParams = {
        current,
        size: 12,
        category: selectedCategory,
        keyword: keyword || undefined
      };
      
      console.log('请求食物列表参数:', params);
      
      const res = await getFoods(params, foodsTokenRef.current);
      if (res.code === 200 || res.success) {
        if (Array.isArray(res.data.records)) {
          setFoods(res.data.records);
          setTotal(res.data.total || 0);
          console.log('食物列表分页数据:', {
            current,
            total: res.data.total,
            recordsCount: res.data.records.length,
            hasMore: current * 12 < res.data.total
          });
        } else {
          console.error('食物列表数据格式错误:', res.data);
          message.error('获取食物列表失败，数据格式错误');
          setFoods([]);
          setTotal(0);
        }
      } else {
        message.error(res.message || '获取食物列表失败');
        setFoods([]);
        setTotal(0);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('请求已取消', error.message);
      } else {
        console.error('获取食物列表出错', error);
        message.error('获取食物列表失败，请稍后重试');
        setFoods([]);
        setTotal(0);
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (value: string) => {
    setKeyword(value);
    setCurrent(1);
  };
  
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrent(1);
  };
  
  const showFoodDetail = async (id: number) => {
    try {
      // 取消上一个未完成的请求
      if (detailTokenRef.current) {
        detailTokenRef.current.cancel('新请求发起，取消旧请求');
      }
      
      // 创建新的取消令牌
      detailTokenRef.current = createCancelToken();
      
      setDetailLoading(true);
      setDetailVisible(true);
      
      const res = await getFoodDetail(id, detailTokenRef.current);
      if (res.code === 200) {
        setSelectedFood(res.data);
      } else {
        message.error(res.message || '获取食物详情失败');
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('详情请求已取消', error.message);
      } else {
        console.error('获取食物详情出错', error);
        message.error('获取食物详情失败，请稍后重试');
      }
    } finally {
      setDetailLoading(false);
    }
  };
  
  // 处理图片URL，确保完整路径
  const getImageUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined;
    
    // 如果已经是完整URL（以http或https开头），则直接返回
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // 如果是相对路径，添加基础URL
    if (url.startsWith('/')) {
      return `${process.env.REACT_APP_API_BASE_URL || '/api'}${url}`;
    }
    
    // 其他情况，假设是相对于API的路径
    return `${process.env.REACT_APP_API_BASE_URL || '/api'}/${url}`;
  };
  
  // 图片加载错误处理
  const [imgErrorMap, setImgErrorMap] = useState<Record<number, boolean>>({});
  
  const handleImageError = (foodId: number) => {
    setImgErrorMap(prev => ({
      ...prev,
      [foodId]: true
    }));
  };
  
  // 食物项展示
  const renderFoodItem = (food: Food) => {
    // 检查图片是否有错误
    const hasImageError = imgErrorMap[food.id];
    // 获取图片URL
    const imageUrl = getImageUrl(food.imageUrl);
    // 是否显示默认图标
    const showDefaultIcon = !food.imageUrl || hasImageError;
    
    return (
      <List.Item>
        <Card
          hoverable
          style={{ width: '100%', height: '100%' }}
          onClick={() => showFoodDetail(food.id)}
          bodyStyle={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              size={64} 
              src={!showDefaultIcon ? imageUrl : undefined}
              icon={showDefaultIcon && <AppleOutlined />} 
              style={{ backgroundColor: showDefaultIcon ? '#52c41a' : undefined, flexShrink: 0 }}
              onError={() => {
                handleImageError(food.id);
                return true;
              }}
            />
            <div style={{ marginLeft: 16, flex: 1, overflow: 'hidden' }}>
              <div style={{ 
                fontWeight: 'bold', 
                fontSize: 16, 
                marginBottom: 8, 
                whiteSpace: 'nowrap', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis',
                maxWidth: '100%'
              }}>
                {food.name}
              </div>
              <div>
                <Tag color="green">{food.category}</Tag>
              </div>
            </div>
            <div style={{ textAlign: 'right', minWidth: 70, flexShrink: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 'bold', color: '#fa541c' }}>
                {food.calories} 千卡
              </div>
              <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                每100克
              </div>
            </div>
          </div>
          
          <div style={{ 
            marginTop: 16, 
            display: 'flex', 
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ textAlign: 'center', flex: '1 0 20%', minWidth: '60px' }}>
              <div style={{ fontSize: 12, color: '#999' }}>蛋白质</div>
              <div>{food.protein}克</div>
            </div>
            <div style={{ textAlign: 'center', flex: '1 0 20%', minWidth: '60px' }}>
              <div style={{ fontSize: 12, color: '#999' }}>脂肪</div>
              <div>{food.fat}克</div>
            </div>
            <div style={{ textAlign: 'center', flex: '1 0 20%', minWidth: '60px' }}>
              <div style={{ fontSize: 12, color: '#999' }}>碳水</div>
              <div>{food.carbs}克</div>
            </div>
            <div style={{ textAlign: 'center', flex: '1 0 20%', minWidth: '60px' }}>
              <div style={{ fontSize: 12, color: '#999' }}>纤维素</div>
              <div>{food.fiber || '-'}克</div>
            </div>
          </div>
        </Card>
      </List.Item>
    );
  };
  
  return (
    <div className="foods-page">
      <Card 
        title="食物目录" 
        bordered={false}
        bodyStyle={{ padding: isMobile ? 12 : 24 }}
      >
        {/* 搜索和筛选区域 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={12}>
            <Search
              placeholder="搜索食物名称"
              allowClear
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={24} md={12}>
            <Select
              style={{ width: '100%' }}
              placeholder="按类别筛选"
              allowClear
              onChange={handleCategoryChange}
              loading={categoriesLoading}
            >
              {categories.map(category => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Col>
        </Row>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : foods.length > 0 ? (
          <List
            grid={{ 
              gutter: 16, 
              xs: 1, 
              sm: 1, 
              md: 2, 
              lg: 3, 
              xl: 4,
              xxl: 4
            }}
            dataSource={foods}
            renderItem={renderFoodItem}
            pagination={{
              current,
              pageSize: 12,
              total,
              onChange: (page) => {
                console.log('切换到页码:', page);
                setCurrent(page);
                // 滚动到页面顶部
                window.scrollTo({ top: 0, behavior: 'smooth' });
              },
              showSizeChanger: false,
              showTotal: (total) => `共 ${total} 条`,
              style: { textAlign: 'center', marginTop: 24 }
            }}
          />
        ) : (
          <Empty description="没有找到匹配的食物" />
        )}
      </Card>
      
      {/* 食物详情弹窗 */}
      <Modal
        title="食物营养成分详情"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={isMobile ? '95%' : 700}
        centered
        destroyOnClose
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : selectedFood ? (
          <div className="food-detail-content" style={{ maxHeight: 'calc(80vh - 100px)', overflowY: 'auto', paddingRight: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
              <Avatar 
                size={80} 
                src={selectedFood.imageUrl && !imgErrorMap[selectedFood.id] ? getImageUrl(selectedFood.imageUrl) : undefined} 
                icon={(!selectedFood.imageUrl || imgErrorMap[selectedFood.id]) && <AppleOutlined />} 
                style={{ backgroundColor: (!selectedFood.imageUrl || imgErrorMap[selectedFood.id]) ? '#52c41a' : undefined }}
                onError={() => {
                  handleImageError(selectedFood.id);
                  return true;
                }}
              />
              <div style={{ marginLeft: 20, flex: 1, overflow: 'hidden' }}>
                <h2 style={{ margin: 0, wordBreak: 'break-word' }}>{selectedFood.name}</h2>
                <Tag color="green" style={{ marginTop: 8 }}>{selectedFood.category}</Tag>
              </div>
            </div>
            
            <Divider orientation="left">基本信息</Divider>
            <Descriptions column={isMobile ? 1 : 3} bordered>
              <Descriptions.Item label="卡路里">{selectedFood.calories} 千卡/100克</Descriptions.Item>
              <Descriptions.Item label="计量单位">{selectedFood.unit || '克'}</Descriptions.Item>
              <Descriptions.Item label="食物类别">{selectedFood.category}</Descriptions.Item>
            </Descriptions>
            
            <Divider orientation="left">宏量营养素</Divider>
            <Descriptions column={isMobile ? 1 : 2} bordered>
              <Descriptions.Item label="蛋白质">{selectedFood.protein} 克</Descriptions.Item>
              <Descriptions.Item label="脂肪">{selectedFood.fat} 克</Descriptions.Item>
              <Descriptions.Item label="碳水化合物">{selectedFood.carbs} 克</Descriptions.Item>
              <Descriptions.Item label="纤维素">{selectedFood.fiber || '-'} 克</Descriptions.Item>
            </Descriptions>
            
            {(selectedFood.vitaminA || selectedFood.vitaminC || selectedFood.calcium || selectedFood.iron) && (
              <>
                <Divider orientation="left">微量营养素</Divider>
                <Descriptions column={isMobile ? 1 : 2} bordered>
                  {selectedFood.vitaminA && <Descriptions.Item label="维生素A">{selectedFood.vitaminA}</Descriptions.Item>}
                  {selectedFood.vitaminC && <Descriptions.Item label="维生素C">{selectedFood.vitaminC} 毫克</Descriptions.Item>}
                  {selectedFood.calcium && <Descriptions.Item label="钙">{selectedFood.calcium} 毫克</Descriptions.Item>}
                  {selectedFood.iron && <Descriptions.Item label="铁">{selectedFood.iron} 毫克</Descriptions.Item>}
                </Descriptions>
              </>
            )}
          </div>
        ) : (
          <Empty description="未找到食物详情" />
        )}
      </Modal>
    </div>
  );
};

export default Foods; 