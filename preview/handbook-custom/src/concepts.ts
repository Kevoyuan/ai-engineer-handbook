export type ConceptSource = {
  labelZh: string;
  labelEn: string;
  href: string;
};

export type Concept = {
  slug: string;
  name: string;
  zh: string;
  group: "MODEL" | "RETRIEVAL" | "AGENT" | "PRODUCTION";
  summaryZh: string;
  summaryEn: string;
  primaryHref: string;
  sources: ConceptSource[];
  related: string[];
};

export const concepts: Concept[] = [
  {
    slug: "context-window",
    name: "Context Window",
    zh: "上下文窗口",
    group: "MODEL",
    summaryZh:
      "Context Window 是共享 Token 预算：指令、工具定义、历史、记忆、RAG 证据与输出空间都在竞争同一容量。",
    summaryEn:
      "The context window is a shared token budget: instructions, tool schemas, history, memory, RAG evidence, and output reserve all compete for the same capacity.",
    primaryHref: "#read/01-model-api-context-foundations/token-context",
    sources: [
      {
        labelZh: "01 · Token 与 Context",
        labelEn: "01 · Tokens and Context",
        href: "#read/01-model-api-context-foundations/token-context",
      },
      {
        labelZh: "01 · Canonical Rules",
        labelEn: "01 · Canonical Rules",
        href: "#read/01-model-api-context-foundations/canonical-rules",
      },
      {
        labelZh: "08 · 五项核心能力",
        labelEn: "08 · Five core skills",
        href: "#read/08-agent-orchestration/section-7",
      },
    ],
    related: ["memory", "kv-cache"],
  },
  {
    slug: "structured-output",
    name: "Structured Output",
    zh: "结构化输出",
    group: "MODEL",
    summaryZh:
      "Structured Output 约束输出形状，但结构合法不等于任务语义正确；生产系统仍需要验证门与失败恢复。",
    summaryEn:
      "Structured Output constrains shape, but valid structure does not guarantee correct task semantics; production systems still need validation gates and failure recovery.",
    primaryHref: "#read/01-model-api-context-foundations/structured-output",
    sources: [
      {
        labelZh: "01 · Structured Output",
        labelEn: "01 · Structured Output",
        href: "#read/01-model-api-context-foundations/structured-output",
      },
      {
        labelZh: "09 · 结构化输出、验证门与失败恢复",
        labelEn: "09 · Structured Outputs, Validation Gates, and Failure Recovery",
        href: "#read/09-reliability-evaluation-observability/section-2",
      },
    ],
    related: ["evaluation"],
  },
  {
    slug: "bm25",
    name: "BM25",
    zh: "BM25",
    group: "RETRIEVAL",
    summaryZh:
      "BM25 是词法检索路径之一，适合利用精确词项与稀有词信号；它与 Exact、Dense、Graph 共同构成企业检索的能力边界。",
    summaryEn:
      "BM25 is a lexical retrieval path that uses exact terms and rare-token signals; together with Exact, Dense, and Graph retrieval it defines the enterprise retrieval capability boundary.",
    primaryHref: "#read/02-enterprise-retrieval/section-2",
    sources: [
      {
        labelZh: "02 · BM25",
        labelEn: "02 · BM25",
        href: "#read/02-enterprise-retrieval/section-2",
      },
      {
        labelZh: "02 · 能力对比",
        labelEn: "02 · Comparison",
        href: "#read/02-enterprise-retrieval/comparison",
      },
      {
        labelZh: "03 · 五步落地流程",
        labelEn: "03 · Five-step Implementation Flow",
        href: "#read/03-hybrid-retrieval-query-routing/section-1",
      },
    ],
    related: ["query-routing"],
  },
  {
    slug: "query-routing",
    name: "Query Routing",
    zh: "Query Routing",
    group: "RETRIEVAL",
    summaryZh:
      "Query Routing 的目标不是让所有检索路径都运行，而是根据 Query 类型、风险与成本，把请求送到最合适的检索路径，并设计失败恢复。",
    summaryEn:
      "Query Routing is not about running every retrieval path; it routes a query according to query type, risk, and cost, with explicit recovery when routing fails.",
    primaryHref: "#read/03-hybrid-retrieval-query-routing/section-2",
    sources: [
      {
        labelZh: "03 · Query Routing",
        labelEn: "03 · Query Routing",
        href: "#read/03-hybrid-retrieval-query-routing/section-2",
      },
      {
        labelZh: "03 · 路由失败与恢复",
        labelEn: "03 · Routing Failure and Recovery",
        href: "#read/03-hybrid-retrieval-query-routing/section-5",
      },
      {
        labelZh: "03 · 多轮 RAG",
        labelEn: "03 · Conversational RAG",
        href: "#read/03-hybrid-retrieval-query-routing/conversational-rag-title",
      },
    ],
    related: ["bm25", "evaluation"],
  },
  {
    slug: "mcp",
    name: "MCP",
    zh: "MCP",
    group: "AGENT",
    summaryZh:
      "MCP 在手册中被定位为协议层，而 Skill 属于能力层；两者需要在 Capability Architecture 中分层理解，而不是互相替代。",
    summaryEn:
      "The handbook places MCP at the protocol layer and Skills at the capability layer; they belong to different layers of the capability architecture rather than replacing one another.",
    primaryHref: "#read/06-skills-routing/section-3",
    sources: [
      {
        labelZh: "06 · Capability Architecture",
        labelEn: "06 · Capability Architecture",
        href: "#read/06-skills-routing/capability-architecture-title",
      },
      {
        labelZh: "06 · MCP 与 Skill",
        labelEn: "06 · MCP vs Skill",
        href: "#read/06-skills-routing/section-3",
      },
      {
        labelZh: "10 · Agent Runtime Control Plane",
        labelEn: "10 · Agent Runtime Control Plane",
        href: "#read/10-serving-deployment-ai-platform/agent-runtime-control-plane-title",
      },
    ],
    related: ["memory"],
  },
  {
    slug: "memory",
    name: "Memory",
    zh: "记忆",
    group: "AGENT",
    summaryZh:
      "Memory 不是把所有原始对话永久保存，而是把需要跨步骤或跨会话复用的状态以受治理的方式提升、持久化并受上下文预算约束。",
    summaryEn:
      "Memory is not permanent storage of every raw utterance; reusable state is promoted and persisted under governance while still competing for context budget.",
    primaryHref: "#read/07-memory-context-engineering/section-1",
    sources: [
      {
        labelZh: "07 · Short-term → Long-term Memory Promotion",
        labelEn: "07 · Short-term → Long-term Memory Promotion",
        href: "#read/07-memory-context-engineering/section-1",
      },
      {
        labelZh: "07 · Cross-session Memory",
        labelEn: "07 · Cross-session Memory",
        href: "#read/07-memory-context-engineering/cross-session-memory-title",
      },
      {
        labelZh: "01 · Token 与 Context",
        labelEn: "01 · Tokens and Context",
        href: "#read/01-model-api-context-foundations/token-context",
      },
    ],
    related: ["context-window", "mcp"],
  },
  {
    slug: "evaluation",
    name: "Evaluation",
    zh: "评估",
    group: "PRODUCTION",
    summaryZh:
      "Evaluation 在手册中跨越模型选择、检索路由、文档 RAG 与生产可靠性；重点是分层验证真实系统行为，而不是只看单一离线分数。",
    summaryEn:
      "Evaluation spans model selection, retrieval routing, document RAG, and production reliability; the emphasis is layered validation of real system behavior rather than a single offline score.",
    primaryHref: "#read/09-reliability-evaluation-observability/section-2",
    sources: [
      {
        labelZh: "01 · Model Selection 与 Migration Eval",
        labelEn: "01 · Model Selection and migration evaluation",
        href: "#read/01-model-api-context-foundations/model-selection-eval",
      },
      {
        labelZh: "05 · 分层评测闭环",
        labelEn: "05 · Layered Evaluation Loop",
        href: "#read/05-document-pdf-rag/section-6",
      },
      {
        labelZh: "09 · 结构化输出、验证门与失败恢复",
        labelEn: "09 · Structured Outputs, Validation Gates, and Failure Recovery",
        href: "#read/09-reliability-evaluation-observability/section-2",
      },
    ],
    related: ["structured-output", "query-routing"],
  },
  {
    slug: "kv-cache",
    name: "KV Cache",
    zh: "KV Cache",
    group: "PRODUCTION",
    summaryZh:
      "KV Cache 属于推理链路中的上下文状态复用问题；手册把 Prefill、Decode 与不同形式的 KV 复用分开分析，以避免把缓存收益混为一谈。",
    summaryEn:
      "KV Cache is a context-state reuse problem in the inference path; the handbook separates Prefill, Decode, and different forms of KV reuse so their performance effects are not conflated.",
    primaryHref: "#read/10-serving-deployment-ai-platform/section-1",
    sources: [
      {
        labelZh: "01 · Latency 与 Cache",
        labelEn: "01 · Latency and caching",
        href: "#read/01-model-api-context-foundations/latency-cache",
      },
      {
        labelZh: "10 · Prefill、Decode 与两种 KV 复用",
        labelEn: "10 · Prefill, Decode, and two kinds of KV reuse",
        href: "#read/10-serving-deployment-ai-platform/section-1",
      },
      {
        labelZh: "10 · 面试回答",
        labelEn: "10 · Interview answer",
        href: "#read/10-serving-deployment-ai-platform/section-8",
      },
    ],
    related: ["context-window"],
  },
];

export function conceptBySlug(slug: string) {
  return concepts.find((concept) => concept.slug === slug);
}
