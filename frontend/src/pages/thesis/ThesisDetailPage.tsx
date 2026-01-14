import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { LayoutProvider, useLayoutContext, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../../contexts/LayoutContext";
import { useUserApi } from '../../api/endpoints/user.api';
import { useTheses } from '../../api/endpoints/thesis.api';
import { useAttachmentApi } from '../../api/endpoints/attachment.api';
import Sidebar from '../../components/common/navigation/Sidebar';
import Navbar from '../../components/common/navigation/Navbar';
import { 
  Upload, Button, List, message, Card, Descriptions, Divider, 
  Tooltip, Popconfirm, InputNumber, Form, Input, Spin, Alert, 
  Empty, Tag, Tabs, Table 
} from 'antd';
import { 
  UploadOutlined, DeleteOutlined, DownloadOutlined, 
  UserOutlined, PhoneOutlined, MailOutlined, 
  CheckCircleOutlined, BookOutlined, CalendarOutlined,
} from '@ant-design/icons';
import { saveAs } from 'file-saver';
import type { ColumnsType } from 'antd/es/table';

// --- Types ---
interface EvaluationFormProps {
  role: string;
  thesisId: number;
  onSuccess: () => void;
  existingEvaluation?: any;
}

// --- Helper Components ---

const StudentTeacherCard = ({ student, supervisor }: { student: any, supervisor: any }) => (
  <Card 
    title={<span className="text-lg font-semibold">Student & Supervisor</span>} 
    className="mb-4 shadow-md hover:shadow-lg transition-shadow" 
    bodyStyle={{ padding: '1.5rem' }}
  >
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Student Information</h3>
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label={<span><UserOutlined /> Name</span>}>
            {student?.fullName || <span className="text-gray-400">N/A</span>}
          </Descriptions.Item>
          <Descriptions.Item label="Student ID">{student?.studentIdCode || student?.id || '-'}</Descriptions.Item>
          <Descriptions.Item label={<span><MailOutlined /> Email</span>}>
            {student?.email ? <a href={`mailto:${student.email}`} className="text-blue-600">{student.email}</a> : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Class">{student?.className || '-'}</Descriptions.Item>
        </Descriptions>
      </div>
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Supervisor Information</h3>
        {supervisor ? (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label={<span><UserOutlined /> Name</span>}>
              {supervisor.title ? `${supervisor.title} ` : ''}{supervisor.fullName || <span className="text-gray-400">N/A</span>}
            </Descriptions.Item>
            <Descriptions.Item label={<span><MailOutlined /> Email</span>}>
              {supervisor.email ? <a href={`mailto:${supervisor.email}`} className="text-blue-600">{supervisor.email}</a> : '-'}
            </Descriptions.Item>
            <Descriptions.Item label={<span><PhoneOutlined /> Phone</span>}>
              {supervisor.phone || '-'}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Supervisor Assigned" />
        )}
      </div>
    </div>
  </Card>
);

const ThesisInfoCard = ({ thesis }: { thesis: any }) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'defense_completed': return 'cyan';
      case 'in_progress': return 'blue';
      default: return 'orange';
    }
  };

  return (
    <Card 
      title={<span className="text-lg font-semibold">Thesis Information</span>} 
      className="mb-4 shadow-md hover:shadow-lg transition-shadow" 
      bodyStyle={{ padding: '1.5rem' }}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-600">Status:</span>
          <Tag color={getStatusColor(thesis?.status)} className="text-base px-3 py-1">
            {(thesis?.status || 'UNKNOWN').toUpperCase().replace('_', ' ')}
          </Tag>
        </div>

        <Divider orientation="left" orientationMargin="0">
          <span className="text-base font-semibold text-gray-700">
            <BookOutlined /> Thesis Details
          </span>
        </Divider>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="mb-3">
            <label className="text-sm font-semibold text-gray-600 block mb-1">Title</label>
            <p className="text-base">{thesis?.title || <span className="text-gray-400">No title provided</span>}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-1">Abstract</label>
            <div className="whitespace-pre-wrap text-justify text-base leading-relaxed max-h-60 overflow-y-auto">
              {thesis?.abstract || <span className="text-gray-400 italic">No abstract provided.</span>}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const CommitteeInfoCard = ({ assignments }: { assignments: any[] }) => {
  const reviewer = assignments?.find(a => a.role === 'reviewer')?.teacher;
  const committeeMembers = assignments?.filter(a => a.role === 'committee_member');

  if (!reviewer && (!committeeMembers || committeeMembers.length === 0)) return null;

  return (
    <Card 
      title={<span className="text-lg font-semibold"><CheckCircleOutlined /> Review Board</span>} 
      className="mb-4 shadow-md hover:shadow-lg transition-shadow" 
      bodyStyle={{ padding: '1.5rem' }}
    >
      <div className="space-y-6">
        {reviewer && (
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-gray-700 border-b pb-2">Reviewer</h4>
            <Descriptions size="small" bordered column={1}>
              <Descriptions.Item label={<span><UserOutlined /> Name</span>}>{reviewer.user?.fullName}</Descriptions.Item>
              <Descriptions.Item label={<span><MailOutlined /> Email</span>}>
                <a href={`mailto:${reviewer.user?.email}`} className="text-blue-600">{reviewer.user?.email}</a>
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
        {committeeMembers && committeeMembers.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-gray-700 border-b pb-2">Committee Members</h4>
            <List
              grid={{ gutter: 16, column: 1 }}
              dataSource={committeeMembers}
              renderItem={(item: any) => (
                <List.Item>
                  <Descriptions size="small" bordered column={1}>
                    <Descriptions.Item label={<span><UserOutlined /> Name</span>}>{item.teacher?.user.fullName}</Descriptions.Item>
                    <Descriptions.Item label={<span><MailOutlined /> Email</span>}>
                      <a href={`mailto:${item.teacher?.user.email}`} className="text-blue-600">{item.teacher?.user.email}</a>
                    </Descriptions.Item>
                  </Descriptions>
                </List.Item>
              )}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

const DefenseDateCard = ({ session }: { session: any }) => (
  <Card 
    title={<span className="text-lg font-semibold"><CalendarOutlined /> Defense Schedule</span>} 
    className="mb-4 shadow-md hover:shadow-lg transition-shadow" 
    bodyStyle={{ padding: '1.5rem' }}
  >
    {session ? (
      <div className="flex flex-col md:flex-row justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="text-center md:text-left mb-2 md:mb-0">
          <div className="text-2xl font-bold text-blue-700">
            {new Date(session.scheduledAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div className="text-xl text-blue-600 mt-1">
            {new Date(session.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        <div className="bg-white px-6 py-3 rounded-md shadow-sm border">
          <span className="text-gray-500 block text-xs uppercase font-bold tracking-wider">Room</span>
          <span className="text-xl font-semibold text-gray-800">{session.room}</span>
        </div>
      </div>
    ) : (
      <Empty description="Defense session not yet scheduled" image={Empty.PRESENTED_IMAGE_SIMPLE} />
    )}
  </Card>
);

const SubmissionCard = ({ submissions, isStudent, onUpload, onDelete, onDownload }: { 
  submissions: any[], 
  isStudent: boolean,
  onUpload: (files: FileList) => void,
  onDelete: (fileId: number) => void,
  onDownload: (file: any) => void
}) => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleChange = (info: any) => setFileList(info.fileList);

  const handleSubmit = async () => {
    if (fileList.length === 0) {
      message.warning('Please select at least one file.');
      return;
    }
    setUploading(true);
    const files = new DataTransfer();
    fileList.forEach((f: any) => {
      if (f.originFileObj) files.items.add(f.originFileObj);
    });
    await onUpload(files.files);
    setFileList([]);
    setUploading(false);
  };

  return (
    <Card 
      title={<span className="text-lg font-semibold"><DownloadOutlined /> Submissions</span>}
      className="mb-4 shadow-md hover:shadow-lg transition-shadow"
      bodyStyle={{ padding: '1.5rem' }}
    >
      {isStudent && (
        <div className="space-y-4 mb-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <Upload
              multiple
              fileList={fileList}
              beforeUpload={() => false}
              onChange={handleChange}
              className="w-full"
              showUploadList={{
                showRemoveIcon: true,
                removeIcon: (file: any) => (
                  <DeleteOutlined
                    onClick={e => {
                      e.stopPropagation();
                      setFileList(prev => prev.filter(f => f.uid !== file.uid));
                    }}
                    className="text-red-500"
                  />
                ),
              }}
            >
              <Button icon={<UploadOutlined />} size="large" className="w-full">
                Select File(s) to Upload
              </Button>
            </Upload>
            <Button
              type="primary"
              size="large"
              className="w-full mt-3"
              onClick={handleSubmit}
              disabled={fileList.length === 0 || uploading}
              loading={uploading}
            >
              {uploading ? 'Submitting...' : `Submit ${fileList.length > 0 ? `(${fileList.length})` : ''}`}
            </Button>
          </div>
        </div>
      )}

      {submissions.length > 0 ? (
        <>
          {isStudent && <Divider orientation="left">Your Submitted Files</Divider>}
          <List
            bordered
            dataSource={submissions}
            renderItem={(file: any) => (
              <List.Item
                className="hover:bg-gray-50 transition-colors"
                actions={[
                  <Tooltip title="Download" key="download">
                    <Button
                      type="text"
                      icon={<DownloadOutlined />}
                      className="text-blue-600 hover:text-blue-700"
                      onClick={() => onDownload(file)}
                    />
                  </Tooltip>,
                  isStudent && (
                    <Popconfirm
                      title="Delete this file?"
                      description="This action cannot be undone."
                      onConfirm={() => onDelete(file.id)}
                      okText="Yes"
                      cancelText="No"
                      key="delete"
                    >
                      <Tooltip title="Delete">
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                        />
                      </Tooltip>
                    </Popconfirm>
                  )
                ].filter(Boolean)}
              >
                <div className="flex items-center gap-2">
                  <span className="truncate">{file.fileName}</span>
                  <span className="text-xs text-gray-400">
                    {file.createdAt && `(${new Date(file.createdAt).toLocaleDateString()})`}
                  </span>
                </div>
              </List.Item>
            )}
          />
        </>
      ) : (
        <Empty description="No files submitted yet" />
      )}
    </Card>
  );
};

const GradeCard = ({ evaluations, finalGrade, assignments, supervisor }: { evaluations: any[], finalGrade: any, assignments: any[], supervisor: any }) => {
  const data = evaluations.map(ev => {
    let teacherName = 'Unknown';
    if (ev.role === 'supervisor' && supervisor?.id === ev.evaluatorTeacherId) {
      teacherName = supervisor.fullName;
    } else {
      const assignment = assignments?.find(a => a.teacherId === ev.evaluatorTeacherId);
      teacherName = assignment?.teacher?.user.fullName || 'Unknown';
    }
    return { ...ev, teacherName };
  });

  const columns: ColumnsType<any> = [
    { title: 'Role', dataIndex: 'role', key: 'role', render: (text) => <Tag color="geekblue">{text.toUpperCase().replace('_', ' ')}</Tag> },
    { title: 'Evaluator', dataIndex: 'teacherName', key: 'teacherName' },
    { 
      title: 'Score', 
      dataIndex: 'score', 
      key: 'score', 
      render: (score) => <span className="font-bold text-blue-600">{Number(score).toFixed(2)}</span> 
    },
    { title: 'Comments', dataIndex: 'comments', key: 'comments', ellipsis: true },
  ];

  const getGradeColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card 
      title={<span className="text-lg font-semibold">Evaluation Results</span>} 
      className="mb-4 shadow-md hover:shadow-lg transition-shadow" 
      bodyStyle={{ padding: '1.5rem' }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-700">Evaluations</h3>
          {finalGrade?.finalScore !== undefined && (
            <Tag color={Number(finalGrade?.finalScore) >= 50 ? 'success' : 'error'} className="text-lg px-3 py-1">
              Final Score: {Number(finalGrade.finalScore).toFixed(2)}
            </Tag>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <Table 
            dataSource={data} 
            columns={columns} 
            rowKey="id" 
            pagination={false} 
            size="small"
            locale={{ emptyText: 'No evaluations submitted yet' }}
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-2 flex-1">
            <span className="font-medium text-gray-600 min-w-[100px]">Final Grade:</span>
            <span className={finalGrade?.finalScore !== undefined
              ? `font-semibold text-2xl ${getGradeColor(Number(finalGrade.finalScore))}`
              : 'text-gray-400'}>
              {finalGrade?.finalScore !== undefined
                ? `${Number(finalGrade.finalScore).toFixed(2)} / 100`
                : 'Pending all evaluations'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

const GradingForm = ({ role, thesisId, onSuccess, existingEvaluation }: EvaluationFormProps) => {
  const [form] = Form.useForm();
  const { gradeThesis } = useTheses();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = async (values: any) => {
    setSubmitting(true);
    const { error } = await gradeThesis(thesisId, {
      role: role,
      score: values.score,
      comments: values.comments
    });

    if (error) {
      message.error(error);
    } else {
      message.success('Evaluation submitted successfully');
      onSuccess();
    }
    setSubmitting(false);
  };

  {existingEvaluation && (
    <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
      <CheckCircleOutlined className="text-4xl text-green-500 mb-2" />
      <h3 className="text-lg font-medium text-green-800">Evaluation Submitted</h3>
      <p className="text-gray-600">You gave a score of <strong>{Number(existingEvaluation.score).toFixed(2)}</strong>.</p>
      <p className="text-gray-500 italic mt-2">"{existingEvaluation.comments}"</p>
    </div>
  )}

  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h4 className="font-semibold text-gray-700 mb-3">Submit Evaluation as {role.replace('_', ' ').toUpperCase()}</h4>
      <Form form={form} layout="vertical" onFinish={onFinish} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form.Item 
            name="score" 
            label="Score (0-100)" 
            rules={[
              { required: true, message: 'Please input a score' },
              { type: 'number', min: 0, max: 100, message: 'Score must be between 0 and 100' }
            ]}
          >
            <InputNumber min={0} max={100} step={0.1} className="w-full" size="large" />
          </Form.Item>

          <Form.Item 
            name="comments" 
            label="Comments / Feedback"
            rules={[{ required: true, message: 'Please input comments' }]}
            className="md:col-span-2"
          >
            <Input.TextArea rows={1} placeholder="Enter your detailed feedback here..." size="large" />
          </Form.Item>
        </div>

        <Form.Item className="mb-0">
          <Button type="primary" htmlType="submit" loading={submitting} size="large" className="w-full md:w-auto">
            Submit Evaluation
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

// --- Main Page ---

function ThesisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { collapsed } = useLayoutContext();
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  
  const { getMe } = useUserApi();
  const { getById: getThesisById } = useTheses();
  const { getByEntity, uploadFiles, delete: deleteAttachment, downloadAttachment } = useAttachmentApi();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [thesisData, setThesisData] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!id) return;
    setLoading(true);

    try {

      const userRes = await getMe();
      if (userRes.error) {
        setError(userRes.error);
        setLoading(false);
        return;
      }
      setCurrentUser(userRes.data);

      const thesisRes = await getThesisById(Number(id));
      if (thesisRes.error) {
        setError(thesisRes.error);
        setLoading(false);
        return;
      }

      setThesisData(thesisRes.data);
      console.log('Fetched thesis data:', thesisRes.data);
      if (thesisRes.data?.thesis.id) {
        const filesRes = await getByEntity('thesis_submission', thesisRes.data.thesis.id);
        setSubmissions(filesRes.data || []);
      }
    } catch (err) {
      console.error('Error fetching thesis data:', err);
      setError('Failed to load thesis data. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleFileUpload = async (files: FileList) => {
    if (!thesisData?.thesis?.id) return;
    const { error } = await uploadFiles(files, 'thesis_submission', thesisData.thesis.id);
    if (error) message.error(error);
    else {
      message.success('Uploaded successfully');
      const filesRes = await getByEntity('thesis_submission', thesisData.thesis.id);
      setSubmissions(filesRes.data || []);
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    const { error } = await deleteAttachment(fileId);
    if (error) message.error(error);
    else {
      message.success('Deleted');
      setSubmissions(prev => prev.filter(f => f.id !== fileId));
    }
  };

  const handleDownloadFile = async (file: any) => {
    message.loading({ content: 'Downloading...', key: 'download' });
    const res = await downloadAttachment(file.id);
    if (res.data) {
      saveAs(res.data, file.fileName);
      message.success({ content: 'Downloaded successfully', key: 'download' });
    } else {
      message.error({ content: 'Download failed', key: 'download' });
    }
  };

  const isStudent = currentUser?.roles?.some((r: any) => r.name === 'student');
  const isTeacher = currentUser?.roles?.some((r: any) => r.name === 'teacher');

  const teacherRoles = useMemo(() => {
    if (!isTeacher || !currentUser || !thesisData) return [];
    
    const roles: string[] = [];
    const userId = currentUser.id;

    if (thesisData.supervisor?.userId === userId) {
      roles.push('supervisor');
    }

    if (thesisData.committeeAssignments) {
      thesisData.committeeAssignments.forEach((assignment: any) => {
        if (assignment.teacher?.userId === userId) {
          roles.push(assignment.role);
        }
      });
    }

    return Array.from(new Set(roles));
  }, [currentUser, thesisData, isTeacher]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Spin size="large" tip="Loading thesis details..." />
      </div>
    );
  }

  if (error || !thesisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="max-w-3xl mx-auto mt-8">
          <Alert
            message="Error Loading Thesis"
            description={error || 'Thesis not found'}
            type="error"
            showIcon
            closable
          />
        </div>
      </div>
    );
  }

  const { thesis, student, supervisor, committeeAssignments, defenseSession, evaluations, finalGrade } = thesisData;

  return (
    <>
      <Sidebar user={currentUser} />
      <div
        className="flex-1 flex flex-col"
        style={{
          marginLeft: sidebarWidth,
          transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
          minHeight: "100vh",
        }}
      >
        <Navbar user={currentUser} pageName="Thesis Details" />
        
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
          <div className="max-w-5xl mx-auto space-y-4">
            
            <StudentTeacherCard student={student} supervisor={supervisor} />
            
            <ThesisInfoCard thesis={thesis} />
            
            <DefenseDateCard session={defenseSession} />
            
            <CommitteeInfoCard assignments={committeeAssignments} />
            
            <SubmissionCard 
              submissions={submissions}
              isStudent={isStudent}
              onUpload={handleFileUpload}
              onDelete={handleDeleteFile}
              onDownload={handleDownloadFile}
            />

            <Divider />

            <GradeCard 
              evaluations={evaluations || []} 
              finalGrade={finalGrade} 
              assignments={committeeAssignments}
              supervisor={supervisor}
            />

            {isTeacher && teacherRoles.length > 0 && thesis?.status !== 'completed' && (
              <Card className="shadow-md hover:shadow-lg transition-shadow border-t-4 border-t-blue-500" bodyStyle={{ padding: '1.5rem' }}>
                <Tabs
                  type="card"
                  items={teacherRoles.map(role => {
                    const canGrade = 
                      (role === 'supervisor' || role === 'reviewer') 
                        ? thesis?.status === 'in_progress' || thesis?.status === 'defense_scheduled' || thesis?.status === 'defense_completed'
                        : thesis?.status === 'defense_completed';
                    
                    return {
                      label: `Grade as ${role.replace('_', ' ').toUpperCase()}`,
                      key: role,
                      children: canGrade ? (
                        <GradingForm 
                          role={role} 
                          thesisId={Number(id)} 
                          onSuccess={fetchData}
                          existingEvaluation={evaluations?.find((e: any) => 
                            e.role === role && e.evaluatorTeacherId === currentUser.teacherId
                          )}
                        />
                      ) : (
                        <Alert 
                          message={
                            role === 'committee_member' 
                              ? "Committee members can only grade after defense completion."
                              : "Grading is not yet available. Thesis must be in progress."
                          }
                          type="info" 
                          showIcon 
                        />
                      )
                    };
                  })}
                />
              </Card>
            )}

            {isTeacher && thesis?.status === 'completed' && teacherRoles.length > 0 && (
              <Alert 
                message="This thesis has been completed and the final report has been generated. No further evaluations are allowed." 
                type="warning" 
                showIcon 
                className="shadow-sm"
              />
            )}
            
            {isTeacher && thesis?.status !== 'completed' && thesis?.status !== 'defense_completed' && thesis?.status !== 'defense_scheduled' && thesis?.status !== 'in_progress' && teacherRoles.length > 0 && (
              <Alert 
                message="Grading is not yet available." 
                type="info" 
                showIcon 
                className="shadow-sm"
              />
            )}

          </div>
        </div>
      </div>
    </>
  );
}

export default function ThesisDetailPageContent() {
  return (
    <LayoutProvider>
      <ThesisDetailPage />
    </LayoutProvider>
  );
}