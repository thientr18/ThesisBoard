import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LayoutProvider, useLayoutContext, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from "../../contexts/LayoutContext";
import { useUserApi } from '../../api/endpoints/user.api';
import { usePreThesisApi } from '../../api/endpoints/pre-thesis.api';
import { useAttachmentApi } from '../../api/endpoints/attachment.api';
import Sidebar from '../../components/common/navigation/Sidebar';
import Navbar from '../../components/common/navigation/Navbar';
import { Upload, Button, List, message, InputNumber, Form, Input, Popconfirm, Tooltip } from 'antd';
import { UploadOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { Card, Descriptions, Divider } from 'antd';
import { saveAs } from 'file-saver';

function StudentTeacherCard({ student, teacher }: { student: any, teacher: any }) {
  return (
    <Card
      title="Student & Supervisor"
      className="mb-4 shadow"
      bodyStyle={{ padding: '1.5rem' }}
      headStyle={{ fontWeight: 700, fontSize: 18 }}
    >
      <Descriptions
        column={2}
        size="middle"
        labelStyle={{ fontWeight: 600 }}
        contentStyle={{ color: '#222' }}
        className="mb-2"
      >
        <Descriptions.Item label="Student Name">{student?.fullName || '-'}</Descriptions.Item>
        <Descriptions.Item label="Supervisor">{teacher?.title ? `${teacher.title} ` : ''}{teacher?.fullName || '-'}</Descriptions.Item>
        <Descriptions.Item label="Student ID">{student?.studentIdCode || '-'}</Descriptions.Item>
        <Descriptions.Item label="Supervisor Email">{teacher?.email || '-'}</Descriptions.Item>
        <Descriptions.Item label="Email">{student?.email || '-'}</Descriptions.Item>
        <Descriptions.Item label="Office">{teacher?.office || '-'}</Descriptions.Item>
        <Descriptions.Item label="Class">{student?.className || '-'}</Descriptions.Item>
        <Descriptions.Item label="Supervisor Phone">{teacher?.phone || '-'}</Descriptions.Item>
        <Descriptions.Item label="Phone">{student?.phone || '-'}</Descriptions.Item>
        <Descriptions.Item label="DOB">{student?.dob || '-'}</Descriptions.Item>
        <Descriptions.Item label="Gender">{student?.gender || '-'}</Descriptions.Item>
      </Descriptions>
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
  return (
    <div className="bg-white rounded shadow p-4 mb-4">
      <h2 className="font-bold mb-2">Pre-Thesis Info</h2>
      <div className="mb-2">
        <div className="font-semibold">Status:</div>
        <div>{preThesis?.status || '-'}</div>
      </div>
      <div className="mb-2">
        <div className="font-semibold">Topic:</div>
        <div>Title: {topic?.title || '-'}</div>
        <div>Description: {topic?.description || '-'}</div>
      </div>
      <div>
        <div className="font-semibold">Proposal:</div>
        <div>Title: {topicApplication?.proposalTitle || '-'}</div>
        <div>Abstract: {topicApplication?.proposalAbstract || '-'}</div>
      </div>
    </div>
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
      const res = await downloadAttachment(file.id);
      if (res.error || !res.data) {
        message.error('Download failed');
        return;
      }
      saveAs(res.data, file.fileName || 'downloaded-file');
    } catch (e) {
      message.error('Download failed');
    }
  };

  return (
    <Card
      title="Submission"
      className="mb-4 shadow"
      bodyStyle={{ padding: '1.5rem' }}
      headStyle={{ fontWeight: 700, fontSize: 18 }}
    >
      {isTeacher && (
        <div>
          {submissions.length === 0 ? (
            <div className="text-gray-500">No submissions yet.</div>
          ) : (
            <List
              bordered
              dataSource={submissions}
              renderItem={(file: any) => (
                <List.Item
                  actions={[
                    <Tooltip title="Download" key="download">
                      <Button
                        type="text"
                        icon={<DownloadOutlined />}
                        className="text-blue-600"
                        onClick={() => handleDownload(file)}
                      />
                    </Tooltip>
                  ]}
                >
                  <span className="truncate">{file.fileName}</span>
                </List.Item>
              )}
              className="bg-white"
            />
          )}
        </div>
      )}
      {isStudent && (
        <div>
          <Upload
            multiple
            fileList={fileList}
            beforeUpload={() => false}
            onChange={handleChange}
            className="mb-2"
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
            <Button icon={<UploadOutlined />}>Select File(s)</Button>
          </Upload>
          <Button
            type="primary"
            className="w-full mt-2"
            onClick={handleSubmit}
            disabled={fileList.length === 0 || uploading}
            loading={uploading}
          >
            Submit
          </Button>
          {submissions.length > 0 && (
            <div className="mt-4">
              <div className="font-semibold mb-2">Your Submitted Files</div>
              <List
                bordered
                dataSource={submissions}
                renderItem={(file: any) => (
                  <List.Item
                    actions={[
                      <Tooltip title="Download" key="download">
                        <a
                          href={file.fileUrl}
                          download
                          className="text-blue-600 hover:underline"
                        >
                          <DownloadOutlined />
                        </a>
                      </Tooltip>,
                      onDelete && (
                        <Popconfirm
                          title="Delete this file?"
                          onConfirm={() => onDelete(file.id)}
                          okText="Yes"
                          cancelText="No"
                          key="delete"
                        >
                          <Tooltip title="Delete">
                            <Button
                              type="text"
                              icon={<DeleteOutlined className="text-red-500" />}
                            />
                          </Tooltip>
                        </Popconfirm>
                      )
                    ].filter(Boolean)}
                  >
                    <span className="truncate">{file.fileName}</span>
                  </List.Item>
                )}
                className="bg-white"
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
  };

  return (
    <Card
      title="Grading"
      className="mb-4 shadow"
      bodyStyle={{ padding: '1.5rem' }}
      headStyle={{ fontWeight: 700, fontSize: 18 }}
    >
      {isTeacher && (
        <>
          {(grade !== undefined && grade !== null) && (
            <div className="mb-4">
              <div className="text-lg font-semibold">
                Grade: <span className="text-green-600">{grade}</span>
              </div>
              <div className="mt-2">
                <span className="font-semibold">Feedback: </span>
                {feedback ? (
                  <span>{feedback}</span>
                ) : (
                  <span className="text-gray-400">No feedback yet</span>
                )}
              </div>
              <Divider />
            </div>
          )}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            className="flex flex-col gap-4"
          >
            <Form.Item
              name="finalScore"
              label="Score"
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
              />
            </Form.Item>
            <Form.Item
              name="feedback"
              label="Feedback"
              rules={[{ required: true, message: 'Please provide feedback!' }]}
            >
              <Input.TextArea rows={3} placeholder="Enter feedback for student..." />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="w-full">
                Submit Grade
              </Button>
            </Form.Item>
          </Form>
        </>
      )}
      {isStudent && (
        <div>
          <div className="text-lg font-semibold">
            Grade: {grade !== undefined && grade !== null ? (
              <span className="text-green-600">{grade}</span>
            ) : (
              <span className="text-gray-400">Not graded yet</span>
            )}
          </div>
          <div className="mt-2">
            <span className="font-semibold">Feedback: </span>
            {feedback ? (
              <span>{feedback}</span>
            ) : (
              <span className="text-gray-400">No feedback yet</span>
            )}
          </div>
        </div>
      )}
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

  // Fetch user and pre-thesis data
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

      // Fetch submissions if preThesis exists
      if (id) {
        const { data: files } = await getByEntity('prethesis_submission', id);
        setSubmissions(files || []);
      }
      setLoading(false);
    });
    // eslint-disable-next-line
  }, [id, getMe, getPreThesisById, getByEntity]);

  // Submission handlers
  const handleSubmitFiles = async (files: FileList) => {
    if (!preThesisData?.preThesis?.id) return;
    const { data, error } = await submitPreThesisFiles(files, 'prethesis_submission', preThesisData.preThesis.id);
    if (error) {
      message.error(error);
    } else {
      message.success('Files submitted successfully!');
      // Refetch submissions
      const { data: filesData } = await getByEntity('prethesis_submission', preThesisData.preThesis.id);
      setSubmissions(filesData || []);
    }
  };
  
  const handleDeleteFile = async (fileId: number) => {
    const { error } = await deleteAttachment(String(fileId));
    if (error) {
      message.error('Failed to delete file');
    } else {
      message.success('File deleted');
      // Refetch submissions
      if (preThesisData?.preThesis?.id) {
        const { data: filesData } = await getByEntity('prethesis_submission', preThesisData.preThesis.id);
        setSubmissions(filesData || []);
      }
    }
  };

  // Role check
  const isTeacher = user?.roles?.some((r: any) => r.name === 'teacher');
  const isStudent = user?.roles?.some((r: any) => r.name === 'student');

  const student = preThesisData?.student;
  const supervisor = preThesisData?.supervisor;
  const preThesis = preThesisData?.preThesis;
  const topic = preThesisData?.topic;
  const topicApplication = preThesisData?.topicApplication;
  const grade = preThesis?.finalScore;
  const feedback = preThesis?.feedback;

  // Grading handler
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

  const fetchSubmissions = async () => {
    if (!id) return;
    const { data, error } = await getByEntity('prethesis_submission', id);
    if (!error) setSubmissions(data || []);
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
        <div className="min-h-screen bg-gray-50 p-6">
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
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