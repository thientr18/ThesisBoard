import React from "react";
import { Dropdown, type MenuProps } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import Avatar from "../common/display/Avatar";
import { useAuth0 } from "@auth0/auth0-react";
import type { UserWithRoles } from "../../types/user.types";

interface ProfileMenuProps {
  user?: UserWithRoles | null;
  role?: string;
  onLogout?: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ user, onLogout }) => {
  const { logout } = useAuth0();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const roles = user?.roles?.map(r => r.name) || [];
  const showProfile = roles.includes("student") || roles.includes("teacher");

  const items: MenuProps["items"] = [
    ...(showProfile
      ? [{
          key: "profile",
          icon: <UserOutlined />,
          label: <a href="/me">Profile</a>,
        }]
      : []),
    {
      key: "change-password",
      icon: <UserOutlined />,
      label: <a href="/change-password">Change Password</a>,
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Log out",
      danger: true,
    },
  ];

  const onMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "logout") handleLogout();
  };

  const initial = user?.fullName?.charAt(0)?.toUpperCase() || "Null";

  return (
    <Dropdown menu={{ items, onClick: onMenuClick }} placement="bottomRight" trigger={["click"]}>
      <div
        className="flex items-center gap-2 cursor-pointer select-none"
        aria-label="User menu"
        role="button"
      >
        <Avatar size="small" className="bg-primary" icon={<UserOutlined />}>
          {initial}
        </Avatar>
        <span className="hidden sm:inline font-['Open_Sans'] text-gray-800 font-semibold text-sm">
          {user?.fullName || "Null"}
        </span>
      </div>
    </Dropdown>
  );
};

export default ProfileMenu;