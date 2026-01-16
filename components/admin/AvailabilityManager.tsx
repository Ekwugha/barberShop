"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AvailabilityManagerProps {
  barberId: string;
}

interface Availability {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration: number;
  buffer_time: number;
  is_active: boolean;
}

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function AvailabilityManager({ barberId }: AvailabilityManagerProps) {
  const [availabilities, setAvailabilities] = useState<
    Record<number, Availability>
  >({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAvailabilities();
  }, [barberId]);

  async function fetchAvailabilities() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("availability")
        .select("*")
        .eq("barber_id", barberId);

      if (error) throw error;

      const availabilityMap: Record<number, Availability> = {};
      DAYS.forEach((day) => {
        // @ts-ignore - Supabase type inference issue with string literal table names
        const existing = data?.find((a) => a.day_of_week === day.value);
        availabilityMap[day.value] = existing || {
          day_of_week: day.value,
          start_time: "09:00",
          end_time: "17:00",
          slot_duration: 30,
          buffer_time: 0,
          is_active: false,
        };
      });

      setAvailabilities(availabilityMap);
    } catch (error) {
      console.error("Error fetching availability:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveAvailability(day: number) {
    setSaving(true);
    try {
      const supabase = createClient();
      const availability = availabilities[day];

      if (availability.id) {
        // Update existing
        const { error } = await supabase
          .from("availability")
          // @ts-ignore - Supabase type inference issue with string literal table names
          .update({
            start_time: availability.start_time,
            end_time: availability.end_time,
            slot_duration: availability.slot_duration,
            buffer_time: availability.buffer_time,
            is_active: availability.is_active,
          })
          .eq("id", availability.id);

        if (error) throw error;
      } else {
        // Create new
        const { data, error } = await supabase
          .from("availability")
          // @ts-ignore - Supabase type inference issue with string literal table names
          .insert({
            barber_id: barberId,
            day_of_week: day,
            start_time: availability.start_time,
            end_time: availability.end_time,
            slot_duration: availability.slot_duration,
            buffer_time: availability.buffer_time,
            is_active: availability.is_active,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          setAvailabilities((prev) => ({
            ...prev,
            // @ts-ignore - Supabase type inference issue with string literal table names
            [day]: { ...prev[day], id: data.id },
          }));
        }
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      alert("Failed to save availability");
    } finally {
      setSaving(false);
    }
  }

  function updateAvailability(
    day: number,
    field: keyof Availability,
    value: any
  ) {
    setAvailabilities((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="animate-spin text-amber-500 mx-auto" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Manage Availability</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Set your working hours and slot configuration for each day
        </p>
      </div>

      <div className="space-y-4">
        {DAYS.map((day) => {
          const availability = availabilities[day.value];
          return (
            <motion.div
              key={day.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={availability.is_active}
                    onChange={(e) =>
                      updateAvailability(
                        day.value,
                        "is_active",
                        e.target.checked
                      )
                    }
                    className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <h3 className="text-lg font-semibold">{day.label}</h3>
                </div>
                <Button
                  size="sm"
                  onClick={() => saveAvailability(day.value)}
                  disabled={saving}
                >
                  <Save size={16} className="mr-2" />
                  Save
                </Button>
              </div>

              {availability.is_active && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={availability.start_time}
                      onChange={(e) =>
                        updateAvailability(
                          day.value,
                          "start_time",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={availability.end_time}
                      onChange={(e) =>
                        updateAvailability(
                          day.value,
                          "end_time",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Slot Duration (min)
                    </label>
                    <select
                      value={availability.slot_duration}
                      onChange={(e) =>
                        updateAvailability(
                          day.value,
                          "slot_duration",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                    >
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>60 minutes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Buffer Time (min)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={availability.buffer_time}
                      onChange={(e) =>
                        updateAvailability(
                          day.value,
                          "buffer_time",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
                    />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
