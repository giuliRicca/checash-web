import { describe, expect, it, vi } from 'vitest';

const { apiRequest } = vi.hoisted(() => ({ apiRequest: vi.fn() }));

vi.mock('@/lib/api/client', () => ({ apiRequest }));

import { activityApi } from '~features/activity/api/activity-api';

describe('activityApi.list', () => {
  it('passes dashboard page size and opaque cursor through query string', () => {
    activityApi.list(10, 'cursor+/=', 'token');

    expect(apiRequest).toHaveBeenCalledWith('/activity?limit=10&cursor=cursor%2B%2F%3D', { token: 'token' });
  });
});
