/** Source-aligned structural graphs: citation lineage, run diagnostics, FDE trust planes. */
import { GraphCanvas, type GraphLayout, type GraphNodeData, type GraphEdgeData, type GraphText, type GraphState } from "./graph-primitives";
type Model={id:string; title:GraphText; detail:GraphText; kind?:GraphNodeData["kind"]};
const A:GraphState="active",I:GraphState="idle",B:GraphState="blocked",P:GraphState="pending";
function n(x:Model,cx:number,cy:number,w:number,h:number,state:GraphState=I):GraphNodeData {
 return {...x,x:cx,y:cy,width:w,height:h,state};
}
function e(id:string,from:string,to:string,state:GraphState,extra:Partial<GraphEdgeData>={}):GraphEdgeData{
 return {id,from,to,state,...extra};
}
const citation:readonly Model[]=[
 {id:"doc",title:["原始 PDF","Source PDF"],detail:["文档版本 · 原页","Version · page"],kind:"source"},
 {id:"structure",title:["结构恢复","Structure recovery"],detail:["跨页表格 / OCR","Table / OCR"],kind:"process"},
 {id:"chunk",title:["证据单元","Evidence element"],detail:["单元格 / 段落 + 坐标","Cell / paragraph + locator"],kind:"process"},
 {id:"claim",title:["Claim 验证","Claim verification"],detail:["支持 / 冲突 / 缺失","Support / conflict / gap"],kind:"gate"},
 {id:"citation",title:["可核验引用","Resolvable citation"],detail:["回到原页核对","Verify original source"],kind:"terminal"},
];
const citationFails:readonly Model[]=[
 {id:"source-review",title:["核对扫描原页","Review scanned page"],detail:["无法可靠定位则不引用","No fabricated locator"],kind:"terminal"},
 {id:"structure-review",title:["重建表格结构","Repair table structure"],detail:["行列 / 表头 / 单位","Rows · header · units"],kind:"terminal"},
];
function provenanceLayout(compact:boolean,scenario:number):GraphLayout{
 const width=compact?360:930,height=compact?616:380;
 const xs=compact?[130,130,130,130,130]:[98,283,468,653,838];
 const ys=compact?[58,157,256,355,454]:[118,118,118,118,118];
 const w=compact?173:150,h=compact?73:82;
 const seq:GraphState[]=scenario===0?[A,A,A,A,A]:scenario===1?[A,B,I,I,I]:[P,B,I,I,I];
 const nodes=citation.map((item,i)=>n(item,xs[i],ys[i],w,h,seq[i]));
 nodes.push(n(citationFails[0],compact?284:102,compact?138:281,compact?132:172,70,scenario===2?B:I));
 nodes.push(n(citationFails[1],compact?284:285,compact?239:281,compact?132:172,70,scenario===1?B:I));
 const edges:GraphEdgeData[]=citation.slice(0,-1).map((item,i)=>
   e("cite-"+i,item.id,citation[i+1].id,
    scenario===0?A:scenario===1?(i===0?B:I):i===0?B:I,
    compact?{fromPort:"bottom",toPort:"top"}:{fromPort:"right",toPort:"left"}));
 edges.push(e("scan-review","doc","source-review",scenario===2?B:I,
  compact?{kind:"branch",fromPort:"right",toPort:"left"}:
    {kind:"branch",fromPort:"bottom",toPort:"top"}));
 edges.push(e("table-review","structure","structure-review",scenario===1?B:I,
  compact?{kind:"branch",fromPort:"right",toPort:"left"}:
    {kind:"branch",fromPort:"bottom",toPort:"top"}));
 return {width,height,nodes,edges};
}
export function CitationGraph({scenario,en}:{scenario:number;en:boolean}){
 const labels:readonly GraphText[]=[
  ["SOURCE PATH · 每项 Claim 都要能回到原文信息单元","SOURCE PATH · claims must resolve to original information units"],
  ["BROKEN TABLE · 结构错误在证据入链前就应阻断","BROKEN TABLE · structure fails before a verifiable citation"],
  ["OCR UNCERTAINTY · 无法核验原页时暂停引用","OCR UNCERTAINTY · do not cite without a verifiable original page"],
 ];
 return <GraphCanvas id="citation" en={en} desktop={provenanceLayout(false,scenario)}
    mobile={provenanceLayout(true,scenario)} summary={labels[scenario]}/>;
}

const run:Model={id:"root",title:["Root Run","Root run"],detail:["一次请求 Trace","Single request trace"],kind:"source"};
const runSpans:readonly Model[]=[
 {id:"llm",title:["LLM Run","LLM run"],detail:["生成 / 版本","Output / version"]},
 {id:"retrieval",title:["Retriever Run","Retriever run"],detail:["召回 / 候选","Candidates / recall"]},
 {id:"tool",title:["Tool Run","Tool run"],detail:["调用 / 副作用","Tool effects"]},
 {id:"policy",title:["Policy Run","Policy run"],detail:["ACL / Validator","ACL / validator"],kind:"gate"},
];
const evalPipeline:readonly Model[]=[
 {id:"triage",title:["Trace 分诊","Trace triage"],detail:["定位最早错误节点","Find first wrong step"],kind:"decision"},
 {id:"curate",title:["脱敏 / 标注","Privacy / label"],detail:["不直接复制原始 Trace","Curate, not raw export"]},
 {id:"regression",title:["分组回归","Slice regression"],detail:["安全 / 质量 / 故障注入","Safety / quality / faults"]},
 {id:"release",title:["发布 Gate","Release gate"],detail:["风险门禁 · 审查","Risk decision"],kind:"gate"},
];
const held:Model={id:"hold",title:["HOLD / BLOCK","HOLD / BLOCK"],detail:["补证据 / 修复后再验","Fix and re-evaluate"],kind:"terminal"};
const rollout:Model={id:"rollout",title:["Shadow / Canary","Shadow / Canary"],detail:["仅验收通过后允许","Only after gates pass"],kind:"terminal"};
function traceLayout(compact:boolean,scenario:number):GraphLayout {
 const width=compact?360:930,height=compact?1240:675;
 const selected=["retrieval","tool","policy"][scenario];
 const nodes:GraphNodeData[]=[];
 nodes.push(n(run,compact?126:452,compact?60:70,compact?178:173,75,A));
 const rx=compact?[126,126,126,126]:[119,350,581,812];
 const ry=compact?[175,271,367,463]:[221,221,221,221];
 for(let i=0;i<4;i++)nodes.push(n(runSpans[i],rx[i],ry[i],compact?173:176,compact?70:81,
  runSpans[i].id===selected?B:I));
 const ex=compact?[126,126,126,126]:[146,359,571,784];
 const ey=compact?[590,708,826,944]:[419,419,419,419];
 for(let i=0;i<4;i++)nodes.push(n(evalPipeline[i],ex[i],ey[i],compact?173:171,compact?79:82,
  i===3?(scenario===2?B:P):A));
 nodes.push(n(held,compact?126:658,compact?1080:579,compact?171:170,74,scenario===2?B:P));
 nodes.push(n(rollout,compact?293:853,compact?1161:579,compact?124:139,68,I));
 const edges:GraphEdgeData[]=[];
 for(const span of runSpans)edges.push(e("trace-"+span.id,"root",span.id,span.id===selected?A:I,
  compact?{fromPort:"bottom",toPort:"top"}:{fromPort:"bottom",toPort:"top"}));
 edges.push(e("first-error",selected,"triage",A,
  compact?{fromPort:"bottom",toPort:"top"}:
  {fromPort:"bottom",toPort:"top",via:[[rx[runSpans.findIndex(r=>r.id===selected)],321],[146,321]]}));
 for(let i=0;i<3;i++)edges.push(e("eval-"+i,evalPipeline[i].id,evalPipeline[i+1].id,A,
    compact?{fromPort:"bottom",toPort:"top"}:{fromPort:"right",toPort:"left"}));
 edges.push(e("release-hold","release","hold",scenario===2?B:P,
  compact?{fromPort:"bottom",toPort:"top"}:{fromPort:"bottom",toPort:"top"}));
 edges.push(e("release-canary","release","rollout",I,
  compact?{fromPort:"right",toPort:"top"}:{fromPort:"bottom",toPort:"top"}));
 return {width,height,nodes,edges,notes:compact?[
  {x:125,y:530,text:["TRACE → EVALUATION","TRACE → EVALUATION"]},
 ]:[
  {x:460,y:319,text:["TRACE 证据 → 脱敏整理后的离线回归","TRACE EVIDENCE → CURATED OFFLINE REGRESSION"]},
  {x:755,y:528,text:["门禁未通过时不能进入 Canary","NO CANARY WITHOUT PASSING THE GATE"]},
 ]};
}
export function TraceEvaluationGraph({scenario,en}:{scenario:number;en:boolean}){
 const labels:readonly GraphText[]=[
  ["RETRIEVAL MISS · 从 Retriever Run 定位并补充分组评测","RETRIEVAL MISS · isolate Retriever Run, then add slice regression"],
  ["TOOL TIMEOUT · 排查真实副作用与幂等重试，发布保持 HOLD","TOOL TIMEOUT · reconcile side effects and retries; release stays HOLD"],
  ["SAFETY REGRESSION · 安全违规阻断发布，平均分不能抵消","SAFETY REGRESSION · critical authorization failures block release"],
 ];
 return <GraphCanvas id="trace-eval" en={en} desktop={traceLayout(false,scenario)}
   mobile={traceLayout(true,scenario)} summary={labels[scenario]}/>;
}

const planes:readonly Model[]=[
 {id:"customer",title:["客户 / Workflow","Customer / workflow"],detail:["用户 · SSO · 审批 UI","User · SSO · approvals"],kind:"source"},
 {id:"control",title:["控制平面","Control plane"],detail:["策略 · 工具许可 · 预算","Policy · tool rights · budget"],kind:"gate"},
 {id:"data",title:["数据平面","Data plane"],detail:["CDC → Bronze / Silver / Gold","CDC → Bronze / Silver / Gold"],kind:"store"},
 {id:"execution",title:["执行平面","Execution plane"],detail:["SQL / Exact / 证据核验","SQL / exact / grounding"]},
 {id:"operations",title:["证据 / 运维平面","Evidence / operations"],detail:["Trace · Eval · Rollback","Trace · eval · rollback"],kind:"terminal"},
];
const readGate:Model={id:"read-gate",title:["B4 读取授权","B4 · Read ACL"],detail:["租户 / RLS / Source","Tenant · RLS · source"],kind:"gate"};
const writeGate:Model={id:"write-gate",title:["B6 写入审批","B6 · Write approval"],detail:["Host + 人工确认","Host + human approval"],kind:"gate"};
function deliveryLayout(compact:boolean,scenario:number):GraphLayout{
 const width=compact?360:930,height=compact?930:650;
 const coord=compact?
  [[127,74],[127,188],[127,304],[127,422],[127,540],[127,780]] as const:
  [[116,126],[332,126],[548,126],[548,319],[766,319],[332,523]] as const;
 const w=compact?169:175,h=compact?79:84;
 const state=(id:string):GraphState=>
   scenario===0?(id==="write-gate"?I:A):
   scenario===1?(["customer","control","data"].includes(id)?A:id==="read-gate"?B:I):
   id==="write-gate"?B:A;
 const byId:Record<string,readonly [number,number]>={
   customer:coord[0],control:coord[1],data:coord[2],
   "read-gate":coord[3],execution:coord[4],operations:coord[5],
   "write-gate":compact?[269,659]:[766,508],
 };
 const nodes=[...planes,readGate,writeGate].map(p=>n(p,byId[p.id][0],byId[p.id][1],
   compact&&p.id==="write-gate"?143:w,p.id==="write-gate"&&compact?71:h,state(p.id)));
 const E=(id:string,from:string,to:string,st:GraphState=I,extra:Partial<GraphEdgeData>={})=>
   e(id,from,to,st,extra);
 const steps:readonly [string,string,GraphState][]=[
   ["customer","control",A],["control","data",A],
   ["data","read-gate",scenario===1?B:A],
   ["read-gate","execution",scenario===1?I:A],
   ["execution","operations",scenario===1?I:A],
 ];
 const edges=steps.map(([from,to,st],i)=>E("plane-"+i,from,to,st,
    compact?{fromPort:"bottom",toPort:"top"}:
    {fromPort:i===2?"bottom":i===4?"bottom":"right",
     toPort:i===2?"top":i===4?"right":"left",
     ...(i===4?{via:[[766,523]]}:{})}));
 edges.push(E("write-approval","execution","write-gate",scenario===2?B:I,
  compact?{kind:"branch",fromPort:"bottom",toPort:"top",via:[[127,606],[269,606]]}:
    {kind:"branch",fromPort:"bottom",toPort:"top"}));
 edges.push(E("operations-feedback","operations","control",scenario===0?A:I,
  compact?{kind:"return",fromPort:"left",toPort:"left",
    via:[[13,780],[13,188]]}:
    {kind:"return",fromPort:"left",toPort:"bottom",
     via:[[235,523],[235,240],[332,240]]}));
 return {width,height,nodes,edges,
  notes:compact?[]:[{x:462,y:48,text:["五个责任平面 + 两个显式的业务 Gate","FIVE RESPONSIBILITY PLANES · TWO TRUST GATES"]}]};
}
export function FdeArchitectureGraph({scenario,en}:{scenario:number;en:boolean}){
 const labels:readonly GraphText[]=[
  ["AUTHORIZED · 策略与数据边界满足后才进入受控执行","AUTHORIZED · only governed facts reach execution and review"],
  ["B4 DENIED · 越权读取在受信系统边界阻断","B4 DENIED · cross-tenant fetch blocked at the trusted gate"],
  ["B6 DENIED · 模型建议不是执行写操作的权限","B6 DENIED · LLM output never authorizes a real side effect"],
 ];
 return <GraphCanvas id="fde" en={en} desktop={deliveryLayout(false,scenario)}
   mobile={deliveryLayout(true,scenario)} summary={labels[scenario]}/>;
}
