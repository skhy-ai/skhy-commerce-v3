// src/App.tsx
import { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import BlockedAccess from './components/BlockedAccess';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { MissionStateProvider } from './contexts/MissionStateContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { detectUserCountry, isCountryBlocked } from './utils/geoCurrency';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { Toaster } from 'react-hot-toast';
import CommerceNavbar from './components/CommerceNavbar';
import CommerceFooter from './components/CommerceFooter';

// Lazy-loaded deferred widgets
const CartDrawer = lazy(() => import('./components/shopping/CartDrawer').then(m => ({ default: m.CartDrawer })));

// Store & Marketplace Pages
const SkhyStore = lazy(() => import('./pages/SkhyStore'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage.tsx'));
const SellerProfilePage = lazy(() => import('./pages/marketplace/SellerProfilePage').then(m => ({ default: m.SellerProfilePage })));
const ClaimSellerPage = lazy(() => import('./pages/marketplace/ClaimSellerPage').then(m => ({ default: m.ClaimSellerPage })));
const DelistConfirmationPage = lazy(() => import('./pages/marketplace/DelistConfirmationPage').then(m => ({ default: m.DelistConfirmationPage })));
const TechnicalDatasheet = lazy(() => import('./pages/marketplace/TechnicalDatasheet'));
const BuyerOrders = lazy(() => import('./pages/buyer/BuyerOrders').then(m => ({ default: m.BuyerOrders })));
const RefundRequest = lazy(() => import('./pages/buyer/RefundRequest').then(m => ({ default: m.RefundRequest })));
const RefundManagement = lazy(() => import('./pages/partner/RefundManagement').then(m => ({ default: m.RefundManagement })));

// Checkout & Quotes
const CheckoutLayout = lazy(() => import('./pages/checkout/CheckoutLayout').then(m => ({ default: m.CheckoutLayout })));
const CheckoutPage = lazy(() => import('./pages/checkout/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderConfirmation = lazy(() => import('./pages/checkout/OrderConfirmation').then(m => ({ default: m.OrderConfirmation })));
const QuoteStatus = lazy(() => import('./pages/checkout/QuoteStatus'));

// Simulators (Build Your Own Autonomy)
const MissionArchitect = lazy(() => import('./pages/simulators/MissionArchitect'));
const HeavyLiftSimulator = lazy(() => import('./pages/simulators/HeavyLiftSimulator'));
const RobustTransmissionSimulator = lazy(() => import('./pages/simulators/RobustTransmissionSimulator'));
const SwarmAI = lazy(() => import('./pages/simulators/SwarmAISimulator').then(m => ({ default: m.default })));
const FixedWingSimulator = lazy(() => import('./pages/simulators/FixedWingSimulator'));
const RoverTransmissionSimulator = lazy(() => import('./pages/simulators/RoverTransmissionSimulator'));
const RFJammerSimulator = lazy(() => import('./pages/simulators/RFJammerSimulator'));

// Partner Dashboard
const PartnerLanding = lazy(() => import('./pages/PartnerLanding'));
const PartnerOnboarding = lazy(() => import('./pages/PartnerOnboarding'));
const PartnerDashboard = lazy(() => import('./pages/partner/PartnerDashboard').then(module => ({ default: module.PartnerDashboard })));
const DashboardOverview = lazy(() => import('./pages/partner/DashboardOverview').then(module => ({ default: module.DashboardOverview })));
const ProductManagement = lazy(() => import('./pages/partner/ProductManagement').then(module => ({ default: module.ProductManagement })));
const OrderHistory = lazy(() => import('./pages/partner/OrderHistory').then(module => ({ default: module.OrderHistory })));
const PartnerProfile = lazy(() => import('./pages/partner/PartnerProfile').then(module => ({ default: module.PartnerProfile })));
const PayoutSettings = lazy(() => import('./pages/partner/PayoutSettings').then(module => ({ default: module.PayoutSettings })));
const PartnerPerformance = lazy(() => import('./pages/partner/PartnerPerformance').then(module => ({ default: module.PartnerPerformance })));
const ShippingSettings = lazy(() => import('./pages/partner/ShippingSettings').then(module => ({ default: module.ShippingSettings })));
const NDAPage = lazy(() => import('./pages/NDA'));

// Admin Dashboard
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ProductApproval = lazy(() => import('./pages/admin/ProductApproval').then(module => ({ default: module.ProductApproval })));
const PartnerManagement = lazy(() => import('./pages/admin/PartnerManagement').then(module => ({ default: module.PartnerManagement })));
const MarketplaceAnalytics = lazy(() => import('./pages/admin/MarketplaceAnalytics').then(module => ({ default: module.MarketplaceAnalytics })));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminLeads = lazy(() => import('./pages/admin/AdminLeads').then(m => ({ default: m.AdminLeads })));
const DelistRequests = lazy(() => import('./pages/admin/DelistRequests').then(module => ({ default: module.DelistRequests })));
const SalesAgentsManagement = lazy(() => import('./pages/admin/SalesAgentsManagement').then(module => ({ default: module.SalesAgentsManagement })));
const SupplierCompliance = lazy(() => import('./pages/admin/SupplierCompliance'));
const QuoteGenerator = lazy(() => import('./pages/admin/QuoteGenerator').then(module => ({ default: module.QuoteGenerator })));
const AdminQuoteManagement = lazy(() => import('./pages/admin/AdminQuoteManagement'));

// Auth
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/Register').then(m => ({ default: m.Register })));
const CustomerRegister = lazy(() => import('./pages/CustomerRegister').then(m => ({ default: m.CustomerRegister })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/ResetPassword').then(m => ({ default: m.ResetPassword })));
const AuthCallback = lazy(() => import('./pages/auth/AuthCallback'));
const OAuthConsent = lazy(() => import('./pages/auth/OAuthConsent'));

function PartnerGateLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  const isExactPartnerRoot = location.pathname === '/partner' || location.pathname === '/partner/';
  if (!user && isExactPartnerRoot) {
    return <PartnerLanding />;
  }

  return (
    <ProtectedRoute>
      <PartnerDashboard />
    </ProtectedRoute>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      {children}
    </div>
  );
}

export default function App() {
  const [isBlocked, setIsBlocked] = useState<boolean>(false);

  useEffect(() => {
    detectUserCountry().then((countryCode) => {
      const blocked = isCountryBlocked(countryCode);
      if (blocked) {
        setIsBlocked(true);
      }
    });
  }, []);

  if (isBlocked) {
    return <BlockedAccess />;
  }

  return (
    <AuthProvider>
      <CartProvider>
        <MissionStateProvider>
          <Router>
            <Suspense fallback={<LoadingSpinner />}>
              <AppShell>
                <Routes>
                  {/* Default Commerce Index */}
                  <Route index element={<SkhyStore />} />
                  <Route path="/skhy-store" element={<SkhyStore />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/marketplace/product/:id" element={<ProductDetailPage />} />
                  <Route path="/marketplace/seller/:sellerId" element={<SellerProfilePage />} />
                  <Route path="/marketplace/claim-page/:sellerId" element={<ClaimSellerPage />} />
                  <Route path="/marketplace/delist/confirm" element={<DelistConfirmationPage />} />
                  <Route path="/marketplace/product/:id/datasheet" element={<TechnicalDatasheet />} />
                  
                  {/* Buyer & Orders */}
                  <Route path="/marketplace/orders" element={<ProtectedRoute><BuyerOrders /></ProtectedRoute>} />
                  <Route path="/marketplace/orders/:orderId/refund" element={<ProtectedRoute><RefundRequest /></ProtectedRoute>} />
                  
                  {/* Checkout */}
                  <Route path="/checkout" element={<CheckoutLayout />}>
                    <Route index element={<CheckoutPage />} />
                    <Route path="success" element={<OrderConfirmation />} />
                  </Route>
                  <Route path="/quote/:quoteId" element={<QuoteStatus />} />

                  {/* Simulators & Build Your Own Autonomy */}
                  <Route path="/plan-scenario" element={<ProtectedRoute><MissionArchitect /></ProtectedRoute>} />
                  <Route path="/simulators/heavy-lift" element={<ProtectedRoute><HeavyLiftSimulator /></ProtectedRoute>} />
                  <Route path="/simulators/robust-transmission" element={<ProtectedRoute><RobustTransmissionSimulator /></ProtectedRoute>} />
                  <Route path="/simulators/swarm-ai" element={<ProtectedRoute><SwarmAI /></ProtectedRoute>} />
                  <Route path="/simulators/fixed-wing" element={<ProtectedRoute><FixedWingSimulator /></ProtectedRoute>} />
                  <Route path="/simulators/rover" element={<ProtectedRoute><RoverTransmissionSimulator /></ProtectedRoute>} />
                  <Route path="/simulators/rf-jammer" element={<ProtectedRoute><RFJammerSimulator /></ProtectedRoute>} />

                  {/* Partner Routes */}
                  <Route path="/partners" element={<PartnerLanding />} />
                  <Route path="/partner/onboarding" element={<ProtectedRoute><PartnerOnboarding /></ProtectedRoute>} />
                  <Route path="/partner-onboarding" element={<Navigate to="/partner/onboarding" replace />} />
                  <Route path="/nda" element={<NDAPage />} />
                  <Route path="/partner" element={<PartnerGateLayout />}>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardOverview />} />
                    <Route path="products" element={<ProductManagement />} />
                    <Route path="orders" element={<OrderHistory />} />
                    <Route path="refunds" element={<RefundManagement />} />
                    <Route path="shipping" element={<ShippingSettings />} />
                    <Route path="payouts" element={<PayoutSettings />} />
                    <Route path="performance" element={<PartnerPerformance />} />
                    <Route path="profile" element={<PartnerProfile />} />
                  </Route>

                  {/* Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/login/oauth/consent" element={<OAuthConsent />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/register/customer" element={<CustomerRegister />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />

                  {/* Admin Routes */}
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="marketplace/analytics" element={<MarketplaceAnalytics />} />
                    <Route path="marketplace/products" element={<ProductApproval />} />
                    <Route path="marketplace/partners" element={<PartnerManagement />} />
                    <Route path="marketplace/delist-requests" element={<DelistRequests />} />
                    <Route path="marketplace/compliance" element={<SupplierCompliance />} />
                    <Route path="leads" element={<AdminLeads />} />
                    <Route path="sales-agents" element={<SalesAgentsManagement />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="quotes" element={<AdminQuoteManagement />} />
                    <Route path="quote-generator" element={<QuoteGenerator />} />
                  </Route>

                  {/* Catch-all redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </AppShell>
            </Suspense>
            <Toaster position="bottom-right" />
            <Suspense fallback={null}>
              <CartDrawer />
            </Suspense>
          </Router>
        </MissionStateProvider>
      </CartProvider>
    </AuthProvider>
  );
}
