import { useState } from "react";
import { usePreThesisApi } from "../../../api/endpoints/pre-thesis.api";
import type { TopicApplication } from "../../../types/pre-thesis.types";

const ApplicationForm = ({
  application,
  action,
  onClose,
  onSubmit,
}: {
  application: TopicApplication;
  action: "accept" | "reject";
  onClose: () => void;
  onSubmit: (status: string) => void;
}) => {
  const { updateApplicationStatus } = usePreThesisApi();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    const status = action === "accept" ? "accepted" : "rejected";
    await updateApplicationStatus(application.id, status, note);
    setLoading(false);
    onSubmit(status);
    onClose();
  };

  return (
    <div style={{ marginTop: 16, border: "1px solid #ccc", padding: 12, borderRadius: 8 }}>
      <h4>{action === "accept" ? "Accept" : "Reject"} Application</h4>
      <textarea
        placeholder="Nhập ghi chú (note)..."
        value={note}
        onChange={e => setNote(e.target.value)}
        rows={3}
        style={{ width: "100%" }}
      />
      <div style={{ marginTop: 8 }}>
        <button onClick={handle} disabled={loading}>
          Accept
        </button>
        <button onClick={onClose} style={{ marginLeft: 8 }}>
          Reject
        </button>
      </div>
    </div>
  );
};

export default ApplicationForm;