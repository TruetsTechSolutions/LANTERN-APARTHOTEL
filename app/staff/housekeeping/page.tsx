'use client';

import React, { useState, useEffect } from 'react';
import { HotelRoom, HousekeepingStatus } from '@/lib/odoo/types';
import { Sparkles, CheckCircle, AlertTriangle, RefreshCw, Broom, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HousekeepingPage() {
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const { hotelService } = await import('@/lib/odoo/hotel-service');
      const data = await hotelService.getRooms();
      setRooms(data);
    } catch (err) {
      console.error('Error loading rooms for housekeeping:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  const handleStatusChange = async (roomId: string, status: HousekeepingStatus) => {
    const { hotelService } = await import('@/lib/odoo/hotel-service');
    await hotelService.updateHousekeeping(roomId, status);
    loadRooms();
  };

  const filteredRooms = rooms.filter((r) => {
    if (filter === 'all') return true;
    if (filter === 'dirty') return r.housekeepingStatus === 'dirty';
    if (filter === 'clean') return r.housekeepingStatus === 'clean';
    if (filter === 'inspecting') return r.housekeepingStatus === 'inspecting';
    if (filter === 'out_of_order') return r.housekeepingStatus === 'out_of_order';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Housekeeping & Room Hygiene</h2>
          <p className="text-xs text-slate-500">
            Real-time room cleanliness tracking, attendant assignments, and maintenance logs
          </p>
        </div>
        <button
          onClick={loadRooms}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm">
        {[
          { id: 'all', label: 'All Rooms', count: rooms.length },
          { id: 'dirty', label: '🧹 Needs Cleaning', count: rooms.filter((r) => r.housekeepingStatus === 'dirty').length },
          { id: 'inspecting', label: '🔍 In Progress', count: rooms.filter((r) => r.housekeepingStatus === 'inspecting').length },
          { id: 'clean', label: '✨ Clean & Ready', count: rooms.filter((r) => r.housekeepingStatus === 'clean').length },
          { id: 'out_of_order', label: '⚠️ Maintenance', count: rooms.filter((r) => r.housekeepingStatus === 'out_of_order').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5',
              filter === tab.id
                ? 'bg-slate-900 text-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            )}
          >
            {tab.label}
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Housekeeping Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredRooms.map((room) => {
          const isDirty = room.housekeepingStatus === 'dirty';
          const isClean = room.housekeepingStatus === 'clean';
          const isInspecting = room.housekeepingStatus === 'inspecting';

          return (
            <div
              key={room.id}
              className={`bg-white rounded-2xl border p-5 space-y-4 shadow-sm transition ${
                isDirty ? 'border-amber-300 ring-2 ring-amber-200/50' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-2xl font-black text-slate-900">{room.number}</div>
                  <div className="text-xs text-slate-500 font-medium">Floor {room.floor} • {room.roomType?.name}</div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isClean
                      ? 'bg-emerald-100 text-emerald-800'
                      : isDirty
                      ? 'bg-amber-100 text-amber-900'
                      : isInspecting
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-rose-100 text-rose-900'
                  }`}
                >
                  {room.housekeepingStatus.replace('_', ' ')}
                </span>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                <span className="font-semibold text-slate-800">Occupancy Status:</span>{' '}
                <span className="capitalize font-bold">{room.status}</span>
                {room.currentGuestName && (
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    Guest: {room.currentGuestName}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                {!isClean ? (
                  <button
                    onClick={() => handleStatusChange(room.id, 'clean')}
                    className="col-span-2 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-1.5 transition"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Mark Clean & Inspected
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(room.id, 'dirty')}
                    className="col-span-2 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 transition"
                  >
                    Mark Dirty (Needs Cleaning)
                  </button>
                )}

                <button
                  onClick={() => handleStatusChange(room.id, 'inspecting')}
                  className="py-1.5 rounded-lg text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 transition"
                >
                  In Progress
                </button>
                <button
                  onClick={() => handleStatusChange(room.id, 'out_of_order')}
                  className="py-1.5 rounded-lg text-[11px] font-semibold bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 transition"
                >
                  Maintenance
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
