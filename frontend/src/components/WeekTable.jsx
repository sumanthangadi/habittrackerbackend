import { useState, useEffect } from 'react';
import { getHabits, getWeeklyStats, logHabit } from '../services/api';

export default function WeekTable() {
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Get dates for current week (Mon–Sun)
  const getWeekDates = () => {
    const curr = new Date(today);
    const dayOfWeek = curr.getDay(); // 0=Sun, 1=Mon...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(curr);
    monday.setDate(curr.getDate() + mondayOffset);

    return dayNames.map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.toISOString().split('T')[0];
    });
  };

  const weekDates = getWeekDates();
  const todayStr = today.toISOString().split('T')[0];

  const format12h = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    let hours = parseInt(h);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${m} ${ampm}`;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [habitsRes, weekRes] = await Promise.all([
        getHabits(),
        getWeeklyStats(),
      ]);

      const activeHabits = habitsRes.data.data.filter((h) => h.active);
      setHabits(activeHabits);

      // Build a lookup: { habitId_date: true/false }
      const logMap = {};
      if (weekRes.data.data.habits) {
        weekRes.data.data.habits.forEach((h) => {
          h.completedDays.forEach((date) => {
            logMap[`${h._id}_${date}`] = true;
          });
        });
      }
      setLogs(logMap);
    } catch (err) {
      console.error('Failed to fetch week data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleCell = async (habitId, date) => {
    const key = `${habitId}_${date}`;
    const current = logs[key] || false;

    // Optimistic update
    setLogs((prev) => ({ ...prev, [key]: !current }));

    try {
      await logHabit({ habitId, date, completed: !current });
    } catch (err) {
      // Revert on error
      setLogs((prev) => ({ ...prev, [key]: current }));
      console.error('Failed to toggle:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (habits.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-text-muted">
        <p>No habits yet. Add some from the Admin panel.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider p-3 bg-surface-light/20 rounded-tl-xl sticky left-0 z-10 min-w-[120px]">
              Day
            </th>
            {habits.map((habit) => (
              <th
                key={habit._id}
                className="text-center text-xs font-semibold text-text-muted uppercase tracking-wider p-3 bg-surface-light/20 min-w-[140px]"
              >
                <span className="block text-text text-sm normal-case font-medium">{habit.name}</span>
                {(habit.startTime || habit.endTime) && (
                  <span className="block text-[10px] text-text-muted/60 mt-0.5">
                    {habit.startTime ? format12h(habit.startTime) : 'Anytime'}{habit.endTime ? ` - ${format12h(habit.endTime)}` : ''}
                  </span>
                )}
              </th>
            ))}
            <th className="text-right text-xs font-semibold text-text-muted uppercase tracking-wider p-3 bg-surface-light/20 min-w-[100px] sticky right-0 z-10">
              Daily Progress
            </th>
          </tr>
        </thead>
        <tbody>
          {dayNames.map((dayName, dayIdx) => {
            const date = weekDates[dayIdx];
            const isToday = date === todayStr;
            const isPast = date < todayStr;
            const shortDay = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dayIdx];

            return (
              <tr
                key={dayName}
                className={`border-t border-surface-light/20 transition-colors ${
                  isToday ? 'bg-primary/8' : 'hover:bg-surface-light/10'
                }`}
              >
                <td className={`p-3 sticky left-0 z-10 ${isToday ? 'bg-primary/8' : 'bg-bg'}`}>
                  <div className="flex items-center gap-2">
                    {isToday && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                    <span className={`text-sm font-medium ${isToday ? 'text-primary-light' : 'text-text'}`}>
                      {dayName}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-muted">{date}</span>
                </td>
                {habits.map((habit) => {
                  // Check if this habit applies on this day
                  const applies =
                    habit.type === 'daily' || (habit.type === 'custom' && habit.days?.includes(shortDay));
                  const key = `${habit._id}_${date}`;
                  const done = logs[key] || false;

                  if (!applies) {
                    return (
                      <td key={habit._id} className="p-3 text-center">
                        <span className="text-text-muted/30 text-xs">—</span>
                      </td>
                    );
                  }

                  return (
                    <td key={habit._id} className="p-3 text-center">
                      <button
                        onClick={() => toggleCell(habit._id, date)}
                        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center mx-auto transition-all duration-200 cursor-pointer ${
                          done
                            ? 'bg-success border-success shadow-sm shadow-success/20'
                            : isPast
                            ? 'border-danger/40 hover:border-danger/60 bg-danger/5'
                            : 'border-surface-light/50 hover:border-primary/50 hover:bg-primary/5'
                        }`}
                      >
                        {done && (
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </td>
                  );
                })}
                
                {/* Calculate Daily Progress */
                (() => {
                  const applicableHabits = habits.filter(
                    (h) => h.type === 'daily' || (h.type === 'custom' && h.days?.includes(shortDay))
                  );
                  
                  const total = applicableHabits.length;
                  const completed = applicableHabits.filter(
                    (h) => logs[`${h._id}_${date}`]
                  ).length;
                  
                  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                  
                  return (
                    <td className={`p-3 text-right sticky right-0 z-10 ${isToday ? 'bg-primary/8' : 'bg-bg'}`}>
                      <div className="flex flex-col items-end justify-center h-full">
                        <span className={`text-sm font-bold ${percentage === 100 ? 'text-success' : percentage >= 50 ? 'text-warning' : 'text-text-muted'}`}>
                          {total > 0 ? `${percentage}%` : '—'}
                        </span>
                        {total > 0 && (
                          <div className="w-16 h-1 bg-surface-light rounded-full mt-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${percentage === 100 ? 'bg-success' : percentage >= 50 ? 'bg-warning' : 'bg-danger'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })()}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
