import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import coverphoto from "../../assets/coverphoto.jpg";
import { useAuth } from "../../context/useAuth";

function Navbar() {
  const { user, avatar } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = user
    ? (user.display_name || user.email?.split("@")[0] || "?")
        .slice(0, 2)
        .toUpperCase()
    : null;

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="logo-container" onClick={closeMenu}>
        <img src={coverphoto} alt="Logo" className="logo-img" />
        <span className="logo-text">Health Fitness Pro</span>
      </Link>

      <ul className="nav-links">
        <li>
          <NavLink to="/workout-template">Templates</NavLink>
        </li>
        <li>
          <NavLink to="/nutrition">Nutrition</NavLink>
        </li>
        <li>
          <NavLink to="/exercise-library">Library</NavLink>
        </li>
        <li>
          <NavLink to="/history">History</NavLink>
        </li>
      </ul>

      <div className="nav-auth">
        {user ? (
          <Link to="/account" className="nav-avatar" aria-label="Account">
            {avatar ? <img src={avatar} alt="Profile" /> : initials}
          </Link>
        ) : (
          <>
            <Link to="/login" className="btn">
              LOGIN
            </Link>
            <Link to="/signup" className="btn">
              SIGN UP
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
