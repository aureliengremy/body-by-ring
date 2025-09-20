import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/components/auth/AuthProvider';
import { AppLayout } from '@/components/layout/AppLayout';
import { ServiceWorkerRegistration } from '@/components/pwa/ServiceWorkerRegistration';
import { ToastProvider } from '@/components/ui/toast';
import { SkipNavigation } from '@/components/accessibility/SkipNavigation';
import { ThemeProvider } from '@/components/theme/ThemeProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Body by Rings - Calisthenics Training",
  description: "Professional calisthenics training app with tendon-safe progressions",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Body by Rings",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServiceWorkerRegistration>
          <SkipNavigation />
          <ThemeProvider>
            <ToastProvider>
              <AuthProvider>
                <AppLayout>
                  <main id="main-content" tabIndex={-1}>
                    {children}
                  </main>
                </AppLayout>
              </AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </ServiceWorkerRegistration>
      </body>
    </html>
  );
}
