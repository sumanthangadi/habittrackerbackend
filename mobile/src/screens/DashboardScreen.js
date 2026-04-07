import React, { useState } from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ToggleGroup from '../components/ToggleGroup';
import TodayList from '../components/TodayList';
import WeekGrid from '../components/WeekGrid';
import { Theme } from '../theme/Theme';

export default function DashboardScreen() {
  const [view, setView] = useState('today');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar hidden={true} />
      <View style={styles.container}>
        {/* Header Segmented Control */}
        <View style={styles.header}>
          <Text style={styles.title}>Habits</Text>
          <ToggleGroup
            options={[
              { label: 'Today', value: 'today' },
              { label: 'Week', value: 'week' },
            ]}
            value={view}
            onChange={setView}
          />
        </View>

        {/* Dynamic Content */}
        <View style={styles.content}>
          {view === 'today' ? <TodayList /> : <WeekGrid />}
        </View>
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
    backgroundColor: Theme.colors.bg,
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
    flex: 1,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.lg,
  },
});
