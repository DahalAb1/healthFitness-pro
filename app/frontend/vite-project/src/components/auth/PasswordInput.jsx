/**
 * Single Responsibility: renders a password field with a show/hide toggle.
 * Interface Segregation: only receives the props it uses — no form-wide state.
 * Reusable across LoginPage and SignUpPage.
 */
export default function PasswordInput({ label = 'Password', value, onChange, show, onToggleShow, placeholder = '••••••••' }) {
  return (
    <div className="auth-field">
      <label>{label}</label>
      <div className="auth-pw-wrap">
        <input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
        />
        <button
          type="button"
          className="auth-pw-eye"
          onClick={onToggleShow}
          aria-label="Toggle password visibility"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {show
              ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
              : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
          </svg>
        </button>
      </div>
    </div>
  );
}
