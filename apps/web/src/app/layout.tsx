import type { Metadata } from "next";

import { StoreProvider } from "./StoreProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Brightstar Market Watch",
  description:
    "Real-time market watch and momentum scanner",
};

/**
 * RootLayout is the main layout component for the application.
 * It wraps the entire application with the StoreProvider for state management.
 * @param children - The child components to be rendered within the layout.
 * @returns A React component that renders the layout.
 */
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