# Che Cash Frontend

Next.js client for Che Cash finance MVP.

## Setup

```powershell
npm install
$env:NEXT_PUBLIC_API_BASE_URL = "http://localhost:8000/api"
npm run dev
```

Use Node 20+ and npm. Backend must run with matching API contract.

## Commands

```powershell
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npm run test:e2e
npm run build
```

## Security

Next `16.2.10` is latest stable release but bundles PostCSS `8.4.31`. npm audit reports two
moderate findings through that transitive dependency. Next canary has patched PostCSS; project
stays on stable Next and must update when a patched stable release is available.

## Documentation
- `docs/architecture.md`: session, cache, API, money, QA decisions.
- `docs/roadmap.md`: MVP scope and production work.
- Backend contract: `../Backend/docs/api.md`.
