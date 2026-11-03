# Rendered pages

`kb/incidents/4471/problems.html` is the page `src/routes/kb/incidents/4471/problems/+page.svx`
as the desk sees it: built with SvelteKit 3.1 + mdsvex 0.12 (layout `runbook`, `#lib` → `src/lib`),
prerendered, then saved as one file with its CSS inlined and the client scripts removed.
Every number on it was computed at build time from `src/lib/data/` by `src/lib/kb/problems.ts`.
