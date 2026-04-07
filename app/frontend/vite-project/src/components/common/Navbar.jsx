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

      <button
        className="nav-toggle"
        type="button"
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={`mobile-nav ${menuOpen ? "open" : ""}`}>
        <ul className="mobile-nav-links">
          <li>
            <NavLink to="/workout-template" onClick={closeMenu}>
              Templates
            </NavLink>
          </li>
          <li>
            <NavLink to="/nutrition" onClick={closeMenu}>
              Nutrition
            </NavLink>
          </li>
          <li>
            <NavLink to="/exercise-library" onClick={closeMenu}>
              Library
            </NavLink>
          </li>
          <li>
            <NavLink to="/history" onClick={closeMenu}>
              History
            </NavLink>
          </li>
          {user ? (
            <li>
              <NavLink to="/account" onClick={closeMenu}>
                Account
              </NavLink>
            </li>
          ) : (
            <>
              <li>
                <NavLink to="/login" onClick={closeMenu}>
                  Login
                </NavLink>
              </li>
              <li>
                <NavLink to="/signup" onClick={closeMenu}>
                  Sign Up
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>

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
