export default function StatusBadge({ status }) {
  const normStatus = (status || "PENDING").toUpperCase();
  return (
    <span className={`status-badge status-${normStatus.toLowerCase()}`}>
      <span className="status-dot" />
      {normStatus}
    </span>
  );
}
