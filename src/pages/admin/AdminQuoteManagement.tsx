import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, Search, Clock, CheckCircle, AlertCircle, Edit, ExternalLink } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';

export default function AdminQuoteManagement() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (err) {
      console.error('Error fetching quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuotes = quotes.filter(q => 
    q.quote_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'quoted':
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="w-6 h-6 text-turquoise-400" />
          Quote Management
        </h1>
        <Link
          to="/admin/quote-generator"
          className="px-4 py-2 bg-turquoise-500 hover:bg-turquoise-400 text-navy-950 font-bold rounded-lg transition-colors"
        >
          Generate New PDF Quote
        </Link>
      </div>

      <div className="bg-navy-900 rounded-xl border border-white/10 p-6">
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search by Quote ID, Name, or Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-navy-950 border border-white/10 rounded-lg text-white focus:outline-none focus:border-turquoise-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 border-b border-white/10">
                <th className="pb-3 font-medium">Quote ID</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Customer</th>
                <th className="pb-3 font-medium">Items</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No quotes found
                  </td>
                </tr>
              ) : (
                filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 pr-4">
                      <span className="font-mono text-turquoise-400 font-semibold">{quote.quote_id}</span>
                    </td>
                    <td className="py-4 pr-4 text-sm text-gray-300">
                      {new Date(quote.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="text-sm font-medium">{quote.customer_name || 'N/A'}</div>
                      <div className="text-xs text-gray-400">{quote.customer_email}</div>
                    </td>
                    <td className="py-4 pr-4 text-sm text-gray-300">
                      {(quote.items_json as any[])?.length || 0} items
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2 text-sm capitalize">
                        {getStatusIcon(quote.status)}
                        <span className={quote.status === 'quoted' || quote.status === 'accepted' ? 'text-emerald-400' : quote.status === 'rejected' ? 'text-red-400' : 'text-amber-400'}>
                          {quote.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          to={`/quote/${quote.quote_id}`}
                          target="_blank"
                          className="p-1.5 bg-navy-800 hover:bg-navy-700 text-gray-300 rounded transition-colors"
                          title="View Customer Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        {/* Currently just view logic. Future iterations will add edit forms. */}
                        <button className="p-1.5 bg-navy-800 hover:bg-navy-700 text-turquoise-400 rounded transition-colors" title="Edit/Update Quote">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
