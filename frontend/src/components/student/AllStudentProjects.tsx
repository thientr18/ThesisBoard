import { useState, useEffect } from "react";
import { LayoutProvider, useLayoutContext, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../../contexts/LayoutContext";
import Sidebar from "../common/navigation/Sidebar";
import Navbar from "../common/navigation/Navbar";
import { useSemesterApi } from "../../api/endpoints/semester.api";
import { usePreThesisApi } from "../../api/endpoints/pre-thesis.api";
import { useTheses } from "../../api/endpoints/thesis.api";
import { useNavigate } from "react-router-dom";
import { Card, Button, Spin, Typography } from "antd";

const PrethesisCard = ({ semester }: { semester: any }) => {
  const { getPreThesisForStudentAndSemester } = usePreThesisApi();
  const [prethesis, setPrethesis] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getPreThesisForStudentAndSemester(semester.id).then(({ data }) => {
      setPrethesis(data);
      setLoading(false);
    });
  }, [semester.id, getPreThesisForStudentAndSemester]);

  if (loading) return <Spin />;

  if (prethesis && Array.isArray(prethesis) && prethesis.length > 0) {
    return (
      <Card
        className="mb-2 cursor-pointer hover:shadow-lg"
        onClick={() => navigate(`/prethesis/${prethesis[0].id}`)}
        style={{ cursor: "pointer" }}
      >
        <Typography.Title level={4}>Pre-Thesis Project</Typography.Title>
        <Typography.Text>Title: {prethesis[0].topicApplication.proposalTitle}</Typography.Text>
      </Card>
    );
  }
  if (prethesis && !Array.isArray(prethesis)) {
    return (
      <Card 
        className="mb-2 cursor-pointer hover:shadow-lg"
        onClick={() => navigate(`/prethesis/${prethesis.id}`)}
        style={{ cursor: "pointer" }}
      >
        <Typography.Title level={4}>Pre-Thesis Project</Typography.Title>
        <Typography.Text>Title: {prethesis.title}</Typography.Text>
      </Card>
    );
  }

  return (
    <div className="flex flex-row items-center gap-2">
      <Typography.Text type="danger">Pre-Thesis not registered. Please register:</Typography.Text>
      <Button
        type="primary"
        onClick={() => navigate(`/prethesis/topics`)}
      >
        Register Pre-Thesis Topic
      </Button>
    </div>
  );
};

const ThesisCard = ({ semester }: { semester: any }) => {
  const { getThesisForStudentAndSemester } = useTheses();
  const [thesis, setThesis] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getThesisForStudentAndSemester(semester.id).then(({ data }) => {
      if (data && Array.isArray(data) && data.length > 0) {
        setThesis(data[0].thesis);
      } else {
        setThesis(null);
      }
      setLoading(false);
    });
  }, [semester.id, getThesisForStudentAndSemester]);
  if (loading) return <Spin />;

  if (thesis && Array.isArray(thesis) && thesis.length > 0) {
    return (
      <Card 
        className="mb-2 cursor-pointer hover:shadow-lg"
        onClick={() => navigate(`/thesis/${thesis[0].id}`)}
        style={{ cursor: "pointer" }}
      >
        <Typography.Title level={4}>Thesis Project</Typography.Title>
        <Typography.Text>Title: {thesis[0].title}</Typography.Text>
      </Card>
    );
  }
  if (thesis && !Array.isArray(thesis)) {
    return (
      <Card
        className="mb-2 cursor-pointer hover:shadow-lg"
        onClick={() => navigate(`/thesis/${thesis.id}`)}
        style={{ cursor: "pointer" }}
      >
        <Typography.Title level={4}>Thesis Project</Typography.Title>
        <Typography.Text>Title: {thesis.title}</Typography.Text>
      </Card>
    );
  }

  return (
    <div className="flex flex-row items-center gap-2">
      <Typography.Text type="danger">Thesis not registered. Please register:</Typography.Text>
      <Button
        type="primary"
        onClick={() => navigate(`/thesis/registrations`)}
      >
        Register Thesis
      </Button>
    </div>
  );
};

const AllStudentProjects = ({ user }: { user: any | null }) => {
  const { collapsed } = useLayoutContext();
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  const { getSemesterForStudent } = useSemesterApi();
  const [studentSemesters, setStudentSemesters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getSemesterForStudent(user.id).then(({ data }) => {
      if (data) setStudentSemesters(data);
      setLoading(false);
    });
  }, [user, getSemesterForStudent]);

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
        <Navbar user={user} pageName="My Projects"/>
        <div className="p-6">
          {loading ? (
            <Spin />
          ) : studentSemesters.length === 0 ? (
            <Typography>No semesters found.</Typography>
          ) : (
            <div className="space-y-4">
              {studentSemesters.map((semester) => (
                <Card
                  key={semester.id}
                  title={semester.semester.name}
                  className="border rounded-lg shadow"
                >
                  {semester.type === 'pre-thesis' && (
                    <PrethesisCard semester={semester.semester} />
                  )}
                  {semester.type === 'thesis' && (
                    <ThesisCard semester={semester.semester} />
                  )}
                  {semester.type === 'not-registered' && (
                    <Typography.Text type="warning">Not registered for this semester.</Typography.Text>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default function AllStudentProjectsContent({ user }: { user: any | null }) {
  return (
    <LayoutProvider>
      <AllStudentProjects user={user} />
    </LayoutProvider>
  );
}