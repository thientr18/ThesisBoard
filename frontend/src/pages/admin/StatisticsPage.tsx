import React, { useEffect, useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Row, Col, Typography } from 'antd';
import { useUserApi } from '../../api/endpoints/user.api';
import type { UserWithRoles } from '../../types/user.types';
import Navbar from '../../components/common/navigation/Navbar';
import Sidebar from '../../components/common/navigation/Sidebar';
import { LayoutProvider, useLayoutContext, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../../contexts/LayoutContext';
import StudentTrendChart from '../../components/charts/StudentTrendChart';
import TeacherTrendChart from '../../components/charts/TeacherTrendChart';
import PreThesisOutcomeTrend from '../../components/charts/PreThesisOutcomeChart';
import ThesisOutcomeTrend from '../../components/charts/ThesisOutcomeChart';
import PreThesisGradeTrend from '../../components/charts/PreThesisGradeChart';
import ThesisGradeTrend from '../../components/charts/ThesisGradeChart';

const { Title } = Typography;

const StatisticsContent: React.FC<{
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
          <Navbar
            user={user}
            pageName='Statistics'
            onLogout={onLogout}
          />
          <div className="w-full flex justify-center py-20">
            <div className="animate-pulse text-muted-foreground text-sm">Loading statistics...</div>
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
          <Navbar
            user={user}
            pageName='Statistics'
            onLogout={onLogout}
          />
        </div>
      </>
    );
  }

  if (!user) {
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
          <Navbar
            user={user}
            pageName='Statistics'
            onLogout={onLogout}
          />
          <div className="w-full flex flex-col items-center gap-4 py-20">
            <div className="text-muted-foreground text-sm">
              You are not authenticated or no user data returned.
            </div>
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
        <Navbar
          user={user}
          pageName='Statistics'
          onLogout={onLogout}
        />
        <div style={{ padding: '24px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
          <Title level={2} style={{ marginBottom: '24px' }}>
            Statistical Overview
          </Title>

          {/* Row 1: Population Trends */}
          <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
            <Col xs={24} lg={12}>
              <StudentTrendChart />
            </Col>
            <Col xs={24} lg={12}>
              <TeacherTrendChart />
            </Col>
          </Row>

          {/* Row 2: Outcomes */}
          <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
            <Col xs={24} lg={12}>
              <PreThesisOutcomeTrend />
            </Col>
            <Col xs={24} lg={12}>
              <ThesisOutcomeTrend />
            </Col>
          </Row>

          {/* Row 3: Grades */}
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <PreThesisGradeTrend />
            </Col>
            <Col xs={24} lg={12}>
              <ThesisGradeTrend />
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
};

const StatisticsPage: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, getAccessTokenSilently, logout } = useAuth0();
  const { getMe } = useUserApi();

  const [user, setUser] = useState<UserWithRoles | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadStatistics = useCallback(async () => {
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
      setError(e?.message ?? 'Failed to load profile');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, getAccessTokenSilently, getMe]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  return (
    <LayoutProvider>
      <div className="min-h-screen bg-gray-50 flex">
        <StatisticsContent
          user={user}
          loading={loading}
          error={error}
          onLogout={() => logout({ logoutParams: { returnTo: window.location.origin } })}
        />
      </div>
    </LayoutProvider>
  );
};

export default StatisticsPage;