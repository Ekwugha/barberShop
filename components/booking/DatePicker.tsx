'use client'

import { useState } from 'react'
import { useBookingStore } from '@/store/useBookingStore'
import { format, addDays, startOfDay, isBefore, isAfter } from 'date-fns'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

export function DatePicker() {
  const { selectedDate, setSelectedDate } = useBookingStore()
  const [viewDate, setViewDate] = useState(new Date())

  const today = startOfDay(new Date())
  const maxDate = addDays(today, 60) // Allow booking up to 60 days ahead

  const dates = Array.from({ length: 14 }, (_, i) => addDays(today, i))

  const handleDateSelect = (date: Date) => {
    if (!isBefore(date, today) && !isAfter(date, maxDate)) {
      setSelectedDate(date)
    }
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
        {dates.map((date) => {
          const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          const isPast = isBefore(date, today)
          const isTooFar = isAfter(date, maxDate)

          return (
            <motion.button
              key={date.toISOString()}
              onClick={() => handleDateSelect(date)}
              disabled={isPast || isTooFar}
              whileHover={{ scale: isPast || isTooFar ? 1 : 1.05 }}
              whileTap={{ scale: isPast || isTooFar ? 1 : 0.95 }}
              className={cn(
                'p-4 rounded-lg border-2 transition-all',
                isSelected
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-gray-300 dark:border-gray-700 hover:border-amber-500/50',
                (isPast || isTooFar) && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {format(date, 'EEE')}
              </div>
              <div className={cn(
                'text-lg font-bold mt-1',
                isSelected ? 'text-amber-500' : ''
              )}>
                {format(date, 'd')}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {format(date, 'MMM')}
              </div>
            </motion.button>
          )
        })}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
        Select a date to see available time slots
      </p>
    </div>
  )
}

