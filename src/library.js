import { helpButton } from './tooltips.js';
import { organizationPlan, applyOrganization, undoOrganization } from './routine-controls.js';
import { workspaceKey } from './workspace-storage.js';
import { icon } from './icons.js';
import { readDraft } from './onboarding-state.js';
const appLogos = {'Google Drive':'google-drive.svg',Notability:'notability.ico',Notion:'notion.svg',Goodnotes:'goodnotes.png',Obsidian:'obsidian.svg'};
const appLogo = app => `<img class="lib-app-logo" src="./src/assets/logos/${appLogos[app]}" alt="" aria-hidden="true">`;
let KEY = workspaceKey('speqq-library-v1');
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let db;
try { db = JSON.parse(localStorage.getItem(KEY)); } catch {}
if (!db || !Array.isArray(db.files) || !Array.isArray(db.folders)) db = { files: [], folders: [] };
let query = '', folder = '', grid = false, menu = false, panel = '', selected = '', notice = '', importApp = '', chosen = [];
let controller;
const blobs = new Map();
const save = () => localStorage.setItem(KEY, JSON.stringify(db));
const btn = (label, action, cls = '', extra = '') => `<button type="button" class="${cls}" data-lib="${action}" ${extra}>${label}</button>`;
export function libraryFiles(draft, saved) {
  const files = new Map();
  for (const [kind, list] of [['note', draft.materials], ['transcript', draft.transcripts]]) {
    for (const file of list) files.set(`setup-${kind}-${file.name}`, { ...file, id: `setup-${kind}-${file.name}`, source: kind === 'note' ? 'Upload' : 'Transcript', folder: '', date: 'Added in setup' });
  }
  for (const file of saved.files) files.set(file.id, file);
  return [...files.values()];
}
function syncLibrary() {
 const next=workspaceKey('speqq-library-v1');
 if(KEY!==next){query='';folder='';panel='';menu=false;notice='';selected='';}
 KEY=next;
 try{db=JSON.parse(localStorage.getItem(KEY));}catch{db=null;}
 if(!db||!Array.isArray(db.files)||!Array.isArray(db.folders))db={files:[],folders:[]};
}
export function routineLibraryContext(){syncLibrary();return {files:allFiles(),folders:folders()};}
export function previewOrganization(access){syncLibrary();return organizationPlan(allFiles(),db,access);}
export function organizeLibrary(access,proposed){
 syncLibrary();const storageKey=KEY;
 const {saved,applied,createdFolders}=applyOrganization(allFiles(),db,access,proposed);
 if(!applied.length)return null;
 db=saved;save();
 return {count:applied.length,undo:()=>{if(workspaceKey('speqq-library-v1')!==storageKey)return false;syncLibrary();db=undoOrganization(db,applied,createdFolders);save();return true;}};
}
const allFiles = () => libraryFiles(readDraft(localStorage), db);
const folders = () => [...new Set([...readDraft(localStorage).courses, ...db.folders])];
const type = f => f.name.split('.').pop().toUpperCase();
const size = f => f.size ? f.size < 1024 * 1024 ? `${Math.ceil(f.size / 1024)} KB` : `${(f.size / 1024 / 1024).toFixed(1)} MB` : '—';
const importNames = app => [`${app} course notes.md`, `${app} reading summary.md`, `${app} study guide.md`];
function overlay() {
  if (!panel) return '';
  let title = '', body = '';
  if (panel === 'import') {
    title = `Import from ${importApp}`;
    body = `<p class="muted">Choose notes to add to your Library</p><div class="lib-import-list">${importNames(importApp).map((name, i) => `<label><input type="checkbox" data-lib-import="${i}" ${chosen.includes(i) ? 'checked' : ''}>${esc(name)}</label>`).join('')}</div><div class="dialog-footer">${btn('Cancel','close','subtle')}${btn('Import selected','import-confirm','primary', chosen.length ? '' : 'disabled')}</div>`;
  } else if (panel === 'scan') {
    title = 'Scan to add handwritten notes';
    body = `<div class="lib-qr"><img src="./src/assets/notes-upload-qr.svg" width="180" height="180" alt="QR code for phone upload demo"><div><p>Scan with your phone’s camera</p><p class="muted">Take a photo of your notes or choose one from your library</p></div></div><div class="dialog-footer">${btn('Preview phone upload','phone','primary')}</div>`;
  } else if (panel === 'phone') {
    title = 'Add handwritten notes';
    body = `<div class="lib-phone">${icon('Specs',32)}<p>Capture a page of your notes</p>${btn('Take photo','camera','primary')}${btn('Use sample photo','sample','subtle')}</div>`;
  } else if (panel === 'folder') {
    title = 'New folder';
    body = `<form id="lib-folder-form"><label>Folder name<input name="folderName" maxlength="100" required placeholder="e.g. Biology 101"></label><div class="dialog-footer">${btn('Cancel','close','subtle')}<button type="submit" class="primary">Create folder</button></div></form>`;
  } else {
    const file = allFiles().find(f => f.id === selected);
    if (!file) return '';
    title = file.name;
    const url = blobs.get(file.id);
    body = `<div class="lib-file-meta"><span>${esc(file.source)}</span><span>${type(file)}</span><span>${size(file)}</span></div>${file.content ? `<pre class="lib-text-preview">${esc(file.content)}</pre>` : url && /\.(png|jpe?g|webp)$/i.test(file.name) ? `<img class="lib-image-preview" src="${url}" alt="${esc(file.name)}">` : `<div class="lib-no-preview">${icon('Specs',40)}<p>${esc(file.name)}</p></div>`}<div class="lib-keep-row"><label class="routine-check"><input type="checkbox" id="lib-keep-file" ${file.keepInPlace?'checked':''}><span>Keep in place</span></label>${helpButton('Keep in place','keep')}</div><label>Folder<select id="lib-file-folder"><option value="">My files</option>${folders().map(name => `<option value="${esc(name)}" ${file.folder === name ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select></label><div class="dialog-footer">${btn('Done','close','primary')}</div>`;
  }
  return `<div class="modal-backdrop" data-lib="close"></div><section class="dialog lib-dialog" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="dialog-heading"><h2>${esc(title)}</h2>${btn(icon('close'),'close','icon-button','aria-label="Close Library dialog"')}</div>${body}</section>`;
}
export function renderLibrary() {
  const nextKey = workspaceKey('speqq-library-v1');
  if (nextKey !== KEY) { KEY = nextKey; try { db = JSON.parse(localStorage.getItem(KEY)) || {files:[],folders:[]}; } catch { db = {files:[],folders:[]}; } query = ''; folder = ''; panel = ''; menu = false; notice = ''; }
  syncLibrary();
  const files = allFiles().filter(f => (!folder || f.folder === folder) && f.name.toLowerCase().includes(query.toLowerCase()));
  const list = files.map(file => `<button class="lib-file ${grid ? 'lib-file-card' : ''}" data-lib="open" data-id="${esc(file.id)}"><span class="lib-file-name"><span class="brand">${icon('Specs',18)}</span><span>${esc(file.name)}${file.keepInPlace?icon('lock',12):''}</span></span><span>${esc(file.source)}</span><span>${esc(file.folder || 'My files')}</span><span>${esc(file.date || 'Today')}</span><span>${size(file)}</span></button>`).join('');
  return `<div class="page library-page"><div class="page-title"><h1>Library</h1><span class="spacer"></span><div class="lib-add-wrap">${btn(icon('plus',16)+' New','new','primary','aria-label="Add to Library" aria-expanded="'+menu+'"')}${menu ? `<div class="popup-menu lib-add-menu" role="menu">${btn('Upload files','upload')}${btn('Upload a picture','picture')}${btn('Scan with your phone','scan')}<hr>${['Google Drive','Notability','Notion','Goodnotes','Obsidian'].map(app => btn(`${appLogo(app)}<span>Import from ${app}</span>`,'import','',`data-app="${app}"`)).join('')}<hr>${btn('New folder','folder')}</div>` : ''}</div></div><div class="toolbar"><label class="search">${icon('search',15)}<input id="lib-search" placeholder="Search in Library" aria-label="Search in Library" value="${esc(query)}"></label><span class="spacer"></span>${btn(icon(grid ? 'list' : 'grid',16), 'view', 'icon-button', `aria-label="Switch to ${grid ? 'list' : 'grid'} view"`)}</div><div class="lib-breadcrumb">${btn('My files','root',folder ? '' : 'bright')}${folder ? icon('right',12)+`<span>${esc(folder)}</span><span class="spacer"></span><label class="routine-check"><input id="lib-keep-folder" type="checkbox" ${(db.lockedFolders||[]).includes(folder)?'checked':''}>Keep folder in place</label>${helpButton('Keep folder in place','keep')}` : ''}</div>${!folder && !query && folders().length ? `<h3 class="muted">Folders</h3><div class="lib-folders">${folders().map(name => btn(icon('Library',18)+esc(name),'open-folder','',`data-folder="${esc(name)}"`)).join('')}</div>` : ''}<div class="lib-files-heading"><h3>${folder ? esc(folder) : 'Files'}</h3><span class="muted">${files.length} ${files.length === 1 ? 'file' : 'files'}</span></div>${!grid && files.length ? '<div class="lib-table-head"><span>Name</span><span>Source</span><span>Folder</span><span>Added</span><span>Size</span></div>' : ''}<div class="${grid ? 'lib-grid' : 'lib-list'}">${list || `<div class="empty">${icon('Library',32)}<h3>${query ? 'No matching files' : 'Your files belong here'}</h3><p>${query ? 'Try another search' : 'Upload notes, readings, slides, or photos to get started'}</p>${!query ? `${btn(icon('plus',14)+' Add files','new','subtle')}<div class="lib-empty-imports"><p>Or bring files from the tools you already use</p><div>${['Google Drive','Notability','Notion','Goodnotes'].map(app => btn(`${appLogo(app)}<span>Import from ${app}</span>`, 'import', 'lib-import-shortcut', `data-app="${app}"`)).join('')}</div></div>` : ''}</div>`}</div><div class="lib-status" role="status">${esc(notice)}</div><input hidden type="file" id="lib-upload" multiple><input hidden type="file" id="lib-picture" accept=".png,.jpg,.jpeg,.webp" multiple><input hidden type="file" id="lib-camera" accept="image/*" capture="environment">${overlay()}</div>`;
}
export function bindLibrary(root, redraw, active, notify = () => {}) {
  controller?.abort();
  if (!active) { menu = false; panel = ''; return; }
  controller = new AbortController();
  const opts = { signal: controller.signal };
  const dismissMenu = () => {
    menu = false;
    root.querySelector('.lib-add-menu')?.remove();
    root.querySelector('[aria-label="Add to Library"]')?.setAttribute('aria-expanded', 'false');
  };
  document.addEventListener('pointerdown', e => {
    if (menu && !e.target.closest('.lib-add-wrap')) dismissMenu();
  }, opts);
  root.addEventListener('click', e => {
    const el = e.target.closest('[data-lib]'); if (!el) return;
    const action = el.dataset.lib;
    if (['upload','picture','camera'].includes(action)) { dismissMenu(); root.querySelector(`#lib-${action}`).click(); return; }
    if (action === 'new') menu = !menu;
    else if (action === 'close') panel = '';
    else if (action === 'view') grid = !grid;
    else if (action === 'root') folder = '';
    else if (action === 'open-folder') folder = el.dataset.folder;
    else if (action === 'open') { selected = el.dataset.id; panel = 'file'; }
    else if (action === 'import') { importApp = el.dataset.app; chosen = [0,1,2]; panel = 'import'; }
    else if (action === 'folder') panel = 'folder';
    else if (action === 'scan' || action === 'phone') panel = action;
    else if (action === 'sample') {
      db.files.push({id:crypto.randomUUID(),name:'Handwritten notes.jpg',source:'Phone scan',folder,date:'Today',size:0,content:''}); save(); panel = ''; notice = 'Handwritten notes added';
    } else if (action === 'import-confirm') {
      for (const i of chosen) { const name = importNames(importApp)[i]; if (!db.files.some(f => f.name === name && f.source === importApp)) db.files.push({id:crypto.randomUUID(),name,source:importApp,folder,date:'Today',size:0,content:`# ${name.replace('.md','')}\n\nSample imported notes for your study workspace`}); }
      save(); panel = ''; notice = 'Notes added to your Library';
    }
    if (action !== 'new') menu = false;
    redraw();
  }, opts);
  root.addEventListener('input', e => {
    if (e.target.id !== 'lib-search') return;
    const pos = e.target.selectionStart; query = e.target.value; redraw();
    const input = root.querySelector('#lib-search'); input.focus(); input.setSelectionRange(pos,pos);
  }, opts);
  root.addEventListener('change', async e => {
    if(e.target.id==='lib-keep-file'){const file=allFiles().find(f=>f.id===selected);db.files=db.files.filter(f=>f.id!==selected);db.files.push({...file,keepInPlace:e.target.checked});save();return;}
    if(e.target.id==='lib-keep-folder'){db.lockedFolders=e.target.checked?[...new Set([...(db.lockedFolders||[]),folder])]:(db.lockedFolders||[]).filter(f=>f!==folder);save();return;}
    if (e.target.matches('[data-lib-import]')) { const i = Number(e.target.dataset.libImport); chosen = e.target.checked ? [...chosen,i] : chosen.filter(n => n !== i); root.querySelector('[data-lib="import-confirm"]').disabled = !chosen.length; return; }
    if (e.target.id === 'lib-file-folder') {
      const file = allFiles().find(f => f.id === selected), destination=e.target.value;
      if(!file||(file.folder||'')===destination)return;
      const storageKey=KEY,change={id:file.id,from:file.folder||'',to:destination};
      db.files=db.files.filter(f=>f.id!==file.id);db.files.push({...file,folder:destination});save();panel='';redraw();
      notify(`Moved to ${destination||'My files'}`,()=>{if(workspaceKey('speqq-library-v1')!==storageKey)return false;syncLibrary();db=undoOrganization(db,[change]);save();return true;});
      return;
    }
    if (!['lib-upload','lib-picture','lib-camera'].includes(e.target.id)) return;
    const errors = [];
    for (const file of [...e.target.files]) {
      if (file.size > 10 * 1024 * 1024) { errors.push(`${file.name} exceeds 10 MB`); continue; }
      const id = crypto.randomUUID(), content = /\.(md|txt|csv)$/i.test(file.name) ? (await file.text()).slice(0,100000) : '';
      db.files.push({id,name:file.name,size:file.size,content,folder,source:e.target.id === 'lib-camera' ? 'Phone scan' : 'Upload',date:'Today'}); blobs.set(id, URL.createObjectURL(file));
    }
    try { save(); notice = errors.join(' — ') || 'Files added to your Library'; } catch { notice = 'Browser storage is full'; }
    panel = ''; menu = false; redraw();
  }, opts);
  root.addEventListener('submit', e => {
    if (e.target.id !== 'lib-folder-form') return;
    e.preventDefault(); const name = String(new FormData(e.target).get('folderName')).trim();
    if (!name) return; if (!folders().includes(name)) db.folders.push(name); save(); panel = ''; redraw();
  }, opts);
  root.addEventListener('keydown', e => { if (e.key === 'Escape' && (menu || panel)) { menu = false; panel = ''; redraw(); } }, opts);
}
