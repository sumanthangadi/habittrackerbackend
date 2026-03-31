import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getWeeklyStats } from '../services/api';

export default function Graph() {
  const [weekData, setWeekData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeek = async () => {
      try {
        const res = await getWeeklyStats();
        setWeekData(res.data.data.week);
      } catch (err) {
        console.error('Failed to fetch weekly stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeek();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const chartData = weekData.map((d) => ({
    day: d.day,
    percentage: d.percentage,
    completed: d.completed,
    total: d.total,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface-card border border-surface-light/30 rounded-xl p-3 shadow-xl">
          <p className="text-text font-semibold">{data.day}</p>
          <p className="text-primary-light text-sm">{data.percentage}% completed</p>
          <p className="text-text-muted text-xs">{data.completed}/{data.total} habits</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface-card rounded-2xl p-5 border border-surface-light/30">
      <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-4">Weekly Performance</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="day"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }} />
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
          <Bar dataKey="percentage" fill="url(#barGradient)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
