import { type ReactNode } from 'react';

import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';

import '@/app/globals.css';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { AuthProvider as AppAuthProvider } from '@/components/providers/auth-provider';
import { ToastProvider } from '@/components/providers/toast-provider';
import { AuthProvider } from '@/contexts/auth-context';
import QueryProvider from '@/components/providers/query-provider';
import { TitleProvider } from '@/components/providers/title-provider';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap'
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || 'Sistem Pelaporan Prestasi Mahasiswa',
  description: process.env.NEXT_PUBLIC_APP_NAME || 'Sistem Pelaporan Prestasi Mahasiswa'
};

const Layout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <html lang='en' className={poppins.variable} suppressHydrationWarning>
      <body
        className={`${poppins.className} text-foreground bg-white antialiased`}
        suppressHydrationWarning>
        <QueryProvider>
          <ToastProvider />
          <TitleProvider>
            <AuthProvider>
              <AppAuthProvider>
                <DashboardLayout>{children}</DashboardLayout>
              </AppAuthProvider>
            </AuthProvider>
          </TitleProvider>
        </QueryProvider>
      </body>
    </html>
  );
};

export default Layout;
