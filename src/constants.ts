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
  { id: 't1', name: 'Annika', branchId: 'b1' },
  { id: 't2', name: 'Callie', branchId: 'b1' },
  { id: 't3', name: 'Florence', branchId: 'b1' },
  { id: 't4', name: 'Tracy', branchId: 'b1' },
  { id: 't5', name: 'Victoria', branchId: 'b2' },
  { id: 't6', name: 'Callie', branchId: 'b2' },
  { id: 't7', name: 'Jolin', branchId: 'b2' }
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

