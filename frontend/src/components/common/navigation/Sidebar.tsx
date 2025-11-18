import React, { useMemo } from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UsergroupAddOutlined,
  FileProtectOutlined,
  BookOutlined,
  CalendarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  FileOutlined,
  NotificationOutlined,
  SettingOutlined,
  FileSearchOutlined,
  ProjectOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { NavLink, useLocation } from "react-router-dom";
import type { UserWithRoles } from "../../../types/user.types";
import { theme } from "../../../utils/theme";
import { useLayoutContext } from "../../../contexts/LayoutContext";

const { Sider } = Layout;

type MenuItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  children?: MenuItem[];
};

interface SidebarProps {
  user?: UserWithRoles | null;
}

const adminModeratorMenu: MenuItem[] = [
  {
    key: "overview",
    label: "Overview",
    icon: <DashboardOutlined />,
    path: "/dashboard",
  },
  {
    key: "users",
    label: "Users Management",
    icon: <UsergroupAddOutlined />,
    path: "/",
    children: [
      {
        key: "users-student",
        label: "Student",
        icon: <TeamOutlined />,
        path: "/student-management",
      },
      {
        key: "users-teacher",
        label: "Teacher",
        icon: <BookOutlined />,
        path: "/teacher-management",
      },
      {
        key: "users-admin",
        label: "Administrator",
        icon: <SettingOutlined />,
        path: "/administrator-management",
      },
    ],
  },
  {
    key: "prethesis",
    label: "Pre-Thesis Management",
    icon: <FileProtectOutlined />,
    path: "/prethesis",
  },
  {
    key: "thesis",
    label: "Thesis Management",
    icon: <BookOutlined />,
    path: "/thesis",
  },
  {
    key: "timeline",
    label: "Timeline",
    icon: <CalendarOutlined />,
    path: "/timeline",
  },
  {
    key: "committee",
    label: "Defense Committee",
    icon: <TeamOutlined />,
    path: "/committee",
  },
  {
    key: "grading",
    label: "Grading Systems",
    icon: <CheckCircleOutlined />,
    path: "/grading",
  },
  {
    key: "files",
    label: "Files",
    icon: <FileOutlined />,
    path: "/files",
  },
  {
    key: "announcement",
    label: "Announcement",
    icon: <NotificationOutlined />,
    path: "/announcements",
  },
  {
    key: "settings",
    label: "Settings",
    icon: <SettingOutlined />,
    path: "/settings",
  },
  {
    key: "logs",
    label: "Logs",
    icon: <FileSearchOutlined />,
    path: "/logs",
  },
];

const studentMenu: MenuItem[] = [
  {
    key: "overview",
    label: "Overview",
    icon: <DashboardOutlined />,
    path: "/dashboard",
  },
  {
    key: "project",
    label: "Project",
    icon: <ProjectOutlined />,
    path: "/project",
  },
  {
    key: "registration",
    label: "Registration",
    icon: <FormOutlined />,
    path: "/registration",
  },
];

const teacherMenu: MenuItem[] = [
  {
    key: "overview",
    label: "Overview",
    icon: <DashboardOutlined />,
    path: "/dashboard",
  },
  {
    key: "project",
    label: "Project",
    icon: <ProjectOutlined />,
    path: "/project",
  },
  {
    key: "registration",
    label: "Registration",
    icon: <FormOutlined />,
    path: "/registration",
  },
];

const roleMenuMap: Record<string, MenuItem[]> = {
  admin: adminModeratorMenu,
  moderator: adminModeratorMenu,
  student: studentMenu,
  teacher: teacherMenu,
};

function getMenuItemsForRoles(roles?: { name: string }[]): MenuItem[] {
  if (!roles || roles.length === 0) return [];
  const allItems: MenuItem[] = [];
  roles.forEach((role) => {
    const items = roleMenuMap[role.name.toLowerCase()];
    if (items) allItems.push(...items);
  });
  // Deduplicate by key
  const unique: Record<string, MenuItem> = {};
  allItems.forEach((item) => {
    unique[item.key] = item;
  });
  return Object.values(unique);
}

const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const location = useLocation();
  const { collapsed, setCollapsed } = useLayoutContext();

  const menuItems = useMemo(() => getMenuItemsForRoles(user?.roles), [user]);

  const activeKey =
    menuItems
      .flatMap(item => item.children ? [item, ...item.children] : [item])
      .find(item => location.pathname.startsWith(item.path))?.key
    || menuItems[0]?.key;

  const handleCollapse = (value: boolean) => {
    setCollapsed(value);
  };

  // Helper to render menu items and submenus
  const renderMenuItems = (items: MenuItem[]) =>
    items.map(item =>
      item.children ? (
        <Menu.SubMenu
          key={item.key}
          icon={item.icon}
          title={item.label}
          popupClassName="sidebar-submenu"
        >
          {item.children.map(sub => (
            <Menu.Item key={sub.key} icon={sub.icon}>
              <NavLink
                to={sub.path}
                className={({ isActive }) =>
                  isActive
                    ? "font-semibold text-primary"
                    : "font-medium text-gray-700"
                }
                style={{
                  color: location.pathname.startsWith(sub.path)
                    ? theme.colors.primary
                    : undefined,
                }}
              >
                {sub.label}
              </NavLink>
            </Menu.Item>
          ))}
        </Menu.SubMenu>
      ) : (
        <Menu.Item key={item.key} icon={item.icon}>
          <NavLink
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "font-semibold text-primary"
                : "font-medium text-gray-700"
            }
            style={{
              color: location.pathname.startsWith(item.path)
                ? theme.colors.primary
                : undefined,
            }}
          >
            {item.label}
          </NavLink>
        </Menu.Item>
      )
    );

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={handleCollapse}
      width={220}
      theme="light"
      style={{
        background: theme.colors.background,
        borderRight: "1px solid #e5e7eb",
        minHeight: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 50,
        height: "100vh",
      }}
    >
      <div className="flex items-center justify-center py-4">
        <img
          src="/Logo-HCMIU.svg.png"
          alt="ThesisBoard Logo"
          className="h-10 w-10"
        />
        {!collapsed && (
          <span
            className="ml-2 font-bold text-xl"
            style={{ color: theme.colors.primary }}
          >
            ThesisBoard
          </span>
        )}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[activeKey]}
        style={{ borderRight: 0, fontFamily: theme.fonts.body }}
      >
        {renderMenuItems(menuItems)}
      </Menu>
    </Sider>
  );
};

export default Sidebar;