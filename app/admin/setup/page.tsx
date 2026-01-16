import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BarberSetup } from '@/components/admin/BarberSetup'

export default async function SetupPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // Check if barber profile already exists
  const { data: barberProfile } = await supabase
    .from('barber_profile')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (barberProfile) {
    redirect('/admin')
  }

  return <BarberSetup userId={user.id} />
}

