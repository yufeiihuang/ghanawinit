import test from 'node:test';
import assert from 'node:assert/strict';
import { newDraft, readDraft, canContinue, addCourse, toggleSource, ONBOARDING_KEY } from '../src/onboarding-state.js';

test('setup requires study context and one goal, but never requires migration', () => {
  const draft = newDraft();
  assert.equal(canContinue(draft), false);
  draft.name = 'Maya'; draft.major = 'Biology';
  assert.equal(canContinue(draft), true);
  draft.step = 1;
  assert.equal(canContinue(draft), false);
  draft.goal = 'Connect what I learn';
  assert.equal(canContinue(draft), true);
  draft.step = 2;
  assert.equal(canContinue(draft), true);
  assert.deepEqual(draft.materials, []);
});

test('saved progress resumes and malformed storage falls back safely', () => {
  let raw = JSON.stringify({ name: 'Maya', major: 'Biology', step: 3, courses: ['Chemistry'] });
  const storage = { getItem(key) { assert.equal(key, ONBOARDING_KEY); return raw; } };
  assert.equal(readDraft(storage).step, 3);
  assert.deepEqual(readDraft(storage).courses, ['Chemistry']);
  raw = '{broken';
  assert.deepEqual(readDraft(storage), newDraft());
  raw = JSON.stringify({ name: 4, major: null, step: 99, courses: 'bad' });
  const recovered = readDraft(storage);
  assert.equal(recovered.step, 4);
  assert.equal(recovered.name, '');
  assert.deepEqual(recovered.courses, []);
});

test('courses are trimmed and deduplicated without losing semester context', () => {
  const draft = newDraft();
  addCourse(draft, ' General Chemistry ');
  addCourse(draft, 'general chemistry');
  addCourse(draft, 'Cell Biology');
  addCourse(draft, '   ');
  assert.deepEqual(draft.courses, ['General Chemistry', 'Cell Biology']);
  toggleSource(draft, 'Obsidian');
  toggleSource(draft, 'Notion');
  toggleSource(draft, 'Obsidian');
  assert.deepEqual(draft.sources, ['Notion']);
});
