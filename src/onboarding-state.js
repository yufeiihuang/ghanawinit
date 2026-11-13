export const ONBOARDING_KEY = 'speqq-student-onboarding-v1';
export const STEPS = ['About you', 'Your goal', 'Your courses', 'Try it', 'Your space'];

export function newDraft() {
  return { step: 0, name: '', role: 'Student', major: '', year: '', goal: '', exam: '', targetDate: '', courses: [], sources: [], materials: [], transcripts: [], connections: [], completed: false, connectionSaved: false, routine: false };
}

export function readDraft(storage) {
  try {
    const saved = JSON.parse(storage.getItem(ONBOARDING_KEY));
    if (!saved || typeof saved !== 'object') return newDraft();
    const draft = { ...newDraft(), ...saved };
    draft.step = Math.max(0, Math.min(STEPS.length - 1, Math.trunc(Number(draft.step)) || 0));
    for (const key of ['name', 'role', 'major', 'year', 'goal', 'exam', 'targetDate']) if (typeof draft[key] !== 'string') draft[key] = '';
    for (const key of ['courses', 'sources', 'materials', 'transcripts', 'connections']) if (!Array.isArray(draft[key])) draft[key] = [];
    return draft;
  } catch { return newDraft(); }
}

export function canContinue(draft) {
  if (draft.step === 0) return Boolean(draft.name.trim() && draft.major.trim());
  if (draft.step === 1) return Boolean(draft.goal);
  return true;
}

export function addCourse(draft, value) {
  const title = value.trim().slice(0, 100);
  if (title && !draft.courses.some(c => c.toLowerCase() === title.toLowerCase())) draft.courses.push(title);
  return draft;
}

export function toggleSource(draft, source) {
  draft.sources = draft.sources.includes(source) ? draft.sources.filter(s => s !== source) : [...draft.sources, source];
  return draft;
}
