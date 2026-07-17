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
