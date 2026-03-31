import { useState, useEffect } from 'react';
import { getWeeklyStats } from '../services/api';

export default function WeekTable() {
  const [weekData, setWeekData] = useState([]);
  const [habitBreakdown, setHabitBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeek = async () => {
      try {
        const res = await getWeeklyStats();
        setWeekData(res.data.data.week);
        setHabitBreakdown(res.data.data.habits);
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

  const avgPercentage =
    weekData.length > 0
      ? Math.round(weekData.reduce((sum, d) => sum + d.percentage, 0) / weekData.length)
      : 0;

  const getBarColor = (pct) => {
    if (pct >= 80) return 'bg-success';
    if (pct >= 50) return 'bg-warning';
    return 'bg-danger';
  };

  return (
    <div className="space-y-6">
      {/* Weekly Average */}
      <div className="bg-surface-card rounded-2xl p-5 border border-surface-light/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">Weekly Average</h3>
          <span className="text-2xl font-bold text-primary-light">{avgPercentage}%</span>
        </div>
        <div className="w-full h-3 bg-surface-light rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${getBarColor(avgPercentage)}`}
            style={{ width: `${avgPercentage}%` }}
          />
        </div>
      </div>

      {/* Day-by-Day Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekData.map((day) => {
          const isToday = day.date === new Date().toISOString().split('T')[0];
          return (
            <div
              key={day.date}
              className={`text-center p-3 rounded-xl border transition-all ${
                isToday
                  ? 'bg-primary/15 border-primary/40 ring-1 ring-primary/20'
                  : 'bg-surface-card border-surface-light/30'
              }`}
            >
              <p className={`text-xs font-semibold mb-2 ${isToday ? 'text-primary-light' : 'text-text-muted'}`}>
                {day.day}
              </p>
              <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center text-sm font-bold mb-1"
                style={{
                  background: `conic-gradient(${
                    day.percentage >= 80 ? '#10b981' : day.percentage >= 50 ? '#f59e0b' : '#ef4444'
                  } ${day.percentage * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
                }}
              >
                <span className="bg-surface-card w-7 h-7 rounded-full flex items-center justify-center text-xs">
                  {day.percentage}
                </span>
              </div>
              <p className="text-[10px] text-text-muted">{day.completed}/{day.total}</p>
            </div>
          );
        })}
      </div>

      {/* Habit Breakdown Table */}
      {habitBreakdown.length > 0 && (
        <div className="bg-surface-card rounded-2xl border border-surface-light/30 overflow-hidden">
          <div className="p-4 border-b border-surface-light/30">
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">Habit Breakdown</h3>
          </div>
          <div className="divide-y divide-surface-light/20">
            {habitBreakdown.map((habit) => (
              <div key={habit._id} className="flex items-center justify-between p-4">
                <span className="font-medium text-text">{habit.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-surface-light rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getBarColor(habit.completionRate)}`}
                      style={{ width: `${habit.completionRate}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-text-muted w-10 text-right">
                    {habit.completionRate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
