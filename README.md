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

New visitors enter onboarding before reaching the main app, including when opening a workspace deep link. **Skip setup** is available at every step and opens Home immediately. Completing setup also opens Home. Either choice is remembered on this device, and setup can be revisited from Home. The bottom-left profile menu includes **Customize Speqq**, which opens saved settings with direct section navigation and **Save and return**, without repeating the demo step.

The five-step flow first asks whether the user is a Student, Educator, Researcher, or Other, then collects study context, a starting goal, courses, and optional source preferences or files; demonstrates a connection between two sample courses; and opens a personalized study space at `#Study`. Draft progress resumes on this device, independently of the original workspace. Markdown/text contents are stored locally; PDFs and photos are listed only. The example connection is explicitly sample-based. Direct source connections, OCR, phone scanning, AI analysis, and scheduled review notifications remain future work.

Onboarding reuses the workspace page, navigation, connector-card, primary-button, typography, and native select styles instead of maintaining separate visual overrides. The course-import screen matches the original workspace's neutral black and gray styling. Canvas, Brightspace, and mySchoolApp open a simulated course picker; transcript selection opens the same sample review flow. Students can select courses, add them manually, remove them, or skip this step. Connections and transcript extraction are demo simulations with fixed sample courses, not real API calls or document parsing. Only transcript filenames and sizes are retained locally. No credentials or file contents are sent to a service.

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

### Handwritten note scan demo

Under Upload notes, Scan with your phone opens a QR panel. Preview phone upload shows a camera/file picker and a sample-photo action. The bundled QR encodes the published `https://yufeiihuang.github.io/ghanawinit/#Onboarding/phone` demo route; it is not a remote upload session. Cross-device transfer and handwriting recognition are simulated for the case-competition prototype. Actual file selections use the existing local note-file handling.

### Library

Library lives under Work and provides a Drive-style file list, grid view, search, course folders, custom folders, previews, and folder assignment. Notes and transcripts selected during setup are included automatically. The + New menu supports files, pictures, phone scans, and simulated imports from Notability, Notion, Goodnotes, and Obsidian. Imports use fixed sample Markdown notes; no external accounts are accessed.

Library metadata and text contents are stored under `speqq-library-v1`. Selected images can be previewed during the current page session; binary file contents are not retained across reloads. The QR and sample-photo flows are demo interactions, not cross-device transfer or OCR.

### GitHub Pages

The public prototype is hosted at https://yufeiihuang.github.io/ghanawinit/ from the generated `gh-pages` branch. Source changes remain in their review branches. Build with `npm run build`; publish the contents of `dist/` with a `.nojekyll` file to the deployment branch. Asset paths are relative so the app works under the repository subpath. Browser-local prototype data is separate on each device.

### Seeded student workspace

Use the top-left workspace menu to switch between Umami and Yufei’s study space. The student workspace includes biology, chemistry, and calculus notes, study goals, a midterm calendar, and study routines. Student-facing labels use Documents, Connections, and Study routines while Umami retains its original labels and content.

The active choice is stored under `speqq-active-workspace`. Student data uses separate `-student` storage keys for the main workspace, Library, and setup. Seeding only initializes missing records and preserves existing edits in both workspaces. Each visitor gets their own local sample data; this is not a shared multi-user backend.

### Collab

Collab replaces the main Team navigation entry with Groups and People. Student workspaces include sample school, course, and study groups; other workspaces include project and research groups. Create groups, join or leave, view people and shared groups, and record invitations locally.

School/course joins ask for a school email as a self-reported affiliation. This prototype does not verify email ownership or enrollment, send invitations, or provide real multi-user collaboration. Group and invitation records are isolated by workspace under `speqq-collab-v1` storage keys. The marketplace for agents, skills, and memories is outside this feature.

### NYU school community

Collab includes a School tab for New York University. The prototype accepts an @nyu.edu address, then uses demo code `123456` to unlock school groups and classmates. The code expires after ten minutes; changing the email restarts the flow. This is a local simulation, not real email delivery or ownership verification. Student sample names migrate from Maya Chen to Yufei Huang without replacing existing goals, notes, or workspace edits.


### Routine organization controls

Routine details include explicit Library file/folder scope, read-only or read-and-organize permission, a destination folder, and Ask before organizing (on by default). Run now previews the scoped moves before applying them. Applying rechecks the current access and Keep in place settings. The Undo toast is available for 15 seconds and restores folder locations without overwriting file content or later manual moves. New empty destination folders are removed on undo. There is no activity history.

Library file details and folder breadcrumbs include Keep in place controls. Uploading or organizing files does not publish them to Collab. This is a local browser-storage prototype: organization moves only the selected Library records to the chosen destination, with no AI service, background scheduling, or server-side permission system.


### Public demo starting workspace

New browsers open Yufei’s study space with populated student data and completed setup. The starter Library includes the file locations and protected note selected from the deployed Chrome demo, and the weekly recap includes its saved General Chemistry access scope. The NYU community starts in its configured prototype state, with two joined course groups, a pending group invitation, and public discovery. The school email is part of the public demonstration identity, not evidence of real verification.

Each browser receives its own copy on first use. Existing student data and an explicit switch to Umami persist, and Umami remains available in the workspace switcher. Browser edits do not automatically synchronize to other visitors or update the shared starter data.
