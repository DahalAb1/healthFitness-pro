import AuthCarousel from './AuthCarousel';
import '../../styles/components/auth/auth.css';

/**
 * Shared split-screen layout for Login and Sign Up pages.
 * Usage: wrap your form JSX in <AuthLayout> ... </AuthLayout>
 */
function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <AuthCarousel />
      <div className="auth-form-side">
        <div className="auth-form-inner">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
