'use client';

import React, { useState, useEffect } from 'react';
import { Reservation, BookingSource, ReservationStatus } from '@/lib/odoo/types';
import { SourceBadge } from '@/components/staff/source-badge';
import { formatCurrency } from '@/lib/utils';
import { Search, UserCheck, LogOut, RefreshCw, Filter, Calendar } from 'lucide-react';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const { hotelService } = await import('@/lib/odoo/hotel-service');
      const data = await hotelService.getReservations();
      setReservations(data);
    } catch (err) {
      console.error('Error fetching reservations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleCheckIn = async (resId: string) => {
    const { hotelService } = await import('@/lib/odoo/hotel-service');
    await hotelService.checkIn(resId);
    loadReservations();
  };

  const handleCheckOut = async (resId: string) => {
    const { hotelService } = await import('@/lib/odoo/hotel-service');
    await hotelService.checkOut(resId);
    loadReservations();
  };

  const filtered = reservations.filter((r) => {
    if (channelFilter !== 'all' && r.source !== channelFilter) return false;
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = `${r.guest.firstName} ${r.guest.lastName}`.toLowerCase().includes(q);
      const matchCode = r.bookingCode.toLowerCase().includes(q);
      const matchRoom = r.roomNumber.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchRoom) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Reservations & Channel Feed</h2>
          <p className="text-xs text-slate-500">
            Manage bookings synced from Direct Engine, Booking.com, MakeMyTrip, and Front Desk
          </p>
        </div>
        <button
          onClick={loadReservations}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search guest, code, or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {/* Channel & Status Selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Channel:</span>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700"
            >
              <option value="all">All Channels</option>
              <option value="direct">Direct Web</option>
              <option value="booking_com">Booking.com</option>
              <option value="makemytrip">MakeMyTrip</option>
              <option value="walk_in">Walk-In</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 font-bold">Booking Code</th>
                <th className="py-3.5 px-4 font-bold">Channel</th>
                <th className="py-3.5 px-4 font-bold">Guest Details</th>
                <th className="py-3.5 px-4 font-bold">Room Assigned</th>
                <th className="py-3.5 px-4 font-bold">Stay Dates</th>
                <th className="py-3.5 px-4 font-bold">Status</th>
                <th className="py-3.5 px-4 font-bold">Total / Paid</th>
                <th className="py-3.5 px-4 font-bold text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-4 px-4 font-mono font-bold text-slate-900">
                    {res.bookingCode}
                  </td>
                  <td className="py-4 px-4">
                    <SourceBadge source={res.source} />
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900">
                      {res.guest.firstName} {res.guest.lastName}
                      {res.guest.vip && (
                        <span className="ml-1 text-[10px] text-amber-600 font-bold">★ VIP</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {res.guest.phone}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-bold text-slate-800">Room {res.roomNumber}</span>
                    <span className="block text-[11px] text-slate-400">{res.roomTypeName}</span>
                  </td>
                  <td className="py-4 px-4 text-slate-600">
                    <div className="font-medium">
                      {res.checkInDate} → {res.checkOutDate}
                    </div>
                    <span className="text-[10px] text-slate-400">{res.nights} night(s)</span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        res.status === 'checked_in'
                          ? 'bg-emerald-100 text-emerald-800'
                          : res.status === 'confirmed'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {res.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900">{formatCurrency(res.totalAmount)}</div>
                    <div className="text-[10px] text-emerald-600 font-medium">
                      Paid: {formatCurrency(res.depositPaid)}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    {res.status === 'confirmed' && (
                      <button
                        onClick={() => handleCheckIn(res.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition inline-flex items-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Check In
                      </button>
                    )}
                    {res.status === 'checked_in' && (
                      <button
                        onClick={() => handleCheckOut(res.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition inline-flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Check Out
                      </button>
                    )}
                    {res.status === 'checked_out' && (
                      <span className="text-slate-400 text-[11px] font-medium">Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
