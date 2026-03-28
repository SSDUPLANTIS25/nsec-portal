# Monday.com → NSEC Portal Data Mapping

## Overview

This document maps Monday.com board schemas (NSEC workspace) to the portal's UI components. The portal will query Monday.com via API to replace all mock data.

---

## 1. Tasks Page ← Requests & Tasks Board

**Board ID:** `4015603070` | **Items:** 9,553

### Column Mapping

| Portal Field     | Monday Column         | Column ID (approx) | Type     | Notes                                    |
|------------------|-----------------------|---------------------|----------|------------------------------------------|
| `title`          | Name                  | `name`              | name     | Task title                               |
| `status`         | Status                | `status`            | status   | Labels: Working on it, Done, Stuck, Pending, New, Waiting for approval, Ordered |
| `assignee`       | Assignee              | `person`            | people   | Person assigned to the task              |
| `dueDate`        | Due date              | `date`              | date     | Task deadline                            |
| `priority`       | Priority              | `priority`          | status   | If available; otherwise derive from status/overdue |
| `project`        | Category / Group      | `category`          | status   | Or derive from group name                |
| `description`    | Request Description   | (long_text col)     | long_text| Full task description                    |
| `projectManager` | PM                    | `person` (PM col)   | people   | Project manager for the task             |

### Status Mapping

| Monday.com Status       | Portal Status   |
|-------------------------|-----------------|
| New                     | `not_viewed`    |
| Working on it           | `in_progress`   |
| Stuck                   | `in_progress` (flagged) |
| Pending                 | `pending`       |
| Waiting for approval    | `pending`       |
| Ordered                 | `pending`       |
| Done                    | `complete`      |
| *(past due date + not Done)* | `overdue`  |

### Groups (Filter Categories)

- Just Added
- Working on it
- Project-related
- Done
- (others)

---

## 2. Dashboard / Projects ← Project Index Board

**Board ID:** `1925757448` | **Items:** 3,243 | **Columns:** 145

### Key Column Mapping

| Portal Feature           | Monday Column              | Type      | Notes                              |
|--------------------------|----------------------------|-----------|------------------------------------|
| Project name             | Name                       | name      |                                    |
| Project manager          | Project Manager            | people    |                                    |
| Company/client           | Company Name               | text      |                                    |
| Job number               | Job Number                 | text      | Unique project identifier          |
| Location                 | Job Location               | location  | Address for map/routing            |
| Install window           | Install Window             | timeline  | Start–end date range               |
| Current stage            | Current Stage              | status    | Pipeline stage                     |
| Lead status              | Lead Status                | status    |                                    |
| Proposal status          | Proposal Status            | status    |                                    |
| Installation status      | Installation Status        | status    |                                    |
| Revenue/income           | Income                     | numbers   | For KPI cards                      |
| Total price              | Total Price                | formula   | For revenue pipeline KPI           |
| Balance                  | Balance                    | formula   | Outstanding balance                |
| Estimator                | Estimator                  | people    |                                    |
| Designer                 | Designer                   | people    |                                    |
| Admin                    | Admin                      | people    |                                    |
| Systems/products         | USAC Systems               | tags      | What products are on this project  |
| Description              | Project description, Notes | long_text |                                    |

### Pipeline Groups → Dashboard Sections

| Monday Group                      | Portal Use                            |
|-----------------------------------|---------------------------------------|
| LEAD DEVELOPMENT                  | Sales pipeline / lead count           |
| ISSUE PROPOSAL                    | Proposals to draft                    |
| PROPOSAL FOLLOW UP TO CLOSE       | Active proposals / follow-up needed   |
| PRE RELEASE                       | Sold, awaiting release                |
| RELEASED                          | Active projects (main dashboard)      |
| CLOSE OUT                         | Wrapping up                           |
| Submitted for Production          | In production                         |
| PROJECT ARCHIVE                   | Completed projects                    |
| PROPOSAL ARCHIVE / LEAD ARCHIVE   | Historical data                       |

### KPI Card Sources

| KPI Card           | Source                                                         |
|--------------------|----------------------------------------------------------------|
| Active Installs    | Count of items in RELEASED + Submitted for Production groups   |
| Revenue Pipeline   | Sum of `Total Price` for PROPOSAL FOLLOW UP TO CLOSE group     |
| Overdue Tasks      | Cross-reference with Requests & Tasks (overdue count)          |
| Upcoming Events    | Count from Meetings Board + Installation board this week       |

---

## 3. Installations / Alerts ← Installation Board

**Board ID:** `2154290563` | **Items:** 3,527

### Column Mapping

| Portal Feature        | Monday Column         | Type           | Notes                          |
|-----------------------|-----------------------|----------------|--------------------------------|
| Install title         | Name                  | name           |                                |
| Job status            | Job Status            | status         | In Progress, Phase Done, Totally Complete |
| Date                  | Date                  | date           | Install date                   |
| Project manager       | Project Manager       | people         |                                |
| Installer             | Installer             | people         |                                |
| Crew                  | Crew                  | people         | Crew members assigned          |
| Crew size             | Crew Size             | numbers        |                                |
| Total hours           | Total Hours           | numbers        |                                |
| PM score              | PM Score              | numbers/rating |                                |
| Production rating     | Production Rating     | numbers/rating |                                |
| Admin status          | Admin Status          | status         |                                |
| Photos                | Pictures              | file           | Install photos                 |

### Alert Generation Logic

- **Urgent:** Install date is past + Job Status != "Totally Complete"
- **Warning:** Install date is within 2 days + dependencies not met (e.g., materials not received per Ordering board)
- **Info:** Upcoming installs this week

---

## 4. Calendar ← Meetings Board

**Board ID:** `18397692294` | **Items:** 70

### Column Mapping

| Portal Field    | Monday Column     | Type      | Notes                    |
|-----------------|-------------------|-----------|--------------------------|
| Event title     | Name              | name      |                          |
| Date            | Meeting Date      | date      |                          |
| Start time      | Start Time        | hour      |                          |
| End time        | End Time          | hour      |                          |
| Attendees       | Attendees         | people    |                          |
| Agenda          | Agenda            | long_text |                          |
| Notes           | Meeting Notes     | long_text |                          |
| Teams link      | Teams Call Link   | link      |                          |
| Note taker      | Note Taker        | people    |                          |

### Calendar Event Types

The portal calendar combines multiple sources:

| Source Board     | Event Type      | Color Code     |
|------------------|-----------------|----------------|
| Meetings Board   | `meeting`       | Blue           |
| Installation     | `installation`  | Green          |
| Ordering (ETA)   | `delivery`      | Orange         |
| Project Index    | `deadline`      | Red            |

---

## 5. Team / Employee Directory ← Employee Directory Board

**Board ID:** `2098978777` | **Items:** 69

### Column Mapping

| Portal Feature   | Monday Column    | Type     | Notes                            |
|------------------|------------------|----------|----------------------------------|
| Name             | Name             | name     |                                  |
| Department       | Department       | status   | Welding, Remote, PM-Sales, Install, HUB, etc. |
| Manager          | Manager          | people   |                                  |
| Email            | Email            | email    |                                  |
| Phone            | Phone            | phone    |                                  |
| Status           | Status           | status   | Current, Past, Onboarding        |
| Start date       | Start date       | date     |                                  |
| Location         | Location         | location |                                  |
| PTO              | PTO              | numbers  |                                  |

### Role Derivation

| Department Values                | Portal Role    |
|----------------------------------|----------------|
| Install, Welding                 | `field`        |
| PM-Sales, HUB, Remote, Admin    | `office`       |
| *(Seth Duplantis / Owner title)* | `management`   |

---

## 6. Orders / Procurement ← Ordering Board

**Board ID:** `7436908659` | **Items:** 753

### Column Mapping

| Portal Feature     | Monday Column       | Type     | Notes                         |
|--------------------|---------------------|----------|-------------------------------|
| Order name         | Name                | name     |                               |
| Status             | Status              | status   | Sent, Received, Late, Canceled, Confirmed, etc. |
| Materials          | Materials           | text     |                               |
| Vendor             | Standard Vendors    | status   |                               |
| Date ordered       | Date Ordered        | date     |                               |
| ETA                | ETA                 | date     | → Calendar delivery events    |
| Vendor order #     | Vendor Order #      | text     |                               |
| Tracking status    | Tracking Status     | status   |                               |

---

## API Integration Architecture

```
┌─────────────────────────────────────────┐
│           NSEC Portal (Next.js)         │
│                                         │
│  /api/monday/tasks      → Tasks page    │
│  /api/monday/projects   → Dashboard     │
│  /api/monday/installs   → Alerts/Dash   │
│  /api/monday/calendar   → Calendar      │
│  /api/monday/team       → Team section  │
│  /api/monday/orders     → Orders view   │
│                                         │
│  lib/monday-client.ts   → GraphQL SDK   │
│  lib/monday-types.ts    → Type defs     │
│  lib/data-transforms.ts → Mon→Portal    │
└──────────────────┬──────────────────────┘
                   │ GraphQL API
                   ▼
          monday.com API v2
          (API key via env var)
```

### Environment Variables

```env
MONDAY_API_KEY=       # Monday.com API token
MONDAY_WORKSPACE_ID=5107363
```

### Board IDs (Constants)

```typescript
export const BOARD_IDS = {
  REQUESTS_TASKS: "4015603070",
  PROJECT_INDEX: "1925757448",
  INSTALLATION: "2154290563",
  EMPLOYEE_DIRECTORY: "2098978777",
  ORDERING: "7436908659",
  MEETINGS: "18397692294",
} as const;
```
