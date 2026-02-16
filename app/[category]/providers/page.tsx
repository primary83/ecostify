"use client";

import { useParams, useRouter } from "next/navigation";
import { getCategoryBySlug } from "@/app/lib/categories";
import ProviderList from "@/app/components/ProviderList";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProvidersPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.category as string;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return (
      <div className="pt-36 pb-20 px-8 text-center max-w-[780px] mx-auto">
        <h1
          className="text-3xl mb-4"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Category not found
        </h1>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 rounded-full font-semibold border-none cursor-pointer"
          style={{ background: "var(--ink)", color: "var(--cream)" }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{ background: category.colorBg }}
            >
              {category.icon}
            </div>
            <h1
              className="text-2xl font-semibold"
              style={{
                fontFamily: "'Fraunces', serif",
                letterSpacing: "-0.5px",
              }}
            >
              {category.name} Providers
            </h1>
          </div>
          <p className="text-sm text-ink-muted">
            Find trusted {category.name.toLowerCase()} providers near you
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/${category.slug}/estimate`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold no-underline"
            style={{ background: "var(--ink)", color: "var(--cream)" }}
          >
            Get Estimate
          </Link>
          <button
            onClick={() => router.push(`/${category.slug}`)}
            className="flex items-center gap-1.5 bg-transparent text-ink-muted text-sm font-medium px-4 py-2.5 rounded-full cursor-pointer transition-all hover:text-ink hover:border-ink"
            style={{ border: "1px solid rgba(26,26,46,0.12)" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        </div>
      </div>

      <ProviderList
        searchTerms={category.placesSearchTerms}
        categoryName={category.name}
      />
    </div>
  );
}
