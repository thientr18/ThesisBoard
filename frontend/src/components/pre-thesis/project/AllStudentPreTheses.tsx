import { useEffect, useState } from "react";
import { usePreThesisApi } from "../../../api/endpoints/pre-thesis.api";
import { Link } from "react-router-dom";
import { Card, Button, Spin, Alert, Typography } from "antd";

const { Title, Text } = Typography;

const AllStudentPreTheses = ({ user }: { user: any | null }) => {
  const { getPreThesesByStudent } = usePreThesisApi();

  const [preTheses, setPreTheses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreTheses = async () => {
      try {
        const { data } = await getPreThesesByStudent();
        setPreTheses(Array.isArray(data) ? data : data || []);
      } catch (err) {
        setError("Failed to load pre-thesis projects.");
      } finally {
        setLoading(false);
      }
    };
    fetchPreTheses();
  }, [getPreThesesByStudent]);

  if (loading) return (
    <div className="flex justify-center items-center h-40">
      <Spin size="large" />
    </div>
  );
  if (error) return <Alert message={error} type="error" showIcon className="my-4" />;
  if (preTheses.length === 0) return <Alert message="No pre-thesis projects found." type="info" showIcon className="my-4" />;

  return (
    <div className="w-full px-4 py-2">
      <Title level={3} className="mb-6">Your Pre-Thesis Projects</Title>
      <div className="flex flex-wrap gap-6">
        {preTheses.map((pt) => (
          <Card
            key={pt.id}
            title={<Text strong>{pt.topicApplication?.topic?.title || "N/A"}</Text>}
            bordered
            className="w-80 shadow-md bg-white"
            extra={
              <Link to={`/prethesis/${pt.id}`}>
                <Button type="primary" className="bg-indigo-600 hover:bg-indigo-700">
                  View Details
                </Button>
              </Link>
            }
          >
            <div className="mb-2">
              <Text type="secondary">Semester:</Text> {pt.semester?.name || "N/A"}
            </div>
            <div className="mb-2">
              <Text type="secondary">Supervisor:</Text> {pt.supervisorTeacher?.user?.fullName || "N/A"}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default function AllStudentPreThesesContent({ user }: { user: any | null }) {
  return <AllStudentPreTheses user={user} />;
}