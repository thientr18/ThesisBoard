import React from "react";
import { Dropdown, type MenuProps } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import Avatar from "../common/display/Avatar";
import { useAuth0 } from "@auth0/auth0-react";

interface ProfileMenuProps {
  userName?: string;
  onLogout?: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ userName = "User", onLogout }) => {
  const { logout } = useAuth0();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  const items: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: <a href="/me">Profile</a>,
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

  const initial = userName?.charAt(0)?.toUpperCase() || "U";

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
        <span className="hidden sm:inline text-gray-800 dark:text-gray-100 font-semibold text-sm">
          {userName}
        </span>
      </div>
    </Dropdown>
  );
};

export default ProfileMenu;