import AccountSection from './AccountSection';
import EditableMenuItem from './EditableMenuItem';

/**
 * Single Responsibility: renders the Security & Billing section only.
 * Interface Segregation: only receives onSignOut — nothing else from AccountPage.
 */
export default function SecuritySection({ onSignOut }) {
  return (
    <AccountSection label="Security &amp; Billing">
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
          onClick={onSignOut}
          icon={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>}
        />
    </AccountSection>
  );
}
