export default function AuthField({ label, type = 'text', placeholder, value, onChange }) {
  return (
    <div className="auth-field">
      <label>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={onChange} required />
    </div>
  );
}
