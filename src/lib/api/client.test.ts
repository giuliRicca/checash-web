import { afterEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api/errors';
import { apiRequest, onUnauthorized } from '@/lib/api/client';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('apiRequest', () => {
  it('notifies auth provider on 401', async () => {
    const listener = vi.fn();
    const unsubscribe = onUnauthorized(listener);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: 'Expired' }), { status: 401 })));

    await expect(apiRequest('/accounts', { token: null })).rejects.toBeInstanceOf(ApiError);

    expect(listener).toHaveBeenCalledOnce();
    unsubscribe();
  });
});
