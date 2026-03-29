import PasswordInput from './PasswordInput';
import PasswordStrengthMeter from './PasswordStrengthMeter';

/**
 * Single Responsibility: password field + strength meter combined.
 * Interface Segregation: only receives the props it needs.
 */
export default function PasswordField({ value, onChange, show, onToggleShow, strength }) {
  return (
    <div className="auth-field">
      <PasswordInput
        value={value}
        onChange={onChange}
        show={show}
        onToggleShow={onToggleShow}
      />
      <PasswordStrengthMeter password={value} strength={strength} />
    </div>
  );
}
