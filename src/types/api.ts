export type Currency = 'ARS' | 'USD';

export type RateType = 'oficial' | 'blue' | 'mep' | 'tarjeta' | 'crypto';

export type TransactionType = 'expense' | 'income';

export interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
}

export interface UserRead {
  id: string;
  email: string;
  display_name: string | null;
  default_account_id: string | null;
  default_category_id: string | null;
}

export interface UserProfileUpdate {
  email: string;
  display_name: string | null;
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
}

export interface UserPreferencesUpdate {
  default_account_id?: string | null;
  default_category_id?: string | null;
}

export interface UserPreferencesRead {
  default_account_id: string | null;
  default_category_id: string | null;
}

export interface AccountCreate {
  name: string;
  currency: Currency;
  opening_balance: string;
  rate_type: RateType;
}

export interface AccountUpdate {
  name?: string;
  rate_type?: RateType;
}

export interface AccountAdjustmentCreate {
  target_balance: string;
  description?: string | null;
  occurred_at?: string;
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

export interface NetWorthHistoryPointRead {
  date: string;
  total_ars: string;
  total_usd: string;
}

export interface NetWorthHistoryRead {
  month_start: string;
  points: NetWorthHistoryPointRead[];
}

export interface CategoryRead {
  id: string;
  user_id: string | null;
  name: string;
  slug: string;
  type: TransactionType;
  is_system: boolean;
}

export interface CategoryCreate {
  name: string;
  type: TransactionType;
}

export interface CategoryUpdate {
  name: string;
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
  occurred_at: string | null;
}

export interface TransactionRead {
  id: string;
  account_id: string;
  category_id: string;
  category_name_snapshot: string;
  amount: string;
  account_amount: string;
  currency: Currency;
  rate_used: string | null;
  is_adjustment: boolean;
  type: TransactionType;
  description: string | null;
  created_at: string;
  occurred_at: string;
}

export interface TransactionMonthSummaryRead {
  month_start: string;
  month_end: string;
  income_ars: string;
  income_usd: string;
  expense_ars: string;
  expense_usd: string;
}

export interface ActivityItem {
  kind: string;
  id: string;
  created_at: string;
  occurred_at: string | null;
  account_id: string | null;
  source_account_id: string | null;
  destination_account_id: string | null;
  amount: string | null;
  account_amount: string | null;
  currency: Currency | null;
  account_currency: Currency | null;
  source_amount: string | null;
  source_currency: Currency | null;
  destination_amount: string | null;
  destination_currency: Currency | null;
  rate_used: string | null;
  is_adjustment: boolean;
  transaction_type: TransactionType | null;
  category_id: string | null;
  category_name: string | null;
  description: string | null;
}

export interface ActivityFeed {
  items: ActivityItem[];
  next_cursor: string | null;
}

export interface TransactionCreate {
  account_id: string;
  category_id: string;
  amount: string;
  currency: Currency;
  type: TransactionType;
  description: string | null;
  occurred_at: string;
}

export interface TransactionUpdate {
  account_id?: string;
  category_id?: string;
  amount?: string;
  currency?: Currency;
  description?: string | null;
  occurred_at?: string;
}

export interface BudgetCreate {
  category_id: string;
  amount: string;
  currency: Currency;
}

export interface BudgetUpdate {
  amount?: string;
  currency?: Currency;
}

export interface BudgetRead {
  id: string;
  category_id: string;
  amount: string;
  currency: Currency;
  created_at: string;
}

export interface BudgetMonthSummary extends BudgetRead {
  category_name: string;
  spent: string;
  remaining: string;
  percentage: string;
  status: 'on_track' | 'at_limit' | 'over_budget';
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
