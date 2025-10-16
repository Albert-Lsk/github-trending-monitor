# GitHub 趋势项目监控器

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

一个自动获取和展示 GitHub 趋势项目的应用程序，能够每天自动抓取热门项目，生成 Markdown 报告，并通过 Web 界面以卡片形式展示。

## 功能特性

- 🤖 **自动数据获取**：每天定时从 GitHub 获取趋势项目
- 📝 **智能报告生成**：自动生成格式化的 Markdown 报告
- 🕐 **定时任务系统**：每天 8:30 自动运行数据获取和报告生成
- 🔔 **提醒功能**：每天 9:30 发送通知提醒查看最新报告
- 🌐 **Web 界面**：响应式设计，支持多设备访问
- 🃏 **卡片展示**：以直观的卡片形式展示项目信息
- 📚 **历史报告**：查看和管理历史生成的报告
- 🤖 **MCP 集成**：支持 Model Context Protocol 进行智能代码执行

## 技术栈

- **后端**: Node.js + Express.js
- **前端**: Bootstrap 5 + 原生 JavaScript
- **数据源**: GitHub Trending API
- **任务调度**: node-cron
- **文件格式**: Markdown
- **测试**: Jest
- **智能协议**: Model Context Protocol (MCP)

## 项目结构

```
.
├── public/                 # 静态文件目录
│   ├── index.html          # 主页面
│   ├── css/style.css       # 自定义样式
│   └── js/app.js           # 前端逻辑
├── services/               # 业务逻辑层
│   ├── githubService.js    # GitHub 数据获取服务
│   ├── markdownGenerator.js# Markdown 报告生成器
│   └── scheduler.js        # 定时任务调度器
├── tests/                  # 测试文件
│   ├── githubService.test.js
│   ├── markdownGenerator.test.js
│   └── server.test.js
├── reports/                # 生成的报告文件（运行时创建）
├── server.js              # Express 服务器入口
├── package.json           # 项目配置和依赖
└── README.md              # 项目说明文档
```

## 快速开始

### 环境要求

- Node.js >= 14.0.0
- npm >= 6.0.0

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm start
```

服务器将在 `http://localhost:3000` 上运行。

### 运行测试

```bash
# 运行所有测试
npm test

# 监听模式运行测试
npm run test:watch
```

## 使用说明

1. 启动服务器后，访问 `http://localhost:3000` 查看 Web 界面
2. 系统会自动获取 GitHub 趋势项目并在首页展示
3. 每天 8:30 自动获取最新数据并生成 Markdown 报告
4. 每天 9:30 发送提醒通知
5. 在页面底部可以查看历史生成的报告

## API 接口

- `GET /api/trending` - 获取当前趋势项目
- `GET /api/cache-status` - 获取缓存状态
- `GET /api/github-health` - GitHub API 健康检查
- `GET /api/reports` - 获取报告列表
- `GET /api/report/:fileName` - 获取指定报告内容

## 定时任务

- **数据获取任务**：每天 8:30 执行
- **提醒任务**：每天 9:30 执行

## MCP (Model Context Protocol) 集成

本项目集成了 Model Context Protocol (MCP) 以支持智能代码执行和自动化任务。

### MCP 安装和配置

1. 确保已安装 iFlow CLI:
   ```bash
   npm install -g @iflow-ai/iflow-cli
   ```

2. 启动 MCP 服务器:
   ```bash
   npm run mcp:start
   ```

3. 检查 MCP 服务器状态:
   ```bash
   npm run mcp:dev
   ```

### MCP 功能

- 代码执行：使用 `mcp-server-code-runner` 服务器执行 Node.js 代码片段
- 自动化任务：通过 MCP 协议自动执行定时任务
- 智能辅助：在开发过程中提供智能代码建议和自动化操作

## 开发计划

- [x] 基础架构搭建
- [x] GitHub API 集成
- [x] Web 界面开发
- [x] 定时任务系统
- [x] Markdown 报告生成
- [x] 测试覆盖
- [x] MCP 集成
- [ ] 用户认证系统
- [ ] 邮件通知功能
- [ ] 数据库持久化
- [ ] 项目搜索和筛选

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 许可证

本项目采用 MIT 许可证。详情请见 [LICENSE](LICENSE) 文件。

## 联系方式

如果你有任何问题或建议，请通过以下方式联系：

- 创建 Issue
- 发送邮件至你的邮箱

感谢使用 GitHub 趋势项目监控器！🌟