import { format, addMinutes, parse, isBefore, isAfter, set } from 'date-fns'

export interface AvailabilityConfig {
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  slotDuration: number // minutes
  bufferTime: number // minutes
}

export function generateTimeSlots(
  date: Date,
  config: AvailabilityConfig,
  bookedSlots: Array<{ start_time: string; end_time: string }>
): Array<{ time: string; available: boolean }> {
  const slots: Array<{ time: string; available: boolean }> = []
  const { startTime, endTime, slotDuration, bufferTime } = config

  // Parse start and end times
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)

  const dayStart = set(date, { hours: startHour, minutes: startMin, seconds: 0, milliseconds: 0 })
  const dayEnd = set(date, { hours: endHour, minutes: endMin, seconds: 0, milliseconds: 0 })

  let currentTime = dayStart

  while (isBefore(addMinutes(currentTime, slotDuration), dayEnd) || 
         format(addMinutes(currentTime, slotDuration), 'HH:mm') === format(dayEnd, 'HH:mm')) {
    const slotStart = currentTime
    const slotEnd = addMinutes(slotStart, slotDuration)

    // Check if this slot overlaps with any booked slot
    const isBooked = bookedSlots.some((booking) => {
      const bookingStart = parse(booking.start_time, 'HH:mm:ss', slotStart)
      const bookingEnd = parse(booking.end_time, 'HH:mm:ss', slotStart)

      // More accurate overlap detection
      // Overlap occurs if:
      // 1. Slot starts during an existing booking
      // 2. Slot ends during an existing booking
      // 3. Slot completely contains an existing booking
      // 4. Slot is completely contained by an existing booking
      return (
        (slotStart >= bookingStart && slotStart < bookingEnd) ||
        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
        (slotStart <= bookingStart && slotEnd >= bookingEnd) ||
        (slotStart > bookingStart && slotEnd < bookingEnd)
      )
    })

    slots.push({
      time: format(slotStart, 'HH:mm'),
      available: !isBooked,
    })

    currentTime = addMinutes(slotStart, slotDuration + bufferTime)
  }

  return slots
}

export function formatBookingTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number)
  return set(date, { hours, minutes, seconds: 0, milliseconds: 0 })
}

