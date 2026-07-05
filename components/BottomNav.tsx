"use client";

import Link from "next/link";
import { Home, CalendarDays, Bot, User, ClipboardList } from "lucide-react";
import { usePathname } from "next/navigation";

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
    <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-md border-t border-red-100 bg-white">
      <div className="grid grid-cols-5 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-xs ${
                active ? "text-red-700" : "text-gray-400"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}