const axios = require('axios');
const cheerio = require('cheerio');

class GitHubService {
    constructor() {
        this.baseUrl = 'https://github.com/trending';
        this.cache = null;
        this.lastFetch = null;
        this.cacheTimeout = 60 * 60 * 1000; // 1小时缓存
    }

    // 获取趋势项目
    async getTrendingProjects() {
        // 检查缓存
        if (this.cache && this.lastFetch && (Date.now() - this.lastFetch) < this.cacheTimeout) {
            console.log('使用缓存数据');
            return this.cache;
        }

        try {
            console.log('正在获取GitHub趋势项目...');
            
            // 使用更完整的请求配置
            const response = await axios.get(this.baseUrl, {
                timeout: 30000, // 30秒超时
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                },
                // 添加代理和重试配置
                maxRedirects: 5,
                validateStatus: function (status) {
                    return status >= 200 && status < 300;
                }
            });

            const projects = this.parseTrendingProjects(response.data);
            
            // 更新缓存
            this.cache = projects;
            this.lastFetch = Date.now();
            
            console.log(`成功获取 ${projects.length} 个趋势项目`);
            return projects;
        } catch (error) {
            console.error('获取GitHub趋势项目失败:', error.message);
            
            // 详细的错误处理
            if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                console.error('网络连接问题，请检查网络连接');
            } else if (error.response) {
                console.error('HTTP错误状态码:', error.response.status);
                console.error('响应头:', error.response.headers);
            }
            
            // 如果有缓存数据，返回缓存
            if (this.cache) {
                console.log('使用过期缓存数据');
                return this.cache;
            }
            
            // 返回模拟数据作为后备
            console.log('返回模拟数据作为后备');
            return this.getMockData();
        }
    }

    // 解析HTML获取项目信息
    parseTrendingProjects(html) {
        const $ = cheerio.load(html);
        const projects = [];

        $('.Box-row').each((index, element) => {
            const $article = $(element);
            const $title = $article.find('h2 a');
            const $description = $article.find('p');
            const $stars = $article.find('a[href*="/stargazers"]');
            const $forks = $article.find('a[href*="/forks"]');
            const $language = $article.find('[itemprop="programmingLanguage"]');

            if ($title.length > 0) {
                const project = {
                    name: $title.text().trim(),
                    url: 'https://github.com' + $title.attr('href'),
                    description: $description.length > 0 ? $description.text().trim() : '',
                    stars: this.parseNumber($stars.text()),
                    forks: this.parseNumber($forks.text()),
                    language: $language.length > 0 ? $language.text().trim() : '',
                    updatedAt: this.getRelativeTime($article.find('relative-time')),
                    rank: index + 1
                };

                projects.push(project);
            }
        });

        return projects;
    }

    // 解析数字（如 "1.2k" -> 1200）
    parseNumber(text) {
        if (!text) return 0;
        const num = text.replace(/[^\d.k]/g, '');
        if (num.includes('k')) {
            return parseInt(parseFloat(num.replace('k', '')) * 1000);
        }
        return parseInt(num) || 0;
    }

    // 获取相对时间
    getRelativeTime(element) {
        if (element.length > 0) {
            return element.attr('datetime') || element.text().trim();
        }
        return '今天';
    }

    // 清除缓存
    clearCache() {
        this.cache = null;
        this.lastFetch = null;
    }

    // 获取缓存状态
    getCacheStatus() {
        return {
            hasCache: !!this.cache,
            lastFetch: this.lastFetch,
            cacheAge: this.lastFetch ? Date.now() - this.lastFetch : 0,
            isExpired: this.lastFetch ? (Date.now() - this.lastFetch) > this.cacheTimeout : true
        };
    }

    // 获取模拟数据（后备方案）
    getMockData() {
        return [
            {
                name: 'microsoft/vscode',
                url: 'https://github.com/microsoft/vscode',
                description: 'Visual Studio Code - 开源代码编辑器',
                stars: 150000,
                forks: 25000,
                language: 'TypeScript',
                updatedAt: '今天',
                rank: 1
            },
            {
                name: 'facebook/react',
                url: 'https://github.com/facebook/react',
                description: '用于构建用户界面的JavaScript库',
                stars: 200000,
                forks: 42000,
                language: 'JavaScript',
                updatedAt: '今天',
                rank: 2
            },
            {
                name: 'tensorflow/tensorflow',
                url: 'https://github.com/tensorflow/tensorflow',
                description: '开源机器学习框架',
                stars: 180000,
                forks: 70000,
                language: 'C++',
                updatedAt: '今天',
                rank: 3
            },
            {
                name: 'torvalds/linux',
                url: 'https://github.com/torvalds/linux',
                description: 'Linux内核源代码',
                stars: 160000,
                forks: 50000,
                language: 'C',
                updatedAt: '今天',
                rank: 4
            },
            {
                name: 'apple/swift',
                url: 'https://github.com/apple/swift',
                description: 'Swift编程语言',
                stars: 65000,
                forks: 10000,
                language: 'C++',
                updatedAt: '今天',
                rank: 5
            }
        ];
    }

    // 健康检查方法
    async healthCheck() {
        try {
            const response = await axios.get('https://github.com', {
                timeout: 5000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            return { status: 'healthy', timestamp: Date.now() };
        } catch (error) {
            return { 
                status: 'unhealthy', 
                error: error.message,
                timestamp: Date.now() 
            };
        }
    }
}

module.exports = new GitHubService();