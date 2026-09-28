# Security & Privacy

- No generic URL proxy; avoids creating an SSRF relay.
- DriveTexas credential remains server-side.
- WebSocket payload size and string fields are bounded.
- Shared text is escaped before rendering.
- Baseline CSP and security headers are sent by the included server.
- Room state is not end-to-end encrypted.
- Shared invite code is not identity/RBAC; production needs TLS + organizational auth/SSO.
- Do not put private student home locations, precise recurring medical trips or similarly sensitive travel patterns in shared rooms.
- Add database backups, retention, moderation, audit and incident-response controls in production.
