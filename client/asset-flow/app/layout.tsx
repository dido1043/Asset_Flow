import type { Metadata } from "next";
import type { ReactNode } from "react";
import React from "react";

import Navigation from "./components/shared/Navigation/Navigation";
import { LanguageProvider } from "./lib/i18n";


export const metadata: Metadata = {
  title: "Asset Flow",
  description: "Asset management platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-900">
        <LanguageProvider>
          <Navigation />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
