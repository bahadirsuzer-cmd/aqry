import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-border bg-card p-5 ${className}`}>{children}</section>
  );
}

export function PageTitle({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
}

export function Field({ label, hint, error, children, htmlFor }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-foreground">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

const controlClass =
  "w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/25 disabled:opacity-60";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return <input {...rest} className={`${controlClass} ${className}`} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return <textarea {...rest} className={`${controlClass} min-h-[88px] resize-y ${className}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", ...rest } = props;
  return <select {...rest} className={`${controlClass} ${className}`} />;
}

type ButtonTone = "primary" | "secondary" | "ghost" | "danger";

const toneClass: Record<ButtonTone, string> = {
  primary: "bg-gradient-brand text-primary-foreground hover:brightness-110",
  secondary: "border border-border bg-card text-foreground hover:bg-secondary",
  ghost: "text-muted-foreground hover:bg-secondary hover:text-foreground",
  danger: "border border-destructive/30 text-destructive hover:bg-destructive/10",
};

interface ActionButtonProps {
  tone?: ButtonTone;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  type?: "button" | "submit";
  className?: string;
  title?: string;
}

export function ActionButton({
  tone = "secondary",
  onClick,
  disabled,
  children,
  type = "button",
  className = "",
  title,
}: ActionButtonProps) {
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${toneClass[tone]} ${className}`}
    >
      {children}
    </button>
  );
}

export function StatusPill({ status }: { status: string }) {
  const published = status === "published" || status === "active";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        published ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
      }`}
    >
      {published ? "Yayında" : "Taslak"}
    </span>
  );
}

export function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-2xl font-black tracking-tight text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function RatioBar({ label, value, total }: { label: string; value: number; total: number }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-bold text-primary">%{percent}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
