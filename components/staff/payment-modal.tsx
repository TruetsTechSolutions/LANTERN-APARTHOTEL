'use client';

import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Share2, 
  CheckCircle2, 
  Smartphone,
  Copy,
  Check
} from 'lucide-react';
import { HotelFolio } from '@/lib/odoo/types';
import { formatCurrency } from '@/lib/utils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  folio: HotelFolio;
  onPaymentRecorded: () => void;
}

export function PaymentModal({ isOpen, onClose, folio, onPaymentRecorded }: PaymentModalProps) {
  const [method, setMethod] = useState<'upi' | 'card' | 'cash' | 'whatsapp'>('upi');
  const [amount, setAmount] = useState(folio.balanceDue.toString());
  const [reference, setReference] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  // Hotel UPI VPA configuration (e.g. lanternaparthotel@hdfcbank or custom)
  const hotelUpiVpa = 'lanternaparthotel@upi';
  const hotelName = 'Lantern Apart Hotel';
  
  // Standard NPCI UPI URI scheme for dynamic QR code
  const upiPayUrl = `upi://pay?pa=${hotelUpiVpa}&pn=${encodeURIComponent(hotelName)}&am=${amount}&cu=INR&tn=Folio-${folio.folioNumber}`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiPayUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`Dear ${folio.guestName}, please pay ${formatCurrency(Number(amount))} for your stay at Lantern Apart Hotel using this UPI link: ${upiPayUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { hotelService } = await import('@/lib/odoo/hotel-service');
      await hotelService.addPaymentToFolio(folio.reservationId, {
        date: new Date().toISOString().split('T')[0],
        amount: Number(amount),
        method: method === 'upi' ? 'upi' : method === 'card' ? 'credit_card' : 'cash',
        reference: reference || (method === 'upi' ? 'UPI-APP-CONFIRMED' : method === 'cash' ? 'CASH-DRAWER' : 'POS-SWIPE'),
      });

      onPaymentRecorded();
      onClose();
    } catch (err) {
      alert('Error recording payment: ' + err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold">Collect Payment — Room {folio.roomNumber}</h3>
            <p className="text-xs text-slate-400">Folio #{folio.folioNumber} • {folio.guestName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Amount to Collect */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-semibold uppercase">Total Balance Due</span>
              <div className="text-2xl font-black text-rose-600 mt-0.5">
                {formatCurrency(folio.balanceDue)}
              </div>
            </div>
            <div className="w-40">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Payment Amount (₹)</label>
              <input
                type="number"
                required
                min="1"
                max={folio.balanceDue * 2}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-sm font-black px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-right bg-white"
              />
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Collection Mode
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'upi', label: 'UPI / GPay', icon: QrCode },
                { id: 'card', label: 'Card POS', icon: CreditCard },
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'whatsapp', label: 'WhatsApp', icon: Share2 },
              ].map((tab) => {
                const Icon = tab.icon;
                const isSelected = method === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setMethod(tab.id as any)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1.5 transition ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Method 1: Dynamic UPI QR Code */}
          {method === 'upi' && (
            <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 text-center space-y-3">
              <div className="text-xs font-bold text-indigo-950 flex items-center justify-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                Scan & Pay with GPay / PhonePe / Paytm
              </div>

              {/* QR Image */}
              <div className="bg-white p-3 rounded-xl border border-indigo-200 inline-block shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrCodeImageUrl}
                  alt="Dynamic UPI QR Code"
                  className="w-40 h-40 mx-auto"
                />
              </div>

              <div className="text-[11px] text-slate-500">
                Amount dynamically encoded: <span className="font-bold text-slate-800">{formatCurrency(Number(amount))}</span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 text-left mb-1">
                  UPI Ref / UTR Number (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 429103948210"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Method 2: Card POS Terminal */}
          {method === 'card' && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
              <div className="text-xs text-slate-600">
                Swipe or Tap the guest card on your physical EDC / POS machine (PineLabs, HDFC, SBI).
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Card Approval Code / RRN *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AUTH-948201"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          )}

          {/* Method 3: Cash */}
          {method === 'cash' && (
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
              <div className="text-xs text-emerald-900 font-semibold">
                Collect {formatCurrency(Number(amount))} in cash at reception desk drawer.
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Cash Receipt Notes
                </label>
                <input
                  type="text"
                  placeholder="Cash collected by shift receptionist"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>
          )}

          {/* Method 4: WhatsApp Link */}
          {method === 'whatsapp' && (
            <div className="p-4 rounded-xl border border-green-200 bg-green-50/50 space-y-3 text-center">
              <p className="text-xs text-slate-700">
                Send an instant UPI payment request directly to the guest's WhatsApp:
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={upiPayUrl}
                  className="w-full text-xs p-2 rounded-lg border border-green-200 bg-white font-mono text-slate-600"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
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
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Recording in Odoo...' : `Record Payment of ${formatCurrency(Number(amount))}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
