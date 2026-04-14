import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, KeyboardAvoidingView, ScrollView, Platform, RefreshControl } from 'react-native';
import { getTodayHabits, logHabit, getTasks, updateTask, createTask } from '../services/api';
import { Theme } from '../theme/Theme';

export default function TodayList() {
  const [habits, setHabits] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchData();
  }, []);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const toggleHabit = async (habitId, currentState) => {
    try {
      await logHabit({ habitId, date: today, completed: !currentState });
      setHabits((prev) =>
        prev.map((h) => (h._id === habitId ? { ...h, completed: !currentState } : h))
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
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    try {
      const res = await createTask({
        title: newTaskTitle.trim(),
        date: today,
        status: 'pending',
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  const completedHabits = habits.filter((h) => h.completed).length;
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const totalItems = habits.length + tasks.length;
  const totalCompleted = completedHabits + completedTasks;
  const progress = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={Theme.colors.primary}
            colors={[Theme.colors.primary]} 
          />
        }
      >
        {/* Progress Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>TODAY'S PROGRESS</Text>
          <Text style={styles.cardPercentage}>{progress}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.cardSubtitle}>{totalCompleted}/{totalItems} completed</Text>
      </View>

      {/* Habits Section */}
      {habits.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HABITS ({completedHabits}/{habits.length})</Text>
          {habits.map((habit) => (
            <TouchableOpacity
              key={habit._id}
              activeOpacity={0.7}
              onPress={() => toggleHabit(habit._id, habit.completed)}
              style={[styles.itemRow, habit.completed && styles.itemRowDone]}
            >
              <View style={[styles.checkbox, habit.completed && styles.checkboxDone]}>
                {habit.completed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.itemRef}>
                <Text style={[styles.itemText, habit.completed && styles.itemTextDone]}>
                  {habit.name}
                </Text>
                {(habit.startTime || habit.endTime) && (
                  <Text style={styles.itemTime}>
                    {habit.startTime || 'Anytime'}{habit.endTime ? ` - ${habit.endTime}` : ''}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Tasks Section */}
      {tasks.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TASKS ({completedTasks}/{tasks.length})</Text>
          {tasks.map((task) => (
            <TouchableOpacity
              key={task._id}
              activeOpacity={0.7}
              onPress={() => toggleTask(task._id, task.status)}
              style={[styles.itemRow, task.status === 'done' && styles.itemRowDone]}
            >
              <View style={[styles.checkboxConfig, task.status === 'done' && styles.checkboxDone]}>
                {task.status === 'done' && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.itemRef}>
                <Text style={[styles.itemText, task.status === 'done' && styles.itemTextDone]}>
                  {task.title}
                </Text>
                {(task.startTime || task.endTime) && (
                  <Text style={styles.itemTime}>
                    {task.startTime || 'Anytime'}{task.endTime ? ` - ${task.endTime}` : ''}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {habits.length === 0 && tasks.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Nothing scheduled for today!</Text>
          <Text style={styles.emptySubtitle}>Add habits or tasks from the Admin panel.</Text>
        </View>
      )}

      {/* Quick Add Task */}
      <View style={styles.addTaskContainer}>
        {isAddingTask ? (
          <View style={styles.addForm}>
            <TextInput
              style={styles.input}
              placeholder="e.g., Grocery shopping"
              placeholderTextColor={Theme.colors.textMuted}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              autoFocus
              onSubmitEditing={handleAddTask}
            />
            <TouchableOpacity 
              style={[styles.addButton, !newTaskTitle.trim() && styles.addButtonDisabled]} 
              onPress={handleAddTask}
              disabled={!newTaskTitle.trim()}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => { setIsAddingTask(false); setNewTaskTitle(''); }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.quickAddButton} onPress={() => setIsAddingTask(true)}>
            <Text style={styles.quickAddText}>+ Add new task</Text>
          </TouchableOpacity>
        )}
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Theme.spacing.xl,
    flexGrow: 1,
  },
  card: {
    backgroundColor: Theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: Theme.colors.surfaceLight,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    marginBottom: Theme.spacing.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textMuted,
    letterSpacing: 1,
  },
  cardPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.primary,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: Theme.colors.surfaceLight,
    borderRadius: Theme.borderRadius.full,
    overflow: 'hidden',
    marginVertical: Theme.spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Theme.colors.primaryLight,
    borderRadius: Theme.borderRadius.full,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: Theme.spacing.sm,
  },
  section: {
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textMuted,
    letterSpacing: 1,
    marginBottom: Theme.spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: Theme.colors.surfaceLight,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
  },
  itemRowDone: {
    backgroundColor: Theme.colors.surfaceLight,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 2,
    borderColor: Theme.colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  checkboxConfig: { // Tasks get rounded squares instead of circles
    width: 24,
    height: 24,
    borderRadius: Theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: Theme.colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Theme.spacing.md,
  },
  checkboxDone: {
    backgroundColor: Theme.colors.success,
    borderColor: Theme.colors.success,
  },
  checkmark: {
    color: Theme.colors.successText,
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemRef: {
    flex: 1,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
    color: Theme.colors.text,
  },
  itemTextDone: {
    color: Theme.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  itemTime: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    color: Theme.colors.textMuted,
    marginBottom: Theme.spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    opacity: 0.6,
  },
  addTaskContainer: {
    borderTopWidth: 1,
    borderColor: Theme.colors.surfaceLight,
    paddingTop: Theme.spacing.md,
    marginTop: Theme.spacing.md,
  },
  quickAddButton: {
    borderWidth: 1,
    borderColor: Theme.colors.surfaceLight,
    borderStyle: 'dashed',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
  },
  quickAddText: {
    color: Theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  addForm: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: Theme.colors.surfaceLight,
    color: Theme.colors.text,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.md,
    marginRight: Theme.spacing.sm,
  },
  addButton: {
    backgroundColor: Theme.colors.primary,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 10,
    borderRadius: Theme.borderRadius.md,
    marginRight: Theme.spacing.sm,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: Theme.colors.bg,
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: Theme.colors.textMuted,
  },
});
