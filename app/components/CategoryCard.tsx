"use client";

import Link from "next/link";
import type { CategoryConfig } from "../lib/types";

export default function CategoryCard({ category }: { category: CategoryConfig }) {
  return (
    <Link
      href={`/${category.slug}/estimate`}
      className="block bg-white rounded-[var(--radius)] p-8 text-center no-underline text-ink transition-all duration-400 border-2 border-transparent hover:-translate-y-1.5 hover:shadow-[var(--shadow-lg)] relative overflow-hidden"
      style={{
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-[28px] transition-transform duration-300 hover:scale-110"
        style={{ background: category.colorBg }}
      >
        {category.icon}
      </div>
      <h3
        className="text-lg font-semibold mb-1.5"
        style={{ fontFamily: "'Fraunces', serif", letterSpacing: "-0.3px" }}
      >
        {category.name}
      </h3>
      <p className="text-[13px] text-ink-muted leading-relaxed">
        {category.subtitle}
      </p>
    </Link>
  );
}
