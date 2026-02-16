export interface FormFieldBase {
  id: string;
  label: string;
  type: "select" | "text" | "textarea";
  placeholder?: string;
  options?: string[];
}

export interface FormFieldRow {
  row: FormFieldBase[];
}

export type FormField = FormFieldBase | FormFieldRow;

export interface CategoryConfig {
  slug: string;
  name: string;
  icon: string;
  colorBg: string;
  subtitle: string;
  description: string;
  fields: FormField[];
  placesSearchTerms: string[];
  prompt: string;
}

export interface EstimateResult {
  serviceName: string;
  description: string;
  priceLow: number;
  priceHigh: number;
  priceAvg: number;
  timeEstimate: string;
  tips: { type: "green" | "yellow" | "red"; text: string }[];
  questionsToAsk: string[];
  confidence: "low" | "medium" | "high";
}

export interface Provider {
  id: string;
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
  phone?: string;
  photoRef?: string;
  types: string[];
  isOpen?: boolean;
  latitude: number;
  longitude: number;
  distance?: number;
  priceLevel?: number;
}
