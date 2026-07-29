import type { Metadata } from "next";
import { Oswald, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth/context";
import { SessionProvider } from "@/lib/session/context";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Staff Buddy",
  description: "Staff admin for SpherEarth website and soccer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-CA"
      className={`${spaceGrotesk.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <AuthProvider>
          <SessionProvider>
            {children}
            <Toaster richColors position="top-right" />
          </SessionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
