'use client';

import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { Suspense, useCallback, useState } from 'react';

import { ApiError } from '@/lib/api/errors';
import { SuspenseLoader } from '~components/SuspenseLoader';
import { Button, Field, Panel, fieldControlClassName } from '~components/ui';
import { AuthenticatedApp, useAuth } from '~features/auth';
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useUpdateCategoryMutation,
} from '~features/categories';
import type { CategoryRead, TransactionType } from '~types/api';

function requireToken(token: string | null): string {
  if (token === null) {
    throw new Error('Settings require an authenticated session');
  }
  return token;
}

function CategorySettings(): JSX.Element {
  const { token, user } = useAuth();
  const authToken = requireToken(token);
  if (user === null) throw new Error('Settings require current user');
  const { data: categories } = useCategoriesQuery(authToken, user.id);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRead | null>(null);

  return (
    <div className="flex w-full flex-col gap-8 pb-20 lg:pb-0">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Categories</h1>
          <p className="mt-2 text-base text-muted">Keep income and expense categories separate.</p>
        </div>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          <Plus size={17} />
          Add category
        </Button>
      </header>

      {(['expense', 'income'] as const).map((type) => (
        <CategoryGroup
          key={type}
          categories={categories.filter((category) => category.type === type)}
          type={type}
          onEdit={setEditingCategory}
        />
      ))}

      {isCreateOpen ? <CategoryCreateModal onClose={() => setIsCreateOpen(false)} /> : null}
      {editingCategory === null ? null : <CategoryEditModal category={editingCategory} onClose={() => setEditingCategory(null)} />}
    </div>
  );
}

function CategoryGroup({ categories, type, onEdit }: { categories: CategoryRead[]; type: TransactionType; onEdit: (category: CategoryRead) => void }): JSX.Element {
  const deleteCategory = useDeleteCategoryMutation();
  const [error, setError] = useState<string | null>(null);
  const label = type === 'expense' ? 'Expenses' : 'Income';

  const handleDelete = useCallback(async (category: CategoryRead): Promise<void> => {
    if (!window.confirm(`Delete ${category.name}? This cannot be undone.`)) {
      return;
    }
    setError(null);
    try {
      await deleteCategory.mutateAsync(category.id);
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.detail : 'Could not delete category');
    }
  }, [deleteCategory]);

  return (
    <Panel>
      <Panel.Header className="flex items-center justify-between gap-4">
        <div>
          <Panel.Title>{label}</Panel.Title>
          <p className="mt-1 text-sm text-muted">{type === 'expense' ? 'Money leaving your accounts.' : 'Money entering your accounts.'}</p>
        </div>
        <span className="rounded-full bg-background px-3 py-1 text-xs font-bold text-muted">{categories.length}</span>
      </Panel.Header>
      <Panel.Body className="p-0">
        <div className="divide-y divide-border">
          {categories.map((category) => (
            <div className="flex min-h-16 items-center justify-between gap-4 px-5 py-3" key={category.id}>
              <div className="min-w-0">
                <p className="break-words font-semibold text-foreground">{category.name}</p>
                <p className="mt-0.5 text-xs text-muted">{category.is_system ? 'Built-in category' : 'Custom category'}</p>
              </div>
              {category.is_system ? <span className="text-xs font-semibold text-muted">Immutable</span> : (
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" type="button" aria-label={`Rename ${category.name}`} onClick={() => onEdit(category)} disabled={deleteCategory.isPending}><Pencil size={16} /></Button>
                  <Button size="icon" variant="ghost" type="button" aria-label={`Delete ${category.name}`} onClick={() => void handleDelete(category)} disabled={deleteCategory.isPending}><Trash2 size={16} /></Button>
                </div>
              )}
            </div>
          ))}
        </div>
        {error === null ? null : <p className="m-4 rounded-xl border border-danger/40 bg-danger-muted px-4 py-3 text-sm text-danger" role="alert">{error}</p>}
      </Panel.Body>
    </Panel>
  );
}

function CategoryCreateModal({ onClose }: { onClose: () => void }): JSX.Element {
  const createCategory = useCreateCategoryMutation();
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [error, setError] = useState<string | null>(null);
  const trimmedName = name.trim();

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (trimmedName.length === 0 || createCategory.isPending) return;
    setError(null);
    try {
      await createCategory.mutateAsync({ name: trimmedName, type });
      onClose();
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.detail : 'Could not create category');
    }
  }, [createCategory, onClose, trimmedName, type]);

  return <CategoryModal title="Add category" onClose={onClose} isPending={createCategory.isPending}>
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Field><Field.Label>Name</Field.Label><input autoFocus className={fieldControlClassName} maxLength={120} required value={name} onChange={(event) => setName(event.target.value)} /></Field>
      <Field><Field.Label>Transaction type</Field.Label><select className={fieldControlClassName} value={type} onChange={(event) => setType(event.target.value as TransactionType)}><option value="expense">Expense</option><option value="income">Income</option></select></Field>
      <p className="text-sm text-muted">This type cannot be changed after the category is created.</p>
      {error === null ? null : <p className="rounded-xl border border-danger/40 bg-danger-muted px-4 py-3 text-sm text-danger" role="alert">{error}</p>}
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end"><Button variant="secondary" type="button" onClick={onClose} disabled={createCategory.isPending}>Cancel</Button><Button type="submit" disabled={trimmedName.length === 0 || createCategory.isPending}>{createCategory.isPending ? 'Creating...' : 'Create category'}</Button></div>
    </form>
  </CategoryModal>;
}

function CategoryEditModal({ category, onClose }: { category: CategoryRead; onClose: () => void }): JSX.Element {
  const updateCategory = useUpdateCategoryMutation(category.id);
  const [name, setName] = useState(category.name);
  const [error, setError] = useState<string | null>(null);
  const trimmedName = name.trim();

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (trimmedName.length === 0 || trimmedName === category.name || updateCategory.isPending) return;
    setError(null);
    try {
      await updateCategory.mutateAsync({ name: trimmedName });
      onClose();
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.detail : 'Could not rename category');
    }
  }, [category.name, onClose, trimmedName, updateCategory]);

  return <CategoryModal title="Rename category" onClose={onClose} isPending={updateCategory.isPending}>
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <Field><Field.Label>Name</Field.Label><input autoFocus className={fieldControlClassName} maxLength={120} required value={name} onChange={(event) => setName(event.target.value)} /></Field>
      <p className="text-sm text-muted">{category.type === 'expense' ? 'Expense' : 'Income'} category. Its type cannot change.</p>
      {error === null ? null : <p className="rounded-xl border border-danger/40 bg-danger-muted px-4 py-3 text-sm text-danger" role="alert">{error}</p>}
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end"><Button variant="secondary" type="button" onClick={onClose} disabled={updateCategory.isPending}>Cancel</Button><Button type="submit" disabled={trimmedName.length === 0 || trimmedName === category.name || updateCategory.isPending}>{updateCategory.isPending ? 'Saving...' : 'Save changes'}</Button></div>
    </form>
  </CategoryModal>;
}

function CategoryModal({ title, onClose, isPending, children }: { title: string; onClose: () => void; isPending: boolean; children: React.ReactNode }): JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="presentation">
      <section aria-labelledby="category-modal-title" aria-modal="true" className="w-full max-w-lg rounded-t-3xl border border-border bg-surface p-4 shadow-2xl sm:rounded-2xl sm:p-6" role="dialog">
        <div className="mb-5 flex items-start justify-between gap-4"><h2 className="text-2xl font-semibold text-foreground" id="category-modal-title">{title}</h2><Button size="icon" variant="ghost" type="button" aria-label="Close category dialog" onClick={onClose} disabled={isPending}><X size={18} /></Button></div>
        {children}
      </section>
    </div>
  );
}

export default function SettingsPage(): JSX.Element {
  return <AuthenticatedApp><Suspense fallback={<SuspenseLoader label="Loading categories" />}><CategorySettings /></Suspense></AuthenticatedApp>;
}
