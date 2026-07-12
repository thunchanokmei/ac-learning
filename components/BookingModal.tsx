"use client";

import { useState } from "react";
import { CalendarDays, Clock3, DoorOpen, Armchair, X } from "lucide-react";
import DeskIcon from "@/components/DeskIcon";

type BookingModalProps = {
  roomName: string;
  tableName: string;
  seatCount: number;
  bookingDate: string;
  bookingTime: string;
  onClose: () => void;
  onConfirm: (studentName: string, studentId: string) => Promise<void>;
};

export default function BookingModal({
  roomName,
  tableName,
  seatCount,
  bookingDate,
  bookingTime,
  onClose,
  onConfirm,
}: BookingModalProps) {
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleConfirm = async () => {
    setErrorMessage("");

    if (!studentName || !studentId) {
      setErrorMessage("Please enter your name and student ID.");
      return;
    }

    setLoading(true);
    await onConfirm(studentName, studentId);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/35 px-4">
      <div className="w-full max-w-[390px] rounded-[34px] bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-red-600">
              Confirm Booking
            </p>
            <h2 className="text-2xl font-bold text-slate-900">
              Reservation
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2 text-slate-500"
          >
            <X size={22} />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-red-100 bg-red-50 p-3">
            <DoorOpen size={17} className="mb-1 text-red-700" />
            <p className="text-xs font-medium text-red-500">Room</p>
            <p className="font-bold text-slate-900">{roomName}</p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50 p-3">
            <DeskIcon size={22} className="mb-1 text-red-700" />
            <p className="text-xs font-medium text-red-500">Table</p>
            <p className="font-bold text-slate-900">
              {tableName}
            </p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50 p-3">
            <Armchair size={17} className="mb-1 text-red-700" />
            <p className="text-xs font-medium text-red-500">Seats</p>
            <p className="font-bold text-slate-900">{seatCount}</p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-red-50 p-3">
            <Clock3 size={17} className="mb-1 text-red-700" />
            <p className="text-xs font-medium text-red-500">Time</p>
            <p className="font-bold text-slate-900">{bookingTime}</p>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-3 py-3 text-sm text-red-700">
          <CalendarDays size={17} className="text-red-700" />
          {bookingDate}
        </div>

        {errorMessage && (
          <div className="mb-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Name
        </label>
        <input
          type="text"
          name="bookingName"
          autoComplete="name"
          className="mb-3 w-full rounded-2xl border border-slate-200 p-3 text-base outline-none focus:border-red-400"
          placeholder="Wowza Haha"
          value={studentName}
          onChange={(event) => setStudentName(event.target.value)}
        />

        <label className="mb-1 block text-sm font-semibold text-slate-700">
          Student ID
        </label>
        <input
          type="text"
          name="bookingStudentId"
          inputMode="numeric"
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore="true"
          className="mb-4 w-full rounded-2xl border border-slate-200 p-3 text-base outline-none focus:border-red-400"
          placeholder="6911111"
          value={studentId}
          onChange={(event) => setStudentId(event.target.value)}
        />

        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className="w-full rounded-2xl bg-red-700 py-3.5 font-bold text-white shadow-lg shadow-red-100 disabled:bg-slate-300 disabled:shadow-none"
        >
          {loading ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
}