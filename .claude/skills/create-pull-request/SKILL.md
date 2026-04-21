---
name: create-pull-request
description: Create a GitHub pull request from the current branch with auto-drafted title, body, and optional conventional-commit bundling of uncommitted changes. Invoke when the user asks to create, open, submit, or draft a PR, pull request, or merge request, or says "push for review" / "open it for review". Do NOT invoke for reviewing, updating, merging, closing, or commenting on existing PRs.
---

# Create Pull Request

Create a GitHub PR from the current branch with a consolidated preview and explicit user confirmation before `gh pr create` runs.

**Never proceed past the preview step without explicit user approval. Never use `git add -A` / `git add .`. Never force-push.**

## Project conventions this skill enforces

- **Conventional Commits** for both suggested commit messages and PR titles — format: `<type>(<scope>): <subject>`
- **Path-based scope detection** from the set of changed files:
  - Only `apps/web/**` → `web`
  - Only `apps/api/**` → `api`
  - Only `packages/core/**` → `core`
  - Only `supabase/**` → `db`
  - Only `docs/**` → `docs`
  - Spans two or more scopes → no scope (bare `feat:`, `fix:`, etc.)
- **Types**: `feat` | `fix` | `chore` | `refactor` | `docs` | `test` | `style` | `build` | `ci`
- Stage files by **explicit path** only — never `-A` / `.` (risk of leaking `.env`, credentials)

## Workflow

### Step 1 — Preflight (fail fast)

Run in parallel and verify all pass before continuing:

```bash
gh auth status
git rev-parse --abbrev-ref HEAD
git fetch origin main
```

Abort with a clear message if:
- `gh auth status` fails → `Run` `gh auth login` `first.`
- Current branch is `main` or `master` → `Cannot create a PR from main. Switch to a feature branch.`
- `git rev-list --count origin/main..HEAD` returns 0 → `No commits to include in a PR.`

### Step 2 — Determine branches

- **Source**: `git branch --show-current`
- **Target**: always `main` (will be shown in preview; user can edit before confirming)

### Step 3 — Handle uncommitted changes

Run `git status --porcelain=v1` and classify into three buckets:

| Bucket | Porcelain column | Handling |
|---|---|---|
| Staged | Index column is non-space and non-`?` | Always included |
| Unstaged modifications | Worktree column is `M`/`D` and index column is space | Ask: `Include these N modified files in the PR? [y/N]` — list filenames |
| Untracked | Both columns are `?` | Ask: `Include these N new files in the PR? [y/N]` — list each filename individually so `.env`, credentials, or other sensitive files are visible |

If any bucket is accepted for inclusion:
1. Stage by **explicit path**: `git add <file1> <file2> ...` (never `-A`)
2. Draft a conventional-commit message:
   - **Type**: inferred from diff content — new features → `feat`, bug fix → `fix`, non-behavioral refactor → `refactor`, docs-only → `docs`, tests-only → `test`, tooling/config → `chore`
   - **Scope**: per the path rules above
   - **Subject**: one-line summary under 70 chars
3. Show the drafted message and ask: `Commit with this message? (edit / accept [y] / cancel)`
4. On accept: `git commit -m "<approved message>"` (no `Co-Authored-By` trailer — matches existing project style)

If there are no uncommitted changes, skip to Step 4.

### Step 4 — Ensure branch is on remote

Check tracking state:

```bash
git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null
git rev-list --left-right --count @{u}...HEAD 2>/dev/null
```

- **No upstream / remote branch missing** → ask `Push branch to origin? [Y/n]` → on yes: `git push -u origin <source>`
- **Ahead of remote, not behind** (fast-forward) → push silently: `git push`
- **Diverged** (both ahead and behind) → **ABORT**: `Local branch has diverged from origin/<branch>. Resolve manually — this skill will not force-push.`

### Step 5 — Check for existing PR

```bash
gh pr list --head <source-branch> --state open --json url,number,title
```

If a PR exists → abort:

```
PR already exists for this branch: <url>
Close or update it manually before running this skill again.
```

### Step 6 — Analyze diff

Base analysis (always run):
- `git log --oneline origin/main..HEAD`
- `git diff --stat origin/main..HEAD`

**Escalate** to reading diff hunks (`git diff origin/main..HEAD`) ONLY if either:
- The commit range has more than 5 commits AND the messages are generic/terse (`wip`, `fix`, `update`, no scope or subject detail), OR
- The user has asked for a "detailed" / "in-depth" analysis.

Otherwise, trust the commit messages — they carry most of the "why."

### Step 7 — Detect PR template

Check in order, first match wins:
1. `.github/pull_request_template.md`
2. `.github/PULL_REQUEST_TEMPLATE.md`
3. `.github/pull_request_template/*.md` (alphabetical first match)

**If found**: use its structure verbatim. Fill placeholders and sections from the diff analysis. Do NOT append a Test plan or any section the template doesn't already have — the template is a team contract.

**If none found**: use the fallback structure:

```markdown
## Summary
- <1–3 bullets describing what changed and why, derived from commit messages>

## Test plan
- [ ] <actionable check derived from changed areas>
- [ ] <another check>
```

### Step 8 — Draft PR title and body

**Title**: `<type>(<scope>): <subject>` — conventional-commit form, under 70 chars. Pick the dominant type across commits in range; resolve ties by most-impactful change.

**Body**:
1. Fill the template (detected or fallback) from diff analysis.
2. **User-story linking**: match the source branch name against `/(US-[A-Z]+-\d+)/`. If matched, prepend this line to the body (before the first section):
   ```
   Related: [<match>](docs/user-stories.md#<lowercased-match>)
   ```
3. Always append this footer as the last line:
   ```
   🤖 Generated with [Claude Code](https://claude.com/claude-code)
   ```

### Step 9 — Consolidated preview (STOP POINT)

Show the user this preview in a single message:

```
─── PR Preview ───
Source:     <source-branch>
Target:     main
Commits:    <N> commit(s)
            • <first-subject>
            • <last-subject>
Files:      <N> changed (+<adds>/-<dels>)
Template:   <detected path> | fallback (Summary + Test plan)
User story: <linked id> | none

Draft?      [y/N]  ← answer this

Title: <drafted title>

Body:
<drafted body, verbatim>

─── Confirm ───
[y] Create PR as shown above
[e] Edit title/body before creating
[n] Cancel (no side effects beyond any commits/pushes already made)
```

Wait for explicit user response. On `e`, accept their edits, redraft, and show the preview again. On `n`, stop and summarize the branch state (commits made, whether pushed).

### Step 10 — Create PR

On `y`, run `gh pr create` using a HEREDOC for the body to preserve formatting:

```bash
gh pr create \
  --base main \
  --head <source-branch> \
  --title "<approved-title>" \
  [--draft] \
  --body "$(cat <<'EOF'
<approved-body>
EOF
)"
```

Include `--draft` only if the user answered `y` to the Draft prompt in the preview.

### Step 11 — Post-creation output

Print exactly one line:

```
Created PR #<number> → <url>
```

Do NOT auto-open a browser. Do NOT write any log file. Do NOT summarize what was in the PR (the preview already covered that).

## Failure modes & recovery

| Situation | Response |
|---|---|
| `gh pr create` fails (network, auth, branch protection) | Print `gh`'s error verbatim and stop. Branch is already pushed — user can adjust and re-run the skill. Do not retry automatically. |
| User answers `n` at preview | Stop. Summarize current branch state (commits made, push state) so user knows what exists. |
| Permission prompt denied mid-skill | Stop and tell the user exactly which permission rule is needed (e.g., `Bash(git push:*)` already allowed; `Bash(gh pr create:*)` already allowed — see `.claude/settings.local.json`). |
| Secret-looking filename in untracked bucket (`.env`, `*.pem`, `id_rsa*`, `credentials*`) | Flag it explicitly in the confirmation prompt: `⚠ This file looks like it may contain secrets. Include anyway? [y/N]` |

## Out of scope (do NOT attempt in this skill)

- Updating an existing PR's title or body (the skill aborts if one exists)
- Assigning reviewers (user adds them via GitHub UI)
- Adding labels (user adds them via GitHub UI)
- Stacked PRs targeting non-main branches (target is always `main`; if the user wants otherwise, they edit at preview)
- Force-pushing or resolving divergence (skill aborts on divergence)
- Merging, closing, or commenting on the PR after creation
