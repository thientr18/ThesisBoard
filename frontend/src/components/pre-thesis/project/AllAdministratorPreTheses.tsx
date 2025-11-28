import React, { useEffect, useState } from 'react';
import { usePreThesisApi } from '../../../api/endpoints/pre-thesis.api';
import { Card, List, Spin, Alert, Empty, Button, Tag, Tooltip, Typography, Space } from 'antd';
import { FilePdfOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { message } from 'antd';

const { Title, Text } = Typography;

interface AllAdministratorPreThesesProps {
  user: any;
  semester: any;
}

const statusColor = (status: string) => {
  switch (status) {
    case 'in_progress':
      return 'processing';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const AllAdministratorPreTheses: React.FC<AllAdministratorPreThesesProps> = ({ user, semester }) => {
  const { getPreThesesForAdministratorBySemester, downloadPreThesisReport } = usePreThesisApi();
  const [preTheses, setPreTheses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreTheses = async () => {
      if (!semester) {
        setPreTheses([]);
        return;
      }
      setLoading(true);
      setError(null);
      const { data, error } = await getPreThesesForAdministratorBySemester(semester.id);
      if (error) setError(error);
      setPreTheses(data || []);
      console.log('Fetched pre-theses:', data);
      setLoading(false);
    };
    fetchPreTheses();
  }, [semester, getPreThesesForAdministratorBySemester]);

  if (!semester)
    return (
      <div className="flex justify-center items-center h-64">
        <Text type="secondary">Please select a semester.</Text>
      </div>
    );
  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <Spin tip="Loading pre-thesis projects..." />
      </div>
    );
  if (error)
    return (
      <div className="my-4">
        <Alert message={error} type="error" showIcon />
      </div>
    );
  if (preTheses.length === 0)
    return (
      <div className="my-8">
        <Empty description="No pre-thesis projects found for this semester." />
      </div>
    );

  return (
    <div className="bg-white rounded-lg shadow p-6 w-full">
      <Title level={3} className="mb-8! text-[#2f398f]!">
        Pre-Thesis Projects for <span className="font-bold">{semester.name}</span>
      </Title>
      <List
        grid={{ gutter: 24, xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }}
        dataSource={preTheses}
        renderItem={pt => (
          <List.Item className="w-full">
            <Card
              className="w-full hover:shadow-lg transition-shadow duration-200 border border-gray-100 flex flex-col"
              bodyStyle={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}
              title={
                <div>
                  <Text strong className="text-lg text-[#2f398f] block">
                    {pt.topicApplication?.topic?.title || pt.title || 'No Topic Title'}
                  </Text>
                  <Tag color={statusColor(pt.status)} className="mt-2">
                    {pt.status === 'in_progress'
                      ? 'In Progress'
                      : pt.status.charAt(0).toUpperCase() + pt.status.slice(1)}
                  </Tag>
                </div>
              }
            >
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <UserOutlined className="text-gray-500" />
                  <span className="text-xs text-gray-600 font-semibold">Student:</span>
                  <span className="text-base font-bold text-gray-900">{pt.student?.user?.fullName || 'Unknown Student'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 font-semibold">Supervisor:</span>
                  <span className="text-base text-gray-900 font-medium">{pt.supervisorTeacher?.user?.fullName || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarOutlined className="text-gray-500" />
                  <span className="text-xs text-gray-600 font-semibold">Last updated:</span>
                  <span className="text-base text-gray-900 font-medium">
                    {pt.updatedAt ? new Date(pt.updatedAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="flex justify-end mt-auto">
                {(user && Array.isArray(user.roles)
                  ? user.roles.some((r: any) => r.name === 'admin' || r.name === 'moderator')
                  : user?.role === 'admin' || user?.role === 'moderator') && (
                  <Tooltip title="Export PDF Report">
                    <Button
                      type="primary"
                      icon={<FilePdfOutlined />}
                      size="middle"
                      onClick={async () => {
                        const { error } = await downloadPreThesisReport(pt.id, `pre-thesis-report-${pt.id}.pdf`);
                        if (error) message.error(error);
                        else message.success('Exported PDF successfully!');
                      }}
                    >
                      Export PDF
                    </Button>
                  </Tooltip>
                )}
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default AllAdministratorPreTheses;