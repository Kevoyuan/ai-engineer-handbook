/** Node-edge architecture overlays for CH03 / 04 / 06 / 08 / 10.
 * Source: handbook/chapters/{03,04,06,08,10}-*.md.
 * These are local teaching projections, not executed routes or traces.
 */
import { GraphCanvas, type GraphLayout, type GraphNodeData, type GraphEdgeData, type GraphText, type GraphState } from "./graph-primitives";
type N={id:string;title:GraphText;detail:GraphText;kind?:GraphNodeData["kind"]};
const A:GraphState="active",I:GraphState="idle",B:GraphState="blocked",P:GraphState="pending";
const node=(v:N,x:number,y:number,width:number,height:number,state:GraphState=I):GraphNodeData=>({...v,x,y,width,height,state});
const edge=(id:string,from:string,to:string,state:GraphState=I,opts:Partial<GraphEdgeData>={}):GraphEdgeData=>({id,from,to,state,...opts});
const routeNames:readonly N[]=[
  {id:"exact",title:["Exact","Exact"],detail:["稳定 ID","Identifier"]},
  {id:"bm25",title:["BM25","BM25"],detail:["术语 / 关键词","Lexical terms"]},
  {id:"dense",title:["Dense","Dense"],detail:["语义改写","Paraphrase"]},
  {id:"graph",title:["Graph","Graph"],detail:["实体关系","Relationships"]},
  {id:"docs",title:["Source Docs","Source docs"],detail:["关系出处","Provenance"]},
];
const routeCore:readonly N[]=[
  {id:"query",title:["Query 分析","Query analysis"],detail:["ID / Intent / Entity","ID / intent / entity"],kind:"source"},
  {id:"acl",title:["授权 Gate","Authorization gate"],detail:["Tenant · ACL · Version","Tenant · ACL · version"],kind:"gate"},
  {id:"router",title:["Route Planner","Route planner"],detail:["按证据形状选择","Evidence-shape policy"],kind:"decision"},
  {id:"merge",title:["候选整理","Candidate fusion"],detail:["RRF 仅适用于融合排名","RRF ranks, not truth"]},
  {id:"evidence",title:["Evidence Check","Evidence check"],detail:["来源 / 版本 / 支持","Source / version / support"],kind:"gate"},
];
const routesChosen=[[0,1],[1,2],[3,4]];
function routerLayout(compact:boolean,scenario:number,step:number):GraphLayout {
  const width=compact?360:980,height=compact?840:565;
  const cn=compact?[
    node(routeCore[0],132,58,173,69,step>=0?A:I),
    node(routeCore[1],132,143,173,69,step>=1?A:I),
    node(routeCore[2],132,228,173,69,step>=2?A:P),
    node(routeCore[3],132,661,173,69,step>=2?A:I),
    node(routeCore[4],132,755,173,69,step>=3?A:I),
  ]:[
    node(routeCore[0],93,262,157,80,A),
    node(routeCore[1],282,262,157,80,step>=1?A:I),
    node(routeCore[2],461,262,157,80,step>=2?A:I),
    node(routeCore[3],881,258,160,76,step>=2?A:I),
    node(routeCore[4],881,408,160,76,step>=3?A:I),
  ];
  const xs=compact?[102,259,102,259,102]:[693,693,693,693,693];
  const ys=compact?[328,328,438,438,548]:[83,171,259,347,435];
  const chosen=routesChosen[scenario]??routesChosen[0];
  const nodes=[...cn,...routeNames.map((v,i)=>node(v,xs[i],ys[i],
    compact?139:147,compact?73:70,chosen.includes(i)&&step>=2?A:I))];
  const edges:GraphEdgeData[]=[
    edge("query-acl","query","acl",step>=1?A:I,compact?{fromPort:"bottom",toPort:"top"}:{}),
    edge("acl-router","acl","router",step>=2?A:I,compact?{fromPort:"bottom",toPort:"top"}:{}),
  ];
  routeNames.forEach((item,i)=>{
    edges.push(edge("route-"+item.id,"router",item.id,chosen.includes(i)&&step>=2?A:I,
      compact?{kind:"branch",
        fromPort:i%2===0?"left":"right",toPort:i%2===0?"left":"right",
        via:i%2===0?[[18,228],[18,ys[i]]]:[[343,228],[343,ys[i]]]}:
        {kind:"branch",fromPort:"right",toPort:"left",via:[[583,262],[583,ys[i]]]}));
    edges.push(edge("candidate-"+item.id,item.id,"merge",chosen.includes(i)&&step>=2?A:I,
      compact?{kind:"mapping",
        fromPort:i%2===0?"left":"right",toPort:"top",
        via:i%2===0?[[18,ys[i]],[18,609],[132,609]]:
          [[343,ys[i]],[343,609],[132,609]]}:
        {kind:"mapping",fromPort:"right",toPort:"top",
         via:[[791,ys[i]],[791,182],[881,182]]}));
  });
  edges.push(edge("fusion-evidence","merge","evidence",step>=3?A:I,compact?{fromPort:"bottom",toPort:"top"}:{fromPort:"bottom",toPort:"top"}));
  return {width,height,nodes,edges,notes:compact?[
    {x:180,y:284,text:["仅高亮选中路线","ONLY SELECTED ROUTES"]},
  ]:[
    {x:688,y:29,text:["可选检索路径 / 仅高亮当前选择","RETRIEVAL OPTIONS · SELECTED PATHS HIGHLIGHTED"]},
    {x:878,y:517,text:["融合排名 ≠ Claim 支持","FUSION SCORE ≠ CLAIM SUPPORT"]},
  ]};
}
export function QueryRoutingGraph({scenario,step,en}:{scenario:number;step:number;en:boolean}){
 const label:readonly GraphText[]=[
  ["EXACT + BM25 · 来源与版本仍需核对","EXACT + BM25 · source and version still require checks"],
  ["BM25 + DENSE · 只按名次融合，不直接相加分数","BM25 + DENSE · rank fusion is not score addition"],
  ["GRAPH + DOCS · 关系必须有来源","GRAPH + DOCS · relationship evidence needs provenance"],
 ];
 return <GraphCanvas id="routing" desktop={routerLayout(false,scenario,step)}
    mobile={routerLayout(true,scenario,step)} en={en} summary={label[scenario]}/>;
}

const gateNames:readonly N[]=[
  {id:"g0",title:["G0 Query","G0 Query"],detail:["范围与风险","Scope / risk"],kind:"source"},
  {id:"g1",title:["G1 Coverage","G1 Coverage"],detail:["能力 / 时间范围","Knowledge scope"],kind:"gate"},
  {id:"g2",title:["G2 Retrieval","G2 Retrieval"],detail:["召回质量 / 来源","Quality / source"],kind:"gate"},
  {id:"g3",title:["G3 Sufficiency","G3 Sufficiency"],detail:["支持 / 冲突 / 缺失","Evidence state"],kind:"decision"},
  {id:"g4",title:["G4 Claim","G4 Claim"],detail:["Claim / 来源对齐","Claim alignment"],kind:"gate"},
  {id:"g5",title:["G5 Policy","G5 Policy"],detail:["条件性决策","Conditional policy"],kind:"decision"},
];
const policyOptions:readonly N[]=[
  {id:"answer",title:["ANSWER","ANSWER"],detail:["有根据的回答","Grounded answer"],kind:"terminal"},
  {id:"resolve",title:["RESOLVE / ESCALATE","RESOLVE / ESCALATE"],detail:["权威来源冲突","Authority conflict"],kind:"terminal"},
  {id:"abstain",title:["RETRIEVE / ABSTAIN","RETRIEVE / ABSTAIN"],detail:["证据不足","Insufficient evidence"],kind:"terminal"},
];
function gatesLayout(compact:boolean,scenario:number,step:number):GraphLayout {
  const width=compact?360:980,height=compact?915:485;
  const x=compact?[135,135,135,135,135,135]:[90,250,410,570,730,890];
  const y=compact?[62,151,240,329,418,507]:[131,131,131,131,131,131];
  const states:GraphState[]=gateNames.map((_,i)=>{
    const time=[0,1,1,2,3,3][i];if(step<time)return I;
    if(i===4&&scenario!==0)return B;
    return A;
  });
  const nodes=gateNames.map((v,i)=>node(v,x[i],y[i],compact?170:143,compact?71:78,states[i]));
  const outx=compact?[92,273,92]:[290,564,827],outy=compact?[655,655,793]:[332,332,332];
  nodes.push(...policyOptions.map((v,i)=>node(v,outx[i],outy[i],compact?150:195,compact?76:84,
    step>=3&&scenario===i?(i===0?A:B):I)));
  const edges:GraphEdgeData[]=[];
  gateNames.slice(0,-1).forEach((v,i)=>{
    const state=step<([1,1,2,3,3][i])?I:
      (scenario!==0&&i===3?B:scenario!==0&&i===4?I:A);
    edges.push(edge("gate-"+i,v.id,gateNames[i+1].id,state,
      compact?{fromPort:"bottom",toPort:"top"}:{fromPort:"right",toPort:"left"}));
  });
  if(scenario!==0){
    edges.push(edge("conflict-to-policy","g3","g5",step>=3?A:I,
      compact?{kind:"branch",fromPort:"right",toPort:"right",via:[[333,329],[333,507]]}:
        {kind:"branch",fromPort:"bottom",toPort:"bottom",
         via:[[570,251],[890,251]]}));
  }
  policyOptions.forEach((v,i)=>edges.push(edge("policy-"+v.id,"g5",v.id,
    step>=3&&scenario===i?(i===0?A:B):I,
    compact?(i===2?{kind:"branch",fromPort:"left",toPort:"left",
       via:[[9,507],[9,outy[i]]]}:
       i===1?{kind:"branch",fromPort:"right",toPort:"right",
       via:[[354,507],[354,outy[i]]]}:
       {kind:"branch",fromPort:"bottom",toPort:"top",via:[[135,584],[92,584]]}):
      {kind:"branch",fromPort:"bottom",toPort:"top",
       via:[[890,266],[outx[i],266]]})));
  return {width,height,nodes,edges,notes:compact?[]:[
    {x:489,y:36,text:["G0–G5 · 六道证据决策门禁","G0–G5 · EVIDENCE DECISION GATES"]},
  ]};
}
export function EvidenceGatesGraph({scenario,step,en}:{scenario:number;step:number;en:boolean}){
 const labels:readonly GraphText[]=[
  ["SUPPORT → ANSWER；必须逐条核对 Claim 支持","SUPPORT → ANSWER only after checking claim-level support"],
  ["CONFLICT → 核对权威版本，不能误判 Claim 通过","CONFLICT → resolve authority; claim gate cannot pass"],
  ["INSUFFICIENT → 补检索或拒答，不凭相关度填缺口","INSUFFICIENT → retrieve or abstain, not guess"],
 ];
 return <GraphCanvas id="evidence-gates" desktop={gatesLayout(false,scenario,step)}
  mobile={gatesLayout(true,scenario,step)} en={en} summary={labels[scenario]}/>;
}

const skillPath:readonly N[]=[
 {id:"intent",title:["任务意图","Task intent"],detail:["用户请求","User request"],kind:"source"},
 {id:"registry",title:["Skill Registry","Skill registry"],detail:["只匹配摘要","Match summary only"]},
 {id:"policy",title:["权限 / 输入 Gate","Access / input gate"],detail:["Host 检查，不靠 Prompt","Trusted host checks"],kind:"gate"},
 {id:"method",title:["加载 SKILL.md","Load SKILL.md"],detail:["方法 / 约束","Method / constraints"]},
 {id:"tool",title:["Host Tool / MCP","Host tool / MCP"],detail:["MCP 可选 · 工具执行","Protocol optional"]},
 {id:"verify",title:["验证结果","Verify results"],detail:["页码 / 记录 / 出处","Grounding / trace"],kind:"terminal"},
];
const skillExits:readonly N[]=[
 {id:"clarify",title:["CLARIFY","CLARIFY"],detail:["补齐输入再校验","Request missing inputs"],kind:"terminal"},
 {id:"reject",title:["REJECT","REJECT"],detail:["跨租户 / 无授权","Unauthorized scope"],kind:"terminal"},
];
function skillLayout(compact:boolean,scenario:number,step:number):GraphLayout{
 const width=compact?360:970,height=compact?865:465;
 const xx=compact?[115,115,115,115,115,115]:[82,243,404,565,726,887];
 const yy=compact?[62,155,248,341,434,527]:[139,139,139,139,139,139];
 // The simulator groups discovery, policy, instructions/references, execution.
 // Nodes and incoming edges must share those phase boundaries, including denials.
 const reached=(i:number)=>step>=[0,0,1,2,3,3][i]&&(scenario===0||i<=2);
 const nodes=skillPath.map((v,i)=>node(v,xx[i],yy[i],compact?165:143,compact?70:81,
   reached(i)?(scenario!==0&&i===2?B:A):I));
 const ex=compact?[278,278]:[352,541],ey=compact?[682,794]:[331,331];
 nodes.push(...skillExits.map((v,i)=>node(v,ex[i],ey[i],compact?139:153,compact?74:82,
   i===scenario-1&&step>=1?B:I)));
 const edges:GraphEdgeData[]=skillPath.slice(0,-1).map((v,i)=>
   edge("skill-"+i,v.id,skillPath[i+1].id,
    reached(i+1)?A:I,
    compact?{fromPort:"bottom",toPort:"top"}:{fromPort:"right",toPort:"left"}));
 skillExits.forEach((v,i)=>edges.push(edge("skill-exit-"+v.id,"policy",v.id,
   i===scenario-1&&step>=1?B:I,
   compact?{kind:"branch",fromPort:"right",toPort:"right",via:[[353,248],[353,ey[i]]]}:
   {kind:"branch",fromPort:"bottom",toPort:"top",
      via:[[404,255],[ex[i],255]]})));
 return {width,height,nodes,edges,notes:compact?[]:[
  {x:484,y:38,text:["匹配能力 ≠ 获得授权 · Skill 方法 ≠ Tool 执行","MATCHING ≠ PERMISSION · SKILL METHOD ≠ TOOL EXECUTION"]},
 ]};
}
export function SkillBoundaryGraph({scenario,step,en}:{scenario:number;step:number;en:boolean}){
 const texts:readonly GraphText[]=[
  ["PDF Skill 加载指令后，仍需 Host 授权工具执行","PDF skill instructions require host-authorized tool execution"],
  ["缺少合同与地区输入 → CLARIFY；不加载或执行工具","Missing contract / jurisdiction → clarify; do not execute"],
  ["跨租户名单 → REJECT；能力匹配不能绕过权限","Cross-tenant export → reject, despite skill capability match"],
 ];
 return <GraphCanvas id="skills" desktop={skillLayout(false,scenario,step)}
  mobile={skillLayout(true,scenario,step)} en={en} summary={texts[scenario]}/>;
}

const loopStages:readonly N[]=[
 {id:"plan1",title:["Plan ①","Plan ①"],detail:["目标 / 验收","Goal / criteria"],kind:"source"},
 {id:"act1",title:["Act ①","Act ①"],detail:["授权工具调用","Authorized action"]},
 {id:"observe1",title:["Observe ①","Observe ①"],detail:["外部测试结果","Tool evidence"]},
 {id:"check1",title:["Check ①","Check ①"],detail:["证据 / 预算 Gate","Evidence / budget"],kind:"gate"},
];
const second:readonly N[]=[
 {id:"plan2",title:["Plan ②","Plan ②"],detail:["依据失败修订","Revise from failure"]},
 {id:"act2",title:["Act ②","Act ②"],detail:["重新授权工具","Authorized retry"]},
 {id:"observe2",title:["Observe ②","Observe ②"],detail:["第二轮工具验证","Round-two evidence"]},
 {id:"check2",title:["Check ②","Check ②"],detail:["验收通过 / 停止","Acceptance check"],kind:"gate"},
];
const exitNames:readonly N[]=[
 {id:"stop",title:["STOP","STOP"],detail:["验收已通过","Criteria verified"],kind:"terminal"},
 {id:"handoff",title:["HANDOFF","HANDOFF"],detail:["预算不足 / 未完成","Budget exhausted"],kind:"terminal"},
];
function loopLayout(compact:boolean,scenario:number,step:number,last:boolean):GraphLayout{
 const two=scenario===1,width=compact?360:970,height=compact?(two?1290:760):650;
 const fx=compact?[128,128,128,128]:[109,343,577,811];
 const fy=compact?[90,208,326,444]:[139,139,139,139];
 const sx=compact?[128,128,128,128]:[109,343,577,811];
 const sy=compact?[680,798,916,1034]:[399,399,399,399];
 const states=(index:number):GraphState=>step>=index?A:I;
 const nodes=loopStages.map((v,i)=>node(v,fx[i],fy[i],compact?168:174,compact?78:84,states(i)));
 if(two)nodes.push(...second.map((v,i)=>node(v,sx[i],sy[i],compact?168:174,compact?78:84,states(i+4))));
 nodes.push(node(exitNames[0],compact?112:683,compact?(two?1182:650):570,
    compact?149:156,74,scenario!==2&&last?A:I));
 nodes.push(node(exitNames[1],compact?286:875,compact?(two?1182:650):570,
    compact?132:154,74,scenario===2&&last?B:I));
 const edges:GraphEdgeData[]=[];
 for(let i=0;i<3;i++)edges.push(edge("first-"+i,loopStages[i].id,loopStages[i+1].id,
    step>i?A:I,compact?{fromPort:"bottom",toPort:"top"}:{}));
 if(two){
  edges.push(edge("retry-return","check1","plan2",step>=4?A:step===3?P:I,
   compact?{kind:"return",fromPort:"bottom",toPort:"top",
      via:[[128,544],[128,544]]}:
     {kind:"return",fromPort:"bottom",toPort:"top",
       via:[[811,288],[109,288]]}));
  for(let i=0;i<3;i++)edges.push(edge("second-"+i,second[i].id,second[i+1].id,
    step>i+4?A:I,compact?{fromPort:"bottom",toPort:"top"}:{}));
 }
 edges.push(edge("finish-stop",two?"check2":"check1","stop",scenario!==2&&last?A:I,
  compact?{fromPort:"bottom",toPort:"top"}:{fromPort:"bottom",toPort:"top"}));
 edges.push(edge("finish-handoff","check1","handoff",scenario===2&&last?B:I,
  compact?{kind:"branch",fromPort:"bottom",toPort:"top",via:[[286,540]]}:
    {kind:"branch",fromPort:"bottom",toPort:"top",via:[[947,338]]}));
 const notes:GraphLayout["notes"]=compact?two?[
  {x:181,y:570,text:["权限与预算允许，才可以 RETRY","RETRY ONLY WITH BUDGET + PERMISSION"]},
 ]:[]:[
  {x:470,y:40,text:["有限 Agent Loop · Feedback 决定下一条 Edge","BOUNDED AGENT LOOP · FEEDBACK CONTROLS EDGES"]},
  {x:470,y:319,text:two?["第二轮：有条件重试","ROUND 2 · CONDITIONAL RETRY"]:["终点：STOP 或 HANDOFF","TERMINAL · STOP OR HANDOFF"]},
 ];
 return {width,height,nodes,edges,notes};
}
export function AgentLoopGraph({scenario,step,last,en}:{scenario:number;step:number;last:boolean;en:boolean}){
 const names:readonly GraphText[]=[
  ["单轮验收通过 → STOP，不必再次调用工具","Verified in first round → STOP without unnecessary retries"],
  ["第一轮失败 → 权限/预算允许后重试 → 第二轮通过 STOP","Failure → budgeted retry → second-round verification → STOP"],
  ["超出执行预算且未达标 → HANDOFF，不能假装成功","Budget exhausted and criteria unmet → HANDOFF, never fake STOP"],
 ];
 return <GraphCanvas id="agent-loop" desktop={loopLayout(false,scenario,step,last)}
  mobile={loopLayout(true,scenario,step,last)} en={en} summary={names[scenario]}/>;
}

const prefixNames:readonly N[]=[
 {id:"tokens",title:["请求 token","Request tokens"],detail:["System · Tools · Role","System · tools · role"],kind:"source"},
 {id:"scope",title:["Cache Key Gate","Cache key gate"],detail:["模型 · 命名空间 · 盐","Model · namespace · salt"],kind:"gate"},
 {id:"prefix",title:["逐 token 前缀","Exact token prefix"],detail:["仅可复用相同前缀","Same prefix only"],kind:"gate"},
 {id:"reuse",title:["Prefix KV Blocks","Prefix KV blocks"],detail:["缓存存在时可复用","Reuse if cached"],kind:"store"},
 {id:"prefill",title:["Suffix Prefill","Suffix prefill"],detail:["继续计算不同后缀","Compute divergent suffix"]},
 {id:"decode",title:["Decode","Decode"],detail:["逐 token 仍需执行","Always per-token"],kind:"terminal"},
];
const isolation: N={id:"isolation",title:["独立 Prefill","Isolated prefill"],detail:["不跨命名空间共享","No cross-tenant reuse"],kind:"terminal"};
function prefixLayout(compact:boolean,scenario:number):GraphLayout {
 const width=compact?360:980,height=compact?765:420;
 const xs=compact?[116,116,116,116,116,116]:[95,252,409,566,723,880];
 const ys=compact?[68,164,260,356,452,548]:[159,159,159,159,159,159];
 const nodes=prefixNames.map((v,i)=>node(v,xs[i],ys[i],compact?168:148,compact?72:81,
  scenario===2?(i===0||i===5?A:i===1?B:I):A));
 nodes.push(node(isolation,compact?281:405,compact?677:329,
  compact?137:167,75,scenario===2?A:I));
 const edges:GraphEdgeData[]=prefixNames.slice(0,-1).map((v,i)=>
  edge("prefix-"+i,v.id,prefixNames[i+1].id,
    scenario===2?(i===0?A:I):A,
    compact?{fromPort:"bottom",toPort:"top"}:{}));
 edges.push(edge("namespace-isolation","scope","isolation",scenario===2?B:I,
  compact?{kind:"branch",fromPort:"right",toPort:"top",
    via:[[290,164],[290,617]]}:
    {kind:"branch",fromPort:"bottom",toPort:"top"}));
 edges.push(edge("isolated-decode","isolation","decode",scenario===2?A:I,
  compact?{kind:"return",fromPort:"left",toPort:"right",via:[[192,677],[192,548]]}:
   {kind:"forward",fromPort:"right",toPort:"bottom",
     via:[[880,329]]}));
 return {width,height,nodes,edges,notes:compact?[]:[
  {x:480,y:53,text:["复用的是 Prefix KV，不是 Agent 共享会话状态","REUSE PREFIX KV · NOT SHARED AGENT SESSION STATE"]},
 ]};
}
export function PrefixServingGraph({scenario,en}:{scenario:number;en:boolean}){
 const titles:readonly GraphText[]=[
  ["兼容前缀与 Cache Key → 可能复用 Prefix KV；仍需独立 Decode","Compatible prefix/key may reuse KV; Decode is still required"],
  ["提前分叉 → 仅复用完全相同的前缀块；后缀需 Prefill","Early divergence → only exact common KV blocks are reused"],
  ["租户 Cache Namespace 不兼容 → 独立 Prefill，绝不跨域共享","Isolated tenant cache namespace → independent prefill, no cross-scope reuse"],
 ];
 return <GraphCanvas id="serving" desktop={prefixLayout(false,scenario)}
   mobile={prefixLayout(true,scenario)} en={en} summary={titles[scenario]}/>;
}
