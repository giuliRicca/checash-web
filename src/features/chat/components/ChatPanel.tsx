'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { useState } from 'react';

import { ApiError } from '@/lib/api/errors';
import { Button, Panel, fieldControlClassName } from '~components/ui';
import { accountsQueryKey, netWorthHistoryQueryKey, netWorthQueryKey } from '~features/accounts';
import { activityQueryKey } from '~features/activity';
import { budgetSummaryQueryKey } from '~features/budgets';
import { chatApi } from '~features/chat/api/chat-api';
import { DraftCard } from '~features/chat/components/DraftCard';
import { monthSummaryQueryKey } from '~features/transactions';
import type { AccountRead, CategoryRead, ChatDraft, Message } from '~types/api';

interface ChatPanelProps {
  accounts: AccountRead[];
  categories: CategoryRead[];
}

function createMessageId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

const examplePrompts = ['Gaste 50 en el super', 'Cobre sueldo en Cash', 'Pase 100 USD a ARS'];

export function ChatPanel({ accounts, categories }: ChatPanelProps): JSX.Element {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<Message[]>([
    { id: createMessageId(), type: 'bot_text', content: 'Tell me what happened. Example: Gaste 50 en el super con Cash.' },
  ]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const parseMutation = useMutation({ mutationFn: chatApi.parseMessage });
  const confirmMutation = useMutation({
    mutationFn: chatApi.confirm,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: accountsQueryKey }),
        queryClient.invalidateQueries({ queryKey: netWorthQueryKey }),
        queryClient.invalidateQueries({ queryKey: netWorthHistoryQueryKey }),
        queryClient.invalidateQueries({ queryKey: monthSummaryQueryKey }),
        queryClient.invalidateQueries({ queryKey: budgetSummaryQueryKey }),
        queryClient.invalidateQueries({ queryKey: activityQueryKey }),
      ]);
    },
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const content = input.trim();
    if (content.length === 0) {
      return;
    }

    setInput('');
    setError(null);
    setMessages((current) => [...current, { id: createMessageId(), type: 'user', content }]);

    try {
      const draft = await parseMutation.mutateAsync(content);
      setMessages((current) => [...current, { id: createMessageId(), type: 'draft_card', content: 'Draft ready', draftData: draft }]);
    } catch (caughtError) {
      const detail = caughtError instanceof ApiError ? caughtError.detail : 'Could not parse message';
      setError(detail);
      setMessages((current) => [...current, { id: createMessageId(), type: 'bot_text', content: detail }]);
    }
  }

  async function handleConfirm(messageId: string, draft: ChatDraft): Promise<void> {
    setError(null);

    try {
      await confirmMutation.mutateAsync(draft);
      setMessages((current) => current
        .filter((message) => message.id !== messageId)
        .concat({ id: createMessageId(), type: 'success_notification', content: 'Saved. Balances updated.' }));
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.detail : 'Could not confirm draft');
    }
  }

  function handleCancel(messageId: string): void {
    setMessages((current) => current.filter((message) => message.id !== messageId));
  }

  return (
    <Panel className="overflow-hidden">
      <Panel.Header>
        <p className="text-sm uppercase tracking-[0.3em] text-primary">Chat</p>
        <Panel.Title className="mt-1 text-2xl">Add money movement</Panel.Title>
      </Panel.Header>

      <Panel.Body className="flex max-h-[calc(100dvh-12rem)] min-h-[520px] flex-col p-0 sm:max-h-[640px]">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 pr-3 sm:px-6" aria-live="polite">
        {messages.map((message) => (
          <div key={message.id} className={message.type === 'user' ? 'ml-auto max-w-[85%]' : 'mr-auto w-full max-w-[92%]'}>
            {message.type === 'draft_card' && message.draftData !== undefined && message.draftData !== null ? (
              <DraftCard
                draft={message.draftData}
                accounts={accounts}
                categories={categories}
                onConfirm={(draft) => void handleConfirm(message.id, draft)}
                onCancel={() => handleCancel(message.id)}
                isSubmitting={confirmMutation.isPending}
              />
            ) : (
              <div className={message.type === 'user' ? 'rounded-2xl bg-primary px-5 py-3 font-medium text-primary-foreground' : message.type === 'success_notification' ? 'rounded-2xl border border-success/30 bg-success-muted px-5 py-3 text-success' : 'rounded-2xl border border-border bg-background px-5 py-3 text-muted'}>
                {message.content}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-border bg-surface px-4 pb-4 pt-3 sm:px-6">
      {error !== null ? <p className="mb-3 rounded-xl border border-danger/40 bg-danger-muted px-4 py-3 text-sm text-danger" role="alert">{error}</p> : null}

      <div className="mb-3 flex gap-2 overflow-x-auto pb-1" aria-label="Example prompts">
        {examplePrompts.map((prompt) => (
          <button
            className="shrink-0 touch-manipulation rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-muted transition hover:border-primary/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            key={prompt}
            type="button"
            onClick={() => setInput(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      <form className="flex gap-3" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="chat-message-input">Describe a money movement</label>
        <input
          id="chat-message-input"
          className={`${fieldControlClassName} min-w-0 flex-1`}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Gaste 50 en el super con Cash"
          disabled={parseMutation.isPending}
        />
        <Button type="submit" disabled={parseMutation.isPending} aria-label="Send message">
          <Send size={20} />
        </Button>
      </form>
      </div>
      </Panel.Body>
    </Panel>
  );
}

export default ChatPanel;
