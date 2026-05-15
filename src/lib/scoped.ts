import { appointments, consultations, patients, referrals, type Appointment, type Consultation, type Patient, type Referral } from "./mock-data";
import { getStoredAppointments } from "./appointments-store";
import type { AuthUser } from "./auth";

export function allAppointments(): Appointment[] {
  return [...appointments, ...getStoredAppointments()];
}

export function scopedReferrals(user: AuthUser | null): Referral[] {
  if (!user || user.role === "Admin" || !user.practitionerId) return referrals;
  const id = user.practitionerId;
  return referrals.filter((r) => r.fromGpId === id || r.toSpecialistId === id);
}

export function scopedAppointments(user: AuthUser | null): Appointment[] {
  const all = allAppointments();
  if (!user || user.role === "Admin" || !user.practitionerId) return all;
  const id = user.practitionerId;
  // include appointments for the doctor (specialist) OR for referrals that involve them
  const myReferralIds = new Set(scopedReferrals(user).map((r) => r.id));
  return all.filter((a) => a.specialistId === id || myReferralIds.has(a.referralId));
}

export function scopedPatients(user: AuthUser | null): Patient[] {
  if (!user || user.role === "Admin" || !user.practitionerId) return patients;
  const refs = scopedReferrals(user);
  const ids = new Set(refs.map((r) => r.patientId));
  return patients.filter((p) => ids.has(p.id));
}

export function scopedConsultations(user: AuthUser | null): Consultation[] {
  if (!user || user.role === "Admin" || !user.practitionerId) return consultations;
  const id = user.practitionerId;
  const myRefs = new Set(scopedReferrals(user).map((r) => r.id));
  return consultations.filter((c) => c.specialistId === id || myRefs.has(c.referralId));
}
