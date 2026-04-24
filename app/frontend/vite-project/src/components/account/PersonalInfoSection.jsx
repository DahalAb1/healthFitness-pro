import AccountSection from './AccountSection';
import EditableMenuItem from './EditableMenuItem';
import SegmentedMenuItem from './SegmentedMenuItem';

/**
 * Single Responsibility: renders the Personal Information section only.
 * Interface Segregation: only receives profile and set — nothing else from AccountPage.
 */
export default function PersonalInfoSection({ profile, set }) {
  return (
    <AccountSection label="Personal Information">
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
    </AccountSection>
  );
}
