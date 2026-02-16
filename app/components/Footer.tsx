import Link from "next/link";
import { CATEGORIES } from "../lib/categories";

export default function Footer() {
  return (
    <footer
      className="py-12 px-8 text-center"
      style={{ borderTop: "1px solid rgba(26,26,46,0.08)" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-wrap justify-center gap-6 mb-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${cat.slug}`}
              className="text-sm no-underline text-ink-muted hover:text-ink transition-colors"
            >
              {cat.name}
            </Link>
          ))}
        </div>
        <p className="text-sm text-ink-muted">
          eCostify &mdash; Know what things should cost.
        </p>
        <p className="mt-2 text-xs text-ink-muted">
          Estimates are AI-generated for informational purposes only. Actual
          costs may vary by location and provider.
        </p>
      </div>
    </footer>
  );
}
