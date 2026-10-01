export default function StatusBadge({ status }) {
  return (
    <span className={`status ${status?.toLowerCase()}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}
