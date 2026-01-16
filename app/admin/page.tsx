import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Debug logging (remove in production)
  if (process.env.NODE_ENV === "development") {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const supabaseCookies = allCookies.filter((c) => c.name.startsWith("sb-"));

    console.log("[Admin Page] User check:", {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      error: userError?.message,
      cookieCount: allCookies.length,
      supabaseCookieCount: supabaseCookies.length,
      supabaseCookieNames: supabaseCookies.map((c) => c.name),
    });
  }

  if (!user) {
    if (process.env.NODE_ENV === "development") {
      console.log("[Admin Page] No user found, redirecting to login");
    }
    redirect("/admin/login");
  }

  // Check if user is a barber
  const { data: barberProfile } = await supabase
    .from("barber_profile")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!barberProfile) {
    redirect("/admin/setup");
  }

  const barberId = (barberProfile as { id: string }).id;
  return <AdminDashboard barberId={barberId} />;
}
