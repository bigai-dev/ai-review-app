import { Platform, ReviewTone, ReviewLength, GeneratedDraft } from "../types";

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
  const response = await fetch('/api/generate-reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error("Review generation temporarily unavailable. Please try again.");
  }

  const data = await response.json();
  const draftsText: string[] = data.drafts;

  if (!draftsText || draftsText.length === 0) {
    throw new Error("No review drafts were generated. Please try again.");
  }

  return draftsText.map((text, idx) => ({
    id: `gen-${Date.now()}-${idx}`,
    platform: params.platform,
    text,
    tone: params.tone,
    length: params.length
  }));
};
