'use client'

import { useState, useEffect } from 'react'
import { useBookingStore } from '@/store/useBookingStore'
import { DatePicker } from './DatePicker'
import { TimeSlotPicker } from './TimeSlotPicker'
import { BookingForm } from './BookingForm'
import { BookingConfirmation } from './BookingConfirmation'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'

type BookingStep = 'date' | 'time' | 'details' | 'confirmation'

export function BookingFlow() {
  const { selectedDate, selectedTime, setSelectedDate, setSelectedTime, reset } = useBookingStore()
  const [step, setStep] = useState<BookingStep>('date')
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [isNavigatingBack, setIsNavigatingBack] = useState(false)

  useEffect(() => {
    // Don't auto-advance if user is manually navigating back
    if (isNavigatingBack) return

    // Only auto-advance forward when selections are made
    if (selectedDate && step === 'date' && !selectedTime) {
      setStep('time')
    }
    if (selectedTime && step === 'time') {
      setStep('details')
    }
  }, [selectedDate, selectedTime, step, isNavigatingBack, setSelectedTime])

  const handleBookingComplete = (id: string) => {
    setBookingId(id)
    setStep('confirmation')
  }

  const handleReset = () => {
    reset()
    setStep('date')
    setBookingId(null)
  }

  return (
    <div className="glass rounded-2xl p-8">
      <AnimatePresence mode="wait">
        {step === 'date' && (
          <motion.div
            key="date"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h2 className="text-2xl font-bold mb-6">Select Date</h2>
            <DatePicker />
          </motion.div>
        )}

        {step === 'time' && selectedDate && (
          <motion.div
            key="time"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="mb-6">
              <button
                onClick={() => {
                  setIsNavigatingBack(true)
                  setSelectedTime(null)
                  setSelectedDate(null) // Clear date selection when going back
                  setStep('date')
                  // Reset navigation flag after a brief delay
                  setTimeout(() => setIsNavigatingBack(false), 100)
                }}
                className="text-amber-500 hover:text-amber-600 mb-4 flex items-center gap-2"
              >
                ← Change date
              </button>
              <h2 className="text-2xl font-bold mb-2">Select Time</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </p>
            </div>
            <TimeSlotPicker date={selectedDate} />
          </motion.div>
        )}

        {step === 'details' && selectedDate && selectedTime && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="mb-6">
              <button
                onClick={() => {
                  setIsNavigatingBack(true)
                  setSelectedTime(null)
                  setStep('time')
                  // Reset navigation flag after a brief delay
                  setTimeout(() => setIsNavigatingBack(false), 100)
                }}
                className="text-amber-500 hover:text-amber-600 mb-4 flex items-center gap-2"
              >
                ← Change time
              </button>
              <h2 className="text-2xl font-bold mb-2">Your Details</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {selectedTime}
              </p>
            </div>
            <BookingForm
              date={selectedDate}
              time={selectedTime}
              onComplete={handleBookingComplete}
            />
          </motion.div>
        )}

        {step === 'confirmation' && bookingId && (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <BookingConfirmation bookingId={bookingId} onReset={handleReset} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

