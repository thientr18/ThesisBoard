import React, { useState, useEffect, useCallback } from "react";
import { Spin, Alert, Card } from "antd";
import { Title, Text } from "../../common/display/Typography";
import Sidebar from "../../common/navigation/Sidebar";
import Navbar from "../../common/navigation/Navbar";
import { LayoutProvider, useLayoutContext, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../../../contexts/LayoutContext";
import { usePreThesisApi } from "../../../api/endpoints/pre-thesis.api";
import { useSemesterApi } from "../../../api/endpoints/semester.api";
import TopicCard from "./TopicCard";
import TopicDetail from "./TopicDetail";
import TopicForm from "./TopicForm";
import { PlusOutlined } from "@ant-design/icons";

function TopicContentTeacher({ user }: { user: any | null }) {
  const { collapsed } = useLayoutContext();
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  const { getOwnTopicsInActiveSemester } = usePreThesisApi();
  const { getOwnTeacherAvailabilityInActiveSemester } = useSemesterApi();

  // State
  const [activeSemester, setActiveSemester] = useState<any | null>(null);
  const [availability, setAvailability] = useState<any | null>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // error states
  const [error, setError] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal/detail
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<any | null>(null);

  // Fetch semester & availability on mount
  useEffect(() => {
    (async () => {
      setError(null);
      setErrorDetail(null);
      try {
        const { data: availabilityData, error: availError } = await getOwnTeacherAvailabilityInActiveSemester();
        if (availError) {
          setError("Failed to fetch active semester or availability.");
          setErrorDetail(availError);
          setAvailability(null);
          setActiveSemester(null);
          setLoading(false);
          return;
        }
        setAvailability(availabilityData?.availability || null);
        setActiveSemester(availabilityData?.semester || null);
      } catch (err: any) {
        setError("An unexpected error occurred while fetching semester and availability.");
        setErrorDetail(String(err?.message ?? err));
        setAvailability(null);
        setActiveSemester(null);
        setLoading(false);
      }
    })();
  }, [getOwnTeacherAvailabilityInActiveSemester]);

  // Fetch topics
  useEffect(() => {
    if (!activeSemester?.id) return;
    setLoading(true);
    setError(null);
    setErrorDetail(null);
    (async () => {
      try {
        const { data, error: topicsError } = await getOwnTopicsInActiveSemester(activeSemester.id);
        if (topicsError) {
          setError("Failed to fetch topics for the active semester.");
          setErrorDetail(topicsError);
          setTopics([]);
          setLoading(false);
          return;
        }
        setTopics(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (err: any) {
        setError("Failed to fetch topics for the active semester.");
        setErrorDetail(String(err?.message ?? err));
        setTopics([]);
        setLoading(false);
      }
    })();
  }, [getOwnTopicsInActiveSemester, activeSemester?.id]);

  // Handlers
  const handleTopicClick = useCallback((topic: any) => {
    setSelectedTopic(topic);
    setDetailVisible(true);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailVisible(false);
    setSelectedTopic(null);
  }, []);

  const reloadTopics = useCallback(async () => {
    if (!activeSemester?.id) return;
    setLoading(true);
    setError(null);
    setErrorDetail(null);
    try {
      const { data, error: topicsError } = await getOwnTopicsInActiveSemester(activeSemester.id);
      if (topicsError) {
        setError("Failed to fetch topics for the active semester.");
        setErrorDetail(topicsError);
      }
      setTopics(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError("Failed to fetch topics for the active semester.");
      setErrorDetail(String(err?.message ?? err));
      setTopics([]);
    }
    setLoading(false);
  }, [getOwnTopicsInActiveSemester, activeSemester?.id]);

  if (error) {
    return (
      <>
        <Sidebar user={user}/>
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
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <Alert
                type="error"
                message="Error"
                description={error}
                showIcon
                className="mb-4"
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Sidebar user={user}/>
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
            {/* Semester & Teacher Availability Display */}
            <div className="mb-4">
              <Title level={4} className="text-gray-700">
                Semester:&nbsp;
                {activeSemester
                  ? (activeSemester.name || activeSemester.title || activeSemester.semesterName || "N/A")
                  : <span className="text-gray-400">Loading...</span>
                }
              </Title>
              {availability && (
                <div className="ml-2 text-base text-gray-600">
                  <div>
                    <b>Max Pre-Thesis:</b> {availability.maxPreThesis}
                  </div>
                  <div>
                    <b>Max Thesis:</b> {availability.maxThesis}
                  </div>
                  <div>
                    <b>Status:</b> {availability.isOpen ? "Open" : "Closed"}
                  </div>
                  {availability.note && (
                    <div>
                      <b>Note:</b> {availability.note}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mb-8 max-w-2xl mx-auto">
              {formError && (
                <Alert
                  type="error"
                  message="Cannot create topic"
                  description={formError}
                  showIcon
                  className="mb-4"
                  closable
                  onClose={() => setFormError(null)}
                />
              )}
              <Card
                title={
                  <span>
                    <PlusOutlined style={{ color: "#1890ff", marginRight: 8 }} />
                    Create New Topic
                  </span>
                }
                bordered={false}
                style={{ boxShadow: "0 2px 8px #f0f1f2" }}
              >
                <TopicForm
                  onSuccess={reloadTopics}
                  semesterId={activeSemester?.id}
                  onError={setFormError}
                />
              </Card>
            </div>

            {/* Topics List */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" />
              </div>
            ) : topics.length === 0 ? (
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
              <>
                <div className="grid grid-cols-1 gap-6 mb-8">
                  {topics.map(topic => (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      onClick={handleTopicClick}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Topic Detail Modal */}
            <TopicDetail
              open={detailVisible}
              topic={selectedTopic}
              onClose={handleCloseDetail}
              onDelete={reloadTopics}
              onUpdate={reloadTopics}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default function TopicPageContentTeacher({ user }: { user: any | null }) {
  return (
    <LayoutProvider>
      <TopicContentTeacher user={user} />
    </LayoutProvider>
  );
}