const path = require('path');
const fs = require('fs-extra');
const photoMetadataExtractor = require('./photoMetadata');

// 测试照片元数据提取功能
async function testMetadataExtraction() {
  console.log('🧪 开始测试照片元数据提取功能...\n');

  // 创建测试目录
  const testDir = path.join(__dirname, 'test-photos');
  await fs.ensureDir(testDir);

  // 模拟创建一个简单的PNG测试文件
  const testPngPath = path.join(testDir, 'test-image.png');
  
  // 创建一个最小的PNG文件 (1x1像素透明PNG)
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG文件头
    0x00, 0x00, 0x00, 0x0D, // IHDR chunk长度
    0x49, 0x48, 0x44, 0x52, // IHDR
    0x00, 0x00, 0x00, 0x01, // 宽度 = 1
    0x00, 0x00, 0x00, 0x01, // 高度 = 1
    0x08, 0x06, 0x00, 0x00, 0x00, // 位深度, 颜色类型等
    0x1F, 0x15, 0xC4, 0x89, // CRC
    0x00, 0x00, 0x00, 0x0A, // IDAT chunk长度
    0x49, 0x44, 0x41, 0x54, // IDAT
    0x78, 0x9C, 0x62, 0x00, 0x00, 0x00, 0x02, 0x00, 0x01, // 压缩数据
    0xE2, 0x21, 0xBC, 0x33, // CRC
    0x00, 0x00, 0x00, 0x00, // IEND chunk长度
    0x49, 0x45, 0x4E, 0x44, // IEND
    0xAE, 0x42, 0x60, 0x82  // CRC
  ]);

  // 写入测试文件
  await fs.writeFile(testPngPath, pngBuffer);
  console.log(`✅ 创建测试PNG文件: ${testPngPath}`);

  try {
    // 测试基础文件信息提取
    console.log('\n📋 测试基础文件信息提取:');
    const basicInfo = photoMetadataExtractor.getBasicFileInfo(testPngPath, 'test-image.png');
    console.log('基础信息:', JSON.stringify(basicInfo, null, 2));

    // 测试图像尺寸提取
    console.log('\n📐 测试图像尺寸提取:');
    const dimensions = photoMetadataExtractor.getImageDimensions(testPngPath);
    console.log('图像尺寸:', JSON.stringify(dimensions, null, 2));

    // 测试文件哈希计算
    console.log('\n🔒 测试文件哈希计算:');
    const hash = await photoMetadataExtractor.getFileHash(testPngPath);
    console.log('文件哈希:', hash);

    // 测试完整元数据提取
    console.log('\n📊 测试完整元数据提取:');
    const testUrl = 'http://localhost:5001/uploads/test-image.png';
    const completeMetadata = await photoMetadataExtractor.getCompleteMetadata(
      testPngPath, 
      'test-image.png', 
      testUrl
    );
    console.log('完整元数据:', JSON.stringify(completeMetadata, null, 2));

    // 测试元数据验证
    console.log('\n✔️ 测试元数据验证:');
    const isValid = photoMetadataExtractor.validateMetadata(completeMetadata);
    console.log('元数据有效性:', isValid);

    // 测试元数据摘要生成
    console.log('\n📝 测试元数据摘要生成:');
    const summary = photoMetadataExtractor.generateSummary(completeMetadata);
    console.log('元数据摘要:', JSON.stringify(summary, null, 2));

    console.log('\n✅ 所有测试完成！');

  } catch (error) {
    console.error('\n❌ 测试过程中发生错误:', error);
  } finally {
    // 清理测试文件
    try {
      await fs.remove(testDir);
      console.log('\n🧹 测试文件已清理');
    } catch (cleanupError) {
      console.warn('清理测试文件时出错:', cleanupError);
    }
  }
}

// 测试不同格式的支持
async function testFormatSupport() {
  console.log('\n🎨 测试不同格式支持:');
  
  const formats = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.tiff'];
  
  formats.forEach(format => {
    const mimeType = photoMetadataExtractor.getMimeType(format);
    console.log(`${format} -> ${mimeType}`);
  });
}

// 测试文件大小格式化
function testFileSizeFormatting() {
  console.log('\n📏 测试文件大小格式化:');
  
  const testSizes = [0, 512, 1024, 1536, 2048, 1048576, 5242880, 1073741824];
  
  testSizes.forEach(size => {
    const formatted = photoMetadataExtractor.formatFileSize(size);
    console.log(`${size} 字节 -> ${formatted}`);
  });
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始运行照片元数据提取器测试套件\n');
  
  await testMetadataExtraction();
  await testFormatSupport();
  testFileSizeFormatting();
  
  console.log('\n🎉 所有测试完成！');
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testMetadataExtraction,
  testFormatSupport,
  testFileSizeFormatting,
  runAllTests
}; 