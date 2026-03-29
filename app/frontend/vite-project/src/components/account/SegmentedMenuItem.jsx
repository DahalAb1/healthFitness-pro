import { MenuIcon } from './AccountIcons';

export default function SegmentedMenuItem({ icon, label, options, value, onChange }) {
  return (
    <div className="account-menu-item account-menu-item--segmented">
      <div className="account-mi-left">
        <MenuIcon>{icon}</MenuIcon>
        <span className="account-mi-label">{label}</span>
      </div>
      <div className="account-segmented">
        {options.map((opt) => (
          <button
            key={opt}
            className={`account-seg-btn${value === opt ? ' account-seg-btn--active' : ''}`}
            onClick={() => onChange(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
