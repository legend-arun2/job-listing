# Workers – staffing app

A simple phone app to keep a list of workers (maids, nail technicians, drivers, office staff).
English / Nepali. All worker data stays **only on the phone** (nothing is uploaded).

## Put it on the phone
1. Open the app link in Chrome (Android) or Safari (iPhone).
2. Add to Home Screen (Chrome menu ⋮ → "Add to Home screen"; Safari Share → "Add to Home Screen").
3. Always open it from the home-screen icon.

## Keep the data safe
The list lives only on this phone. Tap **Backup → Save backup file** every week and keep the file
in Google Drive or WhatsApp "Message yourself". To get the list back: **Backup → Restore from backup**.

## Files
- `index.html` – the whole app
- `sw.js`, `manifest.webmanifest`, `icon-*.png` – offline + home-screen icon
- `.env.example` – placeholder for later (Vercel / online storage); not used yet

When changing files, bump `VERSION` in `sw.js` so phones pick up the update.
