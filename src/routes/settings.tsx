import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth, setStoredUser, DEFAULT_USER } from "@/lib/auth";
import { toast } from "sonner";
import { ShieldCheck, Smartphone, Key, Download, Keyboard, Bell, UserCircle2 } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string | undefined) ?? undefined,
  }),
});

const SHORTCUTS = [
  { keys: ["⌘", "K"], label: "Open global search" },
  { keys: ["N"], label: "Create new referral" },
  { keys: ["G", "R"], label: "Go to Referrals" },
  { keys: ["G", "P"], label: "Go to Patients" },
  { keys: ["G", "A"], label: "Go to Appointments" },
  { keys: ["G", "C"], label: "Go to Consultations" },
  { keys: ["?"], label: "Show this shortcut list" },
  { keys: ["Esc"], label: "Close dialog or panel" },
];

const AUDIT_EVENTS = [
  { time: "Today · 09:14", actor: "You", event: "Signed in from Chrome on macOS · London, UK" },
  { time: "Yesterday · 17:42", actor: "You", event: "Exported referral REF-2041 as encrypted PDF" },
  { time: "Yesterday · 14:08", actor: "Dr. M. Patel", event: "Updated triage status on REF-2039" },
  { time: "12 May · 10:21", actor: "System", event: "MFA challenge completed via authenticator app" },
];

function SettingsPage() {
  const { user } = useAuth();
  const u = user ?? DEFAULT_USER;
  const search = useLocation({ select: (s) => s.search as { tab?: string } });
  const initial = search.tab ?? "profile";
  const [tab, setTab] = useState(initial);

  const [name, setName] = useState(u.name);
  const [email, setEmail] = useState(u.email);
  const [organization, setOrg] = useState(u.organization);

  const [emailDigest, setEmailDigest] = useState(true);
  const [urgentSms, setUrgentSms] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(false);
  const [mfa, setMfa] = useState(true);
  const [sessionAlerts, setSessionAlerts] = useState(true);

  const saveProfile = () => {
    setStoredUser({ ...u, name, email, organization });
    toast.success("Profile updated", { description: "Your clinical profile changes are now live." });
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Workspace settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your clinician profile, security posture, notifications and productivity shortcuts.
          </p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="profile"><UserCircle2 className="h-4 w-4 mr-1.5" />Profile</TabsTrigger>
            <TabsTrigger value="security"><ShieldCheck className="h-4 w-4 mr-1.5" />Security & audit</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="h-4 w-4 mr-1.5" />Notifications</TabsTrigger>
            <TabsTrigger value="shortcuts"><Keyboard className="h-4 w-4 mr-1.5" />Shortcuts</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Clinical profile</CardTitle>
                <CardDescription>This information appears on referral letters and consult notes.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Work email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="org">Organisation</Label>
                    <Input id="org" value={organization} onChange={(e) => setOrg(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Role</Label>
                    <Input value={u.role} disabled />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => { setName(u.name); setEmail(u.email); setOrg(u.organization); }}>Reset</Button>
                  <Button onClick={saveProfile}>Save changes</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Authentication</CardTitle>
                <CardDescription>Protect your account with multi-factor authentication and active session monitoring.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingRow
                  icon={<Smartphone className="h-4 w-4" />}
                  title="Multi-factor authentication"
                  description="Require an authenticator code on every new device."
                  control={<Switch checked={mfa} onCheckedChange={(v) => { setMfa(v); toast.success(v ? "MFA enabled" : "MFA disabled"); }} />}
                />
                <SettingRow
                  icon={<Key className="h-4 w-4" />}
                  title="New sign-in alerts"
                  description="Email me whenever a new browser or location accesses my account."
                  control={<Switch checked={sessionAlerts} onCheckedChange={(v) => { setSessionAlerts(v); toast.success("Preference saved"); }} />}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Audit log</CardTitle>
                  <CardDescription>Tamper-evident record of every action taken on patient data.</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast.success("Audit log exported", { description: "A signed CSV has been queued for download." })}>
                  <Download className="h-4 w-4 mr-1.5" /> Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-border">
                  {AUDIT_EVENTS.map((e, i) => (
                    <li key={i} className="py-3 flex items-start gap-3">
                      <ShieldCheck className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-sm">{e.event}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{e.time} · {e.actor}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification preferences</CardTitle>
                <CardDescription>Choose how Refera reaches you about referrals and clinical activity.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SettingRow
                  title="Daily email digest"
                  description="A 7am summary of new referrals, status changes and overdue items."
                  control={<Switch checked={emailDigest} onCheckedChange={(v) => { setEmailDigest(v); toast.success("Preference saved"); }} />}
                />
                <SettingRow
                  title="Urgent referral SMS"
                  description="Text my mobile when an urgent or red-flag referral lands in my queue."
                  control={<Switch checked={urgentSms} onCheckedChange={(v) => { setUrgentSms(v); toast.success("Preference saved"); }} />}
                />
                <SettingRow
                  title="Weekly outcomes report"
                  description="Monday recap of completed consultations and outcome letters."
                  control={<Switch checked={weeklyReport} onCheckedChange={(v) => { setWeeklyReport(v); toast.success("Preference saved"); }} />}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shortcuts" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Keyboard shortcuts</CardTitle>
                <CardDescription>Move through Refera at clinical speed.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-border">
                  {SHORTCUTS.map((s) => (
                    <li key={s.label} className="py-2.5 flex items-center justify-between">
                      <span className="text-sm">{s.label}</span>
                      <span className="flex items-center gap-1">
                        {s.keys.map((k) => (
                          <Badge key={k} variant="outline" className="font-mono text-[11px] px-2 py-0.5">{k}</Badge>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-muted-foreground text-center">
          Need a hand? Visit the <Link to="/help" className="text-primary hover:underline">help center</Link>.
        </p>
      </div>
    </AppShell>
  );
}

function SettingRow({ icon, title, description, control }: { icon?: React.ReactNode; title: string; description: string; control: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="flex items-start gap-3">
        {icon && <div className="h-8 w-8 rounded-md bg-accent grid place-items-center text-muted-foreground">{icon}</div>}
        <div>
          <div className="text-sm font-medium">{title}</div>
          <div className="text-xs text-muted-foreground mt-0.5 max-w-md">{description}</div>
        </div>
      </div>
      <div className="pt-1">{control}</div>
    </div>
  );
}