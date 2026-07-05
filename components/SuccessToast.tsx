"use client";

import { CheckCircle2 } from "lucide-react";

export default function SuccessToast({
  show,
  message,
}: {
  show: boolean;
  message: string;
}) {
  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[70] flex items-center justify-center transition-all duration-300 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`rounded-[28px] bg-white/95 px-7 py-6 text-center shadow-[0_18px_50px_rgba(15,23,42,0.15)] backdrop-blur transition-all duration-300 ${
          show ? "scale-100" : "scale-95"
        }`}
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
          <CheckCircle2 size={36} className="text-green-600" />
        </div>
        <p className="text-lg font-semibold text-slate-800">{message}</p>
        <p className="mt-1 text-sm text-slate-500">
          Your booking has been saved
        </p>
      </div>
    </div>
  );
}