import { useState, useEffect } from 'react';
import { getTodayHabits, logHabit, getTasks, updateTask, createTask } from '../services/api';

export default function TodayList() {
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const fetchData = async () => {
    try {
      const [habitsRes, tasksRes] = await Promise.all([
        getTodayHabits(),
        getTasks({ date: today }),
      ]);
      setHabits(habitsRes.data.data);
      setTasks(tasksRes.data.data);
    } catch (err) {
      console.error('Failed to fetch today data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleHabit = async (habitId, currentState) => {
    try {
      await logHabit({ habitId, date: today, completed: !currentState });
      setHabits((prev) =>
        prev.map((h) =>
          h._id === habitId ? { ...h, completed: !currentState } : h
        )
      );
    } catch (err) {
      console.error('Failed to toggle habit:', err);
    }
  };

  const toggleTask = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'done' ? 'pending' : 'done';
    try {
      await updateTask(taskId, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) =>
          t._id === taskId ? { ...t, status: newStatus } : t
        )
      );
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    try {
      const res = await createTask({
        title: newTaskTitle.trim(),
        date: today,
        status: 'pending'
      });
      setTasks((prev) => [...prev, res.data.data]);
      setNewTaskTitle('');
      setIsAddingTask(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const completedHabits = habits.filter((h) => h.completed).length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const totalItems = habits.length + tasks.length;
  const totalCompleted = completedHabits + completedTasks;
  const progress = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="bg-surface-card rounded-2xl p-5 border border-surface-light/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">Today's Progress</h3>
          <span className="text-2xl font-bold text-primary-light">{progress}%</span>
        </div>
        <div className="w-full h-3 bg-surface-light rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-text-muted mt-2">{totalCompleted}/{totalItems} completed</p>
      </div>

      {/* Habits Section */}
      {habits.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Habits ({completedHabits}/{habits.length})
          </h3>
          <div className="space-y-2">
            {habits.map((habit) => (
              <button
                key={habit._id}
                onClick={() => toggleHabit(habit._id, habit.completed)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer group ${
                  habit.completed
                    ? 'bg-success/10 border-success/30 hover:bg-success/15'
                    : 'bg-surface-card border-surface-light/30 hover:border-primary/40 hover:bg-surface-light/20'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                    habit.completed
                      ? 'bg-success border-success'
                      : 'border-text-muted group-hover:border-primary'
                  }`}
                >
                  {habit.completed && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-medium transition-all ${habit.completed ? 'line-through text-text-muted' : 'text-text'}`}>
                    {habit.name}
                  </p>
                  {(habit.startTime || habit.endTime) && (
                    <p className="text-xs text-text-muted mt-0.5">
                      {habit.startTime || 'Anytime'}{habit.endTime ? ` - ${habit.endTime}` : ''}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tasks Section */}
      {tasks.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            Tasks ({completedTasks}/{tasks.length})
          </h3>
          <div className="space-y-2">
            {tasks.map((task) => (
              <button
                key={task._id}
                onClick={() => toggleTask(task._id, task.status)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer group ${
                  task.status === 'done'
                    ? 'bg-success/10 border-success/30 hover:bg-success/15'
                    : 'bg-surface-card border-surface-light/30 hover:border-accent/40 hover:bg-surface-light/20'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
                    task.status === 'done'
                      ? 'bg-success border-success'
                      : 'border-text-muted group-hover:border-accent'
                  }`}
                >
                  {task.status === 'done' && (
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-medium transition-all ${task.status === 'done' ? 'line-through text-text-muted' : 'text-text'}`}>
                    {task.title}
                  </p>
                  {task.time && (
                    <p className="text-xs text-text-muted mt-0.5">{task.time}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {habits.length === 0 && tasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-muted text-lg">Nothing scheduled for today!</p>
          <p className="text-text-muted/60 text-sm mt-1">Add habits or tasks from the Admin panel.</p>
        </div>
      )}

      {/* Add Task Quick Form */}
      <div className="pt-4 border-t border-surface-light/20">
        {isAddingTask ? (
          <form onSubmit={handleAddTask} className="flex gap-2">
            <input
              type="text"
              autoFocus
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="e.g., Grocery shopping"
              className="flex-1 bg-surface-light/40 border border-surface-light/50 rounded-xl px-4 py-2.5 text-text placeholder-text-muted/50 focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim()}
              className="px-4 py-2 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-bg rounded-xl text-sm font-medium transition-all shadow-lg shadow-primary/25 cursor-pointer"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingTask(false);
                setNewTaskTitle('');
              }}
              className="px-4 py-2 bg-surface-light/40 hover:bg-surface-light/60 text-text-muted rounded-xl text-sm font-medium transition-all cursor-pointer"
            >
              Cancel
            </button>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingTask(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-surface-light/50 hover:border-primary/50 hover:bg-primary/5 text-text-muted rounded-xl text-sm font-medium transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add new task
          </button>
        )}
      </div>
    </div>
  );
}
