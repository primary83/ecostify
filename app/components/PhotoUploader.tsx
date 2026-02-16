"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, X } from "lucide-react";

interface PhotoUploaderProps {
  onPhotoReady: (data: { base64: string; mimeType: string } | null) => void;
}

function resizeImage(
  file: File,
  maxSize: number
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
        const base64 = dataUrl.split(",")[1];
        resolve({ base64, mimeType: "image/jpeg" });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function PhotoUploader({ onPhotoReady }: PhotoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file || !file.type.startsWith("image/")) return;

      // Show preview immediately
      const url = URL.createObjectURL(file);
      setPreview(url);

      // Resize and send base64
      const resized = await resizeImage(file, 1024);
      onPhotoReady(resized);
    },
    [onPhotoReady]
  );

  const removePhoto = () => {
    setPreview(null);
    onPhotoReady(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      {!preview ? (
        <div
          className={`border-2 border-dashed rounded-[var(--radius)] p-12 text-center cursor-pointer transition-all duration-300 ${
            dragOver
              ? "border-sage bg-sage-light scale-[1.01]"
              : "border-[rgba(26,26,46,0.15)] bg-[rgba(26,26,46,0.015)] hover:border-sage hover:bg-sage-light"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleFile(e.target.files[0]);
            }}
          />
          <div className="w-16 h-16 rounded-full bg-sage-light flex items-center justify-center mx-auto mb-4">
            <Camera className="w-7 h-7 text-sage-dark" />
          </div>
          <h3
            className="text-xl mb-2"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Snap a Photo for AI Estimate
          </h3>
          <p className="text-sm text-ink-muted">
            Upload a photo and our AI will identify the issue and estimate the
            cost instantly.
          </p>
          <div className="flex items-center gap-3 justify-center mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              className="text-white border-none px-7 py-3 rounded-full text-[15px] font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-px"
              style={{ background: "var(--sage)" }}
            >
              Upload Photo
            </button>
            <span className="text-xs text-ink-muted uppercase tracking-wider">
              or drag & drop
            </span>
          </div>
        </div>
      ) : (
        <div
          className="relative rounded-[var(--radius)] overflow-hidden flex items-center justify-center bg-ink"
          style={{ maxHeight: 320, animation: "fadeInUp 0.4s ease" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className="w-full object-contain"
            style={{ maxHeight: 320 }}
          />
          <button
            onClick={removePhoto}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer text-white transition-colors"
            style={{ background: "rgba(0,0,0,0.6)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
