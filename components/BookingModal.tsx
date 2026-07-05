"use client";

import { useState } from "react";
import { X } from "lucide-react";

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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-red-700">Confirm Booking</h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-red-50 p-2 text-red-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm text-gray-700">
          <p>
            <span className="font-semibold">Room:</span> {roomName}
          </p>
          <p>
            <span className="font-semibold">Table:</span> {tableName}
          </p>
          <p>
            <span className="font-semibold">Seats:</span> {seatCount}
          </p>
          <p>
            <span className="font-semibold">Date:</span> {bookingDate}
          </p>
          <p>
            <span className="font-semibold">Time:</span> {bookingTime}
          </p>
        </div>

        {errorMessage && (
          <div className="mb-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Name
        </label>
        <input
          type="text"
          name="bookingName"
          autoComplete="name"
          className="mb-3 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-red-500"
          placeholder="Your full name"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
        />

        <label className="mb-1 block text-sm font-semibold text-gray-700">
          Student ID
        </label>
        <input
          type="text"
          name="bookingStudentId"
          inputMode="numeric"
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore="true"
          className="mb-4 w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-red-500"
          placeholder="6710742534"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
        />

        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className="w-full rounded-xl bg-red-700 py-3 font-bold text-white disabled:bg-gray-300"
        >
          {loading ? "Booking..." : "Confirm"}
        </button>
      </div>
    </div>
  );
}