import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import coverphoto from '../assets/coverphoto.jpg';
import { useAuth } from '../context/useAuth';
import { PASSWORD_RULES, getPasswordStrength, isPasswordStrong } from '../utils/passwordStrength';

function SignUpPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const strength = getPasswordStrength(form.password);
  const allPassed = isPasswordStrong(form.password);
  const matches = form.password === form.confirm;
  const canSubmit = allPassed && matches && form.name && form.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setLoading(true);
    try {
      await register(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-brand">
        <img src={coverphoto} alt="Health Fitness Pro" className="auth-logo-img" />
        <span className="auth-brand-name">Health Fitness Pro</span>
      </div>

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

        <div className="auth-field">
          <label>Password</label>
          <div className="auth-pw-wrap">
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={update('password')}
              required
            />
            <button type="button" className="auth-pw-eye" onClick={() => setShowPw((v) => !v)} aria-label="Toggle password visibility">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {showPw
                  ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                  : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
              </svg>
            </button>
          </div>

          {form.password && (
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
                  const ok = rule.test(form.password);
                  return (
                    <li key={rule.label} className={`auth-pw-rule${ok ? ' auth-pw-rule--ok' : ''}`}>
                      <span className="auth-pw-rule-icon">{ok ? '✓' : '✕'}</span>
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="auth-field">
          <label>Confirm Password</label>
          <div className="auth-pw-wrap">
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.confirm}
              onChange={update('confirm')}
              className={form.confirm && !matches ? 'auth-input--error' : ''}
              required
            />
            <button type="button" className="auth-pw-eye" onClick={() => setShowConfirm((v) => !v)} aria-label="Toggle confirm password visibility">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {showConfirm
                  ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                  : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
              </svg>
            </button>
          </div>
          {form.confirm && (
            <p className={`auth-pw-match${matches ? ' auth-pw-match--ok' : ''}`}>
              {matches ? '✓ Passwords match' : '✕ Passwords do not match'}
            </p>
          )}
        </div>

        <button type="submit" className="auth-submit-btn" disabled={!canSubmit || loading} style={{ marginTop: '8px' }}>
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </form>

      <div className="auth-switch-link">
        Already have an account? <Link to="/login">Log In</Link>
      </div>
    </AuthLayout>
  );
}

export default SignUpPage;
