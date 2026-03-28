import { useState, useRef, useEffect } from 'react';
import { MenuIcon, PencilIcon } from './AccountIcons';

export default function EditableMenuItem({
  icon, label, value, valueGreen,
  danger, editable, editType = 'text',
  onSave, onClick,
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  const handleRowClick = () => {
    if (editable) { setDraft(value); setOpen((o) => !o); }
    else if (onClick) onClick();
  };

  const handleSave = () => { if (onSave) onSave(draft); setOpen(false); };
  const handleCancel = () => { setDraft(value); setOpen(false); };
  const handleKey = (e) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  return (
    <div className={`account-menu-entry${open ? ' account-menu-entry--open' : ''}`}>
      <div
        className={[
          'account-menu-item',
          danger ? 'account-menu-item--danger' : '',
          editable ? 'account-menu-item--editable' : '',
        ].join(' ').trim()}
        onClick={handleRowClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleRowClick()}
      >
        <div className="account-mi-left">
          <MenuIcon>{icon}</MenuIcon>
          <span className="account-mi-label">{label}</span>
        </div>
        <div className="account-mi-right">
          {value && (
            <span className={`account-mi-value${valueGreen ? ' account-mi-value--green' : ''}`}>
              {value}
            </span>
          )}
          {editable ? (
            <PencilIcon />
          ) : (
            <svg
              className="account-chevron"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
        </div>
      </div>

      {open && (
        <div className="account-edit-row">
          <input
            ref={inputRef}
            className="account-edit-input"
            type={editType}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKey}
          />
          <div className="account-edit-actions">
            <button className="account-edit-btn account-edit-btn--save" onClick={handleSave}>
              Save
            </button>
            <button className="account-edit-btn account-edit-btn--cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
