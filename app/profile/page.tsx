"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MobileShell from "@/components/MobileShell";
import { supabase } from "@/lib/supabase";
import {
  CalendarDays,
  Clock,
  DoorOpen,
  Hash,
  LogOut,
  Mail,
  Table,
  UserCircle,
} from "lucide-react";

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

    const emptyUuid = "00000000-0000-0000-0000-000000000000";

    const { data: roomData } = await supabase
      .from("rooms")
      .select("*")
      .in("id", roomIds.length > 0 ? roomIds : [emptyUuid]);

    const { data: tableData } = await supabase
      .from("study_tables")
      .select("*")
      .in("id", tableIds.length > 0 ? tableIds : [emptyUuid]);

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
      <section className="mb-5">
        <div className="rounded-[32px] border border-red-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700 ring-4 ring-white shadow">
              <UserCircle size={56} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                My Profile
              </p>
              <h1 className="truncate text-2xl font-bold text-slate-900">
                {profile?.full_name || "Student"}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                AC Learning member
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-3 rounded-2xl bg-red-50 px-4 py-3">
              <Hash size={18} className="text-red-700" />
              <div>
                <p className="text-xs text-slate-500">Student ID</p>
                <p className="font-semibold text-slate-800">
                  {profile?.student_id || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-red-50 px-4 py-3">
              <Mail size={18} className="text-slate-500" />
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Email</p>
                <p className="truncate font-semibold text-slate-800">{email}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-5 rounded-[32px] bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">My Bookings</h2>
            <p className="text-sm text-slate-500">
              Your reserved rooms and tables
            </p>
          </div>

          <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-bold text-red-700">
            {bookings.length}
          </span>
        </div>

        {loading ? (
          <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
            Loading bookings...
          </p>
        ) : bookings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-red-200 p-6 text-center">
            <p className="text-sm text-slate-500">No booking yet.</p>
            <button
              onClick={() => router.push("/booking")}
              className="mt-4 rounded-2xl bg-red-700 px-5 py-3 text-sm font-bold text-white"
            >
              Book a room
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-[26px] border border-red-100 bg-white p-4 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-bold text-slate-900">
                      {booking.room_name}
                    </p>
                    <p className="text-sm text-slate-500">
                      Table {booking.table_name}
                    </p>
                  </div>

                  <span className="rounded-full bg-red-700 px-3 py-1 text-xs font-bold text-white">
                    Reserved
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-slate-700">
                    <CalendarDays size={15} className="text-red-700" />
                    {booking.booking_date}
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-slate-700">
                    <Clock size={15} className="text-red-700" />
                    {booking.booking_time}
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-slate-700">
                    <DoorOpen size={15} className="text-slate-500" />
                    {booking.room_name}
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-slate-700">
                    <Table size={15} className="text-slate-500" />
                    {booking.seat_count
                      ? `${booking.seat_count} seats`
                      : "Seats -"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <button
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white py-3 font-bold text-red-700 shadow-sm"
      >
        <LogOut size={20} />
        Logout
      </button>
    </MobileShell>
  );
}