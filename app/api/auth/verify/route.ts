import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json(
      { authenticated: false, error: error?.message },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    userId: user.id,
    email: user.email,
  });
}
