import PasswordInput from './PasswordInput';

/**
 * Single Responsibility: confirm password field + match status message.
 * Interface Segregation: only receives the props it needs.
 */
export default function ConfirmPasswordField({ value, onChange, show, onToggleShow, matches }) {
  return (
    <div className="auth-field">
      <PasswordInput
        label="Confirm Password"
        value={value}
        onChange={onChange}
        show={show}
        onToggleShow={onToggleShow}
        inputClassName={value && !matches ? 'auth-input--error' : ''}
      />
      {value && (
        <p className={`auth-pw-match${matches ? ' auth-pw-match--ok' : ''}`}>
          {matches ? '✓ Passwords match' : '✕ Passwords do not match'}
        </p>
      )}
    </div>
  );
}
