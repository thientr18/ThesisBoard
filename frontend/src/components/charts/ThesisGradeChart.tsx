import React, { useEffect, useState } from 'react';
import { Card, Spin } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useThesisStatistics } from '../../api/endpoints/thesis.api';

interface GradeData {
  semester: string;
  excellent: number;
  good: number;
  average: number;
  fail: number;
}

const ThesisGradeTrend: React.FC = () => {
  const { getGradeStats } = useThesisStatistics();
  const [data, setData] = useState<GradeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: stats, error } = await getGradeStats();
        if (stats && !error) {
          const chartData = Array.isArray(stats) ? stats : [];
          setData(chartData);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error('Error fetching thesis grade stats:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getGradeStats]);

  if (loading) {
    return (
      <Card title="Thesis Grade Distribution per Semester" bordered={false}>
        <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin />
        </div>
      </Card>
    );
  }

  return (
    <Card title="Thesis Grade Distribution per Semester" bordered={false}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="semester" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="excellent" stackId="a" fill="#82ca9d" name="Excellent (≥8.5)" />
          <Bar dataKey="good" stackId="a" fill="#8884d8" name="Good (7-8.5)" />
          <Bar dataKey="average" stackId="a" fill="#ffc658" name="Average (5-7)" />
          <Bar dataKey="fail" stackId="a" fill="#ff8042" name="Fail (<5)" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default ThesisGradeTrend;