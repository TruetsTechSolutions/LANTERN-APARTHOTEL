'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  CheckCircle2, 
  CreditCard, 
  Lock, 
  Calendar, 
  Users, 
  Bed, 
  ArrowLeft,
  Building2,
  Sparkles
} from 'lucide-react';
import { RoomType, Reservation } from '@/lib/odoo/types';
import { formatCurrency } from '@/lib/utils';

function CheckoutContent() {
  const searchParams = useSearchParams();
  const typeId = searchParams.get('type') || 'rt-classic';
  const checkInDate = searchParams.get('in') || '2026-09-14';
  const checkOutDate = searchParams.get('out') || '2026-09-17';
  const adults = Number(searchParams.get('adults')) || 2;

  const [roomType, setRoomType] = useState<RoomType | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'reception'>('card');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    const fetchType = async () => {
      const { hotelService } = await import('@/lib/odoo/hotel-service');
      const types = await hotelService.getRoomTypes();
      const found = types.find((t) => t.id === typeId) || types[0];
      setRoomType(found);
    };
    fetchType();
  }, [typeId]);

  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  const basePrice = roomType ? roomType.basePrice * nights : 0;
  const tourismTax = nights * 3.5;
  const grandTotal = basePrice + tourismTax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { hotelService } = await import('@/lib/odoo/hotel-service');
      const newRes = await hotelService.createReservation({
        roomTypeId: roomType?.id || 'rt-classic',
        checkInDate,
        checkOutDate,
        adults,
        children: 0,
        guest: {
          firstName,
          lastName,
          email,
          phone,
        },
        source: 'direct',
        depositPaid: paymentMethod === 'card' ? grandTotal : 0,
        specialRequests,
      });

      setConfirmedReservation(newRes);
    } catch (err) {
      alert('Error finalizing booking: ' + err);
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmedReservation) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 text-center">
        <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 shadow-xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Reservation Confirmed & Synced
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-1">
              Thank You, {confirmedReservation.guest.firstName}!
            </h1>
            <p className="text-slate-500 text-xs mt-1">
              A confirmation email has been sent to {confirmedReservation.guest.email}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">Booking Reference</span>
              <span className="font-mono font-bold text-amber-600 text-sm">
                {confirmedReservation.bookingCode}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Room Allocated</span>
              <span className="font-bold text-slate-800">
                Room {confirmedReservation.roomNumber} ({confirmedReservation.roomTypeName})
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Dates</span>
              <span className="font-semibold text-slate-800">
                {confirmedReservation.checkInDate} to {confirmedReservation.checkOutDate} ({confirmedReservation.nights} nights)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
              <span className="text-slate-500">Total Amount</span>
              <span className="font-black text-slate-900 text-sm">
                {formatCurrency(confirmedReservation.totalAmount)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
            >
              Return to Homepage
            </Link>
            <Link
              href="/staff"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              View in Staff Room Rack →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <Link
        href="/book"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to room choices
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Guest Information</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                We will send booking confirmation and digital key details to this email.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. John"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Doe"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john.doe@example.com"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+49 171 000000"
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Special Requests or Dietary Requirements
              </label>
              <textarea
                rows={2}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g. Early check-in requested, feather pillow allergy"
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Payment Method */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Select Payment Method</h3>
              <div className="space-y-2">
                <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                  paymentMethod === 'card' ? 'border-amber-500 bg-amber-50/40' : 'border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800">Credit / Debit Card (Stripe)</div>
                      <div className="text-[10px] text-slate-500">Instant guaranteed booking & invoice in Odoo</div>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-slate-400" />
                </label>

                <label className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                  paymentMethod === 'reception' ? 'border-amber-500 bg-amber-50/40' : 'border-slate-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'reception'}
                      onChange={() => setPaymentMethod('reception')}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-800">Pay at Reception Upon Arrival</div>
                      <div className="text-[10px] text-slate-500">Cash or card accepted at check-in</div>
                    </div>
                  </div>
                  <Building2 className="w-5 h-5 text-slate-400" />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              {submitting ? 'Confirming in Odoo...' : `Confirm Reservation • ${formatCurrency(grandTotal)}`}
            </button>
          </form>
        </div>

        {/* Stay Summary Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Reservation Summary
            </h3>

            {roomType && (
              <div>
                <h4 className="text-lg font-black text-slate-900">{roomType.name}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>{roomType.bedType}</span>
                  <span>•</span>
                  <span>{adults} Guests</span>
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Check-In:</span>
                <span className="font-bold text-slate-900">{checkInDate} (from 14:00)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Check-Out:</span>
                <span className="font-bold text-slate-900">{checkOutDate} (until 11:00)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Stay:</span>
                <span className="font-bold text-slate-900">{nights} Night(s)</span>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Room Charges ({nights} nights):</span>
                <span>{formatCurrency(basePrice)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>City Tourism Tax:</span>
                <span>{formatCurrency(tourismTax)}</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-black text-slate-900">
                <span>Grand Total:</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xl">
              T
            </div>
            <div>
              <span className="font-bold tracking-wider text-lg uppercase bg-gradient-to-r from-amber-200 to-amber-400 bg-clip-text text-transparent">
                TURM GRAND HOTEL
              </span>
              <span className="block text-[10px] text-slate-400 tracking-widest uppercase">
                Secure Checkout
              </span>
            </div>
          </Link>
        </div>
      </header>

      <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading checkout...</div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
