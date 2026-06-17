import { supabase } from "@/integrations/supabase/client";

export type PatientRow = Awaited<ReturnType<typeof fetchPatients>>[number];
export type DoctorRow = Awaited<ReturnType<typeof fetchDoctors>>[number];
export type HospitalRow = Awaited<ReturnType<typeof fetchHospitals>>[number];
export type ReferralRow = Awaited<ReturnType<typeof fetchReferrals>>[number];
export type AppointmentRow = Awaited<ReturnType<typeof fetchAppointments>>[number];
export type ActivityRow = Awaited<ReturnType<typeof fetchActivity>>[number];
export type ConsultationRow = Awaited<ReturnType<typeof fetchConsultations>>[number];
export type SessionRow = Awaited<ReturnType<typeof fetchUserSessions>>[number];

type BadgeTone = "info" | "warn" | "success" | "danger" | "neutral";

export async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function fetchPatients() {
  const { data, error } = await supabase.from("patients").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchDoctors() {
  const { data, error } = await supabase.from("doctors").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function fetchHospitals() {
  const { data, error } = await supabase.from("hospitals").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchReferrals() {
  const { data, error } = await supabase.from("referrals").select("*").order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchAppointments() {
  const { data, error } = await supabase.from("appointments").select("*").order("starts_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchConsultations() {
  const { data, error } = await supabase.from("consultations").select("*").order("consultation_date", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function fetchActivity() {
  const { data, error } = await supabase
    .from("user_activity")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

export async function fetchUserSessions() {
  const { data, error } = await supabase
    .from("user_sessions")
    .select("*")
    .order("login_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

export function formatMrn(patient: Pick<PatientRow, "id" | "mrn">) {
  return patient.mrn ?? `MRN-${patient.id.slice(0, 6).toUpperCase()}`;
}

export function ageFromDob(dob: string | null) {
  if (!dob) return "—";
  return Math.max(0, Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 86400000))).toString();
}

export function referralCode(referral: Pick<ReferralRow, "id" | "ref_code">) {
  return referral.ref_code ?? `REF-${referral.id.slice(0, 8).toUpperCase()}`;
}

export function statusMeta(status: string | null | undefined): { label: string; tone: BadgeTone } {
  const key = (status ?? "submitted").toLowerCase();
  const map: Record<string, { label: string; tone: BadgeTone }> = {
    draft: { label: "Draft", tone: "neutral" },
    submitted: { label: "Submitted", tone: "info" },
    accepted: { label: "Accepted", tone: "info" },
    scheduled: { label: "Scheduled", tone: "warn" },
    completed: { label: "Completed", tone: "success" },
    rejected: { label: "Rejected", tone: "danger" },
    cancelled: { label: "Cancelled", tone: "danger" },
    active: { label: "Active", tone: "success" },
    inactive: { label: "Inactive", tone: "neutral" },
  };
  return map[key] ?? { label: key.charAt(0).toUpperCase() + key.slice(1), tone: "neutral" };
}

export function priorityMeta(priority: string | null | undefined): { label: string; tone: BadgeTone } {
  const key = (priority ?? "routine").toLowerCase();
  const map: Record<string, { label: string; tone: BadgeTone }> = {
    routine: { label: "Routine", tone: "info" },
    urgent: { label: "Urgent", tone: "warn" },
    emergency: { label: "Emergency", tone: "danger" },
  };
  return map[key] ?? { label: key.charAt(0).toUpperCase() + key.slice(1), tone: "neutral" };
}

export function fullNameInitials(name: string | null | undefined) {
  return (name ?? "?")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}