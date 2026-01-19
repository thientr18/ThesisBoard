import React, { useState, useEffect } from 'react';
import { Modal, Button, Alert, DatePicker, Input, Select, Spin, Table, Tag, Space, Collapse, Tooltip, Typography } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, UserOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';

const { Panel } = Collapse;
const { TextArea } = Input;
const { Text } = Typography;

interface DefenseSchedulingModalProps {
  visible: boolean;
  onCancel: () => void;
  onSchedule: (data: {
    scheduledAt: string;
    room: string;
    duration: number;
    notes?: string;
  }) => Promise<void>;
  thesis: any;
  mode: 'schedule' | 'reschedule';
  existingSession?: any;
  getSuggestedSlots: (thesisId: number, startDate: string, endDate: string, duration: number) => Promise<{ data: any; error: string | null }>;
  getCommitteeAvailability: (semesterId: number, excludeThesisId?: number) => Promise<{ data: any; error: string | null }>;
}

const DefenseSchedulingModal: React.FC<DefenseSchedulingModalProps> = ({
  visible,
  onCancel,
  onSchedule,
  thesis,
  mode,
  existingSession,
  getSuggestedSlots,
  getCommitteeAvailability,
}) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [room, setRoom] = useState('');
  const [duration, setDuration] = useState(15);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [committeeAvailability, setCommitteeAvailability] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchRange, setSearchRange] = useState<[Dayjs, Dayjs]>([
    dayjs().add(1, 'day'),
    dayjs().add(14, 'day')
  ]);

  // Load initial data
  useEffect(() => {
    if (visible && thesis) {
      if (mode === 'reschedule' && existingSession) {
        setSelectedDate(dayjs(existingSession.scheduledAt));
        setRoom(existingSession.room || '');
        setDuration(existingSession.duration || 15);
        setNotes(existingSession.notes || '');
      } else {
        setSelectedDate(null);
        setRoom('');
        setDuration(15);
        setNotes('');
      }
      loadCommitteeAvailability();
    }
  }, [visible, thesis, mode, existingSession]);

  const loadCommitteeAvailability = async () => {
    if (!thesis) return;
    
    try {
      const { data, error } = await getCommitteeAvailability(
        thesis.thesis.semesterId,
        mode === 'reschedule' ? thesis.thesis.id : undefined
      );
      
      if (error) {
        setError(error);
      } else {
        setCommitteeAvailability(data);
      }
    } catch (err) {
      setError('Failed to load committee availability');
    }
  };

  const loadSuggestions = async () => {
    if (!thesis || !searchRange) return;

    setSuggestionsLoading(true);
    setError(null);

    try {
      const { data, error } = await getSuggestedSlots(
        thesis.thesis.id,
        searchRange[0].toISOString(),
        searchRange[1].toISOString(),
        duration
      );

      if (error) {
        setError(error);
        setSuggestions([]);
      } else {
        setSuggestions(data || []);
      }
    } catch (err) {
      setError('Failed to load suggested time slots');
      setSuggestions([]);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleSchedule = async () => {
    if (!selectedDate || !room) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSchedule({
        scheduledAt: selectedDate.toISOString(),
        room,
        duration,
        notes: notes || undefined,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to schedule defense');
    } finally {
      setLoading(false);
    }
  };

  const selectSuggestion = (suggestion: any) => {
    const startTime = dayjs(suggestion.startTime);
    setSelectedDate(startTime);
  };

  const getTeacherName = (teacherId: number) => {
    const teacher = committeeAvailability?.teachers?.find((t: any) => t.id === teacherId);
    return teacher ? `${teacher.title} ${teacher.name}`.trim() : 'Unknown';
  };

  const suggestionColumns = [
    {
      title: 'Date & Time',
      key: 'datetime',
      render: (_: any, record: any) => (
        <Space direction="vertical" size="small">
          <div>
            <CalendarOutlined className="mr-2" />
            {dayjs(record.startTime).format('dddd, MMMM D, YYYY')}
          </div>
          <div>
            <ClockCircleOutlined className="mr-2" />
            {dayjs(record.startTime).format('HH:mm')} - {dayjs(record.endTime).format('HH:mm')}
          </div>
        </Space>
      ),
    },
    {
      title: 'Duration',
      key: 'duration',
      render: (_: any, record: any) => {
        const minutes = dayjs(record.endTime).diff(dayjs(record.startTime), 'minute');
        return `${minutes} min`;
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (_: any, record: any) => (
        <Tag icon={<CheckCircleOutlined />} color="success">
          All Available
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: any) => (
        <Button
          type="primary"
          size="small"
          onClick={() => selectSuggestion(record)}
        >
          Select
        </Button>
      ),
    },
  ];

  const renderCommitteeSchedule = () => {
    if (!committeeAvailability) return null;

    const committeeTeachers = committeeAvailability.teachers?.filter((teacher: any) => {
      // Include supervisor
      if (teacher.id === thesis.supervisor?.id) return true;
      
      // Include assigned committee members
      return thesis.committeeAssignments?.some((a: any) => a.teacherId === teacher.id);
    });

    if (!committeeTeachers || committeeTeachers.length === 0) {
      return (
        <Alert
          message="No Committee Members"
          description="No committee members have been assigned yet."
          type="info"
          showIcon
          className="mt-4"
        />
      );
    }

    return (
      <Collapse className="mt-4" defaultActiveKey={['1']}>
        <Panel header="Committee Members' Schedule" key="1">
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {committeeTeachers.map((teacher: any) => {
              const isSupervisor = teacher.id === thesis.supervisor?.id;
              const role = isSupervisor 
                ? 'Supervisor' 
                : thesis.committeeAssignments?.find((a: any) => a.teacherId === teacher.id)?.role || 'Unknown';

              return (
                <div key={teacher.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="font-semibold mb-3 flex items-center gap-2">
                    <UserOutlined className="text-blue-600" />
                    <span>{teacher.title} {teacher.name} ({teacher.code})</span>
                    <Tag color={isSupervisor ? 'blue' : role === 'reviewer' ? 'orange' : 'purple'}>
                      {isSupervisor ? 'Supervisor' : role === 'reviewer' ? 'Reviewer' : 'Committee Member'}
                    </Tag>
                  </div>
                  
                  {teacher.busySlots.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600 font-medium flex items-center gap-1">
                        <WarningOutlined className="text-orange-500" />
                        Busy Slots:
                      </div>
                      {teacher.busySlots.map((slot: any, idx: number) => (
                        <div key={idx} className="bg-red-50 border border-red-200 p-3 rounded text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">
                              <CalendarOutlined className="mr-1" />
                              {dayjs(slot.scheduledAt).format('MMM D, YYYY')}
                            </span>
                            <Tag color="orange">{slot.role}</Tag>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <ClockCircleOutlined />
                            <span>
                              {dayjs(slot.scheduledAt).format('HH:mm')} - {dayjs(slot.endTime).format('HH:mm')}
                            </span>
                          </div>
                          <div className="mt-2 text-gray-700">
                            <div><strong>Room:</strong> {slot.room}</div>
                            <div className="truncate"><strong>Thesis:</strong> {slot.thesisTitle}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-green-600 text-sm flex items-center gap-1">
                      <CheckCircleOutlined />
                      No conflicts in the selected period
                    </div>
                  )}
                </div>
              );
            })}
          </Space>
        </Panel>
      </Collapse>
    );
  };

  const preDefenseScore = thesis?.committeeEligibility?.preDefenseScore || thesis?.defenseEligibility?.preDefenseScore;
  const isEligible = preDefenseScore !== undefined && preDefenseScore >= 50;

  return (
    <Modal
      open={visible}
      title={
        <div className="text-lg font-semibold">
          {mode === 'schedule' ? 'Schedule Defense Session' : 'Reschedule Defense Session'}
        </div>
      }
      onCancel={onCancel}
      width={900}
      footer={null}
      destroyOnClose
    >
      <div className="space-y-4">
        {error && (
          <Alert 
            message="Error" 
            description={error} 
            type="error" 
            showIcon 
            closable 
            onClose={() => setError(null)} 
          />
        )}

        {/* Pre-Defense Score Info */}
        {preDefenseScore !== undefined && (
          <Alert
            message={isEligible ? 'Eligible for Defense' : 'Not Eligible for Defense'}
            description={
              isEligible
                ? `Pre-Defense Average Score: ${preDefenseScore.toFixed(2)} (Supervisor + Reviewer average). The thesis has met the minimum requirement.`
                : `Pre-Defense Average Score: ${preDefenseScore.toFixed(2)} (Supervisor + Reviewer average). Minimum required score is 50. The thesis has failed.`
            }
            type={isEligible ? 'success' : 'error'}
            showIcon
            icon={isEligible ? <CheckCircleOutlined /> : <WarningOutlined />}
          />
        )}

        {/* Time Slot Suggestions */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="font-semibold mb-3 text-base">Find Available Time Slots</div>
          
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <label className="block text-sm font-medium mb-2">Search Period</label>
              <DatePicker.RangePicker
                value={searchRange}
                onChange={(dates: any) => setSearchRange(dates as [Dayjs, Dayjs])}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                className="w-full"
                format="YYYY-MM-DD"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Defense Duration</label>
              <Select
                value={duration}
                onChange={setDuration}
                className="w-full"
                defaultValue={15}
              >
                <Select.Option value={10}>10 minutes</Select.Option>
                <Select.Option value={15}>15 minutes (standard)</Select.Option>
                <Select.Option value={20}>20 minutes</Select.Option>
                <Select.Option value={30}>30 minutes</Select.Option>
                <Select.Option value={45}>45 minutes</Select.Option>
                <Select.Option value={60}>60 minutes</Select.Option>
              </Select>
            </div>

            <Button
              type="default"
              onClick={loadSuggestions}
              loading={suggestionsLoading}
              icon={<CalendarOutlined />}
              block
            >
              Find Available Time Slots
            </Button>

            {suggestionsLoading ? (
              <div className="text-center py-4">
                <Spin tip="Searching for available time slots..." />
              </div>
            ) : suggestions.length > 0 ? (
              <div>
                <Alert
                  message="Available Time Slots"
                  description={`Found ${suggestions.length} time slot(s) when all committee members are available.`}
                  type="success"
                  showIcon
                  className="mb-3"
                />
                <Table
                  dataSource={suggestions}
                  columns={suggestionColumns}
                  pagination={{ pageSize: 5, size: 'small' }}
                  size="small"
                  rowKey={(record) => record.startTime}
                />
              </div>
            ) : searchRange ? (
              <Alert
                message="No suggestions yet"
                description="Click 'Find Available Time Slots' to see when all committee members are available"
                type="info"
                showIcon
              />
            ) : null}
          </Space>
        </div>

        {/* Manual Date Selection */}
        <div className="border rounded-lg p-4">
          <div className="font-semibold mb-3 text-base">Manual Selection</div>
          
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <div>
              <label className="block text-sm font-medium mb-2">
                Date & Time <span className="text-red-500">*</span>
              </label>
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm"
                value={selectedDate}
                onChange={setSelectedDate}
                disabledDate={(current) => current && current < dayjs().startOf('day')}
                className="w-full"
                placeholder="Select defense date and time"
              />
              {selectedDate && (
                <Text type="secondary" className="text-xs mt-1 block">
                  Selected: {selectedDate.format('dddd, MMMM D, YYYY [at] h:mm A')}
                </Text>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Room <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter room number (e.g., A101, B205, Conference Room 3)"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
              <TextArea
                rows={3}
                placeholder="Add any special instructions or notes for the defense session"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                showCount
              />
            </div>
          </Space>
        </div>

        {/* Committee Schedule */}
        {renderCommitteeSchedule()}

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            onClick={handleSchedule}
            loading={loading}
            disabled={!selectedDate || !room}
            icon={<CalendarOutlined />}
          >
            {mode === 'schedule' ? 'Schedule Defense' : 'Reschedule Defense'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DefenseSchedulingModal;