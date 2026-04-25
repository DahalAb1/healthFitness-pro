function ErrorPopup({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="wt-error-overlay" role="dialog" aria-modal="true" aria-labelledby="wtErrorTitle">
      <div className="wt-error-modal">
        <h3 id="wtErrorTitle">Unable to save workout</h3>
        <p>{message}</p>
        <button type="button" className="btn wt-error-btn" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}

export default ErrorPopup;
