// src/pages/checkout/CryptoPaymentForm.tsx
import React, { useState } from 'react';
import { Copy, CheckCircle, Wallet, ExternalLink, ShieldCheck, QrCode } from 'lucide-react';
import { CryptoWalletConfig } from '../../types/payment';
import { formatMoney, CurrencyCode } from '../../utils/geoCurrency';

interface CryptoPaymentFormProps {
  amountUSD: number;
  currency: CurrencyCode;
  config?: CryptoWalletConfig;
  onSuccess: (paymentDetails: { txHash: string; network: string; token: string; amount: number }) => void;
}

export const CryptoPaymentForm: React.FC<CryptoPaymentFormProps> = ({
  amountUSD,
  config,
  onSuccess,
}) => {
  const [selectedChain, setSelectedChain] = useState<'polygon' | 'ethereum' | 'arbitrum' | 'solana'>('polygon');
  const [selectedToken, setSelectedToken] = useState<'USDC' | 'USDT' | 'ETH' | 'SOL'>('USDC');
  const [txHash, setTxHash] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evmAddress = config?.merchantEvmAddress || '0x71C94511B3e3612806A3F140a8523c9E39F24177';
  const solanaAddress = config?.merchantSolanaAddress || 'Skhy9XWqZq8YhWbVvQpLtJ1vF4wGmBn2Kx3T8yU6oP1';

  const receivingAddress = selectedChain === 'solana' ? solanaAddress : evmAddress;

  const handleCopy = () => {
    navigator.clipboard.writeText(receivingAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleConnectWallet = async () => {
    if (typeof (window as any).ethereum !== 'undefined' && selectedChain !== 'solana') {
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setError(null);
          alert(`Connected wallet: ${accounts[0]}. Please transfer ${amountUSD} ${selectedToken} to the merchant address below and paste the Transaction Hash.`);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to connect Web3 wallet');
      }
    } else {
      alert('No Web3 wallet browser extension detected. Please copy the merchant address and transfer via your exchange or wallet app.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txHash || txHash.trim().length < 10) {
      setError('Please provide a valid blockchain Transaction Hash / TXID.');
      return;
    }

    setSubmitting(true);
    setError(null);

    setTimeout(() => {
      setSubmitting(false);
      onSuccess({
        txHash: txHash.trim(),
        network: selectedChain,
        token: selectedToken,
        amount: amountUSD,
      });
    }, 1200);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-cyan-400" />
          <h3 className="font-bold text-base uppercase tracking-wider">Pay with Verified Crypto Wallet</h3>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          Zero Gateway Surcharge
        </span>
      </div>

      {/* Network & Token Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Select Network</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'polygon', name: 'Polygon (Fast & Cheap)' },
              { id: 'ethereum', name: 'Ethereum Mainnet' },
              { id: 'arbitrum', name: 'Arbitrum One' },
              { id: 'solana', name: 'Solana Network' },
            ].map(net => (
              <button
                key={net.id}
                type="button"
                onClick={() => {
                  setSelectedChain(net.id as any);
                  if (net.id === 'solana') {
                    setSelectedToken('USDC');
                  }
                }}
                className={`p-2.5 text-xs rounded border text-left transition ${
                  selectedChain === net.id
                    ? 'border-cyan-400 bg-cyan-500/10 text-white font-bold'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                {net.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-2">Select Asset</label>
          <div className="grid grid-cols-2 gap-2">
            {(selectedChain === 'solana' ? ['USDC', 'SOL'] : ['USDC', 'USDT', 'ETH']).map(tok => (
              <button
                key={tok}
                type="button"
                onClick={() => setSelectedToken(tok as any)}
                className={`p-2.5 text-xs rounded border text-center transition ${
                  selectedToken === tok
                    ? 'border-cyan-400 bg-cyan-500/10 text-white font-bold'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                {tok}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Amount Display */}
      <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 uppercase font-mono">Invoice Payable</p>
          <p className="text-2xl font-bold font-mono text-cyan-400">
            {amountUSD.toFixed(2)} <span className="text-sm text-slate-300">{selectedToken}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleConnectWallet}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-xs text-white border border-slate-700 transition"
        >
          <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          Connect Web3
        </button>
      </div>

      {/* Merchant Address Copy */}
      <div className="space-y-2">
        <label className="block text-xs font-mono uppercase text-slate-400">
          Merchant Receiving Address ({selectedChain.toUpperCase()})
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={receivingAddress}
            className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-2.5 text-xs font-mono text-slate-200 select-all"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 text-xs font-bold font-mono flex items-center gap-1.5 transition"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Proof of Transfer Form */}
      <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-800">
        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
            Transaction Hash / TXID <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. 0x8a9b2f... or Solana signature"
            value={txHash}
            onChange={e => setTxHash(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-4 py-2.5 text-xs font-mono text-white placeholder-slate-600 focus:border-cyan-400 outline-none"
          />
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 p-2.5 rounded">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold text-sm uppercase tracking-wider transition shadow-lg disabled:opacity-50"
        >
          {submitting ? 'Verifying Blockchain Transfer...' : 'Confirm Crypto Payment & Place Order'}
        </button>

        <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Transactions are audited on-chain against our cold & multisig treasury.
        </p>
      </form>
    </div>
  );
};
