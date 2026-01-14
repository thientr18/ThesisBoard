import React, { useEffect, useState } from "react";
import { LayoutProvider, useLayoutContext, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../../../contexts/LayoutContext";
import Sidebar from "../../common/navigation/Sidebar";
import Navbar from "../../common/navigation/Navbar";
import { useThesisProposals } from "../../../api/endpoints/thesis.api";
import { useAttachmentApi } from "../../../api/endpoints/attachment.api";
import { useSemesterApi } from "../../../api/endpoints/semester.api";
import { Modal, Button, Table, Card, List, message, Form, Input, Spin, Upload } from "antd";
import type { ThesisProposal } from "../../../types/thesis.types";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";

// ================== UI Components ==================

const StudentProposalsTable: React.FC<{
  proposals: ThesisProposal[];
  loading: boolean;
  onSelect: (proposal: ThesisProposal) => void;
}> = ({ proposals, loading, onSelect }) => (
  <Card title="My Submitted Proposals" className="mb-6">
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
        { title: "Status", dataIndex: "status", key: "status" },
        { 
          title: "Target Teacher", 
          key: "targetTeacher",
          render: (_, record) =>
            record.targetTeacher && "user" in record.targetTeacher
              ? (record.targetTeacher as any).user?.fullName || (record.targetTeacher as any).name || "-"
              : "-"
        },
      ]}
    />
  </Card>
);

const ProposalDetailModal: React.FC<{
  open: boolean;
  proposal: ThesisProposal | null;
  onClose: () => void;
  onEdit: () => void;
  onCancelProposal: () => void;
  loading: boolean;
}> = ({ open, proposal, onClose, onEdit, onCancelProposal, loading }) => {
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

  const canEdit = proposal?.status === "submitted";
  const canCancel = proposal?.status === "submitted";

  return (
    <Modal
      open={open}
      title="Proposal Details"
      onCancel={onClose}
      footer={[
        canEdit && (
          <Button key="edit" onClick={onEdit} disabled={loading}>
            Edit
          </Button>
        ),
        canCancel && (
          <Button key="cancel" danger onClick={onCancelProposal} loading={loading}>
            Cancel Proposal
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
          <div>
            <b>Target Teacher:</b>{" "}
            {proposal.targetTeacher && "user" in proposal.targetTeacher
              ? (proposal.targetTeacher as any).user?.fullName || (proposal.targetTeacher as any).name || "-"
              : "-"}
          </div>
          <div><b>Status:</b> {proposal.status}</div>
          {(proposal.status === "cancelled" || proposal.status === "rejected" || proposal.status === "accepted") && proposal.note && (
            <div>
              <b>Note:</b> {proposal.note}
            </div>
          )}
          {proposal.status === "accepted" && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
              <b className="text-green-700">✓ This proposal has been accepted and cannot be edited.</b>
            </div>
          )}
          {proposal.status === "rejected" && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
              <b className="text-red-700">✗ This proposal has been rejected.</b>
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

const ProposalEditModal: React.FC<{
  open: boolean;
  proposal: ThesisProposal | null;
  onClose: () => void;
  onSubmit: (values: any, files: File[]) => void;
  loading: boolean;
}> = ({ open, proposal, onClose, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const { getByEntity, delete: deleteAttachment } = useAttachmentApi();
  const [attachments, setAttachments] = useState<any[]>([]);
  const [fileList, setFileList] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    if (proposal) form.setFieldsValue(proposal);
  }, [proposal, form]);

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

  const handleDeleteAttachment = async (id: number) => {
    await deleteAttachment(id);
    // reload attachments
    if (proposal?.id) {
    const res = await getByEntity("thesis_proposal", proposal?.id);
    setAttachments(res.data || []);
    }
  };

  const handleFinish = async (values: any) => {
    const files: File[] = fileList
      .filter(f => !!f.originFileObj)
      .map(f => f.originFileObj as File);

    await onSubmit(values, files);
    setFileList([]);
  };

  return (
    <Modal
      open={open}
      title="Edit Proposal"
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="abstract" label="Abstract">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item label="Attachments">
          {loadingFiles ? <Spin size="small" /> : (
            <ul>
              {attachments.map(file => (
                <li key={file.id}>
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    <DownloadOutlined /> {file.fileName}
                  </a>
                  <Button
                    size="small"
                    danger
                    style={{ marginLeft: 8 }}
                    onClick={() => handleDeleteAttachment(file.id)}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <Upload
            multiple
            beforeUpload={() => false}
            fileList={fileList}
            onChange={info => setFileList(info.fileList)}
            showUploadList={{ showRemoveIcon: true }}
          >
            <Button icon={<UploadOutlined />}>Add Files</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const AvailableTeachersList: React.FC<{
  teachers: any[];
  loading: boolean;
  onSelect: (teacher: any) => void;
}> = ({ teachers, loading, onSelect }) => (
  <Card title="Available Teachers" className="mb-6">
    <List
      loading={loading}
      dataSource={teachers}
      renderItem={teacher => (
        <List.Item
          className="cursor-pointer hover:bg-gray-50"
          onClick={() => onSelect(teacher)}
        >
          <div>
            <div className="font-semibold">{teacher.teacher?.title} {teacher.teacher?.user?.fullName}</div>
            <div className="text-xs text-gray-500">{teacher.teacher?.user?.email || ""}</div>
            <div className="text-xs">
              {" | Office: "}{teacher.teacher?.office}
              {" | Phone: "}{teacher.teacher?.phone}
            </div>
            <div className="text-xs text-gray-500">{teacher.email || ""}</div>
            <div className="text-xs">
              Remaining: <b>{teacher.remainingCapacity}</b> / Max: {teacher.maxThesis}
            </div>
          </div>
        </List.Item>
      )}
    />
  </Card>
);

const ProposalSubmissionForm: React.FC<{
  open: boolean;
  teacher: any | null;
  onClose: () => void;
  onSubmit: (values: any, files: FileList | null) => void;
  loading: boolean;
  semesterId: number | null;
}> = ({ open, teacher, onClose, onSubmit, loading, semesterId }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    if (teacher) form.setFieldsValue({ targetTeacherId: teacher.teacherId });
  }, [teacher, form]);

  const handleUploadChange = (info: any) => {
    setFileList(info.fileList);
  };

  const handleFinish = (values: any) => {
    const files =
      fileList.length > 0
        ? (() => {
            const dt = new DataTransfer();
            fileList.forEach((f: any) => {
              if (f.originFileObj) dt.items.add(f.originFileObj);
            });
            return dt.files;
          })()
        : null;
    onSubmit(values, files);
    setFileList([]);
  };

  return (
    <Modal
      open={open}
      title={`Submit Proposal to ${teacher?.teacherName || teacher?.fullName || ""}`}
      onCancel={onClose}
      onOk={() => form.submit()}
      confirmLoading={loading}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="abstract" label="Abstract">
          <Input.TextArea rows={3} />
        </Form.Item>
        <Form.Item name="targetTeacherId" initialValue={teacher?.teacherId} hidden>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item label="Teacher">
          <Input
            value={teacher?.teacher?.user?.fullName}
            disabled
            style={{ background: "#fafafa", fontWeight: 500 }}
            placeholder="Teacher Name"
          />
        </Form.Item>
        {semesterId && (
          <Form.Item name="semesterId" initialValue={semesterId} hidden>
            <Input type="hidden" />
          </Form.Item>
        )}
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
      </Form>
    </Modal>
  );
};

// ================== Business Logic Container ==================
const TeacherAvailableContent: React.FC<{ user: any | null }> = () => {
  const {
    getTeacherAvailable,
    getProposalOfStudent,
    create: createThesisProposal,
    cancel: cancelThesisProposal,
    update: updateThesisProposal,
  } = useThesisProposals();

  const {
    uploadFiles,
    getByEntity,
    delete: deleteAttachment,
  } = useAttachmentApi();

  const { getActive: getActiveSemester } = useSemesterApi();

  const [activeSemester, setActiveSemester] = useState<any | null>(null);
  const [proposals, setProposals] = useState<ThesisProposal[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<ThesisProposal | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [teachers, setTeachers] = useState<any[]>([]);
  const [teachersLoading, setTeachersLoading] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [semesterId, setSemesterId] = useState<number | null>(null);

  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  // Fetch active semester on mount
  useEffect(() => {
    const fetchActiveSemester = async () => {
      const res = await getActiveSemester();
      if (res?.data) {
        setActiveSemester(res.data);
        setSemesterId(res.data.id);
      }
    };
    fetchActiveSemester();
  }, [getActiveSemester]);

  // Fetch proposals
  useEffect(() => {
    const fetchProposals = async () => {
      if (!activeSemester) return;
      setProposalsLoading(true);
      const res = await getProposalOfStudent(activeSemester.id);
      setProposals(res.data || []);
      setProposalsLoading(false);
    };
    if (activeSemester) fetchProposals();
  }, [activeSemester, getProposalOfStudent]);

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      if (!activeSemester) return;
      setTeachersLoading(true);
      const res = await getTeacherAvailable(activeSemester.id);
      setTeachers(res.data || []);
      setTeachersLoading(false);
    };
    if (activeSemester) fetchTeachers();
  }, [activeSemester, getTeacherAvailable]);

  // Proposal detail modal handlers
  const handleProposalClick = (proposal: ThesisProposal) => {
    setSelectedProposal(proposal);
    setDetailModalOpen(true);
  };

  const handleCancelProposal = async () => {
    if (!selectedProposal) return;
    setEditLoading(true);
    const res = await cancelThesisProposal(selectedProposal.id);
    setEditLoading(false);
    if (!res.error) {
      const attRes = await getByEntity("thesis_proposal", selectedProposal.id);
      if (attRes.data) {
        for (const att of attRes.data) {
          await deleteAttachment(Number(att.id));
        }
      }
      message.success("Proposal cancelled");
      setDetailModalOpen(false);
      setSelectedProposal(null);
      // Refresh proposals
      const sid = semesterId;
      if (!sid) return;
      const result = await getProposalOfStudent(sid);
      setProposals(result.data || []);
    } else {
      setErrorDetail(res.error);
      message.error(res.error);
    }
  };

  const handleEditProposal = () => {
    setEditModalOpen(true);
    setDetailModalOpen(false);
  };

  const handleSubmitEdit = async (values: any, files: File[]) => {
    if (!selectedProposal) return;
    setEditLoading(true);

    const res = await updateThesisProposal(selectedProposal.id, {
      ...values,
      targetTeacherId: selectedProposal.targetTeacherId,
      semesterId: selectedProposal.semesterId,
    });

    if (!res.error && res.data) {
      // Only upload files after successful entity update
      if (files && files.length > 0) {
        const dt = new DataTransfer();
        files.forEach(file => dt.items.add(file));
        const uploadRes = await uploadFiles(dt.files, "thesis_proposal", selectedProposal.id);
        
        if (uploadRes.error) {
          message.warning("Proposal updated, but file upload failed: " + uploadRes.error);
        } else {
          message.success("Proposal and attachments updated successfully");
        }
      } else {
        message.success("Proposal updated");
      }
      
      setEditModalOpen(false);
      setSelectedProposal(null);
      
      // Refresh proposals
      const sid = semesterId;
      if (!sid) return;
      const result = await getProposalOfStudent(sid);
      setProposals(result.data || []);
    } else {
      setErrorDetail(res.error);
      message.error(res.error);
    }
    setEditLoading(false);
  };

  // Teacher selection and proposal submission
  const handleTeacherClick = (teacher: any) => {
    setSelectedTeacher(teacher);
    setSubmissionModalOpen(true);
  };

  // Submission with attachment
  const handleSubmitProposal = async (values: any, files: FileList | null) => {
    setSubmissionLoading(true);
    const res = await createThesisProposal({
      ...values,
      targetTeacherId: selectedTeacher.teacherId,
      semesterId: semesterId,
    });
    if (!res.error && res.data) {
      // Upload attachments nếu có
      if (files && files.length > 0) {
        await uploadFiles(files, "thesis_proposal", res.data.id);
      }
      message.success("Proposal submitted");
      setSubmissionModalOpen(false);
      setSelectedTeacher(null);
      // Refresh proposals
      const sid = semesterId || 1;
      const result = await getProposalOfStudent(sid);
      setProposals(result.data || []);
    } else {
      setErrorDetail(res.error);
      message.error(res.error);
    }
    setSubmissionLoading(false);
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
        {
          proposals.length > 0 && (
            <StudentProposalsTable
              proposals={proposals}
              loading={proposalsLoading}
              onSelect={handleProposalClick}
            />
          )
        }
        <AvailableTeachersList
          teachers={teachers}
          loading={teachersLoading}
          onSelect={handleTeacherClick}
        />
        {/* Proposal Detail Modal */}
        <ProposalDetailModal
          open={detailModalOpen}
          proposal={selectedProposal}
          onClose={() => setDetailModalOpen(false)}
          onEdit={handleEditProposal}
          onCancelProposal={handleCancelProposal}
          loading={editLoading}
        />
        {/* Proposal Edit Modal */}
        <ProposalEditModal
          open={editModalOpen}
          proposal={selectedProposal}
          onClose={() => setEditModalOpen(false)}
          onSubmit={handleSubmitEdit}
          loading={editLoading}
        />
        {/* Submission Form Modal */}
        <ProposalSubmissionForm
          open={submissionModalOpen}
          teacher={selectedTeacher}
          onClose={() => setSubmissionModalOpen(false)}
          onSubmit={handleSubmitProposal}
          loading={submissionLoading}
          semesterId={semesterId}
        />
      </div>
    </>
  );
};

// ================== Layout Wrapper ==================

const TeacherAvailableMain = ({ user }: { user: any | null }) => {
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
          <TeacherAvailableContent user={user} />
        </div>
      </div>
    </>
  );
};

export default function TeacherAvailableContentWrapper({ user }: { user: any | null }) {
  return (
    <LayoutProvider>
      <TeacherAvailableMain user={user} />
    </LayoutProvider>
  );
}