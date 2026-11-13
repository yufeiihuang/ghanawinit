import { icon } from './icons.js';
import { STEPS, ONBOARDING_KEY, readDraft, canContinue, addCourse, toggleSource } from './onboarding-state.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const roles = ['Student', 'Educator', 'Researcher', 'Other'];
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
let importSource = '';
let selectedCourses = [];
let showManual = false;
const sampleCourses = ['General Chemistry', 'Cell Biology', 'Calculus I', 'Introduction to Psychology'];
const persist = () => localStorage.setItem(ONBOARDING_KEY, JSON.stringify(draft));
const b = (text, action, classes = '', attrs = '') => `<button type="button" class="${classes}" data-ob="${action}" ${attrs}>${text}</button>`;
const field = (label, key, placeholder = '', type = 'text', required = false) => `<label class="ob-field">${label}<input name="${key}" type="${type}" value="${escape(draft[key])}" placeholder="${placeholder}" ${required ? 'required' : ''} maxlength="100"></label>`;

function profile() {
  return `<div class="ob-kicker">MADE FOR YOUR NEXT SEMESTER, TOO</div><h1>A place for everything you’re learning</h1><p class="ob-intro">Tell us a little about yourself to set up your workspace</p><label class="ob-field"><span>How will you use Speqq?</span><select name="role" required><option value="">Choose your role</option>${roles.map(role => `<option value="${role}" ${draft.role === role ? 'selected' : ''}>${role}</option>`).join('')}</select></label><div class="ob-form-grid">${field('What should we call you?', 'name', 'Your first name', 'text', true)}${field('Area of study or work', 'major', 'e.g. Biology, pre-med, engineering', 'text', true)}</div><label class="ob-field ob-year-field" ${draft.role === 'Student' ? '' : 'hidden'}><span>Where are you in your studies? <span class="ob-optional">Optional</span></span><select name="year"><option value="">Choose your year</option>${['First year','Second year','Third year','Fourth year','Graduate student','Other'].map(y => `<option ${draft.year === y ? 'selected' : ''}>${y}</option>`).join('')}</select></label><div class="ob-reassurance">${icon('lock', 15)} Your study space starts private.</div>`;
}

function goal() {
  return `<div class="ob-kicker">THE BIGGER PICTURE</div><h1>What are you working toward?</h1><p class="ob-intro">Choose one place to start. You can add more goals later</p><div class="ob-choices">${goals.map(([title, description, glyph]) => b(`<span class="ob-choice-icon">${icon(glyph, 22)}</span><span><strong>${title}</strong><small>${description}</small></span><span class="ob-radio"></span>`, 'goal', 'ob-choice ' + (draft.goal === title ? 'chosen' : ''), `data-value="${title}" aria-pressed="${draft.goal === title}"`)).join('')}</div>${draft.goal === 'Prepare for a big exam' ? `<div class="ob-form-grid ob-goal-fields">${field('Exam', 'exam', 'e.g. MCAT')}${field('Target date · optional', 'targetDate', '', 'date')}</div>` : ''}`;
}

const courseProviders = [
  ['Canvas', 'C', 'canvas', 'Courses from your Canvas account'],
  ['Brightspace', 'B', 'brightspace', 'Courses from your school’s Brightspace'],
  ['mySchoolApp', 'm', 'myschoolapp', 'Your classes from mySchoolApp']
];

function material() {
  const chips = draft.courses.map((course, i) => b(`${escape(course)} ${icon('close', 11)}`, 'remove-course', 'ob-chip', `data-index="${i}" aria-label="Remove ${escape(course)}"`)).join('');
  return `<h1>Add your courses</h1><p class="ob-intro">Connect your school account or upload a transcript</p><div class="ob-import-options">${courseProviders.map(([name, mark, brand]) => `<div class="connector-card ob-provider"><span class="brand ob-provider-mark" aria-hidden="true">${brand === 'canvas' ? '◌' : brand === 'brightspace' ? 'D' : icon('Specs', 20)}</span><span class="row-copy ob-provider-copy"><span>${name}</span><small>Import your classes</small></span>${b(draft.connections.includes(name) ? 'Connected' : 'Connect', 'connect', 'ob-provider-connect', `data-value="${name}" aria-label="Connect ${name}"`)}</div>`).join('')}</div><p class="ob-section-label">Or use a transcript</p><label class="connector-card ob-provider ob-transcript" for="ob-transcript"><span class="brand ob-provider-mark" aria-hidden="true">${icon('Specs', 20)}</span><span class="row-copy ob-provider-copy"><span>Upload a transcript</span><small>PDF, JPG or PNG up to 5 MB</small></span><span class="ob-upload-action">Choose file</span><input id="ob-transcript" type="file" accept=".pdf,.png,.jpg,.jpeg" aria-label="Upload a transcript"></label>${draft.transcripts.length ? `<div class="ob-file-list">${draft.transcripts.map((file, i) => `<div>${icon('Specs', 14)}<span>${escape(file.name)}</span>${b(icon('close', 13), 'remove-transcript', 'icon-button', `data-index="${i}" aria-label="Remove ${escape(file.name)}"`)}</div>`).join('')}</div>` : ''}<div class="ob-manual-row"><span>Prefer to add them yourself?</span>${b('Add courses manually', 'manual', 'ob-outline')}</div>${showManual ? `<label class="ob-course-label" for="ob-course">Course name</label><div class="ob-course-input"><input id="ob-course" placeholder="e.g. General Chemistry" maxlength="100">${b('Add course', 'course', 'ob-outline')}</div>` : ''}${draft.courses.length ? `<div class="ob-section-label">Your courses</div><div class="ob-course-chips">${chips}</div>` : ''}${importSource ? `<div class="ob-import-review" role="region" aria-label="Choose courses"><h2>Choose your courses</h2><p class="ob-small">${escape(importSource)}</p>${sampleCourses.map((course, i) => `<label class="ob-import-course"><input type="checkbox" data-import-index="${i}" ${selectedCourses.includes(course) ? 'checked' : ''}>${course}</label>`).join('')}<div class="ob-import-actions">${b('Cancel', 'cancel-import', 'ob-outline')}${b('Add selected courses', 'confirm-import', 'primary ob-next', selectedCourses.length ? '' : 'disabled')}</div></div>` : ''}`;
}

function firstConnection() {
  return `<div class="ob-kicker">A SMALL FIRST WIN</div><h1>New semester, familiar ideas</h1><p class="ob-intro">Here’s an example of how Speqq could connect something you’re learning now to something you already know</p><div class="ob-example-label">${icon('Memory', 14)} Example using sample course notes</div><div class="ob-connection"><article><span class="ob-course-tag">General Chemistry · last semester</span><h3>Electrochemical gradients</h3><p>Ions move according to both concentration and electrical charge</p></article><div class="ob-connection-line"><span></span>${icon('Connectors', 20)}<span></span></div><article><span class="ob-course-tag">Cell Biology · this semester</span><h3>ATP synthesis</h3><p>A proton gradient across a membrane helps power ATP synthase</p></article></div><div class="ob-insight"><strong>The connection</strong><p>The same gradient principle explains how cells turn stored energy into ATP. Your chemistry notes can give you a head start in cell biology</p>${b((showReason ? 'Hide' : 'Show') + ' the source notes', 'reason', 'ob-text-link')}</div>${showReason ? `<div class="ob-source-notes"><p><strong>Sample chemistry note:</strong> “An electrochemical gradient combines the concentration difference and the voltage across a membrane.”</p><p><strong>Sample biology note:</strong> “Protons flow down their electrochemical gradient through ATP synthase.”</p></div>` : ''}<div class="ob-example-actions">${b(draft.connectionSaved ? icon('check', 14) + ' Connection saved' : icon('plus', 14) + ' Keep this example', 'keep', 'subtle', `aria-pressed="${Boolean(draft.connectionSaved)}"`)}<span>You decide which connections to keep</span></div>`;
}

function review() {
  return `<div class="ob-kicker">ROOM TO GROW</div><h1>Your next semester starts with context</h1><p class="ob-intro">${escape(draft.name)}, here’s the starting point for your study space. You can change any of this later</p><div class="ob-review"><div><span>Using Speqq as</span><strong>${escape(draft.role)}</strong>${b('Edit', 'edit', 'ob-text-link', 'data-step="0"')}</div><div><span>Focus</span><strong>${escape(draft.major)}${draft.year ? ' · ' + escape(draft.year) : ''}</strong>${b('Edit', 'edit', 'ob-text-link', 'data-step="0"')}</div><div><span>Starting goal</span><strong>${escape(draft.goal)}${draft.exam ? ' · ' + escape(draft.exam) : ''}</strong>${b('Edit', 'edit', 'ob-text-link', 'data-step="1"')}</div><div><span>Courses</span><strong>${escape(draft.courses.join(', ') || 'Add them when you’re ready')}</strong>${b('Edit', 'edit', 'ob-text-link', 'data-step="2"')}</div><div><span>Transcripts</span><strong>${draft.transcripts.length ? draft.transcripts.length + ' uploaded' : 'None selected'}</strong>${b('Edit', 'edit', 'ob-text-link', 'data-step="2"')}</div><div><span>Starting material</span><strong>${draft.materials.length ? draft.materials.length + ' file' + (draft.materials.length === 1 ? '' : 's') : 'Sample course notes'}</strong>${b('Edit', 'edit', 'ob-text-link', 'data-step="2"')}</div></div><div class="ob-next-preview">${icon('Calendar', 22)}<div><strong>Build a routine when you’re ready</strong><p>A short weekly review can help you revisit older concepts. You choose the schedule</p></div></div>`;
}

function setup() {
  const panels = [profile, goal, material, firstConnection, review];
  return `<div class="ob-shell"><aside class="ob-sidebar"><div class="ob-logo"><span class="workspace-logo">◒</span>speqq</div><ol class="ob-steps" aria-label="Setup progress">${STEPS.map((title, i) => `<li class="${i === draft.step ? 'current' : i < draft.step ? 'done' : ''}"><button type="button" class="nav-item ${i === draft.step ? 'active' : ''}" data-ob="step" data-step="${i}" ${i > draft.step ? 'disabled' : ''} ${i === draft.step ? 'aria-current="step"' : ''}>${title}</button></li>`).join('')}</ol><div class="ob-sidebar-bottom">Set up Speqq</div></aside><main class="ob-main"><header class="topbar"><span>Set up Speqq <span class="ob-breadcrumb">/</span> ${STEPS[draft.step]}</span>${b('Save and exit', 'exit', 'ob-outline')}</header><form id="ob-form" class="page ob-panel"><div class="ob-mobile-progress">Step ${draft.step + 1} of ${STEPS.length} — ${STEPS[draft.step]}</div><section id="ob-content" tabindex="-1">${panels[draft.step]()}</section><div class="ob-notice" role="status">${escape(notice)}</div><footer class="ob-footer">${draft.step > 0 ? b('Back', 'back', 'ob-outline') : '<span></span>'}<div class="ob-footer-actions">${draft.step === 2 ? b('Skip for now', 'skip', 'ob-outline') : ''}<button class="primary ob-next" type="submit" ${canContinue(draft) ? '' : 'disabled'}>${draft.step === STEPS.length - 1 ? 'Open my study space' : 'Continue'}</button></div></footer></form></main></div>`;
}

function study() {
  return `<div class="student-space"><header><a href="#Home" class="ob-logo"><span class="workspace-logo">◒</span>speqq</a><span>Your study space</span><a href="#Onboarding">Edit setup</a></header><main><div class="ob-kicker">${escape(draft.major || 'YOUR LEARNING')}${draft.year ? ' · ' + escape(draft.year).toUpperCase() : ''}</div><h1>Keep building, ${escape(draft.name || 'learner')}</h1><p class="ob-intro">A starting point for connecting what you learn, across courses and semesters</p><div class="student-grid"><section class="student-goal"><span class="ob-course-tag">YOUR LONG-TERM GOAL</span><h2>${escape(draft.goal || 'Connect what I learn')}</h2>${draft.exam ? `<p>${escape(draft.exam)}${draft.targetDate ? ' · ' + escape(draft.targetDate) : ''}</p>` : ''}<p>Start with one small review. Your learning history can grow from here</p><a href="#Onboarding" data-ob="revisit" data-step="1">Adjust your goal ${icon('right', 13)}</a></section><section><h2>Your courses</h2>${draft.courses.length ? draft.courses.map(c => `<div class="student-course">${icon('Specs', 18)}${escape(c)}</div>`).join('') : '<p class="ob-small">Add your current and past courses to start building context</p>'}<a href="#Onboarding" data-ob="revisit" data-step="2">Add or edit courses ${icon('plus', 13)}</a></section></div><section class="student-material"><h2>Your starting material <span>${draft.materials.length}</span></h2>${draft.materials.length ? draft.materials.map(f => `<details><summary>${icon('Specs', 16)} ${escape(f.name)}<span>${f.content ? 'Text note' : 'File reference'}</span></summary><pre>${escape(f.content || 'This file is listed in your setup. Reading PDF and photo contents is not connected in this scaffold yet.')}</pre></details>`).join('') : '<p class="ob-small">You’re exploring with sample notes. Your existing notes can stay in their current apps</p>'}</section>${draft.connectionSaved ? `<section class="student-saved"><div class="ob-kicker">SAVED EXAMPLE</div><h2>Electrochemical gradients → ATP synthesis</h2><p>The same idea, across General Chemistry and Cell Biology</p><span class="ob-small">Sample notes · not generated from your uploads</span></section>` : ''}<section class="student-routine"><div>${icon('Calendar', 22)}<h2>Your first routine</h2><p>Set aside a short weekly review to reconnect with older concepts</p></div>${b(draft.routine ? icon('check', 15) + ' Weekly review added' : 'Add a weekly review', 'routine', 'primary ob-next')}<span class="ob-small">${draft.routine ? 'Saved as an idea in this study space. Notifications are not scheduled.' : 'Optional · choose a time later'}</span></section><a class="student-original" href="#Home">Explore the original workspace ${icon('right', 14)}</a></main></div>`;
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
  const draw = (focus = false) => { root.innerHTML = route === 'Study' ? study() : setup(); document.title = route === 'Study' ? 'Your study space · Speqq' : `Set up Speqq · ${STEPS[draft.step]} · Speqq`; if (focus) root.querySelector('#ob-content')?.focus(); };
  draw();
  root.addEventListener('input', e => {
    const key = e.target.name;
    if (['name','role','major','year','exam','targetDate'].includes(key)) {
      draft[key] = e.target.value;
      persist();
      if (key === 'role') root.querySelector('.ob-year-field').hidden = draft.role !== 'Student';
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
    else if (action === 'exit') { persist(); location.hash = 'Home'; return; }
    else if (action === 'connect') { importSource = el.dataset.value; selectedCourses = [...sampleCourses]; notice = ''; }
    else if (action === 'cancel-import') { importSource = ''; selectedCourses = []; }
    else if (action === 'confirm-import') {
      selectedCourses.forEach(course => addCourse(draft, course));
      if (courseProviders.some(([name]) => name === importSource) && !draft.connections.includes(importSource)) draft.connections.push(importSource);
      notice = `${selectedCourses.length} courses added`;
      importSource = ''; selectedCourses = [];
    }
    else if (action === 'manual') showManual = !showManual;
    else if (action === 'skip') { draft.step++; importSource = ''; notice = ''; }
    else if (action === 'source') toggleSource(draft, el.dataset.value);
    else if (action === 'back') { draft.step = Math.max(0, draft.step - 1); notice = ''; }
    else if (action === 'step' || action === 'edit') draft.step = Number(el.dataset.step);
    else if (action === 'course') addCourse(draft, root.querySelector('#ob-course').value);
    else if (action === 'remove-course') draft.courses.splice(Number(el.dataset.index), 1);
    else if (action === 'remove-transcript') draft.transcripts.splice(Number(el.dataset.index), 1);
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
  root.addEventListener('change', e => {
    if (e.target.matches('[data-import-index]')) {
      const course = sampleCourses[Number(e.target.dataset.importIndex)];
      selectedCourses = e.target.checked ? [...selectedCourses, course] : selectedCourses.filter(item => item !== course);
      const confirm = root.querySelector('[data-ob="confirm-import"]');
      confirm.disabled = !selectedCourses.length;
    }
    if (e.target.id === 'ob-files') loadFiles(e.target.files, draw);
    if (e.target.id === 'ob-transcript') {
      const file = e.target.files[0];
      if (!file) return;
      if (!/\.(pdf|png|jpe?g)$/i.test(file.name) || file.size > 5 * 1024 * 1024) {
        notice = 'Choose a PDF, PNG, or JPG transcript up to 5 MB.';
      } else if (draft.transcripts.length >= 5) {
        notice = 'You can list up to five transcripts. Remove one to choose another.';
      } else {
        if (!draft.transcripts.some(item => item.name === file.name)) draft.transcripts.push({ name: file.name, size: file.size });
        importSource = 'Transcript'; selectedCourses = [...sampleCourses]; notice = '';
        persist();
      }
      draw();
    }
  }, { signal });
  root.addEventListener('dragover', e => { if (e.target.closest('#ob-drop')) e.preventDefault(); }, { signal });
  root.addEventListener('drop', e => { if (e.target.closest('#ob-drop')) { e.preventDefault(); loadFiles(e.dataTransfer.files, draw); } }, { signal });
  return true;
}
