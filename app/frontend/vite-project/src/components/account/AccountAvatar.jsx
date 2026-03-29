import { useRef } from 'react';

/**
 * Single Responsibility: renders the avatar display/upload UI only.
 * Receives avatarSrc and setAvatar via props (Dependency Inversion).
 */
export default function AccountAvatar({ avatarSrc, setAvatar, displayName }) {
  const avatarInputRef = useRef(null);
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div className="account-profile">
      <div className="account-avatar-wrap">
        <div className="account-avatar">
          {avatarSrc ? <img src={avatarSrc} alt="Profile" /> : initials}
        </div>
        <button
          className="account-avatar-change"
          onClick={() => avatarInputRef.current.click()}
          aria-label="Change profile picture"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </button>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="account-avatar-input"
          onChange={handleAvatarChange}
        />
      </div>
      <div>
        <div className="account-profile-name">{displayName}</div>
        <div className="account-profile-meta">Member since Jan 2024</div>
        <span className="account-profile-badge">Pro Plan — Active</span>
      </div>
    </div>
  );
}
