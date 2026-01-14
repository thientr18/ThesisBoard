import React, { useEffect, useState, useMemo } from 'react';
import { usePreThesisApi } from '../../../api/endpoints/pre-thesis.api';
import { Card, List, Spin, Alert, Empty, Button, Tag, Tooltip, Typography, Space, Input, Select } from 'antd';
import { FilePdfOutlined, UserOutlined, CalendarOutlined, SearchOutlined } from '@ant-design/icons';
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

// FilterBar Component
interface PreThesisFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  supervisor: string;
  onSupervisorChange: (value: string) => void;
  gradeRange: string;
  onGradeRangeChange: (value: string) => void;
  supervisors: Array<{ id: number; name: string }>;
}

const PreThesisFilterBar: React.FC<PreThesisFilterBarProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  supervisor,
  onSupervisorChange,
  gradeRange,
  onGradeRangeChange,
  supervisors,
}) => {
  return (
    <Card className="mb-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search Input */}
        <Input
          placeholder="Search by student or topic..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          allowClear
          className="w-full"
        />

        {/* Status Filter */}
        <Select
          placeholder="Filter by status"
          value={status || undefined}
          onChange={onStatusChange}
          allowClear
          className="w-full"
        >
          <Select.Option value="">All Statuses</Select.Option>
          <Select.Option value="in_progress">In Progress</Select.Option>
          <Select.Option value="completed">Completed</Select.Option>
          <Select.Option value="cancelled">Cancelled</Select.Option>
        </Select>

        {/* Supervisor Filter */}
        <Select
          placeholder="Filter by supervisor"
          value={supervisor || undefined}
          onChange={onSupervisorChange}
          allowClear
          showSearch
          filterOption={(input, option) => {
            const label = option?.label || option?.children;
            if (typeof label === 'string') {
              return label.toLowerCase().includes(input.toLowerCase());
            }
            return false;
          }}
          className="w-full"
        >
          <Select.Option value="">All Supervisors</Select.Option>
          {supervisors.map((sup) => (
            <Select.Option key={sup.id} value={String(sup.id)}>
              {sup.name}
            </Select.Option>
          ))}
        </Select>

        {/* Grade Range Filter */}
        <Select
          placeholder="Filter by grade"
          value={gradeRange || undefined}
          onChange={onGradeRangeChange}
          allowClear
          className="w-full"
        >
          <Select.Option value="">All Grades</Select.Option>
          <Select.Option value="9-10">Excellent (9-10)</Select.Option>
          <Select.Option value="7-8.99">Good (7-8.99)</Select.Option>
          <Select.Option value="5-6.99">Average (5-6.99)</Select.Option>
          <Select.Option value="0-4.99">Fail (&lt;5)</Select.Option>
          <Select.Option value="ungraded">Not Graded</Select.Option>
        </Select>
      </div>
    </Card>
  );
};

const AllAdministratorPreTheses: React.FC<AllAdministratorPreThesesProps> = ({ user, semester }) => {
  const { getPreThesesForAdministratorBySemester, downloadPreThesisReport } = usePreThesisApi();
  
  // Data state
  const [preTheses, setPreTheses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [supervisorFilter, setSupervisorFilter] = useState('');
  const [gradeRangeFilter, setGradeRangeFilter] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Fetch pre-theses
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
      setLoading(false);
    };
    fetchPreTheses();
  }, [semester, getPreThesesForAdministratorBySemester]);

  // Extract unique supervisors for filter
  const supervisors = useMemo(() => {
    const uniqueSupervisors = new Map<number, string>();
    preTheses.forEach((pt) => {
      const id = pt.supervisorTeacher?.id;
      const name = pt.supervisorTeacher?.user?.fullName;
      if (id && name && !uniqueSupervisors.has(id)) {
        uniqueSupervisors.set(id, name);
      }
    });
    return Array.from(uniqueSupervisors.entries()).map(([id, name]) => ({ id, name }));
  }, [preTheses]);

  // Filter logic
  const filteredPreTheses = useMemo(() => {
    let filtered = [...preTheses];

    // Search filter
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (pt) =>
          pt.student?.user?.fullName?.toLowerCase().includes(keyword) ||
          pt.topicApplication?.topic?.title?.toLowerCase().includes(keyword) ||
          pt.topicApplication?.proposalTitle?.toLowerCase().includes(keyword)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((pt) => pt.status === statusFilter);
    }

    // Supervisor filter
    if (supervisorFilter) {
      filtered = filtered.filter((pt) => String(pt.supervisorTeacher?.id) === supervisorFilter);
    }

    // Grade range filter
    if (gradeRangeFilter) {
      if (gradeRangeFilter === 'ungraded') {
        filtered = filtered.filter((pt) => pt.finalScore === null || pt.finalScore === undefined);
      } else {
        const [min, max] = gradeRangeFilter.split('-').map(Number);
        filtered = filtered.filter((pt) => {
          const score = pt.finalScore;
          return score !== null && score !== undefined && score >= min && score <= max;
        });
      }
    }

    return filtered;
  }, [preTheses, searchKeyword, statusFilter, supervisorFilter, gradeRangeFilter]);

  // Pagination logic
  const totalItems = filteredPreTheses.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentPreTheses = filteredPreTheses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, statusFilter, supervisorFilter, gradeRangeFilter]);

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

  return (
    <div className="bg-white rounded-lg shadow p-6 w-full">
      <Title level={3} className="mb-6! text-[#2f398f]!">
        Pre-Thesis Projects for <span className="font-bold">{semester.name}</span>
      </Title>

      {/* Filter Bar */}
      <PreThesisFilterBar
        search={searchKeyword}
        onSearchChange={setSearchKeyword}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        supervisor={supervisorFilter}
        onSupervisorChange={setSupervisorFilter}
        gradeRange={gradeRangeFilter}
        onGradeRangeChange={setGradeRangeFilter}
        supervisors={supervisors}
      />

      {/* Results Summary */}
      <div className="mb-4 flex items-center justify-between">
        <Text className="text-gray-600 text-sm">
          Showing {Math.min(startIndex + 1, totalItems)}-{Math.min(endIndex, totalItems)} of {totalItems} pre-theses
        </Text>
      </div>

      {/* Pre-Theses List */}
      {currentPreTheses.length === 0 ? (
        <div className="my-8">
          <Empty description="No pre-thesis projects found matching your filters." />
        </div>
      ) : (
        <>
          <List
            grid={{ gutter: 24, xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }}
            dataSource={currentPreTheses}
            renderItem={(pt) => (
              <List.Item className="w-full">
                <Card
                  className="w-full hover:shadow-lg transition-shadow duration-200 border border-gray-100"
                  bodyStyle={{ padding: '1.5rem' }}
                  title={
                    <div>
                      <Text strong className="text-lg text-[#2f398f] block">
                        {pt.topicApplication?.topic?.title || pt.topicApplication?.proposalTitle || 'No Topic Title'}
                      </Text>
                      <Tag color={statusColor(pt.status)} className="mt-2">
                        {pt.status === 'in_progress'
                          ? 'In Progress'
                          : pt.status.charAt(0).toUpperCase() + pt.status.slice(1)}
                      </Tag>
                      {pt.finalScore !== null && pt.finalScore !== undefined && (
                        <Tag color={pt.finalScore >= 5 ? 'success' : 'error'} className="mt-2 ml-2">
                          Score: {pt.finalScore}
                        </Tag>
                      )}
                    </div>
                  }
                >
                  <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <UserOutlined className="text-gray-500" />
                      <span className="text-xs text-gray-600 font-semibold">Student:</span>
                      <span className="text-base font-bold text-gray-900">
                        {pt.student?.user?.fullName || 'Unknown Student'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600 font-semibold">Supervisor:</span>
                      <span className="text-base text-gray-900 font-medium">
                        {pt.supervisorTeacher?.user?.fullName || 'N/A'}
                      </span>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-[#189ad6] text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-2 py-2 text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllAdministratorPreTheses;