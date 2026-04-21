import { useEffect } from 'react';
import '../../styles/components/common/modal-shell.css';

function ModalShell({
  onClose,
  ariaLabel,
  className = '',
  backdropClassName = '',
  closeAriaLabel = 'Close',
  children,
}) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className={['modal-backdrop', backdropClassName].filter(Boolean).join(' ')}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={onClose}
    >
      <div
        className={['modal-panel', className].filter(Boolean).join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label={closeAriaLabel}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

export default ModalShell;
