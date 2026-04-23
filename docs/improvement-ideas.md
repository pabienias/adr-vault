# Improvement Ideas

A living backlog of post-MVP improvements, technical enhancements, and quality-of-life changes worth considering. Items here are **not yet scoped for a phase** — they are candidates that can be promoted into the PRD, a planning doc, or an ADR once prioritised.

> **How to use this file:** Add new ideas as table rows. Keep descriptions short; link out to longer notes if needed. When an idea is promoted into an actual phase or ADR, move it to the "Promoted" section at the bottom with a pointer to the artefact that absorbed it.

---

## Open ideas

| # | Area | Idea | Motivation | Rough effort | Notes |
|---|------|------|------------|--------------|-------|
| 1 | Frontend / i18n | **Centralised translations file for static UI strings** | All hard-coded copy (button labels, headings, helper text, form errors, toasts) is currently inline in components. A single source of truth enables future localisation, makes copy audits trivial, and prevents the same string being duplicated across pages with minor drift. | M | See details below. |

---

### 1. Centralised translations file for static UI strings

**Shape.** A JSON (or TS-as-const) file per locale, keyed by feature-qualified string IDs:

```json
{
  "en": {
    "login_no_account": "Don't have an account?",
    "login_submit": "Sign in",
    "register_have_account": "Already have an account?",
    "register_submit": "Create account"
  }
}
```

**Access pattern.** A tiny typed helper (e.g. `t('login_no_account')`) that reads from the active locale. MVP can hard-code `en`; the function signature is what matters, so adding a second locale is drop-in later.

**Why now (as an idea).** Phase 1b and the `(auth)` layout extraction have already surfaced duplicated copy across login/register (same "have an account" question phrased twice). Every new feature phase adds more strings; the longer we wait, the larger the one-time migration.

**Scope considerations when promoted.**
- Decide between flat keys (`login_no_account`) vs. nested namespaces (`auth.login.noAccount`). Flat is simpler; nested is more ergonomic for feature splits.
- Decide whether to adopt a library (`next-intl`, `react-intl`, `i18next`) or roll a ~30-line custom helper. MVP likely does not need runtime locale switching or plural rules.
- Server Components vs. Client Components: the helper must work in both. A pure function over a static import is the simplest way to guarantee that.
- Keep string IDs feature-qualified from day one to avoid clashes (`login_submit` vs. `generic_submit`).

**Out of scope for this idea.** Full localisation (actually translating to another language), pluralisation, date/number formatting, and RTL support. Those are separate, larger initiatives.

---

## Promoted

*(Nothing yet — items move here once an ADR, PRD entry, or implementation plan absorbs them.)*
