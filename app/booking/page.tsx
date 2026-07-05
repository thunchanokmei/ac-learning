"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import MobileShell from "@/components/MobileShell";
import BookingModal from "@/components/BookingModal";
import { supabase } from "@/lib/supabase";
import { CalendarDays, Clock, DoorOpen, Users, CheckCircle, XCircle } from "lucide-react";

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
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

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

    if (roomTables.length === 0) {
      return false;
    }

    return roomTables.every((table) => isTableBooked(table.id));
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

  const showBookingSuccessPopup = () => {
    setShowSuccessPopup(true);

    setTimeout(() => {
      setShowSuccessPopup(false);
    }, 1000);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <MobileShell title="Book Room">
      {showSuccessPopup && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/10 px-4">
          <div className="flex min-h-[150px] w-[260px] flex-col items-center justify-center rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
              <CheckCircle size={40} />
            </div>

            <p className="text-lg font-bold text-green-700">
              Booking successful!
            </p>
          </div>
        </div>
      )}
      {message && (
        <div
          className={`mb-4 rounded-2xl p-3 text-sm ${message.includes("successful")
            ? "bg-green-50 text-green-700"
            : "bg-red-50 text-red-700"
            }`}
        >
          {message}
        </div>
      )}

      <section className="mb-5 rounded-3xl bg-white p-4 shadow">
        <div className="mb-3 flex items-center gap-2 text-red-700">
          <CalendarDays size={20} />
          <h2 className="font-bold">Select Date</h2>
        </div>

        <input
          type="date"
          min={today}
          className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-red-500"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </section>

      <section className="mb-5 rounded-3xl bg-white p-4 shadow">
        <div className="mb-3 flex items-center gap-2 text-red-700">
          <Clock size={20} />
          <h2 className="font-bold">Select Time</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {TIMES.map((time) => (
            <button
              key={time}
              onClick={() => setSelectedTime(time)}
              className={`rounded-2xl border p-3 font-bold ${selectedTime === time
                ? "border-red-700 bg-red-700 text-white"
                : "border-red-100 bg-red-50 text-red-700"
                }`}
            >
              {time}
            </button>
          ))}
        </div>
      </section>

      {loadingData && (
        <div className="rounded-2xl bg-white p-4 text-center text-gray-500 shadow">
          Loading rooms...
        </div>
      )}

      {!selectedDate || !selectedTime ? (
        <div className="rounded-3xl border border-dashed border-red-200 bg-white p-5 text-center text-sm text-gray-500">
          Please select date and time before choosing a room.
        </div>
      ) : (
        <section className="mb-5 rounded-3xl bg-white p-4 shadow">
          <div className="mb-3 flex items-center gap-2 text-red-700">
            <DoorOpen size={20} />
            <h2 className="font-bold">Select Room</h2>
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
                  className={`rounded-3xl border p-5 text-left shadow-sm ${full
                    ? "cursor-not-allowed border-gray-200 bg-gray-200 text-gray-400"
                    : active
                      ? "border-red-700 bg-red-700 text-white"
                      : "border-red-100 bg-white text-gray-800 hover:border-red-400"
                    }`}
                >
                  <p className="text-lg font-extrabold">{room.room_name}</p>
                  <p className="mt-1 text-xs">
                    {full ? "Unavailable" : "Available"}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {selectedRoom && (
        <section className="rounded-3xl bg-white p-4 shadow">
          <div className="mb-3 flex items-center gap-2 text-red-700">
            <Users size={20} />
            <h2 className="font-bold">Select Table</h2>
          </div>

          <p className="mb-3 text-sm text-gray-500">
            {selectedRoom.room_name} • {selectedDate} • {selectedTime}
          </p>

          <div className="grid grid-cols-2 gap-3">
            {getTablesByRoom(selectedRoom.id).map((table) => {
              const booked = isTableBooked(table.id);

              return (
                <button
                  key={table.id}
                  disabled={booked}
                  onClick={() => setSelectedTable(table)}
                  className={`rounded-3xl border p-4 text-left shadow-sm ${booked
                    ? "cursor-not-allowed border-gray-200 bg-gray-200 text-gray-400"
                    : "border-red-100 bg-red-50 text-gray-800 hover:border-red-500"
                    }`}
                >
                  <p className="text-lg font-extrabold">{table.table_name}</p>
                  <p className="mt-1 text-sm">Seats: {table.seat_count}</p>
                  <p className="mt-2 text-xs">
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