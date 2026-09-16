import type { Metadata } from "next";

import { StoreProvider } from "./StoreProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Brightstar Market Watch",
  description:
    "Real-time market watch and momentum scanner",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}