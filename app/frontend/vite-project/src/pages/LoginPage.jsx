import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import coverphoto from '../assets/coverphoto.jpg';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

      <h2 className="auth-heading">Welcome Back.</h2>
      <p className="auth-subheading">Pick up right where you left off.</p>

      <form onSubmit={handleSubmit}>
        <div className="auth-field">
          <label>Email</label>
          <input
            type="email"
            placeholder="name@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="auth-field">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <a href="#" className="auth-forgot-link">Forgot password?</a>

        <button type="submit" className="auth-submit-btn">Log In</button>
      </form>

      <div className="auth-switch-link">
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;
