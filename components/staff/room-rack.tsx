'use client';

import React, { useState } from 'react';
import { HotelRoom, RoomStatus } from '@/lib/odoo/types';
import { RoomDetailModal } from './room-detail-modal';
import { cn } from '@/lib/utils';
import { Sparkles, AlertTriangle, User, Check, Clock } from 'lucide-react';

interface RoomRackProps {
  rooms: HotelRoom[];
  onRefresh: () => void;
}

export function RoomRack({ rooms, onRefresh }: RoomRackProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeRoom, setActiveRoom] = useState<HotelRoom | null>(null);

  // Group rooms by floor
  const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort((a, b) => a - b);

  // Filter rooms
  const filteredRooms = rooms.filter((r) => {
    if (selectedStatus === 'all') return true;
    if (selectedStatus === 'available') return r.status === 'available';
    if (selectedStatus === 'occupied') return r.status === 'occupied';
    if (selectedStatus === 'reserved') return r.status === 'reserved';
    if (selectedStatus === 'cleaning') return r.status === 'cleaning' || r.housekeepingStatus === 'dirty';
    if (selectedStatus === 'maintenance') return r.status === 'maintenance' || r.housekeepingStatus === 'out_of_order';
    return true;
  });

  const getStatusColor = (status: RoomStatus, hk: string) => {
    if (status === 'occupied') {
      return 'bg-slate-900 border-slate-700 text-white hover:border-amber-400';
    }
    if (status === 'reserved') {
      return 'bg-amber-50 border-amber-300 text-amber-950 hover:border-amber-500';
    }
    if (status === 'cleaning' || hk === 'dirty') {
      return 'bg-blue-50 border-blue-200 text-blue-950 hover:border-blue-400';
    }
    if (status === 'maintenance' || hk === 'out_of_order') {
      return 'bg-rose-50 border-rose-300 text-rose-950 hover:border-rose-500';
    }
    // Available
    return 'bg-emerald-50/80 border-emerald-300 text-emerald-950 hover:border-emerald-500';
  };

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Rooms', count: rooms.length },
            { id: 'available', label: 'Available', count: rooms.filter((r) => r.status === 'available').length },
            { id: 'occupied', label: 'Occupied', count: rooms.filter((r) => r.status === 'occupied').length },
            { id: 'reserved', label: 'Reserved Today', count: rooms.filter((r) => r.status === 'reserved').length },
            { id: 'cleaning', label: 'Housekeeping', count: rooms.filter((r) => r.status === 'cleaning' || r.housekeepingStatus === 'dirty').length },
            { id: 'maintenance', label: 'Maintenance', count: rooms.filter((r) => r.status === 'maintenance').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5',
                selectedStatus === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {tab.label}
              <span className={cn(
                'px-1.5 py-0.2 rounded-full text-[10px]',
                selectedStatus === tab.id ? 'bg-slate-800 text-amber-400' : 'bg-slate-200 text-slate-700'
              )}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-900"></span> Occupied</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Reserved</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span> Cleaning</span>
        </div>
      </div>

      {/* Grid by Floors */}
      <div className="space-y-6">
        {floors.map((floor) => {
          const floorRooms = filteredRooms.filter((r) => r.floor === floor);
          if (floorRooms.length === 0) return null;

          return (
            <div key={floor} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">Floor {floor}</h3>
                  <span className="text-xs text-slate-400">({floorRooms.length} rooms)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                {floorRooms.map((room) => {
                  const cardColor = getStatusColor(room.status, room.housekeepingStatus);

                  return (
                    <div
                      key={room.id}
                      onClick={() => setActiveRoom(room)}
                      className={cn(
                        'cursor-pointer p-3.5 rounded-xl border-2 transition-all duration-200 flex flex-col justify-between min-h-[110px] shadow-sm hover:scale-[1.02]',
                        cardColor
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-base tracking-tight">{room.number}</div>
                          <div className="text-[10px] opacity-80 uppercase font-medium line-clamp-1">
                            {room.roomType?.name || 'Room'}
                          </div>
                        </div>

                        {/* Housekeeping Icon */}
                        {room.housekeepingStatus === 'clean' ? (
                          <span title="Clean" className="text-emerald-500"><Sparkles className="w-3.5 h-3.5" /></span>
                        ) : room.housekeepingStatus === 'dirty' ? (
                          <span title="Dirty / Needs Cleaning" className="text-blue-500 font-bold text-xs">🧹</span>
                        ) : (
                          <span title="Maintenance" className="text-rose-500"><AlertTriangle className="w-3.5 h-3.5" /></span>
                        )}
                      </div>

                      {/* Bottom State */}
                      <div className="mt-3 pt-2 border-t border-current/10 flex items-center justify-between text-[11px]">
                        {room.status === 'occupied' && room.currentGuestName ? (
                          <div className="flex items-center gap-1 font-semibold truncate text-amber-300">
                            <User className="w-3 h-3 shrink-0" />
                            <span className="truncate">{room.currentGuestName}</span>
                          </div>
                        ) : room.status === 'reserved' && room.currentGuestName ? (
                          <div className="flex items-center gap-1 font-semibold truncate text-amber-800">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span className="truncate">{room.currentGuestName}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 font-medium capitalize opacity-90">
                            {room.status}
                          </div>
                        )}

                        <span className="text-[10px] opacity-70 font-semibold">
                          €{room.roomType?.basePrice || 120}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Detail Modal */}
      <RoomDetailModal
        room={activeRoom}
        onClose={() => setActiveRoom(null)}
        onActionComplete={onRefresh}
      />
    </div>
  );
}
