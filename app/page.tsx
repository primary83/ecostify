import { CATEGORIES } from "./lib/categories";
import CategoryCard from "./components/CategoryCard";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="pt-36 pb-20 px-8 text-center max-w-[820px] mx-auto">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold uppercase tracking-wider mb-7"
          style={{
            background: "var(--sage-light)",
            color: "var(--sage-dark)",
            letterSpacing: "0.8px",
            animation: "fadeInDown 0.6s ease",
          }}
        >
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
            <path d="M8 0l2 5h5l-4 3.5L12.5 16 8 11.5 3.5 16 5 8.5 1 5h5z" />
          </svg>
          AI-Powered Estimator
        </div>
        <h1
          className="text-[clamp(38px,6vw,64px)] font-light leading-[1.1] mb-5"
          style={{
            fontFamily: "'Fraunces', serif",
            letterSpacing: "-1.5px",
            animation: "fadeInUp 0.8s ease",
          }}
        >
          What Should This <em className="font-normal italic text-sage-dark">Cost</em>?
        </h1>
        <p
          className="text-lg text-ink-muted max-w-[540px] mx-auto mb-10 leading-[1.7]"
          style={{ animation: "fadeInUp 0.8s ease 0.15s both" }}
        >
          Snap a photo or describe what you need &mdash; get an instant, fair
          price estimate so you never overpay again.
        </p>
        <div
          className="flex items-center justify-center gap-6 flex-wrap"
          style={{ animation: "fadeInUp 0.8s ease 0.3s both" }}
        >
          {["Free & instant", "No signup required", "Know before you go"].map(
            (text) => (
              <div
                key={text}
                className="flex items-center gap-1.5 text-[13px] text-ink-muted"
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-4 h-4 text-sage"
                >
                  <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.5 6.2l-4 4a.7.7 0 01-1 0l-2-2a.7.7 0 111-1L7 8.8l3.5-3.5a.7.7 0 111 1z" />
                </svg>
                {text}
              </div>
            )
          )}
        </div>
      </section>

      {/* Categories */}
      <section
        id="categories"
        className="px-8 pb-20 max-w-[1100px] mx-auto"
      >
        <div className="grid grid-cols-4 gap-5 max-md:grid-cols-2 max-md:gap-3">
          {CATEGORIES.map((cat) => (
            <CategoryCard key={cat.slug} category={cat} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-8 max-w-[900px] mx-auto">
        <div className="text-center mb-3">
          <span className="text-xs uppercase tracking-[2px] text-sage-dark font-bold">
            How It Works
          </span>
        </div>
        <h2
          className="text-[clamp(28px,4vw,40px)] font-light text-center mb-12"
          style={{ fontFamily: "'Fraunces', serif", letterSpacing: "-1px" }}
        >
          Three steps to confidence
        </h2>
        <div className="grid grid-cols-3 gap-8 max-md:grid-cols-1 max-md:gap-4">
          {[
            {
              num: "1",
              title: "Choose a Category",
              desc: "Pick from automotive, home services, beauty, or weddings & events.",
            },
            {
              num: "2",
              title: "Snap or Describe",
              desc: "Upload a photo of the issue or describe what you need in plain English.",
            },
            {
              num: "3",
              title: "Know Before You Go",
              desc: "Get an instant fair price range so you walk in with confidence, not confusion.",
            },
          ].map((step) => (
            <div key={step.num} className="text-center p-6">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-semibold"
                style={{
                  background: "var(--sage-light)",
                  color: "var(--sage-dark)",
                  fontFamily: "'Fraunces', serif",
                }}
              >
                {step.num}
              </div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {step.title}
              </h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
