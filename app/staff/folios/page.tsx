'use client';

import React, { useState, useEffect } from 'react';
import { HotelFolio } from '@/lib/odoo/types';
import { formatCurrency } from '@/lib/utils';
import { Receipt, FileText, CheckCircle2, RefreshCw, PlusCircle, CreditCard } from 'lucide-react';
import { PaymentModal } from '@/components/staff/payment-modal';

export default function FoliosBillingPage() {
  const [folios, setFolios] = useState<HotelFolio[]>([]);
  const [selectedFolio, setSelectedFolio] = useState<HotelFolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [invoicingId, setInvoicingId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const loadFolios = async () => {
    setLoading(true);
    try {
      const { hotelService } = await import('@/lib/odoo/hotel-service');
      const data = await hotelService.getAllFolios();
      setFolios(data);
      if (data.length > 0 && !selectedFolio) {
        setSelectedFolio(data[0]);
      }
    } catch (err) {
      console.error('Error loading folios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFolios();
  }, []);

  const handleGenerateInvoice = async (folio: HotelFolio) => {
    setInvoicingId(folio.id);
    // Simulate Odoo invoice creation via account.move
    setTimeout(() => {
      folio.odooInvoiceId = Math.floor(1000 + Math.random() * 9000);
      setInvoicingId(null);
      alert(`Odoo 19 Invoice INV/2026/${folio.odooInvoiceId} generated successfully! Posted to Accounting.`);
      loadFolios();
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Folios & Odoo Billing</h2>
          <p className="text-xs text-slate-500">
            Active guest accounts, incidentals (mini-bar, restaurant, spa), and one-click Odoo invoice generation
          </p>
        </div>
        <button
          onClick={loadFolios}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-500' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Folio Master List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2">
            Active Folios ({folios.length})
          </h3>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {folios.map((folio) => {
              const isSelected = selectedFolio?.id === folio.id;
              return (
                <div
                  key={folio.id}
                  onClick={() => setSelectedFolio(folio)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">Room {folio.roomNumber}</span>
                    <span className="text-[10px] font-mono text-slate-400">{folio.folioNumber}</span>
                  </div>
                  <div className="text-xs text-slate-700 font-medium mt-0.5">{folio.guestName}</div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">Total: {formatCurrency(folio.totalCharges)}</span>
                    <span className={`font-bold ${folio.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      Due: {formatCurrency(folio.balanceDue)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Folio Itemized Detail & Invoicing */}
        <div className="lg:col-span-2 space-y-6">
          {selectedFolio ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Folio</span>
                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {selectedFolio.folioNumber}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-1">
                    {selectedFolio.guestName} — Room {selectedFolio.roomNumber}
                  </h2>
                </div>

                {/* Actions: Collect Payment & Odoo Invoice */}
                <div className="flex items-center gap-2">
                  {selectedFolio.balanceDue > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowPaymentModal(true)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Collect Payment
                    </button>
                  )}

                  {selectedFolio.odooInvoiceId ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Odoo Invoice #INV/{selectedFolio.odooInvoiceId} Posted
                    </div>
                  ) : (
                    <button
                      onClick={() => handleGenerateInvoice(selectedFolio)}
                      disabled={invoicingId === selectedFolio.id}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition flex items-center gap-2"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      {invoicingId === selectedFolio.id ? 'Generating in Odoo...' : 'Generate Odoo 19 Invoice'}
                    </button>
                  )}
                </div>
              </div>

              {/* Itemized Table */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Itemized Charges
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3.5 font-bold">Date</th>
                        <th className="py-2.5 px-3.5 font-bold">Category</th>
                        <th className="py-2.5 px-3.5 font-bold">Description</th>
                        <th className="py-2.5 px-3.5 font-bold text-center">Qty</th>
                        <th className="py-2.5 px-3.5 font-bold text-right">Unit Price</th>
                        <th className="py-2.5 px-3.5 font-bold text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedFolio.items.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-3.5 text-slate-500 font-mono">{item.date}</td>
                          <td className="py-3 px-3.5">
                            <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[10px]">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 font-medium text-slate-800">{item.description}</td>
                          <td className="py-3 px-3.5 text-center text-slate-600">{item.quantity}</td>
                          <td className="py-3 px-3.5 text-right text-slate-600">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="py-3 px-3.5 text-right font-bold text-slate-900">
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Totals Summary */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Charges:</span>
                  <span className="font-semibold">{formatCurrency(selectedFolio.totalCharges)}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Payments Received:</span>
                  <span className="font-semibold">-{formatCurrency(selectedFolio.totalPaid)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                  <span>Balance Due:</span>
                  <span className={selectedFolio.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                    {formatCurrency(selectedFolio.balanceDue)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              Select a folio from the left column to view charges
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {selectedFolio && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          folio={selectedFolio}
          onPaymentRecorded={loadFolios}
        />
      )}
    </div>
  );
}
