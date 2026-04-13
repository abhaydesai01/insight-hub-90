/**
 * MongoDB layout (database from `MONGODB_URI`, e.g. …/policypoll):
 *
 * | Collection       | Purpose |
 * |------------------|---------|
 * | `admins`         | Dashboard operators: email, password hash, profile, optional `role`. |
 * | `sessions`       | Live rooms: `code`, `title`, `description`, `isActive`, `participantCount`, `createdAt`, `createdBy` → Admin. |
 * | `polls`          | Questions per session: `sessionId`, `pollId` (FE `poll.id`), `type`, `options[]`, `isActive`. No votes stored here. |
 * | `votes`          | Anonymous ballots: `sessionId`, `pollId`, `participantId` (JWT subject), `value`, timestamps. Unique (`sessionId`,`pollId`,`participantId`). |
 * | `session_joins`  | Audit row each time someone calls POST …/join: `sessionId`, `participantId`, `joinedAt`. |
 *
 * The HTTP API still returns the nested `Session` + `polls[]` + `responses` record shape the React app expects; assembly is in `lib/sessionAssembly.ts`.
 */
import "./models/Admin.js";
import "./models/Session.js";
import "./models/Poll.js";
import "./models/Vote.js";
import "./models/SessionJoin.js";
