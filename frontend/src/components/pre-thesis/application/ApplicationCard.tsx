import type { TopicApplication } from "../../../types/pre-thesis.types";

const ApplicationCard = ({
  application,
  onClick,
  selected,
}: {
  application: TopicApplication;
  onClick: () => void;
  selected: boolean;
}) => (
  <div
    onClick={onClick}
    style={{
      border: selected ? "2px solid #1976d2" : "1px solid #ccc",
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      cursor: "pointer",
      background: selected ? "#e3f2fd" : "#fff",
    }}
  >
    <div><b>Student:</b> {application.studentId}</div>
    <div><b>Topic:</b> {application.proposalTitle}</div>
    <div><b>Status:</b> {application.status}</div>
  </div>
);

export default ApplicationCard;