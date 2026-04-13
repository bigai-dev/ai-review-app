import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import confetti from 'canvas-confetti';
import { MobileLayout } from '../../components/layout/MobileLayout';
import { Button } from '../../components/ui/Button';
import { MOCK_BRANCHES, MOCK_STAFF, MOCK_THERAPISTS, MOCK_CAMPAIGN, MOCK_MERCHANT, MOCK_HIGHLIGHTS, MOCK_PRODUCTS, PLATFORM_LABELS } from '../../constants';
import { Platform, ReviewTone, ReviewLength, GeneratedDraft, VerificationProof, Submission } from '../../types';
import { generateReviewDrafts } from '../../services/geminiService';
import { useApp } from '../../context/AppContext';
import { Star, Check, Copy, Gift, Upload, MessageSquare, Facebook, Instagram, Image as ImageIcon, Camera, ExternalLink, RefreshCw, ChevronRight, Trash2, Sparkles, MapPin, User, Languages, X, Download, Ticket, ArrowRight } from 'lucide-react';

// --- Localization Dictionary ---
const TRANSLATIONS = {
  en: {
    welcome: "How was your visit?",
    subWelcome: "Help us improve & unlock your Mystery Gift!",
    branch: "Branch",
    servedBy: "Served By",
    notSure: "I'm not sure",
    enjoyed: "What did you enjoy?",
    pickOne: "Select all that apply",
    standOut: "What stood out?",
    rating: "Overall Rating",
    privateFeedback: "We'd love to hear how we can do better directly.",
    agree: "By continuing, you agree to our Terms & Privacy.",
    wherePost: "Choose Platform",
    moreRewards: "Share on more apps = More chances to win!",
    required: "Required",
    unlocks: "Unlocks",
    bonus: "Lucky Draw Chance",
    addFor: "Post here for",
    uploadPhotos: "Add Photos (Optional)",
    uploadTip: "Upload photos to generate specific reviews!",
    generating: "Preparing your Anniks experience...",
    draftsTitle: "Review Drafts",
    draftsSub: "AI-generated specifically for you",
    copy: "Copy",
    postNow: "Post Now",
    bestMatch: "Best Match",
    verifyTitle: "Verify & Claim",
    verifySub: "Attach screenshot of your posted content to redeem your mystery gift.",
    pasteLink: "Paste Link", // Changed from Post Review to avoid confusion
    postReviewAction: "Post Review", // New label for opening app
    screenshot: "Screenshot",
    rewardTitle: "You've won a Mystery Gift!",
    rewardSub: "Thank you for sharing the love.",
    baseReward: "Mystery Gift",
    luckyDraw: "Lucky Draw",
    ticket: "Ticket No.",
    done: "Done",
    next: "Continue",
    submit: "Submit Verification",
    reviewLang: "Review Language",
    selectLang: "Select Language",
    therapistsLabel: "Therapists",
    takePhoto: "Take Photo",
    chooseGallery: "Gallery",
    rewardInstructions: "Congratulations! Please proceed to the counter and redeem your mystery gift from our staff.",
    enterPhone: "Enter Phone for Lucky Draw",
    phonePlaceholder: "Phone Number",
    redeemYour: "REDEEM YOUR",
    craftingExperience: "Crafting your unique experience...",
    goodLuckEntered: "Good luck! You've been entered.",
    openingPlatform: "Opening",
    textCopiedProof: "Text copied. Paste & post your review. Remember to screenshot it as proof.",
    captionCopiedProof: "Caption copied. Paste & post your story. Remember to screenshot it as proof.",
    textCopiedShort: "Text copied. Paste & post your review.",
    xhsCopied: "Content copied. Share your experience!",
    draftsInstruction: "Tap Post Now — we'll copy the text for you. Just paste it when the app opens!",
    copied: "Copied!",
    photoTipManual: "To add photos, upload them directly in the review form.",
  },
  bm: {
    welcome: "Bagaimana kunjungan anda?",
    subWelcome: "Bantu kami & dapatkan Hadiah Misteri!",
    branch: "Cawangan",
    servedBy: "Dilayani Oleh",
    notSure: "Tidak Pasti",
    enjoyed: "Apa yang anda nikmati?",
    pickOne: "Pilih yang berkenaan",
    standOut: "Apa yang menarik?",
    rating: "Penilaian Keseluruhan",
    privateFeedback: "Kami ingin mendengar maklum balas anda secara terus.",
    agree: "Dengan meneruskan, anda bersetuju dengan Terma & Privasi.",
    wherePost: "Pilih Platform",
    moreRewards: "Lebih platform = Lebih peluang menang!",
    required: "Wajib",
    unlocks: "Membuka",
    bonus: "Peluang Cabutan Bertuah",
    addFor: "Pos di sini untuk",
    uploadPhotos: "Tambah Foto (Pilihan)",
    uploadTip: "Muat naik foto untuk ulasan yang lebih tepat!",
    generating: "Sedang menyediakan pengalaman Anniks anda...",
    draftsTitle: "Draf Ulasan",
    draftsSub: "Dijana AI khas untuk anda",
    copy: "Salin",
    postNow: "Pos Sekarang",
    bestMatch: "Pilihan Terbaik",
    verifyTitle: "Sahkan",
    verifySub: "Lampirkan tangkapan skrin kandungan yang anda siarkan untuk menebus hadiah anda.",
    pasteLink: "Tampal Pautan",
    postReviewAction: "Pos Ulasan",
    screenshot: "Tangkap Layar",

    rewardSub: "Terima kasih atas sokongan anda.",
    baseReward: "Hadiah Misteri",
    luckyDraw: "Cabutan Bertuah",
    ticket: "No. Tiket",
    done: "Selesai",
    next: "Teruskan",
    submit: "Hantar",
    reviewLang: "Bahasa Ulasan",
    selectLang: "Pilih Bahasa",
    therapistsLabel: "Terapi",
    takePhoto: "Ambil Foto",
    chooseGallery: "Galeri",
    rewardInstructions: "Tahniah! Sila ke kaunter dan tebus hadiah misteri anda daripada kakitangan kami.",
    enterPhone: "No. Tel untuk Cabutan Bertuah",
    phonePlaceholder: "Nombor Telefon",
    redeemYour: "TEBUS HADIAH ANDA",
    rewardTitle: "Anda telah memenangi Hadiah Misteri!",
    craftingExperience: "Sedang mencipta pengalaman unik anda...",
    goodLuckEntered: "Semoga berjaya! Anda telah didaftarkan.",
    openingPlatform: "Membuka",
    textCopiedProof: "Teks disalin. Tampal & siarkan ulasan anda. Jangan lupa tangkap skrin sebagai bukti.",
    captionCopiedProof: "Kapsyen disalin. Tampal & siarkan cerita anda. Jangan lupa tangkap skrin sebagai bukti.",
    textCopiedShort: "Teks disalin. Tampal & siarkan ulasan anda.",
    xhsCopied: "Kandungan disalin. Kongsi pengalaman anda!",
    draftsInstruction: "Tekan Pos Sekarang — kami akan salin teks untuk anda. Tampal sahaja bila aplikasi terbuka!",
    copied: "Disalin!",
    photoTipManual: "Untuk tambah foto, muat naik terus dalam borang ulasan.",
  },
  cn: {
    welcome: "您的体验如何？",
    subWelcome: "帮助我们改进并获得神秘礼物！",
    branch: "分行",
    servedBy: "服务人员",
    notSure: "不确定",
    enjoyed: "您享受了什么服务？",
    pickOne: "选择所有适用的",
    standOut: "什么让您印象深刻？",
    rating: "整体评分",
    privateFeedback: "我们要直接听取您的意见以做得更好。",
    agree: "继续即表示您同意我们的条款和隐私政策。",
    wherePost: "选择平台",
    moreRewards: "分享到更多平台 = 更多赢奖机会！",
    required: "必须",
    unlocks: "解锁",
    bonus: "幸运抽奖机会",
    addFor: "发布以获得",
    uploadPhotos: "添加照片（可选）",
    uploadTip: "上传照片以生成专属评论！",
    generating: "正在准备您的 Anniks 体验...",
    draftsTitle: "评论草稿",
    draftsSub: "为您专属生成的 AI 评论",
    copy: "复制",
    postNow: "立即发布",
    bestMatch: "最佳匹配",
    verifyTitle: "验证并领取",
    verifySub: "请附上您发布内容的截图以兑换您的礼物",
    pasteLink: "粘贴链接",
    postReviewAction: "去发布",
    screenshot: "截图",
    rewardTitle: "奖励已解锁！",
    rewardSub: "感谢您的分享。",
    baseReward: "神秘礼物",
    luckyDraw: "幸运抽奖",
    ticket: "票号",
    done: "完成",
    next: "继续",
    submit: "提交",
    reviewLang: "评论语言",
    selectLang: "选择语言",
    therapistsLabel: "治疗师",
    takePhoto: "拍照",
    chooseGallery: "相册",
    rewardInstructions: "恭喜！请前往柜台向工作人员领取您的神秘礼物。",
    enterPhone: "输入手机号参加抽奖",
    phonePlaceholder: "电话号码",
    redeemYour: "领取您的",
    craftingExperience: "正在为您打造专属体验...",
    goodLuckEntered: "祝好运！您已成功参与抽奖。",
    openingPlatform: "正在打开",
    textCopiedProof: "文字已复制。粘贴并发布您的评论，记得截图作为凭证。",
    captionCopiedProof: "文案已复制。粘贴并发布您的动态，记得截图作为凭证。",
    textCopiedShort: "文字已复制。粘贴并发布您的评论。",
    xhsCopied: "内容已复制，发布体验分享！",
    draftsInstruction: "点击「立即发布」— 我们会自动复制文字，打开应用后粘贴即可！",
    copied: "已复制！",
    photoTipManual: "如需添加照片，请在评论表单中直接上传。",
  }
};



const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3 }
};

const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 }
};



// --- Helper: Convert Base64 to File ---
const dataURLtoFile = (dataurl: string, filename: string) => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

// --- Reusable Platform Icon ---
const PlatformIcon = ({ p, size = 'md' }: { p: Platform; size?: 'sm' | 'md' }) => {
  const sizeClasses = size === 'sm' ? 'w-6 h-6' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';

  if (p === Platform.GOOGLE) return <img src="/assets/logo_google.png" className={`${sizeClasses} rounded-full object-cover shadow-sm bg-white p-0.5`} alt="Google" />;
  if (p === Platform.FACEBOOK) return <div className={`${sizeClasses} rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-sm`}><Facebook className={iconSize} /></div>;
  if (p === Platform.INSTAGRAM) return <div className={`${sizeClasses} rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white flex items-center justify-center shadow-sm`}><Instagram className={iconSize} /></div>;
  if (p === Platform.XHS) return <img src="/assets/logo_xhs.png" className={`${sizeClasses} rounded-full object-cover shadow-sm`} alt="XHS" />;
  if (p === Platform.TIKTOK) return <div className={`${sizeClasses} rounded-full bg-black text-white flex items-center justify-center font-bold text-xs shadow-sm`}>Tk</div>;
  return <div className={`${sizeClasses} rounded-full bg-gray-200`} />;
};

// --- Lightbox Component ---
const Lightbox = ({ src, onClose }: { src: string; onClose: () => void }) => {
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `anniks-photo-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setToast({ msg: "Image downloaded", type: 'success' });
    } catch (err) {
      window.open(src, '_blank');
    }
  };

  const handleCopy = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      setToast({ msg: "Image copied to clipboard!", type: 'success' });
    } catch (err) {
      console.error("Failed to copy image:", err);
      // Friendly error message for users
      setToast({
        msg: "Browser prevented copying. Please download instead.",
        type: 'error'
      });
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 flex gap-3 z-10">
        <button
          onClick={(e) => { e.stopPropagation(); handleCopy(); }}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
          title="Copy Image"
        >
          <Copy className="w-6 h-6" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); handleDownload(); }}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
          title="Download Image"
        >
          <Download className="w-6 h-6" />
        </button>
        <button
          onClick={onClose}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <motion.img
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        src={src}
        alt="Enlarged view"
        className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Internal Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`absolute bottom-20 px-4 py-2 rounded-full font-medium text-sm backdrop-blur-md shadow-lg ${toast.type === 'error' ? 'bg-red-500/90 text-white' : 'bg-white/90 text-gray-900'
              }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-white/60 text-sm mt-6 font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">Tap outside or X to close</p>
    </motion.div>
  );
};

// --- Helper: Get Platform URL ---
const GOOGLE_REVIEW_URLS: Record<string, string> = {
  'b1': 'https://g.page/r/CXwKz-qtcs_GEAE/review',  // Cheras (KL)
  'b2': 'https://g.page/r/CeVr6wsgf0G0EAE/review',  // Penang
};

const getPlatformUrl = (platform: Platform, branchId?: string) => {
  if (platform === Platform.GOOGLE) return GOOGLE_REVIEW_URLS[branchId || 'b1'] || GOOGLE_REVIEW_URLS['b1'];
  if (platform === Platform.FACEBOOK) return "https://www.facebook.com/AnniksBeauty/reviews";
  if (platform === Platform.INSTAGRAM) return "https://www.instagram.com/create/story";
  if (platform === Platform.XHS) return "https://www.xiaohongshu.com";
  return "https://tiktok.com";
};

// --- Redirect Modal ---
const RedirectModal = ({
  platform,
  isOpen,
  onClose,
  t,
  branchId
}: {
  platform: Platform | null;
  isOpen: boolean;
  onClose: () => void;
  t: typeof TRANSLATIONS['en'];
  branchId?: string;
}) => {
  if (!isOpen || !platform) return null;

  const platformNames: Record<Platform, string> = {
    [Platform.GOOGLE]: "Google Review",
    [Platform.FACEBOOK]: "Facebook Review",
    [Platform.INSTAGRAM]: "Instagram",
    [Platform.XHS]: "小红书",
    [Platform.TIKTOK]: "TikTok"
  };

  const content = {
    [Platform.GOOGLE]: {
      title: `${t.openingPlatform} ${platformNames[Platform.GOOGLE]}`,
      subtext: t.textCopiedProof,
      icon: <img src="/assets/logo_google.png" className="w-12 h-12" />
    },
    [Platform.FACEBOOK]: {
      title: `${t.openingPlatform} ${platformNames[Platform.FACEBOOK]}`,
      subtext: t.textCopiedProof,
      icon: <Facebook className="w-12 h-12 text-[#1877F2]" />
    },
    [Platform.INSTAGRAM]: {
      title: `${t.openingPlatform} ${platformNames[Platform.INSTAGRAM]}`,
      subtext: t.captionCopiedProof,
      icon: <Instagram className="w-12 h-12 text-pink-600" />
    },
    [Platform.XHS]: {
      title: `${t.openingPlatform} ${platformNames[Platform.XHS]}`,
      subtext: t.xhsCopied,
      icon: <img src="/assets/logo_xhs.png" className="w-12 h-12 rounded-full" />
    },
    [Platform.TIKTOK]: {
      title: `${t.openingPlatform} ${platformNames[Platform.TIKTOK]}`,
      subtext: t.textCopiedShort,
      icon: <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold">Tk</div>
    }
  }[platform];

  const handleProceed = () => {
    if (platform === Platform.XHS) {
      // XHS has no web posting page — try app deep link directly
      window.location.href = 'xhsdiscover://';
    } else {
      const url = getPlatformUrl(platform, branchId);
      window.open(url, '_blank');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl w-full max-w-sm p-6 text-center shadow-2xl"
      >
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-gray-50 rounded-full">
            {content.icon}
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{content.title}</h3>
        <p className="text-gray-500 text-sm mb-4 leading-relaxed px-2">{content.subtext}</p>
        {[Platform.GOOGLE, Platform.FACEBOOK, Platform.INSTAGRAM, Platform.XHS].includes(platform) && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-4">{t.photoTipManual}</p>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleProceed} className="flex-1">
            Proceed
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export const CustomerFlow = () => {
  const { addSubmission, updateSubmission, language } = useApp();
  const t = TRANSLATIONS[language];

  const [step, setStep] = useState(0);
  const [submissionId, setSubmissionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [privateFeedbackText, setPrivateFeedbackText] = useState('');
  const hasScanned = useRef(false);

  useEffect(() => {
    if (hasScanned.current) return;
    hasScanned.current = true;

    const trackScan = async () => {
      try {
        await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ branchId: 'b1' }) // Default to b1 for initial scan
        });
      } catch (err) {
        console.error("Scan tracking failed", err);
      }
    };
    trackScan();
  }, []);

  // State
  const [selectedBranch, setSelectedBranch] = useState(MOCK_BRANCHES[0]);
  const [branchId, setBranchId] = useState(MOCK_BRANCHES[0].id);
  const [staffId, setStaffId] = useState('not_sure');
  const [therapistId, setTherapistId] = useState('not_sure');

  // Dynamic Data
  const [branches, setBranches] = useState<any[]>(MOCK_BRANCHES);
  const [staffList, setStaffList] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/branches')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setBranches(data);
          setBranchId(data[0].id);
          setSelectedBranch(data[0]);
        }
      })
      .catch(err => console.error("Failed to fetch branches", err));

    fetch('/api/staff')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          // Map snake_case to camelCase
          const mapped = data.map((s: any) => ({
            id: s.id,
            name: s.name,
            role: s.role,
            branchId: s.branch_id
          }));
          setStaffList(mapped);
        }
      })
      .catch(err => console.error("Failed to fetch staff", err));
  }, []);

  // Filter staff based on selected branch
  const availableStaff = staffList.filter(s => s.role === 'staff' && s.branchId === branchId);
  const availableTherapists = MOCK_THERAPISTS.filter(t => t.branchId === branchId);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [reviewLanguage, setReviewLanguage] = useState<string>('Chinese'); // Default review lang
  const [userPhotos, setUserPhotos] = useState<string[]>([]); // Base64 strings


  // Logic
  const [isPrivateFeedback, setIsPrivateFeedback] = useState(false);

  // Platform & Drafts
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([MOCK_CAMPAIGN.requiredPlatform]);
  const [drafts, setDrafts] = useState<Record<Platform, GeneratedDraft[]>>({} as any);
  const [tone, setTone] = useState(ReviewTone.WARM);
  const [length, setLength] = useState(ReviewLength.MEDIUM);

  // Verification
  const [proofs, setProofs] = useState<VerificationProof[]>([]);
  const [verificationOpenPlatform, setVerificationOpenPlatform] = useState<Platform | null>(null);

  // Lightbox & Redirect
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [redirectPlatform, setRedirectPlatform] = useState<Platform | null>(null);
  const [copiedPlatform, setCopiedPlatform] = useState<Platform | null>(null);

  // Reward
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState("+60");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [isPhoneSubmitted, setIsPhoneSubmitted] = useState(false);

  const SEA_CODES = [
    { code: "+60", country: "MY", flag: "🇲🇾" },
    { code: "+65", country: "SG", flag: "🇸🇬" },
    { code: "+62", country: "ID", flag: "🇮🇩" },
    { code: "+66", country: "TH", flag: "🇹🇭" },
    { code: "+84", country: "VN", flag: "🇻🇳" },
    { code: "+63", country: "PH", flag: "🇵🇭" },
    { code: "+673", country: "BN", flag: "🇧🇳" },
    { code: "+855", country: "KH", flag: "🇰🇭" },
    { code: "+856", country: "LA", flag: "🇱🇦" },
    { code: "+95", country: "MM", flag: "🇲🇲" },
  ];

  // Gallery images from admin-uploaded library
  const [galleryImages, setGalleryImages] = useState<{ id: string; url: string; category: string }[]>([]);
  const galleryFetched = useRef(false);

  // Fetch gallery images on mount
  useEffect(() => {
    if (galleryFetched.current) return;
    galleryFetched.current = true;

    const fetchGallery = async () => {
      try {
        const res = await fetch('/api/gallery/random?count=6');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setGalleryImages(data.map((img: any) => ({
            id: img.id,
            url: img.url,
            category: img.category
          })));
        }
      } catch (err) {
        console.error("Failed to fetch gallery images", err);
      }
    };
    fetchGallery();
  }, []);

  // Helper for photos - use user photos if uploaded, else gallery images
  const getDisplayPhotos = () => {
    if (userPhotos.length > 0) return userPhotos;
    // Return gallery URLs if available
    if (galleryImages.length > 0) {
      return galleryImages.slice(0, 3).map(img => img.url);
    }
    // Fallback to empty array if no gallery images
    return [];
  };



  // Validation check
  const isStepValid = () => {
    if (step === 0) return rating !== null && selectedProducts.length > 0;
    if (step === 3) {
      // Only require proof for Google if it's selected. Others are optional.
      if (selectedPlatforms.includes(Platform.GOOGLE)) {
        return !!proofs.find(pr => pr.platform === Platform.GOOGLE);
      }
      // If Google is not selected (unlikely given campaign rules), require at least one proof?
      // Or just return true if no Google requirement.
      // Based on user request "only Google Review proof is required", satisfying Google is enough.
      return true;
    }
    return true;
  };

  // --- Step 0: Experience ---
  const handleRating = (r: number) => {
    setRating(r);
    if (r <= 3) setIsPrivateFeedback(true);
    else setIsPrivateFeedback(false);
  };

  const renderExperience = () => (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="text-center space-y-2 mt-4">
        <h2 className="text-3xl font-display font-bold text-gray-900 tracking-tight">{t.welcome}</h2>
        <p className="text-gray-500 font-medium text-sm px-8">{t.subWelcome}</p>
      </motion.div>

      {/* Selectors */}
      <motion.div variants={itemVariants}>
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider pl-1">
            <MapPin className="w-3.5 h-3.5 text-brand-500" /> {t.branch}
          </label>
          <div className="relative group">
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full appearance-none py-3.5 px-4 text-sm font-medium border border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm hover:border-brand-300"
            >
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 group-hover:text-brand-500 transition-colors">
              <ChevronRight className="w-4 h-4 rotate-90" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Review Language & Therapist Selector */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider pl-1">
            <User className="w-3.5 h-3.5 text-brand-500" /> {t.therapistsLabel}
          </label>
          <div className="relative group">
            <select
              value={therapistId}
              onChange={(e) => setTherapistId(e.target.value)}
              className="w-full appearance-none py-3.5 px-4 text-sm font-medium border border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm hover:border-brand-300"
            >
              <option value="not_sure">{t.notSure}</option>
              {availableTherapists.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 group-hover:text-brand-500 transition-colors">
              <ChevronRight className="w-4 h-4 rotate-90" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider pl-1">
            <Languages className="w-3.5 h-3.5 text-brand-500" /> {t.reviewLang}
          </label>
          <div className="relative group">
            <select
              value={reviewLanguage}
              onChange={(e) => setReviewLanguage(e.target.value)}
              className="w-full appearance-none py-3.5 px-4 text-sm font-medium border border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm hover:border-brand-300"
            >
              <option value="Chinese">Chinese (中文)</option>
              <option value="English">English</option>
              <option value="Malay">Bahasa Melayu</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 group-hover:text-brand-500 transition-colors">
              <ChevronRight className="w-4 h-4 rotate-90" />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-3">
        <label className="block text-sm font-bold text-gray-900 flex justify-between px-1">
          {t.enjoyed} <span className="text-gray-400 font-normal text-xs">{t.pickOne}</span>
        </label>

        {/* Multi-select Dropdown & Tags */}
        <div className="space-y-3">
          <div className="relative group">
            <select
              value=""
              onChange={(e) => {
                const val = e.target.value;
                if (val && !selectedProducts.includes(val)) {
                  setSelectedProducts(prev => [...prev, val]);
                }
              }}
              className="w-full appearance-none py-3.5 px-4 text-sm font-medium border border-gray-200 rounded-2xl bg-white/50 backdrop-blur-sm focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all shadow-sm hover:border-brand-300"
            >
              <option value="" disabled>Select a service to add...</option>
              {(() => {
                const productList = ((MOCK_PRODUCTS as any)[language] || MOCK_PRODUCTS['en']);
                // Group by category
                const grouped = productList.reduce((acc: any, p: any) => {
                  if (!acc[p.category]) acc[p.category] = [];
                  acc[p.category].push(p);
                  return acc;
                }, {});

                return Object.keys(grouped).map((category: string) => (
                  <optgroup key={category} label={category}>
                    {grouped[category].map((p: any) => (
                      <option key={p.id} value={p.name} disabled={selectedProducts.includes(p.name)}>
                        {p.name}
                      </option>
                    ))}
                  </optgroup>
                ));
              })()}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 group-hover:text-brand-500 transition-colors">
              <ChevronRight className="w-4 h-4 rotate-90" />
            </div>
          </div>

          {/* Selected Tags */}
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {selectedProducts.map(p => (
                <motion.button
                  key={p}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSelectedProducts(prev => prev.filter(i => i !== p))}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-brand-50 border border-brand-200 text-brand-700 flex items-center gap-1.5 group hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                >
                  {p}
                  <span className="w-3.5 h-3.5 bg-brand-200 rounded-full flex items-center justify-center text-brand-700 group-hover:bg-red-200 group-hover:text-red-700">
                    <span className="text-[10px]">&times;</span>
                  </span>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-3">
        <label className="block text-sm font-bold text-gray-900 flex justify-between px-1">
          {t.standOut} <span className="text-gray-400 font-normal text-xs">{t.pickOne}</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {((MOCK_HIGHLIGHTS as any)[language] || MOCK_HIGHLIGHTS['en']).map((h: string) => {
            const isSelected = highlights.includes(h);
            return (
              <motion.button
                key={h}
                whileTap={{ scale: 0.95 }}
                onClick={() => setHighlights(prev => isSelected ? prev.filter(i => i !== h) : [...prev, h])}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${isSelected
                  ? 'bg-brand-50 border-brand-200 text-brand-700 ring-1 ring-brand-200 shadow-sm'
                  : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
              >
                {h}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-6 rounded-3xl text-center">
        <label className="block text-sm font-bold text-gray-800 mb-4 uppercase tracking-widest text-xs">{t.rating}</label>
        <div className="flex justify-center gap-3">
          {[1, 2, 3, 4, 5].map(r => (
            <motion.button
              key={r}
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.8 }}
              onClick={() => handleRating(r)}
              className="focus:outline-none"
            >
              <Star
                className={`w-10 h-10 transition-colors duration-300 filter ${rating && rating >= r ? 'fill-amber-400 text-amber-400 drop-shadow-md' : 'text-gray-200'}`}
                strokeWidth={rating && rating >= r ? 0 : 1.5}
              />
            </motion.button>
          ))}
        </div>
        <AnimatePresence>
          {isPrivateFeedback && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-orange-50 text-orange-800 text-xs font-medium rounded-xl border border-orange-100/50 flex items-center gap-3"
            >
              <MessageSquare className="w-5 h-5 text-orange-500 flex-shrink-0" />
              {t.privateFeedback}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <p className="text-[10px] text-center text-gray-400 max-w-xs mx-auto leading-relaxed pt-2">
        {t.agree}
      </p>
    </motion.div>
  );

  const renderPrivateFeedback = () => (
    <div className="space-y-8 text-center pt-8 animate-fade-in">
      <div className="mx-auto w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center ring-8 ring-orange-50/50">
        <MessageSquare className="w-10 h-10 text-orange-500" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">We appreciate your honesty</h2>
        <p className="text-gray-500 mt-2 text-sm px-6 leading-relaxed">
          Your feedback helps us improve. This message will be sent directly to management.
        </p>
      </div>
      <div className="px-4">
        <textarea
          value={privateFeedbackText}
          onChange={(e) => setPrivateFeedbackText(e.target.value)}
          placeholder="Tell us more..."
          className="w-full border border-gray-200 rounded-xl p-4 text-sm min-h-[140px] focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-none shadow-sm"
        />
        <Button
          className="w-full mt-6 shadow-xl shadow-brand-500/20"
          onClick={async () => {
            setIsLoading(true);
            const submission: Submission = {
              id: crypto.randomUUID(),
              branchId,
              staffId,
              therapistId,
              products: selectedProducts,
              rating: rating || 0,
              feedback: privateFeedbackText,
              timestamp: Date.now(),
              status: 'PrivateFeedback',
              platformsSelected: [],
              proofs: [],
              highlights,
              bonusEntries: 0,
              rewardClaimed: false
            };
            await addSubmission(submission);
            setIsLoading(false);
            alert("Feedback submitted. Thank you!");
            window.location.reload();
          }}
          isLoading={isLoading}
        >
          Submit Feedback
        </Button>
      </div>
    </div>
  );

  // --- Step 1: Platform Selection ---
  const renderPlatform = () => {
    const required = MOCK_CAMPAIGN.requiredPlatform;
    const bonus = MOCK_CAMPAIGN.bonusPlatforms;

    const PlatformIcon = ({ p }: { p: Platform }) => {
      if (p === Platform.GOOGLE) return <img src="/assets/logo_google.png" className="w-10 h-10 rounded-full object-cover shadow-sm bg-white p-1" alt="Google" />;
      if (p === Platform.FACEBOOK) return <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-sm"><Facebook className="w-6 h-6" /></div>;
      if (p === Platform.INSTAGRAM) return <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 text-white flex items-center justify-center shadow-sm"><Instagram className="w-6 h-6" /></div>;
      if (p === Platform.XHS) return <img src="/assets/logo_xhs.png" className="w-10 h-10 rounded-full object-cover shadow-sm" alt="XHS" />;
      if (p === Platform.TIKTOK) return <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shadow-sm">Tk</div>;
      return <div className="w-10 h-10 rounded-full bg-gray-200" />;
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const files = Array.from(e.target.files) as File[];
        files.forEach(file => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setUserPhotos(prev => [...prev, reader.result as string].slice(0, 3)); // Max 3
          };
          reader.readAsDataURL(file);
        });
      }
    };

    return (
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        <motion.div variants={itemVariants} className="text-center space-y-1">
          <h2 className="text-xl font-bold font-display text-gray-900">{t.wherePost}</h2>
          <p className="text-sm text-gray-500">{t.moreRewards}</p>
        </motion.div>

        {/* Required Platform Card */}
        <motion.div variants={itemVariants} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-300 to-blue-400 rounded-2xl opacity-30 blur group-hover:opacity-60 transition duration-500"></div>
          <div className="relative glass-card rounded-2xl p-5 overflow-hidden">
            <div className="absolute top-0 right-0 bg-gradient-to-bl from-brand-500 to-brand-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-xl shadow-md z-10">
              {t.required}
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <PlatformIcon p={required} />
              <div>
                <h3 className="font-bold text-gray-900 text-base">{PLATFORM_LABELS[required]}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <Gift className="w-3.5 h-3.5 text-brand-500" />
                  <p className="text-xs text-brand-600 font-semibold">{t.unlocks}: {MOCK_CAMPAIGN.baseRewardValue}</p>
                </div>
              </div>
            </div>
            {/* Background pattern */}
            <div className="absolute -right-6 -bottom-6 text-brand-50 opacity-50 transform rotate-12">
              <PlatformIcon p={required} />
            </div>
          </div>
        </motion.div>

        {/* Bonus Platforms */}
        <motion.div variants={itemVariants} className="space-y-3">
          <div className="flex items-center gap-2 pl-1">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t.bonus}</h3>
            <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse-slow">
              x{selectedPlatforms.filter(p => bonus.includes(p)).length}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {bonus.map(p => {
              const isSelected = selectedPlatforms.includes(p);
              return (
                <motion.div
                  key={p}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPlatforms(prev => isSelected ? prev.filter(i => i !== p) : [...prev, p])}
                  className={`relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group ${isSelected
                    ? 'bg-white border-brand-500 shadow-md ring-1 ring-brand-500'
                    : 'bg-white/60 border-gray-100 hover:bg-white hover:border-brand-200'
                    }`}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${isSelected ? 'scale-105 shadow-sm' : 'grayscale group-hover:grayscale-0'}`}>
                      <PlatformIcon p={p} />
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className={`text-xs font-bold transition-colors ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>
                        {PLATFORM_LABELS[p].split(' ')[0]}
                      </span>
                      {isSelected ? (
                        <span className="text-[10px] text-brand-600 font-medium flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" /> Selected
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1 animate-pulse">
                          <Ticket className="w-3 h-3" /> Win x1
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && <div className="absolute top-2 right-2 w-2 h-2 bg-brand-500 rounded-full"></div>}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

      </motion.div>
    );
  };

  // --- Step 2: Loading Animation (Anniks Beauty Themed) ---
  const renderLoading = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-[60vh] relative"
    >
      <div className="absolute inset-0 bg-brand-50/50 rounded-full blur-3xl opacity-50 animate-pulse-slow"></div>
      <div className="relative w-40 h-40 mb-10 flex items-center justify-center">
        {/* Outer Rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 border-4 border-brand-100 rounded-full"
        ></motion.div>
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 border-4 border-dashed border-brand-200 rounded-full"
        ></motion.div>

        {/* Core Bubbles */}
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-400 to-accent-500 rounded-full opacity-10 animate-ping"></div>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-24 h-24 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center shadow-lg shadow-brand-500/40 z-10"
        >
          <span className="text-4xl filter drop-shadow-md">🌿</span>
        </motion.div>


      </div>

      <h3 className="text-xl font-bold text-gray-800 text-center px-8 relative z-10 font-display">{t.generating}</h3>
      <p className="text-sm text-gray-500 mt-2">{t.craftingExperience}</p>
    </motion.div>
  );

  // --- Step 2: Drafts ---
  const MAX_GENERATIONS = 3;
  const [generationCount, setGenerationCount] = useState(0);

  const handleGenerate = async () => {
    if (generationCount >= MAX_GENERATIONS) {
      alert("You have reached the maximum number of AI generation attempts for this session. Please refresh the page if you wish to start over.");
      return;
    }

    setIsLoading(true);
    setGenerationError(null);

    try {
      const results: Record<Platform, GeneratedDraft[]> = {} as any;

      // Parallel generation
      await Promise.all(selectedPlatforms.map(async (p) => {
        const pDrafts = await generateReviewDrafts({
          platform: p,
          tone: tone,
          length: length,
          services: selectedProducts,
          highlights: highlights,
          staffName: undefined,
          therapistName: MOCK_THERAPISTS.find(t => t.id === therapistId)?.name,
          rating: rating || 5,
          language: reviewLanguage
        });
        results[p] = pDrafts;
      }));

      setDrafts(results);
      setGenerationCount(prev => prev + 1);
      setStep(2);
    } catch (err: any) {
      setGenerationError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderDrafts = () => {
    const photos = getDisplayPhotos();

    const handleDraftEdit = (platform: Platform, newText: string) => {
      setDrafts(prev => {
        const currentDrafts = prev[platform] || [];
        if (currentDrafts.length === 0) return prev;

        const updatedDrafts = [...currentDrafts];
        updatedDrafts[0] = { ...updatedDrafts[0], text: newText };

        return { ...prev, [platform]: updatedDrafts };
      });
    };

    // The Auto-Post Logic (with Native Share Fallback)
    const handlePost = async (platform: Platform, text: string) => {
      // 1. Copy text to clipboard regardless
      try {
        await navigator.clipboard.writeText(text);
      } catch (e) {
        console.error("Clipboard write failed", e);
      }

      // 2. Try Native Share (Mobile) — only TikTok reliably supports file sharing via Web Share API.
      //    IG/XHS trigger a file download instead of the native share sheet, so they use the redirect modal.
      const isMediaPlatform = [Platform.TIKTOK].includes(platform);
      if (isMediaPlatform && navigator.share && navigator.canShare && photos.length > 0) {
        try {
          const files = photos.slice(0, 3).map((p, i) => dataURLtoFile(p, `review-${i}.png`));

          if (navigator.canShare({ files })) {
            await navigator.share({
              files,
              title: 'Review',
              text: text
            });
            return; // Success, user went to app via native share
          }
        } catch (err: any) {
          // If user aborted (cancelled share sheet), do NOT fallback to modal. Just stop.
          if (err.name === 'AbortError') {
            console.log("Share cancelled by user");
            return;
          }
          console.log("Share failed (non-abort), falling back", err);
        }
      }

      // 3. Fallback: Open Redirection Modal
      setRedirectPlatform(platform);
    };

    return (
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        <div className="flex justify-between items-end pb-2">
          <div>
            <h2 className="text-xl font-bold font-display text-gray-900">{t.draftsTitle}</h2>
            <p className="text-xs text-gray-500 font-medium">{t.draftsSub}</p>
          </div>

          <div className="flex gap-2">
            <select
              value={length}
              onChange={(e) => setLength(e.target.value as ReviewLength)}
              className="text-xs font-medium border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 outline-none focus:ring-2 focus:ring-brand-500"
            >
              {Object.values(ReviewLength).map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <button onClick={handleGenerate} className="p-1.5 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-500 transition-colors shadow-sm">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-400">{t.draftsInstruction}</p>

        {selectedPlatforms.map(p => {
          const platformDrafts = drafts[p] || [];
          const mainDraft = platformDrafts[0];

          return (
            <motion.div variants={itemVariants} key={p} className="space-y-3">
              <h3 className="font-bold text-gray-700 text-xs uppercase tracking-wider flex items-center gap-2 pl-1">
                <PlatformIcon p={p} size="sm" />
                {PLATFORM_LABELS[p]}
              </h3>

              {/* Main Card */}
              <div className="glass-card rounded-2xl overflow-hidden group hover:shadow-lg transition-all duration-300">

                {/* Header Strip with Best Match */}
                <div className="bg-gray-50/50 px-4 py-2 border-b border-gray-100 flex justify-between items-center backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    {/* Enlarged Images */}
                    {photos.slice(0, 3).map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        onClick={() => setLightboxSrc(src)}
                        className="w-24 h-24 rounded-xl object-cover ring-2 ring-white shadow-md transition-transform hover:scale-105 z-10 cursor-pointer"
                      />
                    ))}
                  </div>

                </div>

                <div className="p-5">
                  <textarea
                    value={mainDraft?.text || "Generating..."}
                    onChange={(e) => handleDraftEdit(p, e.target.value)}
                    className="w-full text-sm text-gray-700 leading-relaxed mb-4 font-medium font-sans bg-transparent border-0 resize-none focus:ring-0 p-0"
                    rows={6}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => {
                        navigator.clipboard.writeText(mainDraft.text);
                        setCopiedPlatform(p);
                        setTimeout(() => setCopiedPlatform(prev => prev === p ? null : prev), 2000);
                      }}
                    >
                      <Copy className="w-3.5 h-3.5 mr-2" /> {copiedPlatform === p ? t.copied : t.copy}
                    </Button>
                    <button
                      onClick={() => handlePost(p, mainDraft.text)}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gray-900 to-black text-white rounded-lg py-2.5 px-4 shadow-lg shadow-gray-900/20 hover:scale-[1.02] active:scale-95 transition-all text-xs font-bold"
                    >
                      {t.postNow} <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  // --- Step 3: Verify ---
  const renderVerify = () => {
    const getProof = (p: Platform) => proofs.find(pr => pr.platform === p);

    return (
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold font-display text-gray-900">{t.verifyTitle}</h2>
          <p className="text-sm text-gray-500">{t.verifySub}</p>
        </div>



        {/* All Platforms Stacked */}
        <div className="space-y-6">
          {selectedPlatforms.map(p => {
            const isVerified = !!getProof(p);

            return (
              <motion.div
                key={p}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white border rounded-2xl p-5 shadow-sm transition-all ${isVerified ? 'border-green-200 bg-green-50/30' : 'border-gray-200'}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                      {p === Platform.GOOGLE && <img src="/assets/logo_google.png" className="w-8 h-8 rounded-full object-cover" />}
                      {p === Platform.FACEBOOK && <Facebook className="w-5 h-5 text-[#1877F2]" />}
                      {p === Platform.INSTAGRAM && <Instagram className="w-5 h-5 text-pink-600" />}
                      {p === Platform.XHS && <img src="/assets/logo_xhs.png" className="w-8 h-8 rounded-full object-cover" />}
                    </div>
                    <span className="font-bold text-gray-900">{PLATFORM_LABELS[p]}</span>
                  </div>

                  {isVerified ? (
                    <span className="text-xs px-2.5 py-1 bg-green-100 text-green-700 rounded-full font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Verified
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full font-bold flex items-center gap-1.5">
                      Pending
                    </span>
                  )}
                </div>

                {isVerified ? (
                  <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-green-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-green-800">Verification Submitted</p>
                        <p className="text-[10px] text-gray-400">Our team will check shortly.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setProofs(prev => prev.filter(pr => pr.platform !== p))}
                      className="text-xs text-gray-400 hover:text-red-500 underline"
                    >
                      Reset
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <label className="w-full py-4 px-4 border border-dashed border-gray-200 rounded-xl flex items-center justify-between hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-gray-100 rounded-lg text-gray-500 shadow-sm group-hover:text-brand-500">
                          <Upload className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <span className="block text-sm font-bold text-gray-700 group-hover:text-brand-600 transition-colors">{t.screenshot}</span>
                          <span className="block text-[10px] text-gray-400">Upload Proof Image</span>
                        </div>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const base64 = ev.target?.result as string;
                              setProofs(prev => [...prev, { platform: p, type: 'image', content: base64, timestamp: Date.now() }]);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-brand-50 transition-colors">
                        <span className="text-lg leading-none text-gray-300 group-hover:text-brand-400 transition-colors">+</span>
                      </div>
                    </label>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  // Helper to get active platform for render logic
  const selectActivePlatform = verificationOpenPlatform || selectedPlatforms[0];

  // --- Step 4: Reward (Ticket Style) ---
  const renderReward = () => {
    // Expiry date removed as per request

    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="space-y-8 text-center pt-6 pb-10"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto w-24 h-24 bg-gradient-to-tr from-brand-100 to-blue-100 rounded-full flex items-center justify-center shadow-lg shadow-brand-100 relative"
        >
          <div className="absolute inset-0 bg-white/50 rounded-full blur-xl"></div>
          <Gift className="w-10 h-10 text-brand-600 relative z-10" />
        </motion.div>

        <div className="space-y-2">
          <h2 className="text-3xl font-bold font-display text-gray-900">{t.rewardTitle}</h2>
          <p className="text-gray-500 text-sm">{t.rewardSub}</p>
        </div>

        {/* Ticket UI */}
        <motion.div
          whileHover={{ scale: 1.02, rotate: 1 }}
          className="relative mx-2 filter drop-shadow-2xl"
        >
          {/* Ticket Top (Voucher) */}
          <div className="bg-white rounded-t-2xl p-6 relative overflow-hidden">
            {/* Decorative pattern */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-brand-100 to-transparent rounded-bl-full opacity-50"></div>

            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{t.redeemYour}</div>
            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-blue-600 mb-5 font-display">
              {MOCK_CAMPAIGN.baseRewardValue}
            </div>

            <div className="bg-gray-50 border border-brand-100 rounded-xl p-4 mb-2">
              <p className="text-xs text-brand-800 font-medium leading-relaxed text-center">
                {t.rewardInstructions}
              </p>
            </div>
          </div>

          {/* Ticket Rip/Tear */}
          <div className="relative h-4 bg-white flex items-center justify-between px-2">
            <div className="w-4 h-4 rounded-full bg-slate-50 -ml-4 shadow-inner"></div>
            <div className="border-t-2 border-dashed border-gray-200 w-full h-0"></div>
            <div className="w-4 h-4 rounded-full bg-slate-50 -mr-4 shadow-inner"></div>
          </div>

          {/* Ticket Bottom (Lucky Draw) */}
          {/* Ticket Bottom (Lucky Draw Input) */}
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-b-2xl p-5 border-t-0">
            <div className="text-left mb-3">
              <div className="flex justify-between items-start mb-1">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{t.enterPhone}</div>
                <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold whitespace-nowrap ml-2">
                  {selectedPlatforms.filter(p => MOCK_CAMPAIGN.bonusPlatforms.includes(p)).length}X {t.bonus}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="relative w-1/3 min-w-[100px]">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  disabled={isPhoneSubmitted}
                  className="appearance-none bg-white border border-indigo-200 text-indigo-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 pr-8 font-mono font-medium truncate disabled:bg-gray-100 disabled:text-gray-500"
                >
                  {SEA_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                </div>
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  let val = e.target.value;
                  // If user pastes/types country code, strip it
                  if (val.startsWith(countryCode)) {
                    val = val.substring(countryCode.length);
                  }
                  // Allow only numbers
                  val = val.replace(/[^0-9]/g, '');
                  // Limit to 10 characters
                  if (val.length > 10) val = val.substring(0, 10);
                  setPhoneNumber(val);
                }}
                maxLength={10}
                placeholder={t.phonePlaceholder}
                disabled={isPhoneSubmitted}
                className="bg-white border border-indigo-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 outline-none font-medium placeholder-gray-400 disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
            <button
              onClick={handleJoinLuckyDraw}
              disabled={phoneNumber.length < 8 || isPhoneSubmitted}
              className={`px-4 rounded-lg font-bold text-white transition-all shadow-md mt-3 w-full py-2.5 flex items-center justify-center gap-2 ${phoneNumber.length >= 8 && !isPhoneSubmitted ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : 'bg-gray-300 cursor-not-allowed'}`}
            >
              {isPhoneSubmitted ? (
                <>
                  <Check className="w-5 h-5" /> Submitted
                </>
              ) : (
                <>
                  <ArrowRight className="w-5 h-5" /> Join Draw
                </>
              )}
            </button>

            <AnimatePresence>
              {isPhoneSubmitted && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 text-center"
                >
                  <p className="text-green-700 text-sm font-bold flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-green-600" />
                    {t.goodLuckEntered}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="text-xs text-center text-gray-400 font-medium">
            {t.enterPhone}
          </p>
        </motion.div>
      </motion.div>
    );
  };

  // --- Main Render Orchestrator ---
  const handleNext = async () => {
    if (step === 0) {
      if (isPrivateFeedback) {
        setStep(5);
        return;
      }
      setStep(1);
    } else if (step === 1) {
      await handleGenerate(); // Sets step 2 on success
    } else if (step === 2) {
      setStep(3);

    } else if (step === 3) {
      const ticket = `88${Math.floor(Math.random() * 900) + 100}`;
      const newSubId = `sub-${Date.now()}`;
      setTicketNumber(ticket);
      setSubmissionId(newSubId);

      addSubmission({
        id: newSubId,
        branchId,
        staffId: staffId === 'not_sure' ? null : staffId,
        therapistId: therapistId === 'not_sure' ? null : therapistId,
        products: selectedProducts,
        highlights,
        rating: rating!,
        reviewLanguage,
        platformsSelected: selectedPlatforms,
        status: 'Pending',
        timestamp: Date.now(),
        rewardClaimed: true,
        proofs: proofs,
        luckyDrawTicket: ticket,
        bonusEntries: selectedPlatforms.filter(p => MOCK_CAMPAIGN.bonusPlatforms.includes(p)).length
      });

      // Track gallery image usage if user didn't upload their own photos
      if (userPhotos.length === 0 && galleryImages.length > 0) {
        const usedImageIds = galleryImages.slice(0, 3).map(img => img.id);
        fetch('/api/gallery/use', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageIds: usedImageIds })
        }).catch(err => console.error('Failed to track gallery usage', err));
      }

      setStep(4);
      confetti({

        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        gravity: 0.8,
        scalar: 1.2,
        colors: ['#06b6d4', '#fcd34d', '#3b82f6', '#ec4899']
      });
    }
  };

  const handleJoinLuckyDraw = async () => {
    if (!submissionId || phoneNumber.length < 8) return;

    setIsLoading(true);
    try {
      await updateSubmission(submissionId, {
        phone: countryCode + phoneNumber
      });

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#fcd34d']
      });

      setIsPhoneSubmitted(true);
      // Removed alert and setPhoneNumber("") to keep the number visible but disabled
    } catch (err) {
      console.error("Failed to join lucky draw:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPrivateFeedback && step === 0) {
    return (
      <MobileLayout title="Private Feedback" step={0} totalSteps={1}>
        {renderExperience()}
        {renderPrivateFeedback()}
      </MobileLayout>
    );
  }

  const rewardSummary = {
    base: MOCK_CAMPAIGN.baseRewardValue,
    bonusEntries: selectedPlatforms.length - 1
  };

  const canProceed = isStepValid();

  return (
    <MobileLayout
      title="Anniks Beauty"
      step={step}
      totalSteps={5}
      onBack={step > 0 && step < 4 ? () => setStep(step - 1) : undefined}
      rewardSummary={step < 4 ? rewardSummary : undefined}
    >
      <div className="mt-2 min-h-[60vh]">
        <AnimatePresence mode='wait'>
          {isLoading ? (
            <motion.div key="loading" {...pageVariants}>
              {renderLoading()}
            </motion.div>
          ) : generationError ? (
            <motion.div key="error" {...pageVariants} className="text-center py-12">
              <p className="text-red-500 text-sm mb-4">{generationError}</p>
              <Button onClick={handleGenerate} className="mx-auto">Try Again</Button>
            </motion.div>
          ) : (
            <>
              {step === 0 && (
                <motion.div key="step0" {...pageVariants}>
                  {renderExperience()}
                </motion.div>
              )}
              {step === 1 && (
                <motion.div key="step1" {...pageVariants}>
                  {renderPlatform()}
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="step2" {...pageVariants}>
                  {renderDrafts()}
                </motion.div>
              )}
              {step === 3 && (
                <motion.div key="step3" {...pageVariants}>
                  {renderVerify()}
                </motion.div>
              )}
              {step === 4 && (
                <motion.div key="step4" {...pageVariants}>
                  {renderReward()}
                </motion.div>
              )}
              {step === 5 && (
                <motion.div key="step5" {...pageVariants}>
                  {renderPrivateFeedback()}
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      {!isLoading && step < 4 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 p-5 bg-white/80 backdrop-blur-md border-t border-gray-200 safe-area-bottom z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]"
        >
          <div className="max-w-md mx-auto">
            <Button
              className="w-full shadow-lg shadow-brand-500/30 text-lg h-14 font-display"
              size="lg"
              onClick={handleNext}
              isLoading={isLoading}
              disabled={!canProceed}
            >
              {step === 3 ? t.submit : t.next}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Thank You Modal */}
      <AnimatePresence>
        {showThankYouModal && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-50 to-blue-50 -z-10"></div>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">Thank you!</h2>
              <p className="text-gray-500 mb-6">We appreciate your feedback. Good luck!</p>
              <p className="text-xs text-brand-400 font-medium animate-pulse">Redirecting...</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {step === 4 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 p-5 bg-white/80 backdrop-blur-md border-t border-gray-200 safe-area-bottom z-30"
        >
          <div className="max-w-md mx-auto">
            <Button
              variant="outline"
              className="w-full h-14 border-gray-300 text-gray-700 font-bold font-display"
              onClick={async () => {
                if (phoneNumber && submissionId) {
                  await updateSubmission(submissionId, { phone: countryCode + phoneNumber });
                }
                setShowThankYouModal(true);
                setTimeout(() => {
                  window.location.reload();
                }, 3000);
              }}
            >
              {t.done}
            </Button>
          </div>
        </motion.div>
      )}



      {/* Lightbox */}
      <AnimatePresence>
        {lightboxSrc && (
          <Lightbox
            src={lightboxSrc}
            onClose={() => setLightboxSrc(null)}
          />
        )}
      </AnimatePresence>

      {/* Redirect Modal */}
      <AnimatePresence>
        {redirectPlatform && (
          <RedirectModal
            platform={redirectPlatform}
            isOpen={!!redirectPlatform}
            onClose={() => setRedirectPlatform(null)}
            t={t}
            branchId={branchId}
          />
        )}
      </AnimatePresence>
    </MobileLayout >
  );
};