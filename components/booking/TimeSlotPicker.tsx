"use client";

import { useState, useEffect } from "react";
import { useBookingStore } from "@/store/useBookingStore";
import { createClient } from "@/lib/supabase/client";
import {
  generateTimeSlots,
  type AvailabilityConfig,
} from "@/lib/utils/booking";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

interface TimeSlotPickerProps {
  date: Date;
}

export function TimeSlotPicker({ date }: TimeSlotPickerProps) {
  const { selectedTime, setSelectedTime } = useBookingStore();
  const [slots, setSlots] = useState<
    Array<{ time: string; available: boolean }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAvailability() {
      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();

        // Get barber_id from URL params or use first barber
        const urlParams = new URLSearchParams(window.location.search);
        const barberId = urlParams.get("barber");

        let barberProfile: { id: string } | null = null;
        if (barberId) {
          const { data } = await supabase
            .from("barber_profile")
            .select("id")
            .eq("id", barberId)
            .single();
          barberProfile = data as { id: string } | null;
        } else {
          // Default to first barber if no barber_id specified
          const { data } = await supabase
            .from("barber_profile")
            .select("id")
            .limit(1)
            .single();
          barberProfile = data as { id: string } | null;
        }

        if (!barberProfile) {
          setError(
            "Barber profile not found. Please set up your barber profile first."
          );
          setLoading(false);
          return;
        }

        // Get availability for the day of week (0 = Sunday, 6 = Saturday)
        const dayOfWeek = date.getDay();
        // @ts-ignore - Supabase type inference issue with string literal table names
        const { data: availability } = await supabase
          .from("availability")
          .select("*")
          // @ts-ignore - Supabase type inference issue
          .eq("barber_id", barberProfile.id)
          .eq("day_of_week", dayOfWeek)
          .eq("is_active", true)
          .single();

        if (!availability) {
          setError(
            "No availability set for this day. Please contact the barber."
          );
          setLoading(false);
          return;
        }

        // Get existing bookings for this date
        const dateStr = format(date, "yyyy-MM-dd");
        // @ts-ignore - Supabase type inference issue with string literal table names
        const { data: bookings } = await supabase
          .from("bookings")
          .select("start_time, end_time")
          // @ts-ignore - Supabase type inference issue
          .eq("barber_id", barberProfile.id)
          .eq("date", dateStr)
          .in("status", ["pending", "confirmed"]);

        const config: AvailabilityConfig = {
          // @ts-ignore - Supabase type inference issue
          startTime: availability.start_time,
          // @ts-ignore - Supabase type inference issue
          endTime: availability.end_time,
          // @ts-ignore - Supabase type inference issue
          slotDuration: availability.slot_duration,
          // @ts-ignore - Supabase type inference issue
          bufferTime: availability.buffer_time,
        };

        const timeSlots = generateTimeSlots(date, config, bookings || []);

        setSlots(timeSlots);
      } catch (err) {
        setError("Failed to load availability. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAvailability();
  }, [date]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-amber-500" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">
          No available time slots for this date.
        </p>
      </div>
    );
  }

  const availableSlots = slots.filter((s) => s.available);

  if (availableSlots.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl font-semibold mb-2">Fully Booked</p>
        <p className="text-gray-600 dark:text-gray-400">
          All time slots for this date are already booked. Please select another
          date.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {slots.map((slot) => (
          <motion.button
            key={slot.time}
            onClick={() => slot.available && setSelectedTime(slot.time)}
            disabled={!slot.available}
            whileHover={slot.available ? { scale: 1.05 } : {}}
            whileTap={slot.available ? { scale: 0.95 } : {}}
            className={cn(
              "p-3 rounded-lg border-2 transition-all text-sm font-medium",
              slot.available
                ? selectedTime === slot.time
                  ? "border-amber-500 bg-amber-500 text-white"
                  : "border-gray-300 dark:border-gray-700 hover:border-amber-500/50"
                : "border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 text-gray-400 cursor-not-allowed opacity-50"
            )}
          >
            {slot.time}
          </motion.button>
        ))}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
        {availableSlots.length} available slot
        {availableSlots.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
