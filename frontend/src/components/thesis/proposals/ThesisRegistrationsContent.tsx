import React, { useEffect, useState, useMemo } from "react";
import { LayoutProvider, useLayoutContext, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../../../contexts/LayoutContext";
import { Card, Table, Button, Modal, Form, Input, Select, Spin, message, Tag, Empty, Typography } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useSemesterApi } from "../../../api/endpoints/semester.api";
import { useThesisRegistrations } from "../../../api/endpoints/thesis.api";
import { useAttachmentApi } from "../../../api/endpoints/attachment.api";
import Sidebar from "../../common/navigation/Sidebar";
import Navbar from "../../common/navigation/Navbar";

const { Title, Text } = Typography;

// Helper function for status colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending_approval':
      return 'processing';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    case 'cancelled':
      return 'default';
    default:
      return 'default';
  }
};

// Helper function for status display text
const getStatusText = (status: string) => {
  switch (status) {
    case 'pending_approval':
      return 'Pending Approval';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
};

// FilterBar Component
interface RegistrationFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  supervisor: string;
  onSupervisorChange: (value: string) => void;
  supervisors: Array<{ id: number; name: string }>;
}

const RegistrationFilterBar: React.FC<RegistrationFilterBarProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  supervisor,
  onSupervisorChange,
  supervisors,
}) => {
  return (
    <Card className="mb-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <Input
          placeholder="Search by student, supervisor, or title..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          allowClear
          className="w-full"
        />

        {/* Status Filter */}
        <Select
          placeholder="Filter by status"
          value={status || undefined}
          onChange={onStatusChange}
          allowClear
          className="w-full"
        >
          <Select.Option value="">All Statuses</Select.Option>
          <Select.Option value="pending_approval">Pending Approval</Select.Option>
          <Select.Option value="approved">Approved</Select.Option>
          <Select.Option value="rejected">Rejected</Select.Option>
          <Select.Option value="cancelled">Cancelled</Select.Option>
        </Select>

        {/* Supervisor Filter */}
        <Select
          placeholder="Filter by supervisor"
          value={supervisor || undefined}
          onChange={onSupervisorChange}
          allowClear
          showSearch
          optionFilterProp="children"
          className="w-full"
        >
          <Select.Option value="">All Supervisors</Select.Option>
          {supervisors.map((sup) => (
            <Select.Option key={sup.id} value={String(sup.id)}>
              {sup.name}
            </Select.Option>
          ))}
        </Select>
      </div>
    </Card>
  );
};

const ThesisRegistrationsContent: React.FC<{ user: any | null }> = ({ user }) => {
  const { getAll: getAllRegistrations, process } = useThesisRegistrations();
  const { getAll: getAllSemesters } = useSemesterApi();
  const { getByEntity, downloadAttachment } = useAttachmentApi();

  const [semesters, setSemesters] = useState<any[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState<any | null>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"approved" | "rejected">("approved");
  const [actionLoading, setActionLoading] = useState(false);

  // Filter state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [supervisorFilter, setSupervisorFilter] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Load semesters
  useEffect(() => {
    setLoadingSemesters(true);
    getAllSemesters().then(res => {
      setSemesters(res.data || []);
      setLoadingSemesters(false);
      if (res.data && res.data.length > 0) setSelectedSemester(res.data[0].id);
    });
  }, [getAllSemesters]);

  // Load registrations
  useEffect(() => {
    if (!selectedSemester) return;
    setLoadingRegistrations(true);
    getAllRegistrations({semesterId: selectedSemester}).then(res => {
      setRegistrations(res.data || []);
      setLoadingRegistrations(false);
    });
  }, [selectedSemester, getAllRegistrations]);

  // Extract unique supervisors for filter
  const supervisors = useMemo(() => {
    const uniqueSupervisors = new Map<number, string>();
    registrations.forEach((reg) => {
      const id = reg.supervisorTeacher?.id;
      const name = reg.supervisorTeacher?.user?.fullName;
      if (id && name && !uniqueSupervisors.has(id)) {
        uniqueSupervisors.set(id, name);
      }
    });
    return Array.from(uniqueSupervisors.entries()).map(([id, name]) => ({ id, name }));
  }, [registrations]);

  // Filter logic
  const filteredRegistrations = useMemo(() => {
    let filtered = [...registrations];

    // Search filter
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (reg) =>
          reg.student?.user?.fullName?.toLowerCase().includes(keyword) ||
          reg.supervisorTeacher?.user?.fullName?.toLowerCase().includes(keyword) ||
          reg.title?.toLowerCase().includes(keyword)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((reg) => reg.status === statusFilter);
    }

    // Supervisor filter
    if (supervisorFilter) {
      filtered = filtered.filter((reg) => String(reg.supervisorTeacher?.id) === supervisorFilter);
    }

    return filtered;
  }, [registrations, searchKeyword, statusFilter, supervisorFilter]);

  // Pagination logic
  const totalItems = filteredRegistrations.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentRegistrations = filteredRegistrations.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, statusFilter, supervisorFilter, selectedSemester]);

  // Load attachments when open detail modal
  useEffect(() => {
    if (detailModalOpen && selectedRegistration?.id) {
      setLoadingFiles(true);
      getByEntity("thesis_registration", selectedRegistration.id).then(res => {
        setAttachments(res.data || []);
        setLoadingFiles(false);
      });
    } else {
      setAttachments([]);
    }
  }, [detailModalOpen, selectedRegistration?.id, getByEntity]);

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

  const handleRowClick = (record: any) => {
    setSelectedRegistration(record);
    setDetailModalOpen(true);
  };

  const handleApprove = () => {
    setActionType("approved");
    setActionModalOpen(true);
  };
  
  const handleReject = () => {
    setActionType("rejected");
    setActionModalOpen(true);
  };

  const handleActionSubmit = async (values: any) => {
    if (!selectedRegistration) return;
    
    // Prevent processing already approved/rejected registrations
    if (selectedRegistration.status !== "pending_approval") {
      message.error("Cannot process registration in current status: " + selectedRegistration.status);
      setActionModalOpen(false);
      return;
    }
    
    setActionLoading(true);
    const res = await process(
      selectedRegistration.id,
      actionType,
      values.decisionReason?.trim()
    );
    
    if (!res.error && res.data) {
      message.success(actionType === "approved" ? "Registration approved" : "Registration rejected");
      setActionModalOpen(false);
      setDetailModalOpen(false);
      setSelectedRegistration(null);
      
      // Refresh registrations
      setLoadingRegistrations(true);
      const regRes = await getAllRegistrations({semesterId: Number(selectedSemester)});
      setRegistrations(regRes.data || []);
      setLoadingRegistrations(false);
    } else {
      message.error(res.error || "Action failed");
    }
    setActionLoading(false);
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Semester Selection */}
      <Card title={<Title level={4} className="mb-0!">Select Semester</Title>} className="shadow-sm">
        <Form layout="inline">
          <Form.Item label="Semester">
            <Select
              loading={loadingSemesters}
              value={selectedSemester}
              onChange={setSelectedSemester}
              style={{ minWidth: 200 }}
            >
              {semesters.map(s => (
                <Select.Option key={s.id} value={s.id}>
                  {s.name || s.id}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Card>

      {/* Filter Bar */}
      <RegistrationFilterBar
        search={searchKeyword}
        onSearchChange={setSearchKeyword}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        supervisor={supervisorFilter}
        onSupervisorChange={setSupervisorFilter}
        supervisors={supervisors}
      />

      {/* Results Summary */}
      <div className="mb-2">
        <Text className="text-gray-600 text-sm">
          Showing {Math.min(startIndex + 1, totalItems)}-{Math.min(endIndex, totalItems)} of {totalItems} registrations
        </Text>
      </div>

      {/* Registrations Table */}
      <Card 
        title={<Title level={4} className="mb-0!">Thesis Registrations</Title>}
        className="shadow-sm"
      >
        {currentRegistrations.length === 0 ? (
          <Empty 
            description={searchKeyword || statusFilter || supervisorFilter 
              ? "No registrations found matching your filters" 
              : "No registrations available for this semester"
            } 
          />
        ) : (
          <Table
            loading={loadingRegistrations}
            dataSource={currentRegistrations}
            rowKey="id"
            pagination={false}
            onRow={record => ({
              onClick: () => handleRowClick(record),
              className: "cursor-pointer hover:bg-gray-50"
            })}
            columns={[
              {
                title: "Student",
                key: "studentId",
                render: (_: any, record: any) => (
                  <div>
                    <div className="font-semibold">{record.student?.user?.fullName || "N/A"}</div>
                    <div className="text-xs text-gray-500">{record.student?.studentIdCode || ""}</div>
                  </div>
                )
              },
              {
                title: "Supervisor",
                key: "supervisorTeacherId",
                render: (_: any, record: any) => (
                  <div>
                    <div className="font-medium">{record.supervisorTeacher?.user?.fullName || "N/A"}</div>
                    <div className="text-xs text-gray-500">{record.supervisorTeacher?.title || ""}</div>
                  </div>
                )
              },
              {
                title: "Title",
                dataIndex: "title",
                key: "title",
                ellipsis: true,
                render: (title: string) => title || "Untitled"
              },
              {
                title: "Status",
                dataIndex: "status",
                key: "status",
                render: (status: string) => (
                  <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                  </Tag>
                )
              },
              {
                title: "Submitted",
                dataIndex: "submittedAt",
                key: "submittedAt",
                render: (date: string) => date ? new Date(date).toLocaleDateString() : "N/A"
              },
              {
                title: "Actions",
                key: "actions",
                render: (_, record) => (
                  <Button type="link" onClick={() => handleRowClick(record)}>
                    Details
                  </Button>
                )
              }
            ]}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-[#189ad6] text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={page} className="px-2 py-2 text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </Card>
      
      {/* Detail Modal */}
      <Modal
        open={detailModalOpen}
        title={<Title level={4} className="mb-0!">Thesis Registration Details</Title>}
        onCancel={() => setDetailModalOpen(false)}
        width={700}
        footer={[
          selectedRegistration?.status === "pending_approval" && (
            <Button key="approve" type="primary" onClick={handleApprove}>
              Approve
            </Button>
          ),
          selectedRegistration?.status === "pending_approval" && (
            <Button key="reject" danger onClick={handleReject}>
              Reject
            </Button>
          ),
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            Close
          </Button>
        ].filter(Boolean)}
      >
        {selectedRegistration ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text strong>Student:</Text>
                <div>{selectedRegistration.student?.user?.fullName}</div>
                <div className="text-sm text-gray-500">{selectedRegistration.student?.studentIdCode}</div>
              </div>
              <div>
                <Text strong>Supervisor:</Text>
                <div>{selectedRegistration.supervisorTeacher?.user?.fullName}</div>
                <div className="text-sm text-gray-500">{selectedRegistration.supervisorTeacher?.title}</div>
              </div>
            </div>

            <div>
              <Text strong>Title:</Text>
              <div className="mt-1">{selectedRegistration.title}</div>
            </div>

            <div>
              <Text strong>Abstract:</Text>
              <div className="mt-1 text-sm">{selectedRegistration.abstract || "No abstract provided"}</div>
            </div>

            {selectedRegistration.note && (
              <div>
                <Text strong>Note:</Text>
                <div className="mt-1 text-sm">{selectedRegistration.note}</div>
              </div>
            )}

            <div>
              <Text strong>Status:</Text>
              <div className="mt-1">
                <Tag color={getStatusColor(selectedRegistration.status)}>
                  {getStatusText(selectedRegistration.status)}
                </Tag>
              </div>
            </div>
            
            {selectedRegistration.status === "approved" && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                <Text className="text-green-700 font-semibold">
                  ✓ This registration has been approved and cannot be modified.
                </Text>
              </div>
            )}
            
            {selectedRegistration.status === "rejected" && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                <Text className="text-red-700 font-semibold">
                  ✗ This registration has been rejected.
                </Text>
                {selectedRegistration.decisionReason && (
                  <div className="mt-1 text-sm">Reason: {selectedRegistration.decisionReason}</div>
                )}
              </div>
            )}
            
            <div>
              <Text strong>Attachments:</Text>
              <div className="mt-2">
                {loadingFiles ? (
                  <Spin size="small" />
                ) : attachments.length > 0 ? (
                  <ul className="list-none space-y-1">
                    {attachments.map(file => (
                      <li key={file.id}>
                        <Button
                          type="link"
                          icon={<DownloadOutlined />}
                          onClick={() => handleDownload(file.id, file.fileName)}
                          className="p-0"
                        >
                          {file.fileName}
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Text type="secondary">No attachments</Text>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Spin />
        )}
      </Modal>

      {/* Approve/Reject Modal */}
      <Modal
        open={actionModalOpen}
        title={actionType === "approved" ? "Approve Registration" : "Reject Registration"}
        onCancel={() => setActionModalOpen(false)}
        onOk={() => {
          document.getElementById("decision-form")?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
        }}
        confirmLoading={actionLoading}
      >
        <Form
          id="decision-form"
          layout="vertical"
          onFinish={(values) => {
            const reason =
              values.decisionReason?.trim() ||
              (actionType === "approved" ? "Approved by administrator" : "");
            handleActionSubmit({ decisionReason: reason });
          }}
        >
          <Form.Item
            name="decisionReason"
            label={actionType === "approved" ? "Approval Reason (Optional)" : "Rejection Reason"}
            rules={[
              { required: actionType === "rejected", message: "Please enter a reason for rejection" },
            ]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder={
                actionType === "approved" 
                  ? "E.g., Approved by administrator" 
                  : "Please provide a reason for rejection"
              } 
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const ThesisRegistrationsMain = ({ user }: { user: any }) => {
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
        <Navbar user={user} pageName="Thesis Registrations" />
        <div>
          <ThesisRegistrationsContent user={user} />
        </div>
      </div>
    </>
  );
};

export default function ThesisRegistrationsContentWrapper({ user }: { user: any }) {
  return (
    <LayoutProvider>
      <ThesisRegistrationsMain user={user} />
    </LayoutProvider>
  );
}