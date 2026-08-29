# MITTSU WRITERS — how to run & customize

## Run it
Open `index.html` in any browser. No build step, no server required.
All files (`index.html`, `style.css`, `script.js`, `assets/`) must stay in the same folder.

## Logging in as the author
Only one account can add, edit, or delete stories and chapters:
**trilogypublishers2022@gmail.com**

The very first time, click **Sign Up** with that email and any password you choose
— that becomes your permanent author login (stored locally in this browser).
Signing up or logging in with that email drops you straight into the **Author
Dashboard** — no extra clicks. From then on, wherever you are on the site:
- A **✎ pencil icon** appears on every story card in the library — click it to edit that story directly.
- Every story's own page shows **✎ Edit Story** and **📖 Manage Chapters** buttons.
- The nav bar shows a **Dashboard** shortcut next to Log out.

Anyone who signs up with a different email becomes a regular reader: they can
like, vote, and comment, but none of the edit buttons appear for them, and the
dashboard stays locked.

This is frontend-only (no server), so it's real access control for the app's
own UI, but not bank-grade security, and it's tied to whichever browser/device
you signed up on — logging in from a second device would need a real backend
database. When you're ready for that, swap the inside of the `Auth.*` and `DB.*`
functions in `script.js` for real backend calls; nothing else in the app needs
to change.

## Everything starts at zero
Every story launches with 0 likes, 0 votes, 0 shares, and 0 comments —
nothing is pre-seeded. Numbers only go up from real activity in the browser.

## Add your real posters
Drop image files into `assets/posters/`, named to match what's already referenced
in `script.js`, e.g. `assets/posters/kodak.jpg`, `assets/posters/midnight-love.jpg`.
Until a file exists there, the card shows a generated placeholder automatically.
To rename a path, edit the `poster:` field on that story inside `DEFAULT_STORIES`
near the top of `script.js`, or use the Author Dashboard's "Poster image URL / path"
field for stories you add later.

## Add/replace real chapters
Log in as the author, then either click **📖 Manage Chapters** on a story's own
page, or go to the footer → **Author Dashboard** → **Chapters** tab → pick the
story. Paste your text with a blank line between paragraphs; each paragraph
automatically becomes individually commentable in the reader.

## Assign genres later
Each story object has a `genres: []` array — add strings from this list once
you've decided: `rom-com`, `horror`, `fictional`, `feel-good`, `romance`,
`action-thriller`, `comedy`, `mystery`, `guesome`. The mood filters on the
homepage already read from this field — nothing else needs to change.

## Data model (for a future real backend)
Everything lives in `localStorage` under `mittsu_writers_db_v2`, managed
entirely through the `DB` object in `script.js`. Session/login state lives
under `mittsu_writers_session` (current session), `mittsu_writers_author_credentials`
(the one author login), and `mittsu_writers_reader_accounts` (everyone else).
When you're ready for a real backend, rewrite the *bodies* of `DB.*` and
`Auth.*` to call your API — every other part of the app calls through those,
so nothing else needs to change.

## Reset all data
Clear `localStorage` for this page (dev tools → Application → Local Storage
→ delete the `mittsu_writers_*` keys → refresh) to start completely fresh.
