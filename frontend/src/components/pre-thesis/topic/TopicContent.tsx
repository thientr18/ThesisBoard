import { useState, useEffect, useCallback } from "react";
import { Spin, Alert, message, Modal, Table, Button } from "antd";
import { Title, Text } from "../../common/display/Typography";
import Sidebar from "../../common/navigation/Sidebar";
import Navbar from "../../common/navigation/Navbar";
import { LayoutProvider, useLayoutContext, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../../../contexts/LayoutContext";
import { usePreThesisApi } from "../../../api/endpoints/pre-thesis.api";
import { useSemesterApi } from "../../../api/endpoints/semester.api";
import TopicDetail from "./TopicDetail";
import TopicCard from "./TopicCard";
import TopicFilterBar from "./TopicFilterBar";
import ApplicationCard from "./ApplicationCard";
import ApplicationDetail from "./ApplicationDetail";
import ApplicationForm from "./ApplicationForm";

function TopicContent({ user }: { user: any | null }) {
  const { collapsed } = useLayoutContext();
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  const { getTopicsWithSlots, getMyApplications, cancelApplication, updateApplication } = usePreThesisApi();
  const { getActive: getActiveSemester } = useSemesterApi();

  const [activeSemester, setActiveSemester] = useState<any | null>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);

  // Application states
  const [applications, setApplications] = useState<any[]>([]);
  const [appLoading, setAppLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [appDetailVisible, setAppDetailVisible] = useState(false);
  const [cancelAppId, setCancelAppId] = useState<number | null>(null);
  const [editFormVisible, setEditFormVisible] = useState(false);

  const [applyFormVisible, setApplyFormVisible] = useState(false);
  const [applyTopic, setApplyTopic] = useState<any | null>(null);
  const { applyToTopic } = usePreThesisApi();

  // Filter states
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("all");

  // Fetch semester
  useEffect(() => {
    (async () => {
      const { data } = await getActiveSemester();
      setActiveSemester(data || null);
    })();
  }, [getActiveSemester]);

  // Fetch topics
  const reloadTopics = useCallback(async () => {
    if (!activeSemester?.id) return; // Không gọi nếu chưa có semester
    setLoading(true);
    const { data, error } = await getTopicsWithSlots(activeSemester.id);
    if (error) setError(error);
    setTopics(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [getTopicsWithSlots, activeSemester?.id]);

  useEffect(() => {
    if (activeSemester?.id) {
      reloadTopics();
    }
  }, [reloadTopics, activeSemester?.id]);

  // Fetch applications for student
  const isStudent = Array.isArray(user?.roles) && user.roles.some((r: any) => r.name === "student");
  const reloadApplications = useCallback(async () => {
    if (!isStudent || !activeSemester?.id) return;
    setAppLoading(true);
    const { data } = await getMyApplications(activeSemester.id);
    setApplications(Array.isArray(data) ? data : []);
    setAppLoading(false);
  }, [getMyApplications, isStudent, activeSemester?.id]);

  useEffect(() => {
    if (isStudent) reloadApplications();
  }, [reloadApplications, isStudent]);

  // Topic detail
  const handleTopicClick = useCallback((topic: any) => {
    setSelectedTopic(topic);
    setDetailVisible(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailVisible(false);
    setSelectedTopic(null);
  }, []);

  // Application detail
  const handleAppClick = (application: any) => {
    setSelectedApplication(application);
    setAppDetailVisible(true);
  };

  const handleCloseAppDetail = () => {
    setAppDetailVisible(false);
    setSelectedApplication(null);
  };

  const handleApplyFromTopic = (topic: any) => {
    setApplyTopic(topic);
    setApplyFormVisible(true);
    setDetailVisible(false);
  };

  const handleSubmitApplication = async (values: { proposalTitle: string; proposalAbstract: string }) => {
    if (!applyTopic) return;
    const res = await applyToTopic(applyTopic.id, values);
    if (res.error) {
      message.error(res.error);
    } else {
      message.success("Applied successfully!");
      setApplyFormVisible(false);
      setApplyTopic(null);
      reloadApplications();
      reloadTopics();
    }
  };

  // Cancel application
  const handleCancelApp = async (id: number) => {
    setCancelAppId(id);
    const res = await cancelApplication(id);
    setCancelAppId(null);
    if (res.error) {
      message.error(res.error);
    } else {
      message.success("Application cancelled");
      reloadApplications();
      reloadTopics();
      handleCloseAppDetail();
    }
  };

  const handleUpdateApplication = async (values: { proposalTitle: string; proposalAbstract: string }) => {
    if (!selectedApplication) return;
    const res = await updateApplication(selectedApplication.id, values);
    if (res.error) {
      message.error(res.error);
    } else {
      message.success("Application updated!");
      setEditFormVisible(false);
      setAppDetailVisible(false);
      reloadApplications();
      reloadTopics();
    }
  };

  // Filter topics
  const filteredTopics = topics.filter(topic => {
    const matchKeyword =
      !keyword ||
      topic.title?.toLowerCase().includes(keyword.toLowerCase()) ||
      topic.description?.toLowerCase().includes(keyword.toLowerCase());
    const matchStatus =
      status === "all" || topic.status === status;
    return matchKeyword && matchStatus;
  });

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
        <Navbar user={user} pageName="Pre-Thesis Topics" />
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {error && (
              <Alert type="error" message="Failed to load topics" description={error} showIcon className="mb-4" />
            )}
            <div className="mb-4">
              <Title level={4} className="text-gray-700">
                Semester:&nbsp;
                {activeSemester
                  ? (activeSemester.name || activeSemester.title || activeSemester.semesterName || "N/A")
                  : <span className="text-gray-400">Loading...</span>
                }
              </Title>
            </div>
            <TopicFilterBar
              keyword={keyword}
              status={status}
              onKeywordChange={setKeyword}
              onStatusChange={setStatus}
            />
            {/* Applications for student */}
            {isStudent && (
              <div className="mb-8">
                <Title level={5} className="mb-2">Your Applications</Title>
                {appLoading ? (
                  <Spin />
                ) : applications.length === 0 ? (
                  <Text className="text-gray-500">You have not applied to any topics.</Text>
                ) : (
                  <StudentApplicationsTable
                    applications={applications}
                    loading={appLoading}
                    onEdit={handleAppClick}
                    onCancel={handleCancelApp}
                    cancelAppId={cancelAppId}
                  />
                )}
                <ApplicationDetail
                  open={appDetailVisible}
                  application={selectedApplication}
                  onClose={handleCloseAppDetail}
                  onEdit={() => setEditFormVisible(true)}
                  onCancel={handleCancelApp}
                  loading={cancelAppId === selectedApplication?.id}
                />

                {editFormVisible && selectedApplication && (
                  <Modal
                    open={editFormVisible}
                    onCancel={() => setEditFormVisible(false)}
                    footer={null}
                    title="Edit Application"
                    destroyOnClose
                  >
                    <ApplicationForm
                      loading={false}
                      onSubmit={handleUpdateApplication}
                      initialValues={{
                        proposalTitle: selectedApplication.proposalTitle,
                        proposalAbstract: selectedApplication.proposalAbstract,
                      }}
                    />
                  </Modal>
                )}
              </div>
            )}
            {/* Topics */}
            <Title level={5} className="mb-2">Available Topics</Title>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" />
              </div>
            ) : filteredTopics.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📚</div>
                <Title level={3} className="text-gray-400! mb-2!">
                  No Topics Found
                </Title>
                <Text className="text-gray-500">
                  No topics are available for this semester.
                </Text>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 mb-8">
                {filteredTopics.map(topic => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    onClick={handleTopicClick}
                  />
                ))}
              </div>
            )}
            {user && (
              <TopicDetail
                open={detailVisible}
                topic={selectedTopic}
                onClose={handleCloseDetail}
                user={user}
                reloadTopics={reloadTopics}
                applications={applications}
                onApply={handleApplyFromTopic}
              />
            )}
            <Modal
              open={applyFormVisible}
              onCancel={() => {
                setApplyFormVisible(false);
                setApplyTopic(null);
              }}
              footer={null}
              title="Apply to Topic"
              destroyOnClose
            >
              <ApplicationForm
                loading={false}
                onSubmit={handleSubmitApplication}
                initialValues={{ proposalTitle: "", proposalAbstract: "" }}
              />
            </Modal>
          </div>
        </div>
      </div>
    </>
  );
}

export default function TopicPageContent({ user }: { user: any | null }) {
  return (
    <LayoutProvider>
      <TopicContent user={user} />
    </LayoutProvider>
  );
}

const StudentApplicationsTable: React.FC<{
  applications: any[];
  loading: boolean;
  onEdit: (application: any) => void;
  onCancel: (id: number) => void;
  cancelAppId: number | null;
}> = ({ applications, loading, onEdit, onCancel, cancelAppId }) => (
  <Table
    loading={loading}
    dataSource={applications}
    rowKey="id"
    pagination={false}
    columns={[
      { title: "Topic", dataIndex: ["topic", "title"], key: "topic" },
      { title: "Proposal Title", dataIndex: "proposalTitle", key: "proposalTitle" },
      { title: "Abstract", dataIndex: "proposalAbstract", key: "proposalAbstract" },
      { title: "Status", dataIndex: "status", key: "status",
        render: (status: string) => {
          const color = status === "pending" ? "blue" : status === "accepted" ? "green" : status === "rejected" ? "red" : "default";
          return <span style={{ color }}>{status.toUpperCase()}</span>;
        }
      },
      {
        title: "Actions",
        key: "actions",
        render: (_: any, record: any) => (
          <div className="flex gap-2">
            {record.status === "pending" && (
              <>
                <Button
                  size="small"
                  danger
                  loading={cancelAppId === record.id}
                  onClick={() => onCancel(record.id)}
                >
                  Cancel
                </Button>
              </>
            )}
            <Button size="small" onClick={() => onEdit(record)}>
              Details
            </Button>
          </div>
        ),
      },
    ]}
  />
);