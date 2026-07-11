interface SuspenseLoaderProps {
  label?: string;
}

export function SuspenseLoader({ label = 'Loading Che Cash' }: SuspenseLoaderProps): JSX.Element {
  return (
    <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-sm text-slate-400">
      {label}
    </div>
  );
}

export default SuspenseLoader;
