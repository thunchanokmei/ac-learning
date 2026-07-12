import Image from "next/image";
import Link from "next/link";
import MobileShell from "@/components/MobileShell";
import {
  Bot,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Megaphone,
  DoorOpen,
} from "lucide-react";

const activities = [
  "/images/activity-1.jpg",
  "/images/activity-2.jpg",
  "/images/activity-3.jpg",
  "/images/activity-4.jpg",
  "/images/activity-5.jpg",
];

export default function HomePage() {
  return (
    <MobileShell>
      <section className="mb-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white ring-4 ring-red-50 shadow-sm">
            <Image
              src="/images/logo.jpg"
              alt="AC Learning Logo"
              width={60}
              height={60}
              priority
              className="h-[60px] w-[60px] scale-125 rounded-full object-cover"
            />
          </div>

          <div>
            <p className="text-sm font-semibold text-red-600">
              Welcome back
            </p>
            <h1 className="text-3xl font-bold text-slate-900">AC Learning</h1>
            <p className="mt-1 text-sm text-slate-500">
              AI Community learning space
            </p>
          </div>
        </div>
      </section>

      <section className="mb-4 rounded-[28px] border border-red-100 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Class Schedule
            </h2>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-700">
            <CalendarDays size={19} />
          </div>
        </div>

        <div className="overflow-hidden rounded-[22px] border border-red-100 bg-[#fff7f7] p-1.5">
          <Image
            src="/images/schedule.jpg"
            alt="Class schedule"
            width={900}
            height={500}
            priority
            className="h-full w-full rounded-[18px] object-cover"
          />
        </div>
      </section>

      <section className="mb-5">
        <div className="grid grid-cols-3 gap-2">
          <Link
            href="/booking"
            className="flex h-14 min-w-0 items-center justify-center gap-1.5 rounded-full border border-red-100 bg-white px-2 shadow-sm transition active:scale-95"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700">
              <DoorOpen size={18} />
            </div>
            <span className="truncate text-xs font-bold text-slate-900">
              Booking
            </span>
          </Link>

          <Link
            href="/tutor"
            className="flex h-14 min-w-0 items-center justify-center gap-1.5 rounded-full border border-red-100 bg-white px-2 shadow-sm transition active:scale-95"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700">
              <Bot size={18} />
            </div>
            <span className="truncate text-xs font-bold text-slate-900">
              AI Tutor
            </span>
          </Link>

          <Link
            href="/planner"
            className="flex h-14 min-w-0 items-center justify-center gap-1.5 rounded-full border border-red-100 bg-white px-2 shadow-sm transition active:scale-95"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-700">
              <ClipboardList size={18} />
            </div>
            <span className="truncate text-xs font-bold text-slate-900">
              Planner
            </span>
          </Link>
        </div>
      </section>

      <section className="mb-5 rounded-[32px] bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Activities</h2>
          </div>

          <Megaphone size={24} className="text-red-700" />
        </div>

        <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">          {activities.map((src, index) => (
          <div
            key={src}
            className="min-w-[185px] snap-start overflow-hidden rounded-[24px] border border-red-100 bg-red-50 p-2"
          >
            <Image
              src={src}
              alt={`Activity ${index + 1}`}
              width={240}
              height={320}
              className="h-[260px] w-full rounded-[18px] object-cover"
            />
          </div>
        ))}
        </div>
      </section>
    </MobileShell>
  );
}