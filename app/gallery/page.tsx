import { createClient } from "@/lib/supabase/server";
import { GalleryContent } from "@/components/gallery/GalleryContent";

interface GalleryPageProps {
  searchParams: { barber?: string };
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const supabase = await createClient();

  // Get barber_id from query params or default to first barber
  let barberId: string | null = null;
  if (searchParams.barber) {
    barberId = searchParams.barber;
  } else {
    // Get first barber's ID
    const { data: firstBarber } = await supabase
      .from("barber_profile")
      .select("id")
      .limit(1)
      .single();
    barberId = (firstBarber as { id: string } | null)?.id || null;
  }

  // Fetch images from storage - use barber-specific folder
  const folderPath = barberId ? `${barberId}/` : "";
  const { data: images, error } = await supabase.storage
    .from("haircut-gallery")
    .list(folderPath, {
      limit: 50,
      sortBy: { column: "created_at", order: "desc" },
    });

  // Pre-compute image URLs on the server
  const imagesWithUrls = (images || [])
    .filter((img) => img.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
    .map((image) => {
      const imagePath = folderPath ? `${folderPath}${image.name}` : image.name;
      const { data } = supabase.storage
        .from("haircut-gallery")
        .getPublicUrl(imagePath);
      return {
        id: image.id || image.name,
        name: image.name,
        url: data.publicUrl,
      };
    });

  return <GalleryContent images={imagesWithUrls} error={error} />;
}
