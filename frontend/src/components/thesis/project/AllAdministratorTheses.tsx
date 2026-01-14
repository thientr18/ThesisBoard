import React, { useEffect, useState, useMemo } from 'react';
import { useTheses, useThesisRegistrations, useThesisAssignments, useDefenseSessions } from '../../../api/endpoints/thesis.api';
import { useUserApi } from '../../../api/endpoints/user.api';
import { Card, List, Spin, Alert, Empty, Button, Tag, Tooltip, Typography, Modal, Select, message, Space, DatePicker, Input, Result } from 'antd';
import { FilePdfOutlined, UserOutlined, DownOutlined, RightOutlined, PlusOutlined, DeleteOutlined, CalendarOutlined, EditOutlined, ExclamationCircleOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface AllAdministratorThesesProps {
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
    case 'defense_scheduled':
      return 'warning';
    case 'defense_completed':
      return 'cyan';
    default:
      return 'default';
  }
};

// FilterBar Component
interface ThesisFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  supervisor: string;
  onSupervisorChange: (value: string) => void;
  assignmentStatus: string;
  onAssignmentStatusChange: (value: string) => void;
  scoreRange: string;
  onScoreRangeChange: (value: string) => void;
  supervisors: Array<{ id: number; name: string }>;
}

const ThesisFilterBar: React.FC<ThesisFilterBarProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  supervisor,
  onSupervisorChange,
  assignmentStatus,
  onAssignmentStatusChange,
  scoreRange,
  onScoreRangeChange,
  supervisors,
}) => {
  return (
    <Card className="mb-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search Input */}
        <Input
          placeholder="Search by student or title..."
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
          <Select.Option value="defense_scheduled">Defense Scheduled</Select.Option>
          <Select.Option value="defense_completed">Defense Completed</Select.Option>
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
          optionFilterProp="children"
          className="w-full"
        >
          <Select.Option value="">All Supervisors</Select.Option>
          {supervisors.map((sup) => (
            <Select.Option key={sup.id} value={String(sup.id)}>
              {sup.name}
            </Select.Option>
          ))}
        </Select>

        {/* Assignment Status Filter */}
        <Select
          placeholder="Filter by committee status"
          value={assignmentStatus || undefined}
          onChange={onAssignmentStatusChange}
          allowClear
          className="w-full"
        >
          <Select.Option value="">All Assignments</Select.Option>
          <Select.Option value="has_reviewer">Has Reviewer</Select.Option>
          <Select.Option value="no_reviewer">No Reviewer</Select.Option>
          <Select.Option value="has_committee">Has Committee</Select.Option>
          <Select.Option value="no_committee">No Committee</Select.Option>
          <Select.Option value="fully_assigned">Fully Assigned</Select.Option>
        </Select>

        {/* Score Range Filter */}
        <Select
          placeholder="Filter by final score"
          value={scoreRange || undefined}
          onChange={onScoreRangeChange}
          allowClear
          className="w-full"
        >
          <Select.Option value="">All Scores</Select.Option>
          <Select.Option value="90-100">Excellent (90-100)</Select.Option>
          <Select.Option value="80-89">Very Good (80-89)</Select.Option>
          <Select.Option value="70-79">Good (70-79)</Select.Option>
          <Select.Option value="60-69">Fair (60-69)</Select.Option>
          <Select.Option value="50-59">Pass (50-59)</Select.Option>
          <Select.Option value="0-49">Fail (&lt;50)</Select.Option>
          <Select.Option value="ungraded">Not Graded</Select.Option>
        </Select>
      </div>
    </Card>
  );
};

const AllAdministratorTheses: React.FC<AllAdministratorThesesProps> = ({ user, semester }) => {
  const { getAllTeachers } = useUserApi();
  const { getThesesBySemester, getReport: downloadThesisReport } = useTheses();
  const { schedule, reschedule, complete } = useDefenseSessions();
  const { assign, remove } = useThesisAssignments();
  
  const [theses, setTheses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [expandedThesisId, setExpandedThesisId] = useState<number | null>(null);

  // Modal state for assignment
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'reviewer' | 'committee'>('reviewer');
  const [selectedThesis, setSelectedThesis] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [teacherLoadError, setTeacherLoadError] = useState<string | null>(null);
  const [reviewerId, setReviewerId] = useState<number | undefined>();
  const [committeeIds, setCommitteeIds] = useState<number[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Modal state for defense session
  const [defenseModalOpen, setDefenseModalOpen] = useState(false);
  const [defenseModalType, setDefenseModalType] = useState<'schedule' | 'reschedule'>('schedule');
  const [selectedDefenseThesis, setSelectedDefenseThesis] = useState<any>(null);
  const [defenseDate, setDefenseDate] = useState<dayjs.Dayjs | null>(null);
  const [defenseRoom, setDefenseRoom] = useState<string>('');
  const [defenseNotes, setDefenseNotes] = useState<string>('');
  const [scheduling, setScheduling] = useState(false);
  const [defenseError, setDefenseError] = useState<string | null>(null);

  const [modal, contextHolder] = Modal.useModal();

  // Filter state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [supervisorFilter, setSupervisorFilter] = useState('');
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState('');
  const [scoreRangeFilter, setScoreRangeFilter] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Fetch theses
  const fetchTheses = async () => {
    if (!semester) {
      setTheses([]);
      return;
    }
    setLoading(true);
    setError(null);
    setActionError(null);
    
    try {
      const { data, error } = await getThesesBySemester(semester.id);
      
      if (error) {
        setError(error);
        message.error(`Failed to load theses: ${error}`);
      } else {
        setTheses(data || []);
        if (!data || data.length === 0) {
          message.info('No thesis projects found for this semester');
        }
      }
    } catch (err) {
      const errorMsg = 'An unexpected error occurred while loading theses';
      setError(errorMsg);
      message.error(errorMsg);
      console.error('Fetch theses error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheses();
  }, [semester]);

  // Load all teachers when modal opens
  useEffect(() => {
    if (modalOpen) {
      setTeacherLoadError(null);
      getAllTeachers()
        .then(({ data, error }) => {
          if (error) {
            setTeacherLoadError(error);
            message.error(`Failed to load teachers: ${error}`);
          } else {
            setTeachers(data || []);
          }
        })
        .catch(err => {
          const errorMsg = 'An unexpected error occurred while loading teachers';
          setTeacherLoadError(errorMsg);
          message.error(errorMsg);
          console.error('Load teachers error:', err);
        });
    }
  }, [modalOpen, getAllTeachers]);

  // Helper: get reviewer assignment (only one allowed)
  const getReviewer = (thesis: any) =>
    (thesis.committeeAssignments || []).find((a: any) => a.role === 'reviewer');

  // Helper: get committee members (can be multiple)
  const getCommitteeMembers = (thesis: any) =>
    (thesis.committeeAssignments || []).filter((a: any) => a.role === 'committee_member');

  // Helper: Check if can assign committee members
  const canAssignCommittee = (thesis: any) => {
    return thesis.committeeEligibility?.canAssign === true;
  };

  // Helper: Check if can schedule defense
  const canScheduleDefense = (thesis: any) => {
    return thesis.defenseEligibility?.eligible === true;
  };

  // Helper: Get committee eligibility message
  const getCommitteeEligibilityMessage = (thesis: any) => {
    if (!thesis.committeeEligibility) {
      return 'Checking eligibility...';
    }
    if (thesis.committeeEligibility.canAssign) {
      return `Pre-defense score: ${thesis.committeeEligibility.preDefenseScore?.toFixed(2)}. Ready to assign committee members.`;
    }
    return thesis.committeeEligibility.reason || 'Cannot assign committee members';
  };

  // Helper: Get defense eligibility message
  const getDefenseEligibilityMessage = (thesis: any) => {
    if (!thesis.defenseEligibility) {
      return 'Checking eligibility...';
    }
    if (thesis.defenseEligibility.eligible) {
      return `Pre-defense score: ${thesis.defenseEligibility.preDefenseScore?.toFixed(2)}. Ready to schedule defense.`;
    }
    return thesis.defenseEligibility.reason || 'Cannot schedule defense';
  };

  // Check if defense can be rescheduled
  const canRescheduleDefense = (thesis: any) => {
    return thesis.defenseSession?.status === 'scheduled';
  };

  // Check if defense can be completed
  const canCompleteDefense = (thesis: any) => {
    return thesis.defenseSession?.status === 'scheduled';
  };

  // Open modal for adding reviewer or committee
  const openAssignModal = (thesis: any, type: 'reviewer' | 'committee') => {
    setSelectedThesis(thesis);
    setModalType(type);
    setReviewerId(undefined);
    setCommitteeIds([]);
    setAssignError(null);
    setModalOpen(true);
  };

  // Open modal for defense session
  const openDefenseModal = (thesis: any, type: 'schedule' | 'reschedule') => {
    setSelectedDefenseThesis(thesis);
    setDefenseModalType(type);
    setDefenseError(null);
    
    if (type === 'reschedule' && thesis.defenseSession) {
      setDefenseDate(dayjs(thesis.defenseSession.scheduledAt));
      setDefenseRoom(thesis.defenseSession.room || '');
      setDefenseNotes(thesis.defenseSession.notes || '');
    } else {
      setDefenseDate(null);
      setDefenseRoom('');
      setDefenseNotes('');
    }
    
    setDefenseModalOpen(true);
  };

  // Assign reviewer
  const handleAssignReviewer = async () => {
    if (!selectedThesis || !reviewerId) {
      const warningMsg = 'Please select a reviewer';
      setAssignError(warningMsg);
      message.warning(warningMsg);
      return;
    }
    
    setAssigning(true);
    setAssignError(null);
    
    try {
      const { error } = await assign(selectedThesis.thesis.id, reviewerId, 'reviewer');
      
      if (error) {
        setAssignError(error);
        message.error(`Failed to assign reviewer: ${error}`);
      } else {
        message.success('Reviewer assigned successfully!');
        await reloadTheses();
        setModalOpen(false);
      }
    } catch (err) {
      const errorMsg = 'An unexpected error occurred while assigning reviewer';
      setAssignError(errorMsg);
      message.error(errorMsg);
      console.error('Assign reviewer error:', err);
    } finally {
      setAssigning(false);
    }
  };

  // Assign committee members
  const handleAssignCommittee = async () => {
    if (!selectedThesis || committeeIds.length === 0) {
      const warningMsg = 'Please select at least one committee member';
      setAssignError(warningMsg);
      message.warning(warningMsg);
      return;
    }
    
    setAssigning(true);
    setAssignError(null);
    
    try {
      let hasError = false;
      let errorMessage = '';
      
      for (const teacherId of committeeIds) {
        const { error } = await assign(selectedThesis.thesis.id, teacherId, 'committee_member');
        if (error) {
          errorMessage = error;
          setAssignError(error);
          message.error(`Failed to assign committee member: ${error}`);
          hasError = true;
          break;
        }
      }
      
      if (!hasError) {
        message.success('Committee members assigned successfully!');
        await reloadTheses();
        setModalOpen(false);
      }
    } catch (err) {
      const errorMsg = 'An unexpected error occurred while assigning committee members';
      setAssignError(errorMsg);
      message.error(errorMsg);
      console.error('Assign committee error:', err);
    } finally {
      setAssigning(false);
    }
  };

  // Remove assignment
  const handleRemoveAssignment = (thesisId: number, teacherId: number, role: string) => {
    modal.confirm({
      title: 'Remove Assignment',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to remove this assignment? This action cannot be undone.',
      okText: 'Yes, Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const { error } = await remove(thesisId, teacherId, role);
          
          if (error) {
            setActionError(error);
            message.error(`Failed to remove assignment: ${error}`);
            return Promise.reject(error);
          } else {
            message.success('Assignment removed successfully!');
            setActionError(null);
            return reloadTheses();
          }
        } catch (err) {
          const errorMsg = 'An unexpected error occurred while removing assignment';
          setActionError(errorMsg);
          message.error(errorMsg);
          console.error('Remove assignment error:', err);
          return Promise.reject(err);
        }
      }
    });
  };

  // Schedule defense session
  const handleScheduleDefense = async () => {
    if (!selectedDefenseThesis || !defenseDate || !defenseRoom) {
      const warningMsg = 'Please fill in all required fields (Date & Room)';
      setDefenseError(warningMsg);
      message.warning(warningMsg);
      return;
    }

    setScheduling(true);
    setDefenseError(null);
    
    try {
      const { error } = await schedule(
        selectedDefenseThesis.thesis.id,
        defenseDate.toISOString(),
        defenseRoom,
        defenseNotes || undefined
      );

      if (error) {
        setDefenseError(error);
        message.error(`Failed to schedule defense: ${error}`);
      } else {
        message.success('Defense session scheduled successfully!');
        await reloadTheses();
        setDefenseModalOpen(false);
      }
    } catch (err) {
      const errorMsg = 'An unexpected error occurred while scheduling defense';
      setDefenseError(errorMsg);
      message.error(errorMsg);
      console.error('Schedule defense error:', err);
    } finally {
      setScheduling(false);
    }
  };

  // Reschedule defense session
  const handleRescheduleDefense = async () => {
    if (!selectedDefenseThesis?.defenseSession || !defenseDate || !defenseRoom) {
      const warningMsg = 'Please fill in all required fields (Date & Room)';
      setDefenseError(warningMsg);
      message.warning(warningMsg);
      return;
    }

    setScheduling(true);
    setDefenseError(null);
    
    try {
      const { error } = await reschedule(
        selectedDefenseThesis.defenseSession.id,
        defenseDate.toISOString(),
        defenseRoom,
        defenseNotes || undefined
      );

      if (error) {
        setDefenseError(error);
        message.error(`Failed to reschedule defense: ${error}`);
      } else {
        message.success('Defense session rescheduled successfully!');
        await reloadTheses();
        setDefenseModalOpen(false);
      }
    } catch (err) {
      const errorMsg = 'An unexpected error occurred while rescheduling defense';
      setDefenseError(errorMsg);
      message.error(errorMsg);
      console.error('Reschedule defense error:', err);
    } finally {
      setScheduling(false);
    }
  };

  // Complete defense session
  const handleCompleteDefense = (thesis: any) => {
    if (!thesis.defenseSession) {
      message.warning('No defense session found');
      return;
    }

    modal.confirm({
      title: 'Complete Defense Session',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to mark this defense session as completed? This will update the thesis status.',
      okText: 'Yes, Complete',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          const { error } = await complete(thesis.defenseSession.id, defenseNotes);
          
          if (error) {
            setActionError(error);
            message.error(`Failed to complete defense: ${error}`);
            return Promise.reject(error);
          } else {
            message.success('Defense session completed successfully!');
            setActionError(null);
            return reloadTheses();
          }
        } catch (err) {
          const errorMsg = 'An unexpected error occurred while completing defense';
          setActionError(errorMsg);
          message.error(errorMsg);
          console.error('Complete defense error:', err);
          return Promise.reject(err);
        }
      }
    });
  };

  // Reload theses
  const reloadTheses = async () => {
    try {
      const { data, error } = await getThesesBySemester(semester.id);
      
      if (error) {
        setActionError(error);
        message.error(`Failed to reload theses: ${error}`);
      } else {
        setTheses(data || []);
        setActionError(null);
      }
    } catch (err) {
      const errorMsg = 'An unexpected error occurred while reloading theses';
      setActionError(errorMsg);
      message.error(errorMsg);
      console.error('Reload theses error:', err);
    }
  };

  // Filter teachers for reviewer
  const getReviewerOptions = (thesis: any) => {
    const supervisorId = thesis.supervisor?.id;
    const reviewer = getReviewer(thesis);
    return teachers.filter(
      t => t.id !== supervisorId && (!reviewer || t.id !== reviewer.teacherId)
    );
  };

  // Filter teachers for committee
  const getCommitteeOptions = (thesis: any) => {
    const assignedIds = getCommitteeMembers(thesis).map((a: any) => a.teacherId);
    return teachers.filter(t => !assignedIds.includes(t.id));
  };

  // Format defense session status
  const getDefenseStatusText = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'Scheduled';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  // Export PDF Report
  const handleExportPDF = async (thesisId: number) => {
    try {
      message.loading({ content: 'Generating PDF report...', key: 'pdf-download' });
      
      const { data, error } = await downloadThesisReport(thesisId);
      
      if (error) {
        message.error({ content: `Failed to download report: ${error}`, key: 'pdf-download', duration: 5 });
        setActionError(error);
        return;
      }
      
      if (!data) {
        const errorMsg = 'Failed to download report - No data received';
        message.error({ content: errorMsg, key: 'pdf-download', duration: 5 });
        setActionError(errorMsg);
        return;
      }
      
      // Create a blob URL and trigger download
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `thesis-report-${thesisId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success({ content: 'PDF report downloaded successfully!', key: 'pdf-download' });
      setActionError(null);
    } catch (err) {
      const errorMsg = 'An unexpected error occurred while downloading the report';
      message.error({ content: errorMsg, key: 'pdf-download', duration: 5 });
      setActionError(errorMsg);
      console.error('Export PDF error:', err);
    }
  };
  
  // Extract unique supervisors for filter
  const supervisors = useMemo(() => {
    const uniqueSupervisors = new Map<number, string>();
    theses.forEach((thesis) => {
      const id = thesis.supervisor?.id;
      const name = thesis.supervisor?.user?.fullName;
      if (id && name && !uniqueSupervisors.has(id)) {
        uniqueSupervisors.set(id, name);
      }
    });
    return Array.from(uniqueSupervisors.entries()).map(([id, name]) => ({ id, name }));
  }, [theses]);

  // Filter logic
  const filteredTheses = useMemo(() => {
    let filtered = [...theses];

    // Search filter
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (thesis) =>
          thesis.student?.user?.fullName?.toLowerCase().includes(keyword) ||
          thesis.thesis?.title?.toLowerCase().includes(keyword)
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((thesis) => thesis.thesis?.status === statusFilter);
    }

    // Supervisor filter
    if (supervisorFilter) {
      filtered = filtered.filter((thesis) => String(thesis.supervisor?.id) === supervisorFilter);
    }

    // Assignment status filter
    if (assignmentStatusFilter) {
      filtered = filtered.filter((thesis) => {
        const reviewer = thesis.committeeAssignments?.find((a: any) => a.role === 'reviewer');
        const committeeMembers = thesis.committeeAssignments?.filter((a: any) => a.role === 'committee_member') || [];
        
        switch (assignmentStatusFilter) {
          case 'has_reviewer':
            return reviewer !== undefined;
          case 'no_reviewer':
            return reviewer === undefined;
          case 'has_committee':
            return committeeMembers.length > 0;
          case 'no_committee':
            return committeeMembers.length === 0;
          case 'fully_assigned':
            return reviewer !== undefined && committeeMembers.length > 0;
          default:
            return true;
        }
      });
    }

    // Score range filter
    if (scoreRangeFilter) {
      filtered = filtered.filter((thesis) => {
        const finalScore = thesis.finalGrade?.finalScore;
        
        if (scoreRangeFilter === 'ungraded') {
          return finalScore === null || finalScore === undefined;
        }
        
        if (finalScore === null || finalScore === undefined) {
          return false;
        }
        
        const [min, max] = scoreRangeFilter.split('-').map(Number);
        return finalScore >= min && finalScore <= max;
      });
    }

    return filtered;
  }, [theses, searchKeyword, statusFilter, supervisorFilter, assignmentStatusFilter, scoreRangeFilter]);

  // Pagination logic
  const totalItems = filteredTheses.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentTheses = filteredTheses.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, statusFilter, supervisorFilter, assignmentStatusFilter, scoreRangeFilter]);

  // Render loading state
  if (!semester) {
    return (
      <div className="flex justify-center items-center h-64">
        <Result
          status="info"
          title="No Semester Selected"
          subTitle="Please select a semester to view thesis projects."
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" tip="Loading thesis projects..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-4">
        <Result
          status="error"
          title="Failed to Load Theses"
          subTitle={error}
          extra={[
            <Button type="primary" key="retry" icon={<ReloadOutlined />} onClick={fetchTheses}>
              Retry
            </Button>
          ]}
        />
      </div>
    );
  }

  if (theses.length === 0) {
    return (
      <div className="my-8">
        <Result
          icon={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />}
          title="No Thesis Projects Found"
          subTitle={`No thesis projects found for ${semester.name}.`}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 w-full">
      {contextHolder}
      
      <Title level={3} className="mb-4! text-[#2f398f]!">
        Thesis Projects for <span className="font-bold">{semester.name}</span>
      </Title>

      {/* Filter Bar */}
      <ThesisFilterBar
        search={searchKeyword}
        onSearchChange={setSearchKeyword}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        supervisor={supervisorFilter}
        onSupervisorChange={setSupervisorFilter}
        assignmentStatus={assignmentStatusFilter}
        onAssignmentStatusChange={setAssignmentStatusFilter}
        scoreRange={scoreRangeFilter}
        onScoreRangeChange={setScoreRangeFilter}
        supervisors={supervisors}
      />

      {/* Results Summary */}
      <div className="mb-4 flex items-center justify-between">
        <Text className="text-gray-600 text-sm">
          Showing {Math.min(startIndex + 1, totalItems)}-{Math.min(endIndex, totalItems)} of {totalItems} theses
        </Text>
      </div>

      {/* Display action errors */}
      {actionError && (
        <Alert
          message="Action Failed"
          description={actionError}
          type="error"
          showIcon
          closable
          onClose={() => setActionError(null)}
          className="mb-4"
        />
      )}

      {/* Display action errors */}
      {actionError && (
        <Alert
          message="Action Failed"
          description={actionError}
          type="error"
          showIcon
          closable
          onClose={() => setActionError(null)}
          className="mb-4"
        />
      )}

      {/* Theses List */}
      {currentTheses.length === 0 ? (
        <div className="my-8">
          <Empty description="No thesis projects found matching your filters." />
        </div>
      ) : (
        <>
          <List
            grid={{ gutter: 24, xs: 1, sm: 1, md: 1, lg: 1, xl: 1, xxl: 1 }}
            dataSource={theses}
            renderItem={pt => {
              const isExpanded = expandedThesisId === pt.thesis.id;
              const reviewer = getReviewer(pt);
              const committeeMembers = getCommitteeMembers(pt);

              return (
                <List.Item className="w-full">
                  <Card
                    className="w-full hover:shadow-lg transition-shadow duration-200 border border-gray-100 flex flex-col"
                    bodyStyle={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}
                    title={
                      <div
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
                        onClick={() => setExpandedThesisId(isExpanded ? null : pt.thesis.id)}
                      >
                        {isExpanded ? <DownOutlined /> : <RightOutlined />}
                        <Text strong className="text-lg text-[#2f398f] block">
                          {pt.thesis?.title || 'No Topic Title'}
                        </Text>
                        <Tag color={statusColor(pt.thesis?.status)} className="mt-2">
                          {pt.thesis?.status === 'in_progress'
                            ? 'In Progress'
                            : pt.thesis?.status === 'defense_scheduled'
                              ? 'Defense Scheduled'
                              : pt.thesis?.status === 'defense_completed'
                                ? 'Defense Completed'
                                : pt.thesis?.status
                                  ? pt.thesis.status.charAt(0).toUpperCase() + pt.thesis.status.slice(1)
                                  : 'Unknown'}
                        </Tag>
                        {pt.committeeEligibility?.preDefenseScore && (
                          <Tag color={pt.committeeEligibility.preDefenseScore >= 50 ? 'green' : 'red'}>
                            Pre-Defense: {pt.committeeEligibility.preDefenseScore.toFixed(2)}
                          </Tag>
                        )}
                      </div>
                    }
                    actions={[
                      (user && Array.isArray(user.roles)
                        ? user.roles.some((r: any) => r.name === 'admin' || r.name === 'moderator')
                        : user?.role === 'admin' || user?.role === 'moderator') && (
                        <Tooltip title="Export PDF Report" key="export">
                          <Button
                            type="primary"
                            icon={<FilePdfOutlined />}
                            size="middle"
                            onClick={() => handleExportPDF(pt.thesis.id)}
                          >
                            Export PDF
                          </Button>
                        </Tooltip>
                      )
                    ]}
                  >
                    <div className="flex flex-col gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <UserOutlined className="text-gray-500" />
                        <span className="text-xs text-gray-600 font-semibold">Student:</span>
                        <span className="text-base font-bold text-gray-900">{pt.student?.user.fullName || 'Unknown Student'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 font-semibold">Supervisor:</span>
                        <span className="text-base text-gray-900 font-medium">{pt.supervisor?.title ? `${pt.supervisor.title} ` : ''}{pt.supervisor?.user.fullName || 'N/A'} - {pt.supervisor?.teacherCode}</span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4">
                        <Title level={5}>Reviewer</Title>
                        {reviewer ? (
                          <div className="flex items-center justify-between mb-2 p-3 bg-gray-50 rounded">
                            <span>
                              {reviewer.teacher?.title ? `${reviewer.teacher.title} ` : ''}
                              {reviewer.teacher?.user?.fullName} - {reviewer.teacher?.teacherCode}
                            </span>
                            <Button
                              icon={<DeleteOutlined />}
                              size="small"
                              danger
                              onClick={() =>
                                handleRemoveAssignment(pt.thesis.id, reviewer.teacherId, 'reviewer')
                              }
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => openAssignModal(pt, 'reviewer')}
                            block
                          >
                            Add Reviewer
                          </Button>
                        )}

                        <Title level={5} className="mt-4">Committee Members</Title>
                        
                        {/* Committee Eligibility Alert */}
                        {!canAssignCommittee(pt) && (
                          <Alert
                            message="Committee Assignment Restricted"
                            description={getCommitteeEligibilityMessage(pt)}
                            type="warning"
                            showIcon
                            className="mb-2"
                          />
                        )}

                        {canAssignCommittee(pt) && pt.committeeEligibility?.preDefenseScore && (
                          <Alert
                            message="Committee Assignment Available"
                            description={getCommitteeEligibilityMessage(pt)}
                            type="success"
                            showIcon
                            className="mb-2"
                          />
                        )}

                        {committeeMembers.length > 0 ? (
                          <div className="space-y-2 mb-2">
                            {committeeMembers.map((cm: any) => (
                              <div className="flex items-center justify-between p-3 bg-gray-50 rounded" key={cm.teacherId}>
                                <span>
                                  {cm.teacher?.title ? `${cm.teacher.title} ` : ''}
                                  {cm.teacher?.user?.fullName} - {cm.teacher?.teacherCode}
                                </span>
                                <Button
                                  icon={<DeleteOutlined />}
                                  size="small"
                                  danger
                                  onClick={() =>
                                    handleRemoveAssignment(pt.thesis.id, cm.teacherId, 'committee_member')
                                  }
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          !canAssignCommittee(pt) ? null : (
                            <Alert
                              message="No committee members assigned"
                              type="info"
                              showIcon
                              className="mb-2"
                            />
                          )
                        )}
                        
                        <Button
                          type="dashed"
                          icon={<PlusOutlined />}
                          className="mt-2"
                          onClick={() => openAssignModal(pt, 'committee')}
                          disabled={!canAssignCommittee(pt)}
                          block
                        >
                          {canAssignCommittee(pt) ? 'Add Committee Members' : 'Committee Assignment Locked'}
                        </Button>

                        {/* Defense Session Section */}
                        <Title level={5} className="mt-4">Defense Session</Title>

                        {/* Defense Eligibility Alert */}
                        {!canScheduleDefense(pt) && !pt.defenseSession && (
                          <Alert
                            message="Defense Scheduling Restricted"
                            description={getDefenseEligibilityMessage(pt)}
                            type="warning"
                            showIcon
                            className="mb-2"
                          />
                        )}

                        {canScheduleDefense(pt) && !pt.defenseSession && (
                          <Alert
                            message="Ready for Defense Scheduling"
                            description={getDefenseEligibilityMessage(pt)}
                            type="success"
                            showIcon
                            className="mb-2"
                          />
                        )}

                        {pt.defenseSession ? (
                          <div className="border border-gray-200 rounded p-4 mb-2 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <Text strong>Status:</Text>
                              <Tag color={pt.defenseSession.status === 'scheduled' ? 'blue' : pt.defenseSession.status === 'completed' ? 'green' : 'red'}>
                                {getDefenseStatusText(pt.defenseSession.status)}
                              </Tag>
                            </div>
                            <div className="mb-2">
                              <Text strong>Date & Time:</Text>
                              <Text className="ml-2">{dayjs(pt.defenseSession.scheduledAt).format('MMMM D, YYYY [at] h:mm A')}</Text>
                            </div>
                            <div className="mb-2">
                              <Text strong>Room:</Text>
                              <Text className="ml-2">{pt.defenseSession.room || 'N/A'}</Text>
                            </div>
                            {pt.defenseSession.notes && (
                              <div className="mb-2">
                                <Text strong>Notes:</Text>
                                <Text className="ml-2">{pt.defenseSession.notes}</Text>
                              </div>
                            )}
                            <Space className="mt-2">
                              {canRescheduleDefense(pt) && (
                                <Button
                                  icon={<EditOutlined />}
                                  onClick={() => openDefenseModal(pt, 'reschedule')}
                                >
                                  Reschedule
                                </Button>
                              )}
                              {canCompleteDefense(pt) && (
                                <Button
                                  type="primary"
                                  onClick={() => handleCompleteDefense(pt)}
                                >
                                  Mark as Completed
                                </Button>
                              )}
                            </Space>
                          </div>
                        ) : canScheduleDefense(pt) ? (
                          <Button
                            type="dashed"
                            icon={<CalendarOutlined />}
                            onClick={() => openDefenseModal(pt, 'schedule')}
                            block
                          >
                            Schedule Defense Session
                          </Button>
                        ) : (
                          <Button
                            type="dashed"
                            icon={<CalendarOutlined />}
                            disabled
                            block
                          >
                            Defense Scheduling Locked
                          </Button>
                        )}
                      </div>
                    )}
                  </Card>
                </List.Item>
              );
            }}
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
      {/* Modal for assigning reviewer or committee */}
      <Modal
        open={modalOpen}
        title={modalType === 'reviewer' ? 'Assign Reviewer' : 'Assign Committee Members'}
        onCancel={() => {
          setModalOpen(false);
          setAssignError(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {teacherLoadError && (
            <Alert
              message="Failed to Load Teachers"
              description={teacherLoadError}
              type="error"
              showIcon
              closable
              onClose={() => setTeacherLoadError(null)}
            />
          )}

          {assignError && (
            <Alert
              message="Assignment Failed"
              description={assignError}
              type="error"
              showIcon
              closable
              onClose={() => setAssignError(null)}
            />
          )}

          {modalType === 'reviewer' && (
            <>
              <div>
                <Text strong>Select Reviewer *</Text>
                <Select
                  showSearch
                  style={{ width: '100%', marginTop: 8 }}
                  placeholder="Search and select a reviewer"
                  optionFilterProp="label"
                  value={reviewerId}
                  onChange={setReviewerId}
                  filterOption={(input, option) =>
                    (option?.label as string).toLowerCase().includes(input.toLowerCase())
                  }
                  disabled={teacherLoadError !== null}
                >
                  {getReviewerOptions(selectedThesis || {}).map(t => (
                    <Select.Option
                      key={t.id}
                      value={t.id}
                      label={`${t.title ? `${t.title} ` : ''}${t.fullName} - ${t.teacherCode}`}
                    >
                      {t.title ? `${t.title} ` : ''}{t.fullName} - {t.teacherCode}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <Button
                type="primary"
                loading={assigning}
                disabled={!reviewerId || teacherLoadError !== null}
                onClick={handleAssignReviewer}
                block
              >
                Assign Reviewer
              </Button>
            </>
          )}

          {modalType === 'committee' && (
            <>
              <div>
                <Text strong>Select Committee Members *</Text>
                <Select
                  mode="multiple"
                  showSearch
                  style={{ width: '100%', marginTop: 8 }}
                  placeholder="Search and select committee members"
                  optionFilterProp="label"
                  value={committeeIds}
                  onChange={setCommitteeIds}
                  filterOption={(input, option) =>
                    (option?.label as string).toLowerCase().includes(input.toLowerCase())
                  }
                  disabled={teacherLoadError !== null}
                >
                  {getCommitteeOptions(selectedThesis || {}).map(t => (
                    <Select.Option
                      key={t.id}
                      value={t.id}
                      label={`${t.title ? `${t.title} ` : ''}${t.fullName} - ${t.teacherCode}`}
                    >
                      {t.title ? `${t.title} ` : ''}{t.fullName} - {t.teacherCode}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <Button
                type="primary"
                loading={assigning}
                disabled={committeeIds.length === 0 || teacherLoadError !== null}
                onClick={handleAssignCommittee}
                block
              >
                Assign Committee Members
              </Button>
            </>
          )}
        </Space>
      </Modal>

      {/* Modal for defense session */}
      <Modal
        open={defenseModalOpen}
        title={defenseModalType === 'schedule' ? 'Schedule Defense Session' : 'Reschedule Defense Session'}
        onCancel={() => {
          setDefenseModalOpen(false);
          setDefenseError(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {defenseError && (
            <Alert
              message="Defense Session Error"
              description={defenseError}
              type="error"
              showIcon
              closable
              onClose={() => setDefenseError(null)}
            />
          )}

          <div>
            <Text strong>Date & Time *</Text>
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm"
              style={{ width: '100%', marginTop: 8 }}
              value={defenseDate}
              onChange={setDefenseDate}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </div>
          <div>
            <Text strong>Room *</Text>
            <Input
              placeholder="Enter room number or location"
              style={{ marginTop: 8 }}
              value={defenseRoom}
              onChange={(e) => setDefenseRoom(e.target.value)}
            />
          </div>
          <div>
            <Text strong>Notes (Optional)</Text>
            <Input.TextArea
              placeholder="Enter any additional notes"
              rows={4}
              style={{ marginTop: 8 }}
              value={defenseNotes}
              onChange={(e) => setDefenseNotes(e.target.value)}
            />
          </div>
          <Button
            type="primary"
            loading={scheduling}
            disabled={!defenseDate || !defenseRoom}
            onClick={defenseModalType === 'schedule' ? handleScheduleDefense : handleRescheduleDefense}
            block
          >
            {defenseModalType === 'schedule' ? 'Schedule Defense' : 'Reschedule Defense'}
          </Button>
        </Space>
      </Modal>
    </div>
  );
}

export default AllAdministratorTheses;