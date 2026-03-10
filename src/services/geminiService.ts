import { GoogleGenAI, Type } from "@google/genai";
import { Platform, ReviewTone, ReviewLength, GeneratedDraft } from "../types";
import { PROMPTS, MOCK_MERCHANT } from "../constants";

// Helper to simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface GenerateParams {
  platform: Platform;
  tone: ReviewTone;
  length: ReviewLength;
  services: string[];
  highlights: string[];
  staffName?: string;
  therapistName?: string;
  rating: number;
  language?: string;
}

export const generateReviewDrafts = async (params: GenerateParams): Promise<GeneratedDraft[]> => {
  try {
    const response = await fetch('/api/generate-reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      console.warn("Backend API unavailable or error. Falling back to mock.");
      await delay(1000); // Simulate network
      return mockGenerate(params);
    }

    const data = await response.json();
    const draftsText: string[] = data.drafts;

    if (!draftsText || draftsText.length === 0) throw new Error("Empty response");

    return draftsText.map((text, idx) => ({
      id: `gen-${Date.now()}-${idx}`,
      platform: params.platform,
      text: text,
      tone: params.tone,
      length: params.length
    }));

  } catch (error) {
    console.error("API Proxy Error:", error);
    return mockGenerate(params);
  }
};

const mockGenerate = (params: GenerateParams): GeneratedDraft[] => {
  const services = params.services.join(" and ");
  const highlights = params.highlights.length > 0 ? params.highlights.join(", ") : "great service";
  const staff = params.staffName || "the team";

  const baseTemplates = [
    `Came for ${services} and loved it. ${highlights}. ${staff} was amazing!`,
    `Reviewing Anniks Beauty: The ${services} was exactly what I needed. Specifically loved the ${highlights.toLowerCase()}. Thanks ${staff}!`,
    `Highly recommend! ${highlights}. If you need ${services}, ask for ${staff}. 5 stars.`
  ];

  const suffix = params.platform === Platform.XHS ? " ✨🌿 #KL养生 #无痛变美 #体态矫正 #小颜术 #身心疗愈" : "";

  return baseTemplates.map((t, i) => ({
    id: `mock-${i}`,
    platform: params.platform,
    text: t + suffix,
    tone: params.tone,
    length: params.length
  }));
};