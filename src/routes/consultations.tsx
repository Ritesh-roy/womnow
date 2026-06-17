import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { fetchConsultations, fetchDoctors, fetchPatients, fetchReferrals, referralCode } from "@/lib/app-data";
import { useRealtimeTables } from "@/lib/realtime";

export const Route = createFileRoute("/consultations")({
  head: () => ({ meta: [{ title: "Consultations — Refera" }] }),
  component: ConsultsPage,
});

function ConsultsPage() {
  useRealtimeTables(["consultations", "patients", "doctors", "referrals"], [["consultations"], ["patients"], ["doctors"], ["referrals"]]);
  const { data: consultations = [] } = useQuery({ queryKey: ["consultations"], queryFn: fetchConsultations });
  const { data: patients = [] } = useQuery({ queryKey: ["patients"], queryFn: fetchPatients });
  const { data: doctors = [] } = useQuery({ queryKey: ["doctors"], queryFn: fetchDoctors });
  const { data: referrals = [] } = useQuery({ queryKey: ["referrals"], queryFn: fetchReferrals });
  return (
    <AppShell>
      <div className="px-4 sm:px-6 py-5 sm:py-6 max-w-[1100px] mx-auto space-y-5">
        <div><h1 className="text-2xl font-semibold tracking-tight">Consultations</h1><p className="text-sm text-muted-foreground mt-1">Live outcome notes returned by specialists.</p></div>
        <div className="space-y-3">
          {consultations.map((c) => {
            const p = patients.find((x) => x.id === c.patient_id);
            const sp = doctors.find((x) => x.id === c.doctor_id);
            const r = referrals.find((x) => x.id === c.referral_id);
            return (
              <Card key={c.id} className="glass-panel border-border/60"><CardContent className="p-5 space-y-3"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2"><FileText className="h-4 w-4 text-primary" />{r ? <Link to="/referrals/$id" params={{ id: r.id }} className="text-sm font-medium hover:underline">{p?.name ?? "Unknown patient"} · {r.specialty ?? referralCode(r)}</Link> : <span className="text-sm font-medium">{p?.name ?? "Unknown patient"}</span>}</div><div className="text-xs text-muted-foreground mt-0.5">{sp?.name ?? "Doctor"} · {new Date(c.consultation_date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</div></div></div><div className="grid sm:grid-cols-3 gap-4 text-sm"><Field label="Summary">{c.summary ?? "—"}</Field><Field label="Recommendations">{c.recommendations ?? "—"}</Field><Field label="Follow-up">{c.follow_up ?? "—"}</Field></div></CardContent></Card>
            );
          })}
          {consultations.length === 0 && <div className="py-12 text-center text-sm text-muted-foreground">No consultations saved yet.</div>}
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</div><div className="mt-1 leading-relaxed">{children}</div></div>;
}