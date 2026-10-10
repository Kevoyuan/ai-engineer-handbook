import { useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import "./graph-primitives.css";

export type GraphText = readonly [string,string];
export type GraphState = "active" | "idle" | "blocked" | "pending" | "warning";
export type GraphKind = "source" | "process" | "gate" | "store" | "terminal" | "decision";
export type GraphNodeData = {
  id:string; title:GraphText; detail?:GraphText; kind?:GraphKind; stateLabel?:GraphText;
  x:number; y:number; width:number; height?:number; state?:GraphState;
};
export type GraphEdgeData = {
  id:string; from:string; to:string;
  state?:GraphState; kind?:"forward"|"branch"|"return"|"mapping"|"optional";
  fromPort?:"top"|"right"|"bottom"|"left";
  toPort?:"top"|"right"|"bottom"|"left";
  via?:readonly (readonly [number,number])[];
  label?:GraphText; labelAt?:readonly [number,number];
};
export type GraphLayout = {
  width:number; height:number;
  nodes:readonly GraphNodeData[];edges:readonly GraphEdgeData[];
  notes?:readonly {x:number;y:number;text:GraphText}[];
};
const tx=(c:GraphText,en:boolean)=>c[en?1:0];
const ports=["top","right","bottom","left"] as const;
type Port=typeof ports[number];

function point(n:GraphNodeData,port:Port):[number,number] {
  const h=n.height??78;
  if(port==="top")return [n.x,n.y-h/2];
  if(port==="bottom")return [n.x,n.y+h/2];
  if(port==="left")return [n.x-n.width/2,n.y];
  return [n.x+n.width/2,n.y];
}
function ends(a:GraphNodeData,b:GraphNodeData,edge:GraphEdgeData):[Port,Port] {
  if(edge.fromPort&&edge.toPort)return [edge.fromPort,edge.toPort];
  const dx=b.x-a.x,dy=b.y-a.y;
  if(Math.abs(dx)>=Math.abs(dy))return dx>=0?["right","left"]:["left","right"];
  return dy>=0?["bottom","top"]:["top","bottom"];
}
function pathFor(e:GraphEdgeData,nodes:Map<string,GraphNodeData>):string {
  const a=nodes.get(e.from),b=nodes.get(e.to);
  if(!a||!b)return "";
  const [from,to]=ends(a,b,e);
  const start=point(a,from),end=point(b,to);
  const via=e.via??[];
  // CDC identity mappings must visibly cross when arrival order differs.
  // Use smooth cubic curves only for un-routed cross-lane mappings.
  if(e.kind==="mapping" && !via.length){
    const dy=end[1]-start[1];
    return `M ${start[0]} ${start[1]} C ${start[0]} ${start[1]+dy*.42}, ${end[0]} ${end[1]-dy*.42}, ${end[0]} ${end[1]}`;
  }
  const sequence:[number,number][]=[start,...via.map(p=>[p[0],p[1]] as [number,number]),end];
  if(!via.length && Math.abs(start[0]-end[0])>8 && Math.abs(start[1]-end[1])>8){
    // Orthogonal graph edge rather than a visually ambiguous diagonal arrow.
    if(from==="left"||from==="right"){
      const x=(start[0]+end[0])/2;
      sequence.splice(1,0,[x,start[1]],[x,end[1]]);
    }else{
      const y=(start[1]+end[1])/2;
      sequence.splice(1,0,[start[0],y],[end[0],y]);
    }
  }
  return sequence.map(([x,y],i)=>(i?"L":"M")+x+" "+y).join(" ");
}
function approximateEdgeLabel(e:GraphEdgeData,nodes:Map<string,GraphNodeData>):[number,number] {
  if(e.labelAt)return [e.labelAt[0],e.labelAt[1]];
  const a=nodes.get(e.from)!,b=nodes.get(e.to)!;
  return [(a.x+b.x)/2,(a.y+b.y)/2-9];
}

/**
 * Node+edge architecture graph. SVG draws only connectors, with real HTML nodes
 * above it for readable text, screen-reader labels and stable focusable controls
 * outside the graph. Coordinates and layout are sourced from authored models.
 */
export function GraphCanvas({id,desktop,mobile,en,summary}:{
  id:string; desktop:GraphLayout; mobile:GraphLayout;
  en:boolean; summary:GraphText;
}){
  const el=useRef<HTMLDivElement>(null);
  const [compact,setCompact]=useState(true);
  const uid=useId().replace(/:/g,"");
  useLayoutEffect(()=>{
    const target=el.current;
    if(!target)return;
    const update=()=>setCompact(target.clientWidth<640);
    update();
    const ro=new ResizeObserver(update);
    ro.observe(target);
    return ()=>ro.disconnect();
  },[]);
  const layout=compact?mobile:desktop;
  const m=new Map(layout.nodes.map(n=>[n.id,n]));
  const activeEdgeCount=layout.edges.filter(e=>e.state==="active"||e.state==="blocked").length;
  return <figure className="atlas-graph" ref={el} data-graph={id} data-layout={compact?"compact":"wide"}
    data-active-edges={activeEdgeCount} aria-label={tx(summary,en)}>
    <div className="atlas-graph-stage" style={{height:layout.height} as CSSProperties}>
      <svg className="atlas-graph-svg" viewBox={`0 0 ${layout.width} ${layout.height}`}
        preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <defs>
          <marker id={uid+"-active"} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 1 1 L 9 5 L 1 9 Z" fill="var(--primary)"/>
          </marker>
          <marker id={uid+"-quiet"} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 1 1 L 9 5 L 1 9 Z" fill="var(--muted-foreground)"/>
          </marker>
          <marker id={uid+"-blocked"} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 1 1 L 9 5 L 1 9 Z" fill="var(--foreground)"/>
          </marker>
        </defs>
        {layout.edges.map(edge=>{
          const state=edge.state??"idle";
          const marker=state==="active"?"-active":state==="blocked"?"-blocked":"-quiet";
          return <g key={edge.id} data-edge={edge.id} data-state={state} data-kind={edge.kind||"forward"}>
            <path className="atlas-graph-edge" d={pathFor(edge,m)}
              markerEnd={`url(#${uid}${marker})`}/>
            {edge.label&&(()=>{
              const [x,y]=approximateEdgeLabel(edge,m);
              return <g className="atlas-graph-edgetag" transform={`translate(${x} ${y})`}>
                <rect x="-37" y="-10" width="74" height="19" rx="5"/>
                <text textAnchor="middle" y="3">{tx(edge.label!,en)}</text>
              </g>;
            })()}
          </g>;
        })}
        {layout.notes?.map((note,i)=>{
          const label=tx(note.text,en);
          // Plate lane labels above mapping curves, never cross through a caption.
          const visualWidth=[...label].reduce((sum,char)=>
            sum+(/[\\u0080-\\uFFFF]/.test(char)?11:6.6),0)+24;
          return <g className="atlas-graph-annotation-group" key={i}>
            <rect className="atlas-graph-annotation-plate"
              x={note.x-visualWidth/2} y={note.y-15}
              width={visualWidth} height="22" rx="4"/>
            <text className="atlas-graph-annotation"
              x={note.x} y={note.y} textAnchor="middle">{label}</text>
          </g>;
        })}
      </svg>
      <div className="atlas-graph-nodes" role="list" aria-label={en?"Architecture nodes and their states":"架构节点及状态"}>
        {layout.nodes.map(node=>{
          const state=node.state??"idle";
          const style:CSSProperties={
            left:`${(node.x-node.width/2)/layout.width*100}%`,
            top:`${(node.y-(node.height??78)/2)/layout.height*100}%`,
            width:`${node.width/layout.width*100}%`,
            height:`${(node.height??78)/layout.height*100}%`,
          };
          const stateText:GraphText=
            state==="active"?["当前路径","Current path"]:
            state==="blocked"?["已阻断","Blocked"]:
            state==="pending"?["待核对","Review"]:
            state==="warning"?["需注意","Attention"]:["未高亮","Not highlighted"];
          return <div key={node.id} role="listitem"
            className="atlas-graph-node" data-node={node.id}
            data-kind={node.kind??"process"} data-state={state} style={style}
            aria-label={`${tx(node.title,en)}; ${tx(node.stateLabel??stateText,en)}`}>
            <strong>{tx(node.title,en)}</strong>
            {node.detail&&<small>{tx(node.detail,en)}</small>}
            <span className="atlas-graph-node-state">{tx(node.stateLabel??stateText,en)}</span>
          </div>;
        })}
      </div>
    </div>
    <figcaption className="atlas-graph-caption">{tx(summary,en)}
      <span className="atlas-graph-key">
        <span className="atlas-graph-key-active">{en?"Current flow":"当前路径"}</span>
        <span className="atlas-graph-key-blocked">{en?"Blocked branch":"阻断分支"}</span>
        <span className="atlas-graph-key-idle">{en?"Other path":"其他路径"}</span>
      </span>
    </figcaption>
    <ol className="atlas-graph-edge-list sr-only" aria-label={en?"Graph connections":"图的连接关系"}>
      {layout.edges.map(edge=><li key={edge.id}>
        {tx(m.get(edge.from)?.title??["未知","Unknown"],en)}
        {" → "}
        {tx(m.get(edge.to)?.title??["未知","Unknown"],en)}
        {" · "}
        {edge.state==="active"?(en?"active":"当前"):edge.state==="blocked"?(en?"denied":"阻断"):(en?"alternative":"其他")}
      </li>)}
    </ol>
  </figure>;
}
