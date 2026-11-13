# Umami · Speqq prototype recreation

A self-contained recreation of the password-protected Speqq case-competition prototype, implemented in vanilla JavaScript and CSS. No dependency installation or API keys are required.

## Run

Requires Node.js 20 or later.

```sh
npm run dev
```

Open http://127.0.0.1:5173. Set `PORT` to choose another port.

```sh
npm test
npm run build
```

The build produces a static `dist/` directory that can be served by any static host. `npm start` serves the source tree locally.

## Included

### Student onboarding scaffold

Open `http://127.0.0.1:5173/#Onboarding`, or choose **Set up Speqq for studying** on Home.

The five-step student flow collects study context, a starting goal, courses, and optional source preferences or files; demonstrates a connection between two sample courses; and opens a personalized study space at `#Study`. Draft progress resumes on this device, independently of the original workspace. Markdown/text contents are stored locally; PDFs and photos are listed only. The example connection is explicitly sample-based. Direct source connections, OCR, phone scanning, AI analysis, and scheduled review notifications remain future work.

This draft focuses on STEM/pre-med students and a first experience connecting concepts across semesters. It uses **routine** rather than **agent** in the student space. The original workspace remains available at `#Home`.

### Original workspace

- Dark sidebar, dotted canvas, home summary and rotating Today cards.
- Inbox with search, filters, read state and details.
- Goals with expandable context and suggested questions.
- Specs with search, creation, editable rich text, tabs, status, tags, versions, sharing dialog and recoverable deletion.
- Project memory summaries and activity timeline.
- Agents with triggers, editable instructions and simulated runs.
- Skills with enable/disable controls.
- Connected/available tools and simulated connection state.
- Team directory and local invitation records.
- Monthly calendar, event creation and event details.
- Activity logs, retry simulation, trash restoration, profile and workspace settings.
- Command search, keyboard navigation, sidebar toggle and question panel.
- Browser-local persistence with `localStorage`, hash links, responsive layouts, keyboard focus and reduced-motion support.

## Prototype boundaries

This is a local UI recreation, not a production service. Answers, source citations, connections, agent runs and invitation records use sample data. No AI requests, OAuth connections, invitation emails, billing transactions or external mutations occur. No prototype password is embedded in the repository. Brand marks are lightweight local approximations; the visual reference did not expose downloadable assets through the available browser asset inventory.

Edits persist in the current browser under `speqq-umami-v1`. Clear that local storage key or use a fresh browser profile to restore the sample workspace. Content edits are sanitized before being saved.

## Structure

- `src/app.js`: screen rendering, interaction handling, local state.
- `src/data.js`: reference workspace content and pure search/calendar helpers.
- `src/styles.css`: shared design, screen layouts and responsive rules.
- `src/icons.js`: local SVG icons and brand approximations.
- `server.mjs`: dependency-free local HTTP server.
- `tests/data.test.mjs`: data isolation, search and calendar edge cases.

Keyboard shortcuts: `G` then `H/I/O/S/M/A/K/C/T/L` opens the corresponding sidebar section. `⌘/Ctrl K` opens commands, `⌘/Ctrl J` opens Ask Speqq, `⌘/Ctrl B` toggles the sidebar, and `⌘/Ctrl N` creates a spec. `Escape` dismisses dialogs and panels.
