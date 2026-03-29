import { Link } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import AuthBrand from '../components/auth/AuthBrand';
import PasswordField from '../components/auth/PasswordField';
import ConfirmPasswordField from '../components/auth/ConfirmPasswordField';
import { useSignUpForm } from '../hooks/useSignUpForm';

function SignUpPage() {
  const { form, update, showPw, setShowPw, showConfirm, setShowConfirm, strength, matches, canSubmit, error, loading, handleSubmit } = useSignUpForm();

  return (
    <AuthLayout>
      <AuthBrand />

      <h2 className="auth-heading">Create Account.</h2>
      <p className="auth-subheading">Start tracking. Start growing. For free.</p>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Jane Doe"
            value={form.name}
            onChange={update('name')}
            required
          />
        </div>

        <div className="auth-field">
          <label>Email</label>
          <input
            type="email"
            placeholder="name@email.com"
            value={form.email}
            onChange={update('email')}
            required
          />
        </div>

        <PasswordField
          value={form.password}
          onChange={update('password')}
          show={showPw}
          onToggleShow={() => setShowPw((v) => !v)}
          strength={strength}
        />

        <ConfirmPasswordField
          value={form.confirm}
          onChange={update('confirm')}
          show={showConfirm}
          onToggleShow={() => setShowConfirm((v) => !v)}
          matches={matches}
        />

        <button type="submit" className="auth-submit-btn" disabled={!canSubmit || loading} style={{ marginTop: '8px' }}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="auth-switch-link">
        Already have an account? <Link to="/login">Log In</Link>
      </div>
    </AuthLayout>
  );
}

export default SignUpPage;