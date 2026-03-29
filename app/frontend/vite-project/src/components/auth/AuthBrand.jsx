import coverphoto from '../../assets/coverphoto.jpg';

/**
 * Single Responsibility: renders the brand logo + name header shared by all auth pages.
 * Open/Closed: new auth pages can use this without modifying it.
 */
export default function AuthBrand() {
  return (
    <div className="auth-brand">
      <img src={coverphoto} alt="Health Fitness Pro" className="auth-logo-img" />
      <span className="auth-brand-name">Health Fitness Pro</span>
    </div>
  );
}
