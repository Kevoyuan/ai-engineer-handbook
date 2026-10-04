export type Copy = [string, string];
export type Frame = { node: number; title: Copy; text: Copy };
export type Example = { label: Copy; input: Copy; route: Copy; frames: Frame[] };
export type Lesson = {
  anchor: string;
  title: Copy;
  intro: Copy;
  nodes: Copy[];
  examples: Example[];
  takeaway: Copy;
};
const frame = (node: number, title: Copy, text: Copy): Frame => ({ node, title, text });

export const extraLessons: Record<string, Lesson> = {
  "06-skills-routing": {
    anchor: "capability-architecture-title",
    title: ["Skills 实验室：指令怎样按需加载？", "Skills lab: how instructions load on demand"],
    intro: ["选择任务，逐步查看技能匹配、权限检查和上下文加载。所有文件与操作均为教学模拟。", "Choose a task and inspect matching, authorization and context loading. Files and actions are illustrative simulations."],
    nodes: [["识别任务", "Identify task"], ["检查边界", "Check boundaries"], ["加载指令", "Load instructions"], ["执行或退出", "Act or exit"]],
    examples: [
      {
        label: ["读取 PDF", "Read a PDF"],
        input: ["从已授权的 report.pdf 提取文字，并保留页码。", "Extract text from the authorized report.pdf and keep page numbers."],
        route: ["按需加载 → 授权工具调用", "Load on demand → authorized tool call"],
        frames: [
          frame(0, ["先查看能力摘要", "Start with capability summaries"], ["候选目录描述技能适用范围。此时还没有把全部技能正文和参考资料放进上下文。", "The catalog describes skill boundaries. Full instructions and references are not loaded yet."]),
          frame(1, ["匹配不等于授权", "Matching is not authorization"], ["pdf-extract 匹配任务；可信授权系统确认文件可读，输入也完整。技能文本本身不能授予权限。", "pdf-extract matches the task. A trusted authorization system confirms read access and complete inputs. Skill text cannot grant permission."]),
          frame(2, ["读取 SKILL.md", "Read SKILL.md"], ["加载提取步骤、页码保留要求和质量检查。Skill 提供方法；实际操作仍由 Tool 执行。", "Load extraction steps, page-number requirements and quality checks. The skill supplies the method; a tool performs the action."]),
          frame(3, ["需要时再加载参考资料", "Load references when needed"], ["读取 PDF 解析参考，再调用授权的提取工具。工具返回结果后验证页码与文本；教学示例不会读取真实文件。", "Read the PDF parsing reference, then call an authorized extraction tool. Validate returned text and page numbers. This example reads no real files."]),
        ],
      },
      {
        label: ["缺少输入", "Missing input"],
        input: ["请分析这份合同里的风险。", "Analyze the risks in this contract."],
        route: ["CLARIFY：补充合同与适用地区", "CLARIFY: request contract and jurisdiction"],
        frames: [
          frame(0, ["识别合同分析意图", "Identify contract-analysis intent"], ["候选技能为 analyze_contract_risk。这里只展示路由判断，不提供法律结论。", "The candidate is analyze_contract_risk. This demonstrates routing, not a legal conclusion."]),
          frame(1, ["输入不足", "Required inputs are missing"], ["没有合同内容或 ID，也没有适用地区。即使名称匹配，也不能凭空补出输入。", "Contract content or ID and jurisdiction are missing. A name match cannot supply them."]),
          frame(2, ["不加载无关细节", "Do not load unnecessary details"], ["本例的输入门已阻止执行。路由器保留候选摘要，等待澄清，不加载全文或调用分析工具。", "The input gate blocks execution in this example. Keep the candidate summary, request clarification and avoid loading the full skill or calling tools."]),
          frame(3, ["向用户询问", "Ask for clarification"], ["请提供合同内容或文档 ID，以及适用地区。输入齐全后重新检查权限、风险与审批要求。", "Request contract content or document ID and jurisdiction. Recheck access, risk and approval requirements once inputs are complete."]),
        ],
      },
      {
        label: ["权限不足", "Access denied"],
        input: ["导出另一个租户的客户名单。", "Export the customer list of another tenant."],
        route: ["REJECT：越权请求不执行", "REJECT: do not execute an unauthorized request"],
        frames: [
          frame(0, ["识别导出意图", "Identify export intent"], ["export_customers 在业务能力上可能匹配，但匹配结果还不是执行决定。", "export_customers may match the intent, but a match is not an execution decision."]),
          frame(1, ["授权边界不通过", "Authorization fails"], ["当前身份无权读取目标租户数据。不得用相似技能或其他工具绕过隔离边界。", "The current identity cannot read the target tenant. Another skill or tool cannot bypass tenant isolation."]),
          frame(2, ["停止加载与执行", "Stop loading and execution"], ["本例不加载导出指令或客户数据，不发起工具调用。技能中写着“允许”也不能改变授权结果。", "Do not load export instructions or customer data, and do not call a tool. A skill saying “allowed” cannot change authorization."]),
          frame(3, ["说明拒绝原因", "Explain the refusal"], ["无法导出其他租户的数据。可以改为处理当前身份已获授权的数据范围。", "The other tenant's data cannot be exported. Limit the request to data authorized for the current identity."]),
        ],
      },
    ],
    takeaway: ["Skill 组织方法，Tool 执行操作，MCP 连接服务；匹配结果始终受权限、输入与风险边界约束。", "A skill organizes the method, a tool performs actions and MCP connects services. Access, inputs and risk still constrain a match."],
  },
  "07-memory-context-engineering": {
    anchor: "cross-session-memory-title",
    title: ["记忆实验室：记住了，就能直接用吗？", "Memory lab: can a stored memory be used directly?"],
    intro: ["比较偏好、过期知识与权限记忆，查看哪些内容能进入当前上下文。场景为教学示例。", "Compare a preference, expired knowledge and a permission memory. See what enters current context. Scenarios are illustrative."],
    nodes: [["识别记忆", "Identify memory"], ["核对范围", "Check scope"], ["检查有效性", "Check validity"], ["构造上下文", "Build context"]],
    examples: [
      {
        label: ["稳定偏好", "Stable preference"],
        input: ["用户已明确保存偏好：报告使用中文。", "The user explicitly saved a preference: reports in Chinese."],
        route: ["注入相关偏好", "Include the relevant preference"],
        frames: [
          frame(0, ["这是结构化偏好", "This is a structured preference"], ["报告语言属于 Profile，而不是整段聊天记录。保留来源和维护方式。", "Report language belongs in the profile, not a full chat transcript. Keep its source and maintenance policy."]),
          frame(1, ["限定到当前用户", "Scope to the current user"], ["读取当前身份可见的偏好，不把其他用户或租户的偏好混入。", "Read preferences visible to the current identity. Do not mix in another user's or tenant's profile."]),
          frame(2, ["检查更新与冲突", "Check updates and conflicts"], ["偏好仍有效，且当前请求没有指定其他语言。若本次要求英文，应遵循本次明确要求。", "The preference is current and the request specifies no other language. An explicit request for English would take precedence."]),
          frame(3, ["只注入任务所需内容", "Include only what the task needs"], ["当前上下文加入“报告语言：中文”。不需要搬入全部历史消息。", "Include “report language: Chinese” in current context. The entire message history is unnecessary."]),
        ],
      },
      {
        label: ["过期知识", "Expired knowledge"],
        input: ["缓存的项目规则已被新版本替代。", "A cached project rule has been superseded."],
        route: ["排除旧版本 → 检索有效来源", "Exclude stale version → retrieve a current source"],
        frames: [
          frame(0, ["找到相关候选", "Find a relevant candidate"], ["语义相似度很高，只能说明它相关，不能证明内容仍然有效。", "High semantic similarity indicates relevance, not continued validity."]),
          frame(1, ["核对项目与权限", "Check project and access"], ["候选属于当前项目且可读，但这只是进入有效性检查的前提。", "The candidate belongs to this project and is readable. That only permits the validity check."]),
          frame(2, ["版本检查不通过", "Version check fails"], ["来源已标记被替代。不能把“曾经正确”当成“现在正确”。", "The source is marked superseded. Previously correct does not mean currently correct."]),
          frame(3, ["重新检索有效来源", "Retrieve a valid source"], ["排除旧规则，检索当前有效版本。若没有可靠的新来源，应说明知识缺口。", "Exclude the old rule and retrieve the current version. If no reliable source is available, explain the knowledge gap."]),
        ],
      },
      {
        label: ["权限记忆", "Permission memory"],
        input: ["历史记录写着“用户可以删除项目”。", "A historical record says “the user can delete the project”."],
        route: ["重新授权，记忆不授予权限", "Reauthorize; memory grants no permission"],
        frames: [
          frame(0, ["识别敏感状态", "Identify sensitive state"], ["这条记录涉及权限，不能当作普通偏好使用。历史记录可能已经失效。", "This record concerns authorization, not a preference. Historical state may be stale."]),
          frame(1, ["查看可信授权来源", "Consult trusted authorization"], ["向可信权限系统核对当前身份、项目和允许操作，不能从模型写入的记忆推导权限。", "Check the current identity, project and permitted action with a trusted authorization system, not model-written memory."]),
          frame(2, ["本例未获得当前授权", "No current authorization in this example"], ["记忆只说明过去记录过什么；没有当前授权就不能执行删除。", "Memory records the past. Without current authorization, deletion cannot proceed."]),
          frame(3, ["保留边界并退出", "Respect the boundary and exit"], ["不调用删除工具。可说明需要当前有效授权，或改为只读操作。", "Do not call the deletion tool. Explain the need for current authorization or offer a read-only action."]),
        ],
      },
    ],
    takeaway: ["记忆先过权限、来源、有效性与版本检查，再按任务预算进入上下文。记忆不能成为授权来源。", "Check access, source, validity and version before adding memory within the task budget. Memory is not an authorization source."],
  },
};
