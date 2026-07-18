## Problem Statement

Personal conversations with AI chat Platforms (ChatGPT, Gemini, 豆包, 腾讯元宝, and others) are scattered, hard to export completely, and at risk of platform lock-in, UI churn, or data loss. Users cannot reliably own a local, durable, auditable copy of those Conversations—especially for Platforms that lack solid official export or rely on lazy-loaded / virtualized web UIs.

## Solution

Ship **Uplink v1**: a local-first personal **Repository** of Conversations, owned by the user on disk.

- A global **CLI** initializes and binds exactly one Repository per device (**Binding**), imports official exports (**Import** + **Import Adapter** + **Inbox**), and is the only writer of Capture data via **Bridge**.
- A Chrome **extension** captures web Conversations (豆包 and 腾讯元宝 first-class) using per-Platform **Capture Profiles** (preset + silent calibration updates), sending chunked payloads through Native Messaging into **Staging**, then atomic commit.
- The Repository keeps immutable **Evidence**, content-addressed **Attachments**, rebuildable normalized Conversations/Messages, audit reports, and `verify`/`doctor` tooling.

Domain language and hard decisions are defined in `CONTEXT.md` and `docs/adr/0001`–`0016`. Product nickname “Archive” is not a domain term; **Repository** is.

## User Stories

1. As a power user, I want to install Uplink CLI globally via npm, so that `uplink` is available in any terminal.
2. As a user, I want `uplink init` in a directory to create a valid Repository (including Inbox and required layout), so that I have a durable home for my data.
3. As a user, I want the first `init` on a device to create the Binding to that Repository, so that all later commands know where to write.
4. As a user, I want at most one active Binding per device, so that Bridge and CLI never ambiguously target two Repositories.
5. As a user, I want to run CLI commands from any working directory against the bound Repository, so that I am not trapped inside the repo folder.
6. As a user, I want `uplink status` to show Binding path, Repository id/version, and health summary, so that I know what the tool is using.
7. As a user, I want `uplink verify` to detect missing/corrupt Evidence, broken references, and inconsistent projections, so that I trust the archive.
8. As a user, I want `uplink doctor` to diagnose Binding, Bridge, Node path, and extension connectivity issues, so that I can fix setup problems.
9. As a user, I want the CLI to refuse writes and not auto-create a new Repository when the Binding path is missing, so that data is not silently forked.
10. As a user, I want `uplink rebind <path>` with explicit confirmation to point at another valid Repository without migrating data, so that I can switch archives safely.
11. As a user, I want rebind to update the Bridge’s Repository target, so that Captures land in the newly bound Repository.
12. As a user, I want to drop a ChatGPT official export zip into the Inbox and run `uplink ingest`, so that Imports happen without typing long paths.
13. As a user, I want `uplink import chatgpt <file>` to Import a specified ChatGPT export, so that I can import from Downloads directly.
14. As a user, I want `uplink import gemini <file>` (and Inbox recognition) for Gemini official exports, so that both major export Platforms are covered.
15. As a user, I want Import to safely unpack exports (zip-slip resistant), so that malicious or malformed zips cannot write outside the Repository.
16. As a user, I want Import to retain original package bytes and expanded files as Evidence, so that I own the raw export forever.
17. As a user, I want Import to produce normalized Conversations and Messages with source references, so that I can browse a unified format.
18. As a user, I want Attachments from exports to be stored content-addressed and referenced from Messages, so that binaries are deduplicated.
19. As a user, I want byte-identical re-Import to be skipped by default without duplicating Evidence, so that retries are safe.
20. As a user, I want an explicit reparse of an existing Import’s Evidence to rebuild projections under a new processing version, so that Adapter upgrades fix history without rewriting raw bytes.
21. As a user, I want each Import to produce an audit report, so that I can see what was ingested and what failed.
22. As a user, I want Inbox items moved to processed (not deleted by default) after successful ingest, so that I keep the delivered files.
23. As a user, I want failed Inbox items routed to a failed area with diagnostics, so that bad packages do not block the queue silently.
24. As a user, I want Messages from the same Platform conversation identity to merge across Imports/Captures rather than duplicate, so that one Message stays one Message.
25. As a user, I want Message body conflicts resolved with Import over Capture, then completeness, then newer time, so that partial Captures do not clobber better export text.
26. As a user, I want Conversation identity `(Platform, conversationId)` without an Account concept, so that the model stays simple.
27. As a user, I want to install and manage the Native Messaging Bridge from the CLI (`bridge install|status|doctor`), so that the extension can talk to the local writer.
28. As a user, I want the Bridge to accept only allowlisted extension origins, so that random sites/extensions cannot write my Repository.
29. As a user, I want the extension to never write the Repository filesystem directly, so that all Capture commits are validated by the CLI.
30. As a user, I want the extension to show the current bound Repository path, so that I know where Captures will go.
31. As a user, I want to Capture a 豆包 Conversation from its web UI with a preset Capture Profile, so that Platforms without good export still enter my Repository.
32. As a user, I want to Capture a 腾讯元宝 Conversation with its own Capture Profile (separate from 豆包), so that each Platform has independent extraction logic.
33. As a user, I want Capture to scroll/load older messages, expand collapsed content, and survive virtualized lists, so that long histories are collected.
34. As a user, I want Capture to stream large Conversations in chunks through the Bridge into Staging, so that Native Messaging size limits do not truncate data.
35. As a user, I want Capture resume after interruption to continue the same Staging transaction, so that I do not lose progress or commit half-written formal data.
36. As a user, I want a failed Capture commit to leave no partial formal Repository content, so that verify stays clean.
37. As a user, I want Capture completeness (`complete` | `probably_complete` | `partial` | `failed`) recorded on the Capture, so that incompleteness is honest without blocking useful partial commits.
38. As a user, I want partial Captures that successfully commit to still add Messages, so that later Captures can fill gaps.
39. As a user, I want failed Captures not to commit normalized Conversations/Messages, so that broken runs do not pollute projections.
40. As a user, I want Capture Attachments best-effort (missing binaries do not fail the Capture), so that text history is not held hostage by CDN/auth failures.
41. As a user, I want first-version Capture/Import to persist at least the currently visible branch, so that regenerations/side branches are not a hard blocker.
42. As a user, I want synthetic Message ids when Platforms lack native ids (content/role/Conversation–based, best-effort), so that later Captures can merge.
43. As a user, I want synthetic Conversation ids when pages lack native thread ids (best-effort), so that Capture is not refused on those Platforms.
44. As a user, I want silent Capture Profile persistence in the Repository (no profile gallery/CLI product surface), so that calibration survives backup/migration without UX clutter.
45. As a user, I want calibration via two text anchors, highlight matches, infer message nodes, preview extraction, and optional click calibration, so that unknown or broken pages can be taught.
46. As a user, I want calibration to create/update Capture Profiles in the Repository silently, so that the next Capture uses improved rules.
47. As a user, I want Profile validation before Capture to block clearly broken selectors, so that I do not silently archive garbage.
48. As a user, I want Capture completion reports comparable to Import reports, so that every ingestion is auditable.
49. As a user, I want basic query/list of Conversations and Messages in the bound Repository from the CLI, so that I can confirm data without hand-opening JSON.
50. As a user, I want disposable query indexes that can be deleted and rebuilt, so that performance never becomes the source of truth.
51. As a user, I want the Repository to remain a plain, user-inspectable filesystem tree (no app-level encryption), so that I can backup/browse with ordinary tools.
52. As a developer/agent, I want golden fixtures for ChatGPT and Gemini exports and HTML fixtures for 豆包/元宝 Profiles, so that regressions are caught automatically.
53. As a developer/agent, I want Bridge protocol contract tests (schema, chunking, authz, staging lifecycle), so that extension and CLI stay compatible.
54. As a developer/agent, I want end-to-end CLI tests for init/bind/import/ingest/rebind/verify/doctor/bridge, so that the user-facing path cannot silently break.
55. As a developer/agent, I want browser-automated Capture E2E against fixture or recorded pages for 豆包 and 元宝 flows, so that scrolling/virtual list behavior is proven, not assumed.
56. As a developer/agent, I want fault-injection tests for Staging (kill mid-chunk, corrupt chunk, hash mismatch), so that atomicity guarantees hold under failure.
57. As a user, I want schema/version fields on Repository and normalized records, so that future migrations are possible without rewriting Evidence.

## Implementation Decisions

### Scope of “complete v1”

Implement the full first-version product goals aligned with requirements acceptance (§27) and Phases 0–5, **except** anything ruled out by ADRs:

- **In:** CLI, Binding, Repository layout, ChatGPT + Gemini Import Adapters, Inbox/ingest, Attachments, Bridge, extension, Staging, full Capture for 豆包 + 腾讯元宝 (scroll/lazy/virtual list/expand), silent Capture Profiles + calibration, verify/doctor, audit reports, basic CLI query, rebuildable projections/indexes.
- **Out:** Briefing/topic aggregation/`contexts/` product (ADR-0002), multi-device sync, multi-Binding everyday switching, Account identity, app-level encryption, user deletion of committed content, exhaustive side-branch traversal as a success requirement.

Directory entries from the long requirements doc that exist only for out-of-scope features (e.g. `contexts/`, topic indexes) are **not required** in v1 layout.

### Modules (deep modules; paths illustrative only in planning)

1. **schemas** — Shared JSON Schema / Zod for Conversation, Message, ContentBlock, Import/Capture manifests, Bridge messages, Capture Profile, uplink.json. Single source of truth for validation.
2. **repository** — Deep module owning Binding resolution, init, locks, Evidence append, Attachment store, projection write, Staging lifecycle, commit, reparse, verify. CLI and Bridge call this; they do not reimplement durability.
3. **import-chatgpt** / **import-gemini** — Import Adapters: export bytes → Evidence layout + normalized graph contributions. Invoked only through repository Import/ingest/reparse.
4. **capture-profile** — Load/validate/apply Capture Profiles (preset + Repository-stored). Per-Platform Profiles (豆包 ≠ 元宝). No separate domain “Capture Adapter”.
5. **capture-engine** — Page operations + extraction orchestration used by the extension (scroll, expand, virtual list sampling, chunking). Speaks Capture Profile + schemas.
6. **bridge** — Native Messaging host: origin allowlist, schema validation, size limits, Staging APIs via repository, small ack responses, no arbitrary FS/shell.
7. **cli** — Thin Commander/Clipanion surface: init, status, verify, doctor, rebind, ingest, import, bridge *, query/list, reparse. All durable work delegates to repository/bridge.
8. **extension** — Chrome MV3 extension: platform detect, Capture UX, calibration UX (anchors/preview/click), Bridge client, progress UI. No direct Repository writes.

### Architectural rules (from ADRs)

- Evidence is authoritative; normalized Conversations/Messages/indexes are rebuildable projections (ADR-0008).
- Only CLI writes Repository; extension only via Bridge (ADR-0004).
- Capture uses Staging before atomic commit; resume = same Capture transaction (ADR-0011).
- Message body precedence: Import > completeness > newer time (ADR-0001).
- Capture Profiles silent but in Repository; one Profile per Platform (ADR-0003, ADR-0013).
- Synthetic Message/Conversation ids when native ids missing (ADR-0007, ADR-0012).
- Attachments first-class; Capture binary retrieval best-effort (ADR-0006).
- One Binding per device; rebind does not migrate (ADR-0010).
- Idempotent Import by content hash; explicit reparse (ADR-0014).
- No user deletion of committed content in v1 (ADR-0015).
- No application-level encryption (ADR-0016).
- Visible branch sufficient for v1 success (ADR-0009).
- No Account in domain keys (ADR-0005).

### Bridge contract (behavioral)

- Typed requests only; reject unknown methods and path traversal.
- Chunked Capture upload into `captures/staging/<capture-id>/`.
- Commit validates hashes/manifest, merges Messages, writes Evidence under `raw/`, updates projections, moves Staging to completed, writes Capture report—or rolls back formal writes on failure.
- `allowed_origins` = production extension id + explicit dev ids.

### Capture Profile shape (behavioral)

Declarative selectors/rules only—no storing/executing arbitrary page JavaScript from Profiles. Presets ship for 豆包 and 腾讯元宝; calibration may update Repository copies silently.

### Tech posture

TypeScript monorepo; Node CLI; Chrome MV3 extension; filesystem Repository; disposable indexes (JSONL and/or SQLite) always rebuildable.

## Testing Decisions

### Philosophy

**Maximize confidence, ignore cost.** Prefer high seams that assert observable behavior (Repository contents, CLI stdout/exit codes, Bridge responses, extension outcomes). Also add focused module tests where a deep module’s interface is the natural place to pin Adapter/Profile/protocol rules. Do not skip browser E2E, fault injection, or golden fixtures to save time.

Good tests assert external behavior: files and records in a temp Repository, command results, protocol acks/errors, extracted message lists from fixtures—not private function call graphs.

### Seams (all required for v1)

1. **Repository seam** — Temp directories: init, Binding, Import, ingest, reparse, Staging→commit, verify, Attachment dedupe, projection rebuild, lock/failure atomicity.
2. **ChatGPT Import Adapter seam** — Golden official-export fixtures (multiple shapes/versions as available): Evidence retained, Conversations/Messages/Attachments correct, duplicate Import idempotent.
3. **Gemini Import Adapter seam** — Same rigor as ChatGPT with Gemini fixtures.
4. **Capture Profile application seam** — HTML/DOM fixtures per Platform (豆包, 元宝, plus calibration-generated Profile cases): extraction correctness, role rules, expand rules, validation failure modes.
5. **Bridge protocol seam** — Contract tests: allowlist, schema rejection, chunk ordering, size limits, Staging lifecycle, commit/rollback, resume.
6. **CLI integration seam** — Real `uplink` process against temp HOME/config + temp Repository for every user-facing command path in this spec.
7. **Extension + Capture E2E seam** — Automated browser tests driving Capture (and calibration) for 豆包 and 元宝 against recorded/fixture pages or local stubs that reproduce lazy load + virtual list; assert Staging/commit outcomes via Repository/Bridge.
8. **Fault-injection seam** — Kill mid-Capture, corrupt chunks, disk full simulation where feasible, Binding path missing, invalid Repository: no partial formal data; doctor/verify messages useful.
9. **Security seam** — Zip-slip fixtures; Bridge rejects non-allowlisted origins and path-escape payloads; extension cannot write Repository paths directly (architecture test / packaging assertions).
10. **Cross-ingestion merge seam** — Same Conversation/Message via Import then Capture (and reverse): single Message, Evidence both retained, body precedence per ADR-0001; synthetic-id Platforms covered with best-effort merge cases.

### Coverage expectations

- Golden tests for schemas and sample Repository trees (Phase 0).
- Every acceptance bullet in requirements §27.1–§27.6 mapped to at least one automated test (except where a bullet is ADR-superseded—document the skip).
- Calibration UX covered by E2E or component+fixture tests that still assert Profile bytes written into Repository and subsequent Capture behavior.
- CI runs unit/module/CLI/Bridge tests on every PR; browser E2E on every PR if stable, otherwise on main + nightly with failure blocking release.

### Prior art

Greenfield—no existing test suite. Establish fixtures under a dedicated fixtures area and keep golden outputs reviewed like code.

## Out of Scope

- Briefing / topic aggregation / background packs / `contexts/` product features (ADR-0002); Phase 6 retrieval-as-product beyond basic list/query and disposable indexes.
- Cloud sync, multi-user/team auth, multi-Repository everyday switching.
- Application-level Repository encryption; user deletion of committed Evidence/Conversations/Messages.
- Account as part of Conversation identity.
- Exhaustive traversal of all side branches as a v1 must-pass requirement.
- Replacing Platforms, auto-login, unauthorized private APIs, modifying remote Platform data.
- Coding-IDE agent session management (out of product intent).

## Further Notes

- Ubiquitous language: use `CONTEXT.md` terms (Platform, Repository, Binding, Inbox, Import, Capture, Staging, Evidence, Message, Conversation, Attachment, Bridge, Import Adapter, Capture Profile). Avoid “Agent” as a domain noun; “Archive” is product nickname only.
- Source requirements live in `docs/Uplink 多 Agent 会话归档系统需求文档.md` but **ADRs win** on conflicts (Briefing out, silent Profiles, Repository naming, etc.).
- Suggested build order remains Phase 0→5; tickets from `/to-tickets` should be tracer bullets with blocking edges, each implementable in a fresh agent context.
- Success = §27 acceptance (adjusted by ADRs) with the testing seams above green—not a partial demo of Import-only or Capture-only.
