"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[1000] flex items-center justify-between transition-all duration-300 ${
        scrolled
          ? "px-8 py-3 shadow-[var(--shadow-sm)]"
          : "px-8 py-4"
      }`}
      style={{
        background: "rgba(253,248,240,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(26,26,46,0.06)",
      }}
    >
      <Link href="/" className="flex items-center gap-2.5 no-underline text-ink">
        <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
          <circle cx="16" cy="16" r="15" stroke="#7BAE7F" strokeWidth="2" />
          <path
            d="M10 18c0-3.3 2.7-6 6-6s6 2.7 6 6"
            stroke="#7BAE7F"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="16" cy="11" r="2" fill="#7BAE7F" />
        </svg>
        <span
          className="text-[22px] font-semibold"
          style={{ fontFamily: "'Fraunces', serif", letterSpacing: "-0.5px" }}
        >
          eCostify
        </span>
      </Link>
      <div className="hidden md:flex items-center gap-7">
        <Link
          href="/#categories"
          className="no-underline text-ink-muted text-sm font-medium hover:text-ink transition-colors"
          style={{ letterSpacing: "0.3px" }}
        >
          Categories
        </Link>
        <Link
          href="/#how-it-works"
          className="no-underline text-ink-muted text-sm font-medium hover:text-ink transition-colors"
          style={{ letterSpacing: "0.3px" }}
        >
          How It Works
        </Link>
        <Link
          href="/#categories"
          className="no-underline text-sm font-semibold px-5 py-2.5 rounded-full transition-all hover:-translate-y-px"
          style={{
            background: "var(--ink)",
            color: "var(--cream)",
          }}
        >
          Get Estimate
        </Link>
      </div>
    </nav>
  );
}
