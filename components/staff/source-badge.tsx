import React from 'react';
import { BookingSource } from '@/lib/odoo/types';
import { cn } from '@/lib/utils';

export function SourceBadge({ source }: { source: BookingSource }) {
  switch (source) {
    case 'booking_com':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
          Booking.com
        </span>
      );
    case 'makemytrip':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          MakeMyTrip
        </span>
      );
    case 'walk_in':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          Walk-In
        </span>
      );
    case 'direct':
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          Direct Web
        </span>
      );
  }
}
