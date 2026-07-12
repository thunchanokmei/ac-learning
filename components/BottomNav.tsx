"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, DoorOpen, Bot, ClipboardList, User } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/booking", label: "Booking", icon: DoorOpen },
  { href: "/tutor", label: "AI Tutor", icon: Bot },
  { href: "/planner", label: "Planner", icon: ClipboardList },
  { href: "/profile", label: "Profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div
      className="fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 px-3 pt-2"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      <nav className="rounded-[32px] border border-white/25 bg-red-700/85 px-2 py-2 backdrop-blur-xl">
        <div className="grid grid-cols-5 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center rounded-3xl px-1 py-2 transition active:scale-95 ${
                  active ? "bg-white/95" : "bg-transparent"
                }`}
              >
                <Icon
                  size={21}
                  className={active ? "text-red-700" : "text-white/85"}
                />

                <span
                  className={`mt-1 text-[11px] leading-none ${
                    active
                      ? "font-bold text-red-700"
                      : "font-semibold text-white/80"
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}