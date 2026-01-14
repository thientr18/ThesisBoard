import React, { useEffect, useState } from 'react';
import { useTheses } from '../../../api/endpoints/thesis.api';
import { List, Spin, Alert, Empty, Tag, Divider, Collapse } from 'antd';
import { BookOutlined, EyeOutlined, TeamOutlined } from '@ant-design/icons';

interface AllTeacherThesesProps {
  user: any;
  semester: any;
}

const AllTeacherTheses: React.FC<AllTeacherThesesProps> = ({ user, semester }) => {
  const { getThesesForTeacherBySemester } = useTheses();
  const [theses, setTheses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Categorize theses by role
  const [supervisedTheses, setSupervisedTheses] = useState<any[]>([]);
  const [reviewerTheses, setReviewerTheses] = useState<any[]>([]);
  const [committeeTheses, setCommitteeTheses] = useState<any[]>([]);

useEffect(() => {
  const fetchTheses = async () => {
    if (!semester) {
      setTheses([]);
      setSupervisedTheses([]);
      setReviewerTheses([]);
      setCommitteeTheses([]);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error } = await getThesesForTeacherBySemester(semester.id);
    console.log('Fetched theses:', data, 'Error:', error);
    console.log('Current teacher ID:', user?.teacher?.id);
    if (error) setError(error);
    
    const allTheses = data || [];
    setTheses(allTheses);

    // Categorize theses
    const supervised: any[] = [];
    const reviewer: any[] = [];
    const committee: any[] = [];

    allTheses.forEach((item: any) => {
      const thesis = item.thesis || item;
      const teacherId = user?.teacher?.id;

      console.log('Processing thesis:', thesis.id, 'supervisor:', thesis.supervisorTeacherId, 'teacherRole:', item.teacherRole, 'current teacher:', teacherId);

      // Check teacherRole first (added from backend)
      if (item.teacherRole === 'supervisor' || thesis.supervisorTeacherId === teacherId) {
        supervised.push(item);
      } else if (item.teacherRole === 'reviewer') {
        reviewer.push(item);
      } else if (item.teacherRole === 'committee_member') {
        committee.push(item);
      }
    });

    console.log('Categorized - Supervised:', supervised.length, 'Reviewer:', reviewer.length, 'Committee:', committee.length);

    setSupervisedTheses(supervised);
    setReviewerTheses(reviewer);
    setCommitteeTheses(committee);

    setLoading(false);
  };
  fetchTheses();
}, [semester, getThesesForTeacherBySemester, user]);

  if (!semester) return <div className="text-center text-gray-500 py-8">Please select a semester.</div>;
  if (loading) return <div className="flex justify-center py-8"><Spin tip="Loading thesis projects..." /></div>;
  if (error) return <Alert message={error} type="error" showIcon className="my-4" />;
  if (theses.length === 0) return <Empty description="No thesis projects found for this semester." className="my-8" />;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'blue';
      case 'defense_scheduled': return 'orange';
      case 'defense_completed': return 'purple';
      case 'completed': return 'green';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const renderThesisList = (thesesList: any[], emptyMessage: string) => {
    if (thesesList.length === 0) {
      return <Empty description={emptyMessage} className="my-4" />;
    }

    return (
      <List
        itemLayout="horizontal"
        dataSource={thesesList}
        renderItem={item => {
          const thesis = item.thesis || item;
          const student = item.student || thesis.student;
          return (
            <List.Item 
              className="hover:bg-gray-50 transition cursor-pointer px-4 py-3 rounded"
              onClick={() => window.location.href = `/thesis/${thesis.id}`}
            >
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-gray-900">{thesis.title || 'Untitled Thesis'}</div>
                  <Tag color={getStatusColor(thesis.status)}>
                    {formatStatus(thesis.status)}
                  </Tag>
                </div>
                <div className="flex flex-row items-center justify-between text-sm">
                  <div className="text-gray-600">
                    Student: <span className="text-blue-600 font-medium">{student?.user?.fullName || 'Unknown Student'}</span>
                  </div>
                </div>
              </div>
            </List.Item>
          );
        }}
      />
    );
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Thesis Projects for {semester.name}</h3>
      
      <Collapse 
        defaultActiveKey={[]} 
        className="bg-white"
        items={[
          {
            key: 'supervised',
            label: (
              <div className="flex items-center gap-2">
                <BookOutlined className="text-blue-600" />
                <span className="font-semibold">Supervised Theses</span>
                <Tag color="blue">{supervisedTheses.length}</Tag>
              </div>
            ),
            children: renderThesisList(supervisedTheses, "No supervised theses")
          },
          {
            key: 'reviewer',
            label: (
              <div className="flex items-center gap-2">
                <EyeOutlined className="text-orange-600" />
                <span className="font-semibold">Reviewer Assignments</span>
                <Tag color="orange">{reviewerTheses.length}</Tag>
              </div>
            ),
            children: renderThesisList(reviewerTheses, "No reviewer assignments")
          },
          {
            key: 'committee',
            label: (
              <div className="flex items-center gap-2">
                <TeamOutlined className="text-green-600" />
                <span className="font-semibold">Committee Member Assignments</span>
                <Tag color="green">{committeeTheses.length}</Tag>
              </div>
            ),
            children: renderThesisList(committeeTheses, "No committee assignments")
          }
        ]}
      />
    </div>
  );
};

export default AllTeacherTheses;