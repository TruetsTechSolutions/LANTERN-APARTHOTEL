'use client';

import React, { useState, useEffect } from 'react';
import { RoomRack } from '@/components/staff/room-rack';
import { HotelRoom } from '@/lib/odoo/types';
import { RefreshCw } from 'lucide-react';

export default function RoomRackPage() {
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRooms = async () => {
    setLoading(true);
    try {
      const { hotelService } = await import('@/lib/odoo/hotel-service');
      const data = await hotelService.getRooms();
      setRooms(data);
    } catch (err) {
      console.error('Error loading rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRooms();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Room Rack Matrix</h2>
          <p className="text-xs text-slate-500">
            Real-time visual map of all hotel rooms, floors, and occupancy states
          </p>
        </div>
        <button
          onClick={loadRooms}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
        </button>
      </div>

      <RoomRack rooms={rooms} onRefresh={loadRooms} />
    </div>
  );
}
