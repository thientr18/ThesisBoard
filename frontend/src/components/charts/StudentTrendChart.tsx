import React, { useEffect, useState } from 'react';
import { Card, Spin } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useSemesterApi } from '../../api/endpoints/semester.api';

interface PopulationData {
  semester: string;
  studentCount: number;
  teacherCount: number;
}

const StudentTrendChart: React.FC = () => {
  const { getPopulationStats } = useSemesterApi();
  const [data, setData] = useState<Array<{ semester: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: stats, error } = await getPopulationStats();
      if (stats && !error) {
        const chartData = stats.map((item: PopulationData) => ({
          semester: item.semester,
          count: item.studentCount
        }));
        setData(chartData);
      }
      setLoading(false);
    };

    fetchData();
  }, [getPopulationStats]);

  if (loading) {
    return (
      <Card title="Student Enrollment per Semester" bordered={false}>
        <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin />
        </div>
      </Card>
    );
  }

  return (
    <Card title="Student Enrollment per Semester" bordered={false}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="semester" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default StudentTrendChart;