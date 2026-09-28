import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {fileURLToPath} from "node:url";
import {WebSocketServer} from "ws";

const __filename=fileURLToPath(import.meta.url),__dirname=path.dirname(__filename),ROOT=path.resolve(__dirname,"..");
const PORT=Number(process.env.PORT||8787),HOST=process.env.HOST||"0.0.0.0";
const STATE_FILE=process.env.STATE_FILE||path.join(__dirname,"multiplayer-state.json");
const INVITE=process.env.MULTIPLAYER_INVITE_CODE||"",DRIVE_KEY=process.env.DRIVETEXAS_API_KEY||"";
const MAX_BODY=128*1024,MAX_LOG=300,rooms=load();

function emptyRoom(id){return{id,revision:0,projects:[],tasks:[],decisions:[],evidence:[],chat:[],handoffs:[],activity:[],presence:[]}}
function load(){try{return JSON.parse(fs.readFileSync(STATE_FILE,"utf8"))}catch{return{}}}
let saveTimer;function save(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{const copy={};for(const[id,r]of Object.entries(rooms))copy[id]={...r,presence:[]};fs.writeFileSync(STATE_FILE,JSON.stringify(copy,null,2))},120)}
function safe(v,n=4000){return String(v??"").replace(/[\u0000-\u001f\u007f]/g," ").slice(0,n)}
function id(){return crypto.randomUUID()}
function headers(extra={}){return{"X-Content-Type-Options":"nosniff","Referrer-Policy":"same-origin","Permissions-Policy":"camera=(), microphone=(), geolocation=()","Cross-Origin-Opener-Policy":"same-origin","Cross-Origin-Resource-Policy":"same-origin","Content-Security-Policy":"default-src 'self'; connect-src 'self' ws: wss: https://api.drivetexas.org https://esm.run https://cdn.jsdelivr.net https://huggingface.co https://raw.githubusercontent.com; script-src 'self' 'wasm-unsafe-eval' https://esm.run https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data:; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'self'","Cache-Control":"no-cache",...extra}}
function json(res,status,obj){res.writeHead(status,headers({"Content-Type":"application/json; charset=utf-8"}));res.end(JSON.stringify(obj))}
function mime(p){return p.endsWith(".html")?"text/html; charset=utf-8":p.endsWith(".js")?"text/javascript; charset=utf-8":p.endsWith(".css")?"text/css; charset=utf-8":p.endsWith(".json")||p.endsWith(".webmanifest")?"application/json; charset=utf-8":p.endsWith(".png")?"image/png":"application/octet-stream"}
function serve(req,res,u){let pathname=decodeURIComponent(u.pathname);if(pathname==="/")pathname="/index.html";const p=path.resolve(ROOT,"."+pathname);if(!p.startsWith(ROOT)){res.writeHead(403,headers());return res.end("Forbidden")}fs.stat(p,(err,st)=>{if(err||!st.isFile()){const f=path.join(ROOT,"index.html");fs.readFile(f,(e,d)=>{if(e){res.writeHead(404,headers());res.end("Not found")}else{res.writeHead(200,headers({"Content-Type":"text/html; charset=utf-8"}));res.end(d)}});return}res.writeHead(200,headers({"Content-Type":mime(p),"Cache-Control":p.endsWith("service-worker.js")?"no-cache":"public, max-age=300"}));fs.createReadStream(p).pipe(res)})}
function allowedKey(u){return!INVITE||u.searchParams.get("key")===INVITE}
function normalize(type,p,m){const base={ts:new Date().toISOString(),clientId:m.clientId,name:m.name,domain:m.domain};
 if(type==="chat")return{...base,id:safe(p.id,80)||id(),text:safe(p.text,4000)};
 if(type==="task:create")return{...base,id:safe(p.id,80)||id(),title:safe(p.title,500),domain:safe(p.domain,80),owner:safe(p.owner,120),status:"todo",createdBy:m.name};
 if(type==="task:update")return{id:safe(p.id,80),status:["todo","doing","blocked","done"].includes(p.status)?p.status:"todo",owner:safe(p.owner,120),updatedBy:m.name,ts:base.ts};
 if(type==="decision:create")return{...base,id:safe(p.id,80)||id(),text:safe(p.text,2000),status:"proposed",proposedBy:m.name};
 if(type==="decision:update")return{id:safe(p.id,80),status:["proposed","accepted","needs-review","superseded"].includes(p.status)?p.status:"needs-review",updatedBy:m.name,ts:base.ts};
 if(type==="evidence:add")return{...base,id:safe(p.id,80)||id(),claim:safe(p.claim,4000),grade:/^[A-F]$/.test(p.grade)?p.grade:"F",url:safe(p.url,1200)};
 if(type==="project:create")return{...base,id:safe(p.id,80)||id(),title:safe(p.title,500),location:safe(p.location,300),domain:safe(p.domain,80),owner:safe(p.owner,120),problem:safe(p.problem,5000),intervention:safe(p.intervention,5000),stage:"idea",createdBy:m.name};
 if(type==="project:update")return{id:safe(p.id,80),stage:["idea","evidence","pilot","delivery","evaluate"].includes(p.stage)?p.stage:"idea",owner:safe(p.owner,120),updatedBy:m.name,ts:base.ts};
 if(type==="handoff:create")return{...base,id:safe(p.id,80)||id(),fromDomain:m.domain,toDomain:safe(p.toDomain,80),text:safe(p.text,4000)};
 return null}
function apply(r,type,p){if(type==="chat")r.chat.push(p);if(type==="task:create")r.tasks.push(p);if(type==="task:update"){const x=r.tasks.find(x=>x.id===p.id);if(x)Object.assign(x,p)}if(type==="decision:create")r.decisions.push(p);if(type==="decision:update"){const x=r.decisions.find(x=>x.id===p.id);if(x)Object.assign(x,p)}if(type==="evidence:add")r.evidence.push(p);if(type==="project:create")r.projects.push(p);if(type==="project:update"){const x=r.projects.find(x=>x.id===p.id);if(x)Object.assign(x,p)}if(type==="handoff:create")r.handoffs.push(p);r.revision++;r.activity.push({id:id(),type,payload:p,ts:new Date().toISOString()});r.activity=r.activity.slice(-MAX_LOG);r.chat=r.chat.slice(-500);r.evidence=r.evidence.slice(-500);r.handoffs=r.handoffs.slice(-300);save()}

const server=http.createServer(async(req,res)=>{const u=new URL(req.url,`http://${req.headers.host||"localhost"}`);
 if(u.pathname==="/api/health")return json(res,200,{ok:true,service:"Texas Mobility Resilience OS",time:new Date().toISOString(),rooms:Object.keys(rooms).length});
 if(u.pathname==="/api/adapters")return json(res,200,{drivetexas:{configured:!!DRIVE_KEY,source:"https://api.drivetexas.org/api-docs"},multiplayer:{enabled:true,inviteRequired:!!INVITE},webllm:{clientSide:true}});
 if(u.pathname==="/api/live/drivetexas"){if(!DRIVE_KEY)return json(res,503,{error:"DRIVETEXAS_API_KEY is not configured on this server."});const format=["geojson","csv"].includes(u.searchParams.get("format"))?u.searchParams.get("format"):"geojson";try{const r=await fetch(`https://api.drivetexas.org/api/conditions.${format}?key=${encodeURIComponent(DRIVE_KEY)}`,{headers:{"User-Agent":"Texas-Mobility-Resilience-OS/1.0"}});if(!r.ok)return json(res,502,{error:`DriveTexas returned HTTP ${r.status}`});if(format==="geojson"){const d=await r.json();return json(res,200,{retrievedAt:new Date().toISOString(),featureCount:Array.isArray(d.features)?d.features.length:null,data:d})}const t=await r.text();res.writeHead(200,headers({"Content-Type":"text/csv; charset=utf-8"}));return res.end(t)}catch(e){return json(res,502,{error:safe(e.message,500)})}}
 return serve(req,res,u)});

const wss=new WebSocketServer({server,path:"/ws",maxPayload:MAX_BODY});
function broadcast(roomId,msg){const data=JSON.stringify(msg);for(const c of wss.clients)if(c.readyState===1&&c.meta?.room===roomId)c.send(data)}
function presence(roomId){const r=rooms[roomId];if(!r)return;const a=[...wss.clients].filter(c=>c.readyState===1&&c.meta?.room===roomId).map(c=>({clientId:c.meta.clientId,name:c.meta.name,role:c.meta.role,domain:c.meta.domain}));r.presence=a;broadcast(roomId,{type:"presence",presence:a})}
wss.on("connection",(ws,req)=>{const u=new URL(req.url,`http://${req.headers.host||"localhost"}`);if(!allowedKey(u)){ws.close(1008,"Invalid invite key");return}const roomId=safe(u.searchParams.get("room"),80)||"texas-mobility",clientId=safe(u.searchParams.get("clientId"),80)||id(),name=safe(u.searchParams.get("name"),80)||"Guest",role=safe(u.searchParams.get("role"),80)||"participant",domain=safe(u.searchParams.get("domain"),80)||"mobility";const room=rooms[roomId]||(rooms[roomId]=emptyRoom(roomId));ws.meta={room:roomId,clientId,name,role,domain,times:[]};ws.send(JSON.stringify({type:"snapshot",room:{...room,presence:room.presence||[]},seq:room.revision}));presence(roomId);
 ws.on("message",raw=>{const now=Date.now();ws.meta.times=ws.meta.times.filter(t=>now-t<10000);if(ws.meta.times.length>80){ws.close(1013,"Rate limit");return}ws.meta.times.push(now);let m;try{m=JSON.parse(raw.toString())}catch{return}const type=safe(m.type,80),p=normalize(type,m.payload||{},ws.meta);if(!p)return;apply(room,type,p);broadcast(roomId,{type:"event",seq:room.revision,event:{type,payload:p}})});ws.on("close",()=>presence(roomId))});
server.listen(PORT,HOST,()=>console.log(`Texas Mobility Resilience OS on http://${HOST}:${PORT}`));
