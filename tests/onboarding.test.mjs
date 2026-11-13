import test from 'node:test';
import assert from 'node:assert/strict';
import { ACTIVE_WORKSPACE_KEY } from '../src/workspace-storage.js';
import { newDraft, readDraft, canContinue, addCourse, toggleSource, needsOnboarding, ONBOARDING_KEY } from '../src/onboarding-state.js';

test('setup requires study context and one goal, but never requires migration', () => {
  const draft = newDraft();
  assert.equal(canContinue(draft), false);
  draft.major = 'Biology';
  assert.equal(canContinue(draft), false);
  draft.role = 'Student';
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
  const storage = { getItem(key) { if(key===ACTIVE_WORKSPACE_KEY)return 'umami';assert.equal(key, ONBOARDING_KEY); return raw; } };
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

 test('setup accepts each supported user role and restores it', () => {
  for (const role of ['Student', 'Educator', 'Researcher', 'Other']) {
    const draft = { ...newDraft(), name: 'Alex', major: 'Biology', role };
    assert.equal(canContinue(draft), true);
    assert.equal(readDraft({ getItem: () => JSON.stringify(draft) }).role, role);
  }
  assert.equal(canContinue({ ...newDraft(), name: 'Alex', major: 'Biology', role: 'unknown' }), false);
});

test('first visits and deep links require setup until finished or explicitly skipped', () => {
  const draft = newDraft();
  for (const hash of ['', '#Home', '#Specs/spec-1', '#Study']) assert.equal(needsOnboarding(draft, hash), true);
  assert.equal(needsOnboarding(draft, '#Onboarding'), false);
  assert.equal(needsOnboarding({ ...draft, step: 3 }, '#Home'), true);
  for (const state of [{ ...draft, skipped: true }, { ...draft, completed: true }]) {
    assert.equal(needsOnboarding(state, '#Home'), false);
    assert.equal(needsOnboarding(state, '#Specs/spec-1'), false);
    assert.equal(needsOnboarding(state, '#Onboarding'), false);
  }
});
