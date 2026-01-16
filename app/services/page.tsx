import { createClient } from '@/lib/supabase/server'
import { ServicesContent } from '@/components/services/ServicesContent'

export default async function ServicesPage() {
  const supabase = await createClient()

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('duration', { ascending: true })

  return <ServicesContent services={services} />
}

