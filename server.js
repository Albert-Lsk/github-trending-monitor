const express = require('express');
const path = require('path');
const cron = require('node-cron');
require('dotenv').config();

const githubService = require('./services/githubService');
const markdownGenerator = require('./services/markdownGenerator');
const scheduler = require('./services/scheduler');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: '服务器运行正常' });
});

// 获取趋势项目API
app.get('/api/trending', async (req, res) => {
    try {
        const projects = await githubService.getTrendingProjects();
        res.json(projects);
    } catch (error) {
        console.error('获取趋势项目失败:', error);
        res.status(500).json({ 
            error: '获取趋势项目失败', 
            message: error.message 
        });
    }
});

// 获取缓存状态API
app.get('/api/cache-status', (req, res) => {
    res.json(githubService.getCacheStatus());
});

// 健康检查API
app.get('/api/github-health', async (req, res) => {
    try {
        const health = await githubService.healthCheck();
        res.json(health);
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: error.message 
        });
    }
});

// 获取报告列表API
app.get('/api/reports', (req, res) => {
    try {
        const reports = markdownGenerator.getReportList();
        res.json(reports);
    } catch (error) {
        console.error('获取报告列表失败:', error);
        res.status(500).json({ 
            error: '获取报告列表失败', 
            message: error.message 
        });
    }
});

// 读取报告内容API
app.get('/api/report/:fileName', (req, res) => {
    try {
        const { fileName } = req.params;
        const content = markdownGenerator.readReport(fileName);
        res.send(content);
    } catch (error) {
        console.error('读取报告失败:', error);
        res.status(500).json({ 
            error: '读取报告失败', 
            message: error.message 
        });
    }
});

// 启动定时任务
scheduler.start();

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器正在运行，端口: ${PORT}`);
});

module.exports = app;