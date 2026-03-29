import SegmentedMenuItem from './SegmentedMenuItem';

/**
 * Single Responsibility: renders the App Settings section only.
 * Interface Segregation: only receives the profile fields it actually uses.
 */
export default function AppSettingsSection({ profile, set }) {
  return (
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
  );
}
