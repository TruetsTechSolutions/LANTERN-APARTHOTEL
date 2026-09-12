'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  BedDouble, 
  UserCheck, 
  LogOut, 
  PlusCircle, 
  Receipt, 
  Sparkles, 
  Phone, 
  Calendar,
  AlertCircle,
  Wine,
  Utensils,
  Shirt
} from 'lucide-react';
import { HotelRoom, Reservation, HotelFolio, HousekeepingStatus } from '@/lib/odoo/types';
import { SourceBadge } from './source-badge';
import { PaymentModal } from './payment-modal';
import { formatCurrency } from '@/lib/utils';

interface RoomDetailModalProps {
  room: HotelRoom | null;
  onClose: () => void;
  onActionComplete: () => void;
}

export function RoomDetailModal({ room, onClose, onActionComplete }: RoomDetailModalProps) {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [folio, setFolio] = useState<HotelFolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [addingCharge, setAddingCharge] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Charge form state
  const [chargeDesc, setChargeDesc] = useState('Turm Restaurant Dinner');
  const [chargeCategory, setChargeCategory] = useState<'restaurant' | 'minibar' | 'spa' | 'laundry'>('restaurant');
  const [chargeAmount, setChargeAmount] = useState('45.00');

  useEffect(() => {
    if (!room) return;

    const loadDetails = async () => {
      setLoading(true);
      const { hotelService } = await import('@/lib/odoo/hotel-service');
      const reservations = await hotelService.getReservations();
      
      const currentRes = reservations.find(
        (r) => r.id === room.currentReservationId || (r.roomNumber === room.number && (r.status === 'checked_in' || r.status === 'confirmed'))
      );

      setReservation(currentRes || null);

      if (currentRes) {
        const currentFolio = await hotelService.getFolio(currentRes.id);
        setFolio(currentFolio || null);
      } else {
        setFolio(null);
      }
      setLoading(false);
    };

    loadDetails();
  }, [room]);

  if (!room) return null;

  const handleCheckIn = async () => {
    if (!reservation) return;
    const { hotelService } = await import('@/lib/odoo/hotel-service');
    await hotelService.checkIn(reservation.id);
    onActionComplete();
    onClose();
  };

  const handleCheckOut = async () => {
    if (!reservation) return;
    if (folio && folio.balanceDue > 0) {
      const confirm = window.confirm(`Guest still has a balance due of ${formatCurrency(folio.balanceDue)}. Proceed with check-out and generate Odoo invoice?`);
      if (!confirm) return;
    }
    const { hotelService } = await import('@/lib/odoo/hotel-service');
    await hotelService.checkOut(reservation.id);
    onActionComplete();
    onClose();
  };

  const handleHousekeepingChange = async (status: HousekeepingStatus) => {
    const { hotelService } = await import('@/lib/odoo/hotel-service');
    await hotelService.updateHousekeeping(room.id, status);
    onActionComplete();
    onClose();
  };

  const handleAddCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservation) return;
    const { hotelService } = await import('@/lib/odoo/hotel-service');
    const updated = await hotelService.addChargeToFolio(reservation.id, {
      date: new Date().toISOString().split('T')[0],
      description: chargeDesc,
      category: chargeCategory,
      quantity: 1,
      unitPrice: Number(chargeAmount),
    });
    setFolio(updated);
    setAddingCharge(false);
    onActionComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg">
              {room.number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">Room {room.number}</h2>
                <span className="text-xs text-slate-400">Floor {room.floor}</span>
              </div>
              <p className="text-xs text-amber-300 font-medium">{room.roomType?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Status & Housekeeping Bar */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500 font-medium">Room State</div>
              <div className="text-sm font-bold uppercase tracking-wide mt-0.5 text-slate-800">
                {room.status}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-500 font-medium mb-1">Housekeeping</div>
              <select
                value={room.housekeepingStatus}
                onChange={(e) => handleHousekeepingChange(e.target.value as HousekeepingStatus)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="clean">✨ Clean & Ready</option>
                <option value="dirty">🧹 Dirty (Needs Cleaning)</option>
                <option value="inspecting">🔍 Inspecting</option>
                <option value="out_of_order">⚠️ Out of Order</option>
              </select>
            </div>
          </div>

          {/* Active Guest Info */}
          {reservation ? (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Current Guest
                    </span>
                    <SourceBadge source={reservation.source} />
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-500">
                    {reservation.bookingCode}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {reservation.guest.firstName} {reservation.guest.lastName}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>{reservation.guest.phone}</span>
                      <span>•</span>
                      <span>{reservation.guest.email}</span>
                    </div>
                  </div>
                  {reservation.guest.vip && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      ★ VIP GUEST
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400">Check-in:</span>{' '}
                    <span className="font-semibold text-slate-800">{reservation.checkInDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Check-out:</span>{' '}
                    <span className="font-semibold text-slate-800">{reservation.checkOutDate}</span> ({reservation.nights} nights)
                  </div>
                </div>

                {reservation.specialRequests && (
                  <div className="mt-3 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900">
                    <span className="font-bold">Guest Request:</span> {reservation.specialRequests}
                  </div>
                )}
              </div>

              {/* Folio & Charges */}
              {folio && (
                <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Active Folio #{folio.folioNumber}
                      </span>
                    </div>
                    <button
                      onClick={() => setAddingCharge(!addingCharge)}
                      className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Add Extra Charge
                    </button>
                  </div>

                  {/* Add charge drawer form */}
                  {addingCharge && (
                    <form onSubmit={handleAddCharge} className="p-3 mb-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-0.5">Category</label>
                          <select
                            value={chargeCategory}
                            onChange={(e) => setChargeCategory(e.target.value as any)}
                            className="w-full text-xs p-1.5 rounded border border-slate-300 bg-white"
                          >
                            <option value="restaurant">🍽 Restaurant / Room Service</option>
                            <option value="minibar">🍷 Mini Bar</option>
                            <option value="spa">💆 Spa & Wellness</option>
                            <option value="laundry">🧺 Laundry</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-600 mb-0.5">Amount (€)</label>
                          <input
                            type="number"
                            step="0.5"
                            required
                            value={chargeAmount}
                            onChange={(e) => setChargeAmount(e.target.value)}
                            className="w-full text-xs p-1.5 rounded border border-slate-300"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-600 mb-0.5">Description</label>
                        <input
                          type="text"
                          required
                          value={chargeDesc}
                          onChange={(e) => setChargeDesc(e.target.value)}
                          className="w-full text-xs p-1.5 rounded border border-slate-300"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setAddingCharge(false)}
                          className="text-xs px-2.5 py-1 text-slate-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="text-xs px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded"
                        >
                          Post to Folio
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Itemized list */}
                  <div className="space-y-1.5 max-h-32 overflow-y-auto text-xs border-y border-slate-100 py-2">
                    {folio.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-slate-700">
                        <span className="truncate pr-2">{item.description}</span>
                        <span className="font-semibold shrink-0">{formatCurrency(item.total)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Totals & Collect Payment Button */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500">Paid:</span>{' '}
                      <span className="font-semibold text-emerald-600">{formatCurrency(folio.totalPaid)}</span>
                      <span className="mx-2 text-slate-300">|</span>
                      <span className="text-slate-500">Due:</span>{' '}
                      <span className={`font-bold ${folio.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {formatCurrency(folio.balanceDue)}
                      </span>
                    </div>

                    {folio.balanceDue > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowPaymentModal(true)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
                      >
                        💳 Collect Payment
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                {reservation.status === 'confirmed' && (
                  <button
                    onClick={handleCheckIn}
                    className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <UserCheck className="w-4 h-4" />
                    Express Check-In
                  </button>
                )}

                {reservation.status === 'checked_in' && (
                  <button
                    onClick={handleCheckOut}
                    className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-2 shadow-md transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Process Check-Out
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl">
              <BedDouble className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Room is currently vacant</p>
              <p className="text-xs text-slate-400 mt-0.5">
                Ready for walk-in guest or online reservation
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Collection Modal */}
      {folio && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          folio={folio}
          onPaymentRecorded={async () => {
            if (reservation) {
              const { hotelService } = await import('@/lib/odoo/hotel-service');
              const updated = await hotelService.getFolio(reservation.id);
              setFolio(updated || null);
            }
            onActionComplete();
          }}
        />
      )}
    </div>
  );
}
