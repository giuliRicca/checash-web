export class ApiError extends Error {
  readonly status: number;
  readonly detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

interface ApiErrorPayload {
  detail?: unknown;
}

export function getErrorDetail(payload: ApiErrorPayload | null): string {
  if (typeof payload?.detail === 'string') {
    return payload.detail;
  }
  if (Array.isArray(payload?.detail)) {
    return payload.detail.map(String).join(', ');
  }
  return 'Request failed';
}
