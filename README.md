# Mentor Payment Tracking Dashboard

A standalone mentor-facing payment tracking dashboard for monitoring course delivery progress and submitting payment claims with eTIMS documents.

The page is part of a larger mentor/supervisor/finance workflow, but this project focuses only on the mentor experience.

## Overview

Mentors can view course activity across different teaching methods, inspect progress for each course, upload eTIMS documents, and submit either advance or full payment claims.

The app currently uses local mock data and frontend state only. There is no backend integration yet.

## Core Features

- Course activity timeline sorted with the most recent activity first
- Course progress details per teaching method:
  - Physical Location
  - Home Location
  - Online
- Per-course progress metrics:
  - Course Sessions
  - Lesson Content Covered / Assignments Graded
  - Learner Attendance
  - Report
- Automatic course progress calculation
- Payment eligibility rules:
  - Below 30%: payment request is disabled
  - 30% to 99%: advance payment is allowed
  - 100%: full payment is allowed
- eTIMS document upload validation:
  - PDF, PNG, JPG, JPEG
  - Maximum size: 5 MB
- Payment claim submission flow:
  - Advance payment claims remain in the Course Activity Timeline
  - Full payment claims are removed from the Course Activity Timeline after submission
  - Submitted claims appear in the Payment Claims section
- Payment Claims section with:
  - Status filtering
  - Teaching method filtering
  - Sorting by date or amount
  - Expandable claim details

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Radix UI style components
- lucide-react icons
- sonner toasts

## Project Structure

```text
.
|-- src
|   |-- main.tsx
|   |-- app
|   |   |-- App.tsx
|   |   `-- components
|   |       |-- ClaimsSection.tsx
|   |       |-- RequestPaymentDialog.tsx
|   |       |-- StatsOverview.tsx
|   |       |-- TeachingMethodCard.tsx
|   |       `-- ui/
|   `-- styles
|-- index.html
|-- package.json
|-- package-lock.json
|-- vite.config.ts
`-- README.md
```

## Main Files

`src/app/App.tsx`

Controls the main dashboard layout, course timeline state, selected course, submitted claims, and the logic that removes fully claimed courses from the timeline.

`src/app/components/TeachingMethodCard.tsx`

Contains course progress mock data, teaching method metadata, progress calculation, status calculation, and the selected course progress card.

`src/app/components/RequestPaymentDialog.tsx`

Handles payment type selection, eTIMS upload validation, preview/removal, and claim submission.

`src/app/components/ClaimsSection.tsx`

Displays submitted and mock payment claims with filters, sorting, expandable details, payment status, eTIMS document information, and progress data.

## Getting Started

### Prerequisites

Install Node.js and npm.

Recommended:

```bash
node --version
npm --version
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

Vite will print a local URL, usually:

```text
http://localhost:5173
```

### Build for Production

```bash
npm run build
```

The production build is generated in `dist/`.

## Payment Logic

The app calculates overall course progress by averaging the percentage completion of the course metrics.

Example:

```text
Course Sessions: 8/10 = 80%
Lesson Content Covered: 2/12 = 16.7%
Learner Attendance: 85%
Report: 80%
Overall Course Progress = average of all metrics
```

Eligibility:

```text
Progress < 30%     -> Not eligible for payment
Progress 30-99%    -> Eligible for advance payment
Progress 100%      -> Eligible for full payment
```

When a claim is submitted:

```text
Advance Payment -> Add claim to Payment Claims, keep course in timeline
Full Payment    -> Add claim to Payment Claims, remove course from timeline
```

## Mock Data

Course progress records currently include examples such as:

- Game Design
- Robotics
- Animation
- 3D Modeling

The `3D Modeling` course intentionally has progress below 30% to demonstrate the disabled payment state.

## Design Notes

The dashboard uses the DIGIFUNZII-style color palette:

```text
Primary: #25476a
Accent:  #38aae1
Warning: #feb139
Page background: light gray
Cards: white with subtle borders and shadows
```

The interface is designed as an internal operations dashboard: compact, clear, and focused on repeated mentor payment workflows.

## Git Notes

This repository should track source files and lockfiles, but not generated or local files.

Ignored examples:

- `node_modules/`
- `dist/`
- `.env`
- logs and caches

## Future Integration Ideas

- Replace local mock data with backend API data
- Persist submitted claims
- Add supervisor approval flow
- Add finance processing status
- Add authentication and mentor-specific data
- Store and preview uploaded eTIMS documents through a real file service
