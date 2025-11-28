
const statuses = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

const ApplicationFilter = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div style={{ marginBottom: 16 }}>
    <select value={value} onChange={e => onChange(e.target.value)}>
      {statuses.map(s => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  </div>
);

export default ApplicationFilter;