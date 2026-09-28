# Texas Mobility & Transportation Resilience OS

A public-ready Texas mobility suite for households, commuters, planners, engineers, transit and freight operators, schools, healthcare organizations, accessibility advocates, emergency managers, employers, local governments, researchers and cross-domain partners.

The governing idea is simple:

> Mobility is not merely vehicle movement. It is the ability of people and goods to reach what matters safely, affordably, reliably, accessibly and with enough redundancy to keep functioning when conditions change.

## Included capabilities

### Texas evidence layer
The release ships with a **dated 2026-09-28 evidence snapshot**, not timeless hard-coded claims. It includes source/provenance records for:

- TxDOT 2027 Unified Transportation Program;
- Connecting Texas 2050;
- FY2026 pedestrian and bicycle investments;
- FHWA National Bridge Inventory;
- DOE Alternative Fuels Data Center;
- TxDOT 2025 crash and work-zone statistics;
- TxDOT freight-planning and rail-grade-separation information;
- FTA National Transit Database;
- TxDOT hearings/meetings;
- WebLLM documentation.

Evidence classes remain explicit:

- **A** — official measured data
- **B** — peer-reviewed research
- **C** — institutional analysis
- **D** — preliminary evidence
- **E** — modeled scenario
- **F** — conceptual proposal

### Cross-domain collaboration
The operating system links transportation with:

- housing;
- health;
- education;
- food;
- water/flooding;
- energy;
- resilience/emergency management;
- accessibility;
- freight/economy;
- environmental conditions.

Shared-room handoffs make those dependencies explicit rather than burying them in separate departments.

### Functional multiplayer
Run the included Node server to enable same-room synchronization for:

- participant presence;
- shared chat;
- tasks and owners;
- decisions and decision status;
- evidence ledger;
- project portfolio;
- cross-domain handoffs.

The client keeps an IndexedDB **offline outbox**. Actions created while disconnected can be sent after reconnection.

### Project Commons
Projects move through:

`idea → evidence → pilot → delivery → evaluate`

Each room can coordinate multiple projects across mobility, health, education, freight, resilience, accessibility and other domains.

### Local tools
Included transparent calculators cover:

- household transportation cost;
- transportation burden;
- true commute time/cost;
- housing + transportation location cost;
- EV annual energy/cost/charging time;
- fleet daily energy/depot load/charger-count heuristic;
- simplified scenario modeling;
- transit access/service-profile heuristic;
- road-safety site screening.

These are planning tools. Modeled output is not presented as measured fact.

### PWA / offline
The hosted application includes:

- install manifest;
- 192×192 and 512×512 icons;
- versioned service worker;
- same-origin core precaching;
- navigation fallback;
- IndexedDB;
- JSON export/import;
- local SHA-256 integrity checks;
- honest labeling of online-only data.

A service worker is **not** claimed to work under `file://`.

### WebLLM
The Local AI module uses the documented browser WebLLM path:

`https://esm.run/@mlc-ai/web-llm`

Default model ID:

`Llama-3.2-1B-Instruct-q4f16_1-MLC`

Important boundaries:

- WebGPU is required.
- The first model download may be large.
- Hardware/browser compatibility varies.
- Inference runs locally after a compatible model is loaded.
- No hidden server-AI fallback is substituted if local AI cannot load.
- Room/evidence context is added to the local system prompt to improve multidisciplinary synthesis.

## Run locally

Requires **Node.js 20+**.

```bash
npm install
npm start
```

Then open:

```text
http://localhost:8787
```

For local-network collaboration, other devices can use the host computer's LAN address if firewall rules permit it.

## Environment

Copy values from `.env.example` into your runtime environment.

```text
PORT=8787
HOST=0.0.0.0
MULTIPLAYER_INVITE_CODE=
DRIVETEXAS_API_KEY=
```

### Multiplayer invite code
Set `MULTIPLAYER_INVITE_CODE` to require a shared room-server key.

This is a useful pilot safeguard, **not full authentication or role-based authorization**.

### DriveTexas
If you have authorized DriveTexas API access, set `DRIVETEXAS_API_KEY` on the server.

The browser calls:

`/api/live/drivetexas`

The credential stays server-side and is not embedded in the public app.

## Production deployment

For an institutional/public production deployment:

1. terminate TLS/HTTPS in front of Node;
2. support WebSocket upgrades;
3. add real identity/SSO;
4. add server-side RBAC and room/project authorization;
5. replace the JSON room store with PostgreSQL, SQLite or another durable database appropriate to expected concurrency;
6. implement database backups and recovery;
7. set data-retention and moderation policies;
8. add audit/event retention appropriate to the organization;
9. pin/test third-party dependencies;
10. review CSP and external WebLLM/model origins before release.

The included room server is functional for pilots and working groups, but deliberately does not pretend to be an enterprise identity platform.

## Static-only deployment

If hosted as static HTTPS files only:

**Works**
- PWA shell;
- evidence snapshot;
- calculators;
- IndexedDB;
- JSON portability;
- WebLLM where supported.

**Does not work**
- multiplayer room synchronization;
- presence;
- `/api/*` server adapters;
- server-held DriveTexas credentials.

## Direct-file fallback

`legacy-standalone.html` preserves the prior standalone edition when it was available during bundle creation. It is the preferred fallback when the app must be opened directly with `file://`.

## Repository map

```text
texas_mobility_resilience_suite/
├── index.html
├── legacy-standalone.html
├── manifest.webmanifest
├── service-worker.js
├── offline.html
├── package.json
├── .env.example
├── Dockerfile
├── LICENSE
├── ATTRIBUTIONS.md
├── SHA256SUMS.json
├── README.md
├── assets/
│   ├── css/app.css
│   ├── icons/
│   │   ├── icon-192.png
│   │   └── icon-512.png
│   └── js/
│       ├── data.js
│       ├── db.js
│       ├── calculators.js
│       ├── collab.js
│       ├── ai.js
│       └── app.js
├── data/
│   ├── sources.json
│   └── texas-baseline.json
├── server/
│   ├── server.js
│   └── multiplayer-state.json
├── docs/
│   ├── ARCHITECTURE.md
│   ├── SECURITY.md
│   └── DEPLOYMENT.md
└── tests/
    └── smoke.mjs
```

## Privacy

Mobility data can disclose sensitive patterns. Do not put exact private home locations, individual student home locations, recurring medical-trip details or other unnecessary sensitive travel patterns into shared rooms.

Local-only information remains on the device unless the user deliberately sends it to a room or exports it.

## Zero-Harm / Anti-Inversion

The suite exists to improve:

- access;
- safety;
- affordability;
- reliability;
- accessibility;
- resilience;
- mobility choice;
- cross-domain coordination.

It must not be used to:

- route around official closures;
- encourage unsafe travel;
- expose sensitive travel patterns;
- rank people by mobility status;
- optimize speed at the expense of safety;
- conceal uncertainty or stale data.

## Attribution

Systems architecture/concept:

**Ricky Foster + Navi**  
**Planetary Restoration Archive**

Third-party datasets, APIs, model artifacts, research and software retain their original attribution, license and terms.
