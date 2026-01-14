import React, { useEffect, useState } from 'react';
import { Card, Spin } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { usePreThesisApi } from '../../api/endpoints/pre-thesis.api';

interface OutcomeData {
  semester: string;
  passed: number;
  failed: number;
  in_progress: number;
}

const PreThesisOutcomeTrend: React.FC = () => {
  const { getOutcomeStats } = usePreThesisApi();
  const [data, setData] = useState<OutcomeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: stats, error } = await getOutcomeStats();
        if (stats && !error) {
          // Ensure stats is an array
          const chartData = Array.isArray(stats) ? stats : [];
          setData(chartData);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error('Error fetching outcome stats:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getOutcomeStats]);

  if (loading) {
    return (
      <Card title="Pre-Thesis Outcomes per Semester" bordered={false}>
        <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin />
        </div>
      </Card>
    );
  }

  return (
    <Card title="Pre-Thesis Outcomes per Semester" bordered={false}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="semester" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="passed" stackId="a" fill="#52c41a" name="Passed" />
          <Bar dataKey="failed" stackId="a" fill="#ff4d4f" name="Failed" />
          <Bar dataKey="in_progress" stackId="a" fill="#1890ff" name="In Progress" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default PreThesisOutcomeTrend;