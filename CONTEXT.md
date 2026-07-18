# Uplink

Local-first personal repository of conversations from AI chat platforms. Uplink owns the user's Evidence and normalized Conversations; it does not replace the platforms themselves. Cross-conversation topic aggregation and background packs are out of this context — later data-use concerns, not Repository responsibilities.

## Language

**Platform**:
An AI chat product the user converses with (e.g. ChatGPT, Gemini, 豆包, 腾讯元宝). Conversations are always attributed to exactly one Platform.
_Avoid_: Agent (as a domain noun), Provider, Service, Source (when meaning the product)

**Conversation**:
One thread on a single Platform, identified by that Platform's conversation identity when available. Otherwise the Repository assigns a stable synthetic conversation id (best-effort from origin, URL/DOM clues, and early message fingerprints). Branches and regenerated answers belong to the same Conversation as a message graph; a new Platform thread is a new Conversation. Identity is `(Platform, conversationId)` — login identity is not part of the key. First-version Import/Capture must preserve the currently visible branch; exhausting every side branch is not required for success.
_Avoid_: Session, Chat, Thread (as domain nouns); Topic-level or cross-platform groupings (those are not Conversations); Account (as a domain noun); refusing Capture solely because the Platform exposes no native conversation id

**Repository**:
The local filesystem root that durably stores Evidence, normalized Conversations, Capture Profiles, Attachments, and an Inbox. A Repository exists independently of which device currently points at it. It is plain filesystem data — first version has no application-level encryption. First version does not offer user deletion of committed Evidence, Conversations, or Messages.
_Avoid_: Archive (as a domain noun; product nickname only), Warehouse, Vault, Library; treating the Repository as an encrypted vault

**Binding**:
The device-level association that points this machine at exactly one Repository. `init` and `rebind` change the Binding; they do not move Repository data. At most one Binding is active per device.
_Avoid_: Workspace, Project, Active archive; treating rebind as data migration

**Inbox**:
A drop zone inside the Repository for official export packages waiting to be turned into Imports. `ingest` scans the Inbox, creates Imports from recognized packages, and moves handled files to a processed area by default rather than deleting them.
_Avoid_: Upload folder, Queue (as domain nouns); treating Inbox contents as already-committed Evidence

**Import**:
A batch of data taken from a Platform's official export package and committed into the Repository. An Import has its own identity and audit trail and may contribute messages to one or more Conversations. Identical source bytes (e.g. same zip SHA-256) share one Evidence copy — a repeat Import is skipped by default; an explicit reparse rebuilds projections and records a new processing version still citing that Evidence.
_Avoid_: Upload, Sync, Ingest (as a domain noun); duplicating Evidence for byte-identical sources

**Capture**:
A batch of data taken from a Platform's web UI via the browser extension and Bridge. A Capture has its own identity, audit trail, and completeness status (`complete`, `probably_complete`, `partial`, or `failed`). Before commit it lives in Staging; only a successful commit makes its Evidence and projections durable Repository content. Partial Captures may still contribute Messages once committed; completeness lives on the Capture, not on the Conversation. Failed Captures do not commit normalized Conversations/Messages.
_Avoid_: Scrape, Crawl, Record (as domain nouns); treating Capture as a subtype of Import; treating incompleteness as a Conversation property

**Staging**:
The pre-commit holding area for an in-progress Capture (chunked payloads awaiting validation). Resume continues the same Capture transaction; a failed commit must not leave partial formal Repository content.
_Avoid_: Temp, Cache, Draft (as domain nouns); treating Staging as a user-facing product surface

**Message**:
A single turn in a Conversation's message graph. Prefer the Platform's message id when available; otherwise the Repository assigns a stable synthetic id derived primarily from normalized content, role, and Conversation (with weak neighborhood hints) — best-effort across Captures when the Platform has no native ids. Multiple Imports or Captures may attach Evidence to the same Message; they do not create duplicate Messages. A Message has one normalized body selected from its Evidence.
_Avoid_: Turn, Utterance, Entry; one Message per ingestion batch; treating position-only hashes as strong identity

**Evidence**:
Immutable material retained from a specific Import or Capture (export files, page fragments, API payloads, etc.) that can be cited by Messages and Conversations. Evidence is append-only; it is never edited in place. It is the source of truth — normalized Conversations and Messages are projections that can be rebuilt from Evidence when Import Adapters or Capture Profiles change.
_Avoid_: Raw (as a domain noun), Blob, Artifact (when meaning this material); treating normalized Messages as authoritative over Evidence; Index (as a domain noun — query accelerators are disposable projections only)

**Capture Profile**:
Declarative rules, stored in the Repository, that tell the extension how to extract Messages from a Platform's web pages for a given origin or URL pattern. Each supported Platform has its own Profile (e.g. 豆包 and 腾讯元宝 are separate). Built-in Platforms ship as preset Profiles; calibration may create or silently update Profiles. Persists for backup and migration; not a user-facing product surface (no profile management UX or CLI required).
_Avoid_: Scraper config, Selector set; Capture Adapter (as a domain noun); treating it as extension-only settings that never enter the Repository; conflating with Import Adapter; one shared Profile for all Platforms

**Bridge**:
The Native Messaging link through which the browser extension sends Capture data to the CLI. The Bridge is the only path that may write Capture Evidence into the Repository; the extension never writes the Repository directly.
_Avoid_: Agent, Host, Daemon (as domain nouns); extension-direct filesystem writes

**Import Adapter**:
Knowledge of how to unpack and interpret a Platform's official export format into Conversations, Messages, and Evidence. Distinct from page-extraction rules.
_Avoid_: Platform Adapter (as a single umbrella term), Parser (when meaning this concept); conflating with Capture Profile

**Attachment**:
A content-addressed binary object (image, file, etc.) stored once in the Repository and referenceable from multiple Messages. Imports should populate Attachments whenever the export provides them; Captures may attach them best-effort and must not fail the Capture if a binary cannot be retrieved.
_Avoid_: File, Blob, Media (as domain nouns); requiring Capture to guarantee binaries

## Example dialogue

> **Dev:** User rebound from `~/old-repo` to `~/new-repo`. Do we copy their Conversations over?
>
> **Expert:** No. That changes the **Binding** only. The old **Repository** stays on disk untouched; the Bridge now writes to the newly bound one.
>
> **Dev:** They Captured a 豆包 thread, then later Imported a ChatGPT export that overlaps some text. Same Message?
>
> **Expert:** Only if it's the same **Platform** and **Conversation** identity with matching Message identity. Cross-platform text similarity is not a Message merge — and topic packs are out of this context anyway.
>
> **Dev:** The Capture died midway through scrolling. Is the Conversation marked incomplete?
>
> **Expert:** The **Capture** is `partial` (or `failed` if it never committed). After a successful commit from **Staging**, Messages that landed still join the Conversation; a later Capture can add more **Evidence**.
>
> **Dev:** We shipped a better ChatGPT **Import Adapter**. Rewrite history?
>
> **Expert:** Rebuild projections from **Evidence**. Don't mutate the zip bytes.
