import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { ToastContainer } from '../ui/Toast';

export const CustomerLayout: React.FC = () => (
  <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex flex-col">
    <Navbar />
    <main className="flex-1 pt-[72px]">
      <Outlet />
    </main>
    <Footer />
    <ToastContainer />
  </div>
);
