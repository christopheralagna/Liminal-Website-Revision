# Liminal Operational Workflows: Historical Realities & Modern Software System

This document translates the real-world operational challenges and historical administrative practices of Liminal into concrete functional requirements for the nonprofit management application.

---

## 1. Historical Realities vs. Software Evolution

The physical organization was powered by volunteers using ad-hoc tools: Google Sheets for master schedules, paper receipts placed in plastic sleeves by the register, manual email coordination, and sprawling Slack channels. The modern administrative system builds directly upon these historical practices, solving their operational bottlenecks.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       HISTORICAL OPERATIONAL STACK                          │
│                                                                             │
│  [ Paper Receipts ]    [ Excel Schedules ]    [ Slack Channels ]    [ Email ]
│           │                     │                      │                │
│           ▼                     ▼                      ▼                ▼
│  Manual binder check    Texting for shifts     Missed notifications  Lost logs│
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                       MODERN ADMINISTRATIVE SYSTEM                          │
│                                                                             │
│  [ Financial Ledger ]  [ Shift Scheduler ]   [ Real-Time Portal ]  [ Events ]
│           │                     │                      │                │
│           ▼                     ▼                      ▼                ▼
│  Categorized expenses   Conflict detection    Volunteer swaps     Automated │
│  & digital receipts     & training tracking   & automated alerts  staffing  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Volunteer Management & Scheduling Workflow

### Historical Process (Source: `_Standard Practices at Liminal.docx`, `Liminal Volunteer Guide.docx`, `Empty NEW Cafe Volunteer Schedule.xlsx`)
1. **Operating Shifts**:
   - The cafe operated Wednesday through Sunday.
   - Two 4-hour shifts per day:
     - **Morning Shift**: 10:00 AM – 2:00 PM (Opening tasks, cash drawer setup, ice bucket, coffee prep).
     - **Afternoon Shift**: 2:00 PM – 6:00 PM (Closing tasks, sweeping, machine cleaning, cash drawer reconciliation).
2. **Volunteer Roles & Tiers**:
   - **Weekly Baristas**: Committed to a fixed 4-hour slot each week.
   - **Cafe Support Pool**: On-call volunteer pool who stepped in when regular baristas needed time off, and waited in a prioritized queue for permanent weekly openings.
   - **Training Requirement**: Every prospective cafe volunteer had to complete **two weekend training shifts** (Saturday/Sunday 12–4 PM or 4–8 PM) taught by the Barista Trainer before being cleared for solo barista shifts.
3. **Non-Cafe Working Groups**:
   - Autonomous volunteer groups: *Promotions & PR, Event Coordination, Flyering, Plant Care, Facilities & Cleaning, Carpentry, Social Media, Art Curation*. Volunteers claimed individual tasks via Slack rather than committing to weekly recurring shifts.

### Software Feature Requirements
- **Volunteer Profile & Certification**:
  - Track completed training shifts (`trainingShiftsCompleted: number`, `isCertifiedBarista: boolean`).
  - Track assigned volunteer team (`CAFE`, `EVENTS`, `FACILITIES`, `OUTREACH`, `GENERAL`).
  - Emergency contact details, weekly recurring availability matrix, and skills tags.
- **Shift Generation & Conflict Detection**:
  - Recurring shift templates (Wed–Sun 10am–2pm and 2pm–6pm).
  - Validation engine checking:
    1. Double-booking across overlapping events or shifts.
    2. Minimum rest intervals between shifts.
    3. Qualification check (only certified volunteers assigned to solo barista shifts).
- **Shift Swapping & Open Shift Marketplace**:
  - A volunteer can mark a shift as "Needs Coverage" up to 24 hours in advance.
  - The system automatically notifies the eligible **Cafe Support Pool**.
  - Peer-to-peer claim and coordinator approval workflow.
- **Attendance & Shift Status Lifecycle**:
  - `SCHEDULED` → `CONFIRMED` → `CHECKED_IN` → `COMPLETED` (or `NO_SHOW` / `CANCELLED`).
  - Shift checklists integrated directly into check-in (opening and closing task verification).

---

## 3. Financial Management & Expense Ledger Workflow

### Historical Process (Source: `_Standard Practices at Liminal.docx`, `Liminal Staff Roles Descriptions.docx`)
1. **Expenses & Receipts**:
   - Regular purchases were made via a designated debit card.
   - Physical receipts were annotated with:
     1. Purpose of purchase.
     2. Specific room/department (e.g., Cafe Bar, Art Supply Room, Multimedia Room).
     3. Project tag (e.g., *2022 Summer Renovation* vs *Routine Operations*).
   - Receipts were deposited into "Sleeve 1" of the document binder at the front register.
   - The Financial Coordinator reconciled receipts weekly and created monthly reports for the Board of Directors.
2. **Revenues**:
   - Pay-what-you-can cafe cash register drawer and card reader donations.
   - Online donations (GoFundMe, recurring donors).
   - Event ticket splits and art exhibition commission sales.
3. **Fixed Operational Costs**:
   - Rent and utilities exceeded \$3,000/month, creating constant fundraising urgency.

### Software Feature Requirements
- **Double-Entry-Inspired Expense & Revenue Ledger**:
  - Track every transaction with type (`REVENUE` vs `EXPENSE`), amount, date, payment method (`CASH`, `CARD`, `TRANSFER`, `ONLINE`).
  - Department categorization: `CAFE_SUPPLIES`, `FACILITY_RENT_UTILITIES`, `RENOVATIONS`, `ART_SUPPLIES`, `HARM_REDUCTION`, `EVENT_PRODUCTION`.
  - Project tagging: Support tagging expenses to campaigns (e.g., `2022_RENOVATION`, `WINTER_DRIVE_2022`).
- **Digital Receipt Capture**:
  - Upload receipt image/PDF, store secure URL, link directly to ledger entry.
- **Monthly Summary & Variance Reporting**:
  - Monthly financial breakdown: Total Revenue vs Total Expenses vs Fixed Rent Overhead (\$3,000 baseline).
  - Net operating balance and reserve fund calculations.
- **CSV Import / Export**:
  - Standard CSV export of transactions for external accounting review.
  - CSV bulk import for batch register logs.

---

## 4. Event Lifecycle & Venue Management Workflow

### Historical Process (Source: `Event Guidelines.docx`, `Liminal Roles Directory.docx`)
1. **Inquiry & Submission**:
   - Community organizers submitted an event proposal detailing title, organizers, purpose, desired dates, and resource needs.
2. **Radical Vetting & Venue Right of Refusal**:
   - Liminal explicitly exercised its Right of Refusal: vetting organizers to ensure compliance with anti-capitalist, anti-racist, LGBTQ+-affirming, and community-centered ethics.
3. **Scheduling & Promotion**:
   - Approved events were added to the internal Google Calendar, published on Eventbrite, and assigned to the Flyering and Social Media teams.
4. **Staffing Requirements**:
   - Events involving cafe service (e.g., Open Jazz Jams, Fundraisers) required dedicated volunteer barista staffing.

### Software Feature Requirements
- **Event Proposal & Vetting Pipeline**:
  - Status states: `SUBMITTED` → `UNDER_REVIEW` → `APPROVED` (or `REJECTED`) → `SCHEDULED` → `COMPLETED`.
  - Internal reviewer notes and ethical guideline checklist.
- **Volunteer Staffing Requirements**:
  - Ability to attach required volunteer staffing positions to an event (e.g., *1 Door Monitor, 1 Barista, 1 AV Technician*).
  - Automatically publishes open volunteer slots to the volunteer schedule.
- **Calendar Synchronization**:
  - Two-way or one-way iCal / Google Calendar integration for public events and internal staffing calendars.
- **Attendance & Door Tracking**:
  - Track estimated vs actual attendance, donation proceeds collected at the door, and partner splits.

---

## 5. Community Resources & Mutual Aid Inventory Workflow

### Historical Process (Source: `_Standard Practices at Liminal.docx`)
1. **Art Supply Room**:
   - Freely accessible mediums; volunteers monitored usage, cleaned brushes, and ordered restocking when supplies dipped below thresholds.
2. **Harm Reduction Distribution**:
   - Narcan (Naloxone) kits and safer-use supplies provided in partnership with Sonoran Prevention Works (SPW).
   - Tracked distribution volumes to request grant refills without collecting identifying personal information from recipients.
3. **Radical Library & Zine Collection**:
   - Curated social justice literature; browsing on-site with plans for an honor-system lending catalog.

### Software Feature Requirements
- **Inventory Tracking System**:
  - Inventory items categorized by department: `CAFE`, `ART_SUPPLIES`, `HARM_REDUCTION`, `LIBRARY`.
  - Stock levels, unit measurements, reorder thresholds, and distributor contact notes.
  - Low-stock alerts on administrative dashboards.
- **Harm Reduction Distribution Log**:
  - Anonymous counter recording units distributed (e.g. *12 Narcan kits distributed in October 2022*) for grant reporting, maintaining 100% recipient anonymity.

