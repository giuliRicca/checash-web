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
- Transaction and chat-draft amounts must be greater than zero before submit. Account opening
  balances accept any finite decimal, including zero or negative. Backend validates again.
- Transaction effective time is editable local date/time and sent as timezone-aware `occurred_at`.
  It defaults to now and cannot be future; budget and monthly summary windows use this value.
- Transaction currency is independently selectable as ARS or USD and defaults to selected account
  currency. Backend stores nominal amount, applied rate, and account-currency impact; activity shows
  that impact when nominal and account currencies differ.
- Transaction activity rows provide edit/delete actions for regular transactions. Edits can change
  account, category, amount, currency, description, and effective time; type and balance adjustments
  remain immutable. Transaction mutations refresh account, activity, net-worth, monthly-summary, and
  budget caches.
- Account balance corrections use target-balance adjustments. Backend calculates difference; adjustment
  activity remains visible but is excluded from income, expense, and budget reports.

## Dashboard Activity
- Dashboard shows 15 activity items per cursor page. Previous/Next controls retain fetched pages in
  memory and fetch a new opaque `next_cursor` only when moving forward into an unseen page.
- Activity rows cover transactions and transfers. Transaction/chat writes invalidate global activity cache
  so dashboard data refreshes immediately.

## Dashboard Net Worth Growth
- Dashboard loads `GET /accounts/net-worth/history` with net-worth totals and shares its ARS/USD toggle
  with the current-month chart.
- History is rebuilt by the backend from current account balances and dated current-month activity.
  Backdated transactions update the selected date and later chart points; transfers currently use their
  creation date.
- Account, transaction, and chat writes invalidate both current net-worth and history query keys.

## Manual QA
- Create first account while preference request fails: account exists once, warning appears, retry disabled.
- Confirm chat draft rejects zero amount, wrong category type, missing account, same-account transfer, invalid rate override.
- Load account activity until `next_cursor` is null.
- Load dashboard activity until `next_cursor` is null; verify transactions and transfers both appear.
- Force API 401: app returns to auth screen and prior account/category data disappears.
- Adjust account balance above and below current balance; verify activity entry and unchanged monthly/budget totals.
- Delete account after typing exact name; verify account history removal, default-account clear, and linked transfer counterpart correction.
