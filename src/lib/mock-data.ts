export type ReferralStatus =
  | "draft"
  | "submitted"
  | "accepted"
  | "scheduled"
  | "completed"
  | "rejected";

export type Urgency = "routine" | "urgent" | "emergency";

export interface Patient {
  id: string;
  name: string;
  dob: string;
  sex: "M" | "F" | "Other";
  mrn: string;
  phone: string;
  problems: string[];
}

export interface Practitioner {
  id: string;
  name: string;
  role: "GP" | "Specialist" | "Admin";
  specialty?: string;
  organization: string;
}

export interface Referral {
  id: string;
  patientId: string;
  fromGpId: string;
  toSpecialistId: string;
  specialty: string;
  reason: string;
  diagnosis: string;
  urgency: Urgency;
  status: ReferralStatus;
  createdAt: string;
  updatedAt: string;
  attachments: { id: string; name: string; type: string; size: string }[];
  notes?: string;
}

export interface Appointment {
  id: string;
  referralId: string;
  patientId: string;
  specialistId: string;
  startsAt: string;
  durationMin: number;
  location: string;
}

export interface Consultation {
  id: string;
  referralId: string;
  patientId: string;
  specialistId: string;
  date: string;
  summary: string;
  recommendations: string;
  followUp: string;
}

export const patients: Patient[] = [
  { id: "p1", name: "Amelia Hartwell", dob: "1986-04-12", sex: "F", mrn: "MRN-00821", phone: "+44 20 7946 1122", problems: ["Type 2 diabetes", "Hypertension"] },
  { id: "p2", name: "Marcus Doyle", dob: "1972-09-30", sex: "M", mrn: "MRN-00822", phone: "+44 20 7946 2231", problems: ["Persistent atrial fibrillation"] },
  { id: "p3", name: "Priya Raman", dob: "1991-01-08", sex: "F", mrn: "MRN-00823", phone: "+44 20 7946 7745", problems: ["Migraine with aura"] },
  { id: "p4", name: "Jonas Albrecht", dob: "1958-11-22", sex: "M", mrn: "MRN-00824", phone: "+44 20 7946 9988", problems: ["Stage 3 CKD", "Gout"] },
  { id: "p5", name: "Sofia Mendes", dob: "2002-07-17", sex: "F", mrn: "MRN-00825", phone: "+44 20 7946 5520", problems: ["Suspected coeliac disease"] },
  { id: "p6", name: "Henry Okonkwo", dob: "1979-03-04", sex: "M", mrn: "MRN-00826", phone: "+44 20 7946 4471", problems: ["Lower back pain, chronic"] },
];

export const practitioners: Practitioner[] = [
  { id: "u1", name: "Dr. Eleanor Voss", role: "GP", organization: "Riverside Family Practice" },
  { id: "u2", name: "Dr. Samir Patel", role: "GP", organization: "Riverside Family Practice" },
  { id: "u3", name: "Dr. Helena Cho", role: "Specialist", specialty: "Cardiology", organization: "St. Aldwyn Cardiac Centre" },
  { id: "u4", name: "Dr. Idris Bello", role: "Specialist", specialty: "Endocrinology", organization: "Metro Endocrine Group" },
  { id: "u5", name: "Dr. Margot Lin", role: "Specialist", specialty: "Neurology", organization: "Northgate Neuro" },
  { id: "u6", name: "Dr. Ravi Acharya", role: "Specialist", specialty: "Gastroenterology", organization: "Northgate GI" },
  { id: "u8", name: "Dr. Priya Shah", role: "Specialist", specialty: "Dermatology", organization: "Westbridge Skin Clinic" },
  { id: "u9", name: "Dr. Marcus Hale", role: "Specialist", specialty: "Orthopaedics", organization: "Kingsway Orthopaedic Hospital" },
  { id: "u10", name: "Dr. Yuki Tanaka", role: "Specialist", specialty: "Orthopaedics", organization: "Kingsway Orthopaedic Hospital" },
  { id: "u11", name: "Dr. Noor Rahman", role: "Specialist", specialty: "ENT", organization: "Central ENT Associates" },
  { id: "u12", name: "Dr. Beatrice Nolan", role: "Specialist", specialty: "Ophthalmology", organization: "Clearview Eye Centre" },
  { id: "u13", name: "Dr. Owen Fischer", role: "Specialist", specialty: "Psychiatry", organization: "Meridian Mental Health" },
  { id: "u14", name: "Dr. Lucia Romano", role: "Specialist", specialty: "Rheumatology", organization: "Greystone Rheumatology" },
  { id: "u7", name: "Alex Romero", role: "Admin", organization: "Riverside Family Practice" },
];

export const currentUser: Practitioner = practitioners[0];

export const referrals: Referral[] = [
  {
    id: "REF-2041",
    patientId: "p1",
    fromGpId: "u1",
    toSpecialistId: "u4",
    specialty: "Endocrinology",
    reason: "Suboptimal glycaemic control on dual therapy",
    diagnosis: "Type 2 diabetes mellitus, HbA1c 9.2%",
    urgency: "urgent",
    status: "submitted",
    createdAt: "2026-05-11T09:14:00Z",
    updatedAt: "2026-05-11T09:14:00Z",
    attachments: [
      { id: "a1", name: "HbA1c-trend.pdf", type: "application/pdf", size: "84 KB" },
      { id: "a2", name: "lipid-panel.pdf", type: "application/pdf", size: "62 KB" },
    ],
  },
  {
    id: "REF-2042",
    patientId: "p2",
    fromGpId: "u1",
    toSpecialistId: "u3",
    specialty: "Cardiology",
    reason: "New persistent AF, rate not controlled on bisoprolol",
    diagnosis: "Atrial fibrillation, CHA2DS2-VASc 3",
    urgency: "urgent",
    status: "accepted",
    createdAt: "2026-05-09T11:02:00Z",
    updatedAt: "2026-05-10T08:30:00Z",
    attachments: [{ id: "a3", name: "ecg-12lead.pdf", type: "application/pdf", size: "1.1 MB" }],
  },
  {
    id: "REF-2043",
    patientId: "p3",
    fromGpId: "u2",
    toSpecialistId: "u5",
    specialty: "Neurology",
    reason: "Refractory migraine, 12+ headache days/month",
    diagnosis: "Chronic migraine with aura",
    urgency: "routine",
    status: "scheduled",
    createdAt: "2026-05-04T14:20:00Z",
    updatedAt: "2026-05-08T10:00:00Z",
    attachments: [],
  },
  {
    id: "REF-2044",
    patientId: "p4",
    fromGpId: "u2",
    toSpecialistId: "u3",
    specialty: "Cardiology",
    reason: "Pre-op cardiac assessment for elective surgery",
    diagnosis: "Stable angina, CKD stage 3",
    urgency: "routine",
    status: "completed",
    createdAt: "2026-04-22T08:00:00Z",
    updatedAt: "2026-05-02T16:30:00Z",
    attachments: [{ id: "a4", name: "echo-report.pdf", type: "application/pdf", size: "210 KB" }],
  },
  {
    id: "REF-2045",
    patientId: "p5",
    fromGpId: "u1",
    toSpecialistId: "u6",
    specialty: "Gastroenterology",
    reason: "Positive coeliac serology, weight loss",
    diagnosis: "?Coeliac disease",
    urgency: "routine",
    status: "submitted",
    createdAt: "2026-05-12T07:45:00Z",
    updatedAt: "2026-05-12T07:45:00Z",
    attachments: [{ id: "a5", name: "ttg-iga.pdf", type: "application/pdf", size: "48 KB" }],
  },
  {
    id: "REF-2046",
    patientId: "p6",
    fromGpId: "u2",
    toSpecialistId: "u5",
    specialty: "Neurology",
    reason: "Chronic LBP with radicular features unresolved by physio",
    diagnosis: "Lumbar radiculopathy",
    urgency: "routine",
    status: "rejected",
    createdAt: "2026-04-30T13:10:00Z",
    updatedAt: "2026-05-01T09:00:00Z",
    attachments: [],
    notes: "Please refer to MSK pathway first per local protocol.",
  },
  {
    id: "REF-2047",
    patientId: "p2",
    fromGpId: "u1",
    toSpecialistId: "u3",
    specialty: "Cardiology",
    reason: "Anticoagulation review",
    diagnosis: "AF on apixaban, recent epistaxis",
    urgency: "emergency",
    status: "draft",
    createdAt: "2026-05-13T06:30:00Z",
    updatedAt: "2026-05-13T06:30:00Z",
    attachments: [],
  },
];

export const appointments: Appointment[] = [
  { id: "ap1", referralId: "REF-2043", patientId: "p3", specialistId: "u5", startsAt: "2026-05-15T10:00:00Z", durationMin: 30, location: "Northgate Neuro · Room 3" },
  { id: "ap2", referralId: "REF-2044", patientId: "p4", specialistId: "u3", startsAt: "2026-04-29T14:30:00Z", durationMin: 45, location: "St. Aldwyn · Echo suite" },
  { id: "ap3", referralId: "REF-2042", patientId: "p2", specialistId: "u3", startsAt: "2026-05-14T09:15:00Z", durationMin: 30, location: "St. Aldwyn · Clinic A" },
  { id: "ap4", referralId: "REF-2041", patientId: "p1", specialistId: "u4", startsAt: "2026-05-16T11:30:00Z", durationMin: 30, location: "Metro Endocrine · Room 2" },
];

export const consultations: Consultation[] = [
  {
    id: "c1",
    referralId: "REF-2044",
    patientId: "p4",
    specialistId: "u3",
    date: "2026-04-29T14:30:00Z",
    summary:
      "Reviewed for pre-op cardiac assessment. Echo shows preserved EF (58%). No reversible ischaemia on stress imaging. Risk profile acceptable for elective procedure.",
    recommendations:
      "Proceed with surgery. Continue bisoprolol 5mg OD. Hold ACEi 24h pre-op. No further cardiac investigation required.",
    followUp: "Routine GP review at 6 weeks post-op. Cardiology PRN.",
  },
];

export function getPatient(id: string) {
  return patients.find((p) => p.id === id);
}
export function getPractitioner(id: string) {
  return practitioners.find((p) => p.id === id);
}
export function getReferral(id: string) {
  return referrals.find((r) => r.id === id);
}

export const specialties = [
  "Cardiology",
  "Endocrinology",
  "Neurology",
  "Gastroenterology",
  "Dermatology",
  "Orthopaedics",
  "ENT",
  "Ophthalmology",
  "Psychiatry",
  "Rheumatology",
];

export function statusMeta(status: ReferralStatus) {
  const map: Record<ReferralStatus, { label: string; tone: "info" | "warn" | "success" | "danger" | "neutral" }> = {
    draft: { label: "Draft", tone: "neutral" },
    submitted: { label: "Submitted", tone: "info" },
    accepted: { label: "Accepted", tone: "info" },
    scheduled: { label: "Scheduled", tone: "warn" },
    completed: { label: "Completed", tone: "success" },
    rejected: { label: "Rejected", tone: "danger" },
  };
  return map[status];
}

export function urgencyMeta(u: Urgency) {
  const map: Record<Urgency, { label: string; tone: "info" | "warn" | "danger" }> = {
    routine: { label: "Routine", tone: "info" },
    urgent: { label: "Urgent", tone: "warn" },
    emergency: { label: "Emergency", tone: "danger" },
  };
  return map[u];
}