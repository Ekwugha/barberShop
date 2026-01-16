"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { formatBookingTime } from "@/lib/utils/booking";
import { addMinutes } from "date-fns";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface BookingFormProps {
  date: Date;
  time: string;
  onComplete: (bookingId: string) => void;
}

export function BookingForm({ date, time, onComplete }: BookingFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slotDuration, setSlotDuration] = useState(30);

  useEffect(() => {
    async function fetchSlotDuration() {
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

        if (barberProfile) {
          const dayOfWeek = date.getDay();
          // @ts-ignore - Supabase type inference issue with string literal table names
          const { data: availability } = await supabase
            .from("availability")
            .select("slot_duration")
            // @ts-ignore - Supabase type inference issue
            .eq("barber_id", barberProfile.id)
            .eq("day_of_week", dayOfWeek)
            .eq("is_active", true)
            .single();

          if (availability) {
            // @ts-ignore - Supabase type inference issue
            setSlotDuration(availability.slot_duration);
          }
        }
      } catch (err) {
        console.error("Error fetching slot duration:", err);
      }
    }

    fetchSlotDuration();
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        throw new Error("Barber profile not found");
      }

      // Get or create client
      let clientId: string;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if client exists for this user
        const { data: existingClient } = await supabase
          .from("clients")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (existingClient) {
          // @ts-ignore - Supabase type inference issue
          clientId = existingClient.id;
          // Update client info
          await supabase
            .from("clients")
            // @ts-ignore - Supabase type inference issue with string literal table names
            .update({
              name,
              email: email || null,
              phone: phone || null,
            })
            .eq("id", clientId);
        } else {
          // Create new client
          const { data: newClient, error: clientError } = await supabase
            .from("clients")
            // @ts-ignore - Supabase type inference issue with string literal table names
            .insert({
              user_id: user.id,
              name,
              email: email || null,
              phone: phone || null,
            })
            .select("id")
            .single();

          if (clientError || !newClient) {
            throw new Error("Failed to create client profile");
          }

          // @ts-ignore - Supabase type inference issue
          clientId = newClient.id;
        }
      } else {
        // Create client without user_id (guest booking)
        const { data: newClient, error: clientError } = await supabase
          .from("clients")
          // @ts-ignore - Supabase type inference issue with string literal table names
          .insert({
            name,
            email: email || null,
            phone: phone || null,
          })
          .select("id")
          .single();

        if (clientError || !newClient) {
          throw new Error("Failed to create client profile");
        }

        // @ts-ignore - Supabase type inference issue
        clientId = newClient.id;
      }

      // Calculate end time using slot duration from availability
      const startDateTime = formatBookingTime(date, time);
      const endDateTime = addMinutes(startDateTime, slotDuration);
      const dateStr = format(date, "yyyy-MM-dd");
      const startTimeStr = format(startDateTime, "HH:mm:ss");
      const endTimeStr = format(endDateTime, "HH:mm:ss");

      // CRITICAL: Check for overlapping bookings before creating
      // This prevents double bookings even if two people try to book the same slot simultaneously
      const { data: existingBookings, error: checkError } = await supabase
        .from("bookings")
        .select("id, start_time, end_time")
        // @ts-ignore - Supabase type inference issue
        .eq("barber_id", barberProfile.id)
        .eq("date", dateStr)
        .in("status", ["pending", "confirmed"]);

      if (checkError) {
        throw new Error("Failed to check availability");
      }

      // Check if the requested time slot overlaps with any existing booking
      const hasOverlap = (existingBookings || []).some((booking: any) => {
        const existingStart = new Date(`${dateStr}T${booking.start_time}`);
        const existingEnd = new Date(`${dateStr}T${booking.end_time}`);
        const requestedStart = new Date(`${dateStr}T${startTimeStr}`);
        const requestedEnd = new Date(`${dateStr}T${endTimeStr}`);

        // Check for any overlap
        return (
          (requestedStart >= existingStart && requestedStart < existingEnd) ||
          (requestedEnd > existingStart && requestedEnd <= existingEnd) ||
          (requestedStart <= existingStart && requestedEnd >= existingEnd)
        );
      });

      if (hasOverlap) {
        throw new Error(
          "This time slot has just been booked by someone else. Please select another time."
        );
      }

      // Create booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        // @ts-ignore - Supabase type inference issue with string literal table names
        .insert({
          client_id: clientId,
          // @ts-ignore - Supabase type inference issue
          barber_id: barberProfile.id,
          date: dateStr,
          start_time: startTimeStr,
          end_time: endTimeStr,
          status: "confirmed",
          notes: notes || null,
        })
        .select("id")
        .single();

      if (bookingError || !booking) {
        // Check if error is due to conflict
        if (
          bookingError?.message?.includes("overlap") ||
          bookingError?.message?.includes("conflict")
        ) {
          throw new Error(
            "This time slot has just been booked. Please select another time."
          );
        }
        throw new Error("Failed to create booking");
      }

      const bookingId = (booking as { id: string }).id;

      // Send notification to barber (fire and forget - don't wait for response)
      fetch("/api/bookings/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      }).catch((err) => {
        console.error("Failed to send notification:", err);
        // Don't fail the booking if notification fails
      });

      onComplete(bookingId);
    } catch (err: any) {
      setError(err.message || "Failed to create booking. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder="Your full name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder="your.email@example.com"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-2">
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder="(555) 123-4567"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-2">
          Special Requests or Notes
        </label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          placeholder="Any special requests or notes for your appointment..."
        />
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || !name}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 animate-spin" size={20} />
            Booking...
          </>
        ) : (
          "Confirm Booking"
        )}
      </Button>
    </form>
  );
}
