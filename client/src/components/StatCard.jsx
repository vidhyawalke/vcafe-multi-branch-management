export default function StatCard({ label, value, note, icon, trend }) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span className="stat-label">{label}</span>
        <div className="stat-icon-wrapper">{icon}</div>
      </div>
      <div className="stat-main">
        <span className="stat-value">{value}</span>
        {trend && <span className="stat-trend">{trend}</span>}
      </div>
      {note && <div className="stat-note">{note}</div>}
    </div>
  );
}
