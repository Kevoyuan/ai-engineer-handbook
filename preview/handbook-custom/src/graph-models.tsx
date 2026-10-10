import { GraphCanvas, type GraphLayout, type GraphNodeData, type GraphEdgeData, type GraphState, type GraphText } from "./graph-primitives";

const active:GraphState="active",idle:GraphState="idle",blocked:GraphState="blocked",pending:GraphState="pending";
type NodeText={id:string;title:GraphText;detail:GraphText;kind?:GraphNodeData["kind"]};
function node(t:NodeText,x:number,y:number,w:number,h=70,state:GraphState=idle):GraphNodeData{
  return {...t,x,y,width:w,height:h,state};
}
function edge(id:string,from:string,to:string,state:GraphState=idle,options:Partial<GraphEdgeData>={}):GraphEdgeData {
  return {id,from,to,state,...options};
}
const securityNodes:readonly NodeText[]=[
  {id:"identity",title:["可信身份","Trusted identity"],detail:["SSO · Tenant · Role","SSO · tenant · role"],kind:"source"},
  {id:"acl",title:["候选 ACL Gate","Candidate ACL gate"],detail:["租户 / 角色 / 版本","Tenant / role / version"],kind:"gate"},
  {id:"set",title:["合法候选集","Authorized candidates"],detail:["先界定范围","Scope before search"]},
  {id:"search",title:["检索 / 重排","Retrieve / rerank"],detail:["Exact · BM25 · Dense","Exact · BM25 · Dense"]},
  {id:"fetch",title:["来源复核 Gate","Source fetch recheck"],detail:["重新验证资源权限","Recheck live ACL"],kind:"gate"},
  {id:"evidence",title:["证据入 Context","Evidence in context"],detail:["仅授权的可溯源资料","Authorized & sourced"],kind:"terminal"},
];
const rejection1:NodeText={id:"denied-acl",title:["拒绝候选","DENY at ACL"],detail:["越权 / 无合法文档","No authorized data"],kind:"terminal"};
const rejection2:NodeText={id:"denied-fetch",title:["阻止取原文","DENY at fetch"],detail:["索引 ACL 已过期","Stale indexed ACL"],kind:"terminal"};
function permissionLayout(compact:boolean,scenario:number):GraphLayout {
  const width=compact?360:930,height=compact?667:430;
  const yy=compact?[62,160,258,356,454,552]:[172,172,172,172,172,172];
  const xx=compact?[138,138,138,138,138,138]:[80,234,388,542,696,850];
  const w=compact?168:136,h=compact?69:83;
  const stageStates:GraphState[]=securityNodes.map((_,i)=>
    scenario===0?active:scenario===1?(i<=4?active:idle):(i<=1?active:idle));
  const nodes=securityNodes.map((t,i)=>node(t,xx[i],yy[i],w,h,stageStates[i]));
  nodes.push(node(rejection1,compact?290:234,compact?212:346,compact?102:136,compact?65:70,scenario===2?blocked:idle));
  nodes.push(node(rejection2,compact?290:696,compact?500:346,compact?102:136,compact?65:70,scenario===1?blocked:idle));
  const edges:GraphEdgeData[]=securityNodes.slice(0,-1).map((n,i)=>
    edge("flow-"+i,n.id,securityNodes[i+1].id,
      scenario===0?active:scenario===1?(i<4?active:idle):i===0?active:idle,
      compact?{fromPort:"bottom",toPort:"top"}:{fromPort:"right",toPort:"left"}));
  edges.push(edge("acl-reject","acl","denied-acl",scenario===2?blocked:idle,
    compact?{fromPort:"right",toPort:"left",kind:"branch",
      via:[[252,160],[252,212]]}:
      {fromPort:"bottom",toPort:"top",kind:"branch",label:["拒绝","DENY"],labelAt:[232,280]}));
  edges.push(edge("fetch-reject","fetch","denied-fetch",scenario===1?blocked:idle,
    compact?{fromPort:"right",toPort:"left",kind:"branch",via:[[252,454],[252,500]]}:
      {fromPort:"bottom",toPort:"top",kind:"branch",label:["撤销","REVOKED"],labelAt:[696,282]}));
  return {width,height,nodes,edges,notes:compact?[]:[
    {x:465,y:55,text:["① 身份 + 候选授权   ② 检索   ③ 来源权限再次确认","① Identity + ACL   ② Retrieval   ③ Fetch recheck"]},
  ]};
}
export function PermissionGraph({scenario,en}:{scenario:number;en:boolean}){
  const summaries:readonly GraphText[]=[
    ["GREEN PATH · 仅合法候选进入证据上下文","GREEN PATH · only authorized evidence enters context"],
    ["STALE ACL · 检索可执行，取原文时重新验权并拒绝","STALE ACL · retrieval proceeds, fetch recheck denies access"],
    ["CROSS-TENANT · 在候选 ACL Gate 提前拒绝","CROSS-TENANT · candidate ACL gate denies before retrieval"],
  ];
  return <GraphCanvas id="permission" en={en} desktop={permissionLayout(false,scenario)}
    mobile={permissionLayout(true,scenario)} summary={summaries[scenario]}/>;
}

const memWrite:readonly NodeText[]=[
  {id:"candidate",title:["提取候选","Extract candidate"],detail:["新观察 / 显式约束","New observation"],kind:"source"},
  {id:"stability",title:["稳定性核验","Stability check"],detail:["可复用 · 用户许可","Durable · consent"],kind:"gate"},
  {id:"write-policy",title:["写入策略 Gate","Write policy gate"],detail:["冲突 / Scope / 权限","Conflict · scope · ACL"],kind:"gate"},
  {id:"store",title:["版本化 Memory","Versioned memory"],detail:["来源 / Valid Time","Provenance · validity"],kind:"store"},
];
const memRead:readonly NodeText[]=[
  {id:"task",title:["当前任务","Current task"],detail:["按决策路由","Decision routing"],kind:"source"},
  {id:"scope",title:["读取 ACL Gate","Read scope gate"],detail:["Tenant · User · 有效期","Tenant · user · validity"],kind:"gate"},
  {id:"resolve",title:["受控取回","Retrieve & resolve"],detail:["权威性 / 冲突","Authority · conflict"],kind:"process"},
  {id:"context",title:["Context View","Context view"],detail:["最小充分上下文","Minimal relevant context"],kind:"terminal"},
];
const memCorrection:NodeText={id:"correct",title:["用户明确纠正","Explicit correction"],detail:["新权威版本","New authoritative version"],kind:"decision"};
const memDenied:NodeText={id:"read-deny",title:["拒绝读取","Read denied"],detail:["Scope 不匹配","Scope mismatch"],kind:"terminal"};
function memoryLayout(compact:boolean,scenario:number):GraphLayout {
  const width=compact?360:930,height=compact?1120:560;
  const wx=compact?[130,130,130,130]:[107,319,531,743];
  const wy=compact?[95,193,291,389]:[122,122,122,122];
  const rx=compact?[130,130,130,130]:[107,319,531,743];
  const ry=compact?[725,823,921,1019]:[415,415,415,415];
  const w=compact?174:168,h=compact?69:76;
  const write=memWrite.map((n,i)=>node(n,wx[i],wy[i],w,h,scenario===1?idle:active));
  const read=memRead.map((n,i)=>node(n,rx[i],ry[i],w,h,scenario===0?idle:scenario===1?(i<=1?i===1?blocked:active:idle):active));
  const correct=node(memCorrection,compact?276:822,compact?510:252,compact?135:158,compact?76:68,scenario===2?active:idle);
  const deny=node(memDenied,compact?288:321,compact?835:505,compact?124:158,compact?65:66,scenario===1?blocked:idle);
  const nodes=[...write,...read,correct,deny];
  const edges:GraphEdgeData[]=[];
  for(let i=0;i<3;i++){
    edges.push(edge("write-"+i,memWrite[i].id,memWrite[i+1].id,scenario===1?idle:active,
      compact?{fromPort:"bottom",toPort:"top"}:{fromPort:"right",toPort:"left"}));
    edges.push(edge("read-"+i,memRead[i].id,memRead[i+1].id,scenario===0?idle:scenario===1?(i===0?active:idle):active,
      compact?{fromPort:"bottom",toPort:"top"}:{fromPort:"right",toPort:"left"}));
  }
  edges.push(edge("memory-bridge","store","resolve",scenario===1?idle:scenario===0?idle:active,
    compact?{kind:"mapping",fromPort:"right",toPort:"right",via:[[343,389],[343,921]]}:
    {kind:"mapping",fromPort:"bottom",toPort:"top",
     via:[[743,283],[531,283]],label:["跨会话召回","SCOPED RECALL"],labelAt:[638,274]}));
  edges.push(edge("correction-version","correct","store",scenario===2?active:idle,
    compact?{kind:"return",fromPort:"top",toPort:"right",via:[[276,432],[264,432]]}:
    {kind:"return",fromPort:"top",toPort:"bottom",via:[[822,211],[743,211]],label:["纠正","REVISION"],labelAt:[847,200]}));
  edges.push(edge("read-denied","scope","read-deny",scenario===1?blocked:idle,
    compact?{kind:"branch",fromPort:"right",toPort:"left"}:
    {kind:"branch",fromPort:"bottom",toPort:"top"}));
  return {width,height,nodes,edges,notes:compact?[
    {x:75,y:30,text:["WRITE / 晋升","WRITE / PROMOTE"]},
    {x:75,y:660,text:["READ / 召回","READ / RECALL"]},
  ]:[
    {x:120,y:34,text:["WRITE · 长期晋升","WRITE · PROMOTION"]},
    {x:120,y:325,text:["READ · 按决策召回","READ · SCOPED RECALL"]},
  ]};
}
export function MemoryGraph({scenario,en}:{scenario:number;en:boolean}){
  const captions:readonly GraphText[]=[
    ["WRITE PATH · 只有合规、稳定、有来源的约束才晋升","WRITE PATH · only approved, stable, sourced memories are persisted"],
    ["READ DENIED · 无权记忆不能进入 Context","READ DENIED · unauthorized memories never enter context"],
    ["CORRECTION LOOP · 新版本覆盖当前 View，保留来源关系","CORRECTION LOOP · authoritative revision invalidates the current view"],
  ];
  return <GraphCanvas id="memory" en={en} desktop={memoryLayout(false,scenario)}
    mobile={memoryLayout(true,scenario)} summary={captions[scenario]}/>;
}

type CDCInput={expected:readonly string[];arrival:readonly string[];history:readonly string[]};
function normalize(v:string):string {
  const match=v.match(/seq\s*([123])/i);
  return match?"seq "+match[1]:v.includes("[1")?"seq 1":v.includes("[2")?"seq 2":v.includes("[3")||v.includes("≥ 3")?"seq 3":v;
}
function cdcLayout(compact:boolean,scenario:number,input:CDCInput):GraphLayout {
  const width=compact?360:930,height=compact?732:605;
  const centers=compact?[66,180,294]:[161,465,769];
  const yy=compact?[108,341,565]:[103,295,495];
  const w=compact?96:156,h=compact?66:72;
  const nodes:GraphNodeData[]=[];
  const kinds=["source","process","store"] as const;
  const rows=[input.expected,input.arrival,input.history];
  const rowIds=["source","arrival","history"];
  for(let row=0;row<3;row++)for(let i=0;i<rows[row].length;i++){
    const value=rows[row][i];
    const tail:GraphText= row===0?["源序列","Source order"]:row===1?["入库时序","Arrival order"]:["版本区间","History interval"];
    const warn=row===1&&(scenario===1&&i===0||scenario===2&&i===2);
    nodes.push(node({id:rowIds[row]+i,title:[value,value],detail:tail,kind:kinds[row]},
      centers[i],yy[row],w,h,warn?pending:active));
  }
  const edges:GraphEdgeData[]=[];
  for(let row=0;row<3;row++)for(let i=0;i<rows[row].length-1;i++){
    edges.push(edge("lane-"+row+"-"+i,rowIds[row]+i,rowIds[row]+(i+1),active,
      {fromPort:"right",toPort:"left",kind:"forward"}));
  }
  // Map by source ID, not by equal spatial column. This is the central CDC idea.
  for(let i=0;i<input.arrival.length;i++){
    const key=normalize(input.arrival[i]);
    const sourceIndex=input.expected.findIndex(q=>normalize(q)===key);
    const firstArrivalIndex=input.arrival.findIndex(q=>normalize(q)===key);
    if(sourceIndex>=0)edges.push(edge("source-arrival-"+i,"source"+sourceIndex,"arrival"+i,
      scenario===2&&i!==firstArrivalIndex?blocked:active,
      {kind:"mapping",fromPort:"bottom",toPort:"top"}));
    if(firstArrivalIndex===i){
      const histIndex=input.history.findIndex(q=>normalize(q)===key);
      if(histIndex>=0)edges.push(edge("arrival-history-"+i,"arrival"+i,"history"+histIndex,
        active,{kind:"mapping",fromPort:"bottom",toPort:"top"}));
    }
  }
  const notes:GraphLayout["notes"]=compact?[
    {x:180,y:34,text:["SOURCE SEQUENCE · 源顺序","SOURCE SEQUENCE"]},
    {x:180,y:263,text:["INGESTION · 实际到达","INGESTION ORDER"]},
    {x:180,y:481,text:["SCD2 · 序列域区间","SCD2 · SEQUENCE DOMAIN"]},
  ]:[
    {x:465,y:29,text:["SOURCE ORDER · 业务变更的逻辑顺序","SOURCE ORDER · LOGICAL MUTATION"]},
    {x:465,y:221,text:["ARRIVAL ORDER · 真实到达顺序可能交叉","ARRIVAL ORDER · OUT-OF-ORDER POSSIBLE"]},
    {x:465,y:417,text:["SCD2 HISTORY · 版本排序域，不一定是墙钟时间","SCD2 HISTORY · DECLARED SEQUENCE DOMAIN"]},
  ];
  return {width,height,nodes,edges,notes};
}
export function CDCGraph({scenario,en,expected,arrival,history}:{
  scenario:number;en:boolean;expected:readonly string[];arrival:readonly string[];history:readonly string[];
}){
  const cap:readonly GraphText[]=[
    ["SEQUENCE MAPPING · 源序列与到达顺序一致","SEQUENCE MAPPING · logical and arrival order align"],
    ["CROSS-LANE EDGES · seq 3 先到，不能用到达时间覆盖新版本","CROSS-LANE EDGES · seq 3 arrives first; ingestion order is not truth"],
    ["DEDUP BRANCH · 重复的 seq 2 不应产生第二次业务效果","DEDUP BRANCH · duplicate seq 2 must not duplicate effects"],
    ["DELETE PATH · Tombstone 关闭当前可见状态（依业务契约）","DELETE PATH · tombstone closes current visible state under declared policy"],
  ];
  const input={expected,arrival,history};
  return <GraphCanvas id="cdc" desktop={cdcLayout(false,scenario,input)}
    mobile={cdcLayout(true,scenario,input)} en={en} summary={cap[scenario]}/>;
}

const budgetResources:readonly NodeText[]=[
 {id:"constraints",title:["系统约束","System constraints"],detail:["不可删减","Keep protected"],kind:"gate"},
 {id:"history",title:["聊天历史","History"],detail:["去重 / 压缩","Dedup / compress"]},
 {id:"evidence",title:["检索证据","Evidence"],detail:["筛选 / 重排","Route / rerank"]},
 {id:"state",title:["工作状态","Working state"],detail:["结构化保留","Structured state"]},
 {id:"reserve",title:["输出预算","Output reserve"],detail:["预留生成空间","Reserve output"],kind:"gate"},
];
const request:NodeText={id:"request",title:["请求 + 任务","Request + task"],detail:["当前问题","Current objective"],kind:"source"};
const allocator:NodeText={id:"allocator",title:["Context Allocator","Context allocator"],detail:["容量 / 有效证据","Budget + utility"],kind:"decision"};
const assembled:NodeText={id:"assemble",title:["已组装 Context","Assembled context"],detail:["核对来源 · 留出输出预算","Sourced inputs · output reserved"],kind:"terminal"};
/**
 * A single assembly spine plus five policy branches. Earlier V3.2 connected
 * every leaf back to the output, producing overlapping spaghetti edges and
 * incorrectly suggesting that the output reservation becomes prompt content.
 * Policy branches express allocation decisions, not token flow percentages.
 */
function budgetLayout(compact:boolean,scenario:number,priorities:readonly GraphState[]):GraphLayout{
  const width=compact?360:930,height=compact?818:655;
  const nodes:GraphNodeData[]=[];
  nodes.push(node(request,compact?178:101,compact?61:315,compact?168:170,compact?68:78,active));
  nodes.push(node(allocator,compact?178:307,compact?161:315,compact?186:172,compact?76:80,active));
  const x=compact?[100,260,100,260,100]:[619,619,619,619,619];
  const y=compact?[301,301,432,432,562]:[103,203,303,403,503];
  const w=compact?135:181,h=compact?78:75;
  for(let i=0;i<budgetResources.length;i++){
    const item=node(budgetResources[i],x[i],y[i],w,h,priorities[i]);
    // Compression failure is lost fidelity, not a tenant/ACL denial.
    if(i===1&&scenario===2)item.stateLabel=["摘要失真","Summary loss"];
    if(i===4)item.stateLabel=["输出已预留","Output reserved"];
    nodes.push(item);
  }
  nodes.push(node(assembled,compact?178:825,compact?733:602,compact?185:174,compact?76:74,active));
  const edges:GraphEdgeData[]=[
    edge("request-allocator","request","allocator",active,
      compact?{fromPort:"bottom",toPort:"top"}:{fromPort:"right",toPort:"left"}),
    // The direct assembly path represents the outcome of policy decisions:
    // resources are not fake individually-merged pipes, and reserve is budget,
    // not an extra source of prompt evidence.
    edge("allocator-assemble","allocator","assemble",active,
      compact?{fromPort:"bottom",toPort:"top",
        via:[[178,655],[178,655]]}:
        {fromPort:"bottom",toPort:"left",via:[[307,602],[738,602]]}),
  ];
  for(let i=0;i<budgetResources.length;i++){
    const state=priorities[i];
    const options:Partial<GraphEdgeData>=compact?
      {kind:"branch",fromPort:"bottom",toPort:"top",
        via:[[178,y[i]-56],[x[i],y[i]-56]]}:
      {kind:"branch",fromPort:"right",toPort:"left",
        via:[[471,315],[471,y[i]]]};
    edges.push(edge("allocate-"+budgetResources[i].id,"allocator",
      budgetResources[i].id,state,options));
  }
  const notes:GraphLayout["notes"]=compact?[]:[
    {x:615,y:35,text:["上下文来源 / 分配处理策略","INPUT RESPONSIBILITY / ALLOCATION POLICY"]},
    {x:820,y:553,text:["策略结果 / 保留生成空间","RESULT / OUTPUT RESERVED"]},
  ];
  return {width,height,nodes,edges,notes};
}
export function ContextGraph({scenario,en,status}:{
  scenario:number;en:boolean;status:readonly ("pass"|"hold"|"block"|"idle")[];
}){
 const states:GraphState[]=status.map(s=>s==="pass"?active:s==="block"?blocked:s==="hold"?pending:idle);
 const captions:readonly GraphText[]=[
  ["ALLOCATION FLOW · 优先保留约束、关键状态和输出预留","ALLOCATION FLOW · protect constraints, working state and output reserve"],
  ["EVIDENCE POSITION · 注意内容位置对任务成功率的影响","EVIDENCE POSITION · test where evidence appears in the context"],
  ["COMPRESSION FAILURE · 摘要丢失约束时回溯结构化状态","COMPRESSION FAILURE · restore authoritative constraints, not guessed summaries"],
 ];
 return <GraphCanvas id="context" en={en} desktop={budgetLayout(false,scenario,states)}
    mobile={budgetLayout(true,scenario,states)} summary={captions[scenario]}/>;
}
