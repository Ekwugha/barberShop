'use client'

import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

interface BookingConfirmationProps {
  bookingId: string
  onReset: () => void
}

export function BookingConfirmation({ bookingId, onReset }: BookingConfirmationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring' }}
        className="inline-block mb-6"
      >
        <CheckCircle className="text-green-500" size={80} />
      </motion.div>

      <h2 className="text-3xl font-bold mb-4">Booking Confirmed!</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-2">
        Your appointment has been successfully booked.
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
        Booking ID: {bookingId}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onReset} variant="outline">
          Book Another Appointment
        </Button>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </motion.div>
  )
}

