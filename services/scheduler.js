const cron = require('node-cron');
const githubService = require('./githubService');
const markdownGenerator = require('./markdownGenerator');

class Scheduler {
    constructor() {
        this.isRunning = false;
    }

    // 启动定时任务
    start() {
        // 每天8:30执行趋势报告生成任务
        cron.schedule('30 8 * * *', async () => {
            console.log('开始执行每日趋势报告生成任务...');
            await this.generateDailyReport();
        }, {
            timezone: "Asia/Shanghai"
        });

        // 每天9:30执行提醒任务
        cron.schedule('30 9 * * *', () => {
            console.log('开始执行每日提醒任务...');
            this.sendDailyReminder();
        }, {
            timezone: "Asia/Shanghai"
        });

        console.log('定时任务系统已启动');
        console.log('趋势报告任务: 每天 8:30');
        console.log('提醒任务: 每天 9:30');
    }

    // 生成每日趋势报告
    async generateDailyReport() {
        if (this.isRunning) {
            console.log('任务已在运行中，跳过本次执行');
            return;
        }

        this.isRunning = true;
        
        try {
            console.log('正在获取GitHub趋势项目...');
            const projects = await githubService.getTrendingProjects();
            
            if (projects && projects.length > 0) {
                console.log(`获取到 ${projects.length} 个项目，正在生成报告...`);
                const filePath = markdownGenerator.generateTrendingReport(projects);
                console.log(`报告生成成功: ${filePath}`);
                
                // 清理旧报告，保留最近7个
                markdownGenerator.cleanupOldReports(7);
            } else {
                console.log('未获取到趋势项目数据');
            }
        } catch (error) {
            console.error('生成每日趋势报告失败:', error);
        } finally {
            this.isRunning = false;
        }
    }

    // 发送每日提醒
    sendDailyReminder() {
        try {
            // 这里可以集成邮件、微信、钉钉等提醒功能
            console.log('📢 每日提醒: 请查看最新的GitHub趋势项目报告');
            
            // 可以在这里添加具体的提醒逻辑
            // 例如发送邮件、调用 webhook 等
        } catch (error) {
            console.error('发送每日提醒失败:', error);
        }
    }
}

module.exports = new Scheduler();