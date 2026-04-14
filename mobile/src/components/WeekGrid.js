import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { getHabits, getWeeklyStats, logHabit } from '../services/api';
import { Theme } from '../theme/Theme';

export default function WeekGrid() {
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const scrollRef = useRef(null);
  const cardOffsets = useRef({});
  const todayIndex = useRef(0);

  const today = new Date();
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

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
      const [habitsRes, weekRes] = await Promise.all([getHabits(), getWeeklyStats()]);
      const activeHabits = habitsRes.data.data.filter((h) => h.active);
      setHabits(activeHabits);

      const logMap = {};
      if (weekRes.data.data.habits) {
        weekRes.data.data.habits.forEach((h) => {
          h.completedDays.forEach((date) => {
            logMap[`${h._id}_${date}`] = true;
          });
        });
      }
      setLogs(logMap);

      // After data is ready, scroll to today's card
      const dayIdx = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(
        ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date().getDay()]
      );
      todayIndex.current = dayIdx < 0 ? 0 : dayIdx;
    } catch (err) {
      console.error('Failed to fetch week data:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToToday = () => {
    setTimeout(() => {
      const offset = cardOffsets.current[todayIndex.current];
      if (scrollRef.current && offset !== undefined) {
        scrollRef.current.scrollTo({ y: offset, animated: true });
      }
    }, 300);
  };

  useEffect(() => {
    if (!loading) {
      scrollToToday();
    }
  }, [loading]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const toggleCell = async (habitId, date) => {
    const key = `${habitId}_${date}`;
    const current = logs[key] || false;
    setLogs((prev) => ({ ...prev, [key]: !current }));

    try {
      await logHabit({ habitId, date, completed: !current });
    } catch (err) {
      setLogs((prev) => ({ ...prev, [key]: current }));
      console.error('Failed to toggle:', err);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  if (habits.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No habits yet. Add some from Admin.</Text>
      </View>
    );
  }

  // To fit on a narrow screen, mobile uses Days as the big block, Habits as the rows inside each Day block.
  return (
    <ScrollView 
      ref={scrollRef}
      showsVerticalScrollIndicator={false} 
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          tintColor={Theme.colors.primary}
          colors={[Theme.colors.primary]} 
        />
      }
    >
      {dayNames.map((dayName, dayIdx) => {
        const date = weekDates[dayIdx];
        const isToday = date === todayStr;
        const isPast = date < todayStr;
        const shortDay = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][dayIdx];

        // Calculate Daily Progress
        const applicableHabits = habits.filter(
          (h) => h.type === 'daily' || (h.type === 'custom' && h.days?.includes(shortDay))
        );
        const total = applicableHabits.length;
        const completed = applicableHabits.filter((h) => logs[`${h._id}_${date}`]).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return (
          <View 
            key={dayName} 
            style={[styles.dayCard, isToday && styles.dayCardToday]}
            onLayout={(e) => {
              cardOffsets.current[dayIdx] = e.nativeEvent.layout.y;
            }}
          >
            {/* Day Header */}
            <View style={styles.dayHeader}>
              <View>
                <Text style={[styles.dayName, isToday && styles.dayNameToday]}>{dayName}</Text>
                <Text style={styles.dayDate}>{date}</Text>
              </View>
              {total > 0 && (
                <View style={styles.progressBox}>
                  <Text style={[styles.progressNumber, percentage === 100 && styles.progressNumberDone]}>
                    {percentage}%
                  </Text>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${percentage}%` }, percentage === 100 && styles.progressFillDone]} />
                  </View>
                </View>
              )}
            </View>

            {/* Habits for this day */}
            <View style={styles.habitList}>
              {habits.map((habit) => {
                const applies = habit.type === 'daily' || (habit.type === 'custom' && habit.days?.includes(shortDay));
                if (!applies) return null;

                const key = `${habit._id}_${date}`;
                const done = logs[key] || false;

                return (
                  <View key={habit._id} style={styles.habitRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.habitName, done && styles.habitNameDone]}>{habit.name}</Text>
                      {(habit.startTime || habit.endTime) && (
                        <Text style={styles.habitTime}>
                          {habit.startTime ? format12h(habit.startTime) : 'Anytime'}{habit.endTime ? ` - ${format12h(habit.endTime)}` : ''}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => toggleCell(habit._id, date)}
                      style={[
                        styles.toggleBox,
                        done ? styles.toggleBoxDone : isPast ? styles.toggleBoxMissed : styles.toggleBoxPending
                      ]}
                    >
                      {done && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                  </View>
                );
              })}
              {total === 0 && (
                <Text style={styles.noHabitsText}>No habits scheduled</Text>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.xl,
  },
  container: {
    paddingBottom: Theme.spacing.xl,
  },
  emptyText: {
    color: Theme.colors.textMuted,
    fontSize: 16,
  },
  dayCard: {
    backgroundColor: Theme.colors.surfaceCard,
    borderWidth: 1,
    borderColor: Theme.colors.surfaceLight,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    overflow: 'hidden',
  },
  dayCardToday: {
    borderColor: Theme.colors.primaryLight,
    borderWidth: 1.5,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: Theme.colors.surfaceLight,
    padding: Theme.spacing.md,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text,
  },
  dayNameToday: {
    color: Theme.colors.primary,
  },
  dayDate: {
    fontSize: 12,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  progressBox: {
    alignItems: 'flex-end',
  },
  progressNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Theme.colors.text,
  },
  progressNumberDone: {
    color: Theme.colors.successText,
  },
  progressTrack: {
    width: 60,
    height: 4,
    backgroundColor: Theme.colors.bg,
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Theme.colors.primary,
  },
  progressFillDone: {
    backgroundColor: Theme.colors.successText,
  },
  habitList: {
    padding: Theme.spacing.md,
  },
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.surfaceLight,
  },
  habitName: {
    fontSize: 14,
    color: Theme.colors.text,
    flex: 1,
  },
  habitNameDone: {
    color: Theme.colors.textMuted,
  },
  habitTime: {
    fontSize: 10,
    color: Theme.colors.textMuted,
    marginTop: 1,
  },
  toggleBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBoxDone: {
    backgroundColor: Theme.colors.success,
    borderColor: Theme.colors.success,
  },
  toggleBoxMissed: {
    borderColor: Theme.colors.danger,
    backgroundColor: Theme.colors.bg,
  },
  toggleBoxPending: {
    borderColor: Theme.colors.surfaceLight,
    backgroundColor: Theme.colors.bg,
  },
  checkmark: {
    color: Theme.colors.successText,
    fontSize: 14,
    fontWeight: 'bold',
  },
  noHabitsText: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    fontStyle: 'italic',
  },
});
