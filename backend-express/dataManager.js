const fs = require('fs-extra');
const path = require('path');

// 数据文件路径
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const REPORTS_FILE = path.join(DATA_DIR, 'reports.json');

// 确保数据目录存在
fs.ensureDirSync(DATA_DIR);

// 数据管理类
class DataManager {
  constructor() {
    this.initializeFiles();
  }

  // 初始化数据文件
  initializeFiles() {
    try {
      // 如果用户文件不存在，创建空数组
      if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
        console.log('📁 创建用户数据文件:', USERS_FILE);
      }

      // 如果报告文件不存在，创建空数组
      if (!fs.existsSync(REPORTS_FILE)) {
        fs.writeFileSync(REPORTS_FILE, JSON.stringify([], null, 2));
        console.log('📁 创建报告数据文件:', REPORTS_FILE);
      }
    } catch (error) {
      console.error('❌ 初始化数据文件失败:', error);
    }
  }

  // 读取用户数据
  getUsers() {
    try {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ 读取用户数据失败:', error);
      return [];
    }
  }

  // 保存用户数据
  saveUsers(users) {
    try {
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      console.log('✅ 用户数据已保存');
      return true;
    } catch (error) {
      console.error('❌ 保存用户数据失败:', error);
      return false;
    }
  }

  // 添加新用户
  addUser(user) {
    try {
      const users = this.getUsers();
      users.push(user);
      return this.saveUsers(users);
    } catch (error) {
      console.error('❌ 添加用户失败:', error);
      return false;
    }
  }

  // 根据ID查找用户
  getUserById(userId) {
    try {
      const users = this.getUsers();
      return users.find(user => user.id === userId);
    } catch (error) {
      console.error('❌ 查找用户失败:', error);
      return null;
    }
  }

  // 读取造型报告数据
  getReports() {
    try {
      const data = fs.readFileSync(REPORTS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('❌ 读取报告数据失败:', error);
      return [];
    }
  }

  // 保存造型报告数据
  saveReports(reports) {
    try {
      fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2));
      console.log('✅ 报告数据已保存');
      return true;
    } catch (error) {
      console.error('❌ 保存报告数据失败:', error);
      return false;
    }
  }

  // 添加新报告
  addReport(report) {
    try {
      const reports = this.getReports();
      reports.push(report);
      return this.saveReports(reports);
    } catch (error) {
      console.error('❌ 添加报告失败:', error);
      return false;
    }
  }

  // 根据用户ID查找报告
  getReportByUserId(userId) {
    try {
      const reports = this.getReports();
      return reports.find(report => report.userId === userId);
    } catch (error) {
      console.error('❌ 查找报告失败:', error);
      return null;
    }
  }

  // 获取所有报告（包含用户信息）
  getAllReportsWithUsers() {
    try {
      const reports = this.getReports();
      const users = this.getUsers();
      
      return reports.map(report => ({
        ...report,
        user: users.find(u => u.id === report.userId)
      }));
    } catch (error) {
      console.error('❌ 获取完整报告失败:', error);
      return [];
    }
  }

  // 获取统计信息
  getStatistics() {
    try {
      const users = this.getUsers();
      const reports = this.getReports();
      
      return {
        totalUsers: users.length,
        totalReports: reports.length,
        recentUsers: users.slice(-5).reverse(), // 最近5个用户
        popularStyles: this.getPopularStyles(users),
        dataFiles: {
          usersFile: USERS_FILE,
          reportsFile: REPORTS_FILE
        }
      };
    } catch (error) {
      console.error('❌ 获取统计信息失败:', error);
      return null;
    }
  }

  // 获取热门风格统计
  getPopularStyles(users) {
    try {
      const styleCount = {};
      users.forEach(user => {
        const style = user.stylePreference;
        styleCount[style] = (styleCount[style] || 0) + 1;
      });
      
      return Object.entries(styleCount)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([style, count]) => ({ style, count }));
    } catch (error) {
      console.error('❌ 统计热门风格失败:', error);
      return [];
    }
  }

  // 备份数据
  backupData() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(DATA_DIR, 'backups');
      fs.ensureDirSync(backupDir);
      
      // 备份用户数据
      const usersBackup = path.join(backupDir, `users_${timestamp}.json`);
      fs.copyFileSync(USERS_FILE, usersBackup);
      
      // 备份报告数据
      const reportsBackup = path.join(backupDir, `reports_${timestamp}.json`);
      fs.copyFileSync(REPORTS_FILE, reportsBackup);
      
      console.log('✅ 数据备份成功:', { usersBackup, reportsBackup });
      return { usersBackup, reportsBackup };
    } catch (error) {
      console.error('❌ 数据备份失败:', error);
      return null;
    }
  }

  // 清理旧备份（保留最近10个）
  cleanOldBackups() {
    try {
      const backupDir = path.join(DATA_DIR, 'backups');
      if (!fs.existsSync(backupDir)) return;
      
      const files = fs.readdirSync(backupDir);
      const backupFiles = files.filter(file => file.endsWith('.json'));
      
      if (backupFiles.length > 10) {
        const sortedFiles = backupFiles.sort().reverse();
        const filesToDelete = sortedFiles.slice(10);
        
        filesToDelete.forEach(file => {
          fs.unlinkSync(path.join(backupDir, file));
        });
        
        console.log(`🗑️ 清理了 ${filesToDelete.length} 个旧备份文件`);
      }
    } catch (error) {
      console.error('❌ 清理备份失败:', error);
    }
  }
}

// 创建单例实例
const dataManager = new DataManager();

// 定时备份（每小时）
setInterval(() => {
  dataManager.backupData();
  dataManager.cleanOldBackups();
}, 60 * 60 * 1000); // 1小时

module.exports = dataManager; 