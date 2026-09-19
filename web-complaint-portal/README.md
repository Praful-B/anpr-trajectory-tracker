# Citizen Complaint Portal

The Citizen Complaint Portal is the public-facing frontend application for the RAKSHAK ANPR (Automatic Number Plate Recognition) system. It allows citizens to quickly report stolen vehicles and track the real-time status of their complaints.

## Features

- **Rapid Vehicle Theft Reporting**: Citizens can submit a complaint immediately upon noticing a theft. Submitting a report adds the vehicle's license plate to the active network hotlist for an initial 48-hour window.
- **Auto-formatting Indian HSRPs**: Form inputs automatically format standard Indian license plates (e.g. `MH 12 AB 1234`).
- **Complaint Tracker timeline**: Visual timeline UI indicating the current status of the complaint: `Submitted` $\rightarrow$ `Under Review` $\rightarrow$ `Added to Hotlist` $\rightarrow$ `FIR Verified` $\rightarrow$ `Vehicle Sighted / Recovered`.
- **FIR Countdown Timer**: A strict 48-hour countdown timer enforces that citizens must upload an official Police FIR to verify the theft and keep the vehicle on the hotlist indefinitely.
- **Sighting Updates**: Placeholder for the real-time feedback loop displaying active sightings logged by the edge network.

## Technology Stack

- **React 19**
- **TypeScript**
- **Vite**
- **Tailwind CSS**
- **Vitest & React Testing Library**

## Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm

### Installation

1. Navigate to the project directory:
   ```bash
   cd web-complaint-portal
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Development

To start the development server with Hot Module Replacement (HMR):
```bash
pnpm dev
```
The application will be accessible at `http://localhost:5173`.

### Testing

The portal includes comprehensive unit tests for form behaviors and complex timers (like the FIR countdown) using Vitest and React Testing Library.

To run the test suite once:
```bash
pnpm vitest run
```

To run tests in interactive watch mode:
```bash
pnpm vitest
```

### Build for Production

To build the optimized static assets:
```bash
pnpm build
```

This will output the production-ready application in the `dist` directory. You can preview the production build locally using:
```bash
pnpm preview
```

## Role in the System Architecture

This application represents the `CITIZEN` interaction layer in the Role-Based Access Control (RBAC) model. It focuses purely on writing complaints and viewing the citizen's own complaint history. It does not have read access to the global hotlist, audit logs, or unauthorized sightings.
