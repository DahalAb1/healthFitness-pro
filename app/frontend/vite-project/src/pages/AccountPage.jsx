import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import HeightStepper from '../components/account/HeightStepper';
import WeightStepper from '../components/account/WeightStepper';
import SegmentedMenuItem from '../components/account/SegmentedMenuItem';
import EditableMenuItem from '../components/account/EditableMenuItem';
import { useAuth } from '../context/useAuth';
import '../styles/pages/account.css';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

function AccountPage() {
  const { user, token, logout, avatar: avatarSrc, setAvatar } = useAuth();
  const navigate = useNavigate();
  const avatarInputRef = useRef(null);

  // Initialise from user object; defaults used only before user loads
  const [heightInches, setHeightInches] = useState(user?.height_inches ?? null);
  const [weightLbs, setWeightLbs] = useState(user?.weight_lbs ?? null);
  const [profile, setProfile] = useState({
    email: user?.email || '',
    displayName: user?.display_name || user?.email?.split('@')[0] || '',
    units: user?.units || 'Imperial',
    workoutSounds: user?.workout_sounds || 'On',
    notifications: user?.notifications || 'On',
  });

  // Re-sync local state whenever the user object changes (e.g. after page reload)
  useEffect(() => {
    if (!user) return;
    setHeightInches(user.height_inches ?? null);
    setWeightLbs(user.weight_lbs ?? null);
    setProfile({
      email: user.email || '',
      displayName: user.display_name || user.email?.split('@')[0] || '',
      units: user.units || 'Imperial',
      workoutSounds: user.workout_sounds || 'On',
      notifications: user.notifications || 'On',
    });
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  const displayName = profile.displayName || user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  /** Send profile updates to backend and keep local state in sync */
  const saveProfile = useCallback(async (updates) => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        console.error('Failed to save profile:', await res.text());
      }
    } catch (err) {
      console.error('Profile save error:', err);
    }
  }, [token]);

  /** Update a profile key in local state and persist to backend */
  const set = (key, backendKey) => (val) => {
    setProfile((p) => ({ ...p, [key]: val }));
    saveProfile({ [backendKey]: val });
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <Navbar />
      <div className="account-page">
        <div className="account-wrap">

          
          <h1 className="account-title"><strong>Account</strong> Settings</h1>

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
              <div className="account-profile-name">{profile.displayName}</div>
              <div className="account-profile-meta">Member since Jan 2024</div>
              <span className="account-profile-badge">Pro Plan — Active</span>
            </div>
          </div>

          <div className="account-stat-row">
            <HeightStepper heightInches={heightInches} units={profile.units} onChange={(val) => { setHeightInches(val); saveProfile({ height_inches: val }); }} />
            <WeightStepper weightLbs={weightLbs} units={profile.units} onChange={(val) => { setWeightLbs(val); saveProfile({ weight_lbs: val }); }} />
          </div>

          <div className="account-section">
            <span className="account-section-label">Personal Information</span>
            <div className="account-menu">
              <EditableMenuItem
                label="Email" value={profile.email} editable editType="email"
                onSave={set('email', 'email')}
                icon={<><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></>}
              />
              <EditableMenuItem
                label="Display Name" value={profile.displayName} editable editType="text"
                onSave={set('displayName', 'display_name')}
                icon={<><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>}
              />
              <SegmentedMenuItem
                label="Units" options={['Imperial', 'Metric']} value={profile.units} onChange={set('units', 'units')}
                icon={<><path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10A15.3 15.3 0 0 1 8 12a15.3 15.3 0 0 1 4-10z"/></>}
              />
            </div>
          </div>

          <div className="account-section">
            <span className="account-section-label">App Settings</span>
            <div className="account-menu">
              <SegmentedMenuItem
                label="Workout Sounds" options={['On', 'Off']} value={profile.workoutSounds} onChange={set('workoutSounds', 'workout_sounds')}
                icon={<><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></>}
              />
              <SegmentedMenuItem
                label="Notifications" options={['On', 'Off']} value={profile.notifications} onChange={set('notifications', 'notifications')}
                icon={<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>}
              />
            </div>
          </div>

          <div className="account-section">
            <span className="account-section-label">Security &amp; Billing</span>
            <div className="account-menu">
              <EditableMenuItem
                label="Change Password" value="••••••••" editable editType="password"
                onSave={() => {}}
                icon={<><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>}
              />
              <EditableMenuItem
                label="Manage Subscription" value="Active" valueGreen
                icon={<><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>}
              />
              <EditableMenuItem
                label="Sign Out" danger
                onClick={handleSignOut}
                icon={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>}
              />
            </div>
          </div>

          <div className="account-footer">
            <p>Health Fitness Pro &nbsp;·&nbsp; v2.4.0</p>
          </div>

        </div>
      </div>
    </>
  );
}

export default AccountPage;
