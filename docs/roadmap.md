# Che Cash Roadmap

## Current MVP
- Auth, accounts with target-balance adjustments and permanent deletion, categories, income/expense
  transactions with independent ARS/USD currency and editing/deletion, transfers, chat capture,
  dashboard summaries, and latest activity.
- Exchange-rate cache from backend provider.
- Current-month net-worth growth chart reconstructed from dated account activity.

## Before Production
- Replace disposable migration policy with data-preserving migrations.
- Add refresh-token/session strategy and secure token storage.
- Expand E2E coverage to registration/login submission, account creation, chat confirmation,
  and loading subsequent activity pages. Retain unauthenticated and dynamic account-route smoke
  tests.
- Define deployment, backups, monitoring, and rate-provider outage alerts.
- Consider budget notifications, rollover, custom periods, and category groups after MVP.
