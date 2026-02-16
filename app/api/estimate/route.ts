import { NextRequest, NextResponse } from "next/server";
import { getCategoryBySlug } from "@/app/lib/categories";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
];

async function callGemini(
  model: string,
  prompt: string,
  image?: { base64: string; mimeType: string },
  formDataText?: string
): Promise<string> {
  const parts: Record<string, unknown>[] = [];

  if (image) {
    parts.push({
      inlineData: { mimeType: image.mimeType, data: image.base64 },
    });
    parts.push({
      text: `${prompt}\n\nAdditional details from the user: ${formDataText || "None provided"}. Please analyze the photo and provide a cost estimate.`,
    });
  } else {
    parts.push({
      text: `${prompt}\n\nThe user needs a cost estimate for the following: ${formDataText || "No details provided"}. Please provide a fair price estimate.`,
    });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    }
  );

  if (response.status === 429) {
    throw new Error("RATE_LIMITED");
  }

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini ${model} error: ${response.status} - ${err}`);
  }

  const data = await response.json();

  // Parse ALL response parts (thinking models return multiple)
  let text = "";
  if (data.candidates?.[0]?.content?.parts) {
    for (const part of data.candidates[0].content.parts) {
      if (part.text) {
        text += part.text;
      }
    }
  }

  return text;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, image, mimeType, formData } = body;

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const categoryConfig = getCategoryBySlug(category);
    if (!categoryConfig) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    const prompt = categoryConfig.prompt;
    const formDataText = formData ? JSON.stringify(formData) : undefined;
    const imageData = image ? { base64: image, mimeType: mimeType || "image/jpeg" } : undefined;

    let lastError: Error | null = null;

    for (const model of MODELS) {
      try {
        const responseText = await callGemini(
          model,
          prompt,
          imageData,
          formDataText
        );

        // Extract JSON from response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }

        const result = JSON.parse(jsonMatch[0]);

        // Validate required fields
        if (!result.serviceName || result.priceLow === undefined) {
          throw new Error("Invalid response structure");
        }

        return NextResponse.json({ result });
      } catch (err) {
        lastError = err as Error;

        if ((err as Error).message === "RATE_LIMITED") {
          // Wait 2 seconds and retry with next model
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }

        // For non-rate-limit errors, try next model
        console.error(`Model ${model} failed:`, (err as Error).message);
        continue;
      }
    }

    return NextResponse.json(
      {
        error: "All models failed",
        details: lastError?.message,
      },
      { status: 500 }
    );
  } catch (err) {
    console.error("Estimate API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
