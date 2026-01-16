import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json()

    if (!bookingId) {
      return NextResponse.json({ error: 'Booking ID required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get booking details with client and barber info
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        clients (
          name,
          email,
          phone
        ),
        barber_profile (
          name,
          user_id
        )
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Get barber's email from auth
    const { data: { user } } = await supabase.auth.getUserById(booking.barber_profile.user_id)

    if (!user?.email) {
      return NextResponse.json({ error: 'Barber email not found' }, { status: 404 })
    }

    // Format booking details
    const bookingDate = new Date(booking.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    // Send email notification (using Supabase Edge Function or external service)
    // For now, we'll log it. You can integrate with Resend, SendGrid, etc.
    const emailContent = {
      to: user.email,
      subject: `New Booking: ${booking.clients.name}`,
      html: `
        <h2>New Booking Received</h2>
        <p><strong>Client:</strong> ${booking.clients.name}</p>
        <p><strong>Email:</strong> ${booking.clients.email || 'Not provided'}</p>
        <p><strong>Phone:</strong> ${booking.clients.phone || 'Not provided'}</p>
        <p><strong>Date:</strong> ${bookingDate}</p>
        <p><strong>Time:</strong> ${booking.start_time.substring(0, 5)} - ${booking.end_time.substring(0, 5)}</p>
        ${booking.notes ? `<p><strong>Notes:</strong> ${booking.notes}</p>` : ''}
        <p><strong>Status:</strong> ${booking.status}</p>
      `,
    }

    // TODO: Integrate with email service (Resend, SendGrid, etc.)
    // For now, log the email content
    console.log('📧 Email notification:', emailContent)

    return NextResponse.json({ 
      success: true, 
      message: 'Notification sent',
      emailContent // Remove this in production
    })
  } catch (error: any) {
    console.error('Error sending notification:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

