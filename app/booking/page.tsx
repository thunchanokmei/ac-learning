"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MobileShell from "@/components/MobileShell";
import BookingModal from "@/components/BookingModal";
import { supabase } from "@/lib/supabase";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  DoorOpen,
} from "lucide-react";
import DeskIcon from "@/components/DeskIcon";

const TIMES = ["09:00", "11:00", "13:00", "15:00"];

type Room = {
  id: string;
  room_name: string;
};

type StudyTable = {
  id: string;
  room_id: string;
  table_name: string;
  seat_count: number;
};

type Booking = {
  id: string;
  user_id: string;
  room_id: string;
  table_id: string;
  booking_date: string;
  booking_time: string;
};

export default function BookingPage() {
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tables, setTables] = useState<StudyTable[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedTable, setSelectedTable] = useState<StudyTable | null>(null);

  const [message, setMessage] = useState("");
  const [loadingData, setLoadingData] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    checkUser();
    fetchRoomsAndTables();
  }, []);

  useEffect(() => {
    if (selectedDate && selectedTime) {
      fetchBookings();
      setSelectedRoom(null);
      setSelectedTable(null);
    }
  }, [selectedDate, selectedTime]);

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      router.push("/login");
      return;
    }

    setUserId(data.user.id);
  };

  const fetchRoomsAndTables = async () => {
    setLoadingData(true);

    const { data: roomsData, error: roomsError } = await supabase
      .from("rooms")
      .select("*")
      .order("room_name");

    const { data: tablesData, error: tablesError } = await supabase
      .from("study_tables")
      .select("*")
      .order("table_name");

    if (roomsError || tablesError) {
      setMessage("Failed to load rooms or tables.");
    }

    setRooms(roomsData || []);
    setTables(tablesData || []);
    setLoadingData(false);
  };

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("booking_date", selectedDate)
      .eq("booking_time", selectedTime);

    if (error) {
      setMessage(error.message);
      return;
    }

    setBookings(data || []);
  };

  const bookedTableIds = useMemo(() => {
    return bookings.map((booking) => booking.table_id);
  }, [bookings]);

  const getTablesByRoom = (roomId: string) => {
    return tables.filter((table) => table.room_id === roomId);
  };

  const isTableBooked = (tableId: string) => {
    return bookedTableIds.includes(tableId);
  };

  const isRoomFull = (roomId: string) => {
    const roomTables = getTablesByRoom(roomId);

    if (roomTables.length === 0) return false;

    return roomTables.every((table) => isTableBooked(table.id));
  };

  const showBookingSuccessPopup = () => {
    setShowSuccessPopup(true);

    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 1800);
  };

  const handleConfirmBooking = async (
    studentName: string,
    studentId: string
  ) => {
    if (!userId || !selectedRoom || !selectedTable) {
      setMessage("Please login and select a room/table first.");
      return;
    }

    const { error } = await supabase.from("bookings").insert({
      user_id: userId,
      room_id: selectedRoom.id,
      table_id: selectedTable.id,
      student_name: studentName,
      student_id: studentId,
      booking_date: selectedDate,
      booking_time: selectedTime,
    });

    if (error) {
      if (error.code === "23505") {
        setMessage("This table has already been booked.");
      } else {
        setMessage(error.message);
      }
      return;
    }

    setSelectedTable(null);
    setMessage("");
    showBookingSuccessPopup();
    await fetchBookings();
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <MobileShell>
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/25 px-4">
          <div className="w-full max-w-[290px] rounded-[32px] bg-white px-6 py-7 shadow-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle2 size={28} strokeWidth={2.5} />
                </div>
              </div>

              <h2 className="text-[18px] font-bold leading-none text-slate-900">
                Booking successful!
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Your room has been reserved.
              </p>
            </div>
          </div>
        </div>
      )}

      <section className="mb-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700 ring-4 ring-white shadow-sm">
            <DoorOpen size={34} />
          </div>

          <div>
            <p className="text-sm font-semibold text-red-600">
              Room Booking
            </p>
            <h1 className="text-3xl font-bold text-slate-900">Book Room</h1>
          </div>
        </div>
      </section>

      {message && (
        <div className="mb-4 rounded-[24px] border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
          {message}
        </div>
      )}

      <section className="mb-4 rounded-[32px] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays size={20} className="text-red-700" />
          <h2 className="text-lg font-bold text-slate-900">Select Date</h2>
        </div>

        <input
          type="date"
          min={today}
          className="block w-full min-w-0 appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-700 outline-none focus:border-red-400"
          placeholder="mm/dd/yyyy"
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
        />
      </section>

      <section className="mb-4 rounded-[32px] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Clock3 size={20} className="text-red-700" />
          <h2 className="text-lg font-bold text-slate-900">Select Time</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {TIMES.map((time) => {
            const active = selectedTime === time;

            return (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`rounded-[22px] border px-4 py-4 text-base font-bold transition ${active
                  ? "border-red-700 bg-red-700 text-white shadow-sm shadow-red-100"
                  : "border-red-100 bg-red-50 text-red-700"
                  }`}
              >
                {time}
              </button>
            );
          })}
        </div>
      </section>

      {loadingData && (
        <div className="mb-4 rounded-[28px] bg-white p-5 text-center text-sm text-slate-500 shadow-sm">
          Loading rooms...
        </div>
      )}

      {!selectedDate || !selectedTime ? (
        <div className="rounded-[30px] border border-dashed border-red-200 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
          Please select date and time before choosing a room.
        </div>
      ) : (
        <section className="mb-4 rounded-[32px] bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Select Room</h2>
              <p className="text-sm text-slate-500">
                {selectedDate} • {selectedTime}
              </p>
            </div>

            <DoorOpen size={24} className="text-red-700" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {rooms.map((room) => {
              const full = isRoomFull(room.id);
              const active = selectedRoom?.id === room.id;

              return (
                <button
                  key={room.id}
                  disabled={full}
                  onClick={() => setSelectedRoom(room)}
                  className={`rounded-[26px] border p-4 text-left transition ${full
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                    : active
                      ? "border-red-700 bg-red-700 text-white shadow-sm shadow-red-100"
                      : "border-red-100 bg-red-50 text-slate-900"
                    }`}
                >
                  <p className="text-lg font-bold">{room.room_name}</p>
                  <p
                    className={`mt-1 text-xs font-medium ${active ? "text-red-100" : full ? "text-slate-400" : "text-red-700"
                      }`}
                  >
                    {full ? "Unavailable" : "Available"}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {selectedRoom && (
        <section className="rounded-[32px] bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Select Table</h2>
              <p className="text-sm text-slate-500">
                {selectedRoom.room_name} • {selectedTime}
              </p>
            </div>

            <DeskIcon size={24} className="text-red-700" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {getTablesByRoom(selectedRoom.id).map((table) => {
              const booked = isTableBooked(table.id);

              return (
                <button
                  key={table.id}
                  disabled={booked}
                  onClick={() => setSelectedTable(table)}
                  className={`rounded-[26px] border p-4 text-left transition ${booked
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                    : "border-red-100 bg-red-50 text-slate-900 hover:border-red-300"
                    }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-lg font-bold">{table.table_name}</p>
                  </div>

                  <p className="text-sm">Seats: {table.seat_count}</p>
                  <p
                    className={`mt-2 text-xs font-medium ${booked ? "text-slate-400" : "text-red-700"
                      }`}
                  >
                    {booked ? "Unavailable" : "Available"}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {selectedRoom && selectedTable && (
        <BookingModal
          roomName={selectedRoom.room_name}
          tableName={selectedTable.table_name}
          seatCount={selectedTable.seat_count}
          bookingDate={selectedDate}
          bookingTime={selectedTime}
          onClose={() => setSelectedTable(null)}
          onConfirm={handleConfirmBooking}
        />
      )}
    </MobileShell>
  );
}