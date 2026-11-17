# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Workers": a phone-first web app for a staffing agent who places household and office workers (maids, nail technicians, drivers, office staff) in Dubai and Nepal. The user is a single non-technical person on an Android phone (Redmi), and the UI switches between English and Nepali.

Planned in three parts:
1. **Worker list** (built): store, search, filter and tick workers.
2. **Send job message** (not built): for ticked workers, a form with Job, Salary, Package tick boxes (Food, Accommodation, Flight ticket, Visa, Medical insurance, plus notes) and Contract details. It generates an editable message to send by WhatsApp or SMS, chosen each time. Automatic WhatsApp sending would need the official WhatsApp Business API. The disabled `#sendBtn` in the tick bar is the entry point.
3. **Share with client** (not built): a viewable page of selected workers. Show a worker's phone/email only if `consentShareContact` is true. This part needs online storage (see `.env.example`).

Owner constraints: keep the code lean, never drop existing features or options when refactoring, and keep it simple for the end user.

## Commands

There is no build step, no dependencies, no linter and no test suite. Serve the folder over HTTP; the service worker does not run from `file://`.

```bash
python3 -m http.server 8765
```

To verify changes, drive it with Playwright (preinstalled) at phone sizes. Check both languages, since Nepali labels are longer:
- 360×640: Redmi 9A / budget Redmi, the narrowest target
- 393×873: Redmi Note 12

Deployment target is GitHub Pages (static files as-is), possibly Vercel later.

## Architecture

Everything lives in `index.html`: CSS in `<style>`, then plain-JS sections marked `/* ---------- … ---------- */`. There is no framework.

- **i18n:** the `T.en` and `T.ne` objects hold every string (some are functions taking counts or names).
  - Static elements use `data-t` (textContent) or `data-tp` (placeholder). `applyStaticText()` fills them.
  - `t(key, ...args)` looks up a string. Every new string needs both `en` and `ne` entries.
- **Data:** IndexedDB database `staffing-app`, object store `workers`, `keyPath: 'id'`, accessed through the small `db` wrapper.
  - Worker fields: `id, name, phone, email, jobType, country, visa, status ('available'|'placed'), consentShareContact, notes, photo (JPEG data URL, shrunk to max 480px), createdAt, updatedAt`.
  - Stored values are language-neutral keys: `JOB_KEYS` (maid/nail/driver/office), `COUNTRY_KEYS` (AE/NP), `VISA_KEYS`. Labels come from `T[lang].job/countryName/visaName`.
  - `jobType` and `country` may also hold free text, typed via the "Other…" option (`OTHER` sentinel). Filters add these custom values automatically.
  - The `country` field is displayed as **Nationality**.
- **Rendering:** state is the `workers` array, the `ticked` Set and the `filters` object. `render()` rebuilds the header filters, list, summary, tick bar and backup notice from that state. Call `load()` (re-read IndexedDB, then render) after any write.
- **Screens:** the add/edit form and Backup are full-screen `.sheet` sections. `openSheet()` pushes a history entry so the Android Back button closes them (via `popstate`). Close them with `closeSheet()`, not by hiding them directly.
- **Persistence and backup:** data lives only on the phone.
  - Backup is a JSON file `{ app: 'staffing-workers', version: 1, exportedAt, workers }`, shared via the Web Share API or downloaded.
  - Restore merges by `id` (put) and never deletes.
  - `localStorage` holds only `lang` and `lastBackup`, which drives the 14-day reminder.
  - `navigator.storage.persist()` is requested on the first save.
- **Offline:** `sw.js` is network-first with a cache fallback. Bump `VERSION` in `sw.js` whenever app files change so installed phones pick up the update. Add any new static file to `FILES`.
- **Layout:** mobile-first, with a `@media (max-width: 380px)` block that tightens the filters, header, cards and floating Add button for 360px phones. `body.has-ticks` adds bottom padding so the fixed tick bar and Add button never cover the last card.

`.env.example` is a placeholder for later Vercel/online-storage settings; nothing reads it yet, and `.env` is git-ignored.
