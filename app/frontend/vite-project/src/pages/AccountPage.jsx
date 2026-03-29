import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import HeightStepper from '../components/account/HeightStepper';
import WeightStepper from '../components/account/WeightStepper';
import AccountAvatar from '../components/account/AccountAvatar';
import PersonalInfoSection from '../components/account/PersonalInfoSection';
import AppSettingsSection from '../components/account/AppSettingsSection';
import SecuritySection from '../components/account/SecuritySection';
import WorkoutSettingsSection from '../components/account/WorkoutSettingsSection';
import { useAuth } from '../context/useAuth';
import { useAccountProfile } from '../hooks/useAccountProfile';
import '../styles/pages/account.css';

/**
 * AccountPage: thin orchestrator (Single Responsibility).
 * Delegates state/API to useAccountProfile, UI to section components.
 */
function AccountPage() {
  const { logout, avatar: avatarSrc, setAvatar } = useAuth();
  const navigate = useNavigate();
  const { profile, heightInches, weightLbs, setHeightInches, setWeightLbs, set, saveProfile } = useAccountProfile();

  const displayName = profile.displayName || 'User';

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

          <AccountAvatar avatarSrc={avatarSrc} setAvatar={setAvatar} displayName={displayName} />

          <div className="account-stat-row">
            <HeightStepper heightInches={heightInches} units={profile.units} onChange={(val) => { setHeightInches(val); saveProfile({ height_inches: val }); }} />
            <WeightStepper weightLbs={weightLbs} units={profile.units} onChange={(val) => { setWeightLbs(val); saveProfile({ weight_lbs: val }); }} />
          </div>

          <PersonalInfoSection profile={profile} set={set} />
          <AppSettingsSection profile={profile} set={set} />
          <WorkoutSettingsSection />
          <SecuritySection onSignOut={handleSignOut} />

          <div className="account-footer">
            <p>Health Fitness Pro &nbsp;�&nbsp; v2.4.0</p>
          </div>

        </div>
      </div>
    </>
  );
}

export default AccountPage;
