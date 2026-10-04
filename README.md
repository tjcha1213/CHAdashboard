# CHA Dashboard

Working prototype dashboard for a Cambridge Housing Authority applicant.

## Features

- Applicant summary with live status, deadline, required document count, and review ETA.
- Dynamic horizontal application process timeline based on document readiness.
- Upload slots that accept files and record file name, file size, status, and last update.
- Document filtering by needed, changes requested, uploaded, approved, and optional states.
- Selected document detail panel with upload, approve, request changes, and remove actions.
- Program track status for public housing and voucher applications that responds to document completion.
- Recent activity feed that updates when dashboard actions are taken.

## Development

Install dependencies with `npm install`, then run `npm run dev`.

Create a production build with `npm run build`. Vite writes the static output to `dist/`.
