import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import {
  referrals,
  patients,
  appointments,
  getPatient,
  getPractitioner,
  statusMeta,
  urgencyMeta,
} from "@/lib/mock-data";
import { ArrowUpRight, Inbox, Clock3, CheckCircle2, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Refera" },
      { name: "description", content: "Live overview of referrals, triage queue, and upcoming appointments." },
    ],
  }),
  component: Dashboard,
});

function Stat({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "warn" | "success" | "danger";
}) {
  const ring =
    tone === "warn"
      ? "text-[oklch(var(--status-warn))] bg-[var(--status-warn-bg)]"
      : tone === "success"
        ? "text-[oklch(var(--status-success))] bg-[var(--status-success-bg)]"
        : tone === "danger"
          ? "text-[oklch(var(--status-danger))] bg-[var(--status-danger-bg)]"
          : "text-[oklch(var(--status-info))] bg-[var(--status-info-bg)]";
  return (
    <Card className="glass-panel border-border/60">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
            {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
          </div>
          <div className={`h-9 w-9 rounded-lg grid place-items-center ${ring}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const open = referrals.filter((r) => ["submitted", "accepted", "scheduled"].includes(r.status));
  const urgent = referrals.filter((r) => r.urgency !== "routine" && r.status !== "completed");
  const completed = referrals.filter((r) => r.status === "completed");
  const recent = [...referrals]
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, 5);
  const upcoming = [...appointments]
    .filter((a) => +new Date(a.startsAt) >= Date.now() - 86400000)
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))
    .slice(0, 4);

  return (
    <AppShell>
      <div className="px-6 py-6 max-w-[1400px] mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Good morning, Dr. Voss</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here's what needs your attention today.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Open referrals" value={open.length} hint="Across all specialties" icon={Inbox} />
          <Stat label="Awaiting triage" value={referrals.filter((r) => r.status === "submitted").length} hint="Submitted, not accepted" icon={Clock3} tone="warn" />
          <Stat label="Urgent / emergency" value={urgent.length} hint="Action needed" icon={AlertTriangle} tone="danger" />
          <Stat label="Closed this month" value={completed.length} hint="Loop completed" icon={CheckCircle2} tone="success" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 glass-panel border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Recent referrals</CardTitle>
              <Link to="/referrals" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {recent.map((r) => {
                  const p = getPatient(r.patientId)!;
                  const sp = getPractitioner(r.toSpecialistId)!;
                  const sm = statusMeta(r.status);
                  const um = urgencyMeta(r.urgency);
                  return (
                    <Link
                      key={r.id}
                      to="/referrals/$id"
                      params={{ id: r.id }}
                      className="flex items-center gap-4 px-5 py-3.5 hover:bg-accent/40 transition-colors"
                    >
                      <div className="h-9 w-9 rounded-full bg-accent grid place-items-center text-xs font-semibold">
                        {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium truncate">{p.name}</div>
                          <div className="text-[11px] text-muted-foreground">· {r.id}</div>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {r.specialty} → {sp.name} · {r.reason}
                        </div>
                      </div>
                      <StatusBadge tone={um.tone}>{um.label}</StatusBadge>
                      <StatusBadge tone={sm.tone}>{sm.label}</StatusBadge>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/60">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Upcoming appointments</CardTitle>
              <Link to="/appointments" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                Calendar <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {upcoming.map((a) => {
                  const p = getPatient(a.patientId)!;
                  const sp = getPractitioner(a.specialistId)!;
                  const d = new Date(a.startsAt);
                  return (
                    <div key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                      <div className="w-12 text-center">
                        <div className="text-[10px] uppercase text-muted-foreground tracking-wider">
                          {d.toLocaleDateString(undefined, { month: "short" })}
                        </div>
                        <div className="text-lg font-semibold leading-none mt-0.5">
                          {d.getDate()}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {sp.specialty} · {sp.name}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        {d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-panel border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Patient panel</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {patients.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                to="/patients"
                className="flex items-center gap-3 rounded-lg border border-border bg-card/60 p-3 hover:border-primary/40 hover:bg-card transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-accent grid place-items-center text-sm font-semibold">
                  {p.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {p.mrn} · {p.problems[0]}
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
