import React, { useEffect, useState } from 'react';
import { usePreThesisApi } from '../../../api/endpoints/pre-thesis.api';
import { Card, List, Spin, Alert, Empty } from 'antd';
import { Link } from "react-router-dom";

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
      <h3 className="text-xl font-semibold mb-6">Pre-Thesis Projects for {semester.name}</h3>
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
        dataSource={preTheses}
        renderItem={pt => (
          <List.Item>
            <Link to={`/prethesis/${pt.id}`}>
              <Card
                title={
                  <div className="flex flex-col">
                    <span className="text-base font-semibold text-blue-700">
                      {pt.topicApplication?.topic?.title || pt.title || 'No Topic Title'}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      Status: {pt.status === 'in_progress' ? 'In Progress' : pt.status}
                    </span>
                  </div>
                }
                className="shadow-md hover:shadow-xl transition-shadow duration-200 border border-gray-100"
                bodyStyle={{ padding: '1rem' }}
              >
                <div className="mb-2">
                  <span className="font-medium text-gray-700">Student:</span>{' '}
                  <span className="text-blue-600 font-medium">
                    {pt.student?.user?.fullName || 'Unknown Student'}
                  </span>
                </div>
              </Card>
            </Link>
          </List.Item>
        )}
      />
    </div>
  );
};

export default AllTeacherPreTheses;