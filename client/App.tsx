import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProfileProvider } from "./contexts/UserProfileContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";

const Index = lazy(() => import("./pages/Index"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Payment = lazy(() => import("./pages/Payment"));
const AddressSetup = lazy(() => import("./pages/AddressSetup"));
const AddressManagement = lazy(() => import("./pages/AddressManagement"));
const OrderHistory = lazy(() => import("./pages/OrderHistory"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const FarmerDashboard = lazy(() => import("./pages/FarmerDashboard"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <CartProvider>
    <AuthProvider>
      <UserProfileProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ErrorBoundary>
                <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Index />} />
                    <Route path="marketplace" element={<Marketplace />} />
                    <Route path="about" element={<About />} />
                    <Route path="login" element={<Login />} />
                    <Route path="reset-password" element={<ResetPassword />} />
                    <Route path="contact" element={<Contact />} />
                    <Route
                      path="checkout"
                      element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="payment"
                      element={
                        <ProtectedRoute>
                          <Payment />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="address-setup"
                      element={
                        <ProtectedRoute>
                          <AddressSetup />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="address-management"
                      element={
                        <ProtectedRoute>
                          <AddressManagement />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="order-history"
                      element={
                        <ProtectedRoute>
                          <OrderHistory />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="farmer-dashboard"
                      element={
                        <ProtectedRoute>
                          <FarmerDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="admin"
                      element={
                        <AdminRoute>
                          <Admin />
                        </AdminRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
                </Suspense>
              </ErrorBoundary>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </UserProfileProvider>
    </AuthProvider>
  </CartProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
