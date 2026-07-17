# Frontend Architecture

## Stack
- Next.js App Router, React 18, TypeScript, Tailwind, TanStack Query.
- Feature code lives in `src/features`; shared UI in `src/components`; API types in `src/types/api.ts`.

## Session And Cache
- Access token lives in browser local storage for MVP.
- Request cache keys use non-secret user IDs, never bearer tokens.
- Any API 401 clears stored token, auth state, and TanStack Query cache.
- Backend remains source of truth for all authorization and chat-draft validation.

## API Rules
- Configure `NEXT_PUBLIC_API_BASE_URL`; default is `http://localhost:8000/api`.
- Activity pagination uses backend opaque `next_cursor`; clients pass it unchanged.
- Category type must match expense/income transaction type.
- See backend `docs/api.md` for API contract and rate rules.

## Money
- Inputs accept Argentine-style comma or dot decimals and normalize to two decimals.
- Client validates positive amounts before submit. Backend validates again.

## Manual QA
- Create first account while preference request fails: account exists once, warning appears, retry disabled.
- Confirm chat draft rejects zero amount, wrong category type, missing account, same-account transfer, invalid rate override.
- Load account activity until `next_cursor` is null.
- Force API 401: app returns to auth screen and prior account/category data disappears.
