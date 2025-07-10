import axios from 'axios';

// 配置基础URL - 支持生产环境
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    console.log('发送请求:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    console.log('收到响应:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('响应错误:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API函数

// 健康检查
export const healthCheck = async () => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('后端服务不可用');
  }
};

// 文件上传到服务器
export const uploadFiles = async (files) => {
  try {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('photos', file.originFileObj || file);
    });

    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || '文件上传失败');
  }
};

// 提交造型请求
export const submitStylingRequest = async (formData, fileList) => {
  try {
    const submitFormData = new FormData();
    
    // 添加表单数据
    Object.keys(formData).forEach(key => {
      if (formData[key]) {
        submitFormData.append(key, formData[key]);
      }
    });

    // 添加文件
    fileList.forEach((file) => {
      if (file.originFileObj) {
        submitFormData.append('photos', file.originFileObj);
      }
    });

    const response = await apiClient.post('/submit-styling-request', submitFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || '提交失败，请稍后重试');
  }
};

// 获取用户信息
export const getUserInfo = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || '获取用户信息失败');
  }
};

// 获取造型报告
export const getStylingReport = async (userId) => {
  try {
    const response = await apiClient.get(`/styling-report/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || '获取造型报告失败');
  }
};

// 获取所有造型报告（管理功能）
export const getAllStylingReports = async () => {
  try {
    const response = await apiClient.get('/styling-reports');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || '获取报告列表失败');
  }
};

const apiService = {
  healthCheck,
  uploadFiles,
  submitStylingRequest,
  getUserInfo,
  getStylingReport,
  getAllStylingReports,
};

export default apiService; 