export const PASSWORD_RULES = [
  { label: 'At least 8 characters',      test: (p) => p.length >= 8 },
  { label: 'Uppercase letter (A–Z)',      test: (p) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter (a–z)',      test: (p) => /[a-z]/.test(p) },
  { label: 'Number (0–9)',                test: (p) => /\d/.test(p) },
  { label: 'Special character (!@#$…)',   test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const LEVELS = [
  { label: 'Very Weak', color: '#FF4444' },
  { label: 'Weak',      color: '#FF8C00' },
  { label: 'Fair',      color: '#FFD700' },
  { label: 'Strong',    color: '#4ADE80' },
  { label: 'Very Strong', color: '#22D3EE' },
];

export function getPasswordStrength(password) {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  return { level: passed, ...LEVELS[Math.max(0, passed - 1)] };
}

export function isPasswordStrong(password) {
  return PASSWORD_RULES.every((r) => r.test(password));
}
