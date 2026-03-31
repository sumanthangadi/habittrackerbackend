import { useState } from 'react';
import TodayList from '../components/TodayList';
import WeekTable from '../components/WeekTable';
import Graph from '../components/Graph';
import ToggleGroup from '../components/ToggleGroup';

export default function Dashboard() {
  const [view, setView] = useState('today');
  const [insightView, setInsightView] = useState('calendar');

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* View Toggle */}
      <ToggleGroup
        options={[
          { label: 'Today', value: 'today' },
          { label: 'Week', value: 'week' },
        ]}
        value={view}
        onChange={setView}
      />

      {/* Main Content */}
      {view === 'today' ? <TodayList /> : (
        <div className="space-y-6">
          <WeekTable />
          {/* Insight Toggle */}
          <ToggleGroup
            options={[
              { label: '📊 Table', value: 'calendar' },
              { label: '📈 Graph', value: 'graph' },
            ]}
            value={insightView}
            onChange={setInsightView}
          />
          {insightView === 'graph' && <Graph />}
        </div>
      )}
    </div>
  );
}
