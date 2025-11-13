import React, { useState, useCallback, useEffect} from "react";
import { BellOutlined } from "@ant-design/icons";
import IconButton from "../buttons/IconButton";
import Badge from "../display/Badge";
import ProfileMenu from "../../profile/ProfileMenu";
import { useUnreadNotifications } from "../../../hooks/useUnreadNotifications";
import { useNotificationAPI } from "../../../api/endpoints/notification.api";
import type { Notification } from "../../../types/notification.types";
import { Button, Spin, Empty, List, Typography, Popover } from "antd";

interface NavbarProps {
  userName?: string;
  onLogout?: () => void;
}


const Navbar: React.FC<NavbarProps> = ({ userName, onLogout }) => {
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
    // Ví dụ: mở trang chi tiết rồi đánh dấu đã đọc
    if (!n.isRead) {
      await markAsRead(n.id);
      await Promise.all([loadNotifications(), refreshCount()]);
    }
    if (n.metadata?.link) window.location.href = n.metadata.link;
  }

  const handleMarkAll = async () => {
    await markAllAsRead();
    await Promise.all([loadNotifications(), refreshCount()]);
  };

  const notificationsContent = (
    <div className="w-80 max-h-96 flex flex-col">
      <div className="flex items-center justify-between px-2 py-1 border-b">
        <span className="font-semibold text-sm">Thông báo</span>
        <div className="flex gap-2">
          <Button size="small" type="text" onClick={() => loadNotifications()} disabled={listLoading}>
            Làm mới
          </Button>
          <Button size="small" type="text" onClick={handleMarkAll} disabled={listLoading || items.every(i => i.isRead)}>
            Đánh dấu đã đọc hết
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        {listLoading ? (
          <div className="flex justify-center items-center h-40">
            <Spin size="small" />
          </div>
        ) : listError ? (
          <div className="p-4 text-red-500 text-sm">{listError}</div>
        ) : items.length === 0 ? (
          <Empty description="Không có thông báo" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <List
            dataSource={items}
            renderItem={(n) => (
              <List.Item
                onClick={() => handleItemClick(n)}
                className={`cursor-pointer px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded ${
                  n.isRead ? "opacity-70" : "bg-blue-50 dark:bg-blue-900/30"
                }`}
              >
                <div className="flex flex-col w-full">
                  <Typography.Text strong className="text-xs">
                    {n.type}
                  </Typography.Text>
                  <Typography.Text className="text-sm line-clamp-2">
                    {n.message}
                  </Typography.Text>
                  {n.createdAt && (
                    <Typography.Text type="secondary" className="text-[10px] mt-0.5">
                      {new Date(n.createdAt).toLocaleString()}
                    </Typography.Text>
                  )}
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
      <div className="border-t p-2">
        <Button block size="small" onClick={() => (window.location.href = "/notifications")}>
          Xem tất cả
        </Button>
      </div>
    </div>
  );

  return (
    <nav className="sticky top-0 z-40 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 h-14">
        {/* Left: Logo & System Name */}
        <a href="/">
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
        </a>

        <div className="flex items-center gap-4">
          {/* Notification Bell */}          
          <Popover
            placement="bottomRight"
            trigger="click"
            open={open}
            onOpenChange={(v) => setOpen(v)}
            overlayClassName="notification-popover"
            content={notificationsContent}
          >
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
          </Popover>

          {/* User Dropdown */}
          <ProfileMenu userName={userName ?? "User"} onLogout={onLogout} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;