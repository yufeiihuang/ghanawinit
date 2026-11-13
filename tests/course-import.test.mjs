import test from 'node:test';
import assert from 'node:assert/strict';
import { newDraft, ONBOARDING_KEY } from '../src/onboarding-state.js';

test('demo connection imports selected courses, saves connection and deduplicates courses', async () => {
  let saved = JSON.stringify({ ...newDraft(), role: 'Student', step: 2, courses: ['General Chemistry'] });
  globalThis.localStorage = { getItem: key => key==='speqq-active-workspace'?'umami':saved, setItem(key, value) { assert.equal(key, ONBOARDING_KEY); saved = value; } };
  globalThis.location = { hash: '#Onboarding' };
  globalThis.document = { title: '' };
  const handlers = {};
  const root = { innerHTML: '', addEventListener(name, fn) { handlers[name] = fn; }, querySelector() { return null; }, querySelectorAll() { return []; } };
  const { renderStudentRoute } = await import('../src/onboarding.js');
  renderStudentRoute(root);
  for (const provider of ['Canvas', 'Brightspace', 'mySchoolApp']) assert.ok(root.innerHTML.includes(provider));
  assert.ok(!root.innerHTML.includes('Coming soon'));
  function click(action, value) { handlers.click({ target: { closest: () => ({ dataset: { ob: action, value } }) } }); }
  click('connect', 'Canvas');
  assert.ok(root.innerHTML.includes('Choose your courses'));
  click('cancel-import');
  assert.ok(!root.innerHTML.includes('Choose your courses'));
  assert.deepEqual(JSON.parse(saved).connections, []);
  click('connect', 'Canvas');
  click('confirm-import');
  assert.deepEqual(JSON.parse(saved).connections, ['Canvas']);
  assert.equal(JSON.parse(saved).courses.length, 4);
  assert.ok(root.innerHTML.includes('Connected'));
  assert.ok(!root.innerHTML.includes('Choose your courses'));
});
