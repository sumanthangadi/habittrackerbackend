import { useState } from 'react';
import TodayList from '../components/TodayList';
import WeekTable from '../components/WeekTable';
import Calendar from '../components/Calendar';
import Graph from '../components/Graph';
import ToggleGroup from '../components/ToggleGroup';

export default function Dashboard() {
  const [leftView, setLeftView] = useState('today');
  const [rightView, setRightView] = useState('graph');

  return (
    <div className="h-[calc(100vh-3.5rem)] flex">
      {/* ── Left Section ── */}
      <div className="flex-1 flex flex-col border-r border-surface-light/20 min-w-0">
        {/* Left Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-light/15 shrink-0">
          <h2 className="text-lg font-bold text-text">
            {leftView === 'today' ? "Today's Tasks" : 'Weekly Habits'}
          </h2>
          <ToggleGroup
            options={[
              { label: 'Today', value: 'today' },
              { label: 'Week', value: 'week' },
            ]}
            value={leftView}
            onChange={setLeftView}
          />
        </div>

        {/* Left Content */}
        <div className="flex-1 overflow-auto p-6">
          {leftView === 'today' ? <TodayList /> : <WeekTable />}
        </div>
      </div>

      {/* ── Right Section ── */}
      <div className="w-[420px] flex flex-col shrink-0">
        {/* Right Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-light/15 shrink-0">
          <h2 className="text-lg font-bold text-text">Insights</h2>
          <ToggleGroup
            options={[
              { label: 'Calendar', value: 'calendar' },
              { label: 'Graph', value: 'graph' },
            ]}
            value={rightView}
            onChange={setRightView}
          />
        </div>

        {/* Right Content */}
        <div className="flex-1 overflow-auto p-6">
          {rightView === 'calendar' ? <Calendar /> : <Graph />}
        </div>
      </div>
    </div>
  );
}
