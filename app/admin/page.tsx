import { LockKeyhole } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import AdminWorkspace, {
  type AppRole,
  type ManagedEvent,
  type Notification,
  type Organization,
} from "@/components/admin/AdminWorkspace";
import { type BoardTask } from "@/components/admin/AdminBoard";
import { type TeamMember } from "@/components/admin/TaskDrawer";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("display_name,role")
    .eq("id", authData.user.id)
    .single();

  if (profile?.role !== "SCC Executive" && profile?.role !== "SADU") {
    return <AccessDenied message="Your account does not have access to the internal workspace." />;
  }

  const [tasksResult, eventsResult, organizationsResult, membershipsResult, notificationsResult, teamMembersResult] = await Promise.all([
    supabase
      .from("tasks")
      .select("id,task_key,title,description,status,priority,assignee_id,due_at,position,event_id")
      .order("position", { ascending: true }),
    supabase
      .from("events")
      .select("id,title,slug,description,organizer_name,organization_id,venue,starts_at,ends_at,status,is_public,registration_url,image_url,category,contact_name,contact_email,capacity,review_notes")
      .order("starts_at", { ascending: true }),
    supabase.from("organizations").select("id,name,acronym,slug").eq("is_active", true).order("name"),
    supabase.from("organization_members").select("organization_id").eq("user_id", authData.user.id),
    supabase.from("notifications").select("id,title,message,event_id,read_at,created_at").order("created_at", { ascending: false }).limit(50),
    supabase.from("users").select("id,display_name,email,role").in("role", ["SCC Executive", "SADU"]).order("display_name"),
  ]);

  const loadError = tasksResult.error ?? eventsResult.error ?? organizationsResult.error ?? membershipsResult.error ?? notificationsResult.error ?? teamMembersResult.error;
  const manageableOrganizationIds = new Set((membershipsResult.data ?? []).map((membership) => membership.organization_id));
  const organizations = profile.role === "SADU"
    ? organizationsResult.data ?? []
    : (organizationsResult.data ?? []).filter((organization) => manageableOrganizationIds.has(organization.id));

  return (
    <main className="min-h-screen bg-cloud px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-[96rem]">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-feu-teal">Internal workspace</p>
            <h1 className="mt-2 text-3xl font-black text-ink">FEUASCC Project Board</h1>
            <p className="mt-2 text-sm text-slate-500">
              Signed in as {profile.display_name || authData.user.email} · {profile.role}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-bold text-feu-green hover:underline">View public calendar</Link>
            <form action="/auth/signout" method="post">
              <button type="submit" className="text-sm font-bold text-slate-500 hover:text-ink">Sign out</button>
            </form>
          </div>
        </div>

        {loadError ? (
          <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            The internal workspace could not be loaded: {loadError.message}
          </p>
        ) : (
          <AdminWorkspace
            currentRole={profile.role as AppRole}
            initialTasks={(tasksResult.data ?? []) as BoardTask[]}
            initialEvents={(eventsResult.data ?? []) as ManagedEvent[]}
            organizations={organizations as Organization[]}
            initialNotifications={(notificationsResult.data ?? []) as Notification[]}
            teamMembers={(teamMembersResult.data ?? []) as TeamMember[]}
          />
        )}
      </div>
    </main>
  );
}

function AccessDenied({ message }: { message: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-feu-moss px-5 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/15 bg-white/10 p-8 text-center shadow-glass backdrop-blur-xl">
        <LockKeyhole className="mx-auto h-10 w-10 text-gold-default" aria-hidden="true" />
        <h1 className="mt-5 text-2xl font-black">Restricted workspace</h1>
        <p className="mt-3 text-sm leading-6 text-white/70">{message}</p>
        <Link href="/" className="btn-gold mt-7">Return to public portal</Link>
      </div>
    </main>
  );
}
