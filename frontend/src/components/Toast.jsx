import { CheckCircle2, Info, X, XCircle } from "lucide-react";

function Toast({ type = "success", message, onClose }) {
  const icons = {
    success: <CheckCircle2 size={20} />,
    error: <XCircle size={20} />,
    info: <Info size={20} />,
  };

  return (
    <div className={`toast-notification toast-${type}`} role="alert">
      <div className="toast-icon">
        {icons[type] || icons.info}
      </div>

      <div className="toast-message">
        {message}
      </div>

      <button
        type="button"
        className="toast-close"
        onClick={onClose}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export default Toast;