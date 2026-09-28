import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,"..");
let failures=0;

function ok(cond,label){
  if(cond) console.log("OK",label);
  else { console.error("FAIL",label); failures++; }
}

const required=[
 "index.html","manifest.webmanifest","service-worker.js","offline.html",
 "assets/css/app.css","assets/js/data.js","assets/js/db.js",
 "assets/js/calculators.js","assets/js/collab.js","assets/js/ai.js",
 "assets/js/app.js","assets/icons/icon-192.png","assets/icons/icon-512.png",
 "data/sources.json","data/texas-baseline.json","server/server.js",
 "README.md","docs/ARCHITECTURE.md","docs/SECURITY.md","docs/DEPLOYMENT.md"
];

for(const f of required) ok(fs.existsSync(path.join(root,f)),`required file ${f}`);

const sources=JSON.parse(fs.readFileSync(path.join(root,"data/sources.json"),"utf8"));
const baseline=JSON.parse(fs.readFileSync(path.join(root,"data/texas-baseline.json"),"utf8"));
const index=fs.readFileSync(path.join(root,"index.html"),"utf8");
const app=fs.readFileSync(path.join(root,"assets/js/app.js"),"utf8");
const collab=fs.readFileSync(path.join(root,"assets/js/collab.js"),"utf8");
const server=fs.readFileSync(path.join(root,"server/server.js"),"utf8");
const sw=fs.readFileSync(path.join(root,"service-worker.js"),"utf8");

ok(sources.length>=12,"12+ provenance sources");
ok(baseline.facts.length>=10,"10+ dated statewide facts");
ok(baseline.crossDomain.length>=9,"cross-domain matrix");
ok(index.includes('rel="manifest"'),"PWA manifest linked");
ok(index.includes("assets/js/collab.js"),"multiplayer client linked");
ok(index.includes("assets/js/ai.js"),"WebLLM adapter linked");
ok(sw.includes("caches.open"),"service-worker cache implementation");
ok(collab.includes("new WebSocket"),"WebSocket client implementation");
ok(collab.includes('"outbox"'),"offline collaboration outbox");
ok(server.includes("WebSocketServer"),"WebSocket room server");
ok(server.includes("DRIVETEXAS_API_KEY"),"server-held DriveTexas credential");
ok(!server.includes("http://api.drivetexas.org"),"DriveTexas adapter does not downgrade to HTTP");
ok(server.includes("wasm-unsafe-eval") && server.includes("https://esm.run"),"CSP permits documented WebLLM runtime");
ok(!server.includes("targetUrl") && !server.includes("proxyUrl"),"no generic URL proxy");

const routes=[
 "command","collaboration","projects","household","transit","active",
 "accessibility","rural","school-health","safety","infrastructure",
 "evacuation","freight","energy","scenario","regional","cross-domain",
 "evidence","civic","ai","data","offline","architecture"
];
for(const r of routes) ok(app.includes(`"${r}"`)||app.includes(`${r}:`),`route ${r}`);

if(failures) process.exit(1);
console.log("Smoke tests passed.");
