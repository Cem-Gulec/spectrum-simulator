function ControlButton({ icon, variant = "default", onClick }) {
  return (
    <button
      className={`control-button control-button--${variant}`}
      onClick={onClick}
    >
      <span className="control-button__icon">{icon}</span>
    </button>
  );
}

export default ControlButton;