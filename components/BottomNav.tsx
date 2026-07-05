"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Bot, ClipboardList, User } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/booking", label: "Booking", icon: CalendarDays },
  { href: "/tutor", label: "AI Tutor", icon: Bot },
  { href: "/planner", label: "Planner", icon: ClipboardList },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 border-t border-red-100 bg-white/95 backdrop-blur"
      style={{ paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}
    >
      <div className="grid grid-cols-5 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 py-2"
            >
              <Icon
                size={22}
                className={active ? "text-red-700" : "text-slate-400"}
              />
              <span
                className={`text-xs ${
                  active ? "font-semibold text-red-700" : "text-slate-400"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}