import { createClient } from "@/lib/supabase/server";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { CTASection } from "@/components/home/CTASection";

interface HomePageProps {
  searchParams: { barber?: string };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const supabase = await createClient();

  // Fetch barber profile - use barber_id from query params or default to first
  let barberProfile;
  if (searchParams.barber) {
    const { data } = await supabase
      .from("barber_profile")
      .select("*")
      .eq("id", searchParams.barber)
      .single();
    barberProfile = data;
  } else {
    // Default to first barber if no barber_id specified
    const { data } = await supabase
      .from("barber_profile")
      .select("*")
      .limit(1)
      .single();
    barberProfile = data;
  }

  // Fetch services
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("duration", { ascending: true });

  return (
    <div className="min-h-screen">
      <HeroSection bio={barberProfile?.bio} />
      <FeaturesSection />
      {services && services.length > 0 && (
        <ServicesSection services={services} />
      )}
      <CTASection />
    </div>
  );
}
