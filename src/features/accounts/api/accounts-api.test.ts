import { describe, expect, it, vi } from 'vitest';

const { apiRequest } = vi.hoisted(() => ({ apiRequest: vi.fn() }));

vi.mock('@/lib/api/client', () => ({ apiRequest }));

import { accountsApi } from '~features/accounts/api/accounts-api';

describe('accountsApi.activity', () => {
  it('passes opaque cursor through query string', () => {
    accountsApi.activity('account-1', 'cursor+/=', 'token');

    expect(apiRequest).toHaveBeenCalledWith('/accounts/account-1/activity?cursor=cursor%2B%2F%3D', { token: 'token' });
  });
});

describe('accountsApi.netWorthHistory', () => {
  it('requests current-month net worth history', () => {
    accountsApi.netWorthHistory('token');

    expect(apiRequest).toHaveBeenCalledWith('/accounts/net-worth/history', { token: 'token' });
  });
});

describe('accountsApi.adjustBalance', () => {
  it('posts target balance to the account adjustment endpoint', () => {
    accountsApi.adjustBalance('account-1', { target_balance: '42.00' });

    expect(apiRequest).toHaveBeenCalledWith('/accounts/account-1/adjustments', { method: 'POST', body: { target_balance: '42.00' } });
  });
});

describe('accountsApi.delete', () => {
  it('deletes the account', () => {
    accountsApi.delete('account-1');

    expect(apiRequest).toHaveBeenCalledWith('/accounts/account-1', { method: 'DELETE' });
  });
});
