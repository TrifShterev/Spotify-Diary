---
name: delegate-fullstack-task
description: "Splits a full-stack task between parallel backend and frontend sub-agents. States any synchronization points, such as the API contract, before delegating. Use when the user asks to delegate, parallelize, or split a full-stack feature between backend and frontend sub-agents, or invokes this skill by name."
---

# Delegate a full-stack task to backend and frontend sub-agents

You are the main agent. You don't write the feature code yourself. You plan the work, define how the two parts fit together, delegate, and integrate the results.

Follow these five steps in order. Don't skip any.

1. Analyze the task.
2. Split it into two parts.
3. State the synchronization points.
4. Delegate to two sub-agents in parallel.
5. Integrate and verify.

## 1. Analyze the task

Read the code the task touches before you plan. Typical places:

- Backend: `backend/src/app.ts`, `backend/src/routes/api.ts`, `backend/src/errorHandlerGlobal.ts`, `backend/src/spotify.ts`, `backend/test/`
- Frontend: `frontend/src/App.tsx`, `frontend/src/pages/`, `frontend/src/components/`, `frontend/vite.config.ts`

If the task is ambiguous in a way that changes the design, ask the user now. Sub-agents can't ask the user anything.

If the task touches only one side, this skill doesn't apply. Tell the user, then do the work directly.

## 2. Split the task into two parts

Split into exactly two parts, owned by directory:

| Part     | Owns        | Must not edit                |
| -------- | ----------- | ---------------------------- |
| Backend  | `backend/`  | anything outside `backend/`  |
| Frontend | `frontend/` | anything outside `frontend/` |

Files outside both directories (`README.md`, root config, `.claude/`, `.agents/`) belong to you. Edit them yourself in step 5.

Describe each part as a list of concrete deliverables (routes, modules, components, tests), not a copy of the whole task.

## 3. State the synchronization points

Before you spawn any sub-agent, write the split and a **Synchronization plan** in your reply to the user. The plan lists everything both parts must agree on. The sub-agents run at the same time and never talk to each other, so anything the plan leaves open, they will each decide differently.

Go through every category:

- **API contract.** For each new or changed endpoint: method, path, auth, query parameters, request body, success status and response body, and every error status with its body. Write the shapes as TypeScript types. Both sub-agents copy them verbatim.
- **Approach decisions.** Where work happens when either side could do it: filtering, sorting, pagination, aggregation, date and time zone handling, validation, caching.
- **Naming and formats.** Field names, enum values, date format, `null` versus omitted fields, units.
- **Config and wiring.** New env vars, new Vite proxy paths (only `/api` is proxied today), new dependencies.

Keep the existing conventions unless the task requires otherwise:

- Endpoints live under `/api`, require a Clerk session, and are called same-origin. No CORS, no bearer tokens.
- Errors are JSON `{ "error": "<snake_case_code>" }`, produced only by `backend/src/errorHandlerGlobal.ts`. Existing codes: `401 unauthenticated`, `403 spotify_not_connected`, `502 spotify_error`, `500 internal_error`.
- JSON fields are camelCase. Missing values are `null`, not omitted (see `GET /api/me`).
- Dates are ISO 8601 strings.

If nothing needs synchronizing, say so in one line and give the reason, for example: "No synchronization needed: the frontend only restyles data from the existing `GET /api/me` response."

Use this format:

~~~md
## Task split

**Backend** (`backend/`)
- ...

**Frontend** (`frontend/`)
- ...

## Synchronization plan

### API contract

`GET /api/top-tracks?range=short_term|medium_term|long_term&limit=1..50`
Auth: Clerk session (same-origin cookie)

200:
```ts
interface TopTracksResponse {
  range: 'short_term' | 'medium_term' | 'long_term';
  tracks: { id: string; name: string; artists: string[]; imageUrl: string | null }[];
}
```

Errors:
- 400 `{ "error": "invalid_query" }`: `range` or `limit` is invalid
- 401, 403, 502: as existing

### Approach decisions
- ...

### Naming and formats
- ...

### Config and wiring
- None.
~~~

The plan is the contract. Once the sub-agents start, it changes only through the change process in step 4.

If the plan contains a product decision that belongs to the user, ask before you delegate. Otherwise continue straight to step 4. Stating the plan is not asking for permission.

## 4. Delegate to two sub-agents in parallel

Spawn both sub-agents in the same message: two Agent tool calls, `subagent_type: general-purpose`, running in the background. Don't use worktree isolation. The parts own separate directories, so they can't conflict, and step 5 needs both changes in one tree.

Each prompt must stand on its own, because the sub-agent hasn't seen this conversation. Fill in this template:

```md
You are the {BACKEND | FRONTEND} sub-agent for a full-stack task in the Spotify Diary repo: a React + Vite SPA in `frontend/` and an Express 5 API in `backend/`, both TypeScript on Node 24.
A separate {frontend | backend} sub-agent implements the other half in parallel. You can't talk to it. The synchronization plan below is how the two halves fit together.

## Overall task
{One paragraph on the whole feature, for context.}

## Your part
{The deliverables for this part, from the task split.}

## Synchronization plan (binding)
{The full plan, pasted verbatim.}

## Rules
- Edit files only under `{backend/ | frontend/}`. Don't touch anything else.
- Implement the contract exactly: same paths, fields, types, status codes, and error codes. Don't add, rename, or drop fields.
- If the contract is impossible or clearly wrong for your side, don't work around it. Stop and return a report that starts with `CONTRACT_CHANGE_REQUEST`, with the problem and the change you propose.
- Load the `code-style-best-practices` skill before writing code, and follow it. Match the surrounding code.
- {Side-specific rules, see below.}
- Don't commit.

## Report
When you're done, reply with:
1. Files changed, with one line each on what changed.
2. Contract conformance: for each endpoint in the plan, confirm it matches, or list the deviations.
3. Verification: each command you ran and its result. Quote the output of anything that failed.
4. Anything left open that the main agent should know about.
```

Side-specific rules for the **backend** sub-agent:

- Add routes to `backend/src/routes/api.ts`, or to a new router mounted under `/api` in `backend/src/app.ts`.
- For errors, throw a typed error and map it in `backend/src/errorHandlerGlobal.ts`. Don't write error responses in route handlers.
- Call Spotify through `spotifyFetch` in `backend/src/spotify.ts`.
- Add `node:test` tests in `backend/test/`, following `backend/test/me.test.ts`.
- Verify with `npm run typecheck` and `npm test` in `backend/`.

Side-specific rules for the **frontend** sub-agent:

- The backend part may not exist yet while you work. Code against the contract, not against a running server. Declare frontend response types that match the contract types.
- Call `/api/...` same-origin with `fetch`, like `frontend/src/components/CurrentUser.tsx`. Handle the loading, error, and ready states, and map every error status in the contract to a user-facing message.
- Add Cypress component tests next to the components as `*.cy.tsx`. Stub the API with `cy.intercept` using payloads from the contract, including the error statuses. Use the `cypress-author` skill.
- Cover every significant visual change with image snapshots, following the `visual-regression-tests` skill. New and updated baseline images are part of the deliverable.
- Verify with `npm run typecheck` and `npm run cy:run:component:strict` in `frontend/`.

After spawning, tell the user both sub-agents are running and what each one owns. Then wait for their completion notifications. Don't poll, and don't predict their results.

### Contract change requests

When a sub-agent returns `CONTRACT_CHANGE_REQUEST`:

1. Decide on the change. Ask the user if it's a product decision.
2. State the change to the user explicitly, as a diff against the plan: what it was, what it is now, and why.
3. Send the updated contract to **both** sub-agents with SendMessage: the requester so it resumes, the other so it adapts. Do this even if the other one has already finished.

Never let one side diverge from the contract without the other side knowing.

## 5. Integrate and verify

After both sub-agents report:

1. Read both reports and resolve the open items.
2. Check conformance yourself instead of trusting the reports. Compare the backend handler's response fields, status codes, and error codes with the frontend types and error handling, field by field, against the plan.
3. Run every check:
   - In `backend/`: `npm run typecheck` and `npm test`
   - In `frontend/`: `npm run typecheck` and `npm run cy:run:component:strict`
4. Fix small integration mismatches yourself. Send larger ones back to the owning sub-agent with SendMessage.
5. Update `README.md` with new endpoints, env vars, or scripts.

Then report to the user:

- What each part delivered.
- The final contract, if it changed during the run.
- The check results, quoting any failures.
- Anything still open.

Don't commit unless the user asks.
