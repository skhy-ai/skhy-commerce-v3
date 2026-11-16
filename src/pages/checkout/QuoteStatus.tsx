import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export default function QuoteStatus() {
  const { quoteId } = useParams();
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadQuote() {
      if (!quoteId) return;
      try {
        const { data, error } = await supabase
          .from('quotes')
          .select('*')
          .eq('quote_id', quoteId)
          .single();

        if (error) throw error;
        setQuote(data);
      } catch (err: any) {
        console.error('Error fetching quote:', err);
        setError('Quote not found or you do not have permission to view it.');
      } finally {
        setLoading(false);
      }
    }
    loadQuote();
  }, [quoteId]);

  if (loading) return <LoadingSpinner />;

  if (error || !quote) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Quote Not Found</h2>
        <p className="text-slate-400 mb-8">{error}</p>
        <Link to="/" className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'quoted':
      case 'accepted':
        return <CheckCircle className="w-8 h-8 text-emerald-500" />;
      case 'rejected':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Clock className="w-8 h-8 text-amber-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'quoted': return 'Quote Ready';
      case 'accepted': return 'Quote Accepted';
      case 'rejected': return 'Quote Rejected';
      case 'reviewed': return 'Under Review';
      default: return 'Pending Review';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-slate-800/80 rounded-2xl border border-slate-700 p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-700">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
              <FileText className="w-6 h-6 text-sky-400" />
              Quote Request
            </h1>
            <p className="text-slate-400 font-mono">{quote.quote_id}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              {getStatusIcon(quote.status)}
              <span className="text-lg font-bold text-white">{getStatusText(quote.status)}</span>
            </div>
            <p className="text-sm text-slate-400">
              Requested: {new Date(quote.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Request Details</h2>
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Customer Name</p>
                <p className="text-white">{quote.customer_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Email</p>
                <p className="text-white">{quote.customer_email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Requested Items</h2>
          <div className="space-y-3">
            {(quote.items_json as any[])?.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-slate-900/50 rounded-lg p-4 border border-slate-700/50">
                <div>
                  <p className="text-white font-medium">{item.name}</p>
                  <p className="text-sm text-slate-400">Qty: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm line-through">${(item.price * item.quantity).toFixed(2)}</p>
                  <p className="text-sky-400 font-bold">Pending Best Price</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {quote.status === 'expired' && (
          <div className="bg-red-950/40 border border-red-500/40 rounded-xl p-6 text-center text-red-300 font-mono space-y-2 mb-8">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
            <h3 className="text-lg font-bold text-red-200">QUOTATION EXPIRED</h3>
            <p className="text-xs text-red-300/80 max-w-md mx-auto">
              This quote request has been marked as expired by our sales team. Please submit a new Request for Quote or contact SKHY AI Sales for an updated quotation.
            </p>
          </div>
        )}

        {quote.status === 'quoted' && quote.quoted_price && (
          <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl p-6 text-center">
            <h3 className="text-emerald-400 font-bold mb-2">Your Quoted Price</h3>
            <p className="text-4xl font-bold text-white mb-4">${Number(quote.quoted_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <div className="flex gap-4 justify-center">
              <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors">
                Accept & Pay via SWIFT
              </button>
            </div>
          </div>
        )}

        {quote.admin_notes && (
          <div className="mt-8 bg-sky-900/20 border border-sky-500/30 rounded-lg p-4">
            <h3 className="text-sky-400 font-bold mb-2 text-sm">Message from Sales Team</h3>
            <p className="text-sky-100/80 text-sm">{quote.admin_notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
