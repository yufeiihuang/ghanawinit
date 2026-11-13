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
