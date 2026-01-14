import { useState, useEffect } from "react";
import { usePreThesisApi } from "../../../api/endpoints/pre-thesis.api";
import { useAttachmentApi } from "../../../api/endpoints/attachment.api";
import type { TopicApplication } from "../../../types/pre-thesis.types";
import { Button, Spin, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

const ApplicationDetail = ({
  application,
  onStatusChange,
}: {
  application: TopicApplication;
  onStatusChange: (status: string) => void;
}) => {
  const { updateApplicationStatus } = usePreThesisApi();
  const { getByEntity, downloadAttachment } = useAttachmentApi();
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<"accept" | "reject" | null>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  // Load attachments
  useEffect(() => {
    if (application?.id) {
      setLoadingFiles(true);
      getByEntity("topic_application", application.id).then(res => {
        setAttachments(res.data || []);
        setLoadingFiles(false);
      });
    }
  }, [application?.id, getByEntity]);

  const handleDownload = async (id: number, fileName: string) => {
    const res = await downloadAttachment(id);
    if (res.data) {
      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      message.error(res.error || "Download failed");
    }
  };

  const handleSubmit = async () => {
    if (!action) return;
    setLoading(true);
    const status = action === "accept" ? "accepted" : "rejected";
    const res = await updateApplicationStatus(application.id, status, note);
    setLoading(false);
    
    if (!res.error) {
      message.success(`Application ${status} successfully`);
      onStatusChange(status);
      setAction(null);
      setNote("");
    } else {
      message.error(res.error || "Action failed");
    }
  };

  const canProcessApplication = application.status === "pending";

  return (
    <div style={{ border: "1px solid #ccc", padding: 16, borderRadius: 8 }}>
      <h3>Application Details</h3>
      <div><b>Student:</b> {application.student?.user?.fullName || "N/A"}</div>
      <div><b>Topic:</b> {application.topic?.title || "N/A"}</div>
      <div><b>Proposal Title:</b> {application.proposalTitle || "N/A"}</div>
      <div><b>Proposal Abstract:</b> {application.proposalAbstract || "N/A"}</div>
      <div><b>Status:</b> <span style={{ 
        textTransform: 'capitalize',
        color: application.status === 'accepted' ? '#52c41a' : 
               application.status === 'rejected' ? '#ff4d4f' :
               application.status === 'cancelled' ? '#8c8c8c' : '#1890ff'
      }}>
        {application.status}
      </span></div>
      
      {application.status === "accepted" && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
          <b className="text-green-700">✓ This application has been accepted and cannot be modified.</b>
        </div>
      )}
      {application.status === "rejected" && application.note && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
          <b className="text-red-700">✗ Rejected</b>
          <div><b>Reason:</b> {application.note}</div>
        </div>
      )}
      {application.status === "cancelled" && (
        <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded">
          <b className="text-gray-700">✗ This application has been cancelled.</b>
          {application.note && <div><b>Reason:</b> {application.note}</div>}
        </div>
      )}
      
      <div className="mt-2">
        <b>Attachments:</b>
        {loadingFiles ? <Spin size="small" /> : (
          attachments.length > 0 ? (
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              {attachments.map(file => (
                <li key={file.id}>
                  <Button
                    type="link"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(file.id, file.fileName)}
                    style={{ padding: 0, marginRight: 8 }}
                  >
                    {file.fileName}
                  </Button>
                </li>
              ))}
            </ul>
          ) : <span> No attachments </span>
        )}
      </div>

      {canProcessApplication && !action && (
        <div style={{ marginTop: 16 }}>
          <Button 
            type="primary" 
            onClick={() => setAction("accept")} 
            style={{ marginRight: 8 }}
          >
            Accept
          </Button>
          <Button 
            danger
            onClick={() => setAction("reject")}
          >
            Reject
          </Button>
        </div>
      )}

      {action && (
        <div style={{ marginTop: 16, border: "1px solid #ddd", padding: 12, borderRadius: 8, backgroundColor: '#fafafa' }}>
          <h4>{action === "accept" ? "Accept" : "Reject"} Application</h4>
          <textarea
            placeholder="Enter note/feedback (optional)..."
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={3}
            style={{ width: "100%", marginBottom: 8, padding: 8, borderRadius: 4, border: '1px solid #d9d9d9' }}
          />
          <div>
            <Button 
              type="primary" 
              onClick={handleSubmit} 
              loading={loading}
              disabled={loading}
            >
              Confirm {action === "accept" ? "Accept" : "Reject"}
            </Button>
            <Button 
              onClick={() => { setAction(null); setNote(""); }} 
              style={{ marginLeft: 8 }}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetail;