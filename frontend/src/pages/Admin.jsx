import { useState, useEffect } from 'react';
import { getHabits, createHabit, updateHabit, deleteHabit, getTasks, createTask, updateTask, deleteTask } from '../services/api';

export default function Admin() {
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('habits');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [habitsRes, tasksRes] = await Promise.all([getHabits(), getTasks()]);
      setHabits(habitsRes.data.data);
      setTasks(tasksRes.data.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormData({});
  };

  const openHabitForm = (habit = null) => {
    setActiveTab('habits');
    setEditingItem(habit);
    setFormData(
      habit
        ? { name: habit.name, startTime: habit.startTime || '', endTime: habit.endTime || '', type: habit.type, days: habit.days || [], active: habit.active }
        : { name: '', startTime: '', endTime: '', type: 'daily', days: [], active: true }
    );
    setShowForm(true);
  };

  const openTaskForm = (task = null) => {
    setActiveTab('tasks');
    setEditingItem(task);
    setFormData(
      task
        ? { title: task.title, date: task.date, time: task.time || '', status: task.status }
        : { title: '', date: today, time: '', status: 'pending' }
    );
    setShowForm(true);
  };

  const handleHabitSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateHabit(editingItem._id, formData);
      } else {
        await createHabit(formData);
      }
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Failed to save habit:', err);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateTask(editingItem._id, formData);
      } else {
        await createTask(formData);
      }
      resetForm();
      fetchData();
    } catch (err) {
      console.error('Failed to save task:', err);
    }
  };

  const handleDeleteHabit = async (id) => {
    try {
      await deleteHabit(id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete habit:', err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const toggleDay = (day) => {
    setFormData((prev) => ({
      ...prev,
      days: prev.days?.includes(day) ? prev.days.filter((d) => d !== day) : [...(prev.days || []), day],
    }));
  };

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
          Admin
        </h1>
        <button
          onClick={() => (activeTab === 'habits' ? openHabitForm() : openTaskForm())}
          className="px-4 py-2 bg-primary hover:bg-primary-dark text-bg rounded-xl text-sm font-medium transition-all shadow-lg shadow-primary/25 cursor-pointer"
        >
          + Add {activeTab === 'habits' ? 'Habit' : 'Task'}
        </button>
      </div>

      {/* Tab Toggle */}
      <div className="inline-flex bg-surface-card rounded-xl border border-surface-light/30 p-1">
        {['habits', 'tasks'].map((tab) => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); resetForm(); }}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer capitalize ${
              activeTab === tab
                ? 'bg-primary text-bg shadow-lg shadow-primary/25'
                : 'text-text-muted hover:text-text hover:bg-surface-light/30'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="bg-surface-card rounded-2xl border border-surface-light/30 p-5 space-y-4">
          <h3 className="text-lg font-semibold text-text">
            {editingItem ? 'Edit' : 'New'} {activeTab === 'habits' ? 'Habit' : 'Task'}
          </h3>

          <form onSubmit={activeTab === 'habits' ? handleHabitSubmit : handleTaskSubmit} className="space-y-4">
            {activeTab === 'habits' ? (
              <>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-surface-light/40 border border-surface-light/50 rounded-xl px-4 py-2.5 text-text placeholder-text-muted/50 focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g., Morning workout"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm text-text-muted mb-1">Start Time</label>
                    <input
                      type="time"
                      value={formData.startTime || ''}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full bg-surface-light/40 border border-surface-light/50 rounded-xl px-4 py-2.5 text-text focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm text-text-muted mb-1">End Time</label>
                    <input
                      type="time"
                      value={formData.endTime || ''}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full bg-surface-light/40 border border-surface-light/50 rounded-xl px-4 py-2.5 text-text focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Type</label>
                  <select
                    value={formData.type || 'daily'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-surface-light/40 border border-surface-light/50 rounded-xl px-4 py-2.5 text-text focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="daily">Daily</option>
                    <option value="custom">Custom days</option>
                  </select>
                </div>
                {formData.type === 'custom' && (
                  <div>
                    <label className="block text-sm text-text-muted mb-2">Days</label>
                    <div className="flex gap-2 flex-wrap">
                      {daysOfWeek.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            formData.days?.includes(day)
                              ? 'bg-primary text-bg'
                              : 'bg-surface-light/40 text-text-muted hover:bg-surface-light/60'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-surface-light/40 border border-surface-light/50 rounded-xl px-4 py-2.5 text-text placeholder-text-muted/50 focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g., Grocery shopping"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-surface-light/40 border border-surface-light/50 rounded-xl px-4 py-2.5 text-text focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1">Time (optional)</label>
                  <input
                    type="text"
                    value={formData.time || ''}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-surface-light/40 border border-surface-light/50 rounded-xl px-4 py-2.5 text-text placeholder-text-muted/50 focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g., 3:00 PM"
                  />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-bg rounded-xl text-sm font-medium transition-all shadow-lg shadow-primary/25 cursor-pointer"
              >
                {editingItem ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 bg-surface-light/40 hover:bg-surface-light/60 text-text-muted rounded-xl text-sm font-medium transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lists */}
      {activeTab === 'habits' ? (
        <div className="space-y-2">
          {habits.length === 0 && (
            <p className="text-center text-text-muted py-8">No habits yet. Create one above!</p>
          )}
          {habits.map((habit) => (
            <div
              key={habit._id}
              className="flex items-center justify-between p-4 bg-surface-card rounded-xl border border-surface-light/30"
            >
              <div>
                <p className="font-medium text-text">{habit.name}</p>
                <p className="text-xs text-text-muted">
                  {habit.type === 'daily' ? 'Every day' : habit.days?.join(', ')}
                  {(habit.startTime || habit.endTime) && (
                    <> • {habit.startTime || 'Anytime'}{habit.endTime ? ` - ${habit.endTime}` : ''}</>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openHabitForm(habit)}
                  className="px-3 py-1.5 text-xs font-medium text-primary-light hover:bg-primary/10 rounded-lg transition-all cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteHabit(habit._id)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-danger/80 hover:bg-danger rounded-lg transition-all cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.length === 0 && (
            <p className="text-center text-text-muted py-8">No tasks yet. Create one above!</p>
          )}
          {tasks.map((task) => (
            <div
              key={task._id}
              className="flex items-center justify-between p-4 bg-surface-card rounded-xl border border-surface-light/30"
            >
              <div>
                <p className="font-medium text-text">{task.title}</p>
                <p className="text-xs text-text-muted">
                  {task.date} {task.time ? `• ${task.time}` : ''} • {task.status}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openTaskForm(task)}
                  className="px-3 py-1.5 text-xs font-medium text-primary-light hover:bg-primary/10 rounded-lg transition-all cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="px-3 py-1.5 text-xs font-medium text-white bg-danger/80 hover:bg-danger rounded-lg transition-all cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
