const KEY = 'defaultRestPeriod';
const FALLBACK = 60;

export function getDefaultRest() {
  const saved = localStorage.getItem(KEY);
  return saved ? Number(saved) : FALLBACK;
}

export function saveDefaultRest(seconds) {
  localStorage.setItem(KEY, String(seconds));
}
