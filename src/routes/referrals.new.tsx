import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { patients, practitioners, specialties } from "@/lib/mock-data";
import { toast } from "sonner";
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Paperclip,
  Stethoscope,
  Upload,
  User2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/referrals/new")({
  head: () => ({
    meta: [
      { title: "New referral — Refera" },
      {
        name: "description",
        content:
          "Create a new specialist referral with patient context, clinical detail, and attachments.",
      },
    ],
  }),
  component: NewReferral,
});

type StepKey = "patient" | "clinical" | "specialist" | "attachments" | "review";

const steps: { key: StepKey; label: string; hint: string; icon: typeof User2 }[] = [
  { key: "patient", label: "Patient", hint: "Select & confirm consent", icon: User2 },
  { key: "clinical", label: "Clinical", hint: "Reason, diagnosis, urgency", icon: Stethoscope },
  { key: "specialist", label: "Specialist", hint: "Route to the right clinician", icon: FileText },
  { key: "attachments", label: "Attachments", hint: "Supporting documents", icon: Paperclip },
  { key: "review", label: "Review", hint: "Final check & submit", icon: Check },
];

function NewReferral() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [attempted, setAttempted] = useState<Record<number, boolean>>({});

  const [patientId, setPatientId] = useState(patients[0].id);
  const [consent, setConsent] = useState(false);

  const [reason, setReason] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [urgency, setUrgency] = useState<"" | "routine" | "urgent" | "emergency">("");

  const [specialty, setSpecialty] = useState("");
  const [specialistId, setSpecialistId] = useState("");

  const [files, setFiles] = useState<{ name: string; size: string }[]>([]);

  const patient = patients.find((p) => p.id === patientId)!;
  const specialist = practitioners.find((p) => p.id === specialistId);

  const errors = useMemo(() => {
    const e: Record<StepKey, string[]> = {
      patient: [],
      clinical: [],
      specialist: [],
      attachments: [],
      review: [],
    };
    if (!patientId) e.patient.push("Select a patient.");
    if (!consent) e.patient.push("Patient consent must be confirmed.");

    if (reason.trim().length < 10)
      e.clinical.push("Reason for referral must be at least 10 characters.");
    if (diagnosis.trim().length < 3)
      e.clinical.push("Provisional diagnosis is required.");
    if (!urgency) e.clinical.push("Select an urgency level.");

    if (!specialty) e.specialist.push("Select a specialty.");
    if (!specialistId) e.specialist.push("Select a specialist.");

    return e;
  }, [patientId, consent, reason, diagnosis, urgency, specialty, specialistId]);

  const currentKey = steps[step].key;
  const currentErrors = errors[currentKey];
  const canContinue = currentErrors.length === 0;

  const handleNext = () => {
    setAttempted((a) => ({ ...a, [step]: true }));
    if (!canContinue) {
      toast.error("Please complete the required fields before continuing.");
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const submit = () => {
    const blocking = (Object.keys(errors) as StepKey[]).some(
      (k) => k !== "review" && errors[k].length > 0,
    );
    if (blocking) {
      toast.error("There are unresolved fields. Please review each step.");
      return;
    }
    toast.success("Referral submitted", {
      description: `${patient.name} → ${specialist?.name} (${specialty})`,
    });
    navigate({ to: "/referrals" });
  };

  const showErrors = attempted[step] && currentErrors.length > 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-8 px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <header className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Referral workflow
          </div>
          <h1 className="font-display text-4xl font-normal text-foreground">
            Create a new referral
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            A FHIR-compliant <code className="text-foreground/80">ServiceRequest</code> is
            generated from the structured fields below. All five steps must be completed
            before the referral can leave your inbox.
          </p>
        </header>

        {/* Stepper */}
        <ol className="grid grid-cols-5 gap-2 rounded-xl border border-border/60 bg-card/40 p-2 backdrop-blur">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const isDone = i < step;
            const isCurrent = i === step;
            const stepHasErrors = attempted[i] && errors[s.key].length > 0;
            return (
              <li key={s.key}>
                <button
                  type="button"
                  onClick={() => i < step && setStep(i)}
                  disabled={i > step}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all",
                    isCurrent && "bg-primary/10 ring-1 ring-primary/30",
                    isDone && "hover:bg-accent/40 cursor-pointer",
                    !isCurrent && !isDone && "opacity-60",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors",
                      isDone && "border-transparent bg-gradient-primary text-primary-foreground",
                      isCurrent && "border-primary text-primary",
                      !isDone && !isCurrent && "border-border text-muted-foreground",
                      stepHasErrors && "border-destructive text-destructive",
                    )}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Step {i + 1}
                    </span>
                    <span
                      className={cn(
                        "block truncate text-sm font-semibold",
                        isCurrent ? "text-foreground" : "text-foreground/80",
                      )}
                    >
                      {s.label}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Card */}
        <Card className="border-border/60 bg-card/60 shadow-elegant backdrop-blur">
          <CardHeader className="border-b border-border/60">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-semibold">{steps[step].label}</CardTitle>
                <CardDescription>{steps[step].hint}</CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">
                {step + 1} / {steps.length}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {step === 0 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="patient">Patient *</Label>
                  <Select value={patientId} onValueChange={setPatientId}>
                    <SelectTrigger id="patient">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} · {p.mrn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-xl border border-border/60 bg-background/40 p-5">
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-primary text-primary-foreground">
                      <User2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <div className="text-base font-semibold">{patient.name}</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {patient.mrn}
                        </div>
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        DOB {patient.dob} · {patient.sex} · {patient.phone}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {patient.problems.map((pr) => (
                          <Badge key={pr} variant="secondary" className="font-normal">
                            {pr}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                    consent
                      ? "border-primary/40 bg-primary/5"
                      : "border-border/60 bg-background/40 hover:border-border",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm">
                    <span className="font-medium text-foreground">Consent confirmed</span>
                    <span className="mt-0.5 block text-muted-foreground">
                      The patient has consented to sharing their record with the receiving
                      specialist, in line with HIPAA & GDPR requirements.
                    </span>
                  </span>
                </label>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for referral *</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe the clinical question and what you'd like the specialist to address…"
                    className="min-h-[120px] resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {reason.trim().length}/10 characters minimum
                  </p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Provisional diagnosis *</Label>
                    <Input
                      id="diagnosis"
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      placeholder="e.g. Persistent atrial fibrillation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency *</Label>
                    <Select
                      value={urgency}
                      onValueChange={(v) => setUrgency(v as typeof urgency)}
                    >
                      <SelectTrigger id="urgency">
                        <SelectValue placeholder="Select urgency level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Routine — within 4 weeks</SelectItem>
                        <SelectItem value="urgent">Urgent — within 7 days</SelectItem>
                        <SelectItem value="emergency">Emergency — same day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="specialty">Specialty *</Label>
                  <Select
                    value={specialty}
                    onValueChange={(v) => {
                      setSpecialty(v);
                      setSpecialistId("");
                    }}
                  >
                    <SelectTrigger id="specialty">
                      <SelectValue placeholder="Choose a specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialist">Specialist *</Label>
                  <Select
                    value={specialistId}
                    onValueChange={setSpecialistId}
                    disabled={!specialty}
                  >
                    <SelectTrigger id="specialist">
                      <SelectValue
                        placeholder={
                          specialty ? "Choose a clinician" : "Select a specialty first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {practitioners
                        .filter(
                          (p) =>
                            p.role === "Specialist" &&
                            (!specialty || p.specialty === specialty),
                        )
                        .map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} · {p.organization}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                {specialist && (
                  <div className="rounded-xl border border-border/60 bg-background/40 p-4 text-sm">
                    <div className="font-semibold">{specialist.name}</div>
                    <div className="text-muted-foreground">
                      {specialist.specialty} · {specialist.organization}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <label className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border/80 bg-background/30 p-10 text-center transition-colors hover:border-primary/40 hover:bg-primary/5">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-accent/60 group-hover:bg-primary/10">
                    <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="text-sm font-medium">Drop files or click to upload</div>
                  <div className="text-xs text-muted-foreground">
                    PDF, JPG, PNG up to 20 MB each · Optional
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    onChange={(e) => {
                      const list = Array.from(e.target.files ?? []).map((f) => ({
                        name: f.name,
                        size: `${Math.max(1, Math.round(f.size / 1024))} KB`,
                      }));
                      setFiles((cur) => [...cur, ...list]);
                    }}
                  />
                </label>
                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-lg border border-border/60 bg-background/40 px-3 py-2.5 text-sm"
                      >
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 truncate">{f.name}</div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {f.size}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setFiles((cur) => cur.filter((_, idx) => idx !== i))
                          }
                          className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="divide-y divide-border/60 rounded-xl border border-border/60 bg-background/40">
                <Row k="Patient" v={`${patient.name} · ${patient.mrn}`} />
                <Row
                  k="Specialist"
                  v={specialist ? `${specialist.name} (${specialty})` : "—"}
                />
                <Row
                  k="Urgency"
                  v={urgency ? urgency.charAt(0).toUpperCase() + urgency.slice(1) : "—"}
                />
                <Row k="Reason" v={reason || "—"} />
                <Row k="Diagnosis" v={diagnosis || "—"} />
                <Row k="Attachments" v={files.length ? `${files.length} file(s)` : "None"} />
                <Row k="Consent" v={consent ? "Confirmed" : "Not confirmed"} />
              </div>
            )}

            {showErrors && (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive-foreground">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <div>
                  <div className="font-medium text-destructive">
                    Complete required fields to continue
                  </div>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-destructive/90">
                    {currentErrors.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
            className="gap-1.5"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={submit}
              className="gap-1.5 bg-gradient-primary text-primary-foreground shadow-glow"
            >
              <Check className="h-4 w-4" /> Submit referral
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3 text-sm">
      <div className="text-muted-foreground">{k}</div>
      <div className="max-w-[60%] text-right text-foreground">{v}</div>
    </div>
  );
}