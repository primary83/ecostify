"use client";

import type { EstimateResult } from "../lib/types";

interface EstimateResultProps {
  result: EstimateResult;
  onReset: () => void;
}

export default function EstimateResultDisplay({
  result,
  onReset,
}: EstimateResultProps) {
  const confidenceLabel =
    result.confidence === "high"
      ? "High confidence"
      : result.confidence === "medium"
      ? "Medium confidence"
      : "Rough estimate";

  return (
    <div className="p-9" style={{ animation: "fadeInUp 0.6s ease" }}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2
          className="text-[26px] mb-1"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {result.serviceName}
        </h2>
        <p className="text-ink-muted text-sm">
          {confidenceLabel} &middot; {result.timeEstimate || "Time varies"}
        </p>
      </div>

      {/* Price Display */}
      <div
        className="rounded-[var(--radius)] p-8 text-center mb-6"
        style={{
          background: "linear-gradient(135deg, #f8fdf8, #edf7ee)",
          border: "1px solid rgba(123,174,127,0.2)",
        }}
      >
        <div className="text-[13px] text-ink-muted uppercase tracking-[1.5px] font-semibold mb-2">
          Fair Price Range
        </div>
        <div
          className="text-[42px] font-bold text-sage-dark max-md:text-[32px]"
          style={{ fontFamily: "'Fraunces', serif", letterSpacing: "-1px" }}
        >
          ${result.priceLow.toLocaleString()} &mdash; $
          {result.priceHigh.toLocaleString()}
        </div>
        <div className="text-sm text-ink-muted mt-1">
          Average cost: <strong>${result.priceAvg.toLocaleString()}</strong>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Description */}
        <div
          className="rounded-[var(--radius-sm)] p-5"
          style={{
            background: "rgba(26,26,46,0.02)",
            border: "1px solid rgba(26,26,46,0.06)",
          }}
        >
          <h4 className="text-[13px] uppercase tracking-wider text-ink-muted font-semibold mb-2">
            What This Involves
          </h4>
          <p className="text-[15px] leading-relaxed text-ink-light">
            {result.description}
          </p>
        </div>

        {/* Tips & Red Flags */}
        {result.tips && result.tips.length > 0 && (
          <div
            className="rounded-[var(--radius-sm)] p-5"
            style={{
              background: "rgba(26,26,46,0.02)",
              border: "1px solid rgba(26,26,46,0.06)",
            }}
          >
            <h4 className="text-[13px] uppercase tracking-wider text-ink-muted font-semibold mb-2">
              Tips & Red Flags
            </h4>
            <div className="flex flex-col gap-2">
              {result.tips.map((tip, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 py-3 px-4 rounded-[var(--radius-xs)] text-sm leading-relaxed"
                  style={{
                    background:
                      tip.type === "green"
                        ? "var(--sage-light)"
                        : tip.type === "yellow"
                        ? "var(--gold-light)"
                        : "var(--coral-light)",
                    color:
                      tip.type === "green"
                        ? "var(--sage-dark)"
                        : tip.type === "yellow"
                        ? "#8B6914"
                        : "var(--coral)",
                  }}
                >
                  <span className="text-base shrink-0 mt-px">
                    {tip.type === "green"
                      ? "\u2705"
                      : tip.type === "yellow"
                      ? "\u26A0\uFE0F"
                      : "\u{1F6A9}"}
                  </span>
                  {tip.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions to Ask */}
        {result.questionsToAsk && result.questionsToAsk.length > 0 && (
          <div
            className="rounded-[var(--radius-sm)] p-5"
            style={{
              background: "rgba(26,26,46,0.02)",
              border: "1px solid rgba(26,26,46,0.06)",
            }}
          >
            <h4 className="text-[13px] uppercase tracking-wider text-ink-muted font-semibold mb-2">
              Questions to Ask
            </h4>
            {result.questionsToAsk.map((q, i) => (
              <div
                key={i}
                className="flex gap-2 items-start mb-1.5 text-[15px] leading-relaxed text-ink-light"
              >
                <span className="text-sage font-bold">&rarr;</span>
                <span>{q}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-7 max-md:flex-col">
        <button
          onClick={onReset}
          className="flex-1 py-3.5 rounded-full text-sm font-semibold cursor-pointer border-none transition-all duration-300 hover:-translate-y-px hover:shadow-[var(--shadow-md)]"
          style={{ background: "var(--ink)", color: "var(--cream)" }}
        >
          Get Another Estimate
        </button>
        <button
          onClick={() => window.print()}
          className="flex-1 py-3.5 rounded-full text-sm font-semibold cursor-pointer bg-white text-ink transition-all duration-300 hover:border-ink"
          style={{ border: "1.5px solid rgba(26,26,46,0.15)" }}
        >
          Save / Print
        </button>
      </div>
    </div>
  );
}
