# User Stories — ADR Vault

> **Attachment to:** [Product Requirements Document](./prd.md)
>
> **ID scheme:** `US-[DOMAIN]-[number]` — e.g., `US-AUTH-01`. IDs are stable; new stories are appended within their domain.
>
> **Personas:**
> - **user** — any authenticated person using the system
> - **author** — the authenticated user who originally created a specific ADR (used only where ownership is a meaningful system constraint)

---

## 1. Authentication (US-AUTH)

| ID | User Story | Notes |
|----|-----------|-------|
| US-AUTH-01 | As a user, I want to register with an email and password so that I can create a personal account and access ADR Vault. | ✅ Done — `feature/registration` |
| US-AUTH-02 | As a user, I want to log in with my email and password so that I can access my ADRs and the system's features. | |
| US-AUTH-03 | As a user, I want to log out so that my session is terminated and my account is protected on shared devices. | |
| US-AUTH-04 | As a user, I want to request a password reset link via my email so that I can regain access to my account if I forget my password. | |
| US-AUTH-05 | As a user, I want my session to persist across browser refreshes so that I do not have to log in repeatedly during active work. | |

---

## 2. AI Usage Tracking (US-USAGE)

| ID | User Story | Notes |
|----|-----------|-------|
| US-USAGE-01 | As a user, I want to see my current daily AI token/request usage so that I understand how much of my allowance I have consumed. | Daily usage resets at midnight; limits are defined as constants in `packages/core`. |
| US-USAGE-02 | As a user, I want to receive a visible warning when I am approaching my daily AI limit so that I can prioritise which AI actions to perform before the limit is reached. | |
| US-USAGE-03 | As a user, I want to see a clear message when I have reached my daily AI limit so that I understand why AI features are temporarily unavailable and when they will reset. | AI-dependent actions (drafting, summarisation, search) must be disabled or blocked at the application layer when the limit is hit. |
| US-USAGE-04 | As a user, I want my daily AI usage counter to reset automatically each day so that I regain access to the full AI allowance without any manual action. | |

---

## 3. ADR Management (US-ADR)

| ID | User Story | Notes |
|----|-----------|-------|
| US-ADR-01 | As a user, I want to view a list of all ADRs in the system so that I can browse and discover existing architectural decisions. | |
| US-ADR-02 | As a user, I want to filter the ADR list by status so that I can quickly find decisions in a specific state (e.g., Accepted, Deprecated). | Supported statuses: Draft, Proposed, Accepted, Deprecated, Superseded. |
| US-ADR-03 | As a user, I want to view the full detail of an ADR so that I can read its context, decision, and consequences. | The AI-generated summary is displayed prominently at the top of the detail view. |
| US-ADR-04 | As a user, I want to create an ADR manually using a WYSIWYG editor so that I can document architectural decisions in a structured, consistently formatted way. | Editor must support: H1–H5, Bold, Italic, Lists, Code Blocks, Blockquotes, Tables, and Images (via URL). |
| US-ADR-05 | As an author, I want to edit my ADR using the WYSIWYG editor so that I can refine or update the decision over time. | Only the original author may edit. Enforced via RLS. Creation method updates to `AI-generated & User-edited` if the ADR was originally AI-generated. |
| US-ADR-06 | As an author, I want to delete my ADR so that obsolete or erroneous records can be removed. | Implemented as a soft delete (`deleted_at` timestamp). RLS filters soft-deleted rows from reads for all users. |
| US-ADR-07 | As an author, I want to update the status of my ADR so that its lifecycle state is accurately reflected for all readers. | |
| US-ADR-08 | As a user, I want to see how an ADR was created (Manual, AI-generated, or AI-generated & User-edited) so that I can understand the provenance of the document. | |
| US-ADR-09 | As a user, I want the editor to enforce a 15,000-character document limit so that ADRs remain concise and within system constraints. | A visible character counter should be displayed in the editor. |

---

## 4. AI Drafting (US-DRAFT)

| ID | User Story | Notes |
|----|-----------|-------|
| US-DRAFT-01 | As a user, I want to paste unstructured notes into a "brain dump" text area so that the AI can generate a fully structured ADR draft on my behalf. | Input limited to 5,000 characters (~800–1,000 words) to ensure focused context and control AI token costs. |
| US-DRAFT-02 | As a user, I want to see a character counter on the brain dump input so that I know how much space I have remaining before I hit the input limit. | |
| US-DRAFT-03 | As a user, I want the AI-generated draft to appear directly in the WYSIWYG editor so that I can review and manually refine it before saving. | AI output is instructed to stay under ~10,000 characters to leave room for manual additions before the 15,000-character document limit. |
| US-DRAFT-04 | As a user, I want my AI usage to be tracked when I generate a draft so that my daily allowance is accurately reflected after the operation. | |
| US-DRAFT-05 | As a user, I want to be prevented from generating a draft if I have reached my daily AI limit so that I receive a clear explanation rather than a silent failure. | |

---

## 5. AI Summarisation (US-SUMM)

| ID | User Story | Notes |
|----|-----------|-------|
| US-SUMM-01 | As a user, I want an AI-generated summary to be automatically created when an ADR is saved so that I can quickly grasp its key points without reading the full document. | Summary is pre-generated and stored in the database to ensure instant page loads (no on-demand AI call at read time). |
| US-SUMM-02 | As a user, I want to see the AI summary prominently at the top of the ADR detail view so that I get an immediate overview before reading the full content. | |
| US-SUMM-03 | As an author, I want to manually trigger a regeneration of my ADR's summary so that it reflects any significant edits I have made since the last save. | Regeneration counts against the author's daily AI usage. |
| US-SUMM-04 | As a user, I want my AI usage to be tracked when a summary is generated or regenerated so that token consumption is accurately accounted for. | |

---

## 6. Search & Ask — RAG (US-SEARCH)

| ID | User Story | Notes |
|----|-----------|-------|
| US-SEARCH-01 | As a user, I want to visit a dedicated "Search & Ask" page so that I have a focused space for querying the ADR knowledge base. | |
| US-SEARCH-02 | As a user, I want to ask natural language questions about architectural decisions so that I can find relevant context without knowing exact document titles or keywords. | Powered by Retrieval-Augmented Generation (RAG) over pgvector embeddings. |
| US-SEARCH-03 | As a user, I want the AI's answer to include citations and links to the source ADRs it referenced so that I can verify the answer and read the full decision. | |
| US-SEARCH-04 | As a user, I want the system to respond gracefully when my question is unrelated to any ADR so that I am not given a misleading or fabricated answer. | Implemented via relevance thresholding: if vector similarity scores fall below a threshold the system short-circuits and returns a canned response without calling the LLM. |
| US-SEARCH-05 | As a user, I want the system to reject harmful or policy-violating inputs before they are processed so that the AI service is protected from abuse. | Inputs are passed through the OpenAI Moderation API before any LLM call. |
| US-SEARCH-06 | As a user, I want my AI usage to be tracked when I submit a search query so that my daily allowance accurately reflects Search & Ask consumption. | |
| US-SEARCH-07 | As a user, I want to be prevented from submitting a query if I have reached my daily AI limit so that I receive a clear explanation rather than a silent failure. | |

---

## 7. ADR Linking (US-LINK)

| ID | User Story | Notes |
|----|-----------|-------|
| US-LINK-01 | As an author, I want to link my ADR to another existing ADR and specify the relationship type so that readers understand how decisions relate to each other (e.g., Supersedes, Depends on). | Self-links are prevented via a database `CHECK` constraint. Duplicate links (same source, target, and type) are blocked via a `UNIQUE` constraint. |
| US-LINK-02 | As a user, I want to see all linked ADRs and their relationship types on the ADR detail page so that I can navigate the graph of related decisions. | |
| US-LINK-03 | As an author, I want to remove a link I created so that I can correct erroneous or outdated relationships. | |
