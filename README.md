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
npm run build
```

## Documentation
- `docs/architecture.md`: session, cache, API, money, QA decisions.
- `docs/roadmap.md`: MVP scope and production work.
- Backend contract: `../Backend/docs/api.md`.
