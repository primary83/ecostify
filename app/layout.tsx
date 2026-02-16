import type { Metadata } from "next";
import "./globals.css";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "eCostify \u2014 What Should This Cost?",
  description:
    "AI-powered cost estimator for auto, home, beauty, and wedding services. Snap a photo or describe what you need \u2014 get an instant, fair price estimate so you never overpay again.",
  keywords:
    "cost estimator, eCostify, home repair cost, auto repair cost, wedding cost, beauty services cost, AI estimator",
  openGraph: {
    title: "eCostify \u2014 What Should This Cost?",
    description:
      "Snap a photo or describe what you need \u2014 get an instant, fair price estimate so you never overpay again.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
