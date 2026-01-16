import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get barber profile
    const { data: barberProfile } = await supabase
      .from('barber_profile')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!barberProfile) {
      return NextResponse.json({ error: 'Barber profile not found' }, { status: 404 })
    }

    // Get bookings
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        clients (
          id,
          name,
          email,
          phone
        )
      `)
      .eq('barber_id', barberProfile.id)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ bookings })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

