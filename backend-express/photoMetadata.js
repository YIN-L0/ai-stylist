const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');

// 照片元数据提取器
class PhotoMetadataExtractor {
  constructor() {
    this.supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  }

  // 获取文件基础信息
  getBasicFileInfo(filePath, originalName = null) {
    try {
      const stats = fs.statSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const fileName = path.basename(filePath);
      
      return {
        fileName: originalName || fileName,
        serverFileName: fileName,
        fileSize: stats.size,
        fileSizeFormatted: this.formatFileSize(stats.size),
        fileFormat: ext.substring(1), // 去掉点号
        mimeType: this.getMimeType(ext),
        uploadTime: new Date().toISOString(),
        lastModified: stats.mtime.toISOString(),
        filePath: filePath,
        fileExtension: ext,
        isSupported: this.supportedFormats.includes(ext)
      };
    } catch (error) {
      console.error('获取文件基础信息失败:', error);
      return null;
    }
  }

  // 获取文件哈希值
  async getFileHash(filePath) {
    try {
      const fileBuffer = await fs.readFile(filePath);
      const hashSum = crypto.createHash('md5');
      hashSum.update(fileBuffer);
      return hashSum.digest('hex');
    } catch (error) {
      console.error('计算文件哈希失败:', error);
      return null;
    }
  }

  // 获取图像尺寸信息（简单实现）
  getImageDimensions(filePath) {
    try {
      // 对于简单的图像格式，我们可以读取文件头来获取尺寸
      const buffer = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      
      let dimensions = null;
      
      switch (ext) {
        case '.png':
          dimensions = this.getPNGDimensions(buffer);
          break;
        case '.jpg':
        case '.jpeg':
          dimensions = this.getJPEGDimensions(buffer);
          break;
        case '.gif':
          dimensions = this.getGIFDimensions(buffer);
          break;
        case '.bmp':
          dimensions = this.getBMPDimensions(buffer);
          break;
        default:
          console.log(`暂不支持 ${ext} 格式的尺寸检测`);
          dimensions = { width: 0, height: 0, note: '需要客户端提供尺寸信息' };
      }
      
      if (dimensions) {
        return {
          width: dimensions.width,
          height: dimensions.height,
          aspectRatio: dimensions.width && dimensions.height ? 
            (dimensions.width / dimensions.height).toFixed(2) : null,
          resolution: dimensions.width && dimensions.height ? 
            `${dimensions.width}x${dimensions.height}` : null,
          megapixels: dimensions.width && dimensions.height ? 
            ((dimensions.width * dimensions.height) / 1000000).toFixed(2) : null
        };
      }
      
      return null;
    } catch (error) {
      console.error('获取图像尺寸失败:', error);
      return null;
    }
  }

  // PNG尺寸提取
  getPNGDimensions(buffer) {
    if (buffer.length < 24) return null;
    
    // PNG文件头检查
    if (buffer.slice(0, 8).toString('hex') !== '89504e470d0a1a0a') return null;
    
    // IHDR chunk应该在第8字节开始
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    
    return { width, height };
  }

  // JPEG尺寸提取（简化版）
  getJPEGDimensions(buffer) {
    if (buffer.length < 10) return null;
    
    // JPEG文件头检查
    if (buffer[0] !== 0xFF || buffer[1] !== 0xD8) return null;
    
    let offset = 2;
    while (offset < buffer.length) {
      // 查找SOF标记
      if (buffer[offset] === 0xFF) {
        const marker = buffer[offset + 1];
        if (marker >= 0xC0 && marker <= 0xC3) {
          // 找到SOF标记
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height };
        }
        
        // 跳过这个段
        const segmentLength = buffer.readUInt16BE(offset + 2);
        offset += segmentLength + 2;
      } else {
        offset++;
      }
    }
    
    return null;
  }

  // GIF尺寸提取
  getGIFDimensions(buffer) {
    if (buffer.length < 10) return null;
    
    // GIF文件头检查
    const header = buffer.slice(0, 6).toString();
    if (header !== 'GIF87a' && header !== 'GIF89a') return null;
    
    const width = buffer.readUInt16LE(6);
    const height = buffer.readUInt16LE(8);
    
    return { width, height };
  }

  // BMP尺寸提取
  getBMPDimensions(buffer) {
    if (buffer.length < 26) return null;
    
    // BMP文件头检查
    if (buffer.slice(0, 2).toString() !== 'BM') return null;
    
    const width = buffer.readInt32LE(18);
    const height = Math.abs(buffer.readInt32LE(22)); // 高度可能是负数
    
    return { width, height };
  }

  // 获取MIME类型
  getMimeType(ext) {
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  // 格式化文件大小
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 获取完整的照片元数据
  async getCompleteMetadata(filePath, originalName = null, url = null) {
    try {
      const basicInfo = this.getBasicFileInfo(filePath, originalName);
      if (!basicInfo) return null;

      const dimensions = this.getImageDimensions(filePath);
      const fileHash = await this.getFileHash(filePath);

      const metadata = {
        // 基础文件信息
        file: {
          ...basicInfo,
          hash: fileHash,
          url: url
        },
        // 图像属性
        image: dimensions || {
          width: null,
          height: null,
          aspectRatio: null,
          resolution: null,
          megapixels: null,
          note: '无法获取图像尺寸'
        },
        // 处理信息
        processing: {
          extractedAt: new Date().toISOString(),
          extractorVersion: '1.0.0',
          status: 'completed'
        }
      };

      return metadata;
    } catch (error) {
      console.error('获取完整元数据失败:', error);
      return {
        error: error.message,
        processing: {
          extractedAt: new Date().toISOString(),
          status: 'failed'
        }
      };
    }
  }

  // 验证并清理元数据
  validateMetadata(metadata) {
    if (!metadata || !metadata.file) return false;
    
    // 基础验证
    const required = ['fileName', 'fileSize', 'fileFormat', 'uploadTime'];
    for (const field of required) {
      if (!metadata.file[field]) {
        console.warn(`元数据缺少必需字段: ${field}`);
        return false;
      }
    }
    
    return true;
  }

  // 生成元数据摘要
  generateSummary(metadata) {
    if (!metadata || !this.validateMetadata(metadata)) return null;
    
    const { file, image } = metadata;
    
    return {
      name: file.fileName,
      size: file.fileSizeFormatted,
      format: file.fileFormat.toUpperCase(),
      dimensions: image.resolution || 'Unknown',
      megapixels: image.megapixels ? `${image.megapixels}MP` : 'Unknown',
      aspectRatio: image.aspectRatio || 'Unknown'
    };
  }
}

// 创建单例实例
const photoMetadataExtractor = new PhotoMetadataExtractor();

module.exports = photoMetadataExtractor; 