import React, { useEffect, useState } from "react";
import { LayoutProvider, useLayoutContext, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../../../contexts/LayoutContext";
import { Modal, Button, Table, Card, Form, Input, Spin, message, Upload } from "antd";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import type { ThesisProposal } from "../../../types/thesis.types";
import { useThesisProposals } from "../../../api/endpoints/thesis.api";
import { useThesisRegistrations } from "../../../api/endpoints/thesis.api";
import { useAttachmentApi } from "../../../api/endpoints/attachment.api";
import { useSemesterApi } from "../../../api/endpoints/semester.api";
import Sidebar from "../../common/navigation/Sidebar";
import Navbar from "../../common/navigation/Navbar";

type TeacherRegistrationTableProps = {
  registrations: any[];
  loading: boolean;
  onEdit: (registration: any) => void;
};

const TeacherRegistrationTable: React.FC<TeacherRegistrationTableProps> = ({
  registrations,
  loading,
  onEdit,
}) => (
  <Card title="Your Thesis Registrations" className="mb-6">
    <Table
      loading={loading}
      dataSource={registrations}
      rowKey="id"
      pagination={false}
      columns={[
        { title: "Title", dataIndex: "title", key: "title" },
        { title: "Abstract", dataIndex: "abstract", key: "abstract" },
        { title: "Status", dataIndex: "status", key: "status" },
        {
          title: "Actions",
          key: "actions",
          render: (_, record) => (
            record.status === "pending_approval" ? (
              <Button type="link" onClick={() => onEdit(record)}>
                Edit
              </Button>
            ) : (
              <span className="text-gray-400">
                {record.status === "approved" ? "Approved - Cannot Edit" : 
                 record.status === "rejected" ? "Rejected - Cannot Edit" : "Cannot Edit"}
              </span>
            )
          ),
        },
      ]}
    />
  </Card>
);

const RegistrationEditModal: React.FC<{
  open: boolean;
  registration: any | null;
  onClose: () => void;
  onSubmit: (values: any, files: FileList | null) => void;
  loading: boolean;
}> = ({ open, registration, onClose, onSubmit, loading }) => {
  const { getByEntity, delete: deleteAttachment } = useAttachmentApi();
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState<boolean>(false);
  const [fileList, setFileList] = useState<File[]>([]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchAttachments = async () => {
      if (registration?.id) {
        setLoadingFiles(true);
        const res = await getByEntity("thesis_registration", registration.id);
        setAttachments(res.data || []);
        setLoadingFiles(false);
      } else {
        setAttachments([]);
      }
    };
    if (open) fetchAttachments();
  }, [open, registration, getByEntity]);

  const handleDeleteAttachment = async (id: number) => {
    await deleteAttachment(id);
    // reload attachments
    const res = await getByEntity("thesis_registration", registration?.id);
    setAttachments(res.data || []);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    setFileList(prev => [...prev, ...files]);
  };

  const handleRemoveNewFile = (idx: number) => {
    setFileList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFinish = (values: any) => {
    const dt = new DataTransfer();
    fileList.forEach(f => dt.items.add(f));
    onSubmit(values, dt.files);
    setFileList([]);
  };

  return (
    <Modal
      open={open}
      title="Edit Thesis Registration"
      onCancel={onClose}
      onOk={() => document.getElementById("reg-edit-form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))}
      confirmLoading={loading}
    >
      <Form
        id="reg-edit-form"
        layout="vertical"
        initialValues={registration}
        onFinish={handleFinish}
      >
        <Form.Item name="title" label="Thesis Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="abstract" label="Thesis Abstract">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="note" label="Note">
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item label="Attachments">
          <div className="mb-2">
            {loadingFiles ? <Spin size="small" /> : (
              attachments.length > 0 ? (
                <ul>
                  {attachments.map(file => (
                    <li key={file.id} className="flex items-center gap-2">
                      <Button
                        type="link"
                        icon={<DownloadOutlined />}
                        href={file.url}
                        target="_blank"
                        style={{ padding: 0 }}
                      >
                        {file.fileName}
                      </Button>
                      <Button
                        size="small"
                        danger
                        onClick={() => handleDeleteAttachment(file.id)}
                      >
                        Delete
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : <span>No attachments</span>
            )}
          </div>
          <div className="mb-2">
            <b>New files to upload:</b>
            <ul>
              {fileList.map((file, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span>{file.name}</span>
                  <Button size="small" danger onClick={() => handleRemoveNewFile(idx)}>Remove</Button>
                </li>
              ))}
            </ul>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <Button
            icon={<UploadOutlined />}
            onClick={() => fileInputRef.current?.click()}
          >
            Select Files
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// --- Table for proposals ---
const TeacherProposalsTable: React.FC<{
  proposals: ThesisProposal[];
  loading: boolean;
  onSelect: (proposal: ThesisProposal) => void;
}> = ({ proposals, loading, onSelect }) => (
  <Card title="Student Submitted Proposals" className="mb-6">
    <Table
      loading={loading}
      dataSource={proposals}
      rowKey="id"
      pagination={false}
      onRow={record => ({
        onClick: () => onSelect(record),
        className: "cursor-pointer hover:bg-gray-50"
      })}
      columns={[
        { title: "Title", dataIndex: "title", key: "title" },
        {
          title: "Student",
          key: "studentId",
          render: (_: any, record: ThesisProposal) => record.student?.user?.fullName || "",
        },
        { title: "Status", dataIndex: "status", key: "status" },
        {
          title: "Actions",
          key: "actions",
          render: (_, record) => (
            <Button type="link" onClick={() => onSelect(record)}>
              Details
            </Button>
          )
        }
      ]}
    />
  </Card>
);

// --- Modal for proposal details ---
const ProposalDetailModal: React.FC<{
  open: boolean;
  proposal: ThesisProposal | null;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  loading: boolean;
}> = ({ open, proposal, onClose, onAccept, onReject, loading }) => {
  const { getByEntity, downloadAttachment } = useAttachmentApi();
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    const fetchAttachments = async () => {
      if (proposal?.id) {
        setLoadingFiles(true);
        const res = await getByEntity("thesis_proposal", proposal.id);
        setAttachments(res.data || []);
        setLoadingFiles(false);
      } else {
        setAttachments([]);
      }
    };
    if (open) fetchAttachments();
  }, [open, proposal, getByEntity]);

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

  return (
    <Modal
      open={open}
      title="Proposal Details"
      onCancel={onClose}
      footer={[
        proposal?.status === "submitted" && (
          <Button key="accept" type="primary" onClick={onAccept} loading={loading}>
            Accept
          </Button>
        ),
        proposal?.status === "submitted" && (
          <Button key="reject" danger onClick={onReject} loading={loading}>
            Reject
          </Button>
        ),
        <Button key="close" onClick={onClose}>
          Close
        </Button>
      ].filter(Boolean)}
    >
      {proposal ? (
        <div className="space-y-2">
          <div><b>Title:</b> {proposal.title}</div>
          <div><b>Abstract:</b> {proposal.abstract}</div>
          <div><b>Student:</b> {proposal.student?.user?.fullName}</div>
          <div><b>Status:</b> {proposal.status}</div>
          {proposal.status === "cancelled" && proposal.note && (
            <div>
              <b>Note:</b> {proposal.note}
            </div>
          )}
          <div>
            <b>Attachments:</b>
            {loadingFiles ? <Spin size="small" /> : (
              attachments.length > 0 ? (
                <ul>
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
        </div>
      ) : <Spin />}
    </Modal>
  );
};

// --- Modal for Accept/Reject actions ---
const ProposalActionModal: React.FC<{
  open: boolean;
  type: "accept" | "reject";
  onClose: () => void;
  onSubmit: (note: string, registrationData?: any, files?: FileList) => void;
  loading: boolean;
}> = ({ open, type, onClose, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);

  const handleUploadChange = (info: any) => {
    setFileList(info.fileList);
  };

  const handleFinish = (values: any) => {
    let files: FileList | undefined = undefined;
    if (type === "accept" && fileList.length > 0) {
      const dt = new DataTransfer();
      fileList.forEach((f: any) => {
        if (f.originFileObj) {
          dt.items.add(f.originFileObj);
        }
      });
      files = dt.files;
    }
    onSubmit(values.note, type === "accept" ? values : undefined, files);
    setFileList([]);
  };

  return (
    <Modal
      open={open}
      title={
        type === "accept"
          ? (
            <div>
              <div className="text-lg font-semibold">Accept Proposal</div>
              <div className="text-base font-normal text-gray-500"> & Register Thesis</div>
            </div>
          )
          : <div className="text-lg font-semibold">Reject Proposal</div>
      }
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Form.Item name="note" label="Feedback to Student" rules={[{ required: true }]}>
          <Input.TextArea rows={2} />
        </Form.Item>
        {type === "accept" && (
          <>
            <div className="mb-2 mt-4 px-1 py-1 bg-blue-50 rounded">
              <div className="font-semibold text-blue-700 text-base mb-1">Thesis Registration</div>
              <div className="text-xs text-gray-500 mb-2">Please fill in the thesis registration details below.</div>
            </div>
            <Form.Item name="title" label="Thesis Title" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="abstract" label="Thesis Abstract">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item label="Attachments">
              <Upload
                multiple
                beforeUpload={() => false}
                fileList={fileList}
                onChange={handleUploadChange}
                showUploadList={{ showRemoveIcon: true }}
              >
                <Button icon={<UploadOutlined />}>Select Files</Button>
              </Upload>
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

// --- Main business logic ---
const ProposalSubmissionsContent: React.FC<{ user: any | null }> = () => {
  const { getActive: getActiveSemester } = useSemesterApi();
  const { getByEntity, delete: deleteAttachment, uploadFiles } = useAttachmentApi();
  const { getProposalOfTeacher, process: processProposal } = useThesisProposals();
  const { getRegistrationOfTeacher: getAllRegistrations, update: updateRegistration } = useThesisRegistrations();

  const [activeSemester, setActiveSemester] = useState<any | null>(null);
  const [proposals, setProposals] = useState<ThesisProposal[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);

  const [registrations, setRegistrations] = useState<any[]>([]);
  const [registrationsLoading, setRegistrationsLoading] = useState<boolean>(false);
  const [editRegistration, setEditRegistration] = useState<any | null>(null);
  const [editRegistrationModalOpen, setEditRegistrationModalOpen] = useState<boolean>(false);
  const [editRegistrationLoading, setEditRegistrationLoading] = useState<boolean>(false);

  const [selectedProposal, setSelectedProposal] = useState<ThesisProposal | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState<boolean>(false);
  const [actionModalOpen, setActionModalOpen] = useState<boolean>(false);
  const [actionType, setActionType] = useState<"accept" | "reject">("accept");
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Error modal
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  // Load semester
  useEffect(() => {
    const fetchActiveSemester = async () => {
      const res = await getActiveSemester();
      if (res?.data) {
        setActiveSemester(res.data);
      }
    };
    fetchActiveSemester();
  }, [getActiveSemester]);

  useEffect(() => {
    const fetchRegistrations = async () => {
      if (!activeSemester?.id) return;
      setRegistrationsLoading(true);
      const res = await getAllRegistrations(activeSemester?.id);
      setRegistrations(res.data || []);
      setRegistrationsLoading(false);
    };
    if (activeSemester) fetchRegistrations();
  }, [activeSemester, getAllRegistrations]);

  const handleEditRegistration = (registration: any) => {
    setEditRegistration(registration);
    setEditRegistrationModalOpen(true);
  };

  const handleSubmitEditRegistration = async (values: any, files: FileList | null) => {
    if (!editRegistration) return;
    
    // Check if registration can be edited
    if (editRegistration.status !== "pending_approval") {
      message.error("Cannot edit registration in current status: " + editRegistration.status);
      return;
    }
    
    setEditRegistrationLoading(true);
    const res = await updateRegistration(editRegistration.id, {
      title: values.title,
      abstract: values.abstract,
      note: values.note,
    });
    
    if (!res.error && res.data) {
      // Only upload files after successful entity update
      if (files && files.length > 0) {
        const uploadRes = await uploadFiles(files, "thesis_registration", editRegistration.id);
        
        if (uploadRes.error) {
          message.warning("Registration updated, but file upload failed: " + uploadRes.error);
        } else {
          message.success("Registration and attachments updated successfully");
        }
      } else {
        message.success("Registration updated");
      }
      
      setEditRegistrationModalOpen(false);
      setEditRegistration(null);
      
      // Refresh registrations
      const regRes = await getAllRegistrations(activeSemester?.id);
      setRegistrations(regRes.data || []);
    } else {
      message.error(res.error || "Failed to update registration");
    }
    setEditRegistrationLoading(false);
  };

  // Load proposals
  useEffect(() => {
    const fetchProposals = async () => {
      if (!activeSemester) return;
      setProposalsLoading(true);
      const res = await getProposalOfTeacher(activeSemester.id);
      setProposals(res.data || []);
      setProposalsLoading(false);
    };
    if (activeSemester) fetchProposals();
  }, [activeSemester, getProposalOfTeacher]);

  // Table row click
  const handleProposalClick = (proposal: ThesisProposal) => {
    setSelectedProposal(proposal);
    setDetailModalOpen(true);
  };

  // Accept/Reject buttons
  const handleAccept = () => {
    setActionType("accept");
    setActionModalOpen(true);
    setDetailModalOpen(false);
  };
  const handleReject = () => {
    setActionType("reject");
    setActionModalOpen(true);
    setDetailModalOpen(false);
  };

  // Handle submit accept/reject
  const handleActionSubmit = async (note: string, registrationData?: any, files?: FileList) => {
    if (!selectedProposal) return;
    setActionLoading(true);

    if (actionType === "accept") {
      const res = await processProposal(
        selectedProposal.id,
        "accepted",
        registrationData?.note,
        registrationData?.title,
        registrationData?.abstract
      );
      
      if (!res.error && res.data) {
        const registrationId = res.data.registration?.id;
        
        // Only upload files after successful entity creation
        if (files && files.length > 0 && registrationId) {
          const uploadRes = await uploadFiles(files, 'thesis_registration', registrationId);
          
          if (uploadRes.error) {
            message.warning("Registration created successfully, but file upload failed: " + uploadRes.error);
          } else {
            message.success("Thesis registration created with attachments");
          }
        } else {
          message.success("Thesis registration created successfully");
        }
        
        setActionModalOpen(false);
        setSelectedProposal(null);

        // Refresh data
        if (activeSemester?.id) {
          const sid = activeSemester.id;
          
          const result = await getProposalOfTeacher(sid);
          setProposals(result.data || []);
          
          const regRes = await getAllRegistrations(sid);
          setRegistrations(regRes.data || []);
        }
      } else {
        setErrorDetail(res.error);
        message.error(res.error || "Failed to accept proposal");
      }
    }
    // Reject logic
    else {
      const res = await processProposal(selectedProposal.id, "rejected", note);
      if (!res.error && res.data) {
        // Clean up attachments associated with the proposal if rejected
        const attRes = await getByEntity("thesis_proposal", selectedProposal.id);
        if (attRes.data) {
          for (const att of attRes.data) {
            await deleteAttachment(Number(att.id));
          }
        }
        message.success("Proposal rejected");
        setActionModalOpen(false);
        setSelectedProposal(null);
        
        // Refresh proposals
        if (activeSemester?.id) {
          const result = await getProposalOfTeacher(activeSemester.id);
          setProposals(result.data || []);
        }
      } else {
        setErrorDetail(res.error);
        message.error(res.error || "Failed to reject proposal");
      }
    }
    setActionLoading(false);
  };

  return (
    <>
      {errorDetail && (
        <Modal
          open={!!errorDetail}
          title="Error"
          onCancel={() => setErrorDetail(null)}
          footer={[
            <Button key="close" onClick={() => setErrorDetail(null)}>
              Close
            </Button>
          ]}
        >
          <div style={{ whiteSpace: "pre-wrap" }}>{errorDetail}</div>
        </Modal>
      )}
      <div className="p-6 flex flex-col gap-8 max-w-3xl mx-auto">
        <div>
          <h2>
            Semester: {activeSemester ? activeSemester.name || activeSemester.id : <Spin size="small" />}
          </h2>
        </div>
        <TeacherRegistrationTable
          registrations={registrations}
          loading={registrationsLoading}
          onEdit={handleEditRegistration}
        />
        <RegistrationEditModal
          open={editRegistrationModalOpen}
          registration={editRegistration}
          onClose={() => setEditRegistrationModalOpen(false)}
          onSubmit={handleSubmitEditRegistration}
          loading={editRegistrationLoading}
        />
        <TeacherProposalsTable
          proposals={proposals}
          loading={proposalsLoading}
          onSelect={handleProposalClick}
        />
        {/* Proposal Detail Modal */}
        <ProposalDetailModal
          open={detailModalOpen}
          proposal={selectedProposal}
          onClose={() => setDetailModalOpen(false)}
          onAccept={handleAccept}
          onReject={handleReject}
          loading={actionLoading}
        />
        {/* Accept/Reject Modal */}
        <ProposalActionModal
          open={actionModalOpen}
          type={actionType}
          onClose={() => setActionModalOpen(false)}
          onSubmit={handleActionSubmit}
          loading={actionLoading}
        />
      </div>
    </>
  );
};

const ProposalSubmissionsMain = ({ user }: { user: any | null }) => {
  const { collapsed } = useLayoutContext();
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  return (
    <>
      <Sidebar user={user} />
      <div
        className="flex-1 flex flex-col"
        style={{
          marginLeft: sidebarWidth,
          transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
          minHeight: "100vh",
        }}
      >
        <Navbar user={user} pageName="Thesis Proposals" />
        <div>
          <ProposalSubmissionsContent user={user} />
        </div>
      </div>
    </>
  );
};

export default function ProposalSubmissionsContentWrapper({ user }: { user: any | null }) {
  return (
    <LayoutProvider>
      <ProposalSubmissionsMain user={user} />
    </LayoutProvider>
  );
}