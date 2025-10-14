const MarkdownGenerator = require('../services/markdownGenerator');
const fs = require('fs');
const path = require('path');

// Mock fs
jest.mock('fs');
const mockedFs = fs;

describe('MarkdownGenerator', () => {
    let generator;
    const testReportsDir = path.join(__dirname, '..', 'reports');

    beforeEach(() => {
        generator = MarkdownGenerator;
        jest.clearAllMocks();
        
        // Mock fs.existsSync to return true for reports directory
        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.mkdirSync.mockImplementation(() => {});
        mockedFs.writeFileSync.mockImplementation(() => {});
        mockedFs.readFileSync.mockReturnValue('mock content');
        mockedFs.readdirSync.mockReturnValue([]);
        mockedFs.statSync.mockReturnValue({
            birthtime: new Date(),
            mtime: new Date(),
            size: 1024
        });
        mockedFs.unlinkSync.mockImplementation(() => {});
    });

    describe('generateTrendingReport', () => {
        const mockProjects = [
            {
                name: 'test/repo1',
                url: 'https://github.com/test/repo1',
                description: 'Test project 1',
                stars: 1000,
                forks: 100,
                language: 'JavaScript',
                updatedAt: 'today',
                rank: 1
            },
            {
                name: 'test/repo2',
                url: 'https://github.com/test/repo2',
                description: 'Test project 2',
                stars: 2000,
                forks: 200,
                language: 'TypeScript',
                updatedAt: 'yesterday',
                rank: 2
            }
        ];

        it('应该生成趋势项目报告', () => {
            const testDate = new Date('2024-01-15');
            const fileName = `trending-2024-01-15.md`;
            
            const result = generator.generateTrendingReport(mockProjects, testDate);

            expect(mockedFs.writeFileSync).toHaveBeenCalledWith(
                path.join(testReportsDir, fileName),
                expect.any(String),
                'utf8'
            );
            expect(result).toBe(path.join(testReportsDir, fileName));
        });

        it('应该包含正确的Markdown格式', () => {
            const testDate = new Date('2024-01-15');
            
            generator.generateTrendingReport(mockProjects, testDate);

            const writeCall = mockedFs.writeFileSync.mock.calls[0];
            const content = writeCall[1];

            expect(content).toContain('# GitHub 趋势项目报告 - 2024年1月15日星期一');
            expect(content).toContain('## 📊 摘要');
            expect(content).toContain('项目总数: 2');
            expect(content).toContain('总星数: 3.0K');
            expect(content).toContain('总Fork数: 300');
            expect(content).toContain('主要语言: JavaScript(1), TypeScript(1)');
            expect(content).toContain('## 🚀 趋势项目列表');
            expect(content).toContain('### 1. test/repo1');
            expect(content).toContain('### 2. test/repo2');
        });

        it('写入文件失败时应该抛出错误', () => {
            mockedFs.writeFileSync.mockImplementation(() => {
                throw new Error('Write failed');
            });

            expect(() => {
                generator.generateTrendingReport(mockProjects);
            }).toThrow('生成Markdown报告失败');
        });
    });

    describe('buildMarkdownContent', () => {
        const mockProjects = [
            {
                name: 'test/repo',
                url: 'https://github.com/test/repo',
                description: 'Test description',
                stars: 1500,
                forks: 150,
                language: 'Python',
                updatedAt: 'today',
                rank: 1
            }
        ];

        it('应该构建完整的Markdown内容', () => {
            const testDate = new Date('2024-01-15');
            const content = generator.buildMarkdownContent(mockProjects, testDate);

            expect(content).toContain('# GitHub 趋势项目报告 - 2024年1月15日星期一');
            expect(content).toContain('## 📊 摘要');
            expect(content).toContain('## 🚀 趋势项目列表');
            expect(content).toContain('## 📝 说明');
        });
    });

    describe('generateSummary', () => {
        it('应该生成正确的摘要统计', () => {
            const projects = [
                { stars: 1000, forks: 100, language: 'JavaScript' },
                { stars: 2000, forks: 200, language: 'JavaScript' },
                { stars: 1500, forks: 150, language: 'TypeScript' }
            ];

            const summary = generator.generateSummary(projects);

            expect(summary).toContain('项目总数: 3');
            expect(summary).toContain('总星数: 4.5K');
            expect(summary).toContain('总Fork数: 450');
            expect(summary).toContain('主要语言: JavaScript(2), TypeScript(1)');
        });

        it('没有语言信息时应该显示无', () => {
            const projects = [
                { stars: 1000, forks: 100, language: '' },
                { stars: 2000, forks: 200, language: null }
            ];

            const summary = generator.generateSummary(projects);

            expect(summary).toContain('主要语言: 无');
        });
    });

    describe('generateProjectList', () => {
        it('应该生成项目列表', () => {
            const projects = [
                {
                    name: 'test/repo',
                    url: 'https://github.com/test/repo',
                    description: 'Test description',
                    stars: 1000,
                    forks: 100,
                    language: 'JavaScript',
                    updatedAt: 'today',
                    rank: 1
                }
            ];

            const projectList = generator.generateProjectList(projects);

            expect(projectList).toContain('### 1. test/repo');
            expect(projectList).toContain('**描述**: Test description');
            expect(projectList).toContain('**链接**: [test/repo](https://github.com/test/repo)');
            expect(projectList).toContain('⭐ 星数: 1.0K');
            expect(projectList).toContain('🍴 Fork数: 100');
            expect(projectList).toContain('💻 语言: JavaScript');
            expect(projectList).toContain('🕐 更新时间: today');
        });

        it('应该处理缺少描述的项目', () => {
            const projects = [
                {
                    name: 'test/repo',
                    url: 'https://github.com/test/repo',
                    description: '',
                    stars: 1000,
                    forks: 100,
                    language: '',
                    updatedAt: '',
                    rank: 1
                }
            ];

            const projectList = generator.generateProjectList(projects);

            expect(projectList).toContain('### 1. test/repo');
            expect(projectList).toContain('**链接**: [test/repo](https://github.com/test/repo)');
            expect(projectList).toContain('⭐ 星数: 1.0K');
            expect(projectList).toContain('🍴 Fork数: 100');
            // 不应该包含语言和更新时间
            expect(projectList).not.toContain('💻 语言:');
            expect(projectList).not.toContain('🕐 更新时间:');
        });
    });

    describe('getLanguageStats', () => {
        it('应该统计语言分布', () => {
            const projects = [
                { language: 'JavaScript' },
                { language: 'JavaScript' },
                { language: 'TypeScript' },
                { language: 'Python' },
                { language: 'JavaScript' }
            ];

            const stats = generator.getLanguageStats(projects);

            expect(stats).toEqual([
                ['JavaScript', 3],
                ['TypeScript', 1],
                ['Python', 1]
            ]);
        });

        it('应该处理空的语言数组', () => {
            const projects = [
                { language: '' },
                { language: null },
                { language: undefined }
            ];

            const stats = generator.getLanguageStats(projects);

            expect(stats).toEqual([]);
        });
    });

    describe('formatNumber', () => {
        it('应该正确格式化数字', () => {
            expect(generator.formatNumber(1500000)).toBe('1.5M');
            expect(generator.formatNumber(2500000)).toBe('2.5M');
            expect(generator.formatNumber(1500)).toBe('1.5K');
            expect(generator.formatNumber(2500)).toBe('2.5K');
            expect(generator.formatNumber(999)).toBe('999');
            expect(generator.formatNumber(0)).toBe('0');
        });
    });

    describe('formatDate', () => {
        it('应该正确格式化日期', () => {
            const date = new Date('2024-01-15');
            expect(generator.formatDate(date)).toBe('2024-01-15');
            
            const date2 = new Date('2024-12-31');
            expect(generator.formatDate(date2)).toBe('2024-12-31');
        });
    });

    describe('getReportList', () => {
        it('应该返回报告列表', () => {
            const mockFiles = ['report1.md', 'report2.md', 'other.txt'];
            const mockStats = {
                birthtime: new Date('2024-01-15'),
                mtime: new Date('2024-01-16'),
                size: 1024
            };

            mockedFs.readdirSync.mockReturnValue(mockFiles);
            mockedFs.statSync.mockReturnValue(mockStats);

            const reports = generator.getReportList();

            expect(reports).toHaveLength(2);
            expect(reports[0]).toMatchObject({
                fileName: 'report2.md',
                size: 1024
            });
            expect(reports[1]).toMatchObject({
                fileName: 'report1.md',
                size: 1024
            });
        });

        it('读取失败时应该返回空数组', () => {
            mockedFs.readdirSync.mockImplementation(() => {
                throw new Error('Read failed');
            });

            const reports = generator.getReportList();

            expect(reports).toEqual([]);
        });
    });

    describe('readReport', () => {
        it('应该读取报告内容', () => {
            mockedFs.existsSync.mockReturnValue(true);
            mockedFs.readFileSync.mockReturnValue('Test report content');

            const content = generator.readReport('test.md');

            expect(content).toBe('Test report content');
            expect(mockedFs.readFileSync).toHaveBeenCalledWith(
                path.join(testReportsDir, 'test.md'),
                'utf8'
            );
        });

        it('文件不存在时应该抛出错误', () => {
            mockedFs.existsSync.mockReturnValue(false);

            expect(() => {
                generator.readReport('nonexistent.md');
            }).toThrow('报告文件不存在');
        });

        it('读取失败时应该抛出错误', () => {
            mockedFs.existsSync.mockReturnValue(true);
            mockedFs.readFileSync.mockImplementation(() => {
                throw new Error('Read failed');
            });

            expect(() => {
                generator.readReport('test.md');
            }).toThrow();
        });
    });

    describe('cleanupOldReports', () => {
        it('应该清理旧报告', () => {
            const mockReports = [
                { fileName: 'report1.md', filePath: 'path1' },
                { fileName: 'report2.md', filePath: 'path2' },
                { fileName: 'report3.md', filePath: 'path3' }
            ];

            jest.spyOn(generator, 'getReportList').mockReturnValue(mockReports);

            generator.cleanupOldReports(2);

            expect(mockedFs.unlinkSync).toHaveBeenCalledWith('path3');
            expect(mockedFs.unlinkSync).toHaveBeenCalledTimes(1);
        });

        it('报告数量少于保留数量时不应该删除', () => {
            const mockReports = [
                { fileName: 'report1.md', filePath: 'path1' },
                { fileName: 'report2.md', filePath: 'path2' }
            ];

            jest.spyOn(generator, 'getReportList').mockReturnValue(mockReports);

            generator.cleanupOldReports(3);

            expect(mockedFs.unlinkSync).not.toHaveBeenCalled();
        });
    });
});