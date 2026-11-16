// src/components/CommerceNavbar.tsx
import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut, User, LayoutDashboard, ShoppingBag, Settings, Shield, Cpu, PackageCheck } from 'lucide-react';
import { CartTrigger } from './shopping/CartTrigger';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import {
  detectUserCountry,
  currencyForCountry,
  SUPPORTED_CURRENCIES,
  type CurrencyCode,
} from '../utils/geoCurrency';

export default function CommerceNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [simulatorsOpen, setSimulatorsOpen] = useState(false);

  const { user, signOut } = useAuth();
  const { currency, setCurrency } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef<HTMLDivElement>(null);
  const simulatorsRef = useRef<HTMLDivElement>(null);

  const rawType = (user?.user_type || user?.user_metadata?.user_type || '').toLowerCase();
  const isPartner = rawType === 'partner' || rawType === 'seller';
  const isAdmin = rawType === 'admin';

  const displayName = user?.user_metadata?.full_name
    || user?.user_metadata?.company_name
    || user?.company_name
    || user?.email?.split('@')[0]
    || 'Account';

  const avatarInitial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    detectUserCountry().then(cc => {
      const pref = currencyForCountry(cc);
      setCurrency(pref.currency as CurrencyCode);
    });
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (simulatorsRef.current && !simulatorsRef.current.contains(e.target as Node)) {
        setSimulatorsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Store', href: '/skhy-store' },
    { name: 'Catalog', href: '/marketplace' },
    { name: 'Build Autonomy', href: '/plan-scenario' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-white/10 text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center group-hover:border-cyan-400 transition-colors">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="font-display font-black text-lg tracking-wider uppercase text-white flex items-center gap-1.5">
                SKHY <span className="text-cyan-400 font-mono text-sm">COMMERCE</span>
              </div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-white/50 -mt-1">
                Autonomous Systems v3
              </div>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const active = location.pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`px-4 py-2 text-xs uppercase tracking-widest font-semibold transition-colors ${
                    active ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Simulators Dropdown */}
            <div className="relative" ref={simulatorsRef}>
              <button
                type="button"
                onClick={() => setSimulatorsOpen(!simulatorsOpen)}
                className="flex items-center gap-1 px-4 py-2 text-xs uppercase tracking-widest font-semibold text-white/70 hover:text-white transition-colors"
              >
                <span>Simulators</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>

              {simulatorsOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-[#0a0a0a] border border-white/10 shadow-2xl py-2 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-cyan-400/80 border-b border-white/10">
                    Autonomy Simulators
                  </div>
                  <Link
                    to="/plan-scenario"
                    onClick={() => setSimulatorsOpen(false)}
                    className="block px-4 py-2 text-xs text-white/80 hover:bg-white/5 hover:text-cyan-400"
                  >
                    Build Your Own Autonomy
                  </Link>
                  <Link
                    to="/simulators/heavy-lift"
                    onClick={() => setSimulatorsOpen(false)}
                    className="block px-4 py-2 text-xs text-white/80 hover:bg-white/5 hover:text-cyan-400"
                  >
                    Heavy Lift Drone Simulator
                  </Link>
                  <Link
                    to="/simulators/robust-transmission"
                    onClick={() => setSimulatorsOpen(false)}
                    className="block px-4 py-2 text-xs text-white/80 hover:bg-white/5 hover:text-cyan-400"
                  >
                    Robust RF Transmission
                  </Link>
                  <Link
                    to="/simulators/swarm-ai"
                    onClick={() => setSimulatorsOpen(false)}
                    className="block px-4 py-2 text-xs text-white/80 hover:bg-white/5 hover:text-cyan-400"
                  >
                    Swarm AI Simulator
                  </Link>
                  <Link
                    to="/simulators/fixed-wing"
                    onClick={() => setSimulatorsOpen(false)}
                    className="block px-4 py-2 text-xs text-white/80 hover:bg-white/5 hover:text-cyan-400"
                  >
                    Fixed-Wing Aerodynamics
                  </Link>
                  <Link
                    to="/simulators/rover"
                    onClick={() => setSimulatorsOpen(false)}
                    className="block px-4 py-2 text-xs text-white/80 hover:bg-white/5 hover:text-cyan-400"
                  >
                    Tactical Rover Transmission
                  </Link>
                  <Link
                    to="/simulators/rf-jammer"
                    onClick={() => setSimulatorsOpen(false)}
                    className="block px-4 py-2 text-xs text-white/80 hover:bg-white/5 hover:text-cyan-400"
                  >
                    RF Jammer Simulator
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/partner"
              className={`px-4 py-2 text-xs uppercase tracking-widest font-semibold transition-colors ${
                location.pathname.startsWith('/partner') ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-white/70 hover:text-white'
              }`}
            >
              Partner
            </Link>

            <Link
              to="/admin"
              className={`px-4 py-2 text-xs uppercase tracking-widest font-semibold transition-colors ${
                location.pathname.startsWith('/admin') ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-white/70 hover:text-white'
              }`}
            >
              Admin
            </Link>
          </div>

          {/* Right Action Icons: Currency, Cart, Account */}
          <div className="flex items-center gap-3">
            
            {/* Currency Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCurrencyOpen(!currencyOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-white/5 border border-white/10 text-xs font-mono font-semibold text-white/80 hover:border-cyan-400/50"
              >
                <span>{currency}</span>
                <ChevronDown className="w-3 h-3 text-white/50" />
              </button>
              {currencyOpen && (
                <div className="absolute right-0 mt-2 w-28 bg-[#0a0a0a] border border-white/10 shadow-xl py-1 z-50">
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCurrency(c as CurrencyCode);
                        setCurrencyOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-mono ${
                        currency === c ? 'text-cyan-400 bg-white/5 font-bold' : 'text-white/70 hover:bg-white/5'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Shopping Cart Trigger */}
            <CartTrigger />

            {/* Profile Dropdown */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 font-bold flex items-center justify-center hover:scale-105 transition"
                >
                  {avatarInitial}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#0a0a0a] border border-white/10 shadow-2xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-xs font-bold text-white truncate">{displayName}</p>
                      <p className="text-[10px] text-white/50 font-mono truncate">{user.email}</p>
                    </div>

                    <Link
                      to="/marketplace/orders"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs text-white/80 hover:bg-white/5 hover:text-cyan-400"
                    >
                      <ShoppingBag className="w-4 h-4" /> My Orders
                    </Link>

                    {isPartner && (
                      <Link
                        to="/partner/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-white/80 hover:bg-white/5 hover:text-cyan-400"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Partner Dashboard
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-white/80 hover:bg-white/5 hover:text-cyan-400"
                      >
                        <Shield className="w-4 h-4" /> Admin Console
                      </Link>
                    )}

                    <div className="border-t border-white/10 my-1"></div>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-xs text-red-400 hover:bg-white/5"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-xs uppercase font-mono font-bold tracking-wider text-white/80 hover:text-white"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs uppercase font-mono font-bold tracking-wider bg-cyan-500 text-black rounded hover:bg-cyan-400 transition"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-white/70 hover:text-white"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-white/10 py-4 space-y-2 bg-[#0a0a0a]">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold uppercase tracking-wider text-white/80 hover:text-cyan-400"
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/partner"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold uppercase tracking-wider text-white/80 hover:text-cyan-400"
            >
              Partner
            </Link>
            <Link
              to="/admin"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold uppercase tracking-wider text-white/80 hover:text-cyan-400"
            >
              Admin
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
