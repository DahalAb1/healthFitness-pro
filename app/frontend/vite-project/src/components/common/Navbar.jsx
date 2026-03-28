import { Link, NavLink } from 'react-router-dom';
import coverphoto from '../../assets/coverphoto.jpg';

function Navbar() {
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
      </ul>

      <div className="nav-auth">
        <a href="#" className="btn">LOGIN</a>
        <a href="#" className="btn">SIGN UP</a>
      </div>
    </nav>
  );
}

export default Navbar;
