import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Bot } from "lucide-react";
import MobileShell from "@/components/MobileShell";

const activities = [
  "/images/activity-1.jpg",
  "/images/activity-2.jpg",
  "/images/activity-3.jpg",
  "/images/activity-4.jpg",
  "/images/activity-5.jpg",
];

export default function HomePage() {
  return (
    <MobileShell title="AC Learning">
      <section className="mb-4 rounded-[28px] bg-gradient-to-br from-[#cf2f2f] to-[#b71c1c] p-5 text-white">
        <div className="flex items-center gap-4">
          <Image
            src="/images/logo.jpg"
            alt="AC Learning Logo"
            width={64}
            height={64}
            className="rounded-full bg-white object-cover p-1"
          />

          <div>
            <p className="text-sm text-red-100">Welcome back</p>
            <h2 className="text-xl font-bold">AC Learning</h2>
            <p className="text-sm text-red-100">
              AI Community learning space
            </p>
          </div>
        </div>
      </section>

      <section className="mb-5 rounded-3xl bg-white p-4 shadow">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-red-700">Class schedule</h3>
        </div>

        <Image
          src="/images/schedule.jpg"
          alt="Class schedule"
          width={900}
          height={500}
          priority
          className="w-full rounded-2xl border border-red-100 object-cover"
        />
      </section>

      <section className="mb-5 rounded-3xl bg-white p-4 shadow">
        <h3 className="mb-3 text-lg font-bold text-red-700">Activities</h3>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {activities.map((src, index) => (
            <div
              key={src}
              className="min-w-[220px] rounded-2xl border border-red-100 bg-white p-2 shadow-sm"
            >
              <Image
                src={src}
                alt={`Activity ${index + 1}`}
                width={220}
                height={320}
                className="h-[300px] w-full rounded-xl object-cover"
              />
            </div>
          ))}
        </div>
      </section>
    </MobileShell>
  );
}