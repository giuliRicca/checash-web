export type Currency = 'ARS' | 'USD';

export type RateType = 'blue' | 'mep' | 'tarjeta';

export type TransactionType = 'expense' | 'income';

export interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
}

export interface UserRead {
  id: string;
  email: string;
  default_account_id: string | null;
  default_category_id: string | null;
}

export interface AccountCreate {
  name: string;
  currency: Currency;
  opening_balance: string;
  rate_type: RateType;
}

export interface AccountRead {
  id: string;
  name: string;
  currency: Currency;
  opening_balance: string;
  balance: string;
  rate_type: RateType;
  archived_at: string | null;
}

export interface NetWorthRead {
  total_ars: string;
  total_usd: string;
}

export interface CategoryRead {
  id: string;
  user_id: string | null;
  name: string;
  slug: string;
  is_system: boolean;
}

export interface ExchangeDetailsDraft {
  destination_currency: Currency | null;
  rate_override: string | null;
  destination_account_keyword: string | null;
  destination_account_id: string | null;
}

export interface ChatDraft {
  amount: string;
  currency: Currency;
  account_keyword: string | null;
  account_id: string | null;
  category_id: string | null;
  category_name: string | null;
  transaction_type: TransactionType | 'transfer';
  description: string | null;
  is_exchange: boolean;
  exchange_details: ExchangeDetailsDraft | null;
  needs_review: boolean;
}

export interface TransactionRead {
  id: string;
  account_id: string;
  category_id: string;
  category_name_snapshot: string;
  amount: string;
  currency: Currency;
  rate_used: string | null;
  type: TransactionType;
  description: string | null;
  created_at: string;
}

export interface TransactionCreate {
  account_id: string;
  category_id: string;
  amount: string;
  type: TransactionType;
  description: string | null;
}

export interface TransferRead {
  id: string;
  source_account_id: string;
  destination_account_id: string;
  source_amount: string;
  source_currency: Currency;
  destination_amount: string;
  destination_currency: Currency;
  rate_used: string | null;
  description: string | null;
  created_at: string;
}

export type ConfirmResult = TransactionRead | TransferRead;

export type MessageType = 'user' | 'bot_text' | 'draft_card' | 'success_notification';

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  draftData?: ChatDraft | null;
}
