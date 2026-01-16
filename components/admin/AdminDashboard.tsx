"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  X,
  CheckCircle,
  AlertCircle,
  Edit,
  Settings,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";
import { AvailabilityManager } from "./AvailabilityManager";
import { GalleryManager } from "./GalleryManager";
import { LogoutButton } from "./LogoutButton";
import { Database } from "@/types/database";

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
type BookingUpdate = Database["public"]["Tables"]["bookings"]["Update"];

interface AdminDashboardProps {
  barberId: string;
}

interface Booking {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: BookingStatus;
  notes: string | null;
  clients: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
  };
}

export function AdminDashboard({ barberId }: AdminDashboardProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<
    "today" | "upcoming" | "all" | "availability" | "gallery"
  >("today");

  useEffect(() => {
    fetchBookings();
  }, [barberId, selectedView]);

  async function fetchBookings() {
    setLoading(true);
    try {
      const supabase = createClient();
      const today = format(new Date(), "yyyy-MM-dd");

      let query = supabase
        .from("bookings")
        .select(
          `
          *,
          clients (
            id,
            name,
            email,
            phone
          )
        `
        )
        .eq("barber_id", barberId)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });

      if (selectedView === "today") {
        query = query.eq("date", today);
      } else if (selectedView === "upcoming") {
        query = query.gte("date", today);
      }

      const { data, error } = await query;

      if (error) throw error;

      setBookings((data as any) || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateBookingStatus(bookingId: string, status: BookingStatus) {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("bookings")
        // @ts-ignore - Supabase type inference issue with string literal table names
        .update({ status })
        .eq("id", bookingId);

      if (error) throw error;

      fetchBookings();
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Failed to update booking status");
    }
  }

  const todayBookings = bookings.filter(
    (b) => b.date === format(new Date(), "yyyy-MM-dd")
  );

  const upcomingBookings = bookings.filter(
    (b) => b.date >= format(new Date(), "yyyy-MM-dd")
  );

  const statusColors = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    confirmed: "bg-green-500/10 text-green-500 border-green-500/20",
    completed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your bookings and appointments
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* View Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
          {(
            ["today", "upcoming", "all", "availability", "gallery"] as const
          ).map((view) => (
            <button
              key={view}
              onClick={() => setSelectedView(view)}
              className={cn(
                "px-6 py-3 font-medium border-b-2 transition-colors capitalize whitespace-nowrap",
                selectedView === view
                  ? "border-amber-500 text-amber-500"
                  : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              )}
            >
              {view === "today" && `Today (${todayBookings.length})`}
              {view === "upcoming" && `Upcoming (${upcomingBookings.length})`}
              {view === "all" && `All (${bookings.length})`}
              {view === "availability" && (
                <>
                  <Settings size={16} className="inline mr-2" />
                  Availability
                </>
              )}
              {view === "gallery" && (
                <>
                  <ImageIcon size={16} className="inline mr-2" />
                  Gallery
                </>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {selectedView === "availability" ? (
          <AvailabilityManager barberId={barberId} />
        ) : selectedView === "gallery" ? (
          <GalleryManager barberId={barberId} />
        ) : loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Loading bookings...
            </p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-600 dark:text-gray-400">
              No bookings found
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-xl p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-bold">
                        {booking.clients.name}
                      </h3>
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium border",
                          statusColors[
                            booking.status as keyof typeof statusColors
                          ] || statusColors.pending
                        )}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        {format(parseISO(booking.date), "EEEE, MMMM d, yyyy")}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        {booking.start_time.substring(0, 5)} -{" "}
                        {booking.end_time.substring(0, 5)}
                      </div>
                      {booking.clients.email && (
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          {booking.clients.email}
                        </div>
                      )}
                      {booking.clients.phone && (
                        <div className="flex items-center gap-2">
                          {booking.clients.phone}
                        </div>
                      )}
                    </div>
                    {booking.notes && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Notes: {booking.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {booking.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          updateBookingStatus(booking.id, "confirmed")
                        }
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <CheckCircle size={16} className="mr-1" />
                        Confirm
                      </Button>
                    )}
                    {booking.status !== "cancelled" &&
                      booking.status !== "completed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateBookingStatus(booking.id, "cancelled")
                          }
                          className="border-red-500 text-red-500 hover:bg-red-500/10"
                        >
                          <X size={16} className="mr-1" />
                          Cancel
                        </Button>
                      )}
                    {booking.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateBookingStatus(booking.id, "completed")
                        }
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
