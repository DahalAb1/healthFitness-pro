export default function AccountSection({ label, children, menuProps }) {
  return (
    <div className="account-section">
      <span className="account-section-label">{label}</span>
      <div className="account-menu" {...menuProps}>
        {children}
      </div>
    </div>
  );
}
