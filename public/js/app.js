// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    loadProjects();
    loadReports();
});

// 加载项目数据
async function loadProjects() {
    const container = document.getElementById('projects-container');
    
    // 显示加载状态
    container.innerHTML = `
        <div class="col-12 loading">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">加载中...</span>
            </div>
            <p class="mt-3">正在获取GitHub趋势项目...</p>
        </div>
    `;

    try {
        const response = await fetch('/api/trending');
        const projects = await response.json();
        
        if (projects.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center">
                    <i class="bi bi-inbox display-1 text-muted"></i>
                    <h3 class="mt-3 text-muted">暂无项目数据</h3>
                    <p class="text-muted">请稍后再试或检查API配置</p>
                </div>
            `;
            return;
        }

        // 渲染项目卡片
        container.innerHTML = projects.map(project => createProjectCard(project)).join('');
    } catch (error) {
        console.error('加载项目失败:', error);
        container.innerHTML = `
            <div class="col-12 text-center">
                <i class="bi bi-exclamation-triangle display-1 text-warning"></i>
                <h3 class="mt-3">加载失败</h3>
                <p class="text-muted">无法获取项目数据，请检查网络连接</p>
                <button class="btn btn-primary" onclick="loadProjects()">重试</button>
            </div>
        `;
    }
}

// 创建项目卡片HTML
function createProjectCard(project) {
    return `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card project-card h-100">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">
                        <a href="${project.url}" target="_blank" class="project-title">
                            ${project.name}
                        </a>
                    </h5>
                    
                    ${project.description ? 
                        `<p class="card-text description-text flex-grow-1">${project.description}</p>` : 
                        '<p class="card-text text-muted">暂无描述</p>'
                    }
                    
                    <div class="mt-auto">
                        ${project.language ? 
                            `<span class="badge bg-secondary language-badge me-2">${project.language}</span>` : ''
                        }
                        
                        <span class="badge stars-badge me-2">
                            <i class="bi bi-star-fill"></i> ${formatNumber(project.stars)}
                        </span>
                        
                        <span class="badge forks-badge">
                            <i class="bi bi-diagram-2-fill"></i> ${formatNumber(project.forks)}
                        </span>
                    </div>
                    
                    <div class="mt-2 text-muted small">
                        <i class="bi bi-clock"></i> ${project.updatedAt || '今天'}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 格式化数字显示
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// 加载报告列表
async function loadReports() {
    const container = document.getElementById('reports-container');
    
    try {
        const response = await fetch('/api/reports');
        const reports = await response.json();
        
        if (reports.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted">
                    <i class="bi bi-file-earmark-text display-1"></i>
                    <p class="mt-2">暂无历史报告</p>
                </div>
            `;
            return;
        }

        // 渲染报告列表
        container.innerHTML = `
            <div class="list-group">
                ${reports.map(report => createReportItem(report)).join('')}
            </div>
        `;
    } catch (error) {
        console.error('加载报告列表失败:', error);
        container.innerHTML = `
            <div class="text-center text-danger">
                <i class="bi bi-exclamation-triangle display-1"></i>
                <p>加载报告列表失败</p>
            </div>
        `;
    }
}

// 创建报告项HTML
function createReportItem(report) {
    const date = new Date(report.createdAt);
    const formattedDate = date.toLocaleDateString('zh-CN');
    const formattedTime = date.toLocaleTimeString('zh-CN');
    const size = formatFileSize(report.size);
    
    return `
        <a href="#" class="list-group-item list-group-item-action" onclick="viewReport('${report.fileName}'); return false;">
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6 class="mb-1">${report.fileName}</h6>
                    <small class="text-muted">
                        <i class="bi bi-calendar"></i> ${formattedDate} 
                        <i class="bi bi-clock ms-2"></i> ${formattedTime}
                        <i class="bi bi-file-earmark ms-2"></i> ${size}
                    </small>
                </div>
                <i class="bi bi-chevron-right"></i>
            </div>
        </a>
    `;
}

// 查看报告内容
async function viewReport(fileName) {
    try {
        const response = await fetch(`/api/report/${fileName}`);
        const content = await response.text();
        
        // 创建模态框显示报告内容
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.id = 'reportModal';
        modal.tabIndex = '-1';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg modal-fullscreen-lg-down">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">报告: ${fileName}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <pre class="bg-light p-3 rounded">${content}</pre>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // 显示模态框
        const bootstrapModal = new bootstrap.Modal(modal);
        bootstrapModal.show();
        
        // 模态框关闭后移除DOM元素
        modal.addEventListener('hidden.bs.modal', function () {
            document.body.removeChild(modal);
        });
    } catch (error) {
        console.error('查看报告失败:', error);
        alert('查看报告失败: ' + error.message);
    }
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 添加提醒功能
function sendReminder() {
    // 这里可以集成浏览器通知功能
    if (Notification.permission === 'granted') {
        new Notification('GitHub趋势项目更新提醒', {
            body: '📢 新的GitHub趋势项目报告已生成，请查看!',
            icon: '/favicon.ico'
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('GitHub趋势项目更新提醒', {
                    body: '📢 新的GitHub趋势项目报告已生成，请查看!',
                    icon: '/favicon.ico'
                });
            }
        });
    }
}

// 每天9:30检查是否需要发送提醒
function checkAndSendReminder() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // 检查是否是9:30
    if (hours === 9 && minutes === 30) {
        sendReminder();
    }
}

// 每分钟检查一次是否需要发送提醒
setInterval(checkAndSendReminder, 60000);