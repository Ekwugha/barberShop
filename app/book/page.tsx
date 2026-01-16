import { BookingFlow } from '@/components/booking/BookingFlow'

export default function BookPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Book Your Appointment</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Select your preferred date and time
          </p>
        </div>
        <BookingFlow />
      </div>
    </div>
  )
}

