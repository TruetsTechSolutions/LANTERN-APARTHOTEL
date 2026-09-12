'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Calendar, 
  Users, 
  Bed, 
  Maximize2, 
  Check, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Star
} from 'lucide-react';
import { RoomType } from '@/lib/odoo/types';
import { formatCurrency } from '@/lib/utils';

export default function GuestBookingPage() {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [checkInDate, setCheckInDate] = useState('2026-09-14');
  const [checkOutDate, setCheckOutDate] = useState('2026-09-17');
  const [adults, setAdults] = useState('2');
  const [children, setChildren] = useState('0');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTypes = async () => {
      setLoading(true);
      try {
        const { hotelService } = await import('@/lib/odoo/hotel-service');
        const types = await hotelService.getRoomTypes();
        setRoomTypes(types);
      } catch (err) {
        console.error('Error loading room types:', err);
      } finally {
        setLoading(false);
      }
    };
    loadTypes();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/staff" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xl">
              🏮
            </div>
            <div>
              <span className="font-bold tracking-wider text-lg uppercase bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
                LANTERN APARTHOTEL
              </span>
              <span className="block text-[10px] text-slate-400 tracking-widest uppercase">
                Perinthalmanna • Online Guest Booking
              </span>
            </div>
          </Link>

          <Link
            href="/staff"
            className="text-xs font-semibold px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition"
          >
            ← Open Staff PMS Dashboard
          </Link>
        </div>
      </header>

      {/* Hero Banner with Booking Bar */}
      <div className="bg-slate-900 text-white py-14 px-6 border-b border-slate-800 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-4">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            Near KIMS Al-Shifa Hospital • Best Rate Guaranteed
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            Book Your Stay at Lantern Apart Hotel
          </h1>
          <p className="mt-3 text-slate-400 text-sm max-w-xl mx-auto">
            Comfortable luxury apartments and superior rooms in Perinthalmanna for medical visits, family, and business stays.
          </p>

          {/* Booking Filter Search Bar */}
          <div className="mt-8 bg-white text-slate-900 rounded-2xl p-4 md:p-6 shadow-2xl border border-slate-200 max-w-4xl mx-auto text-left grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Check-In Date
              </label>
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus-within:ring-2 focus-within:ring-amber-500">
                <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Check-Out Date
              </label>
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 focus-within:ring-2 focus-within:ring-amber-500">
                <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Guests
              </label>
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50">
                <Users className="w-4 h-4 text-amber-600 shrink-0" />
                <select
                  value={adults}
                  onChange={(e) => setAdults(e.target.value)}
                  className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="1">1 Adult</option>
                  <option value="2">2 Adults</option>
                  <option value="3">3 Adults</option>
                  <option value="4">4 Adults</option>
                </select>
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition flex items-center justify-center gap-2 h-[42px]"
              >
                <Sparkles className="w-4 h-4" />
                Check Rates
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Room Showcase Cards */}
      <main className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Available Accommodations</h2>
          <p className="text-xs text-slate-500 mt-1">
            Prices include local taxes, high-speed Wi-Fi, and complimentary breakfast.
          </p>
        </div>

        <div className="space-y-6">
          {roomTypes.map((type) => (
            <div
              key={type.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition grid grid-cols-1 lg:grid-cols-12 gap-0"
            >
              {/* Room Image */}
              <div className="lg:col-span-4 relative min-h-[240px] bg-slate-100">
                <Image
                  src={type.imageUrl}
                  alt={type.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              {/* Room Details */}
              <div className="lg:col-span-5 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-amber-700 font-semibold mb-1">
                    <Bed className="w-3.5 h-3.5" />
                    <span>{type.bedType}</span>
                    <span>•</span>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>{type.sizeSqm} m²</span>
                  </div>

                  <h3 className="text-xl font-black text-slate-900">{type.name}</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {type.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {type.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] bg-slate-50 text-slate-700 border border-slate-200"
                      >
                        <Check className="w-3 h-3 text-emerald-500" />
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Free cancellation up to 48 hours prior to arrival</span>
                </div>
              </div>

              {/* Pricing & CTA */}
              <div className="lg:col-span-3 p-6 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between items-start lg:items-end">
                <div className="lg:text-right w-full">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    Nightly Rate
                  </span>
                  <div className="text-3xl font-black text-slate-900 mt-1">
                    {formatCurrency(type.basePrice)}
                  </div>
                  <span className="text-[11px] text-slate-500">Includes VAT & service</span>
                </div>

                <Link
                  href={`/book/checkout?type=${type.id}&in=${checkInDate}&out=${checkOutDate}&adults=${adults}`}
                  className="mt-6 w-full py-3 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 shadow-md transition"
                >
                  Book This Room <ArrowRight className="w-4 h-4 text-amber-400" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
