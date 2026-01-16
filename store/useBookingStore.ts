import { create } from 'zustand'

export interface TimeSlot {
  time: string
  available: boolean
}

interface BookingState {
  selectedDate: Date | null
  selectedTime: string | null
  setSelectedDate: (date: Date | null) => void
  setSelectedTime: (time: string | null) => void
  reset: () => void
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedDate: null,
  selectedTime: null,
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTime: (time) => set({ selectedTime: time }),
  reset: () => set({ selectedDate: null, selectedTime: null }),
}))

