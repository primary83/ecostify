"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Identifying the service needed",
  "Checking local pricing data",
  "Calculating fair price range",
];

export default function LoadingSteps() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    STEPS.forEach((_, i) => {
      timers.push(setTimeout(() => setActiveStep(i + 1), (i + 1) * 1200));
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="py-16 px-9 text-center" style={{ animation: "fadeIn 0.3s" }}>
      <div
        className="w-14 h-14 rounded-full mx-auto mb-6"
        style={{
          border: "3px solid rgba(26,26,46,0.08)",
          borderTopColor: "var(--sage)",
          animation: "spin 0.9s linear infinite",
        }}
      />
      <h3
        className="text-xl mb-2"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        Analyzing your request...
      </h3>
      <p className="text-sm text-ink-muted">
        Our AI is estimating a fair price for you
      </p>
      <div className="flex flex-col gap-2.5 mt-6 text-left max-w-[300px] mx-auto">
        {STEPS.map((step, i) => {
          const isDone = activeStep > i + 1 || (activeStep === STEPS.length && i === STEPS.length - 1);
          const isActive = activeStep === i + 1 && !isDone;
          return (
            <div
              key={i}
              className={`flex items-center gap-2.5 text-[13px] transition-all duration-400 ${
                isDone
                  ? "opacity-100 text-sage-dark"
                  : isActive
                  ? "opacity-100 text-ink"
                  : "opacity-40 text-ink-muted"
              }`}
            >
              <div
                className="w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 text-[11px]"
                style={{
                  background: isDone
                    ? "var(--sage)"
                    : isActive
                    ? "var(--sage-light)"
                    : "rgba(26,26,46,0.08)",
                  color: isDone
                    ? "white"
                    : isActive
                    ? "var(--sage-dark)"
                    : "inherit",
                }}
              >
                {isDone ? "\u2713" : i + 1}
              </div>
              {step}
            </div>
          );
        })}
      </div>
    </div>
  );
}
