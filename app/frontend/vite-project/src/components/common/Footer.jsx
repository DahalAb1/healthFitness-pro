import coverphoto from '../../assets/coverphoto.jpg';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <a href="#" className="logo-container">
            <img src={coverphoto} alt="Logo" className="logo-img" />
            <span className="logo-text">Health Fitness Pro</span>
          </a>
          <p>
            Professional tracking tools for athletes who demand the best from
            themselves every day.
          </p>
        </div>

        <div className="footer-col">
          <h4>Product</h4>
          <ul>
            <li><a href="#workout">Workouts</a></li>
            <li><a href="#templates">Workouts</a></li>
            <li><a href="#running">Running</a></li>
            <li><a href="#nutrition">Nutrition</a></li>
            <li><a href="exercise-library.html">Library</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Resources</h4>
          <ul>
            <li><a href="#">Guides</a></li>
            <li><a href="#">API Docs</a></li>
            <li><a href="#">Support</a></li>
            <li><a href="#">Community</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="#mission">About Us</a></li>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
            <li><a href="#">Contact</a></li>
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
