'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  UserCheck, 
  LogOut, 
  DollarSign, 
  CalendarPlus, 
  RefreshCw, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { HotelRoom, RoomType, Reservation, DashboardStats } from '@/lib/odoo/types';
import { RoomRack } from '@/components/staff/room-rack';
import { WalkInModal } from '@/components/staff/walkin-modal';
import { SourceBadge } from '@/components/staff/source-badge';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function StaffDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [walkInOpen, setWalkInOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const { hotelService } = await import('@/lib/odoo/hotel-service');
      const [fetchedStats, fetchedRooms, fetchedTypes, fetchedReservations] = await Promise.all([
        hotelService.getDashboardStats(),
        hotelService.getRooms(),
        hotelService.getRoomTypes(),
        hotelService.getReservations(),
      ]);

      setStats(fetchedStats);
      setRooms(fetchedRooms);
      setRoomTypes(fetchedTypes);
      setRecentReservations(fetchedReservations.slice(0, 6));
    } catch (err) {
      console.error('Error loading staff dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Front Desk Operations
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mt-1">Property Control Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time synchronization with Odoo 19 • Booking.com • MakeMyTrip
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            title="Refresh Data"
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
          </button>
          <button
            onClick={() => setWalkInOpen(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition flex items-center gap-2"
          >
            <CalendarPlus className="w-4 h-4" />
            Express Walk-In
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Occupancy Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Occupancy</span>
              <Building2 className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-slate-900">{stats.occupancyRate}%</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {stats.occupiedRooms} of {stats.totalRooms} rooms active
            </div>
          </div>

          {/* Today Check-Ins */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Today In</span>
              <UserCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-black text-slate-900">{stats.todayCheckIns}</div>
            <div className="text-[11px] text-slate-400 mt-1">Arriving guests</div>
          </div>

          {/* Today Check-Outs */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Today Out</span>
              <LogOut className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-3xl font-black text-slate-900">{stats.todayCheckOuts}</div>
            <div className="text-[11px] text-slate-400 mt-1">Departures scheduled</div>
          </div>

          {/* Housekeeping Pending */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">Cleaning</span>
              <Sparkles className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-3xl font-black text-slate-900">{stats.cleaningRooms}</div>
            <div className="text-[11px] text-slate-400 mt-1">Rooms needing service</div>
          </div>

          {/* OTA Bookings */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase">OTAs</span>
              <Globe className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="text-3xl font-black text-slate-900">{stats.pendingOTABookings}</div>
            <div className="text-[11px] text-slate-400 mt-1">Booking.com & MMT active</div>
          </div>
        </div>
      )}

      {/* Main Room Rack Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Room Rack Matrix</h3>
            <p className="text-xs text-slate-500">
              Click any room for express check-in, check-out, folio billing, or housekeeping updates
            </p>
          </div>
          <Link
            href="/staff/rack"
            className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            Full Screen View <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <RoomRack rooms={rooms} onRefresh={loadData} />
      </div>

      {/* Recent Reservations & OTA Feed */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900">Recent Bookings & Channel Feed</h3>
            <p className="text-xs text-slate-400">
              Live reservations from Direct Website, Booking.com, MakeMyTrip, and Front Desk
            </p>
          </div>
          <Link
            href="/staff/reservations"
            className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
          >
            View All ({recentReservations.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="pb-3 font-semibold">Booking Code</th>
                <th className="pb-3 font-semibold">Channel</th>
                <th className="pb-3 font-semibold">Guest</th>
                <th className="pb-3 font-semibold">Room</th>
                <th className="pb-3 font-semibold">Dates</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentReservations.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 font-mono font-medium text-slate-800">{res.bookingCode}</td>
                  <td className="py-3">
                    <SourceBadge source={res.source} />
                  </td>
                  <td className="py-3 font-medium text-slate-900">
                    {res.guest.firstName} {res.guest.lastName}
                    {res.guest.vip && <span className="ml-1 text-amber-600 font-bold">★ VIP</span>}
                  </td>
                  <td className="py-3 font-semibold text-slate-800">
                    Room {res.roomNumber}{' '}
                    <span className="text-[10px] text-slate-400 font-normal">({res.roomTypeName})</span>
                  </td>
                  <td className="py-3 text-slate-600">
                    {res.checkInDate} → {res.checkOutDate}{' '}
                    <span className="text-slate-400">({res.nights}n)</span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        res.status === 'checked_in'
                          ? 'bg-emerald-100 text-emerald-800'
                          : res.status === 'confirmed'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {res.status}
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold text-slate-900">
                    {formatCurrency(res.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Walk In Modal */}
      <WalkInModal
        isOpen={walkInOpen}
        onClose={() => setWalkInOpen(false)}
        availableRooms={rooms}
        roomTypes={roomTypes}
        onBookingCreated={loadData}
      />
    </div>
  );
}
