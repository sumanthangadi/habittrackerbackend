# SumanthHabitTracker

## What This Is

A full-stack, cross-platform personal productivity dashboard for habit tracking and task management. It provides a visual way to manage daily habits, log completions, and track progress via weekly analytics and interactive visualizations.

## Core Value

Empower users to build better habits through clear visualization of progress and consistency.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Build a robust backend API for habit and task CRUD.
- [ ] Implement a web dashboard for daily management and weekly oversight.
- [ ] Create a mobile application (React Native) for portable habit tracking.
- [ ] Provide data visualizations for weekly performance tracking.

### Out of Scope

- Multi-user support — Current goal is personal dashboard.
- Social sharing — Local productivity focus.

## Context

- Building as a personal portfolio project.
- Tech stack includes Node.js, Express, MongoDB, React, and React Native (Expo).
- Recharts for visualizations.

## Constraints

- **Tech Stack**: Must use Node.js/Express, MongoDB, React (Vite), React Native (Expo), Tailwind CSS.
- **Project Type**: Green field development (starting from scratch).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Node.js + MongoDB | Scalable and flexible for habit logging and task management. | — Pending |
| React Native + Expo | Rapid development for mobile with shared component logic. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-01 after initialization*
