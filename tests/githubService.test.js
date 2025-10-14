const GitHubService = require('../services/githubService');
const axios = require('axios');

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('GitHubService', () => {
    let service;

    beforeEach(() => {
        service = GitHubService;
        service.clearCache();
        jest.clearAllMocks();
    });

    describe('getTrendingProjects', () => {
        it('应该返回趋势项目数据', async () => {
            const mockHtml = `
                <div class="Box-row">
                    <h2><a href="/test/repo">test/repo</a></h2>
                    <p>Test description</p>
                    <a href="/test/repo/stargazers">1,234</a>
                    <a href="/test/repo/forks">567</a>
                    <span itemprop="programmingLanguage">JavaScript</span>
                    <relative-time datetime="2024-01-01">today</relative-time>
                </div>
            `;

            mockedAxios.get.mockResolvedValue({
                data: mockHtml
            });

            const projects = await service.getTrendingProjects();

            expect(projects).toHaveLength(1);
            expect(projects[0]).toMatchObject({
                name: 'test/repo',
                url: 'https://github.com/test/repo',
                description: 'Test description',
                stars: 1234,
                forks: 567,
                language: 'JavaScript',
                updatedAt: '2024-01-01',
                rank: 1
            });
        });

        it('应该使用缓存数据', async () => {
            const mockHtml = `
                <div class="Box-row">
                    <h2><a href="/test/repo">test/repo</a></h2>
                </div>
            `;

            mockedAxios.get.mockResolvedValue({
                data: mockHtml
            });

            // 第一次调用
            await service.getTrendingProjects();
            // 第二次调用应该使用缓存
            await service.getTrendingProjects();

            expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        });

        it('网络错误时应该返回模拟数据', async () => {
            mockedAxios.get.mockRejectedValue(new Error('Network error'));

            const projects = await service.getTrendingProjects();

            expect(projects).toHaveLength(5);
            expect(projects[0].name).toBe('microsoft/vscode');
        });

        it('解析失败时应该返回空数组', async () => {
            mockedAxios.get.mockResolvedValue({
                data: '<div>No trending projects</div>'
            });

            const projects = await service.getTrendingProjects();

            expect(projects).toHaveLength(0);
        });
    });

    describe('parseTrendingProjects', () => {
        it('应该正确解析项目信息', () => {
            const mockHtml = `
                <div class="Box-row">
                    <h2><a href="/user/repo1">user/repo1</a></h2>
                    <p>Description 1</p>
                    <a href="/user/repo1/stargazers">1.2k</a>
                    <a href="/user/repo1/forks">345</a>
                    <span itemprop="programmingLanguage">TypeScript</span>
                    <relative-time datetime="2024-01-01">today</relative-time>
                </div>
                <div class="Box-row">
                    <h2><a href="/user/repo2">user/repo2</a></h2>
                    <a href="/user/repo2/stargazers">5.6k</a>
                    <a href="/user/repo2/forks">789</a>
                    <span itemprop="programmingLanguage">Python</span>
                    <relative-time datetime="2024-01-02">yesterday</relative-time>
                </div>
            `;

            const projects = service.parseTrendingProjects(mockHtml);

            expect(projects).toHaveLength(2);
            expect(projects[0]).toMatchObject({
                name: 'user/repo1',
                description: 'Description 1',
                stars: 1200,
                forks: 345,
                language: 'TypeScript',
                rank: 1
            });
            expect(projects[1]).toMatchObject({
                name: 'user/repo2',
                description: '',
                stars: 5600,
                forks: 789,
                language: 'Python',
                rank: 2
            });
        });
    });

    describe('parseNumber', () => {
        it('应该正确解析数字', () => {
            expect(service.parseNumber('1.2k')).toBe(1200);
            expect(service.parseNumber('5.6k')).toBe(5600);
            expect(service.parseNumber('1234')).toBe(1234);
            expect(service.parseNumber('')).toBe(0);
            expect(service.parseNumber(null)).toBe(0);
            expect(service.parseNumber('invalid')).toBe(0);
        });
    });

    describe('getCacheStatus', () => {
        it('应该返回正确的缓存状态', () => {
            const status = service.getCacheStatus();
            
            expect(status).toHaveProperty('hasCache');
            expect(status).toHaveProperty('lastFetch');
            expect(status).toHaveProperty('cacheAge');
            expect(status).toHaveProperty('isExpired');
        });
    });

    describe('healthCheck', () => {
        it('健康检查成功', async () => {
            mockedAxios.get.mockResolvedValue({ status: 200 });

            const health = await service.healthCheck();

            expect(health.status).toBe('healthy');
            expect(health).toHaveProperty('timestamp');
        });

        it('健康检查失败', async () => {
            mockedAxios.get.mockRejectedValue(new Error('Connection failed'));

            const health = await service.healthCheck();

            expect(health.status).toBe('unhealthy');
            expect(health).toHaveProperty('error');
        });
    });
});