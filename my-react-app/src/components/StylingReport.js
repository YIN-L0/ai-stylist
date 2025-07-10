import React from 'react';
import { Card, Typography, List, Tag, Space, Divider, Row, Col } from 'antd';
import { UserOutlined, HeartOutlined, ShoppingOutlined, StarOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const StylingReport = ({ reportData, userData }) => {
  console.log('StylingReport received data:', { reportData, userData });
  
  if (!reportData || !userData) {
    console.log('Missing data - reportData:', !!reportData, 'userData:', !!userData);
    return null;
  }

  // 修复：从reportData中提取stylingReport
  const report = reportData.stylingReport || reportData.report;
  const { name, email, stylePreference } = userData;

  console.log('Extracted report:', report);

  // 如果还是没有report数据，返回null
  if (!report) {
    console.error('Report data is missing:', reportData);
    return null;
  }

  return (
    <div className="styling-report">
      <Card className="report-header" bordered={false}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
            <HeartOutlined style={{ marginRight: '8px' }} />
            您的个性化造型报告
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            专为 {name} 量身定制
          </Text>
        </div>
      </Card>

      <Row gutter={[24, 24]}>
        {/* 个人信息摘要 */}
        <Col xs={24} lg={8}>
          <Card title={<><UserOutlined /> 个人信息</>} bordered={false}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text strong>姓名：</Text>
                <Text>{name}</Text>
              </div>
              <div>
                <Text strong>邮箱：</Text>
                <Text>{email}</Text>
              </div>
              <div>
                <Text strong>风格偏好：</Text>
                <Tag color="blue">{stylePreference}</Tag>
              </div>
              {report.personalInfo?.additionalPreferences && (
                <div>
                  <Text strong>其他偏好：</Text>
                  <Paragraph style={{ marginTop: '8px', marginBottom: 0 }}>
                    {report.personalInfo.additionalPreferences}
                  </Paragraph>
                </div>
              )}
            </Space>
          </Card>
        </Col>

        {/* 色彩分析 */}
        <Col xs={24} lg={8}>
          <Card title={<><StarOutlined /> 推荐色彩</>} bordered={false}>
            <div style={{ marginBottom: '16px' }}>
              <Text type="secondary">{report.analysis?.bodyType || '正在分析您的风格...'}</Text>
            </div>
            <Space wrap>
              {(report.analysis?.colorPalette || []).map((color, index) => (
                <Tag key={index} color="volcano" style={{ margin: '4px' }}>
                  {color}
                </Tag>
              ))}
            </Space>
          </Card>
        </Col>

        {/* 购物建议 */}
        <Col xs={24} lg={8}>
          <Card title={<><ShoppingOutlined /> 推荐品牌</>} bordered={false}>
            <List
              dataSource={report.shoppingSuggestions || []}
              renderItem={(brand) => (
                <List.Item style={{ padding: '8px 0' }}>
                  <Tag color="green">{brand}</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[24, 24]}>
        {/* 造型建议 */}
        <Col xs={24} lg={12}>
          <Card title="💡 专业造型建议" bordered={false}>
            <List
              dataSource={report.analysis?.recommendations || []}
              renderItem={(recommendation, index) => (
                <List.Item style={{ alignItems: 'flex-start' }}>
                  <List.Item.Meta
                    avatar={<span style={{ color: '#1890ff', fontWeight: 'bold' }}>{index + 1}.</span>}
                    description={recommendation}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 搭配方案 */}
        <Col xs={24} lg={12}>
          <Card title="👗 推荐搭配" bordered={false}>
            <List
              dataSource={report.outfitSuggestions || []}
              renderItem={(outfit, index) => (
                <List.Item style={{ alignItems: 'flex-start' }}>
                  <List.Item.Meta
                    avatar={<span style={{ color: '#52c41a', fontWeight: 'bold' }}>Look {index + 1}</span>}
                    description={outfit}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* AI个性化分析 */}
      {report.aiStyleAnalysis && (
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <Card title="🤖 AI个性化风格分析" bordered={false}>
              <div style={{ 
                background: 'linear-gradient(135deg, #f6f9fc 0%, #e9f2ff 100%)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e6f7ff'
              }}>
                <Text style={{ 
                  fontSize: '16px', 
                  fontStyle: 'italic',
                  color: '#1890ff',
                  lineHeight: '1.8'
                }}>
                  "{report.aiStyleAnalysis}"
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      <Divider />

      {/* 总结 */}
      <Card title="📝 总结" bordered={false}>
        <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
          {report.summary || '正在为您生成个性化的造型总结...'}
        </Paragraph>
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Text type="secondary">
            感谢使用AI时尚造型师！希望这些建议能帮助您展现最美的自己 ✨
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default StylingReport; 