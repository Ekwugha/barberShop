import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSignup } from "@/components/admin/AdminSignup";

export default async function AdminSignupPage() {
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
    // If no profile, let them stay on signup (they might need to go to setup)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <AdminSignup />
      </div>
    </div>
  );
}
