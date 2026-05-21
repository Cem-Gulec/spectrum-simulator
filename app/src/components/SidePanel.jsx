function SidePanel({ onTakeScreenshot }) {
  return (
    <aside className="side-panel">
      <div className="export-panel">
        <button className="export-button" onClick={onTakeScreenshot}>
          <span>▧</span>
          <span>TAKE SCREENSHOT</span>
        </button>
      </div>
    </aside>
  );
}

export default SidePanel;