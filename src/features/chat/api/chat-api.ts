import { apiRequest } from '@/lib/api/client';
import type { ChatDraft, ConfirmResult } from '~types/api';

interface ParseMessagePayload {
  message: string;
}

interface ConfirmDraftPayload {
  draft: ChatDraft;
}

export const chatApi = {
  parseMessage(message: string): Promise<ChatDraft> {
    return apiRequest<ChatDraft, ParseMessagePayload>('/chat/parse-message', {
      method: 'POST',
      body: { message },
    });
  },
  confirm(draft: ChatDraft): Promise<ConfirmResult> {
    return apiRequest<ConfirmResult, ConfirmDraftPayload>('/chat/confirm', {
      method: 'POST',
      body: { draft },
    });
  },
};
