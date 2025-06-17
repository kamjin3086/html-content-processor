
# HTML 内容处理器

<p align="left">
<a href="README.md">English</a> | 简体中文
</p>

一个现代的 TypeScript 库，用于清理、过滤并将 HTML 内容转换为 Markdown，并具备智能内容提取功能。支持浏览器和 Node.js 跨环境执行，并自动检测页面类型。

## 特性

- 🚀 **现代化 API 设计** - 提供函数式与类式两种干净的 API
- 🧠 **智能过滤** - 自动检测页面类型并应用最优过滤策略
- 📝 **高质量 Markdown 转换** - 高级 HTML → Markdown 转换
- 🌐 **跨环境支持** - 兼容浏览器与 Node.js
- 🎯 **智能预设** - 针对不同内容类型的预设配置
- 🔌 **插件系统** - 可扩展的插件架构
- 📊 **自动检测** - 智能识别搜索引擎、博客、新闻、文档等页面

## 安装

```bash
npm install html-content-processor
```

## 快速开始

### 基础用法

```typescript
import { htmlToMarkdown, htmlToText, cleanHtml } from 'html-content-processor';

// 将 HTML 转为 Markdown
const markdown = await htmlToMarkdown('<h1>Hello</h1><p>World</p>');

// 将 HTML 转为纯文本
const text = await htmlToText('<h1>Hello</h1><p>World</p>');

// 清理 HTML 内容
const clean = await cleanHtml('<div>Content</div><script>ads</script>');
```

### 自动页面类型检测（推荐）

该库可自动检测页面类型并应用最优过滤策略：

```typescript
import { htmlToMarkdownAuto, cleanHtmlAuto, extractContentAuto } from 'html-content-processor';

// 结合 URL 上下文进行自动检测
const markdown = await htmlToMarkdownAuto(html, 'https://example.com/blog-post');

// 自动检测并清理 HTML
const cleanHtml = await cleanHtmlAuto(html, 'https://news.example.com/article');

// 提取内容并返回详细的页面类型信息
const result = await extractContentAuto(html, 'https://docs.example.com/guide');
console.log('检测到的页面类型:', result.pageType.type);
console.log('置信度:', result.pageType.confidence);
console.log('Markdown:', result.markdown.content);
```

### HtmlProcessor 类（高级用法）

```typescript
import { HtmlProcessor } from 'html-content-processor';

// 链式调用
const result = await HtmlProcessor
  .from(html)
  .withBaseUrl('https://example.com')
  .withAutoDetection() // 启用自动页面类型检测
  .filter()
  .toMarkdown();

// 手动设置页面类型
const processor = await HtmlProcessor
  .from(html)
  .withPageType('blog') // 手动设置页面类型
  .filter();

const markdown = await processor.toMarkdown();
```

### 针对内容类型的预设

```typescript
import { 
  htmlToArticleMarkdown, 
  htmlToBlogMarkdown, 
  htmlToNewsMarkdown 
} from 'html-content-processor';

// 针对不同内容类型的优化
const articleMd = await htmlToArticleMarkdown(html, baseUrl);
const blogMd = await htmlToBlogMarkdown(html, baseUrl);
const newsMd = await htmlToNewsMarkdown(html, baseUrl);
```

## API 参考

### 核心函数

| 函数 | 描述 | 返回类型 |
|------|------|---------|
| `htmlToMarkdown(html, options?)` | 将 HTML 转换为 Markdown | `Promise<string>` |
| `htmlToMarkdownWithCitations(html, baseUrl?, options?)` | 转换为 Markdown 并生成引用 | `Promise<string>` |
| `htmlToText(html, options?)` | 将 HTML 转换为纯文本 | `Promise<string>` |
| `cleanHtml(html, options?)` | 清理 HTML 内容 | `Promise<string>` |
| `extractContent(html, options?)` | 提取内容片段 | `Promise<string[]>` |

### 自动检测函数

| 函数 | 描述 | 优势 |
|------|------|------|
| `htmlToMarkdownAuto(html, url?, options?)` | 自动检测页面类型并转换为 Markdown | 针对每种页面类型的最优过滤 |
| `cleanHtmlAuto(html, url?, options?)` | 自动检测页面类型并清理 HTML | 智能去噪 |
| `extractContentAuto(html, url?, options?)` | 自动检测并提取内容，返回详细结果 | 全面的页面分析 |

#### 示例：使用自动检测

```typescript
// 博客文章检测
const blogResult = await htmlToMarkdownAuto(html, 'https://medium.com/@user/post');
// 会自动应用博客优化过滤

// 新闻文章检测
const newsResult = await htmlToMarkdownAuto(html, 'https://cnn.com/article');
// 会自动应用新闻优化过滤

// 文档检测
const docsResult = await htmlToMarkdownAuto(html, 'https://docs.react.dev/guide');
// 会自动保留代码块、标题等技术文档结构

// 搜索结果页面检测
const searchResult = await htmlToMarkdownAuto(html, 'https://google.com/search?q=query');
// 会自动应用搜索结果优化过滤
```

### 针对内容类型的预设

| 函数 | 最佳应用场景 |
|------|--------------|
| `htmlToArticleMarkdown()` | 长篇文章 |
| `htmlToBlogMarkdown()` | 博客帖子 |
| `htmlToNewsMarkdown()` | 新闻文章 |
| `strictCleanHtml()` | 强力清理 |
| `gentleCleanHtml()` | 温和清理 |

### HtmlProcessor 类

```typescript
// 创建处理器
const processor = HtmlProcessor.from(html, options);

// 配置方法
processor.withBaseUrl(url)           // 设置基础 URL
processor.withOptions(options)       // 更新配置
processor.withAutoDetection(url?)    // 启用自动检测
processor.withPageType(type)         // 手动设置页面类型

// 处理方法
await processor.filter(options?)     // 应用过滤
await processor.toMarkdown(options?) // 转换为 Markdown
await processor.toText()             // 转换为纯文本
await processor.toArray()            // 转换为片段数组
processor.toString()                 // 获取清理后的 HTML

// 信息方法
processor.getOptions()               // 获取当前配置
processor.isProcessed()              // 判断是否已处理
processor.getPageTypeResult()        // 获取页面类型检测结果
```

## 配置选项

### 过滤选项（FilterOptions）

```typescript
{
  threshold?: number;           // 过滤阈值（默认: 2）
  strategy?: 'fixed' | 'dynamic'; // 过滤策略（默认: 'dynamic'）
  ratio?: number;              // 文本密度比（默认: 0.48）
  minWords?: number;           // 最小词数（默认: 0）
  preserveStructure?: boolean; // 是否保留结构（默认: false）
  keepElements?: string[];     // 需要保留的元素
  removeElements?: string[];   // 需要移除的元素
}
```

### 转换选项（ConvertOptions）

```typescript
{
  citations?: boolean;         // 是否生成引用（默认: true）
  ignoreLinks?: boolean;       // 是否忽略链接（默认: false）
  ignoreImages?: boolean;      // 是否忽略图片（默认: false）
  baseUrl?: string;            // 基础 URL
  threshold?: number;          // 过滤阈值
  strategy?: 'fixed' | 'dynamic'; // 过滤策略
  ratio?: number;              // 文本密度比
}
```

## 自动页面类型检测

该库会自动检测并针对以下页面类型进行优化：

- `search-engine` - 搜索引擎结果页
- `blog` - 博客文章与个人帖子
- `news` - 新闻文章与新闻报道
- `documentation` - 技术文档
- `e-commerce` - 电商及产品页面
- `social-media` - 社交媒体内容
- `forum` - 论坛讨论与问答
- `article` - 通用文章
- `landing-page` - 营销落地页

### 自动检测工作原理

```typescript
import { extractContentAuto } from 'html-content-processor';

const result = await extractContentAuto(html, url);

console.log('页面类型:', result.pageType.type);
console.log('置信度:', (result.pageType.confidence * 100).toFixed(1) + '%');
console.log('检测原因:', result.pageType.reasons);
console.log('应用的过滤选项:', result.pageType.filterOptions);
```

## 环境支持

### Node.js
```bash
npm install jsdom  # 建议安装以获得最佳性能
```

### 浏览器
直接支持，无需额外依赖。

### CDN
```html
<script src="https://unpkg.com/html-content-processor"></script>
<script>
  // 全局变量: window.htmlFilter
  htmlFilter.htmlToMarkdown(html).then(console.log);
  
  // 自动检测示例
  htmlFilter.htmlToMarkdownAuto(html, window.location.href).then(result => {
    console.log('自动检测内容:', result);
  });
</script>
```

## 真实场景示例

### 使用自动检测进行网页抓取

```typescript
import { htmlToMarkdownAuto } from 'html-content-processor';

// 抓取并转换博客文章
const response = await fetch('https://blog.example.com/post-123');
const html = await response.text();
const markdown = await htmlToMarkdownAuto(html, response.url);
// 会自动检测为博客并应用博客特定过滤
```

### 新闻文章处理

```typescript
import { extractContentAuto } from 'html-content-processor';

const result = await extractContentAuto(newsHtml, 'https://news.site.com/article');
if (result.pageType.type === 'news') {
  console.log('已提取高质量新闻内容');
  console.log('置信度:', result.pageType.confidence);
}
```

### 文档转换

```typescript
import { htmlToMarkdownAuto } from 'html-content-processor';

// 转换技术文档
const docMarkdown = await htmlToMarkdownAuto(docsHtml, 'https://docs.example.com/api');
// 会自动保留代码块、标题以及技术内容结构
```

## 性能

- ⚡ **快速处理**：优化算法带来极速内容提取
- 💾 **内存高效**：占用内存极小
- 🔄 **批量处理**：高效处理多文档
- 📊 **智能缓存**：自动缓存页面类型检测结果

## 许可协议

MIT License 
