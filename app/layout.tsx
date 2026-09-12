import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Turm Grand Hotel & Spa - Management System & Booking',
  description: 'Enterprise Hotel PMS & Direct Booking Engine integrated with Odoo 19',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
