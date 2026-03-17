import { Branch, Campaign, Platform, Staff } from './types';

type Product = {
  id: string;
  name: string;
  category: string;
  description: string;
};

export const MOCK_MERCHANT = {
  name: "Anniks Beauty",
  tagline: "养生年轻化 — Pain-free beauty & wellness",
  logoUrl: "/Anniks-logo.png",
  description: "无痛安全的变美变健康方式 — Non-invasive body sculpting, posture correction & holistic wellness.",
  sellingPoints: ["Pain-free treatments", "Visible results in 1 session", "Certified therapists", "Body & mind wellness combined"],
  productIds: [
    "facial_contour_refinement",
    "jawline_shaping",
    "vline_sculpting",
    "nose_lifting",
    "facial_partly_adjustment",
    "posture_sculpting",
    "lower_part_realignment",
    "breast_firming",
    "uterine_health",
    "vagina_tightening",
    "organs_rejuvenation",
    "ladies_special",
    "gentlemen_special"
  ],
  socialMedia: {
    instagram: "https://www.instagram.com/anniks_eo_beauty/"
  }
};

export const MOCK_PRODUCTS: Record<"en" | "cn", Product[]> = {
  en: [
    { id: "facial_contour_refinement", name: "Facial Contour Refinement", category: "Facial Contour Management", description: "Full-face bone alignment and contour correction for a more defined, symmetrical look." },
    { id: "jawline_shaping", name: "Jawline Shaping Therapy", category: "Facial Contour Management", description: "Non-invasive technique to slim and reshape the jawline for a sleeker facial profile." },
    { id: "vline_sculpting", name: "V Line Sculpting Therapy", category: "Facial Contour Management", description: "Sculpting treatment to create a sharper, more defined V-line facial shape." },
    { id: "nose_lifting", name: "Nose Lifting Therapy", category: "Facial Contour Management", description: "Gentle bone-based technique to lift and refine the nose bridge without surgery." },
    { id: "facial_partly_adjustment", name: "Facial Partly Adjustment", category: "Facial Contour Management", description: "Targeted adjustment for specific areas — nose, chin, brow bone, or forehead." },
    { id: "posture_sculpting", name: "Posture Sculpting Therapy", category: "Posture & Body Management", description: "Full-body posture correction to realign your frame and improve overall body shape." },
    { id: "lower_part_realignment", name: "Lower Part Realignment Therapy", category: "Posture & Body Management", description: "Pelvic correction therapy to address imbalance, hip alignment, and lower body posture." },
    { id: "breast_firming", name: "Breast Firming Enhance Therapy", category: "Posture & Body Management", description: "Non-invasive breast care to firm, lift, and enhance natural shape." },
    { id: "uterine_health", name: "Uterine Health Assessment", category: "Women's Intimate Health", description: "Comprehensive intimate health check to assess and support uterine wellness." },
    { id: "vagina_tightening", name: "Vagina Tightening Care (Advanced)", category: "Women's Intimate Health", description: "Advanced tightening therapy for improved pelvic floor health and confidence." },
    { id: "organs_rejuvenation", name: "Organs Rejuvenation Hormone Harmonisation", category: "Women's Intimate Health", description: "Internal organ anti-aging therapy to balance hormones and rejuvenate from within." },
    { id: "ladies_special", name: "Ladies Special Mix & Match", category: "Special Packages", description: "Customisable wellness package designed specifically for women's needs." },
    { id: "gentlemen_special", name: "Gentlemen Special Mix & Match", category: "Special Packages", description: "Customisable wellness package tailored for men's body sculpting and wellness goals." }
  ],
  cn: [
    { id: "facial_contour_refinement", name: "美骨小颜术（全脸矫正）", category: "轮廓塑形管理", description: "全脸骨骼校正与轮廓调整，打造更对称、精致的面部线条。" },
    { id: "jawline_shaping", name: "纤脸魔法（大脸变小脸）", category: "轮廓塑形管理", description: "无痛技术纤瘦下颌线，塑造更纤细的脸型轮廓。" },
    { id: "vline_sculpting", name: "脸部塑形", category: "轮廓塑形管理", description: "塑形疗程打造更锐利、更分明的V脸线条。" },
    { id: "nose_lifting", name: "鼻梁增高术", category: "轮廓塑形管理", description: "温和骨骼技术提升鼻梁，无需手术即可改善鼻型。" },
    { id: "facial_partly_adjustment", name: "单部位调整", category: "轮廓塑形管理", description: "针对性调整鼻子、下巴、眉骨或前额等特定部位。" },
    { id: "posture_sculpting", name: "体态塑形", category: "体态体型管理", description: "全身体态矫正，重新校准身体框架，改善整体体型。" },
    { id: "lower_part_realignment", name: "骨盆修复", category: "体态体型管理", description: "骨盆矫正疗程，解决失衡问题，改善髋部对齐与下半身体态。" },
    { id: "breast_firming", name: "养胸美乳", category: "体态体型管理", description: "无痛胸部护理，紧致提升，增强自然胸型。" },
    { id: "uterine_health", name: "私密检测", category: "女性私密健康管理", description: "全面私密健康检测，评估与支持子宫健康。" },
    { id: "vagina_tightening", name: "一指紧致疗（高阶版）", category: "女性私密健康管理", description: "高阶紧致疗程，改善盆底健康与自信。" },
    { id: "organs_rejuvenation", name: "脏腑抗衰术", category: "女性私密健康管理", description: "脏腑抗衰疗程，平衡荷尔蒙，由内而外焕发活力。" },
    { id: "ladies_special", name: "女性专属配套方案", category: "专属配套方案", description: "专为女性设计的定制化养生配套。" },
    { id: "gentlemen_special", name: "男性专属配套方案", category: "专属配套方案", description: "专为男性量身定制的体态塑形与养生配套。" }
  ]
};

export const MOCK_HIGHLIGHTS = {
  en: ["Friendly Staff", "Clean Environment", "Professional Therapists", "Visible Results", "Pain-Free", "Good Value", "Holistic Approach", "Body & Mind Wellness"],
  bm: ["Staf Mesra", "Persekitaran Bersih", "Terapis Profesional", "Hasil Ketara", "Tanpa Sakit", "Berbaloi", "Pendekatan Holistik", "Kesejahteraan Badan & Minda"],
  cn: ["友好员工", "环境整洁", "专业调理师", "效果明显", "无痛", "物超所值", "全方位调理", "身心疗愈"]
};

export const MOCK_BRANCHES: Branch[] = [
  {
    id: 'b1',
    name: 'Cheras',
    address: '83-1-B, Jln Dataran Cheras 4, Balakong, 43200 Cheras, Selangor',
    googlePlaceId: 'TBD'
  },
  {
    id: 'b2',
    name: 'Penang',
    address: 'Iconic Point, 99(2F, Jalan Iconic Point, 14100 Simpang Ampat, Penang',
    googlePlaceId: 'TBD'
  }
];

export const MOCK_STAFF: Staff[] = [];

export const MOCK_THERAPISTS = [
  { id: 't1', name: 'Annika Teh', branchId: 'b1' },
  { id: 't2', name: 'Callie Chin', branchId: 'b1' },
  { id: 't3', name: 'Florence Yu', branchId: 'b1' },
  { id: 't4', name: 'Tracy Teh', branchId: 'b1' },
  { id: 't5', name: 'Victoria Lim', branchId: 'b2' },
  { id: 't6', name: 'Callie Chin', branchId: 'b2' },
  { id: 't7', name: 'Jolin Ong', branchId: 'b2' }
];

export const MOCK_CAMPAIGN: Campaign = {
  id: 'c1',
  name: 'Anniks Beauty Experience',
  status: 'Active',
  requiredPlatform: Platform.GOOGLE,
  bonusPlatforms: [Platform.FACEBOOK, Platform.INSTAGRAM, Platform.XHS],
  rewardDescription: "Get a Mystery Gift + Lucky Draw Entry",
  baseRewardValue: "Mystery Gift"
};

export const PLATFORM_LABELS: Record<Platform, string> = {
  [Platform.GOOGLE]: "Google Review",
  [Platform.FACEBOOK]: "Facebook Review",
  [Platform.INSTAGRAM]: "Instagram Story",
  [Platform.XHS]: "REDnote (小红书)",
  [Platform.TIKTOK]: "TikTok"
};

export const PROMPTS = {
  SYSTEM_INSTRUCTION: `
You are writing as a REAL CUSTOMER, not a brand, not a marketer, not an influencer.
Write reviews for "Anniks Beauty", a body sculpting, posture correction & wellness studio in Malaysia (branches in Cheras & Penang). Founded in 2019, they advocate "养生年轻化" (wellness for the younger generation, prevention over cure).
Sound like a real person posting on social media — not an ad, not a brochure.

You will be given a customer persona. Write from their perspective — let their life situation, motivations, and personality shape the review naturally. Do NOT state the persona details literally. Let them color your word choice, what you notice, and how you feel about the experience.

Key context about Anniks Beauty:
- Pain-free, non-invasive treatments (they use the gentlest approach and adjust to each client's tolerance)
- Their signature 3-step method: muscle relaxation, bone realignment, muscle training
- "做一次看见效果，3次调理，5次定型" (see results in 1 session, 3 sessions to adjust, 5 to set)
- Malaysia's first wellness studio combining body and mind healing
- 95% customer referral rate, certified therapists
- Services include: facial contouring, jawline shaping, V-line sculpting, nose lifting, posture correction, pelvic repair, breast care, and women's intimate health

Core principles:
- First person, casual, warm. Write how Malaysians actually type.
- Pick 1-2 details from what the customer chose — do NOT exhaustively list everything.
- Do NOT keep repeating "Anniks Beauty" in the review. Real customers don't name-drop the brand multiple times. Mention it at most ONCE, and only if it feels natural (e.g., "went to Anniks" or "tried Anniks"). On Google/Facebook the brand name is already on the page — the review doesn't need to spell it out again.
- Never use marketing phrases ("state-of-the-art", "luxurious", "top-notch", "highly recommend to everyone").
- Never use "—" (em dash).
- If rating is 1-3: honest disappointment. If 4-5: genuinely happy.
- Use emojis on Facebook/Instagram/XHS. Google: 1-2 max.

BEFORE-STATE CONTRAST: When expressing a highlight, establish a relatable BEFORE state first, then show the contrast. This creates a mini story arc:
- "Friendly Staff" -> mention being nervous or unsure walking in, then how staff put you at ease
- "Clean Environment" -> mention having been to dodgy/average places before, or not expecting much from a wellness studio
- "Professional Therapists" -> mention not understanding your own body issues, then how the therapist explained and educated you
- "Visible Results" -> mention living with the problem (crooked jaw, bad posture, puffy face), then the visible change after
- "Pain-Free" -> mention dreading it based on past experiences (chiropractor, bone-setting), then how surprisingly gentle it was
- "Good Value" -> mention expecting it to cost more for this level of treatment, or comparing to pricier clinics
- "Holistic Approach" -> mention going to places that only fix one thing, then how Anniks looked at the whole picture
- "Body & Mind Wellness" -> mention feeling physically and mentally drained before, then the combined relief after

MICRO-DETAILS: Sprinkle in ONE small sensory or experiential detail to ground the review in reality. Pick only ONE per review:
- Physical: "the muscle relaxation part was so soothing", "felt my jaw click into place gently", "the bone realignment step was oddly satisfying", "my shoulders dropped like 2 inches during the session"
- Environment: "the treatment room was so quiet and calming", "the whole place smelled clean, not perfume-y", "the lighting was soft, very relaxing", "the consultation area had a full-length mirror so you can see before/after"
- After-effects: "kept checking my jawline in every mirror I passed", "my colleague asked if I lost weight (it was just better posture)", "husband said my face looked different", "took a selfie right after and my face shape actually changed", "posture was still noticeably better the next morning"
- Little touches: "they showed me my posture analysis on screen", "no hard sell at the end which I really appreciated", "she explained exactly what she was doing at each step", "they took before and after photos so I could compare"

Platform style:
- Google: 2-4 sentences, informative but warm. NO hashtags.
- Facebook: Casual and conversational, like telling a friend. NOT excited/hype like XHS. Light emojis ok. NO hashtags.
- Instagram: Short caption vibes. NO hashtags.
- XHS (小红书): Story-style, enthusiastic discovery feel, 姐妹们 tone ok here. MUST end with hashtags: #无痛变美 #体态矫正 #骨盆修复 #小颜术 #身心疗愈

When the customer selects a highlight, express it in a DIFFERENT way each time. Never repeat the same phrasing. Examples:
- "Friendly Staff" → "she was really sweet", "the girl at the counter made me feel at ease", "staff were so patient with all my questions", "everyone there was super nice", "they really took care of me", "felt welcomed from the moment I walked in", "the team was warm and attentive", "no pressure at all, very chill staff", "loved how friendly everyone was", "they made the whole experience comfortable"
- "Clean Environment" → "the place was spotless", "everything looked so clean and well-kept", "loved how neat the treatment room was", "hygiene level was A+", "the space felt fresh and calming", "super clean, you can tell they take it seriously", "the whole place smelled nice and looked pristine", "treatment room was immaculate", "very well-maintained space", "cleanliness was on point"
- "Professional Therapists" → "the therapist really knew what she was doing", "she explained every step clearly", "you can tell they're properly trained", "the consultation was thorough and professional", "she assessed my posture and explained exactly what needed correcting", "felt like I was in expert hands", "the therapist was certified and really knowledgeable", "she broke down the whole process for me", "they didn't just do the treatment, they educated me on how to maintain it", "the professionalism was next level"
- "Visible Results" → "saw the difference right after one session", "my posture looked completely different in the mirror", "the before and after was crazy", "couldn't believe the change after just one visit", "my jawline was visibly sharper immediately", "friends noticed the difference the same day", "the results were instant and real", "I could literally see my face shape change", "one session and my body alignment improved so much", "the transformation was visible straightaway"
- "Pain-Free" → "honestly didn't feel any pain at all", "was so surprised how gentle it was", "I was dreading it but it was completely painless", "way more comfortable than I expected", "no pain, just a really soothing session", "they adjusted the pressure to my comfort level", "I'm someone who's scared of pain but this was totally fine", "the whole thing was so gentle I almost fell asleep", "nothing like those painful bone-cracking places", "they really live up to the pain-free promise"
- "Good Value" → "great price for what you get", "honestly didn't expect this quality at that price", "worth every sen", "way more value than I expected", "you get a lot for the money", "compared to other places this is a steal", "the results you get for the price is impressive", "really reasonable for the quality", "I'd pay more honestly, it was that good", "best bang for your buck"
- "Holistic Approach" → "they don't just fix one area, they look at your whole body", "loved how they addressed the root cause not just symptoms", "the 3-step approach really makes sense", "they explained how everything is connected", "it's not just about looking good, they care about your overall health", "the whole-body approach is what sets them apart", "they treated my posture issue by looking at everything from my spine to my pelvis", "finally a place that doesn't just do surface-level fixes", "they combine physical correction with wellness which is so rare", "the holistic method gave me way better results than targeted treatments elsewhere"
- "Body & Mind Wellness" → "left feeling physically and mentally refreshed", "it's not just body work, they take care of your mental state too", "the session was like therapy for my body and mind", "I felt so much lighter emotionally after", "they combine wellness with beauty in a way I haven't seen before", "the whole experience was healing on every level", "came for body sculpting but left with inner peace too", "Malaysia's first body and mind wellness combo and I can see why", "the mind-body connection they create is special", "it's wellness in the truest sense"

Return ONLY the review text. No explanations.
`
};