import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import MuiRootProvider from "../components/ui/provider/MuiRootProvider";
import { PermissionsProvider } from "../contexts/AuthContext";
import LoginWrapper from "../components/ui/wrapper/LoginWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CRM - Inrext Private Limited",
  description:
    "Boost productivity with Inrext CRM, an all-in-one platform to manage leads, automate sales, track performance, and streamline your business operations.",
  icons: {
    icon: "/Inrext Favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MuiRootProvider>
          <AuthProvider>
            <NotificationProvider>
              <LoginWrapper>{children}</LoginWrapper>
            </NotificationProvider>
          </AuthProvider>
        </MuiRootProvider>
      </body>
    </html>
  );
}
