"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MobileShell from "@/components/MobileShell";
import { supabase } from "@/lib/supabase";
import { LogOut, UserCircle, CalendarDays, Clock, DoorOpen, Table } from "lucide-react";

type Profile = {
  id: string;
  full_name: string | null;
  student_id: string | null;
};

type Booking = {
  id: string;
  user_id: string;
  room_id: string;
  table_id: string;
  student_name: string;
  student_id: string;
  booking_date: string;
  booking_time: string;
  created_at: string;
};

type Room = {
  id: string;
  room_name: string;
};

type StudyTable = {
  id: string;
  table_name: string;
  seat_count: number;
};

type BookingDisplay = Booking & {
  room_name?: string;
  table_name?: string;
  seat_count?: number;
};

export default function ProfilePage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bookings, setBookings] = useState<BookingDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfilePage();
  }, []);

  const loadProfilePage = async () => {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      router.push("/login");
      return;
    }

    const userId = userData.user.id;
    setEmail(userData.user.email || "");

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    setProfile(profileData);

    const { data: bookingData } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    const safeBookings = bookingData || [];

    const roomIds = [...new Set(safeBookings.map((booking) => booking.room_id))];
    const tableIds = [...new Set(safeBookings.map((booking) => booking.table_id))];

    const { data: roomData } = await supabase
      .from("rooms")
      .select("*")
      .in("id", roomIds.length > 0 ? roomIds : ["00000000-0000-0000-0000-000000000000"]);

    const { data: tableData } = await supabase
      .from("study_tables")
      .select("*")
      .in("id", tableIds.length > 0 ? tableIds : ["00000000-0000-0000-0000-000000000000"]);

    const rooms = (roomData || []) as Room[];
    const tables = (tableData || []) as StudyTable[];

    const displayBookings: BookingDisplay[] = safeBookings.map((booking) => {
      const room = rooms.find((item) => item.id === booking.room_id);
      const table = tables.find((item) => item.id === booking.table_id);

      return {
        ...booking,
        room_name: room?.room_name || "Unknown room",
        table_name: table?.table_name || "Unknown table",
        seat_count: table?.seat_count,
      };
    });

    setBookings(displayBookings);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <MobileShell>
      <section className="mb-5 rounded-3xl bg-red-700 p-5 text-white shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-white text-red-700">
            <UserCircle size={72} />
          </div>

          <h2 className="text-2xl font-extrabold">
            {profile?.full_name || "Student"}
          </h2>

          <p className="mt-1 text-sm text-red-100">
            Student ID: {profile?.student_id || "-"}
          </p>

          <p className="mt-1 text-sm text-red-100">{email}</p>
        </div>
      </section>

      <section className="mb-5 rounded-3xl bg-white p-4 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-red-700">My Bookings</h3>
          <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
            {bookings.length}
          </span>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-red-200 p-5 text-center">
            <p className="text-sm text-gray-500">No booking yet.</p>
            <button
              onClick={() => router.push("/booking")}
              className="mt-3 rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white"
            >
              Book a room
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-2xl border border-red-100 bg-red-50 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-extrabold text-red-700">
                    {booking.room_name}
                  </p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-red-700">
                    {booking.table_name}
                  </span>
                </div>

                <div className="space-y-1 text-sm text-gray-700">
                  <p className="flex items-center gap-2">
                    <CalendarDays size={16} className="text-red-700" />
                    {booking.booking_date}
                  </p>

                  <p className="flex items-center gap-2">
                    <Clock size={16} className="text-red-700" />
                    {booking.booking_time}
                  </p>

                  <p className="flex items-center gap-2">
                    <DoorOpen size={16} className="text-red-700" />
                    {booking.room_name}
                  </p>

                  <p className="flex items-center gap-2">
                    <Table size={16} className="text-red-700" />
                    {booking.table_name}
                    {booking.seat_count ? ` • ${booking.seat_count} seats` : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <button
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-700 py-3 font-bold text-white shadow"
      >
        <LogOut size={20} />
        Logout
      </button>
    </MobileShell>
  );
}