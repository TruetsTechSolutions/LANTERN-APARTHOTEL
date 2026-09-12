'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Grid3X3, 
  CalendarDays, 
  Receipt, 
  Sparkles, 
  LogOut,
  Bell,
  ArrowLeft,
  UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Front Desk', href: '/staff', icon: LayoutDashboard },
  { name: 'Room Rack Matrix', href: '/staff/rack', icon: Grid3X3 },
  { name: 'Reservations & OTAs', href: '/staff/reservations', icon: CalendarDays },
  { name: 'Folios & Billing', href: '/staff/folios', icon: Receipt },
  { name: 'Housekeeping', href: '/staff/housekeeping', icon: Sparkles },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-900">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col shrink-0 border-r border-slate-800">
        {/* Brand */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg">
              🏮
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide text-white">LANTERN APARTHOTEL</div>
              <div className="text-[10px] text-slate-400">Perinthalmanna, Kerala</div>
              <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Odoo 19 Connected
              </div>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-1.5 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                )}
              >
                <Icon className={cn('w-4 h-4', isActive ? 'text-amber-400' : 'text-slate-400')} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-200">
              FD
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-white truncate">Front Desk Reception</div>
              <div className="text-[10px] text-slate-400">Shift #1 (Morning)</div>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition w-full px-2 py-1.5 rounded hover:bg-slate-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Public Portal
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-slate-800">Lantern Apart Hotel</h1>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
              Perinthalmanna • Live Property Management
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">OTA Sync:</span>
              <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-medium">MakeMyTrip: Online</span>
              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">Booking.com: Online</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
