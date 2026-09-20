import Link from "next/link";
import { useId } from "react";
import type {
  ComponentProps,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEventHandler,
  ReactNode,
} from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  LoaderCircle,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  ariaLabel?: string;
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
};

const buttonVariantClass: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  outline: "btn-outline",
  danger: "btn-danger",
};

export function Button({
  children,
  href,
  className,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  loading = false,
  icon,
  ariaLabel,
  onClick,
}: ButtonProps) {
  const classes = cn(
    "btn",
    buttonVariantClass[variant],
    size === "sm" && "btn-sm",
    size === "lg" && "btn-lg",
    loading && "btn-loading",
    className,
  );
  const content = (
    <>
      {loading ? (
        <LoaderCircle size={15} aria-hidden="true" className="animate-spin" />
      ) : (
        icon
      )}
      {children}
    </>
  );

  if (!href || disabled || loading) {
    return (
      <button
        type={type}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        aria-label={ariaLabel}
        onClick={onClick}
        className={classes}
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={href} aria-label={ariaLabel} onClick={onClick} className={classes}>
      {icon}
      {children}
    </Link>
  );
}

type CardVariant =
  | "default"
  | "interactive"
  | "metric"
  | "developer"
  | "repository"
  | "empty"
  | "error";

export function Card({
  children,
  className,
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
}) {
  return (
    <section
      className={cn(
        "card-surface p-5",
        variant !== "default" && `card-surface--${variant}`,
        variant === "interactive" && "card-surface--interactive",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div className="card-surface card-surface--metric">
      <p className="text-metadata">{label}</p>
      <p className="text-statistic mt-3">{value}</p>
      {detail && <p className="text-caption mt-2">{detail}</p>}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-header">
      {eyebrow && <p className="text-metadata">{eyebrow}</p>}
      <h1 className="text-page-title mt-3">{title}</h1>
      {description && <p className="text-body-secondary mt-3">{description}</p>}
      {actions && <div className="page-header__actions">{actions}</div>}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
      <div className="min-w-0">
        {eyebrow && <p className="text-metadata mb-2">{eyebrow}</p>}
        <h2 className="text-section-title">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function ExternalLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-1 text-ink2 transition-colors hover:text-brand1",
        className,
      )}
    >
      {children}
      <ArrowUpRight size={14} aria-hidden="true" />
    </a>
  );
}

export function Empty({
  title,
  detail,
  icon,
  action,
}: {
  title: string;
  detail: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="card-surface card-surface--empty px-6 py-14">
      <span className="mx-auto grid size-11 place-items-center rounded-full border border-line bg-panel text-ink3">
        {icon ?? <BarChart3 size={18} aria-hidden="true" />}
      </span>
      <p className="text-card-title mt-4">{title}</p>
      <p className="text-body-secondary mx-auto mt-1.5 max-w-md">{detail}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorCard({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: ReactNode;
}) {
  return (
    <div className="card-surface card-surface--error text-center" role="alert">
      <strong className="text-card-title block">{title}</strong>
      <p className="text-body-secondary mx-auto mt-2 max-w-md">{detail}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export type TabOption<Value extends string> = {
  value: Value;
  label: string;
  icon?: ReactNode;
};

export function Tabs<Value extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: Value;
  options: TabOption<Value>[];
  onChange: (value: Value) => void;
  className?: string;
}) {
  function onKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowRight" &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }

    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    );
    if (!tabs.length) return;
    event.preventDefault();
    const current = tabs.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      event.key === "ArrowRight"
        ? (current + 1) % tabs.length
        : event.key === "ArrowLeft"
          ? (current - 1 + tabs.length) % tabs.length
          : event.key === "Home"
            ? 0
            : tabs.length - 1;
    tabs[next]?.focus();
    onChange(options[next].value);
  }

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn("tabs", className)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="tab"
          aria-selected={value === option.value}
          tabIndex={value === option.value ? 0 : -1}
          onClick={() => onChange(option.value)}
          className="tab"
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}

type TextInputProps = Omit<
  ComponentProps<"input">,
  "id" | "value" | "onChange" | "className" | "size"
> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  inputClassName?: string;
};

export function TextInput({
  label,
  value,
  onChange,
  error,
  className,
  inputClassName,
  ...props
}: TextInputProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={className}>
      <label htmlFor={id} className="text-label">
        {label}
      </label>
      <input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn("input-shell mt-2", error && "is-invalid", inputClassName)}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export type SearchAction = {
  label: string;
  onAction: () => void;
  icon?: ReactNode;
};

export function SearchField({
  label,
  value,
  onChange,
  placeholder,
  loading = false,
  autoFocus = false,
  action,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  autoFocus?: boolean;
  action?: SearchAction;
  className?: string;
}) {
  const id = useId();

  return (
    <div className={cn("search-pill", className)}>
      <Search size={20} aria-hidden="true" className="search-pill__icon" />
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        autoFocus={autoFocus}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className="search-pill__input"
      />
      {loading && (
        <LoaderCircle
          size={18}
          aria-hidden="true"
          className="shrink-0 animate-spin text-ink3"
        />
      )}
      {action && (
        <button
          type="button"
          aria-label={action.label}
          title={action.label}
          onClick={action.onAction}
          className="search-pill__action"
        >
          {action.icon ?? <ArrowRight size={17} aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}

type BadgeTone = "default" | "success" | "warning" | "danger" | "info";

function toneClass(prefix: "badge" | "pill", tone: BadgeTone) {
  return tone === "default" ? "" : `${prefix}--${tone}`;
}

export function Badge({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span className={cn("badge", toneClass("badge", tone), className)}>
      {children}
    </span>
  );
}

export function Pill({
  children,
  tone = "default",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span className={cn("pill", toneClass("pill", tone), className)}>
      {children}
    </span>
  );
}
