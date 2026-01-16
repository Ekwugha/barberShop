import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminLogin } from "@/components/admin/AdminLogin";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: { message?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is logged in and has a barber profile, redirect to admin
  if (user) {
    const { data: barberProfile } = await supabase
      .from("barber_profile")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (barberProfile && (barberProfile as { id: string }).id) {
      redirect("/admin");
    }
    // If no profile, let them stay on login (they might need to go to setup)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <AdminLogin message={searchParams?.message} />
      </div>
    </div>
  );
}
