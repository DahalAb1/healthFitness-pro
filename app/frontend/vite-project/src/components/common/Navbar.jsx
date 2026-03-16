function Navbar() {
  return (
    <nav className="navbar">
      <a href="/" className="logo-container">
        <img src="coverphoto.jpg" alt="Logo" className="logo-img" />
        <span className="logo-text">Health Fitness Pro</span>
      </a>

      <ul className="nav-links">
        <li><a href="#workout">Workout</a></li>
        <li><a href="/workout-template">Templates</a></li>
        <li><a href="#running">Running</a></li>
        <li><a href="#nutrition">Nutrition</a></li>
        <li><a href="#library">Library</a></li>
      </ul>

      <div className="nav-auth">
        <a href="login.html" className="btn">LOGIN</a>
        <a href="signup.html" className="btn">SIGN UP</a>
      </div>
    </nav>
  );
}

export default Navbar;
