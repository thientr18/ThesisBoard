import { useState } from "react";
import ApplicationForm from "./ApplicationForm";
import type { TopicApplication } from "../../../types/pre-thesis.types";

const ApplicationDetail = ({
  application,
  onStatusChange,
}: {
  application: TopicApplication;
  onStatusChange: (status: string) => void;
}) => {
  const [action, setAction] = useState<"accept" | "reject" | null>(null);

  return (
    <div>
      <h3>Application Details</h3>
      <div><b>Student:</b> {application.studentId}</div>
      <div><b>Topic:</b> {application.proposalTitle}</div>
      <div><b>Abstract:</b> {application.proposalAbstract}</div>
      <div><b>Status:</b> {application.status}</div>
      <div><b>Note:</b> {application.note}</div>
      {application.status === "pending" && (
        <div style={{ marginTop: 16 }}>
          <button onClick={() => setAction("accept")}>Accept</button>
          <button onClick={() => setAction("reject")} style={{ marginLeft: 8 }}>Reject</button>
        </div>
      )}
      {action && (
        <ApplicationForm
          application={application}
          action={action}
          onClose={() => setAction(null)}
          onSubmit={onStatusChange}
        />
      )}
    </div>
  );
};

export default ApplicationDetail;