import { icon } from './icons.js';
import { STEPS, ONBOARDING_KEY, readDraft, canContinue, addCourse, toggleSource } from './onboarding-state.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const goals = [
  ['Connect what I learn', 'See how concepts from different courses fit together.', 'Memory'],
  ['Prepare for a big exam', 'Keep an MCAT, LSAT, or other long-term goal in view.', 'Goals'],
  ['Keep up this semester', 'Turn this week’s material into a steady study routine.', 'Calendar']
];
const sources = [
  ['Notion', 'Bring a Markdown export; keep your workspace.', 'Specs'],
  ['Obsidian', 'Bring .md notes from your vault.', 'Memory'],
  ['Notability / Goodnotes', 'Start with exported PDFs and annotated slides.', 'Specs'],
  ['Paper notes', 'Start with a photo or scanned PDF.', 'Specs']
];
let draft = readDraft(localStorage);
let controller;
let notice = '';
let showReason = false;
const persist = () => localStorage.setItem(ONBOARDING_KEY, JSON.stringify(draft));
const b = (text, action, classes = '', attrs = '') => `<button type="button" class="${classes}" data-ob="${action}" ${attrs}>${text}</button>`;
const field = (label, key, placeholder = '', type = 'text', required = false) => `<label class="ob-field">${label}<input name="${key}" type="${type}" value="${escape(draft[key])}" placeholder="${placeholder}" ${required ? 'required' : ''} maxlength="100"></label>`;

function profile() {
  return `<div class="ob-kicker">MADE FOR YOUR NEXT SEMESTER, TOO</div><h1>A place for everything<br>you’re learning.</h1><p class="ob-intro">Start with a little context. Speqq can help you find the thread between this semester and the next.</p><div class="ob-form-grid">${field('What should we call you?', 'name', 'Your first name', 'text', true)}${field('Major or area of study', 'major', 'e.g. Biology, pre-med, engineering', 'text', true)}</div><label class="ob-field">Where are you in your studies? <span class="ob-optional">Optional</span><select name="year"><option value="">Choose your year</option>${['First year','Second year','Third year','Fourth year','Graduate student','Other'].map(y => `<option ${draft.year === y ? 'selected' : ''}>${y}</option>`).join('')}</select></label><div class="ob-reassurance">${icon('lock', 15)} Your study space starts private.</div>`;
}

function goal() {
  return `<div class="ob-kicker">THE BIGGER PICTURE</div><h1>What are you<br>working toward?</h1><p class="ob-intro">Choose one place to start. You can add more goals later.</p><div class="ob-choices">${goals.map(([title, description, glyph]) => b(`<span class="ob-choice-icon">${icon(glyph, 22)}</span><span><strong>${title}</strong><small>${description}</small></span><span class="ob-radio"></span>`, 'goal', 'ob-choice ' + (draft.goal === title ? 'chosen' : ''), `data-value="${title}" aria-pressed="${draft.goal === title}"`)).join('')}</div>${draft.goal === 'Prepare for a big exam' ? `<div class="ob-form-grid ob-goal-fields">${field('Exam', 'exam', 'e.g. MCAT')}${field('Target date · optional', 'targetDate', '', 'date')}</div>` : ''}`;
}

function material() {
  return `<div class="ob-kicker">START SMALL. KEEP YOUR TOOLS.</div><h1>Bring one course.<br>Keep the rest where it is.</h1><p class="ob-intro">No need to move your whole system. Pick the tools you use, then bring a few notes or try the example.</p><div class="ob-source-grid">${sources.map(([title, description, glyph]) => b(`${icon(glyph, 20)}<span><strong>${title}</strong><small>${description}</small></span>${draft.sources.includes(title) ? icon('check', 15) : icon('plus', 15)}`, 'source', 'ob-source ' + (draft.sources.includes(title) ? 'chosen' : ''), `data-value="${escape(title)}" aria-pressed="${draft.sources.includes(title)}"`)).join('')}</div><div class="ob-course-label">Which courses should stay connected? <span class="ob-optional">Optional</span></div><div class="ob-course-input"><input id="ob-course" aria-label="Course name" placeholder="e.g. General Chemistry" maxlength="100">${b('Add course', 'course', 'subtle')}</div><div class="ob-course-chips">${draft.courses.map((course, i) => b(`${escape(course)} ${icon('close', 11)}`, 'remove-course', 'ob-chip', `data-index="${i}" aria-label="Remove ${escape(course)}"`)).join('')}</div><label class="ob-upload" id="ob-drop">${icon('plus', 20)}<strong>Add a few notes</strong><span>Markdown, text, PDFs, or photos · up to 5 MB each</span><input id="ob-files" type="file" multiple accept=".md,.txt,.pdf,.png,.jpg,.jpeg" aria-label="Add notes"></label>${draft.materials.length ? `<div class="ob-file-list">${draft.materials.map((file, i) => `<div>${icon('Specs', 14)}<span>${escape(file.name)}</span><small>${file.content ? 'Text ready' : 'File listed'}</small>${b(icon('close', 13), 'remove-file', 'icon-button', `data-index="${i}" aria-label="Remove ${escape(file.name)}"`)}</div>`).join('')}</div>` : ''}<p class="ob-small">Text notes are saved in this browser. PDF and photo reading, direct app connections, and phone scanning are next steps for this prototype.</p>`;
}

function firstConnection() {
  return `<div class="ob-kicker">A SMALL FIRST WIN</div><h1>New semester.<br>Familiar ideas.</h1><p class="ob-intro">Here’s an example of how Speqq could connect something you’re learning now to something you already know.</p><div class="ob-example-label">${icon('Memory', 14)} Example using sample course notes</div><div class="ob-connection"><article><span class="ob-course-tag">General Chemistry · last semester</span><h3>Electrochemical gradients</h3><p>Ions move according to both concentration and electrical charge.</p></article><div class="ob-connection-line"><span></span>${icon('Connectors', 20)}<span></span></div><article><span class="ob-course-tag">Cell Biology · this semester</span><h3>ATP synthesis</h3><p>A proton gradient across a membrane helps power ATP synthase.</p></article></div><div class="ob-insight"><strong>The connection</strong><p>The same gradient principle explains how cells turn stored energy into ATP. Your chemistry notes can give you a head start in cell biology.</p>${b((showReason ? 'Hide' : 'Show') + ' the source notes', 'reason', 'ob-text-link')}</div>${showReason ? `<div class="ob-source-notes"><p><strong>Sample chemistry note:</strong> “An electrochemical gradient combines the concentration difference and the voltage across a membrane.”</p><p><strong>Sample biology note:</strong> “Protons flow down their electrochemical gradient through ATP synthase.”</p></div>` : ''}<div class="ob-example-actions">${b(draft.connectionSaved ? icon('check', 14) + ' Connection saved' : icon('plus', 14) + ' Keep this example', 'keep', 'subtle', `aria-pressed="${Boolean(draft.connectionSaved)}"`)}<span>You decide which connections to keep.</span></div>`;
}

function review() {
  return `<div class="ob-kicker">ROOM TO GROW</div><h1>Your next semester<br>starts with context.</h1><p class="ob-intro">${escape(draft.name)}, here’s the starting point for your study space. You can change any of this later.</p><div class="ob-review"><div><span>Studying</span><strong>${escape(draft.major)}${draft.year ? ' · ' + escape(draft.year) : ''}</strong>${b('Edit', 'edit', 'ob-text-link', 'data-step="0"')}</div><div><span>Starting goal</span><strong>${escape(draft.goal)}${draft.exam ? ' · ' + escape(draft.exam) : ''}</strong>${b('Edit', 'edit', 'ob-text-link', 'data-step="1"')}</div><div><span>Courses</span><strong>${escape(draft.courses.join(', ') || 'Add them when you’re ready')}</strong>${b('Edit', 'edit', 'ob-text-link', 'data-step="2"')}</div><div><span>Starting material</span><strong>${draft.materials.length ? draft.materials.length + ' file' + (draft.materials.length === 1 ? '' : 's') : 'Sample course notes'}</strong>${b('Edit', 'edit', 'ob-text-link', 'data-step="2"')}</div></div><div class="ob-next-preview">${icon('Calendar', 22)}<div><strong>Build a routine when you’re ready</strong><p>A short weekly review can help you revisit older concepts. You choose the schedule.</p></div></div>`;
}

function setup() {
  const panels = [profile, goal, material, firstConnection, review];
  return `<div class="ob-shell"><aside class="ob-sidebar"><a href="#Home" class="ob-logo"><span class="workspace-logo">◒</span>speqq<span class="ob-student-pill">for students</span></a><div class="ob-sidebar-copy"><span>YOUR KNOWLEDGE, OVER TIME</span><h2>Build on what<br>you already know.</h2><p>From your first lecture to your next big exam.</p></div><ol class="ob-steps" aria-label="Setup progress">${STEPS.map((title, i) => `<li class="${i === draft.step ? 'current' : i < draft.step ? 'done' : ''}"><button data-ob="step" data-step="${i}" ${i > draft.step ? 'disabled' : ''} ${i === draft.step ? 'aria-current="step"' : ''}><span>${i < draft.step ? icon('check', 13) : String(i + 1).padStart(2, '0')}</span>${title}</button></li>`).join('')}</ol><div class="ob-sidebar-bottom">${icon('Memory', 17)} A little less starting from scratch.</div></aside><main class="ob-main"><header><span>Student setup</span><a href="#Home">Save & exit ${icon('right', 13)}</a></header><form id="ob-form" class="ob-panel"><div class="ob-mobile-progress">Step ${draft.step + 1} of ${STEPS.length} · ${STEPS[draft.step]}</div><section id="ob-content" tabindex="-1">${panels[draft.step]()}</section><div class="ob-notice" role="status">${escape(notice)}</div><footer class="ob-footer">${draft.step > 0 ? b(icon('left', 14) + ' Back', 'back', 'ob-back') : '<span></span>'}<span class="ob-save-note">Progress saved on this device</span><button class="ob-next" type="submit" ${canContinue(draft) ? '' : 'disabled'}>${draft.step === STEPS.length - 1 ? 'Open my study space' : draft.step === 2 && !draft.materials.length ? 'Try with sample notes' : 'Continue'} ${icon('right', 15)}</button></footer></form></main></div>`;
}

function study() {
  return `<div class="student-space"><header><a href="#Home" class="ob-logo"><span class="workspace-logo">◒</span>speqq</a><span>Your study space</span><a href="#Onboarding">Edit setup</a></header><main><div class="ob-kicker">${escape(draft.major || 'YOUR LEARNING')}${draft.year ? ' · ' + escape(draft.year).toUpperCase() : ''}</div><h1>Keep building, ${escape(draft.name || 'learner')}.</h1><p class="ob-intro">A starting point for connecting what you learn, across courses and semesters.</p><div class="student-grid"><section class="student-goal"><span class="ob-course-tag">YOUR LONG-TERM GOAL</span><h2>${escape(draft.goal || 'Connect what I learn')}</h2>${draft.exam ? `<p>${escape(draft.exam)}${draft.targetDate ? ' · ' + escape(draft.targetDate) : ''}</p>` : ''}<p>Start with one small review. Your learning history can grow from here.</p><a href="#Onboarding" data-ob="revisit" data-step="1">Adjust your goal ${icon('right', 13)}</a></section><section><h2>Your courses</h2>${draft.courses.length ? draft.courses.map(c => `<div class="student-course">${icon('Specs', 18)}${escape(c)}</div>`).join('') : '<p class="ob-small">Add your current and past courses to start building context.</p>'}<a href="#Onboarding" data-ob="revisit" data-step="2">Add or edit courses ${icon('plus', 13)}</a></section></div><section class="student-material"><h2>Your starting material <span>${draft.materials.length}</span></h2>${draft.materials.length ? draft.materials.map(f => `<details><summary>${icon('Specs', 16)} ${escape(f.name)}<span>${f.content ? 'Text note' : 'File reference'}</span></summary><pre>${escape(f.content || 'This file is listed in your setup. Reading PDF and photo contents is not connected in this scaffold yet.')}</pre></details>`).join('') : '<p class="ob-small">You’re exploring with sample notes. Your existing notes can stay in their current apps.</p>'}</section>${draft.connectionSaved ? `<section class="student-saved"><div class="ob-kicker">SAVED EXAMPLE</div><h2>Electrochemical gradients → ATP synthesis</h2><p>The same idea, across General Chemistry and Cell Biology.</p><span class="ob-small">Sample notes · not generated from your uploads</span></section>` : ''}<section class="student-routine"><div>${icon('Calendar', 22)}<h2>Your first routine</h2><p>Set aside a short weekly review to reconnect with older concepts.</p></div>${b(draft.routine ? icon('check', 15) + ' Weekly review added' : 'Add a weekly review', 'routine', 'ob-next')}<span class="ob-small">${draft.routine ? 'Saved as an idea in this study space. Notifications are not scheduled.' : 'Optional · choose a time later'}</span></section><a class="student-original" href="#Home">Explore the original workspace ${icon('right', 14)}</a></main></div>`;
}

async function loadFiles(files, redraw) {
  const allowed = /\.(md|txt|pdf|png|jpe?g)$/i;
  const errors = [];
  for (const file of [...files].slice(0, 10)) {
    if (!allowed.test(file.name)) { errors.push(`${file.name}: use Markdown, text, PDF, or a photo.`); continue; }
    if (file.size > 5 * 1024 * 1024) { errors.push(`${file.name}: please choose a file under 5 MB.`); continue; }
    if (draft.materials.some(f => f.name === file.name)) continue;
    if (draft.materials.length >= 10) { errors.push('Start with up to 10 files. You can add more later.'); break; }
    const content = /\.(md|txt)$/i.test(file.name) ? (await file.text()).slice(0, 100000) : '';
    draft.materials.push({ name: file.name, size: file.size, content });
  }
  notice = errors.join(' ') || 'Added to your starting material. Your originals stay where they are.';
  try { persist(); } catch { notice = 'This browser is out of storage. Remove a file to make room.'; }
  redraw();
}

export function renderStudentRoute(root) {
  const route = location.hash.slice(1).split('/')[0];
  if (!['Onboarding', 'Study'].includes(route)) { controller?.abort(); return false; }
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;
  const draw = (focus = false) => { root.innerHTML = route === 'Study' ? study() : setup(); document.title = route === 'Study' ? 'Your study space · Speqq' : `Student setup · ${STEPS[draft.step]} · Speqq`; if (focus) root.querySelector('#ob-content')?.focus(); };
  draw();
  root.addEventListener('input', e => {
    const key = e.target.name;
    if (['name','major','year','exam','targetDate'].includes(key)) {
      draft[key] = e.target.value;
      persist();
      const next = root.querySelector('button[type="submit"]');
      if (next) next.disabled = !canContinue(draft);
    }
  }, { signal });
  root.addEventListener('submit', e => {
    if (e.target.id !== 'ob-form') return;
    e.preventDefault();
    if (!canContinue(draft)) return;
    notice = '';
    if (draft.step === STEPS.length - 1) { draft.completed = true; persist(); location.hash = 'Study'; return; }
    draft.step++; persist(); draw(true);
  }, { signal });
  root.addEventListener('click', e => {
    const el = e.target.closest('[data-ob]');
    if (!el) return;
    const action = el.dataset.ob;
    if (action === 'goal') { draft.goal = el.dataset.value; if (draft.goal !== 'Prepare for a big exam') { draft.exam = ''; draft.targetDate = ''; } }
    else if (action === 'revisit') { draft.step = Number(el.dataset.step); persist(); return; }
    else if (action === 'source') toggleSource(draft, el.dataset.value);
    else if (action === 'back') { draft.step = Math.max(0, draft.step - 1); notice = ''; }
    else if (action === 'step' || action === 'edit') draft.step = Number(el.dataset.step);
    else if (action === 'course') addCourse(draft, root.querySelector('#ob-course').value);
    else if (action === 'remove-course') draft.courses.splice(Number(el.dataset.index), 1);
    else if (action === 'remove-file') draft.materials.splice(Number(el.dataset.index), 1);
    else if (action === 'reason') showReason = !showReason;
    else if (action === 'keep') draft.connectionSaved = !draft.connectionSaved;
    else if (action === 'routine') draft.routine = !draft.routine;
    persist(); draw(['back','step','edit'].includes(action));
    if (action === 'course') root.querySelector('#ob-course')?.focus();
    else if (['goal','source','reason','keep','routine'].includes(action)) {
      [...root.querySelectorAll('[data-ob]')].find(button => button.dataset.ob === action && button.dataset.value === el.dataset.value)?.focus();
    }
  }, { signal });
  root.addEventListener('keydown', e => { if (e.target.id === 'ob-course' && e.key === 'Enter') { e.preventDefault(); addCourse(draft, e.target.value); persist(); draw(); root.querySelector('#ob-course')?.focus(); } }, { signal });
  root.addEventListener('change', e => { if (e.target.id === 'ob-files') loadFiles(e.target.files, draw); }, { signal });
  root.addEventListener('dragover', e => { if (e.target.closest('#ob-drop')) e.preventDefault(); }, { signal });
  root.addEventListener('drop', e => { if (e.target.closest('#ob-drop')) { e.preventDefault(); loadFiles(e.dataTransfer.files, draw); } }, { signal });
  return true;
}
