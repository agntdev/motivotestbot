# fix-d3deaa386f38fc8f — E1T1/E1T2 storage backend mismatch — /unsubscribe can never find subscribers

**Weight:** 0.0000 (share of project budget)
**Reward:** 0 MOTV

E1T1 (`src/handlers/E1T1.ts:32-51`) writes subscribers via `RedisSessionStorage<Subscriber>` (or `MemorySessionStorage`) with prefix `"sub:"` and key format `${chatId}:${userId}`, storing JSON-serialized `Subscriber` objects. The actual Redis key is `sub:123:456`.

E1T2 (`src/store/subscriptions.ts:37-44` + `src/handlers/E1T2.ts:6-16`) reads/deletes from a **separate** raw Redis client (a different `ioredis` instance) with key `sub:${chatId}` (bare `sub:123`) and raw string values.

These are completely incompatible key spaces and serialization formats. A subscriber created by `/subscribe` can **never** be found or removed by `/unsubscribe`. The `/unsubscribe` command is functionally broken — it will always respond "You are not subscribed." regardless of prior subscriptions.

## Dialog tests

If this task adds or changes user-facing bot behavior, author its dialog tests as a `BotSpec` JSON array in its OWN file `tests/specs/fix-d3deaa386f38fc8f.json`. NEVER edit or append to a shared `tests/specs.json` — concurrent feature PRs would conflict on it. The tests-gate globs and merges all `tests/specs/*.json`.

If this task adds a bot command, declare it in its OWN file `tests/commands/fix-d3deaa386f38fc8f.json` (a JSON array of command strings, e.g. `["/start"]`). NEVER edit or append to a shared `tests/commands.json` — same conflict reason. The tests-gate globs, merges + de-duplicates all `tests/commands/*.json`.


## Handler module

Implement this feature in its OWN file `src/handlers/fix-d3deaa386f38fc8f.ts` that default-exports a grammY `Composer`. `buildBot()` auto-loads every file in `src/handlers/` at startup, so your handler is wired up automatically. NEVER edit `src/bot.ts` — every feature editing that one shared file makes concurrent PRs conflict. The global error boundary + unknown-command fallback already live in `buildBot()`; do not re-add them.


## Implementation contract

Ship a COMPLETE, working implementation — not a stub. A task is INCOMPLETE (and will be rejected) even if it compiles and the dialog tests pass when it does any of these:
- **Stubbed code:** empty bodies, `TODO`/`FIXME`, commented-out logic, or `throw new Error("not implemented")`.
- **Fabricated data:** `Math.random()`, hardcoded sample arrays, or canned responses standing in for real computed or fetched values.
- **No in-memory data store:** a `Map`/array/module-level variable used as a database is a defect. Anything that must survive a restart (records, subscriptions, balances, schedules, settings) MUST use the toolkit's persistent storage (Redis-backed), not process memory. (The toolkit's auto-selected session storage is only for ephemeral conversation state.)
- **Broken integrations:** call external APIs against their real contract — correct endpoints, ids and params (e.g. a coin *id* like `the-open-network`, not a ticker like `TON`) — with credentials read from env. Do not invent endpoints or fake responses.
- **Dead code:** the feature's command/handler must be registered via its default-exported `Composer` in `src/handlers/<slug>.ts` (auto-loaded) and reachable from the bot's command surface.
If the spec is genuinely under-specified, implement the smallest REAL slice you can verify and note the gap — never fake behavior to make the PR look complete.
