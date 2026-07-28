'use client';

import { Check, ChevronRight, KeyRound, Pencil, Settings2, Tags, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Suspense, useCallback, useRef, useState } from 'react';

import { ApiError } from '@/lib/api/errors';
import { SuspenseLoader } from '~components/SuspenseLoader';
import { Button, Field, Panel, fieldControlClassName } from '~components/ui';
import { useAccountsQuery } from '~features/accounts';
import { AuthenticatedApp, useAuth } from '~features/auth';
import { useCategoriesQuery } from '~features/categories';
import { useChangePasswordMutation, useUpdatePreferencesMutation, useUpdateProfileMutation } from '~features/users';
import type { AccountRead, CategoryRead } from '~types/api';

function requireToken(token: string | null): string {
  if (token === null) throw new Error('Settings require an authenticated session');
  return token;
}

interface SettingsCardProps {
  title: string;
  description: string;
  icon: JSX.Element;
  isEditing: boolean;
  isPending: boolean;
  successMessage: string | null;
  error: string | null;
  onEdit: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}

function SettingsCard({ title, description, icon, isEditing, isPending, successMessage, error, onEdit, onCancel, children }: SettingsCardProps): JSX.Element {
  const editButtonRef = useRef<HTMLButtonElement>(null);

  const handleCancel = useCallback((): void => {
    onCancel();
    requestAnimationFrame(() => editButtonRef.current?.focus());
  }, [onCancel]);

  return (
    <Panel>
      <Panel.Header className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-muted text-primary">{icon}</div>
          <div><Panel.Title>{title}</Panel.Title><p className="mt-1 text-sm text-muted">{description}</p></div>
        </div>
        {isEditing ? <Button size="sm" type="button" variant="secondary" disabled={isPending} onClick={handleCancel}>Cancel</Button> : <button ref={editButtonRef} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface-elevated px-3 text-sm font-semibold text-foreground transition hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background" type="button" aria-label={`Edit ${title.toLowerCase()}`} onClick={onEdit}><Pencil size={15} />Edit</button>}
      </Panel.Header>
      <Panel.Body className="flex flex-col gap-5">
        {successMessage === null ? null : <p className="flex items-center gap-2 rounded-xl border border-success/30 bg-success-muted px-3 py-2 text-sm font-medium text-success" role="status"><Check size={16} />{successMessage}</p>}
        {children}
        {error === null ? null : <p className="rounded-xl border border-danger/40 bg-danger-muted px-4 py-3 text-sm text-danger" role="alert">{error}</p>}
      </Panel.Body>
    </Panel>
  );
}

function SettingsNav(): JSX.Element {
  const pathname = usePathname();
  const items = [
    { href: '/settings', label: 'My profile', icon: <UserRound size={16} /> },
    { href: '/settings#security', label: 'Security', icon: <KeyRound size={16} /> },
    { href: '/settings#defaults', label: 'Transaction defaults', icon: <Settings2 size={16} /> },
    { href: '/settings/categories', label: 'Categories', icon: <Tags size={16} /> },
  ];

  return <nav aria-label="Settings sections" className="flex gap-2 overflow-x-auto pb-1 lg:sticky lg:top-24 lg:flex-col lg:overflow-visible">{items.map((item) => {
    const isActive = item.href === '/settings' ? pathname === '/settings' : pathname === item.href;
    return <Link aria-current={isActive ? 'page' : undefined} className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${isActive ? 'bg-primary-muted text-primary' : 'text-muted hover:bg-surface-muted hover:text-foreground'}`} href={item.href} key={item.href}>{item.icon}{item.label}</Link>;
  })}</nav>;
}

function ProfileSettings({ email, displayName }: { email: string; displayName: string | null }): JSX.Element {
  const updateProfile = useUpdateProfileMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [nextEmail, setNextEmail] = useState(email);
  const [nextDisplayName, setNextDisplayName] = useState(displayName ?? '');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const startEditing = useCallback((): void => { setNextEmail(email); setNextDisplayName(displayName ?? ''); setError(null); setSuccessMessage(null); setIsEditing(true); }, [displayName, email]);
  const cancelEditing = useCallback((): void => { setError(null); setIsEditing(false); }, []);
  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault(); if (updateProfile.isPending) return; setError(null);
    try { await updateProfile.mutateAsync({ email: nextEmail.trim(), display_name: nextDisplayName.trim() || null }); setSuccessMessage('Profile saved'); setIsEditing(false); }
    catch (caughtError) { setError(caughtError instanceof ApiError ? caughtError.detail : 'Could not update profile'); }
  }, [nextDisplayName, nextEmail, updateProfile]);

  return <SettingsCard description="Your CheCash identity and sign-in email." error={error} icon={<UserRound size={20} />} isEditing={isEditing} isPending={updateProfile.isPending} onCancel={cancelEditing} onEdit={startEditing} successMessage={successMessage} title="My profile">{isEditing ? <form className="flex flex-col gap-4" onSubmit={handleSubmit}><Field><Field.Label>Display name</Field.Label><input autoFocus className={fieldControlClassName} maxLength={120} value={nextDisplayName} onChange={(event) => setNextDisplayName(event.target.value)} /></Field><Field><Field.Label>Email</Field.Label><input autoComplete="email" className={fieldControlClassName} required type="email" value={nextEmail} onChange={(event) => setNextEmail(event.target.value)} /></Field><Button className="self-start" type="submit" disabled={updateProfile.isPending}>{updateProfile.isPending ? 'Saving...' : 'Save changes'}</Button></form> : <dl className="grid gap-4 sm:grid-cols-2"><div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Display name</dt><dd className="mt-1 break-words font-medium text-foreground">{displayName ?? 'Not set'}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Email</dt><dd className="mt-1 break-words font-medium text-foreground">{email}</dd></div></dl>}</SettingsCard>;
}

function PasswordSettings(): JSX.Element {
  const changePassword = useChangePasswordMutation(); const [isEditing, setIsEditing] = useState(false); const [currentPassword, setCurrentPassword] = useState(''); const [newPassword, setNewPassword] = useState(''); const [confirmation, setConfirmation] = useState(''); const [error, setError] = useState<string | null>(null); const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const startEditing = useCallback((): void => { setCurrentPassword(''); setNewPassword(''); setConfirmation(''); setError(null); setSuccessMessage(null); setIsEditing(true); }, []);
  const cancelEditing = useCallback((): void => { setError(null); setIsEditing(false); }, []);
  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>): Promise<void> => { event.preventDefault(); if (changePassword.isPending) return; if (newPassword !== confirmation) { setError('New password and confirmation must match'); return; } setError(null); try { await changePassword.mutateAsync({ current_password: currentPassword, new_password: newPassword }); setSuccessMessage('Password changed'); setIsEditing(false); } catch (caughtError) { setError(caughtError instanceof ApiError ? caughtError.detail : 'Could not change password'); } }, [changePassword, confirmation, currentPassword, newPassword]);
  return <section id="security"><SettingsCard description="Keep your account protected with a strong password." error={error} icon={<KeyRound size={20} />} isEditing={isEditing} isPending={changePassword.isPending} onCancel={cancelEditing} onEdit={startEditing} successMessage={successMessage} title="Security">{isEditing ? <form className="flex flex-col gap-4" onSubmit={handleSubmit}><Field><Field.Label>Current password</Field.Label><input autoComplete="current-password" autoFocus className={fieldControlClassName} minLength={8} required type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></Field><Field><Field.Label>New password</Field.Label><input autoComplete="new-password" className={fieldControlClassName} minLength={8} required type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></Field><Field><Field.Label>Confirm new password</Field.Label><input autoComplete="new-password" className={fieldControlClassName} minLength={8} required type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></Field><Button className="self-start" type="submit" disabled={changePassword.isPending}>{changePassword.isPending ? 'Saving...' : 'Change password'}</Button></form> : <p className="font-medium text-foreground">Password protected</p>}</SettingsCard></section>;
}

function accountLabel(accounts: AccountRead[], accountId: string | null): string { if (accountId === null) return 'No default account'; const account = accounts.find((item) => item.id === accountId); return account === undefined ? 'Unavailable account' : `${account.name} (${account.currency})`; }
function categoryLabel(categories: CategoryRead[], categoryId: string | null): string { if (categoryId === null) return 'No default category'; const category = categories.find((item) => item.id === categoryId); return category === undefined ? 'Unavailable category' : `${category.name} (${category.type})`; }

function PreferenceSettings({ accounts, categories, defaultAccountId, defaultCategoryId }: { accounts: AccountRead[]; categories: CategoryRead[]; defaultAccountId: string | null; defaultCategoryId: string | null }): JSX.Element {
  const updatePreferences = useUpdatePreferencesMutation(); const [isEditing, setIsEditing] = useState(false); const [accountId, setAccountId] = useState(defaultAccountId ?? ''); const [categoryId, setCategoryId] = useState(defaultCategoryId ?? ''); const [error, setError] = useState<string | null>(null); const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const startEditing = useCallback((): void => { setAccountId(defaultAccountId ?? ''); setCategoryId(defaultCategoryId ?? ''); setError(null); setSuccessMessage(null); setIsEditing(true); }, [defaultAccountId, defaultCategoryId]);
  const cancelEditing = useCallback((): void => { setError(null); setIsEditing(false); }, []);
  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>): Promise<void> => { event.preventDefault(); if (updatePreferences.isPending) return; setError(null); try { await updatePreferences.mutateAsync({ default_account_id: accountId || null, default_category_id: categoryId || null }); setSuccessMessage('Transaction defaults saved'); setIsEditing(false); } catch (caughtError) { setError(caughtError instanceof ApiError ? caughtError.detail : 'Could not update transaction defaults'); } }, [accountId, categoryId, updatePreferences]);
  return <section id="defaults"><SettingsCard description="Preselect values when you record a transaction." error={error} icon={<Settings2 size={20} />} isEditing={isEditing} isPending={updatePreferences.isPending} onCancel={cancelEditing} onEdit={startEditing} successMessage={successMessage} title="Transaction defaults">{isEditing ? <form className="flex flex-col gap-4" onSubmit={handleSubmit}><Field><Field.Label>Preferred account</Field.Label><select autoFocus className={fieldControlClassName} value={accountId} onChange={(event) => setAccountId(event.target.value)}><option value="">No default account</option>{accounts.filter((account) => account.archived_at === null).map((account) => <option key={account.id} value={account.id}>{account.name} ({account.currency})</option>)}</select></Field><Field><Field.Label>Preferred category</Field.Label><select className={fieldControlClassName} value={categoryId} onChange={(event) => setCategoryId(event.target.value)}><option value="">No default category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name} ({category.type})</option>)}</select></Field><Button className="self-start" type="submit" disabled={updatePreferences.isPending}>{updatePreferences.isPending ? 'Saving...' : 'Save changes'}</Button></form> : <dl className="grid gap-4 sm:grid-cols-2"><div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Preferred account</dt><dd className="mt-1 break-words font-medium text-foreground">{accountLabel(accounts, defaultAccountId)}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-muted">Preferred category</dt><dd className="mt-1 break-words font-medium text-foreground">{categoryLabel(categories, defaultCategoryId)}</dd></div></dl>}</SettingsCard></section>;
}

function CategoriesLink(): JSX.Element { return <Panel><Panel.Header><div className="flex items-center gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-muted text-primary"><Tags size={20} /></div><div><Panel.Title>Categories</Panel.Title><p className="mt-1 text-sm text-muted">Organize income and expense categories.</p></div></div></Panel.Header><Panel.Body><Link className="flex min-h-11 items-center justify-between rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition hover:border-primary/60 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background" href="/settings/categories"><span>Manage categories</span><ChevronRight size={18} /></Link></Panel.Body></Panel>; }

function GeneralSettings(): JSX.Element {
  const { token, user } = useAuth(); const authToken = requireToken(token); if (user === null) throw new Error('Settings require current user'); const { data: accounts } = useAccountsQuery(authToken, user.id); const { data: categories } = useCategoriesQuery(authToken, user.id);
  return <div className="flex w-full flex-col gap-8 pb-20 lg:pb-0"><header><h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Account settings</h1><p className="mt-2 text-base text-muted">Manage profile, security, and transaction preferences.</p></header><div className="grid gap-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:items-start"><SettingsNav /><div className="flex max-w-3xl flex-col gap-5"><ProfileSettings displayName={user.display_name} email={user.email} /><PasswordSettings /><PreferenceSettings accounts={accounts} categories={categories} defaultAccountId={user.default_account_id} defaultCategoryId={user.default_category_id} /><CategoriesLink /></div></div></div>;
}

export default function SettingsPage(): JSX.Element { return <AuthenticatedApp><Suspense fallback={<SuspenseLoader label="Loading settings" />}><GeneralSettings /></Suspense></AuthenticatedApp>; }
