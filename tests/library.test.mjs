import test from 'node:test';
import assert from 'node:assert/strict';
import { newDraft } from '../src/onboarding-state.js';
globalThis.localStorage = { getItem: () => null };
const { libraryFiles } = await import('../src/library.js');

test('Library combines setup notes and transcripts with imported files and preserves folder assignments', () => {
  const draft = {...newDraft(), materials:[{name:'Lecture.md',content:'Chemistry',size:9}], transcripts:[{name:'Transcript.pdf',size:200}]};
  const saved = {files:[{id:'setup-note-Lecture.md',name:'Lecture.md',content:'Chemistry',folder:'Chemistry',source:'Upload'},{id:'notion-1',name:'Reading.md',source:'Notion'}],folders:['Chemistry']};
  const files = libraryFiles(draft,saved);
  assert.equal(files.length,3);
  assert.equal(files.find(f=>f.name==='Lecture.md').folder,'Chemistry');
  assert.equal(files.find(f=>f.name==='Transcript.pdf').source,'Transcript');
  assert.equal(files.find(f=>f.id==='notion-1').source,'Notion');
  assert.equal(draft.materials[0].folder,undefined);
});

test('folder selection stays pending until Done and closing or Escape discards it', async()=>{
 const values=new Map([['speqq-active-workspace','umami'],['speqq-library-v1',JSON.stringify({folders:['Biology','Chemistry'],files:[{id:'file-1',name:'Notes.md',folder:'Biology',source:'Upload'}]})]]);
 globalThis.localStorage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
 globalThis.document={addEventListener(){}};
 const {renderLibrary,bindLibrary}=await import('../src/library.js');
 const handlers={},notifications=[];
 const root={innerHTML:'',addEventListener(name,fn){handlers[name]=fn;}};
 const redraw=()=>{root.innerHTML=renderLibrary();};redraw();
 bindLibrary(root,redraw,true,(message,undo)=>notifications.push({message,undo}));
 const click=action=>handlers.click({target:{closest:()=>({dataset:{lib:action,id:'file-1'}})}});
 const choose=value=>handlers.change({target:{id:'lib-file-folder',value,matches:()=>false}});
 const savedFolder=()=>JSON.parse(values.get('speqq-library-v1')).files[0].folder;
 click('open');await choose('Chemistry');assert.equal(savedFolder(),'Biology');assert.equal(notifications.length,0);
 click('close');click('open');assert(root.innerHTML.includes('value="Biology" selected'));assert.equal(savedFolder(),'Biology');
 await choose('Chemistry');handlers.keydown({key:'Escape'});click('open');assert(root.innerHTML.includes('value="Biology" selected'));
 await choose('Chemistry');click('file-done');assert.equal(savedFolder(),'Chemistry');assert.equal(notifications.length,1);
 assert.equal(notifications[0].message,'Moved to Chemistry');notifications[0].undo();assert.equal(savedFolder(),'Biology');
 click('open');click('file-done');assert.equal(notifications.length,1);
 bindLibrary(root,redraw,false);
});
