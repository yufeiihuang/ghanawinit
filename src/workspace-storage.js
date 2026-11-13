export const ACTIVE_WORKSPACE_KEY = 'speqq-active-workspace';
export function activeWorkspace(storage = globalThis.localStorage) {
  try { return storage?.getItem(ACTIVE_WORKSPACE_KEY) === 'umami' ? 'umami' : 'student'; } catch { return 'student'; }
}
export function workspaceKey(base, storage = globalThis.localStorage) {
  return activeWorkspace(storage) === 'student' ? `${base}-student` : base;
}
