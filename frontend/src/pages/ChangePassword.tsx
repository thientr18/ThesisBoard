import React, { useState, useEffect, useCallback } from "react";
import { Form, Input, Button, Alert } from "antd";
import { LockOutlined } from "@ant-design/icons";
import Navbar from "../components/common/navigation/Navbar";
import Sidebar from "../components/common/navigation/Sidebar";
import { useUserApi } from "../api/endpoints/user.api";
import { useLayoutContext, LayoutProvider, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../contexts/LayoutContext";
import { useAuth0 } from "@auth0/auth0-react";
import type { UserWithRoles } from "../types/user.types";

const ChangePasswordForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { changeOwnPassword } = useUserApi();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    const { currentPassword, newPassword, confirmPassword } = values;
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      setLoading(false);
      return;
    }
    const res = await changeOwnPassword(currentPassword, newPassword);
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      form.resetFields();
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-primary text-center">Change Password</h2>
      {error && <Alert type="error" message={error} showIcon className="mb-4" />}
      {success && <Alert type="success" message="Password changed successfully!" showIcon className="mb-4" />}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          name="currentPassword"
          label="Current Password"
          rules={[{ required: true, message: "Please enter your current password." }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Current Password" autoComplete="current-password" />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            { required: true, message: "Please enter your new password." },
            { min: 6, message: "Password must be at least 6 characters." }
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="New Password" autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Please confirm your new password." },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match."));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Confirm New Password" autoComplete="new-password" />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            size="large"
          >
            Change Password
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

const ChangePasswordContent: React.FC<{
  user: UserWithRoles | null;
  loading: boolean;
  error: string | null;
  onLogout: () => void;
}> = ({ user, loading, error, onLogout }) => {
  const { collapsed } = useLayoutContext();
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  if (loading) {
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
          <Navbar user={user} pageName="Change Password" onLogout={onLogout} />
          <div className="w-full flex justify-center py-20">
            <div className="animate-pulse text-muted-foreground text-sm">Loading...</div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
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
          <Navbar user={user} pageName="Change Password" onLogout={onLogout} />
          <div className="w-full flex flex-col items-center gap-4 py-20">
            <div className="text-red-600 text-sm">Error: {error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

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
        <Navbar user={user} pageName="Change Password" onLogout={onLogout} />
        <main className="px-6 py-8 max-w-7xl mx-auto flex-1">
          <ChangePasswordForm onSuccess={() => {}} />
        </main>
      </div>
    </>
  );
};

const ChangePassword: React.FC = () => {
  const { logout, isAuthenticated, isLoading: authLoading, getAccessTokenSilently } = useAuth0();
  const { getMe } = useUserApi();

  const [user, setUser] = useState<UserWithRoles | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadUser = useCallback(async () => {
    if (authLoading) {
      setLoading(true);
      return;
    }
    if (!isAuthenticated) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      await getAccessTokenSilently();
      const { data, error } = await getMe();
      if (error) {
        setError(error);
        setUser(null);
      } else {
        setUser(data as UserWithRoles ?? null);
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to load user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, getAccessTokenSilently, getMe]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <LayoutProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <ChangePasswordContent
          user={user}
          loading={loading}
          error={error}
          onLogout={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        />
      </div>
    </LayoutProvider>
  );
};

export default ChangePassword;