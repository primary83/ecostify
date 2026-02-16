"use client";

import type { CategoryConfig, FormFieldBase, FormField } from "../lib/types";

interface EstimatorFormProps {
  category: CategoryConfig;
  formData: Record<string, string>;
  onChange: (id: string, value: string) => void;
}

function renderField(
  field: FormFieldBase,
  formData: Record<string, string>,
  onChange: (id: string, value: string) => void
) {
  return (
    <div key={field.id} className="flex flex-col">
      <label
        htmlFor={field.id}
        className="text-[13px] font-semibold text-ink-light mb-1.5"
      >
        {field.label}
      </label>
      {field.type === "select" ? (
        <select
          id={field.id}
          value={formData[field.id] || ""}
          onChange={(e) => onChange(field.id, e.target.value)}
          className="w-full py-3 px-4 rounded-[var(--radius-sm)] text-[15px] text-ink bg-white cursor-pointer outline-none transition-colors"
          style={{ border: "1.5px solid rgba(26,26,46,0.12)" }}
        >
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : field.type === "textarea" ? (
        <textarea
          id={field.id}
          value={formData[field.id] || ""}
          onChange={(e) => onChange(field.id, e.target.value)}
          placeholder={field.placeholder}
          rows={3}
          className="w-full py-3 px-4 rounded-[var(--radius-sm)] text-[15px] text-ink bg-white outline-none resize-y transition-colors"
          style={{ border: "1.5px solid rgba(26,26,46,0.12)", minHeight: 80 }}
        />
      ) : (
        <input
          type={field.type}
          id={field.id}
          value={formData[field.id] || ""}
          onChange={(e) => onChange(field.id, e.target.value)}
          placeholder={field.placeholder}
          className="w-full py-3 px-4 rounded-[var(--radius-sm)] text-[15px] text-ink bg-white outline-none transition-colors"
          style={{ border: "1.5px solid rgba(26,26,46,0.12)" }}
        />
      )}
    </div>
  );
}

export default function EstimatorForm({
  category,
  formData,
  onChange,
}: EstimatorFormProps) {
  return (
    <div className="flex flex-col gap-4">
      {category.fields.map((field: FormField, idx: number) => {
        if ("row" in field) {
          return (
            <div key={idx} className="flex gap-3 max-md:flex-col">
              {field.row.map((f) => (
                <div key={f.id} className="flex-1">
                  {renderField(f, formData, onChange)}
                </div>
              ))}
            </div>
          );
        }
        return renderField(field, formData, onChange);
      })}
    </div>
  );
}
