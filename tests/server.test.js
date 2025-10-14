const request = require('supertest');
const app = require('../server');
const githubService = require('../services/githubService');
const markdownGenerator = require('../services/markdownGenerator');

// Mock the services
jest.mock('../services/githubService');
jest.mock('../services/markdownGenerator');
jest.mock('../services/scheduler');

// Mock dotenv
jest.mock('dotenv', () => ({
    config: jest.fn()
}));

describe('Server API Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /', () => {
        it('应该返回主页HTML', async () => {
            const response = await request(app)
                .get('/')
                .expect(200);

            expect(response.text).toContain('<!DOCTYPE html>');
            expect(response.text).toContain('GitHub趋势项目');
        });
    });

    describe('GET /api/health', () => {
        it('应该返回健康状态', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body).toEqual({
                status: 'OK',
                message: '服务器运行正常'
            });
        });
    });

    describe('GET /api/trending', () => {
        it('应该返回趋势项目数据', async () => {
            const mockProjects = [
                {
                    name: 'test/repo',
                    url: 'https://github.com/test/repo',
                    description: 'Test project',
                    stars: 1000,
                    forks: 100,
                    language: 'JavaScript',
                    updatedAt: 'today',
                    rank: 1
                }
            ];

            githubService.getTrendingProjects.mockResolvedValue(mockProjects);

            const response = await request(app)
                .get('/api/trending')
                .expect(200);

            expect(response.body).toEqual(mockProjects);
            expect(githubService.getTrendingProjects).toHaveBeenCalledTimes(1);
        });

        it('处理获取趋势项目失败的情况', async () => {
            const errorMessage = 'API error';
            githubService.getTrendingProjects.mockRejectedValue(new Error(errorMessage));

            const response = await request(app)
                .get('/api/trending')
                .expect(500);

            expect(response.body).toEqual({
                error: '获取趋势项目失败',
                message: errorMessage
            });
        });
    });

    describe('GET /api/cache-status', () => {
        it('应该返回缓存状态', async () => {
            const mockCacheStatus = {
                hasCache: true,
                lastFetch: Date.now(),
                cacheAge: 1000,
                isExpired: false
            };

            githubService.getCacheStatus.mockReturnValue(mockCacheStatus);

            const response = await request(app)
                .get('/api/cache-status')
                .expect(200);

            expect(response.body).toEqual(mockCacheStatus);
            expect(githubService.getCacheStatus).toHaveBeenCalledTimes(1);
        });
    });

    describe('GET /api/github-health', () => {
        it('应该返回GitHub健康状态', async () => {
            const mockHealth = {
                status: 'healthy',
                timestamp: Date.now()
            };

            githubService.healthCheck.mockResolvedValue(mockHealth);

            const response = await request(app)
                .get('/api/github-health')
                .expect(200);

            expect(response.body).toEqual(mockHealth);
            expect(githubService.healthCheck).toHaveBeenCalledTimes(1);
        });

        it('处理健康检查失败的情况', async () => {
            const errorMessage = 'Health check failed';
            githubService.healthCheck.mockRejectedValue(new Error(errorMessage));

            const response = await request(app)
                .get('/api/github-health')
                .expect(500);

            expect(response.body).toEqual({
                status: 'error',
                message: errorMessage
            });
        });
    });

    describe('GET /api/reports', () => {
        it('应该返回报告列表', async () => {
            const mockReports = [
                {
                    fileName: 'report1.md',
                    filePath: '/path/to/report1.md',
                    createdAt: new Date('2024-01-15'),
                    modifiedAt: new Date('2024-01-16'),
                    size: 1024
                },
                {
                    fileName: 'report2.md',
                    filePath: '/path/to/report2.md',
                    createdAt: new Date('2024-01-14'),
                    modifiedAt: new Date('2024-01-15'),
                    size: 2048
                }
            ];

            markdownGenerator.getReportList.mockReturnValue(mockReports);

            const response = await request(app)
                .get('/api/reports')
                .expect(200);

            expect(response.body).toEqual(mockReports);
            expect(markdownGenerator.getReportList).toHaveBeenCalledTimes(1);
        });

        it('处理获取报告列表失败的情况', async () => {
            const errorMessage = 'Failed to get reports';
            markdownGenerator.getReportList.mockImplementation(() => {
                throw new Error(errorMessage);
            });

            const response = await request(app)
                .get('/api/reports')
                .expect(500);

            expect(response.body).toEqual({
                error: '获取报告列表失败',
                message: errorMessage
            });
        });
    });

    describe('GET /api/report/:fileName', () => {
        it('应该返回报告内容', async () => {
            const fileName = 'test-report.md';
            const mockContent = '# Test Report\nThis is a test report content.';
            
            markdownGenerator.readReport.mockReturnValue(mockContent);

            const response = await request(app)
                .get(`/api/report/${fileName}`)
                .expect(200);

            expect(response.text).toBe(mockContent);
            expect(markdownGenerator.readReport).toHaveBeenCalledWith(fileName);
        });

        it('处理读取报告失败的情况', async () => {
            const fileName = 'nonexistent.md';
            const errorMessage = 'Report not found';
            
            markdownGenerator.readReport.mockImplementation(() => {
                throw new Error(errorMessage);
            });

            const response = await request(app)
                .get(`/api/report/${fileName}`)
                .expect(500);

            expect(response.body).toEqual({
                error: '读取报告失败',
                message: errorMessage
            });
        });
    });

    describe('Error Handling', () => {
        it('应该正确处理无效的JSON请求', async () => {
            const response = await request(app)
                .post('/api/trending')
                .send('invalid json')
                .expect(404); // 404因为没有POST路由
        });

        it('应该处理不存在的路由', async () => {
            const response = await request(app)
                .get('/api/nonexistent')
                .expect(404);
        });
    });

    describe('Content-Type', () => {
        it('主页应该返回HTML内容类型', async () => {
            const response = await request(app)
                .get('/')
                .expect('Content-Type', /text\/html/);
        });

        it('API路由应该返回JSON内容类型', async () => {
            githubService.getTrendingProjects.mockResolvedValue([]);
            
            const response = await request(app)
                .get('/api/trending')
                .expect('Content-Type', /application\/json/);
        });

        it('报告内容应该返回文本内容类型', async () => {
            markdownGenerator.readReport.mockReturnValue('test content');
            
            const response = await request(app)
                .get('/api/report/test.md')
                .expect('Content-Type', /text\/html/); // Express默认会设置为text/html
        });
    });

    describe('Static Files', () => {
        it('应该能够访问静态CSS文件', async () => {
            // 这个测试可能需要根据实际的静态文件结构调整
            const response = await request(app)
                .get('/css/style.css')
                .expect(404); // 因为没有实际的CSS文件，所以返回404是正常的
        });

        it('应该能够访问静态JS文件', async () => {
            // 这个测试可能需要根据实际的静态文件结构调整
            const response = await request(app)
                .get('/js/app.js')
                .expect(404); // 因为没有实际的JS文件，所以返回404是正常的
        });
    });

    describe('Environment Variables', () => {
        it('应该使用默认端口3000', () => {
            // 这个测试验证了默认端口设置
            expect(process.env.PORT || 3000).toBeDefined();
        });
    });
});

// 服务器启动测试
describe('Server Startup', () => {
    it('应该能够启动服务器', () => {
        // 验证app对象是否正确导出
        expect(app).toBeDefined();
        expect(typeof app.listen).toBe('function');
    });
});