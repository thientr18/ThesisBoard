import { LayoutProvider, useLayoutContext, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../contexts/LayoutContext";
import Sidebar from "./common/navigation/Sidebar";
import Navbar from "./common/navigation/Navbar";
import AllStudentPreThesesContent from "./pre-thesis/project/AllStudentPreTheses";
// import AllStudentThesesContent from "./thesis/AllStudentTheses"; // Future

const AllStudentProjects = ({ user }: { user: any | null }) => {
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
        <Navbar user={user} pageName="My Projects"/>
        <div>
          {/* Pre-Thesis Section */}
          <section className="mb-8">
            <AllStudentPreThesesContent user={user} />
          </section>
          {/* Thesis Section (future) */}
          {/* <section>
            <AllStudentThesesContent user={user} />
          </section> */}
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
  )
};