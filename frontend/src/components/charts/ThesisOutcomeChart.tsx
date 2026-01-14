import React, { useEffect, useState } from 'react';
import { Card, Spin } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useThesisStatistics } from '../../api/endpoints/thesis.api';

interface OutcomeData {
  semester: string;
  completed: number;
  in_progress: number;
  cancelled: number;
  defense_scheduled: number;
  defense_completed: number;
}

const ThesisOutcomeTrend: React.FC = () => {
  const { getOutcomeStats } = useThesisStatistics();
  const [data, setData] = useState<OutcomeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: stats, error } = await getOutcomeStats();
        if (stats && !error) {
          const chartData = Array.isArray(stats) ? stats : [];
          setData(chartData);
        } else {
          setData([]);
        }
      } catch (err) {
        console.error('Error fetching thesis outcome stats:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getOutcomeStats]);

  if (loading) {
    return (
      <Card title="Thesis Outcomes per Semester" bordered={false}>
        <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin />
        </div>
      </Card>
    );
  }

  return (
    <Card title="Thesis Outcomes per Semester" bordered={false}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="semester" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="completed" stackId="a" fill="#52c41a" name="Completed" />
          <Bar dataKey="defense_completed" stackId="a" fill="#73d13d" name="Defense Completed" />
          <Bar dataKey="defense_scheduled" stackId="a" fill="#faad14" name="Defense Scheduled" />
          <Bar dataKey="in_progress" stackId="a" fill="#1890ff" name="In Progress" />
          <Bar dataKey="cancelled" stackId="a" fill="#ff4d4f" name="Cancelled" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default ThesisOutcomeTrend;