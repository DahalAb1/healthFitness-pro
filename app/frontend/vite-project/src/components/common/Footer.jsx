import { Link } from 'react-router-dom';
import coverphoto from '../../assets/coverphoto.jpg';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="logo-container">
            <img src={coverphoto} alt="Logo" className="logo-img" />
            <span className="logo-text">Health Fitness Pro</span>
          </Link>
          <p>
            Professional tracking tools for athletes who demand the best from
            themselves every day.
          </p>
        </div>

        <div className="footer-col">
          <h4>Product</h4>
          <ul>
            <li><Link to="/workout-template">Templates</Link></li>
            <li><Link to="/nutrition">Nutrition</Link></li>
            <li><Link to="/exercise-library">Library</Link></li>
            <li><Link to="/history">History</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

      </div>

      

      <div className="footer-bottom">
        <p>&copy; 2026 Health Fitness Pro. All rights reserved.</p>
        <div className="social-links" />
      </div>
    </footer>
  );
}

export default Footer;
