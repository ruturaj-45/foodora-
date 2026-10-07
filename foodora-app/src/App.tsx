import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { OrdersProvider } from './context/OrdersContext';
import { ToastProvider } from './context/ToastContext';
import { CustomerLayout } from './components/layout/CustomerLayout';
import { RestaurantLayout } from './components/layout/RestaurantLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Customer pages
const HomePage = lazy(() => import('./pages/customer/HomePage'));
const RestaurantsPage = lazy(() => import('./pages/customer/RestaurantsPage'));
const RestaurantPage = lazy(() => import('./pages/customer/RestaurantPage'));
const CartPage = lazy(() => import('./pages/customer/CartPage'));
const CheckoutPage = lazy(() => import('./pages/customer/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/customer/OrderSuccessPage'));
const OrderTrackingPage = lazy(() => import('./pages/customer/OrderTrackingPage'));
const OrdersPage = lazy(() => import('./pages/customer/OrdersPage'));
const FavoritesPage = lazy(() => import('./pages/customer/FavoritesPage'));
const ProfilePage = lazy(() => import('./pages/customer/ProfilePage'));

// Auth pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));

// Restaurant pages
const DashboardPage = lazy(() => import('./pages/restaurant/DashboardPage'));
const RestaurantOrdersPage = lazy(() => import('./pages/restaurant/RestaurantOrdersPage'));
const MenuManagementPage = lazy(() => import('./pages/restaurant/MenuManagementPage'));
const AnalyticsPage = lazy(() => import('./pages/restaurant/AnalyticsPage'));
const OffersPage = lazy(() => import('./pages/restaurant/OffersPage'));

// Admin pages
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminRestaurantsPage = lazy(() => import('./pages/admin/AdminRestaurantsPage'));
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));

// Page loader
const PageLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const App: React.FC = () => (
  <BrowserRouter>
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <OrdersProvider>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Customer routes */}
                    <Route element={<CustomerLayout />}>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/restaurants" element={<RestaurantsPage />} />
                      <Route path="/restaurant/:id" element={<RestaurantPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/order-success/:id" element={<OrderSuccessPage />} />
                      <Route path="/orders/:id" element={<OrderTrackingPage />} />
                      <Route path="/orders" element={<OrdersPage />} />
                      <Route path="/favorites" element={<FavoritesPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                    </Route>

                    {/* Auth routes (no layout) */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />

                    {/* Restaurant dashboard routes */}
                    <Route path="/restaurant" element={<RestaurantLayout />}>
                      <Route path="dashboard" element={<DashboardPage />} />
                      <Route path="orders" element={<RestaurantOrdersPage />} />
                      <Route path="menu" element={<MenuManagementPage />} />
                      <Route path="analytics" element={<AnalyticsPage />} />
                      <Route path="offers" element={<OffersPage />} />
                      <Route path="settings" element={<DashboardPage />} />
                    </Route>

                    {/* Admin routes */}
                    <Route path="/admin" element={<AdminLayout />}>
                      <Route path="dashboard" element={<AdminDashboardPage />} />
                      <Route path="restaurants" element={<AdminRestaurantsPage />} />
                      <Route path="customers" element={<AdminCustomersPage />} />
                      <Route path="orders" element={<AdminOrdersPage />} />
                      <Route path="analytics" element={<AdminDashboardPage />} />
                      <Route path="settings" element={<AdminDashboardPage />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Suspense>
              </OrdersProvider>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
