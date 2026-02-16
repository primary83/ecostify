import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryBySlug, CATEGORIES } from "@/app/lib/categories";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};
  return {
    title: `${category.name} Cost Estimator | eCostify`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { category: slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="pt-32 pb-20 px-8 max-w-[900px] mx-auto">
      {/* Hero */}
      <div className="text-center mb-12">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl"
          style={{ background: category.colorBg }}
        >
          {category.icon}
        </div>
        <h1
          className="text-[clamp(32px,5vw,48px)] font-light mb-4"
          style={{
            fontFamily: "'Fraunces', serif",
            letterSpacing: "-1px",
          }}
        >
          {category.name}{" "}
          <em className="font-normal italic text-sage-dark">Cost Estimator</em>
        </h1>
        <p className="text-lg text-ink-muted max-w-[600px] mx-auto leading-[1.7] mb-8">
          {category.description}
        </p>
        <div className="flex gap-4 justify-center max-md:flex-col max-md:items-center">
          <Link
            href={`/${category.slug}/estimate`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold no-underline transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]"
            style={{ background: "var(--ink)", color: "var(--cream)" }}
          >
            Get Free Estimate
          </Link>
          <Link
            href={`/${category.slug}/providers`}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold no-underline transition-all hover:border-ink"
            style={{
              border: "1.5px solid rgba(26,26,46,0.15)",
              color: "var(--ink)",
            }}
          >
            Find Providers Near You
          </Link>
        </div>
      </div>

      {/* What You Can Estimate */}
      <div
        className="bg-white rounded-[var(--radius)] p-8 mb-8"
        style={{ boxShadow: "var(--shadow-md)" }}
      >
        <h2
          className="text-2xl font-semibold mb-6"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          What You Can Estimate
        </h2>
        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          {category.fields
            .flatMap((f) => {
              if ("row" in f) return f.row;
              return f.type === "select" && f.id === "serviceType" ? [f] : [];
            })
            .filter((f) => f.id === "serviceType")
            .flatMap((f) =>
              (f.options || []).filter(
                (o) => o !== "Select..." && o !== "Other"
              )
            )
            .map((service) => (
              <div
                key={service}
                className="flex items-center gap-2 py-2 px-3 rounded-[var(--radius-xs)] text-sm text-ink-light"
                style={{ background: "rgba(26,26,46,0.02)" }}
              >
                <span className="text-sage">&#8594;</span>
                {service}
              </div>
            ))}
        </div>
      </div>

      {/* How It Works */}
      <div
        className="bg-white rounded-[var(--radius)] p-8"
        style={{ boxShadow: "var(--shadow-md)" }}
      >
        <h2
          className="text-2xl font-semibold mb-6"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          How It Works
        </h2>
        <div className="flex flex-col gap-4">
          {[
            {
              num: "1",
              title: "Upload a photo or describe what you need",
              desc: "Our AI can analyze photos of damage, issues, or inspiration images to identify what service is needed.",
            },
            {
              num: "2",
              title: "Get an instant fair price range",
              desc: "We provide low, average, and high prices based on real market data so you know what to expect.",
            },
            {
              num: "3",
              title: "Learn what to ask & watch for",
              desc: "We give you tips to avoid overpaying, red flags to watch for, and questions to ask the provider.",
            },
          ].map((step) => (
            <div key={step.num} className="flex gap-4 items-start">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg font-semibold"
                style={{
                  background: "var(--sage-light)",
                  color: "var(--sage-dark)",
                  fontFamily: "'Fraunces', serif",
                }}
              >
                {step.num}
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1">{step.title}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
