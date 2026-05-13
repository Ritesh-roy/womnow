import { cn } from "@/lib/utils";

type Tone = "info" | "warn" | "success" | "danger" | "neutral";

const toneClass: Record<Tone, string> = {
  info: "text-[oklch(var(--status-info))] bg-[var(--status-info-bg)] ring-[oklch(var(--status-info)/40%)]",
  warn: "text-[oklch(var(--status-warn))] bg-[var(--status-warn-bg)] ring-[oklch(var(--status-warn)/40%)]",
  success: "text-[oklch(var(--status-success))] bg-[var(--status-success-bg)] ring-[oklch(var(--status-success)/40%)]",
  danger: "text-[oklch(var(--status-danger))] bg-[var(--status-danger-bg)] ring-[oklch(var(--status-danger)/40%)]",
  neutral: "text-[oklch(var(--status-neutral))] bg-[var(--status-neutral-bg)] ring-[oklch(var(--status-neutral)/40%)]",
};

export function StatusBadge({
  tone,
  children,
  className,
  dot = true,
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        toneClass[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}