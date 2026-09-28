# Architecture

## Layers
- Public PWA client: route registry, evidence, calculators, IndexedDB, outbox, optional WebLLM.
- Node room server: static hosting, WebSocket rooms, room persistence and explicit source adapters.
- Authoritative sources: TxDOT/DriveTexas, FHWA NBI, FTA NTD, DOE AFDC.

## Multiplayer
Events: chat, task:create/update, decision:create/update, evidence:add, project:create/update, handoff:create.
The server length-limits inputs, sequences room revisions, persists room state and broadcasts events.

## Conflict behavior
This pilot uses event order plus last-write-wins for a task/decision/project update. Institutional deployments should use a database with optimistic concurrency or CRDT semantics.

## Domain cooperation
Handoffs explicitly transfer dependencies between mobility, housing, health, education, food, water, energy, resilience, accessibility, freight, emergency, finance and governance. Evidence and decisions stay shared at the room level.
