import React from "react";
import { Avatar, Dropdown, Menu, Button, Badge } from "antd";
import {
  BellOutlined,
  LogoutOutlined,
  UserOutlined,
  HomeOutlined,
  TeamOutlined,
  SettingOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

interface NavbarProps {
  userRole?: "admin" | "moderator" | "teacher" | "student";
  userName?: string;
  onLogout?: () => void;
}

const NAV_LINKS: Record<
  NonNullable<NavbarProps["userRole"]>,
  { key: string; label: string; icon: React.ReactNode; href: string }[]
> = {
  admin: [
    { key: "dashboard", label: "Dashboard", icon: <HomeOutlined />, href: "/admin/dashboard" },
    { key: "users", label: "Users", icon: <TeamOutlined />, href: "/admin/users" },
    { key: "config", label: "System", icon: <SettingOutlined />, href: "/admin/config" },
  ],
  moderator: [
    { key: "dashboard", label: "Dashboard", icon: <HomeOutlined />, href: "/moderator/dashboard" },
    { key: "reports", label: "Reports", icon: <FileTextOutlined />, href: "/moderator/reports" },
    { key: "semester", label: "Semester", icon: <SettingOutlined />, href: "/moderator/semester" },
  ],
  teacher: [
    { key: "dashboard", label: "Dashboard", icon: <HomeOutlined />, href: "/teacher/dashboard" },
    { key: "topics", label: "Topics", icon: <FileTextOutlined />, href: "/teacher/topics" },
    { key: "committee", label: "Committee", icon: <TeamOutlined />, href: "/teacher/committee" },
  ],
  student: [
    { key: "home", label: "Home", icon: <HomeOutlined />, href: "/student/home" },
    { key: "projects", label: "Projects", icon: <FileTextOutlined />, href: "/student/projects" },
    { key: "timeline", label: "Timeline", icon: <SettingOutlined />, href: "/student/timeline" },
  ],
};

const Navbar: React.FC<NavbarProps> = ({ userRole, userName, onLogout }) => {
  // Simulated notification count (replace with real data)
  const notificationCount = 3;

  // User dropdown menu
  const menu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={onLogout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <nav className="sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 h-14">
        {/* Left: Logo & System Name */}
        <div className="flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="ThesisBoard Logo"
            className="h-8 w-8"
          />
          <span className="font-bold text-lg text-primary dark:text-white tracking-tight">
            ThesisBoard
          </span>
        </div>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex gap-4">
          {(userRole && NAV_LINKS[userRole]) ? (
            NAV_LINKS[userRole].map((link) => (
              <a
                key={link.key}
                href={link.href}
                className="flex items-center gap-1 text-gray-700 dark:text-gray-200 hover:text-primary font-medium px-2 py-1 rounded transition-colors"
              >
                {link.icon}
                <span>{link.label}</span>
              </a>
            ))
          ) : null}
        </div>

        {/* Right: Notification + User Menu */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <Badge count={notificationCount} size="small" offset={[0, 4]}>
            <Button
              type="text"
              shape="circle"
              icon={<BellOutlined />}
              aria-label="Notifications"
              className="text-lg"
            />
          </Badge>

          {/* User Dropdown */}
          <Dropdown overlay={menu} placement="bottomRight" trigger={["click"]}>
            <div className="flex items-center gap-2 cursor-pointer select-none">
              <Avatar
                size="small"
                icon={<UserOutlined />}
                className="bg-primary"
              />
              <span className="hidden sm:inline text-gray-800 dark:text-gray-100 font-semibold text-sm">
                {userName ?? "User"}
              </span>
            </div>
          </Dropdown>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;