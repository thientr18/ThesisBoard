import { useEffect, useState } from "react";
import { usePreThesisApi } from "../../../api/endpoints/pre-thesis.api";
import { useSemesterApi } from "../../../api/endpoints/semester.api";
import ApplicationCard from "./ApplicationCard";
import ApplicationDetail from "./ApplicationDetail";
import ApplicationFilter from "./ApplicationFilter";
import { LayoutProvider, useLayoutContext, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../../../contexts/LayoutContext";
import Sidebar from "../../common/navigation/Sidebar";
import Navbar from "../../common/navigation/Navbar";

const ApplicationContent = ({ user }: { user: any | null }) => {
  const { collapsed } = useLayoutContext();
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  const { getApplicationsByTeacher } = usePreThesisApi();
  const { getActive } = useSemesterApi();
  const [applications, setApplications] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      const { data: semester } = await getActive();
      if (semester) {
        const { data } = await getApplicationsByTeacher(semester.id);
        setApplications(data || []);
      }
    };
    fetchData();
  }, [getApplicationsByTeacher, getActive]);

  const filtered = applications.filter(app =>
    filter ? app.status === filter : true
  );

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
        <Navbar user={user} pageName="Topics Application" />
        <div className="min-h-screen bg-gray-50 p-4">
          <ApplicationFilter value={filter} onChange={setFilter} />
          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              {filtered.map(app => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onClick={() => setSelected(app)}
                  selected={selected?.id === app.id}
                />
              ))}
            </div>
            <div style={{ flex: 1 }}>
              {selected && (
                <ApplicationDetail
                  application={selected}
                  onStatusChange={status => {
                    window.location.reload();
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function ApplicationPageContent({ user }: { user: any | null }) {
  return (
    <LayoutProvider>
        <ApplicationContent user={user} />
    </LayoutProvider>
  )
};