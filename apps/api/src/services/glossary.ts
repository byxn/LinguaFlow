const TECHNICAL_TERMS: Record<string, string> = {
  hydration: "服务端渲染页面在客户端恢复交互能力的过程",
  reconciliation: "React 协调过程，用于比较虚拟 DOM 差异",
  middleware: "中间件，在请求处理链中执行拦截和处理",
  component: "组件，React 中的 UI 构建块",
  props: "属性，从父组件传递给子组件的数据",
  state: "状态，组件内部的响应式数据",
  hook: "钩子，React 中的特殊函数，用于访问响应式特性",
  render: "渲染，将组件转换为可展示的 UI",
  dom: "文档对象模型，页面结构的树形表示",
  "virtual dom": "虚拟 DOM，React 维护的内存中页面表示",
  context: "上下文，跨组件层级传递数据的方式",
  reducer: " reducer，用于处理复杂状态逻辑的纯函数",
  selector: "选择器，从状态中提取特定数据的函数",
  bundle: "打包，将多个模块合并成单个文件的过程",
  transpile: "转译，将代码转换为另一种语法或格式",
  polyfill: "填充代码，为旧环境添加新 API 支持",
  polyfills: "填充代码，为旧环境添加新 API 支持",
  webpack: "打包工具，用于构建前端资源的构建工具",
  jest: "测试框架，Facebook 开发的 JavaScript 测试框架",
  eslint: "代码检查工具，用于检查代码规范和错误",
  typescript: "类型化 JavaScript，为 JS 添加类型系统",
  runtime: "运行时，程序执行时的环境和机制",
  compile: "编译，将源代码转换为目标代码的过程",
};

const CODE_PATTERNS = [
  /`[^`]+`/g,
  /\$\{[^}]+\}/g,
  /\b\w+\.\w+\([^)]\)/g,
  /\b[A-Z][a-zA-Z0-9]+\.[a-zA-Z_][a-zA-Z0-9_]*/g,
  /\b[a-z_][a-zA-Z0-9_]*\s*=\s*[^;]+;/g,
];

interface TermProtection {
  original: string;
  placeholder: string;
  explanation?: string;
}

export class GlossaryService {
  private customTerms: Map<string, string> = new Map();
  private protectedTerms: Map<string, TermProtection> = new Map();

  constructor() {
    for (const [term, explanation] of Object.entries(TECHNICAL_TERMS)) {
      this.protectedTerms.set(term.toLowerCase(), {
        original: term,
        placeholder: `__TERM_${term.toUpperCase()}__`,
        explanation,
      });
    }
  }

  addCustomTerm(term: string, translation: string): void {
    this.customTerms.set(term.toLowerCase(), translation);
  }

  protectTerms(text: string): {
    protectedText: string;
    terms: TermProtection[];
  } {
    const terms: TermProtection[] = [];
    let protectedText = text;

    for (const [key, termInfo] of this.protectedTerms) {
      const regex = new RegExp(`\\b${termInfo.original}\\b`, "gi");
      if (regex.test(protectedText)) {
        protectedText = protectedText.replace(regex, termInfo.placeholder);
        terms.push(termInfo);
      }
    }

    for (const [customTerm, translation] of this.customTerms) {
      const regex = new RegExp(`\\b${customTerm}\\b`, "gi");
      if (regex.test(protectedText)) {
        const placeholder = `__CUSTOM_${customTerm.toUpperCase()}__`;
        protectedText = protectedText.replace(regex, placeholder);
        terms.push({ original: customTerm, placeholder, explanation: translation });
      }
    }

    for (const pattern of CODE_PATTERNS) {
      protectedText = protectedText.replace(pattern, (match) => {
        const placeholder = `__CODE_${match.length}_${Buffer.from(match).toString("base64").slice(0, 8)}__`;
        terms.push({ original: match, placeholder });
        return placeholder;
      });
    }

    return { protectedText, terms };
  }

  restoreTerms(text: string, terms: TermProtection[]): string {
    let restored = text;

    for (const term of terms) {
      restored = restored.replace(term.placeholder, term.original);
    }

    return restored;
  }

  getExplanation(term: string): string | undefined {
    return (
      TECHNICAL_TERMS[term.toLowerCase()] ||
      this.customTerms.get(term.toLowerCase())
    );
  }
}

export const glossaryService = new GlossaryService();
