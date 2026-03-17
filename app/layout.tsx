import type { Metadata } from "next";
import type { ReactNode } from "react";
import "98.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kyle Lee Portfolio",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
