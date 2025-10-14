const fs = require('fs');
const path = require('path');

class MarkdownGenerator {
    constructor() {
        this.outputDir = path.join(__dirname, '..', 'reports');
        this.ensureOutputDir();
    }

    // 确保输出目录存在
    ensureOutputDir() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    // 生成趋势项目报告
    generateTrendingReport(projects, date = new Date()) {
        const fileName = `trending-${this.formatDate(date)}.md`;
        const filePath = path.join(this.outputDir, fileName);
        
        const markdown = this.buildMarkdownContent(projects, date);
        
        try {
            fs.writeFileSync(filePath, markdown, 'utf8');
            console.log(`Markdown报告已生成: ${filePath}`);
            return filePath;
        } catch (error) {
            console.error('生成Markdown报告失败:', error);
            throw error;
        }
    }

    // 构建Markdown内容
    buildMarkdownContent(projects, date) {
        const title = `# GitHub 趋势项目报告 - ${this.formatDateDisplay(date)}`;
        const summary = this.generateSummary(projects);
        const projectList = this.generateProjectList(projects);
        const footer = this.generateFooter(date);

        return [title, summary, projectList, footer].join('\n\n');
    }

    // 生成摘要
    generateSummary(projects) {
        const totalProjects = projects.length;
        const totalStars = projects.reduce((sum, project) => sum + project.stars, 0);
        const totalForks = projects.reduce((sum, project) => sum + project.forks, 0);
        
        // 统计语言分布
        const languageStats = this.getLanguageStats(projects);
        
        return `## 📊 摘要

- **项目总数**: ${totalProjects}
- **总星数**: ${this.formatNumber(totalStars)}
- **总Fork数**: ${this.formatNumber(totalForks)}
- **主要语言**: ${this.formatLanguageStats(languageStats)}

> 报告生成时间: ${new Date().toLocaleString('zh-CN')}`;
    }

    // 生成项目列表
    generateProjectList(projects) {
        let content = '## 🚀 趋势项目列表\n\n';
        
        projects.forEach((project, index) => {
            content += `### ${index + 1}. ${project.name}\n\n`;
            
            if (project.description) {
                content += `**描述**: ${project.description}\n\n`;
            }
            
            content += `**链接**: [${project.name}](${project.url})\n\n`;
            
            // 项目统计信息
            content += `**统计**:\n`;
            content += `- ⭐ 星数: ${this.formatNumber(project.stars)}\n`;
            content += `- 🍴 Fork数: ${this.formatNumber(project.forks)}\n`;
            
            if (project.language) {
                content += `- 💻 语言: ${project.language}\n`;
            }
            
            if (project.updatedAt) {
                content += `- 🕐 更新时间: ${project.updatedAt}\n`;
            }
            
            content += '\n---\n\n';
        });
        
        return content;
    }

    // 获取语言统计
    getLanguageStats(projects) {
        const languageCount = {};
        
        projects.forEach(project => {
            if (project.language) {
                languageCount[project.language] = (languageCount[project.language] || 0) + 1;
            }
        });
        
        // 按数量排序
        const sortedLanguages = Object.entries(languageCount)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5); // 取前5个主要语言
            
        return sortedLanguages;
    }

    // 格式化语言统计
    formatLanguageStats(languageStats) {
        if (languageStats.length === 0) return '无';
        
        return languageStats
            .map(([language, count]) => `${language}(${count})`)
            .join(', ');
    }

    // 生成页脚
    generateFooter(date) {
        return `---

## 📝 说明

本报告由 GitHub 趋势项目监控器自动生成。

- **数据来源**: [GitHub Trending](https://github.com/trending)
- **生成时间**: ${new Date().toLocaleString('zh-CN')}
- **报告日期**: ${this.formatDateDisplay(date)}

> 💡 **提示**: 此报告展示了当前最热门的GitHub项目，按趋势排序。

---

*Powered by GitHub Trending Monitor*`;
    }

    // 格式化日期（文件名用）
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // 格式化日期显示
    formatDateDisplay(date) {
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    }

    // 格式化数字
    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // 获取报告列表
    getReportList() {
        try {
            const files = fs.readdirSync(this.outputDir)
                .filter(file => file.endsWith('.md'))
                .sort()
                .reverse();
                
            return files.map(file => {
                const filePath = path.join(this.outputDir, file);
                const stats = fs.statSync(filePath);
                return {
                    fileName: file,
                    filePath: filePath,
                    createdAt: stats.birthtime,
                    modifiedAt: stats.mtime,
                    size: stats.size
                };
            });
        } catch (error) {
            console.error('获取报告列表失败:', error);
            return [];
        }
    }

    // 读取报告内容
    readReport(fileName) {
        try {
            const filePath = path.join(this.outputDir, fileName);
            if (!fs.existsSync(filePath)) {
                throw new Error('报告文件不存在');
            }
            
            return fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            console.error('读取报告失败:', error);
            throw error;
        }
    }

    // 删除旧报告（保留最近N个）
    cleanupOldReports(keepCount = 7) {
        try {
            const reports = this.getReportList();
            
            if (reports.length > keepCount) {
                const toDelete = reports.slice(keepCount);
                
                toDelete.forEach(report => {
                    fs.unlinkSync(report.filePath);
                    console.log(`已删除旧报告: ${report.fileName}`);
                });
                
                console.log(`清理完成，保留了最近 ${keepCount} 个报告`);
            }
        } catch (error) {
            console.error('清理旧报告失败:', error);
        }
    }
}

module.exports = new MarkdownGenerator();