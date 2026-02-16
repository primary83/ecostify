import type { CategoryConfig } from "./types";
import { autoPrompt } from "./prompts/auto";
import { homePrompt } from "./prompts/home";
import { beautyPrompt } from "./prompts/beauty";
import { weddingPrompt } from "./prompts/wedding";

export const CATEGORIES: CategoryConfig[] = [
  {
    slug: "auto",
    name: "Automotive",
    icon: "\u{1F697}",
    colorBg: "var(--sky-light)",
    subtitle: "Repairs, body work, detailing, tinting & more",
    description:
      "Get fair price estimates for auto repairs, body work, detailing, ceramic coating, window tinting, oil changes, brake service, and more. Know what your car service should cost before you visit the shop.",
    fields: [
      {
        row: [
          {
            id: "vehicleType",
            label: "Vehicle Type",
            type: "select",
            options: [
              "Select...",
              "Sedan",
              "SUV / Crossover",
              "Truck",
              "Coupe",
              "Van / Minivan",
              "Electric Vehicle",
              "Luxury Vehicle",
            ],
          },
          {
            id: "vehicleYear",
            label: "Year (approx)",
            type: "select",
            options: [
              "Select...",
              "2020-2026",
              "2015-2019",
              "2010-2014",
              "2005-2009",
              "Older than 2005",
            ],
          },
        ],
      },
      {
        id: "serviceType",
        label: "What service do you need?",
        type: "select",
        options: [
          "Select...",
          "Engine / Mechanical Repair",
          "Body Work / Dent Repair",
          "Brake Service",
          "Tire Replacement",
          "Oil Change / Maintenance",
          "Detailing / Paint Correction",
          "Window Tinting",
          "Paint Protection Film (PPF)",
          "Ceramic Coating",
          "Transmission Repair",
          "Electrical / Battery Issue",
          "A/C Repair",
          "Car Wrapping / Vinyl Wrap",
          "Windshield Repair / Replacement",
          "Collision Repair",
          "Custom Paint",
          "Other",
        ],
      },
      {
        id: "description",
        label: "Describe the issue (optional)",
        type: "textarea",
        placeholder:
          'e.g. "Weird grinding noise when I brake" or "Dent on passenger door"',
      },
      {
        row: [
          {
            id: "zipcode",
            label: "ZIP Code",
            type: "text",
            placeholder: "12345",
          },
          {
            id: "urgency",
            label: "Urgency",
            type: "select",
            options: ["Not urgent", "Within a week", "ASAP"],
          },
        ],
      },
    ],
    placesSearchTerms: [
      "auto repair shop",
      "body shop",
      "car detailing",
      "mechanic",
    ],
    prompt: autoPrompt,
  },
  {
    slug: "home",
    name: "Home Services",
    icon: "\u{1F3E0}",
    colorBg: "var(--gold-light)",
    subtitle: "Plumbing, electrical, roofing, painting, pools & more",
    description:
      "Get fair price estimates for plumbing, electrical, roofing, HVAC, painting, pool services, hurricane shutters, lanai repair, and more. Protect yourself from overcharging on home repairs and maintenance.",
    fields: [
      {
        row: [
          {
            id: "homeType",
            label: "Home Type",
            type: "select",
            options: [
              "Select...",
              "Single Family",
              "Apartment / Condo",
              "Townhouse",
              "Mobile Home",
            ],
          },
          {
            id: "homeSize",
            label: "Approx Size",
            type: "select",
            options: [
              "Select...",
              "Under 1,000 sq ft",
              "1,000 - 2,000 sq ft",
              "2,000 - 3,000 sq ft",
              "Over 3,000 sq ft",
            ],
          },
        ],
      },
      {
        id: "serviceType",
        label: "What do you need help with?",
        type: "select",
        options: [
          "Select...",
          "Plumbing",
          "Electrical",
          "Roofing",
          "Painting (Interior)",
          "Painting (Exterior)",
          "HVAC / Air Conditioning",
          "Flooring",
          "Drywall Repair",
          "Window Replacement",
          "Fence / Deck",
          "Appliance Repair",
          "Pest Control",
          "General Handyman",
          "Landscaping",
          "Pressure Washing",
          "Pool Cleaning / Maintenance",
          "Pool Repair (Pump, Filter, Heater)",
          "Pool Resurfacing / Replastering",
          "Pool Leak Detection & Repair",
          "Pool Equipment Installation",
          "Hot Tub / Spa Service",
          "Pool Remodeling / Renovation",
          "Garage Door Repair",
          "Gutter Cleaning / Repair",
          "Solar Panel Installation",
          "Hurricane Shutters",
          "Screen / Lanai Repair",
          "Other",
        ],
      },
      {
        id: "description",
        label: "Describe the problem (optional)",
        type: "textarea",
        placeholder:
          'e.g. "Faucet is dripping constantly" or "Water stain on ceiling"',
      },
      {
        row: [
          {
            id: "zipcode",
            label: "ZIP Code",
            type: "text",
            placeholder: "12345",
          },
          {
            id: "urgency",
            label: "Urgency",
            type: "select",
            options: ["Not urgent", "Within a week", "Emergency / ASAP"],
          },
        ],
      },
    ],
    placesSearchTerms: [
      "home repair",
      "plumber",
      "electrician",
      "handyman",
      "pool service",
    ],
    prompt: homePrompt,
  },
  {
    slug: "beauty",
    name: "Beauty & Personal",
    icon: "\u{1F485}",
    colorBg: "var(--coral-light)",
    subtitle: "Hair, nails, skincare, lashes & more",
    description:
      "Get fair price estimates for haircuts, coloring, nail services, facials, lash extensions, microblading, tattoos, and more. Know what beauty services should cost so you can budget with confidence.",
    fields: [
      {
        id: "serviceType",
        label: "What service are you looking for?",
        type: "select",
        options: [
          "Select...",
          "Haircut",
          "Hair Coloring / Highlights",
          "Balayage / Ombr\u00e9",
          "Hair Extensions",
          "Keratin Treatment",
          "Manicure / Pedicure",
          "Gel / Acrylic Nails",
          "Nail Art",
          "Facial / Skincare Treatment",
          "Chemical Peel",
          "Microneedling",
          "Botox / Fillers",
          "Lash Extensions",
          "Lash Lift & Tint",
          "Eyebrow Microblading",
          "Waxing",
          "Tattoo",
          "Tattoo Removal",
          "Teeth Whitening",
          "Other",
        ],
      },
      {
        row: [
          {
            id: "hairType",
            label: "Hair Length (if relevant)",
            type: "select",
            options: ["N/A", "Short", "Medium", "Long", "Very Long / Thick"],
          },
          {
            id: "experience",
            label: "Stylist Level",
            type: "select",
            options: [
              "Any level",
              "Junior / New stylist",
              "Mid-level",
              "Senior / Master stylist",
              "Celebrity / High-end",
            ],
          },
        ],
      },
      {
        id: "description",
        label: "Any details? (optional)",
        type: "textarea",
        placeholder:
          'e.g. "Going from brunette to blonde" or "Full set of lash extensions, natural look"',
      },
      {
        row: [
          {
            id: "zipcode",
            label: "ZIP Code",
            type: "text",
            placeholder: "12345",
          },
          {
            id: "setting",
            label: "Setting",
            type: "select",
            options: [
              "Salon / Studio",
              "Mobile / At-home",
              "Med Spa",
              "High-end / Luxury",
            ],
          },
        ],
      },
    ],
    placesSearchTerms: [
      "hair salon",
      "nail salon",
      "beauty spa",
      "med spa",
    ],
    prompt: beautyPrompt,
  },
  {
    slug: "wedding",
    name: "Weddings & Events",
    icon: "\u{1F492}",
    colorBg: "var(--violet-light)",
    subtitle: "Catering, venues, photography, florals & more",
    description:
      "Get fair price estimates for wedding planning, catering, photography, venues, DJs, floral arrangements, and more. Plan your special day without getting overcharged.",
    fields: [
      {
        id: "serviceType",
        label: "What are you planning?",
        type: "select",
        options: [
          "Select...",
          "Full Wedding Planning",
          "Day-of Coordinator",
          "Catering / Food",
          "Wedding Cake",
          "Venue Rental",
          "Photography",
          "Videography",
          "DJ / Music",
          "Live Band",
          "Floral Arrangements",
          "Wedding Dress",
          "Bridesmaid Dresses",
          "Invitations / Stationery",
          "Hair & Makeup (Bridal)",
          "Transportation / Limo",
          "Photo Booth",
          "Decor / Rentals",
          "Officiant",
          "Other",
        ],
      },
      {
        row: [
          {
            id: "guestCount",
            label: "Guest Count",
            type: "select",
            options: [
              "Select...",
              "Under 50",
              "50-100",
              "100-150",
              "150-200",
              "200-300",
              "300+",
            ],
          },
          {
            id: "style",
            label: "Style / Vibe",
            type: "select",
            options: [
              "Budget-friendly",
              "Mid-range",
              "Upscale",
              "Luxury / High-end",
            ],
          },
        ],
      },
      {
        id: "description",
        label: "Any details? (optional)",
        type: "textarea",
        placeholder:
          'e.g. "Outdoor rustic wedding, 120 guests, looking for BBQ catering"',
      },
      {
        row: [
          {
            id: "zipcode",
            label: "ZIP / City",
            type: "text",
            placeholder: "12345",
          },
          {
            id: "season",
            label: "Season",
            type: "select",
            options: ["Spring", "Summer", "Fall", "Winter", "Not sure yet"],
          },
        ],
      },
    ],
    placesSearchTerms: [
      "wedding venue",
      "wedding planner",
      "catering service",
      "wedding photographer",
    ],
    prompt: weddingPrompt,
  },
];

export function getCategoryBySlug(slug: string): CategoryConfig | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export const VALID_CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);
