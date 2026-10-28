export const PART_IDS = ['sensors', 'motors', 'controllers', 'power'];
export const STORAGE_KEY = 'mdeanh-robotics-workshop-v1';
export function freshProgress() { return { version: 1, completed: [], selected: 'sensors' }; }
export function parseProgress(raw) {
  try {
    const saved = JSON.parse(raw);
    if (!saved || saved.version !== 1 || !Array.isArray(saved.completed)) return freshProgress();
    return { version: 1, completed: PART_IDS.filter(id => saved.completed.includes(id)), selected: PART_IDS.includes(saved.selected) ? saved.selected : 'sensors' };
  } catch { return freshProgress(); }
}
export function loadProgress(storage) {
  try { return { progress: parseProgress(storage?.getItem(STORAGE_KEY)), available: Boolean(storage) }; }
  catch { return { progress: freshProgress(), available: false }; }
}
export function saveProgress(progress, storage) {
  try { if (!storage) return false; storage.setItem(STORAGE_KEY, JSON.stringify(progress)); return true; }
  catch { return false; }
}
export function awardPart(progress, id) {
  if (!PART_IDS.includes(id) || progress.completed.includes(id)) return progress;
  return { ...progress, completed: PART_IDS.filter(part => part === id || progress.completed.includes(part)) };
}
export function progressXP(progress) { return PART_IDS.filter(id => progress.completed.includes(id)).length * 100; }
