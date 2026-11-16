// src/components/CommerceFooter.tsx
import { Link } from 'react-router-dom';
import { Cpu, Shield, Truck, CreditCard, Lock } from 'lucide-react';

export default function CommerceFooter() {
  return (
    <footer className="bg-[#050505] border-t border-white/10 text-white/60 text-xs font-sans mt-24">
      {/* Commerce Trust Badges */}
      <div className="border-b border-white/10 py-8 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-white text-sm">Vetted Suppliers</p>
              <p className="text-[11px] text-white/50">ITAR / EAR & C-UAS compliance audited</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-cyan-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-white text-sm">Global Carrier Delivery</p>
              <p className="text-[11px] text-white/50">DHL Express, UPS & ParcelHub integrated</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-cyan-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-white text-sm">Multi-Payment Flexibility</p>
              <p className="text-[11px] text-white/50">Stripe, PayPal, Crypto wallets & Bank Wire</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Lock className="w-8 h-8 text-cyan-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-white text-sm">Escrow & Milestone Release</p>
              <p className="text-[11px] text-white/50">End-to-end buyer protection</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span className="font-display font-black text-white text-base">SKHY COMMERCE</span>
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed mb-4">
            The dedicated marketplace and simulation engineering suite for autonomous defense systems, tactical sensing, and custom RF payload integration.
          </p>
          <p className="text-[10px] font-mono text-cyan-400/80">
            Powered by Skhy AI Systems
          </p>
        </div>

        <div>
          <h4 className="font-mono text-xs uppercase tracking-widest text-white font-bold mb-4">Marketplace</h4>
          <ul className="space-y-2.5">
            <li><Link to="/skhy-store" className="hover:text-cyan-400">Featured Store</Link></li>
            <li><Link to="/marketplace" className="hover:text-cyan-400">Component Catalog</Link></li>
            <li><Link to="/marketplace/orders" className="hover:text-cyan-400">Order Tracking</Link></li>
            <li><Link to="/checkout" className="hover:text-cyan-400">Direct Checkout</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-xs uppercase tracking-widest text-white font-bold mb-4">Autonomy Builders</h4>
          <ul className="space-y-2.5">
            <li><Link to="/plan-scenario" className="hover:text-cyan-400">Build Your Own Autonomy</Link></li>
            <li><Link to="/simulators/heavy-lift" className="hover:text-cyan-400">Heavy Lift Simulator</Link></li>
            <li><Link to="/simulators/robust-transmission" className="hover:text-cyan-400">Transmission Simulator</Link></li>
            <li><Link to="/simulators/swarm-ai" className="hover:text-cyan-400">Swarm AI Simulator</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono text-xs uppercase tracking-widest text-white font-bold mb-4">Partners & Admin</h4>
          <ul className="space-y-2.5">
            <li><Link to="/partner" className="hover:text-cyan-400">Partner Dashboard</Link></li>
            <li><Link to="/partner/onboarding" className="hover:text-cyan-400">Supplier Onboarding</Link></li>
            <li><Link to="/admin" className="hover:text-cyan-400">Commerce Administration</Link></li>
            <li><a href="https://skhy.ai" target="_blank" rel="noreferrer" className="hover:text-cyan-400">Main Company Website ↗</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-6 text-center text-[11px] text-white/40">
        &copy; {new Date().getFullYear()} Skhy AI Systems. All rights reserved. Skhy Commerce Platform v3.
      </div>
    </footer>
  );
}
