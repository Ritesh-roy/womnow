import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { fetchDoctors, fetchPatients, fetchReferrals, formatMrn, priorityMeta, referralCode, statusMeta } from "@/lib/app-data";
import { useRealtimeTables } from "@/lib/realtime";

export const Route = createFileRoute("/referrals/")({
  head: () => ({
    meta: [
      { title: "Referrals — Refera" },
      { name: "description", content: "Live referral queue with real patient and doctor data." },
    ],
  }),
  component: ReferralsPage,
});

const filters = ["all", "submitted", "accepted", "scheduled", "completed", "rejected", "draft"] as const;

function ReferralsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const [q, setQ] = useState("");
  useRealtimeTables(["referrals", "patients", "doctors"], [["referrals"], ["patients"], ["doctors"]]);
  const { data: referrals = [] } = useQuery({ queryKey: ["referrals"], queryFn: fetchReferrals });
  const { data: patients = [] } = useQuery({ queryKey: ["patients"], queryFn: fetchPatients });
  const { data: doctors = [] } = useQuery({ queryKey: ["doctors"], queryFn: fetchDoctors });

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return referrals
      .filter((r) => (filter === "all" ? true : r.status === filter))
      .filter((r) => {
        if (!term) return true;
        const p = patients.find((x) => x.id === r.patient_id);
        const d = doctors.find((x) => x.id === r.to_doctor_id);
        const hay = `${referralCode(r)} ${p?.name ?? ""} ${p ? formatMrn(p) : ""} ${d?.name ?? ""} ${r.specialty ?? ""} ${r.reason ?? ""} ${r.diagnosis ?? ""}`.toLowerCase();
        return hay.includes(term);
      })
      .sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at));
  }, [doctors, filter, patients, q, referrals]);

  return (
    <AppShell>
      <div className="px-4 sm:px-6 py-5 sm:py-6 max-w-[1400px] mx-auto space-y-5">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Referrals</h1>
            <p className="text-sm text-muted-foreground mt-1">Live referrals update instantly for admin and doctors.</p>
          </div>
          <Link to="/referrals/new">
            <Button className="bg-gradient-primary text-primary-foreground shadow-glow gap-1.5">
              <Plus className="h-4 w-4" /> Refer patient
            </Button>
          </Link>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-0 sm:min-w-[260px] max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient, MRN, doctor, diagnosis…" className="pl-9 h-9 bg-input/60" />
          </div>
          <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-card/40 overflow-x-auto max-w-full no-scrollbar">
            {filters.map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`text-xs px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${filter === f ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <Card className="glass-panel border-border/60 overflow-hidden">
          <CardContent className="p-0">
            <div className="hidden md:grid grid-cols-12 px-5 py-3 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              <div className="col-span-3">Patient</div>
              <div className="col-span-2">Specialty</div>
              <div className="col-span-3">Reason</div>
              <div className="col-span-1">Priority</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-right">Updated</div>
            </div>
            <div className="divide-y divide-border">
              {rows.map((r) => {
                const p = patients.find((x) => x.id === r.patient_id);
                const d = doctors.find((x) => x.id === r.to_doctor_id);
                const sm = statusMeta(r.status);
                const pm = priorityMeta(r.priority);
                const updated = new Date(r.updated_at);
                return (
                  <Link key={r.id} to="/referrals/$id" params={{ id: r.id }} className="block md:grid md:grid-cols-12 md:items-center px-4 sm:px-5 py-3.5 hover:bg-accent/40 transition-colors text-sm">
                    <div className="md:hidden space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-medium truncate">{p?.name ?? "Unknown patient"}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{referralCode(r)} · {p ? formatMrn(p) : "No MRN"}</div>
                        </div>
                        <div className="text-[10px] text-muted-foreground tabular-nums shrink-0">{updated.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</div>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{r.specialty ?? "Referral"} · {d?.name ?? "Unassigned doctor"}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{r.reason ?? "No reason entered"}</div>
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5"><StatusBadge tone={pm.tone} dot={false}>{pm.label}</StatusBadge><StatusBadge tone={sm.tone}>{sm.label}</StatusBadge></div>
                    </div>
                    <div className="hidden md:block col-span-3 min-w-0"><div className="font-medium truncate">{p?.name ?? "Unknown patient"}</div><div className="text-xs text-muted-foreground truncate">{referralCode(r)} · {p ? formatMrn(p) : "No MRN"}</div></div>
                    <div className="hidden md:block col-span-2 min-w-0"><div className="truncate">{r.specialty ?? "—"}</div><div className="text-xs text-muted-foreground truncate">{d?.name ?? "Unassigned"}</div></div>
                    <div className="hidden md:block col-span-3 min-w-0 text-muted-foreground truncate">{r.reason ?? "—"}</div>
                    <div className="hidden md:block col-span-1"><StatusBadge tone={pm.tone} dot={false}>{pm.label}</StatusBadge></div>
                    <div className="hidden md:block col-span-2"><StatusBadge tone={sm.tone}>{sm.label}</StatusBadge></div>
                    <div className="hidden md:block col-span-1 text-right text-xs text-muted-foreground tabular-nums">{updated.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</div>
                  </Link>
                );
              })}
              {rows.length === 0 && <div className="px-5 py-12 text-center text-sm text-muted-foreground">No live referrals match your filters.</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}