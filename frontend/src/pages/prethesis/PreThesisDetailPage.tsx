import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LayoutProvider, useLayoutContext, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../../contexts/LayoutContext";
import { useUserApi } from '../../api/endpoints/user.api';
import { usePreThesisApi } from '../../api/endpoints/pre-thesis.api';
import { useAttachmentApi } from '../../api/endpoints/attachment.api';
import Sidebar from '../../components/common/navigation/Sidebar';
import Navbar from '../../components/common/navigation/Navbar';
import { Upload, Button, List, message, InputNumber, Form, Input, Popconfirm, Tooltip, Card, Descriptions, Divider, Spin, Alert, Empty, Tag } from 'antd';
import { UploadOutlined, DeleteOutlined, DownloadOutlined, UserOutlined, PhoneOutlined, MailOutlined, FileTextOutlined } from '@ant-design/icons';
import { saveAs } from 'file-saver';

// --- Student & Supervisor Card ---
function StudentTeacherCard({ student, teacher }: { student: any, teacher: any }) {
  return (
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
            <Descriptions.Item label="Student ID">{student?.studentIdCode || '-'}</Descriptions.Item>
            <Descriptions.Item label={<span><MailOutlined /> Email</span>}>
              {student?.email ? <a href={`mailto:${student.email}`} className="text-blue-600">{student.email}</a> : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Class">{student?.className || '-'}</Descriptions.Item>
            <Descriptions.Item label={<span><PhoneOutlined /> Phone</span>}>
              {student?.phone || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="DOB">{student?.dob || '-'}</Descriptions.Item>
            <Descriptions.Item label="Gender">{student?.gender || '-'}</Descriptions.Item>
          </Descriptions>
        </div>
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-700 border-b pb-2">Supervisor Information</h3>
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label={<span><UserOutlined /> Name</span>}>
              {teacher?.title ? `${teacher.title} ` : ''}{teacher?.fullName || <span className="text-gray-400">N/A</span>}
            </Descriptions.Item>
            <Descriptions.Item label={<span><MailOutlined /> Email</span>}>
              {teacher?.email ? <a href={`mailto:${teacher.email}`} className="text-blue-600">{teacher.email}</a> : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Office">{teacher?.office || '-'}</Descriptions.Item>
            <Descriptions.Item label={<span><PhoneOutlined /> Phone</span>}>
              {teacher?.phone || '-'}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </div>
    </Card>
  );
}

// --- Pre-Thesis Info Card ---
function PreThesisCard({
  preThesis,
  topic,
  topicApplication,
}: {
  preThesis: any;
  topic: any;
  topicApplication: any;
}) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Card 
      title={<span className="text-lg font-semibold">Pre-Thesis Information</span>} 
      className="mb-4 shadow-md hover:shadow-lg transition-shadow" 
      bodyStyle={{ padding: '1.5rem' }}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-600">Status:</span>
          <Tag color={getStatusColor(preThesis?.status)} className="text-base px-3 py-1">
            {preThesis?.status || 'Unknown'}
          </Tag>
        </div>

        <Divider orientation="left" orientationMargin="0">
          <span className="text-base font-semibold text-gray-700">
            <FileTextOutlined /> Topic Details
          </span>
        </Divider>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="mb-3">
            <label className="text-sm font-semibold text-gray-600 block mb-1">Title</label>
            <p className="text-base">{topic?.title || <span className="text-gray-400">No title provided</span>}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-1">Description</label>
            <p className="text-base text-justify leading-relaxed">{topic?.description || <span className="text-gray-400">No description provided</span>}</p>
          </div>
        </div>

        <Divider orientation="left" orientationMargin="0">
          <span className="text-base font-semibold text-gray-700">
            <FileTextOutlined /> Proposal Details
          </span>
        </Divider>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="mb-3">
            <label className="text-sm font-semibold text-gray-600 block mb-1">Proposal Title</label>
            <p className="text-base">{topicApplication?.proposalTitle || <span className="text-gray-400">No proposal title</span>}</p>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 block mb-1">Abstract</label>
            <p className="text-base text-justify leading-relaxed">{topicApplication?.proposalAbstract || <span className="text-gray-400">No abstract provided</span>}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

// --- Submission Card ---
function SubmissionCard({
  submissions,
  isTeacher,
  isStudent,
  onSubmit,
  onDelete,
}: {
  submissions: any[];
  isTeacher: boolean;
  isStudent: boolean;
  onSubmit?: (files: FileList) => void;
  onDelete?: (fileId: number) => void;
}) {
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const { downloadAttachment } = useAttachmentApi();

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
    await onSubmit?.(files.files);
    setFileList([]);
    setUploading(false);
  };

  const handleDownload = async (file: any) => {
    try {
      message.loading({ content: 'Downloading...', key: 'download' });
      const res = await downloadAttachment(file.id);
      if (res.error || !res.data) {
        message.error({ content: 'Download failed', key: 'download' });
        return;
      }
      saveAs(res.data, file.fileName || 'downloaded-file');
      message.success({ content: 'Downloaded successfully', key: 'download' });
    } catch (e) {
      message.error({ content: 'Download failed', key: 'download' });
    }
  };

  return (
    <Card 
      title={<span className="text-lg font-semibold">Submission</span>} 
      className="mb-4 shadow-md hover:shadow-lg transition-shadow" 
      bodyStyle={{ padding: '1.5rem' }}
    >
      {isTeacher && (
        <>
          {submissions.length === 0 ? (
            <Empty description="No submissions yet" />
          ) : (
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
                        onClick={() => handleDownload(file)}
                      />
                    </Tooltip>
                  ]}
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
          )}
        </>
      )}
      {isStudent && (
        <div className="space-y-4">
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
          {submissions.length > 0 && (
            <div>
              <Divider orientation="left">Your Submitted Files</Divider>
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
                          onClick={() => handleDownload(file)}
                        />
                      </Tooltip>,
                      onDelete && (
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
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// --- Grading Card ---
function GradingCard({
  grade,
  feedback,
  isTeacher,
  isStudent,
  onGrade,
}: {
  grade: number | null;
  feedback: string | null;
  isTeacher: boolean;
  isStudent: boolean;
  onGrade?: (finalScore: number, feedback: string) => void;
}) {
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    onGrade && onGrade(values.finalScore, values.feedback);
    form.resetFields();
    message.success('Grade submitted successfully!');
  };

  const getGradeColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card 
      title={<span className="text-lg font-semibold">Grading & Feedback</span>} 
      className="mb-4 shadow-md hover:shadow-lg transition-shadow" 
      bodyStyle={{ padding: '1.5rem' }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-700">Current Grade</h3>
          {grade !== undefined && grade !== null && (
            <Tag color={grade >= 60 ? 'success' : 'error'} className="text-lg px-3 py-1">
              Score: {grade}
            </Tag>
          )}
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
          <div className="flex items-start gap-2">
            <span className="font-medium text-gray-600 min-w-[80px]">Grade:</span>
            <span className={grade !== undefined && grade !== null
              ? `font-semibold text-xl ${getGradeColor(grade)}`
              : 'text-gray-400'}>
              {grade !== undefined && grade !== null
                ? `${grade} / 100`
                : 'Not graded yet'}
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-gray-600 min-w-[80px]">Feedback:</span>
            <span className={feedback ? 'text-gray-700' : 'text-gray-400'}>
              {feedback || 'No feedback yet'}
            </span>
          </div>
        </div>

        {isTeacher && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
            <h4 className="font-semibold text-gray-700 mb-3">Submit New Grade</h4>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              className="space-y-3"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Item
                  name="finalScore"
                  label="Score (0-100)"
                  rules={[
                    { required: true, message: 'Please input a score!' },
                    { type: 'number', min: 0, max: 100, message: 'Score must be 0-100' },
                  ]}
                >
                  <InputNumber
                    min={0}
                    max={100}
                    placeholder="Enter score"
                    className="w-full"
                    size="large"
                  />
                </Form.Item>
                <Form.Item
                  name="feedback"
                  label="Feedback"
                  rules={[{ required: true, message: 'Please provide feedback!' }]}
                  className="md:col-span-2"
                >
                  <Input.TextArea 
                    placeholder="Enter feedback for student..." 
                    rows={1}
                    size="large"
                  />
                </Form.Item>
              </div>
              <Form.Item className="mb-0">
                <Button type="primary" htmlType="submit" size="large" className="w-full md:w-auto">
                  Submit Grade
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </div>
    </Card>
  );
}

// --- Main Page ---
function PreThesisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { collapsed } = useLayoutContext();
  const sidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  const { getMe } = useUserApi();
  const { getPreThesisById, gradePreThesis } = usePreThesisApi();
  const { getByEntity, uploadFiles: submitPreThesisFiles, delete: deleteAttachment } = useAttachmentApi();

  const [user, setUser] = useState<any>(null);
  const [preThesisData, setPreThesisData] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      getMe(),
      id ? getPreThesisById(id) : Promise.resolve({ data: null, error: 'No ID' })
    ]).then(async ([userRes, preThesisRes]) => {
      if (userRes.error) setError(userRes.error);
      else setUser(userRes.data);

      if (preThesisRes.error) setError(preThesisRes.error);
      else setPreThesisData(preThesisRes.data);

      if (id) {
        const { data: files } = await getByEntity('prethesis_submission', Number(id));
        setSubmissions(files || []);
      }
      setLoading(false);
    });
    // eslint-disable-next-line
  }, [id, getMe, getPreThesisById, getByEntity]);

  const handleSubmitFiles = async (files: FileList) => {
    if (!preThesisData?.preThesis?.id) return;
    const { data, error } = await submitPreThesisFiles(files, 'prethesis_submission', preThesisData.preThesis.id);
    if (error) {
      message.error(error);
    } else {
      message.success('Files submitted successfully!');
      const { data: filesData } = await getByEntity('prethesis_submission', preThesisData.preThesis.id);
      setSubmissions(filesData || []);
    }
  };
  
  const handleDeleteFile = async (fileId: number) => {
    const { error } = await deleteAttachment(fileId);
    if (error) {
      message.error('Failed to delete file');
    } else {
      message.success('File deleted');
      if (preThesisData?.preThesis?.id) {
        const { data: filesData } = await getByEntity('prethesis_submission', preThesisData.preThesis.id);
        setSubmissions(filesData || []);
      }
    }
  };

  const isTeacher = user?.roles?.some((r: any) => r.name === 'teacher');
  const isStudent = user?.roles?.some((r: any) => r.name === 'student');

  const student = preThesisData?.student;
  const supervisor = preThesisData?.supervisor;
  const preThesis = preThesisData?.preThesis;
  const topic = preThesisData?.topic;
  const topicApplication = preThesisData?.topicApplication;
  const grade = preThesis?.finalScore;
  const feedback = preThesis?.feedback;

  const handleGrade = async (finalScore: number, feedback: string) => {
    if (!id) return;
    setLoading(true);
    const { data, error } = await gradePreThesis(id, { finalScore, feedback });
    if (error) setError(error);
    else setPreThesisData((prev: any) => ({
      ...prev,
      preThesis: { ...prev.preThesis, finalScore, feedback }
    }));
    setLoading(false);
  };

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
        <Navbar user={user} pageName="Pre-Thesis Detail" />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Spin size="large" tip="Loading pre-thesis details..." />
            </div>
          ) : error ? (
            <div className="max-w-3xl mx-auto mt-8">
              <Alert
                message="Error Loading Pre-Thesis"
                description={error}
                type="error"
                showIcon
                closable
              />
            </div>
          ) : (
            <div className="max-w-5xl mx-auto space-y-4">
              <StudentTeacherCard student={student} teacher={supervisor} />
              <PreThesisCard
                preThesis={preThesis}
                topic={topic}
                topicApplication={topicApplication}
              />
              <SubmissionCard
                submissions={submissions}
                isTeacher={isTeacher}
                isStudent={isStudent}
                onSubmit={handleSubmitFiles}
                onDelete={handleDeleteFile}
              />
              <GradingCard
                grade={grade}
                feedback={feedback}
                isTeacher={isTeacher}
                isStudent={isStudent}
                onGrade={handleGrade}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}


export default function PreThesisDetailPageContent() {
  return (
    <LayoutProvider>
      <PreThesisDetailPage />
    </LayoutProvider>
  );
}