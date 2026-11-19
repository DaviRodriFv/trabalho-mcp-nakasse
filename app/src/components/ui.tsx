/** Biblioteca de componentes (design.md 2.5). Usa somente tokens: nada de cor/tamanho solto. */
import { forwardRef, useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { ChevronLeft, ChevronRight, X, type LucideIcon } from 'lucide-react';
import { statusEstoque } from '../lib/format';

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

/* ---------- Button ---------- */
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';
const btnVariant: Record<BtnVariant, string> = {
  primary: 'bg-primary-600 text-on-primary hover:bg-primary-700',
  secondary: 'border border-neutral-200 bg-neutral-0 text-neutral-900 hover:bg-neutral-50',
  ghost: 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900',
  danger: 'bg-danger text-white hover:opacity-90',
};
const btnSize: Record<Size, string> = {
  sm: 'h-control-sm gap-1.5 px-3 text-label',
  md: 'h-control-md gap-2 px-4 text-label',
  lg: 'h-control-lg gap-2 px-6 text-body-lg font-medium',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className,
  type = 'button',
  children,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: Size; icon?: LucideIcon }) {
  return (
    <button
      type={type}
      className={cx(
        'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md transition-colors disabled:pointer-events-none disabled:opacity-50',
        btnVariant[variant],
        btnSize[size],
        className,
      )}
      {...p}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : 20} aria-hidden />}
      {children}
    </button>
  );
}

export function IconButton({ icon: Icon, label, tone = 'neutral', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { icon: LucideIcon; label: string; tone?: 'neutral' | 'danger' }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex h-control-sm w-8 items-center justify-center rounded-md text-neutral-500 transition-colors disabled:opacity-40',
        tone === 'danger' ? 'hover:bg-danger-50 hover:text-danger' : 'hover:bg-neutral-50 hover:text-neutral-900',
      )}
      {...p}
    >
      <Icon size={16} />
    </button>
  );
}

/* ---------- Form ---------- */
export function Field({ label, htmlFor, error, hint, children, className }: { label?: string; htmlFor?: string; error?: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-label text-neutral-900">
          {label}
        </label>
      )}
      {children}
      {error ? <p className="text-caption text-danger">{error}</p> : hint ? <p className="text-caption text-neutral-500">{hint}</p> : null}
    </div>
  );
}

const control =
  'h-control-md rounded-md border bg-neutral-0 px-3 text-body text-neutral-900 outline-none transition placeholder:text-neutral-500 focus:border-primary-600 focus:ring-2 focus:ring-primary-600 focus:ring-offset-0 disabled:opacity-60';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { icon?: LucideIcon; invalid?: boolean }>(function Input({ icon: Icon, invalid, className, ...p }, ref) {
  return (
    <div className="relative w-full">
      {Icon && <Icon size={16} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />}
      <input ref={ref} aria-invalid={invalid || undefined} className={cx(control, 'w-full', invalid ? 'border-danger' : 'border-neutral-200', Icon && 'pl-9', className)} {...p} />
    </div>
  );
});

export function Select({ invalid, className, children, ...p }: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <select aria-invalid={invalid || undefined} className={cx(control, 'pr-8', invalid ? 'border-danger' : 'border-neutral-200', className ?? 'w-full')} {...p}>
      {children}
    </select>
  );
}

export function Checkbox({ label, ...p }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-body text-neutral-900">
      <input type="checkbox" className="h-4 w-4 rounded-sm accent-[var(--color-primary-600)]" {...p} />
      {label}
    </label>
  );
}

/* ---------- Badge ---------- */
export type Tone = 'success' | 'warning' | 'danger' | 'neutral' | 'info' | 'primary';
const tones: Record<Tone, string> = {
  success: 'bg-success-50 text-success',
  warning: 'bg-tertiary-50 text-tertiary-700',
  danger: 'bg-danger-50 text-danger',
  neutral: 'border border-neutral-200 bg-neutral-50 text-neutral-500',
  info: 'bg-info-50 text-info',
  primary: 'bg-primary-50 text-primary-600',
};
export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={cx('inline-flex items-center gap-1 whitespace-nowrap rounded-sm px-2 py-0.5 text-caption font-medium', tones[tone])}>{children}</span>;
}

export function StatusEstoqueBadge({ produto }: { produto: { estoque: number; estoqueMin: number } }) {
  const s = statusEstoque(produto);
  return s === 'ok' ? <Badge tone="success">Em estoque</Badge> : s === 'baixo' ? <Badge tone="warning">Estoque baixo</Badge> : <Badge tone="danger">Sem estoque</Badge>;
}

/* ---------- Card ---------- */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cx('rounded-lg border border-neutral-200 bg-neutral-0 shadow-sm', className)}>{children}</section>;
}

export function CardHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3 px-6 pb-4 pt-6">
      <div>
        <h2 className="text-h3 text-neutral-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-caption text-neutral-500">{subtitle}</p>}
      </div>
      {actions}
    </header>
  );
}

export function KpiCard({ label, value, icon: Icon, delta, hint, tone = 'primary' }: { label: string; value: string; icon: LucideIcon; delta?: number | null; hint?: string; tone?: 'primary' | 'warning' }) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-3">
        <span className={cx('flex h-10 w-10 items-center justify-center rounded-md', tone === 'warning' ? 'bg-tertiary-50 text-tertiary-700' : 'bg-primary-50 text-primary-600')}>
          <Icon size={20} aria-hidden />
        </span>
        <span className="text-label text-neutral-500">{label}</span>
      </div>
      <p className="mt-4 text-display tabular-nums text-neutral-900">{value}</p>
      <p className="mt-1 text-caption text-neutral-500">
        {delta != null && (
          <span className={cx('mr-1 font-medium', delta >= 0 ? 'text-success' : 'text-danger')}>
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(0)}%
          </span>
        )}
        {hint}
      </p>
    </Card>
  );
}

/* ---------- Page header ---------- */
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  useEffect(() => {
    document.title = `${title} · Balcão ERP`;
  }, [title]);
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-h1 text-neutral-900">{title}</h1>
        {subtitle && <p className="mt-1 text-body text-neutral-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

/* ---------- Table ---------- */
export const th = 'h-10 whitespace-nowrap border-b border-neutral-200 bg-neutral-50 px-4 text-left text-label text-neutral-500';
export const td = 'h-row border-b border-neutral-200 px-4 text-body';

export function Pagination({ page, total, pageSize, onChange }: { page: number; total: number; pageSize: number; onChange: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;
  const ini = (page - 1) * pageSize + 1;
  const fim = Math.min(total, page * pageSize);
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4">
      <p className="text-caption text-neutral-500 tabular-nums">
        Mostrando {ini}–{fim} de {total}
      </p>
      <div className="flex items-center gap-1">
        <IconButton icon={ChevronLeft} label="Página anterior" disabled={page <= 1} onClick={() => onChange(page - 1)} />
        {Array.from({ length: pages }, (_, i) => i + 1)
          .filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1)
          .map((n, i, arr) => (
            <span key={n} className="flex items-center">
              {i > 0 && n - arr[i - 1] > 1 && <span className="px-1 text-neutral-500">…</span>}
              <button
                onClick={() => onChange(n)}
                aria-current={n === page ? 'page' : undefined}
                className={cx('h-control-sm min-w-8 rounded-md px-2 text-label tabular-nums', n === page ? 'bg-primary-600 text-on-primary' : 'text-neutral-500 hover:bg-neutral-50')}
              >
                {n}
              </button>
            </span>
          ))}
        <IconButton icon={ChevronRight} label="Próxima página" disabled={page >= pages} onClick={() => onChange(page + 1)} />
      </div>
    </div>
  );
}

export function usePaginacao<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(items.length / pageSize));
  const atual = Math.min(page, pages);
  return { page: atual, setPage, pageSize, total: items.length, slice: items.slice((atual - 1) * pageSize, atual * pageSize) };
}

/* ---------- Modal ---------- */
export function Modal({ open, onClose, title, children, footer, size = 'md' }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode; size?: 'sm' | 'md' | 'lg' }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div role="dialog" aria-modal="true" aria-label={title} className={cx('relative flex max-h-[90vh] w-full flex-col rounded-lg bg-neutral-0 shadow-lg', size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : 'max-w-xl')}>
        <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-6 py-4">
          <h2 className="text-h2 text-neutral-900">{title}</h2>
          <IconButton icon={X} label="Fechar" onClick={onClose} />
        </div>
        <div className="overflow-y-auto px-6 py-6">{children}</div>
        {footer && <div className="flex justify-end gap-3 border-t border-neutral-200 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmModal({ open, title, message, confirmLabel = 'Confirmar', onConfirm, onClose }: { open: boolean; title: string; message: ReactNode; confirmLabel?: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Voltar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-body text-neutral-500">{message}</p>
    </Modal>
  );
}

/* ---------- Misc ---------- */
export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-50 text-neutral-500">
        <Icon size={24} aria-hidden />
      </span>
      <div>
        <p className="text-h3 text-neutral-900">{title}</p>
        {description && <p className="mt-1 text-body text-neutral-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Avatar({ nome, size = 32 }: { nome: string; size?: number }) {
  const ini = nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
  return (
    <span style={{ width: size, height: size }} className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary-50 text-caption font-semibold text-primary-600">
      {ini}
    </span>
  );
}

export function Segmented<T extends string | number>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-md border border-neutral-200 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          aria-pressed={o.value === value}
          className={cx('h-7 rounded-sm px-3 text-label transition-colors', o.value === value ? 'bg-primary-600 text-on-primary' : 'text-neutral-500 hover:text-neutral-900')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
