import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import coverphoto from '../assets/coverphoto.jpg';

function SignUpPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
  });

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: wire to auth backend
  };

  return (
    <AuthLayout>
      <div className="auth-brand">
        <img src={coverphoto} alt="Health Fitness Pro" className="auth-logo-img" />
        <span className="auth-brand-name">Health Fitness Pro</span>
      </div>

      <h2 className="auth-heading">Create Account.</h2>
      <p className="auth-subheading">Start tracking. Start growing. For free.</p>

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
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={update('password')}
            required
          />
        </div>

        <div className="auth-field">
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.confirm}
            onChange={update('confirm')}
            required
          />
        </div>

        <button type="submit" className="auth-submit-btn" style={{ marginTop: '8px' }}>
          Create Account
        </button>
      </form>

      <div className="auth-switch-link">
        Already have an account? <Link to="/login">Log In</Link>
      </div>
    </AuthLayout>
  );
}

export default SignUpPage;
