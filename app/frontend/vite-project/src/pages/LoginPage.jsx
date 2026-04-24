import { Link } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import AuthBrand from '../components/auth/AuthBrand';
import AuthField from '../components/auth/AuthField';
import PasswordInput from '../components/auth/PasswordInput';
import { useLoginForm } from '../hooks/useLoginForm';

/**
 * LoginPage: thin orchestrator (Single Responsibility).
 * Delegates form state/logic to useLoginForm, UI pieces to focused components.
 */
function LoginPage() {
  const { email, setEmail, password, setPassword, showPw, setShowPw, error, loading, handleSubmit } = useLoginForm();

  return (
    <AuthLayout>
      <AuthBrand />

      <h2 className="auth-heading">Welcome Back.</h2>
      <p className="auth-subheading">Pick up right where you left off.</p>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <AuthField
          label="Email"
          type="email"
          placeholder="name@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          show={showPw}
          onToggleShow={() => setShowPw((v) => !v)}
        />

        <a href="#" className="auth-forgot-link">Forgot password?</a>

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? 'Logging in…' : 'Log In'}
        </button>
      </form>

      <div className="auth-switch-link">
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;

