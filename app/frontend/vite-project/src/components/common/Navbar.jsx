import { Link, NavLink } from 'react-router-dom';
import coverphoto from '../../assets/coverphoto.jpg';
import { useAuth } from '../../context/useAuth';

function Navbar() {
  const { user, avatar } = useAuth();

  const initials = user
    ? (user.display_name || user.email?.split('@')[0] || '?').slice(0, 2).toUpperCase()
    : null;

  return (
    <nav className="navbar">
      <Link to="/" className="logo-container">
        <img src={coverphoto} alt="Logo" className="logo-img" />
        <span className="logo-text">Health Fitness Pro</span>
      </Link>

      <ul className="nav-links">
        <li><Link to="/#workout-templates">Workout</Link></li>
        <li><NavLink to="/workout-template">Templates</NavLink></li>
        <li><Link to="/#running">Running</Link></li>
        <li><NavLink to="/nutrition">Nutrition</NavLink></li>
        <li><NavLink to="/exercise-library">Library</NavLink></li>
        <li><NavLink to="/workout-history">History</NavLink></li>
        <li><NavLink to="/settings">Settings</NavLink></li>
      </ul>

      <div className="nav-auth">
        {user ? (
          <Link to="/account" className="nav-avatar" aria-label="Account">
            {avatar ? <img src={avatar} alt="Profile" /> : initials}
          </Link>
        ) : (
          <>
            <Link to="/login" className="btn">LOGIN</Link>
            <Link to="/signup" className="btn">SIGN UP</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
