import React, { useEffect, useState } from 'react';
import { usePreThesisApi } from '../../../api/endpoints/pre-thesis.api';
import { List, Spin, Alert, Empty } from 'antd';

interface AllTeacherPreThesesProps {
  user: any;
  semester: any;
}

const AllTeacherPreTheses: React.FC<AllTeacherPreThesesProps> = ({ user, semester }) => {
  const { getPreThesesForTeacherBySemester } = usePreThesisApi();
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
      const { data, error } = await getPreThesesForTeacherBySemester(semester.id);
      console.log('Fetched pre-theses:', data, 'Error:', error);
      if (error) setError(error);
      setPreTheses(data || []);
      setLoading(false);
    };
    fetchPreTheses();
  }, [semester, getPreThesesForTeacherBySemester]);

  if (!semester) return <div className="text-center text-gray-500 py-8">Please select a semester.</div>;
  if (loading) return <div className="flex justify-center py-8"><Spin tip="Loading pre-thesis projects..." /></div>;
  if (error) return <Alert message={error} type="error" showIcon className="my-4" />;
  if (preTheses.length === 0) return <Empty description="No pre-thesis projects found for this semester." className="my-8" />;

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Pre-Thesis Projects for {semester.name}</h3>
      <List
        itemLayout="horizontal"
        dataSource={preTheses}
        renderItem={pt => (
          <List.Item className="hover:bg-gray-50 transition cursor-pointer px-2 py-2 rounded"
            onClick={() => window.location.href = `/prethesis/${pt.id}`}>
            <div className="w-full">
              <div className="font-medium text-gray-900">{pt.topicApplication?.topic?.title || pt.title || 'No Topic Title'}</div>
              <div className="flex flex-row items-center justify-between mt-1">
                <div className="text-xs text-gray-500">
                  Status: {pt.status === 'in_progress' ? 'In Progress' : pt.status}
                </div>
                <div className="text-xs text-gray-700">
                  Student: <span className="text-blue-600 font-medium">{pt.student?.user?.fullName || 'Unknown Student'}</span>
                </div>
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
};

export default AllTeacherPreTheses;