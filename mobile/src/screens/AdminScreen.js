import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { Theme } from '../theme/Theme';
import ToggleGroup from '../components/ToggleGroup';
import { createHabit, createTask, getHabits, getTasks, deleteHabit, deleteTask } from '../services/api';

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState('habits');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [type, setType] = useState('daily');
  const [days, setDays] = useState([]);

  const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day) => {
    setDays((prev) => 
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      if (activeTab === 'habits') {
        const res = await getHabits();
        setItems(res.data.data);
      } else {
        const res = await getTasks();
        setItems(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const handleDelete = (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            if (activeTab === 'habits') {
              await deleteHabit(id);
            } else {
              await deleteTask(id);
            }
            fetchItems();
          } catch (err) {
            console.error('Failed to delete item:', err);
            Alert.alert('Error', 'Failed to delete item');
          }
        }
      }
    ]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name/Title is required');
      return;
    }

    try {
      if (activeTab === 'habits') {
        const payload = {
          name: name.trim(),
          time: time.trim() || undefined,
          type,
          days: type === 'custom' ? days : undefined,
          active: true,
        };
        await createHabit(payload);
        Alert.alert('Success', 'Habit added successfully');
      } else {
        const today = new Date().toISOString().split('T')[0];
        const payload = {
          title: name.trim(),
          time: time.trim() || undefined,
          date: today,
          status: 'pending',
        };
        await createTask(payload);
        Alert.alert('Success', 'Task added to Today');
      }
      
      // Reset form
      setName('');
      setTime('');
      setType('daily');
      setDays([]);
      
      // Refresh list
      fetchItems();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to save item');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar hidden={true} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Admin</Text>
          <ToggleGroup
            options={[
              { label: 'Habits', value: 'habits' },
              { label: 'Tasks', value: 'tasks' },
            ]}
            value={activeTab}
            onChange={setActiveTab}
          />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              Create New {activeTab === 'habits' ? 'Habit' : 'Task'}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{activeTab === 'habits' ? 'Habit Name' : 'Task Title'}</Text>
              <TextInput
                style={styles.input}
                placeholder={activeTab === 'habits' ? 'e.g., Read for 30 mins' : 'e.g., Buy groceries'}
                placeholderTextColor={Theme.colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Time (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 8:00 AM"
                placeholderTextColor={Theme.colors.textMuted}
                value={time}
                onChangeText={setTime}
              />
            </View>

            {activeTab === 'habits' && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Frequency</Text>
                <View style={styles.frequencyRow}>
                  <TouchableOpacity
                    style={[styles.freqButton, type === 'daily' && styles.freqButtonActive]}
                    onPress={() => setType('daily')}
                  >
                    <Text style={[styles.freqText, type === 'daily' && styles.freqTextActive]}>Every day</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.freqButton, type === 'custom' && styles.freqButtonActive]}
                    onPress={() => setType('custom')}
                  >
                    <Text style={[styles.freqText, type === 'custom' && styles.freqTextActive]}>Specific days</Text>
                  </TouchableOpacity>
                </View>

                {type === 'custom' && (
                  <View style={styles.daysGrid}>
                    {DAYS_OF_WEEK.map((day) => {
                      const selected = days.includes(day);
                      return (
                        <TouchableOpacity
                          key={day}
                          style={[styles.dayButton, selected && styles.dayButtonSelected]}
                          onPress={() => toggleDay(day)}
                        >
                          <Text style={[styles.dayText, selected && styles.dayTextSelected]}>{day}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Create {activeTab === 'habits' ? 'Habit' : 'Task'}</Text>
            </TouchableOpacity>
          </View>

          {/* List Section */}
          <View style={styles.listContainer}>
            <Text style={styles.listHeader}>Existing {activeTab === 'habits' ? 'Habits' : 'Tasks'}</Text>
            {loading ? (
              <ActivityIndicator size="small" color={Theme.colors.primary} style={{ marginTop: 20 }} />
            ) : items.length === 0 ? (
              <Text style={styles.emptyText}>No items found.</Text>
            ) : (
              items.map((item) => (
                <View key={item._id} style={styles.listItem}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{activeTab === 'habits' ? item.name : item.title}</Text>
                    {item.time && <Text style={styles.itemTime}>{item.time}</Text>}
                    {activeTab === 'habits' && (
                      <Text style={styles.itemDetails}>
                        {item.type === 'daily' ? 'Every day' : item.days?.join(', ')}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={() => handleDelete(item._id)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.bg,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
    paddingBottom: Theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.surfaceLight,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  content: {
    padding: Theme.spacing.lg,
  },
  card: {
    backgroundColor: Theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: Theme.colors.surfaceLight,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: Theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.textMuted,
    marginBottom: Theme.spacing.sm,
  },
  input: {
    backgroundColor: Theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: Theme.colors.surfaceLight,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 12,
    color: Theme.colors.text,
    fontSize: 16,
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: Theme.spacing.sm,
  },
  freqButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: Theme.colors.surfaceLight,
    borderRadius: Theme.borderRadius.sm,
  },
  freqButtonActive: {
    backgroundColor: Theme.colors.primary,
  },
  freqText: {
    color: Theme.colors.textMuted,
    fontWeight: '500',
  },
  freqTextActive: {
    color: Theme.colors.bg,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Theme.spacing.md,
  },
  dayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Theme.colors.surfaceLight,
    borderRadius: Theme.borderRadius.sm,
  },
  dayButtonSelected: {
    backgroundColor: Theme.colors.primary,
  },
  dayText: {
    color: Theme.colors.textMuted,
    fontSize: 12,
  },
  dayTextSelected: {
    color: Theme.colors.bg,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Theme.colors.primary,
    paddingVertical: 14,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginTop: Theme.spacing.md,
  },
  saveButtonText: {
    color: Theme.colors.bg,
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    marginTop: Theme.spacing.xl,
  },
  listHeader: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
  },
  emptyText: {
    color: Theme.colors.textMuted,
    fontStyle: 'italic',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: Theme.colors.surfaceLight,
    borderRadius: Theme.borderRadius.md,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
  },
  itemInfo: {
    flex: 1,
    marginRight: Theme.spacing.md,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: Theme.colors.text,
  },
  itemTime: {
    fontSize: 14,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  itemDetails: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 4,
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Theme.colors.danger,
    borderRadius: Theme.borderRadius.sm,
  },
  deleteButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
