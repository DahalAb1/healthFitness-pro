import { PASSWORD_RULES } from '../../utils/passwordStrength';

/**
 * Single Responsibility: renders the password strength bar, label, and rules list only.
 * Interface Segregation: only receives `password` and `strength` — nothing else from the form.
 */
export default function PasswordStrengthMeter({ password, strength }) {
  if (!password) return null;

  return (
    <div className="auth-pw-strength">
      <div className="auth-pw-bar">
        {PASSWORD_RULES.map((_, i) => (
          <div
            key={i}
            className="auth-pw-bar-seg"
            style={{ background: i < strength.level ? strength.color : undefined }}
          />
        ))}
      </div>
      <div className="auth-pw-strength-label" style={{ color: strength.color }}>
        {strength.label}
      </div>
      <ul className="auth-pw-rules">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <li key={rule.label} className={`auth-pw-rule${ok ? ' auth-pw-rule--ok' : ''}`}>
              <span className="auth-pw-rule-icon">{ok ? '✓' : '✕'}</span>
              {rule.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
