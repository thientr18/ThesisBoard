import React from "react";
import { BellOutlined } from "@ant-design/icons";
import IconButton from "../buttons/IconButton";
import Badge from "../display/Badge";
import ProfileMenu from "../../auth/ProfileMenu";
import { useUnreadNotifications } from "../../../hooks/useUnreadNotifications";

interface NavbarProps {
  userName?: string;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ userName, onLogout }) => {
  const { count, loading, error } = useUnreadNotifications();

  return (
    <nav className="sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 h-14">
        {/* Left: Logo & System Name */}
        <div className="flex items-center gap-2">
          <img
            src="/Logo-HCMIU.svg.png"
            alt="ThesisBoard Logo"
            className="h-8 w-8"
          />
          <span className="font-bold text-lg text-primary dark:text-white tracking-tight">
            ThesisBoard
          </span>
        </div>

        {/* Right: Notification + User Menu */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
            <Badge
              count={loading ? 0 : count}
              size="small"
              offset={[0, 6]}
              dot={loading}
              showZero={false}
            >
              <IconButton
                type="text"
                shape="circle"
                icon={<BellOutlined />}
                ariaLabel="Notifications"
                className="text-lg"
                tooltip={error ? `Error: ${error}` : "Notifications"}
                onClick={() => {
                  if (!loading) window.location.href = "/notifications";
                }}
              />
            </Badge>

          {/* User Dropdown */}
          <ProfileMenu userName={userName ?? "User"} onLogout={onLogout} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;