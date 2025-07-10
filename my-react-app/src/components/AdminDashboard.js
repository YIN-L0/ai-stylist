import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Tag, 
  Space, 
  Button, 
  Modal, 
  Typography, 
  Row, 
  Col, 
  Image, 
  Divider, 
  Statistic,
  Badge,
  Tooltip,
  Avatar,
  List,
  Descriptions,
  Alert
} from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  EyeOutlined, 
  PictureFilled,
  ClockCircleOutlined,
  HeartOutlined,
  InfoCircleOutlined,
  DatabaseOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import './AdminDashboard.css';

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [photoMetadata, setPhotoMetadata] = useState({});

  // 获取所有数据
  const fetchData = async () => {
    setLoading(true);
    try {
      // 并行获取所有数据
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';
      const [reportsResponse, statisticsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/styling-reports`),
        fetch(`${API_BASE_URL}/statistics`)
      ]);

      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json();
        setReports(reportsData.data || []);
        // 从报告中提取用户数据
        const userData = reportsData.data?.map(report => report.user) || [];
        setUsers(userData);
      }

      if (statisticsResponse.ok) {
        const statsData = await statisticsResponse.json();
        setStatistics(statsData.data || {});
      }
    } catch (error) {
      console.error('获取管理员数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 获取照片元数据
  const fetchPhotoMetadata = async (filename) => {
    if (photoMetadata[filename]) {
      return photoMetadata[filename];
    }

    try {
      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/photo-metadata/${filename}`);
      if (response.ok) {
        const data = await response.json();
        setPhotoMetadata(prev => ({
          ...prev,
          [filename]: data.data
        }));
        return data.data;
      }
    } catch (error) {
      console.error('获取照片元数据失败:', error);
    }
    return null;
  };

  // 查看用户详情
  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setUserModalVisible(true);
  };

  // 查看造型报告
  const viewReport = (report) => {
    setSelectedReport(report);
    setReportModalVisible(true);
  };

  // 格式化时间
  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleString('zh-CN');
  };

  // 获取风格偏好的标签颜色
  const getStyleColor = (style) => {
    const colorMap = {
      'Casual & Comfortable': 'blue',
      'Business Professional': 'purple',
      'Trendy & Fashion-forward': 'magenta',
      'Classic & Elegant': 'gold',
      'Bohemian & Artistic': 'orange',
      'Sporty & Active': 'green',
      'Minimalist & Clean': 'gray',
      'Vintage & Retro': 'red'
    };
    return colorMap[style] || 'default';
  };

  // 表格列定义
  const columns = [
    {
      title: '用户',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div><strong>{text}</strong></div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <MailOutlined /> {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: '风格偏好',
      dataIndex: 'stylePreference',
      key: 'stylePreference',
      render: (style) => (
        <Tag color={getStyleColor(style)}>{style}</Tag>
      ),
    },
    {
      title: '照片',
      dataIndex: 'photos',
      key: 'photos',
      render: (photos) => (
        <Space>
          <PictureFilled style={{ color: photos?.length > 0 ? '#52c41a' : '#d9d9d9' }} />
          <Badge count={photos?.length || 0} showZero>
            <span>{photos?.length > 0 ? '已上传' : '无照片'}</span>
          </Badge>
        </Space>
      ),
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time) => (
        <Space>
          <ClockCircleOutlined />
          <span>{formatTime(time)}</span>
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => {
        const userReport = reports.find(r => r.userId === record.id);
        return (
          <Space size="middle">
            <Button 
              icon={<EyeOutlined />} 
              onClick={() => viewUserDetails(record)}
              size="small"
            >
              查看详情
            </Button>
            {userReport && (
              <Button 
                icon={<HeartOutlined />} 
                onClick={() => viewReport(userReport)}
                size="small"
                type="primary"
              >
                查看报告
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  // 手机版卡片式用户列表
  const MobileUserList = () => (
    <div className="mobile-user-list">
      {users.map(user => {
        const userReport = reports.find(r => r.userId === user.id);
        return (
          <div key={user.id} className="mobile-user-card">
            <div className="mobile-user-header">
              <div className="mobile-user-avatar">
                <Avatar size={32} icon={<UserOutlined />} />
              </div>
              <div className="mobile-user-info">
                <h3>{user.name}</h3>
                <p><MailOutlined /> {user.email}</p>
              </div>
            </div>
            
            <div className="mobile-user-details">
              <div className="mobile-user-row">
                <span className="mobile-user-label">风格偏好:</span>
                <Tag color={getStyleColor(user.stylePreference)} className="mobile-user-value">
                  {user.stylePreference}
                </Tag>
              </div>
              
              <div className="mobile-user-row">
                <span className="mobile-user-label">照片状态:</span>
                <div className="mobile-user-value">
                  <Space>
                    <PictureFilled style={{ 
                      color: user.photos?.length > 0 ? '#52c41a' : '#d9d9d9' 
                    }} />
                    <Badge count={user.photos?.length || 0} showZero />
                  </Space>
                </div>
              </div>
              
              <div className="mobile-user-row">
                <span className="mobile-user-label">提交时间:</span>
                <span className="mobile-user-value">
                  <ClockCircleOutlined /> {formatTime(user.createdAt)}
                </span>
              </div>
            </div>
            
            <div className="mobile-user-actions">
              <Button 
                icon={<EyeOutlined />} 
                onClick={() => viewUserDetails(user)}
                size="small"
              >
                查看详情
              </Button>
              {userReport && (
                <Button 
                  icon={<HeartOutlined />} 
                  onClick={() => viewReport(userReport)}
                  size="small"
                  type="primary"
                >
                  查看报告
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="admin-dashboard">
      <Card className="dashboard-header" bordered={false}>
        <Row gutter={24} align="middle" justify="space-between">
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              <DatabaseOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
              管理员仪表板
            </Title>
            <Text type="secondary">用户造型请求管理</Text>
          </Col>
          <Col>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchData}
              loading={loading}
              type="primary"
            >
              刷新数据
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总用户数"
              value={statistics.totalUsers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="总报告数"
              value={statistics.totalReports || 0}
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="上传照片数"
              value={users.reduce((sum, user) => sum + (user.photos?.length || 0), 0)}
              prefix={<PictureFilled />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 热门风格统计 */}
      {statistics.popularStyles && statistics.popularStyles.length > 0 && (
        <Card title="热门风格统计" style={{ marginBottom: '24px' }}>
          <Row gutter={16}>
            {statistics.popularStyles.map((style, index) => (
              <Col key={style.style} xs={12} sm={8} md={6}>
                <Card size="small">
                  <Statistic
                    title={style.style}
                    value={style.count}
                    prefix={<Tag color={getStyleColor(style.style)}>#{index + 1}</Tag>}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* 用户列表 */}
      <Card title="用户列表" bordered={false}>
        {/* 桌面版表格 */}
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条记录`,
          }}
        />
        
        {/* 手机版卡片列表 */}
        <div className="mobile-user-list-container">
          <MobileUserList />
        </div>
      </Card>

      {/* 用户详情Modal */}
      <Modal
        title="用户详情"
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedUser && (
          <div>
            <Descriptions title="基本信息" bordered>
              <Descriptions.Item label="姓名">{selectedUser.name}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{selectedUser.email}</Descriptions.Item>
              <Descriptions.Item label="风格偏好">
                <Tag color={getStyleColor(selectedUser.stylePreference)}>
                  {selectedUser.stylePreference}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="提交时间" span={3}>
                {formatTime(selectedUser.createdAt)}
              </Descriptions.Item>
              {selectedUser.additionalPreferences && (
                <Descriptions.Item label="附加偏好" span={3}>
                  {selectedUser.additionalPreferences}
                </Descriptions.Item>
              )}
            </Descriptions>

            {selectedUser.photos && selectedUser.photos.length > 0 && (
              <>
                <Divider>上传的照片</Divider>
                <List
                  grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
                  dataSource={selectedUser.photos}
                  renderItem={(photo) => (
                    <List.Item>
                      <Card
                        hoverable
                        cover={
                          <Image
                            alt={photo.originalname}
                            src={photo.url}
                            style={{ height: '200px', objectFit: 'cover' }}
                          />
                        }
                        actions={[
                          <Tooltip title="查看元数据">
                            <Button 
                              icon={<InfoCircleOutlined />}
                              onClick={() => fetchPhotoMetadata(photo.filename)}
                            >
                              元数据
                            </Button>
                          </Tooltip>
                        ]}
                      >
                        <Card.Meta
                          title={photo.originalname}
                          description={
                            <div>
                              <Text type="secondary">大小: {(photo.size / 1024).toFixed(1)} KB</Text>
                              {photo.metadata && (
                                <div style={{ marginTop: '8px' }}>
                                  <Text code>{photo.metadata.image?.resolution || 'Unknown'}</Text>
                                  <br />
                                  <Text type="secondary">
                                    {photo.metadata.image?.megapixels || '0.00'}MP
                                  </Text>
                                </div>
                              )}
                            </div>
                          }
                        />
                      </Card>
                    </List.Item>
                  )}
                />
              </>
            )}
          </div>
        )}
      </Modal>

      {/* 造型报告Modal */}
      <Modal
        title="造型报告"
        open={reportModalVisible}
        onCancel={() => setReportModalVisible(false)}
        footer={null}
        width={900}
      >
        {selectedReport && (
          <div>
            <Alert
              message="AI生成的个性化造型报告"
              description={selectedReport.report?.summary}
              type="success"
              style={{ marginBottom: '16px' }}
            />

            <Descriptions title="个人信息" bordered size="small">
              <Descriptions.Item label="姓名">
                {selectedReport.report?.personalInfo?.name}
              </Descriptions.Item>
              <Descriptions.Item label="风格偏好">
                <Tag color={getStyleColor(selectedReport.report?.personalInfo?.stylePreference)}>
                  {selectedReport.report?.personalInfo?.stylePreference}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="生成时间">
                {formatTime(selectedReport.createdAt)}
              </Descriptions.Item>
            </Descriptions>

            <Divider>色彩搭配</Divider>
            <div>
              {selectedReport.report?.analysis?.colorPalette?.map((color, index) => (
                <Tag key={index} color="blue" style={{ margin: '2px' }}>
                  {color}
                </Tag>
              ))}
            </div>

            <Divider>造型建议</Divider>
            <List
              size="small"
              dataSource={selectedReport.report?.analysis?.recommendations || []}
              renderItem={(item, index) => (
                <List.Item>
                  <Text>
                    <Badge count={index + 1} size="small" /> {item}
                  </Text>
                </List.Item>
              )}
            />

            <Divider>搭配建议</Divider>
            <List
              size="small"
              dataSource={selectedReport.report?.outfitSuggestions || []}
              renderItem={(item, index) => (
                <List.Item>
                  <Text>
                    <HeartOutlined style={{ color: '#ff4d4f', marginRight: '8px' }} />
                    {item}
                  </Text>
                </List.Item>
              )}
            />

            <Divider>购物建议</Divider>
            <div>
              {selectedReport.report?.shoppingSuggestions?.map((brand, index) => (
                <Tag key={index} color="orange" style={{ margin: '2px' }}>
                  {brand}
                </Tag>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard; 