import { redirect } from "next/navigation";
import ChangePasswordForm from "@/components/auth/ChangePasswordForm";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ChangePasswordPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login?next=/admin/change-password");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  if (profile?.role !== "SCC Executive" && profile?.role !== "SADU") redirect("/admin");

  return <ChangePasswordForm />;
}
