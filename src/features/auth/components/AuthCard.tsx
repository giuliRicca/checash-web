'use client';

import { Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

import { ApiError } from '@/lib/api/errors';
import { Button, Field, IconBadge, fieldControlClassName } from '~components/ui';
import { useAuth } from '~features/auth/hooks/use-auth';

export type AuthMode = 'login' | 'register';

interface AuthCardProps {
  initialMode?: AuthMode;
}

export function AuthCard({ initialMode = 'login' }: AuthCardProps): JSX.Element {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegisterMode = mode === 'register';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);

    if (isRegisterMode && password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        await register({ email, password });
      } else {
        await login({ email, password });
      }
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.detail : 'No pudimos autenticarte');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleModeChange(): void {
    setMode(isRegisterMode ? 'login' : 'register');
    setConfirmPassword('');
    setError(null);
  }

  return (
    <section className={`mx-auto flex w-full max-w-md flex-col gap-6 rounded-3xl border p-5 shadow-2xl shadow-black/20 transition sm:p-8 ${isRegisterMode ? 'border-primary/50 bg-primary-muted/20' : 'border-border bg-surface'}`}>
      <div className="flex items-center gap-3">
        <IconBadge tone={isRegisterMode ? 'success' : 'primary'}>
          {isRegisterMode ? <ShieldCheck size={22} /> : <LogIn size={22} />}
        </IconBadge>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary">{isRegisterMode ? 'Nueva cuenta' : 'CheCash'}</p>
          <h1 className="text-2xl font-semibold text-foreground">{isRegisterMode ? 'Creá tu cuenta' : 'Bienvenido de nuevo'}</h1>
          <p className="mt-1 text-sm text-muted">{isRegisterMode ? 'Confirmá tu contraseña para empezar.' : 'Ingresá para seguir controlando tus movimientos.'}</p>
        </div>
      </div>

      {isRegisterMode ? (
        <div className="rounded-2xl border border-success/30 bg-success-muted/30 px-4 py-3 text-sm text-success">
          Usá al menos 8 caracteres y repetí la contraseña para evitar errores.
        </div>
      ) : null}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Field>
          <Field.Label>Correo electrónico</Field.Label>
          <input
            className={fieldControlClassName}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </Field>
        <Field>
          <Field.Label>Contraseña</Field.Label>
          <div className="flex overflow-hidden rounded-xl border border-border-strong bg-background transition duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/60 focus-within:ring-offset-2 focus-within:ring-offset-background">
            <input
              className="min-h-11 min-w-0 flex-1 bg-transparent px-4 py-3 text-foreground outline-none"
              type={isPasswordVisible ? 'text' : 'password'}
              autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
              value={password}
              minLength={mode === 'register' ? 8 : undefined}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              className="flex min-h-11 w-12 items-center justify-center text-muted transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              type="button"
              aria-label={isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              onClick={() => setIsPasswordVisible((current) => !current)}
            >
              {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>
        {isRegisterMode ? (
          <Field>
            <Field.Label>Repetir contraseña</Field.Label>
            <div className="flex overflow-hidden rounded-xl border border-border-strong bg-background transition duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/60 focus-within:ring-offset-2 focus-within:ring-offset-background">
              <input
                className="min-h-11 min-w-0 flex-1 bg-transparent px-4 py-3 text-foreground outline-none"
                type={isConfirmPasswordVisible ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                minLength={8}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
              />
              <button
                className="flex min-h-11 w-12 items-center justify-center text-muted transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                type="button"
                aria-label={isConfirmPasswordVisible ? 'Ocultar contraseña repetida' : 'Mostrar contraseña repetida'}
                onClick={() => setIsConfirmPasswordVisible((current) => !current)}
              >
                {isConfirmPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>
        ) : null}
        {error !== null ? <p className="rounded-xl border border-danger/40 bg-danger-muted px-4 py-3 text-sm text-danger">{error}</p> : null}
        <Button size="lg" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Procesando...' : isRegisterMode ? 'Crear cuenta' : 'Ingresar'}
        </Button>
      </form>

      <button
        className="text-sm text-muted transition hover:text-primary"
        type="button"
        onClick={handleModeChange}
      >
        {isRegisterMode ? '¿Ya tenés una cuenta? Ingresá' : '¿Necesitás una cuenta? Registrate'}
      </button>
    </section>
  );
}

export default AuthCard;
