import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { Layout, Typography, Card, Form, Input, Select, Upload, Button, Space, message, Row, Col, Modal, Menu } from 'antd';
import { UploadOutlined, UserOutlined, MailOutlined, HeartOutlined, EditOutlined, EyeOutlined, CheckCircleOutlined, DatabaseOutlined, HomeOutlined } from '@ant-design/icons';
import ImageEditor from './ImageEditor';
import StylingReport from './components/StylingReport';
import AdminDashboard from './components/AdminDashboard';
import { submitStylingRequest, healthCheck } from './api/apiService';
import './App.css';
import './JDStyle.css';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

function App() {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [editingImage, setEditingImage] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [currentView, setCurrentView] = useState('main'); // 'main' or 'admin'

  const styleOptions = [
    'Casual & Comfortable',
    'Business Professional',
    'Trendy & Fashion-forward',
    'Classic & Elegant',
    'Bohemian & Artistic',
    'Sporty & Active',
    'Minimalist & Clean',
    'Vintage & Retro'
  ];

  // 检查后端状态
  useEffect(() => {
    const checkBackend = async () => {
      console.log('🔍 开始检查后端连接状态...');
      try {
        const result = await healthCheck();
        setBackendStatus('connected');
        console.log('✅ 后端连接成功:', result);
        message.success('后端连接成功！', 2);
      } catch (error) {
        setBackendStatus('disconnected');
        console.error('❌ 后端连接失败:', error);
        console.error('错误详情:', error.message);
        message.error('后端服务连接失败，请检查服务器状态', 3);
      }
    };

    checkBackend();
    
    // 每30秒重新检查一次连接状态
    const intervalId = setInterval(checkBackend, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  // 获取图片预览URL
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // 图片上传变化处理
  const handleUploadChange = async ({ fileList: newFileList }) => {
    const processedFileList = newFileList.slice(-3).map((file, index) => ({
      ...file,
      uid: file.uid || `image-${Date.now()}-${index}`,
      name: file.name || `image-${index}.jpg`,
      status: 'done',
    }));
    
    setFileList(processedFileList);
  };

  // 预览图片
  const handlePreview = async (file) => {
    console.log('Preview clicked for file:', file);
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj || file);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
    setPreviewTitle(file.name || 'image-preview');
  };

  // 编辑图片
  const handleEdit = async (file) => {
    console.log('Edit clicked for file:', file);
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj || file);
    }
    setEditingImage({
      ...file,
      src: file.url || file.preview
    });
    setEditModalVisible(true);
  };

  // 保存编辑后的图片
  const handleSaveEdit = (croppedImageUrl, croppedImageBlob) => {
    // 更新文件列表中的图片
    const updatedFileList = fileList.map(file => {
      if (file.uid === editingImage.uid) {
        return {
          ...file,
          url: croppedImageUrl,
          preview: croppedImageUrl,
          originFileObj: new File([croppedImageBlob], file.name || 'edited-image.jpg', {
            type: 'image/jpeg'
          }),
          thumbUrl: croppedImageUrl,
        };
      }
      return file;
    });
    
    setFileList(updatedFileList);
    setEditModalVisible(false);
    setEditingImage(null);
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setEditingImage(null);
  };

  // 表单提交
  const onFinish = async (values) => {
    // 照片上传改为可选，允许不上传照片进行测试
    if (fileList.length === 0) {
      console.log('⚠️ 用户未上传照片，但允许继续提交');
    }

    if (backendStatus !== 'connected') {
      message.error('后端服务不可用，请稍后重试');
      return;
    }

    setLoading(true);
    
    try {
      console.log('提交表单数据:', values);
      console.log('上传文件:', fileList);

      // 提交数据到后端
      const response = await submitStylingRequest(values, fileList);
      
      if (response.success) {
        setUserData(response.data.user);
        setReportData(response.data);
        setSubmitted(true);
        message.success('造型报告生成成功！');
        
        // 滚动到顶部显示报告
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('提交失败:', error);
      message.error(error.message || '提交失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 重新开始
  const handleStartOver = () => {
    setSubmitted(false);
    setReportData(null);
    setUserData(null);
    setFileList([]);
    form.resetFields();
    setCurrentView('main');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 切换视图
  const handleViewChange = (view) => {
    setCurrentView(view);
    // 如果切换到主页面，重置状态
    if (view === 'main') {
      setSubmitted(false);
      setReportData(null);
      setUserData(null);
    }
  };

  // 手动重新连接后端
  const handleReconnect = async () => {
    console.log('🔄 手动重新连接后端...');
    setBackendStatus('checking');
    try {
      const result = await healthCheck();
      setBackendStatus('connected');
      console.log('✅ 重新连接成功:', result);
      message.success('后端重新连接成功！', 2);
    } catch (error) {
      setBackendStatus('disconnected');
      console.error('❌ 重新连接失败:', error);
      message.error('重新连接失败，请检查服务器状态', 3);
    }
  };

  // 自定义上传列表项的渲染
  const customItemRender = (originNode, file, fileList, actions) => {
    return (
      <div className="custom-upload-item">
        <div className="upload-item-thumbnail">
          <img src={file.thumbUrl || file.url} alt={file.name} />
        </div>
        <div className="upload-item-actions">
          <Button 
            icon={<EyeOutlined />} 
            size="small" 
            onClick={() => handlePreview(file)}
            title="预览"
          />
          <Button 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleEdit(file)}
            title="编辑"
          />
          <Button 
            icon={<span>×</span>} 
            size="small" 
            onClick={() => actions.remove(file)}
            title="删除"
            danger
          />
        </div>
      </div>
    );
  };

  const uploadProps = {
    fileList,
    onChange: handleUploadChange,
    beforeUpload: () => false, // 阻止自动上传
    accept: 'image/*',
    multiple: true,
    listType: 'picture-card',
    itemRender: customItemRender,
    showUploadList: {
      showPreviewIcon: false,
      showRemoveIcon: false,
      showDownloadIcon: false,
    },
  };

  // 渲染页头导航
  const renderHeader = () => (
    <Header className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <HeartOutlined style={{ fontSize: '24px', color: '#fff', marginRight: '8px' }} />
          <span style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>时尚造型师</span>
        </div>
        
        <div className="header-nav-container">
          <Button
            size="small"
            icon={<HomeOutlined />}
            onClick={() => handleViewChange('main')}
            className={`header-nav-btn ${currentView === 'main' ? 'active' : ''}`}
          >
            主页
          </Button>
          <Button
            size="small"
            icon={<DatabaseOutlined />}
            onClick={() => handleViewChange('admin')}
            className={`header-nav-btn ${currentView === 'admin' ? 'active' : ''}`}
          >
            管理员
          </Button>
            
          {submitted && reportData && userData && currentView === 'main' && (
            <Button type="primary" ghost onClick={handleStartOver}>
              重新开始
            </Button>
          )}
        </div>
        
        <div className="status-section">
          <span style={{ 
            fontSize: '12px', 
            color: backendStatus === 'connected' ? '#52c41a' : backendStatus === 'checking' ? '#faad14' : '#ff4d4f' 
          }}>
            {backendStatus === 'checking' && '🔄 检查连接状态...'}
            {backendStatus === 'connected' && '✅ 后端已连接'}
            {backendStatus === 'disconnected' && '❌ 后端未连接'}
          </span>
          {backendStatus === 'disconnected' && (
            <Button 
              size="small" 
              style={{ marginLeft: '8px' }}
              onClick={handleReconnect}
              loading={backendStatus === 'checking'}
            >
              重新连接
            </Button>
          )}
        </div>
      </div>
    </Header>
  );

  // 如果是管理员视图
  if (currentView === 'admin') {
    return (
      <Layout className="app-layout">
        {renderHeader()}
        <Content className="app-content" style={{ padding: 0 }}>
          <AdminDashboard />
        </Content>
      </Layout>
    );
  }

  // 如果已提交且有报告数据，显示报告
  if (submitted && reportData && userData && currentView === 'main') {
    return (
      <Layout className="app-layout">
        {renderHeader()}
        
        <Content className="app-content">
          <div className="container">
            <StylingReport reportData={reportData} userData={userData} />
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="app-layout">
      {renderHeader()}
      
      <Content className="app-content">
        <div className="container">
          {/* 欢迎区域 */}
          <Card className="welcome-card" bordered={false}>
            <div className="welcome-content">
              <Title level={1} className="welcome-title">
                Get your personalized fashion styling
              </Title>
              <Text className="welcome-subtitle">
                专业造型师为您量身定制时尚造型方案，让您的穿搭更加自信出众
              </Text>
            </div>
          </Card>

          {/* 表单区域 */}
          <Card className="form-card" title="填写您的信息" bordered={false}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              size="large"
            >
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="姓名"
                    name="name"
                    rules={[{ required: true, message: '请输入您的姓名' }]}
                  >
                    <Input 
                      prefix={<UserOutlined />} 
                      placeholder="请输入您的姓名" 
                    />
                  </Form.Item>
                </Col>
                
                <Col xs={24} md={12}>
                  <Form.Item
                    label="邮箱"
                    name="email"
                    rules={[
                      { required: true, message: '请输入您的邮箱' },
                      { type: 'email', message: '请输入有效的邮箱地址' }
                    ]}
                  >
                    <Input 
                      prefix={<MailOutlined />} 
                      placeholder="请输入您的邮箱" 
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="风格偏好"
                name="stylePreference"
                rules={[{ required: true, message: '请选择您的风格偏好' }]}
              >
                <Select placeholder="请选择您喜欢的风格" allowClear>
                  {styleOptions.map(style => (
                    <Option key={style} value={style}>{style}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                label="其他风格描述（可选）"
                name="additionalPreferences"
              >
                <Input.TextArea 
                  rows={3} 
                  placeholder="请描述您的其他风格偏好或特殊要求..."
                />
              </Form.Item>

              <Form.Item
                label="全身照片 (可选，1-3张)"
                name="photos"
                extra="可选：上传1-3张清晰的全身照片，点击眼睛图标预览，点击编辑图标进行剪裁和调整。不上传照片也可以获得基础造型建议。"
              >
                <Upload {...uploadProps}>
                  {fileList.length >= 3 ? null : (
                    <div className="upload-placeholder">
                      <UploadOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                      <div>选择照片</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>

              <Form.Item>
                <div className="submit-button-container">
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    size="large"
                    className="submit-button"
                    loading={loading}
                    disabled={backendStatus !== 'connected'}
                    icon={loading ? null : <CheckCircleOutlined />}
                  >
                    {loading ? '正在生成造型报告...' : 'Get My Styling Report'}
                  </Button>
                  {backendStatus !== 'connected' && (
                    <Text type="secondary" style={{ textAlign: 'center', fontSize: '12px', marginTop: '12px' }}>
                      {backendStatus === 'checking' ? '⏳ 正在连接后端服务...' : '❌ 后端服务未连接，请点击上方"重新连接"按钮'}
                    </Text>
                  )}
                </div>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Content>

      {/* 图片预览Modal */}
      <Modal
        open={previewVisible}
        title={previewTitle}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width="80%"
        style={{ maxWidth: '600px' }}
        centered
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>

      {/* 图片编辑组件 */}
      <ImageEditor
        visible={editModalVisible}
        image={editingImage?.src}
        onSave={handleSaveEdit}
        onCancel={handleCancelEdit}
      />
    </Layout>
  );
}

export default App;
