import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../theme/Theme';
import ToggleGroup from '../components/ToggleGroup';
import { createHabit, createTask, getHabits, getTasks, deleteHabit, deleteTask } from '../services/api';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AdminScreen() {
  const [activeTab, setActiveTab] = useState('habits');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [type, setType] = useState('daily');
  const [days, setDays] = useState([]);

  const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const toggleDay = (day) => {
    setDays((prev) => 
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const onStartTimeChange = (event, selectedDate) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const h = selectedDate.getHours().toString().padStart(2, '0');
      const m = selectedDate.getMinutes().toString().padStart(2, '0');
      setStartTime(`${h}:${m}`);
    }
  };

  const onEndTimeChange = (event, selectedDate) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const h = selectedDate.getHours().toString().padStart(2, '0');
      const m = selectedDate.getMinutes().toString().padStart(2, '0');
      setEndTime(`${h}:${m}`);
    }
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
          startTime: startTime || undefined,
          endTime: endTime || undefined,
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
          startTime: startTime || undefined, // Tasks also benefit from time pickers now
          endTime: endTime || undefined,
          date: today,
          status: 'pending',
        };
        await createTask(payload);
        Alert.alert('Success', 'Task added to Today');
      }
      
      // Reset form
      setName('');
      setStartTime('');
      setEndTime('');
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

            <View style={styles.timeRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Start Time</Text>
                <TouchableOpacity 
                  style={styles.timeInput} 
                  onPress={() => setShowStartPicker(true)}
                >
                  <Text style={[styles.timeInputText, !startTime && { color: Theme.colors.textMuted }]}>
                    {startTime || '--:--'}
                  </Text>
                </TouchableOpacity>
                {showStartPicker && (
                  <DateTimePicker
                    value={startTime ? new Date(new Date().setHours(startTime.split(':')[0], startTime.split(':')[1])) : new Date()}
                    mode="time"
                    is24Hour={true}
                    onChange={onStartTimeChange}
                  />
                )}
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: Theme.spacing.md }]}>
                <Text style={styles.label}>End Time</Text>
                <TouchableOpacity 
                  style={styles.timeInput} 
                  onPress={() => setShowEndPicker(true)}
                >
                  <Text style={[styles.timeInputText, !endTime && { color: Theme.colors.textMuted }]}>
                    {endTime || '--:--'}
                  </Text>
                </TouchableOpacity>
                {showEndPicker && (
                  <DateTimePicker
                    value={endTime ? new Date(new Date().setHours(endTime.split(':')[0], endTime.split(':')[1])) : new Date()}
                    mode="time"
                    is24Hour={true}
                    onChange={onEndTimeChange}
                  />
                )}
              </View>
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
                    {(item.startTime || item.endTime) && (
                      <Text style={styles.itemTime}>
                        {item.startTime || 'Anytime'}{item.endTime ? ` - ${item.endTime}` : ''}
                      </Text>
                    )}
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
  timeRow: {
    flexDirection: 'row',
  },
  timeInput: {
    backgroundColor: Theme.colors.surfaceLight,
    borderWidth: 1,
    borderColor: Theme.colors.surfaceLight,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  timeInputText: {
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
