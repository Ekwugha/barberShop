import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const token = requestUrl.searchParams.get('token')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') ?? '/admin'

  const supabase = await createClient()

  // Handle email confirmation with token_hash (newer format)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })

    if (!error) {
      // Redirect to admin dashboard after successful verification
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }
  
  // Handle email confirmation with token (older format)
  if (token && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token,
    })

    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // Check if user is already authenticated (might have been auto-confirmed)
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  }

  // If verification fails, redirect to login with error
  return NextResponse.redirect(new URL('/admin/login?message=Email verification failed. Please try logging in manually.', requestUrl.origin))
}

