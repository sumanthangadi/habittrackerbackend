# Requirements: SumanthHabitTracker

**Defined:** 2026-04-01
**Core Value:** Empower users to build better habits through clear visualization of progress and consistency.

## v1 Requirements

### Backend (API)

- [x] **BACK-01**: CRUD endpoints for Habits (name, time, type, days, active).
- [x] **BACK-02**: Log habit completion with date tracking (HabitLog).
- [x] **BACK-03**: CRUD endpoints for Tasks (title, date, time, type, status).
- [x] **BACK-04**: Endpoint for today's habits and tasks summary.
- [x] **BACK-05**: Endpoint for weekly completion statistics (percentage-based).

### Frontend (Web Dashboard)

- [x] **WEB-01**: Today's view with interactive checklist for habits and tasks.
- [x] **WEB-02**: Weekly table view showing completion across past 7 days.
- [x] **WEB-03**: Weekly performance visualization using Recharts (Graph/Insights).
- [x] **WEB-04**: Admin interface for managing (Add/Edit/Delete) habits and tasks.
- [x] **WEB-05**: Responsive design with Tailwind CSS (Desktop & Mobile-friendly web).

### Mobile App (Expo)

- [ ] **MOB-01**: Stacked layout for Today/Week dashboard views.
- [ ] **MOB-02**: Stacked layout for Calendar/Graph insight views.
- [ ] **MOB-03**: Simplified habit logging interface for mobile use.

## v2 Requirements

### Advanced Features

- **SYNC-01**: Google Calendar integration for tasks.
- **NOTF-01**: Push notifications for habit reminders.
- **AUTH-01**: Multi-user support with secure authentication.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Social Sharing | Project focus is personal productivity and private tracking. |
| Global Leaderboards | Not aligned with the "personal dashboard" goal. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| BACK-01 | Phase 1 | Complete |
| BACK-02 | Phase 1 | Complete |
| BACK-03 | Phase 1 | Complete |
| BACK-04 | Phase 2 | Complete |
| BACK-05 | Phase 2 | Complete |
| WEB-01 | Phase 3 | Complete |
| WEB-02 | Phase 3 | Complete |
| WEB-03 | Phase 4 | Complete |
| WEB-04 | Phase 4 | Complete |
| WEB-05 | Phase 3 | Complete |
| MOB-01 | Phase 5 | Pending |
| MOB-02 | Phase 5 | Pending |
| MOB-03 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-01*
*Last updated: 2026-04-01 after initial definition*
