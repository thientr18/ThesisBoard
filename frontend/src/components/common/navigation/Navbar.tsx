import React, { useState, useCallback, useEffect} from "react";
import { BellOutlined } from "@ant-design/icons";
import IconButton from "../buttons/IconButton";
import Badge from "../display/Badge";
import ProfileMenu from "../../profile/ProfileMenu";
import { useUnreadNotifications } from "../../../hooks/useUnreadNotifications";
import { useNotificationAPI } from "../../../api/endpoints/notification.api";
import type { Notification } from "../../../types/notification.types";
import NotificationPanel from "../../notification/NotificationPanel";
import Popover from "../layout/Popover";


interface NavbarProps {
  userName?: string;
  pageName?: string;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ userName, pageName, onLogout }) => {
  const { count, loading: countLoading, error, refresh: refreshCount } = useUnreadNotifications();
  const { getAll, markAsRead, markAllAsRead } = useNotificationAPI();

  const [open, setOpen] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [listError, setListError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    const res = await getAll();
    if (res.error) setListError(res.error);
    else setItems(res.data ?? []);
    setListLoading(false);
  }, [getAll]);

  // Khi popover mở lần đầu thì tải danh sách
  useEffect(() => {
    if (open && items.length === 0 && !listLoading) {
      void loadNotifications();
    }
  }, [open, items.length, listLoading, loadNotifications]);

  const handleItemClick = async (n: Notification) => {
    if (!n.isRead) {
      await markAsRead(n.id);
      await Promise.all([loadNotifications(), refreshCount()]);
    }
    if (n.metadata?.link) window.location.href = n.metadata.link;
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    await Promise.all([loadNotifications(), refreshCount()]);
  };

  const notificationsContent = (
    <NotificationPanel
      notifications={items}
      loading={listLoading}
      error={listError}
      onRefresh={loadNotifications}
      onMarkAllRead={handleMarkAll}
      onItemClick={handleItemClick}
    />
  );
  
  return (
    <nav className="sticky top-0 z-40 shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 h-14">
        {/* Left: Logo & System Name */}
        <div className="flex items-center gap-2">
          {pageName && (
            <span className="font-bold text-lg text-primary tracking-tight font-['Open_Sans']">
              {pageName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
            <Popover
              placement="bottomRight"
              trigger="click"
              open={open}
              onOpenChange={(v: boolean) => setOpen(v)}
              overlayClassName="notification-popover"
              content={notificationsContent}
            >
              <span>
                <Badge
                  count={countLoading ? 0 : count}
                  size="small"
                  offset={[0, 6]}
                  dot={countLoading}
                  showZero={false}
                >
                  <IconButton
                    type="text"
                    shape="circle"
                    icon={<BellOutlined />}
                    ariaLabel="Notifications"
                    className="text-lg"
                    tooltip={error ? `Error: ${error}` : "Notifications"}
                  />
                </Badge>
              </span>
            </Popover>
          {/* User Dropdown */}
          <ProfileMenu userName={userName ?? "User"} onLogout={onLogout} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;