"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { getCategoryBySlug } from "@/app/lib/categories";
import type { EstimateResult, FormField, FormFieldBase } from "@/app/lib/types";
import PhotoUploader from "@/app/components/PhotoUploader";
import EstimatorForm from "@/app/components/EstimatorForm";
import LoadingSteps from "@/app/components/LoadingSteps";
import EstimateResultDisplay from "@/app/components/EstimateResult";
import { ArrowLeft } from "lucide-react";

function getAllFieldIds(fields: FormField[]): string[] {
  const ids: string[] = [];
  for (const field of fields) {
    if ("row" in field) {
      for (const f of field.row) {
        ids.push(f.id);
      }
    } else {
      ids.push((field as FormFieldBase).id);
    }
  }
  return ids;
}

export default function EstimatePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.category as string;
  const category = getCategoryBySlug(slug);

  const [photo, setPhoto] = useState<{ base64: string; mimeType: string } | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EstimateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFormChange = useCallback((id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handlePhotoReady = useCallback(
    (data: { base64: string; mimeType: string } | null) => {
      setPhoto(data);
    },
    []
  );

  const handleEstimate = async () => {
    if (!category) return;
    setLoading(true);
    setError(null);

    try {
      // Build labeled form data
      const labeledData: Record<string, string> = {};
      for (const field of category.fields) {
        if ("row" in field) {
          for (const f of field.row) {
            if (formData[f.id]) labeledData[f.label] = formData[f.id];
          }
        } else {
          const f = field as FormFieldBase;
          if (formData[f.id]) labeledData[f.label] = formData[f.id];
        }
      }

      const response = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: slug,
          image: photo?.base64 || null,
          mimeType: photo?.mimeType || null,
          formData: labeledData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setResult(data.result);
    } catch (err) {
      setError(
        (err as Error).message ||
          "Something went wrong. Please try again or add more details."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setPhoto(null);
    setError(null);
    if (category) {
      const ids = getAllFieldIds(category.fields);
      const empty: Record<string, string> = {};
      ids.forEach((id) => (empty[id] = ""));
      setFormData(empty);
    }
  };

  if (!category) {
    return (
      <div className="pt-36 pb-20 px-8 text-center max-w-[780px] mx-auto">
        <h1
          className="text-3xl mb-4"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Category not found
        </h1>
        <p className="text-ink-muted mb-6">
          This category doesn&apos;t exist yet.
        </p>
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
    <div className="pt-28 pb-20 px-8 max-w-[780px] mx-auto">
      <div
        className="bg-white rounded-[20px] overflow-hidden"
        style={{ boxShadow: "var(--shadow-lg)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-8 pb-6 max-md:flex-col max-md:items-start max-md:gap-3"
          style={{ borderBottom: "1px solid rgba(26,26,46,0.06)" }}
        >
          <div className="flex items-center gap-3.5">
            <div
              className="w-[42px] h-[42px] rounded-xl flex items-center justify-center text-xl"
              style={{ background: category.colorBg }}
            >
              {category.icon}
            </div>
            <div>
              <h2
                className="text-[22px] font-semibold"
                style={{
                  fontFamily: "'Fraunces', serif",
                  letterSpacing: "-0.3px",
                }}
              >
                {category.name} Estimate
              </h2>
              <p className="text-[13px] text-ink-muted mt-0.5">
                {category.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-1.5 bg-transparent text-ink-muted text-[13px] font-medium px-4 py-2 rounded-full cursor-pointer transition-all hover:text-ink hover:border-ink"
            style={{ border: "1px solid rgba(26,26,46,0.12)" }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSteps />
        ) : result ? (
          <EstimateResultDisplay result={result} onReset={handleReset} />
        ) : (
          <div className="p-9 max-md:p-6">
            {/* Photo Upload */}
            <PhotoUploader onPhotoReady={handlePhotoReady} />

            {/* Divider */}
            <div className="flex items-center gap-4 my-7">
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(26,26,46,0.1)" }}
              />
              <span className="text-xs text-ink-muted uppercase tracking-[1.5px] font-semibold">
                or describe manually
              </span>
              <div
                className="flex-1 h-px"
                style={{ background: "rgba(26,26,46,0.1)" }}
              />
            </div>

            {/* Manual Form */}
            <EstimatorForm
              category={category}
              formData={formData}
              onChange={handleFormChange}
            />

            {/* Error */}
            {error && (
              <div className="mt-4 p-4 rounded-[var(--radius-sm)] bg-coral-light text-coral text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleEstimate}
              disabled={!photo && Object.values(formData).every((v) => !v || v === "Select...")}
              className="w-full py-4 mt-6 rounded-full text-base font-semibold cursor-pointer flex items-center justify-center gap-2.5 border-none transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{ background: "var(--ink)", color: "var(--cream)" }}
            >
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0zm1 15H9v-2h2v2zm0-4H9V5h2v6z" />
              </svg>
              Get My Fair Price Estimate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
