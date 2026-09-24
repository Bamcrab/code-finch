import { useEffect, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Gem } from '../art/misc';
import { IconBack, IconX } from './icons';

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}

type BtnVariant = 'primary' | 'soft' | 'ghost' | 'warm' | 'danger' | 'outline';

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  block,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: 'sm' | 'md' | 'lg'; block?: boolean }) {
  const v: Record<BtnVariant, string> = {
    primary: 'bg-accent text-accent-ink shadow-card hover:brightness-105 active:brightness-95',
    soft: 'bg-accent-soft text-accent hover:brightness-[1.02]',
    ghost: 'bg-transparent text-ink hover:bg-surface-2',
    warm: 'bg-warm text-white shadow-card hover:brightness-105',
    danger: 'bg-danger-soft text-danger hover:brightness-[1.02]',
    outline: 'bg-surface text-ink border border-line hover:bg-surface-2',
  };
  // Inline buttons never wrap; full-width ones may hold long text (e.g. discovery replies), so they grow instead.
  const s = block
    ? { sm: 'min-h-8 px-3 py-1 text-sm', md: 'min-h-11 px-4 py-2', lg: 'min-h-13 px-6 py-2 text-lg' }[size]
    : { sm: 'h-8 px-3 text-sm', md: 'h-11 px-4', lg: 'h-13 px-6 text-lg' }[size];
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-2xl font-bold transition active:scale-[0.97] disabled:opacity-45 disabled:active:scale-100',
        block ? 'w-full text-center' : 'whitespace-nowrap',
        v[variant],
        s,
        className,
      )}
      {...rest}
    />
  );
}

export function Card({ className, children, onClick }: { className?: string; children: ReactNode; onClick?: () => void }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag onClick={onClick} className={cx('block w-full text-left rounded-3xl bg-surface shadow-card p-4', onClick && 'active:scale-[0.99] transition', className)}>
      {children}
    </Tag>
  );
}

export function Chip({
  active,
  children,
  onClick,
  className,
  color,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        'shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-sm font-bold border transition whitespace-nowrap',
        active ? 'bg-accent text-accent-ink border-accent' : 'bg-surface text-ink border-line hover:bg-surface-2',
        className,
      )}
      style={active && color ? { background: color, borderColor: color, color: '#2f2a25' } : undefined}
    >
      {children}
    </button>
  );
}

export function Progress({ value, max = 1, className, barClass, color }: { value: number; max?: number; className?: string; barClass?: string; color?: string }) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(0.0001, max)) * 100));
  return (
    <div className={cx('h-3 rounded-full bg-surface-3 overflow-hidden', className)}>
      <div className={cx('h-full rounded-full transition-[width] duration-500', barClass ?? 'bg-accent')} style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export function StonesPill({ amount, className }: { amount: number; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-1 rounded-full bg-surface px-2.5 h-8 text-sm font-extrabold shadow-card', className)}>
      <Gem className="w-4 h-4" />
      {amount.toLocaleString()}
    </span>
  );
}

export function Price({ amount, className }: { amount: number; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-1 font-extrabold', className)}>
      <Gem className="w-3.5 h-3.5" />
      {amount === 0 ? 'Free' : amount.toLocaleString()}
    </span>
  );
}

export function Page({ title, back, right, children, className, subtitle }: { title?: ReactNode; back?: boolean | string; right?: ReactNode; children: ReactNode; className?: string; subtitle?: ReactNode }) {
  const nav = useNavigate();
  return (
    <div className={cx('min-h-full pb-28', className)}>
      {(title || back) && (
        <header className="sticky top-0 z-20 bg-bg/90 backdrop-blur safe-top">
          <div className="mx-auto max-w-xl flex items-center gap-2 px-4 h-14">
            {back && (
              <button
                aria-label="Back"
                onClick={() => (typeof back === 'string' ? nav(back) : nav(-1))}
                className="-ml-2 w-10 h-10 grid place-items-center rounded-full hover:bg-surface-2"
              >
                <IconBack className="w-6 h-6" />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-black truncate">{title}</h1>
              {subtitle && <p className="text-xs text-muted -mt-0.5 truncate">{subtitle}</p>}
            </div>
            {right}
          </div>
        </header>
      )}
      <main className="mx-auto max-w-xl px-4">{children}</main>
    </div>
  );
}

export function SectionTitle({ children, right, className }: { children: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <div className={cx('flex items-center justify-between mt-6 mb-2 px-1', className)}>
      <h2 className="text-sm font-black uppercase tracking-wide text-muted">{children}</h2>
      {right}
    </div>
  );
}

export function Sheet({ open, onClose, title, children, className }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; className?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/35 fade-in" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={cx('relative w-full max-w-xl max-h-[88vh] overflow-y-auto rounded-t-[28px] sm:rounded-[28px] bg-bg p-5 pb-8 safe-bottom slide-up', className)}
      >
        <div className="mx-auto -mt-2 mb-3 h-1.5 w-10 rounded-full bg-surface-3 sm:hidden" />
        {title && (
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-black">{title}</h2>
            <button aria-label="Close" onClick={onClose} className="w-9 h-9 grid place-items-center rounded-full hover:bg-surface-2">
              <IconX />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; hint?: ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-4 py-2 cursor-pointer">
      <span>
        <span className="font-bold block">{label}</span>
        {hint && <span className="text-sm text-muted">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx('relative w-12 h-7 shrink-0 rounded-full transition', checked ? 'bg-accent' : 'bg-surface-3')}
      >
        <span className={cx('absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all', checked ? 'left-6' : 'left-1')} />
      </button>
    </label>
  );
}

export function Segmented<T extends string | number>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode }[];
  className?: string;
}) {
  return (
    <div className={cx('flex p-1 rounded-2xl bg-surface-2 gap-1', className)}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={cx('flex-1 h-9 rounded-xl text-sm font-bold transition', value === o.value ? 'bg-surface shadow-card text-ink' : 'text-muted')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Stepper({ value, onChange, min = 1, max = 100, suffix }: { value: number; onChange: (v: number) => void; min?: number; max?: number; suffix?: string }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-2xl bg-surface-2 p-1">
      <button type="button" aria-label="Decrease" className="w-9 h-9 rounded-xl bg-surface font-black" onClick={() => onChange(Math.max(min, value - 1))}>
        −
      </button>
      <span className="min-w-12 text-center font-extrabold">
        {value}
        {suffix}
      </span>
      <button type="button" aria-label="Increase" className="w-9 h-9 rounded-xl bg-surface font-black" onClick={() => onChange(Math.min(max, value + 1))}>
        +
      </button>
    </div>
  );
}

export function Field({ label, children, hint }: { label: ReactNode; children: ReactNode; hint?: ReactNode }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-extrabold text-muted mb-1.5 px-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted mt-1 px-1">{hint}</span>}
    </label>
  );
}

export const inputClass = 'w-full h-12 rounded-2xl bg-surface border border-line px-4 outline-none focus:border-accent transition';
export const textareaClass = 'w-full rounded-2xl bg-surface border border-line px-4 py-3 outline-none focus:border-accent transition resize-none';

export function Empty({ emoji, title, children }: { emoji: string; title: string; children?: ReactNode }) {
  return (
    <div className="text-center py-10 px-6">
      <div className="text-5xl mb-3">{emoji}</div>
      <p className="font-black text-lg">{title}</p>
      {children && <div className="text-muted mt-1">{children}</div>}
    </div>
  );
}

const EMOJIS =
  '⭐ ✅ 💧 🪥 🚿 🛁 🧴 💊 🛏️ 😴 🌙 ☀️ 🌅 🧘 🌬️ 🚶 🏃 🚲 🏋️ 🤸 💃 🧹 🧽 🧺 🗑️ 🍽️ 🍳 🥗 🍎 🥕 ☕ 🍵 📚 📖 ✍️ 📝 💻 📧 📞 💬 💌 🤗 🐶 🐱 🪴 🌱 🌻 🌳 🏠 🔧 🧰 🪛 🔋 💡 🚗 🛞 🧯 🔔 🌀 🧊 🚽 🪟 🧼 🎨 🎸 🎧 🎮 🧩 🙏 💛 😊 💭 🎯 ⏱️ 🗓️ 💸 🛒 📦 ✂️ 🦷 👕 🧦 🐾 🌈'.split(
    ' ',
  );

export function EmojiPicker({ value, onChange }: { value: string; onChange: (e: string) => void }) {
  const [custom, setCustom] = useState('');
  return (
    <div>
      <div className="grid grid-cols-8 gap-1.5 max-h-44 overflow-y-auto p-1">
        {EMOJIS.map((e) => (
          <button
            type="button"
            key={e}
            onClick={() => onChange(e)}
            className={cx('h-10 rounded-xl text-xl grid place-items-center transition', value === e ? 'bg-accent-soft ring-2 ring-accent' : 'hover:bg-surface-2')}
          >
            {e}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <input className={cx(inputClass, 'h-10')} placeholder="Or type any emoji…" value={custom} onChange={(e) => setCustom(e.target.value)} />
        <Button
          type="button"
          size="sm"
          variant="soft"
          className="h-10"
          onClick={() => {
            const first = [...custom.trim()].slice(0, 2).join('');
            if (first) onChange(first);
          }}
        >
          Use
        </Button>
      </div>
    </div>
  );
}

export function Confirm({ open, onClose, onConfirm, title, body, confirmLabel = 'Confirm', danger }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; body?: ReactNode; confirmLabel?: string; danger?: boolean }) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      {body && <div className="text-muted mb-5">{body}</div>}
      <div className="flex gap-2">
        <Button variant="outline" block onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant={danger ? 'danger' : 'primary'}
          block
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Sheet>
  );
}

export function Ring({ value, size = 44, stroke = 5, color = 'var(--accent)', children }: { value: number; size?: number; stroke?: number; color?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--surface-3)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeDasharray={c} strokeDashoffset={c * (1 - v)} strokeLinecap="round" className="transition-[stroke-dashoffset] duration-500" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-sm">{children}</div>
    </div>
  );
}
