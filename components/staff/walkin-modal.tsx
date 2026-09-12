'use client';

import React, { useState } from 'react';
import { X, UserPlus, CreditCard, BedDouble, Calendar, Sparkles, Smartphone, QrCode } from 'lucide-react';
import { HotelRoom, RoomType } from '@/lib/odoo/types';
import { formatCurrency } from '@/lib/utils';

interface WalkInModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableRooms: HotelRoom[];
  roomTypes: RoomType[];
  onBookingCreated: () => void;
}

export function WalkInModal({
  isOpen,
  onClose,
  availableRooms,
  roomTypes,
  onBookingCreated,
}: WalkInModalProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [idType, setIdType] = useState('Aadhaar');
  const [idNumber, setIdNumber] = useState('');
  const [roomTypeId, setRoomTypeId] = useState(roomTypes[0]?.id || '');
  const [roomId, setRoomId] = useState('');
  const [withBreakfast, setWithBreakfast] = useState(false);
  const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Default checkout: tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [checkOutDate, setCheckOutDate] = useState(tomorrow.toISOString().split('T')[0]);
  
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [paymentMode, setPaymentMode] = useState<'upi' | 'cash' | 'card'>('upi');
  const [deposit, setDeposit] = useState('2000');
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  // Filter available rooms by selected room type
  const matchingRooms = availableRooms.filter(
    (r) => (!roomTypeId || r.roomTypeId === roomTypeId) && r.status === 'available'
  );

  const selectedType = roomTypes.find((t) => t.id === roomTypeId) || roomTypes[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { hotelService } = await import('@/lib/odoo/hotel-service');
      await hotelService.createReservation({
        roomTypeId: selectedType?.id || 'rt-superior',
        roomId: roomId || matchingRooms[0]?.id,
        checkInDate,
        checkOutDate,
        adults: Number(adults),
        children: Number(children),
        guest: {
          firstName,
          lastName,
          phone,
          email,
          identityNumber: `${idType}: ${idNumber}`,
        },
        source: 'walk_in',
        depositPaid: Number(deposit) || 0,
        specialRequests: `${withBreakfast ? '[Includes Breakfast] ' : ''}${specialRequests}`.trim(),
      });

      onBookingCreated();
      onClose();
    } catch (err) {
      alert('Error creating walk-in reservation: ' + err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Express Guest Walk-In Check-In</h2>
              <p className="text-xs text-slate-400">Lantern Apart Hotel • Odoo 19 Folio Creation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Guest Information */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              1. Guest Contact & Identity (Required for Police / Odoo record)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammed"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Last Name / Family Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basheer"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Mobile / WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98470 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="guest@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">ID Proof Type</label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Aadhaar">Aadhaar Card</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Voter ID">Voter ID</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">{idType} Number *</label>
                <input
                  type="text"
                  required
                  placeholder="XXXX-XXXX-XXXX"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Stay & Room Selection */}
          <div className="pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              2. Apartment Category & Stay Dates
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Check-In Date</label>
                <input
                  type="date"
                  required
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Check-Out Date</label>
                <input
                  type="date"
                  required
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Apartment Category</label>
                <select
                  value={roomTypeId}
                  onChange={(e) => {
                    setRoomTypeId(e.target.value);
                    setRoomId('');
                  }}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {roomTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({formatCurrency(t.basePrice)}/night)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Assign Room Unit</label>
                <select
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {matchingRooms.length > 0 ? (
                    matchingRooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        Apartment {r.number} (Floor {r.floor})
                      </option>
                    ))
                  ) : (
                    <option value="">No clean units available</option>
                  )}
                </select>
              </div>
            </div>

            {/* Breakfast option */}
            <div className="mt-3 bg-amber-50/70 border border-amber-200/80 p-3 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-amber-900">Include Breakfast Package?</div>
                <div className="text-[11px] text-amber-700">Adds morning dining buffet (+₹600/day)</div>
              </div>
              <input
                type="checkbox"
                checked={withBreakfast}
                onChange={(e) => setWithBreakfast(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Payment & Advance Deposit */}
          <div className="pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              3. Advance Payment Collection
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('upi')}
                    className={`py-1.5 text-xs font-bold rounded-lg border flex items-center justify-center gap-1 transition ${
                      paymentMode === 'upi' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    <QrCode className="w-3 h-3" /> UPI / GPay
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('cash')}
                    className={`py-1.5 text-xs font-bold rounded-lg border flex items-center justify-center gap-1 transition ${
                      paymentMode === 'cash' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode('card')}
                    className={`py-1.5 text-xs font-bold rounded-lg border flex items-center justify-center gap-1 transition ${
                      paymentMode === 'card' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700'
                    }`}
                  >
                    Card
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-1">Advance Collected (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={deposit}
                  onChange={(e) => setDeposit(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-slate-600 mb-1">Notes / Hospital / Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Patient at KIMS Al-Shifa, needs wheelchair access"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md transition disabled:opacity-50"
            >
              {submitting ? 'Creating in Odoo...' : 'Confirm Check-In & Issue Key'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
