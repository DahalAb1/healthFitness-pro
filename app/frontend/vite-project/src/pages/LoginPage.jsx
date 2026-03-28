import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/login.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: wire to auth backend
  };

  return (
    <div className="login-page">
      <div className="login-outer-glow">
        <div className="login-card">
          <h2>Welcome Back.</h2>
          <p>Syncing your progress...</p>

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="name@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="login-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <a href="#" className="login-forgot-link">Forgot password?</a>

            <button type="submit" className="login-btn">Login</button>
          </form>

          <div className="login-signup-link">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
