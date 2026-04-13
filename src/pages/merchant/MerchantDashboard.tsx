import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useApp } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { CheckCircle, XCircle, Clock, TrendingUp, Users, Star, AlertTriangle, Gift, MessageSquare, Image as ImageIcon, QrCode, Shield, RefreshCw, Archive, Copy, Check, Trash2, User, Upload, Pencil, PenTool, X, Save, Download, Ticket, Bot, Plus, BookOpen, Images, ChevronRight, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { QRCodeSVG } from 'qrcode.react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Cropper from 'react-easy-crop';

// Image cropping utility
const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

async function getCroppedImg(imageSrc: string, pixelCrop: any) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Set fixed size for output to reduce payload size (500x500)
  canvas.width = 500;
  canvas.height = 500;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    500,
    500
  );

  return canvas.toDataURL('image/jpeg', 0.8); // slight compression
}

export interface Staff {
  id: string;
  name: string;
  role: 'staff' | 'therapist';
  branchId: string; // "branch_id" from DB, mapped manually or via query
}

export const MerchantDashboard = () => {

  /* Mappings */
  const BRANCH_NAMES: Record<string, string> = {
    'b1': 'Anniks Beauty Cheras',
    'b2': 'Anniks Beauty Penang',
  };


  const PLATFORM_COLORS: Record<string, string> = {
    'Google': 'bg-slate-100 text-slate-700 border border-slate-200',
    'Google Review': 'bg-slate-100 text-slate-700 border border-slate-200',
    'Facebook': 'bg-blue-50 text-blue-700 border border-blue-200',
    'Instagram': 'bg-violet-50 text-violet-700 border border-violet-200',
    'Xiaohongshu': 'bg-red-50 text-red-700 border border-red-200',
    'XHS': 'bg-red-50 text-red-700 border border-red-200'
  };

  const PLATFORM_HEX: Record<string, string> = {
    'Google': '#64748B',        // Slate
    'Google Review': '#64748B',
    'Facebook': '#2563EB',      // Muted Blue
    'Instagram': '#7C3AED',     // Muted Violet
    'Xiaohongshu': '#DC2626',   // Muted Red
    'XHS': '#DC2626'
  };

  /* State */
  /* State */
  /* State */
  const { submissions, getStats, updateSubmissionStatus, isLoading, refreshSubmissions } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Parse current section from URL
  // Expected format: /admin/section/subsection
  const pathParts = location.pathname.split('/').filter(Boolean); // ['admin', 'section', 'subsection']
  // Default to dashboard if no section provided
  const activeSection = pathParts[1] || 'dashboard';
  const activeSubsection = pathParts[2] || '';

  // Derived states based on URL
  const activeReviewTab = (activeSection === 'reviews' && activeSubsection) ? activeSubsection as 'verification' | 'feedback' : 'verification';

  const getSettingsTab = (sub: string) => {
    if (sub === 'ai-configuration') return 'ai-config';
    if (sub === 'image-gallery') return 'gallery';
    if (sub === 'admin-controls') return 'admin';
    return sub || 'qrcode'; // default to qrcode
  };
  const activeSettingsTab = (activeSection === 'settings') ? getSettingsTab(activeSubsection) : 'qrcode';

  const [selectedProof, setSelectedProof] = useState<{ url: string; submissionId: string } | null>(null);
  const [loadedProofs, setLoadedProofs] = useState<Record<string, any[]>>({});
  const [isLoadingProof, setIsLoadingProof] = useState(false);

  // Lazy-load full proof images for a submission (only fetched when admin clicks "View")
  const viewProofImage = async (submissionId: string, proofIndex: number) => {
    // If already loaded, show directly
    if (loadedProofs[submissionId]) {
      const imageProofs = loadedProofs[submissionId].filter((p: any) => p.type === 'image');
      const target = imageProofs[proofIndex] || imageProofs[0];
      if (target) setSelectedProof({ url: target.content, submissionId });
      return;
    }

    setIsLoadingProof(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/proofs`);
      const data = await res.json();
      const proofs = data.proofs || [];
      setLoadedProofs(prev => ({ ...prev, [submissionId]: proofs }));

      const imageProofs = proofs.filter((p: any) => p.type === 'image');
      const target = imageProofs[proofIndex] || imageProofs[0];
      if (target) setSelectedProof({ url: target.content, submissionId });
    } catch (err) {
      console.error('Failed to load proofs', err);
    } finally {
      setIsLoadingProof(false);
    }
  };
  const [highlightedSubmissionId, setHighlightedSubmissionId] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [filterKey, setFilterKey] = useState(0); // For triggering animations
  const [isGalleryDepleted, setIsGalleryDepleted] = useState(false);
  const [fetchedVisits, setFetchedVisits] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [customerAppUrl, setCustomerAppUrl] = useState(`${window.location.origin}/review`);
  const [linkCopied, setLinkCopied] = useState(false);
  const [usersList, setUsersList] = useState<{ id: string; username: string; role: string; profile_pic?: string | null }[]>([]);
  const [profilePic, setProfilePic] = useState<string | null>(localStorage.getItem('profile_pic'));
  const currentUsername = localStorage.getItem('username') || 'Admin';
  const [editingUser, setEditingUser] = useState<{ id: string; username: string; role: string; password: string; profilePic: string | null } | null>(null);

  const [showExportMenu, setShowExportMenu] = useState<string | null>(null);

  // Staff Management State
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null); // For Add/Edit modal

  // AI Configuration state
  const [aiConfig, setAiConfig] = useState<{
    model_name: string;
    system_prompt: string;
    selling_points: string[];
    temperature: number;
  } | null>(null);
  const [isLoadingAiConfig, setIsLoadingAiConfig] = useState(false);
  const [isSavingAiConfig, setIsSavingAiConfig] = useState(false);
  const [newSellingPoint, setNewSellingPoint] = useState('');

  // Knowledgebase state
  type KnowledgeEntry = {
    id: string;
    category: string;
    title: string;
    content: string;
    tags: string[];
    created_at: string;
    updated_at: string;
  };
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>([]);
  const [isLoadingKnowledge, setIsLoadingKnowledge] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<{
    id?: string;
    category: string;
    title: string;
    content: string;
    tags: string[];
  } | null>(null);
  const [newKnowledgeTag, setNewKnowledgeTag] = useState('');

  // Image Gallery state
  type GalleryImage = {
    id: string;
    filename: string;
    original_name: string;
    url: string;
    category: string;
    tags: string[];
    use_count: number;
    created_at: string;
  };
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [galleryFilter, setGalleryFilter] = useState<string>('all');
  const [newImageTags, setNewImageTags] = useState<string[]>([]);
  const [newImageCategory, setNewImageCategory] = useState<string>('general');
  const galleryFileInputRef = React.useRef<HTMLInputElement>(null);
  const [allowMultipleUses, setAllowMultipleUses] = useState(false);


  // Mystery Gift state
  const [activeCampaignTab, setActiveCampaignTab] = useState<'lucky-draw' | 'mystery-gift'>('lucky-draw');
  const [mysteryGifts, setMysteryGifts] = useState<{ id: string; name: string; image: string | null; stock: number; threshold: number; given_out: number; created_at: string }[]>([]);
  const [editingGift, setEditingGift] = useState<{ id?: string; name: string; image: string | null; stock: number; threshold: number } | null>(null);

  // Crop state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Fetch users list
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setUsersList(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch users');
    }
  };

  // Fetch mystery gifts
  const fetchMysteryGifts = async () => {
    try {
      const res = await fetch('/api/mystery-gifts');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setMysteryGifts(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch mystery gifts');
    }
  };

  // Fetch AI Configuration
  const fetchAiConfig = async () => {
    setIsLoadingAiConfig(true);
    try {
      const res = await fetch('/api/ai-config', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAiConfig({
          model_name: data.model_name || 'gemini-2.5-flash-lite',
          system_prompt: data.system_prompt || '',
          selling_points: data.selling_points || [],
          temperature: data.temperature || 0.7
        });
      }
    } catch (err) {
      console.error('Failed to fetch AI config');
    } finally {
      setIsLoadingAiConfig(false);
    }
  };

  // Save AI Configuration
  const saveAiConfig = async () => {
    if (!aiConfig) return;
    setIsSavingAiConfig(true);
    try {
      const res = await fetch('/api/ai-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(aiConfig)
      });
      const data = await res.json();
      if (data.success) {
        alert('AI Configuration saved successfully!');
      } else {
        alert('Failed to save AI configuration');
      }
    } catch (err) {
      console.error('Failed to save AI config');
      alert('Failed to save AI configuration');
    } finally {
      setIsSavingAiConfig(false);
    }
  };

  // Fetch Knowledgebase entries
  const fetchKnowledgebase = async () => {
    setIsLoadingKnowledge(true);
    try {
      const res = await fetch('/api/knowledgebase', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setKnowledgeEntries(data);
        }
      }
    } catch (err) {
      console.error('Failed to fetch knowledgebase');
    } finally {
      setIsLoadingKnowledge(false);
    }
  };

  // Save Knowledgebase entry (create or update)
  const saveKnowledgeEntry = async () => {
    if (!editingKnowledge || !editingKnowledge.title.trim()) {
      alert('Title is required');
      return;
    }

    try {
      const isUpdate = !!editingKnowledge.id;
      const url = isUpdate
        ? `/api/knowledgebase/${editingKnowledge.id}`
        : '/api/knowledgebase';

      const res = await fetch(url, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingKnowledge)
      });

      const data = await res.json();
      if (data.success || data.id) {
        setEditingKnowledge(null);
        fetchKnowledgebase();
      } else {
        alert('Failed to save knowledge entry');
      }
    } catch (err) {
      console.error('Failed to save knowledge entry');
      alert('Failed to save knowledge entry');
    }
  };

  // Delete Knowledgebase entry
  const deleteKnowledgeEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this knowledge entry?')) return;

    try {
      await fetch(`/api/knowledgebase/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      fetchKnowledgebase();
    } catch (err) {
      console.error('Failed to delete knowledge entry');
    }
  };

  // Fetch Gallery images and settings
  const fetchGallery = async () => {
    setIsLoadingGallery(true);
    try {
      const [imagesRes, settingsRes] = await Promise.all([
        fetch('/api/gallery'),
        fetch('/api/gallery/settings')
      ]);

      if (imagesRes.ok) {
        const images = await imagesRes.json();
        if (Array.isArray(images)) {
          setGalleryImages(images);
        }
      }

      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        setAllowMultipleUses(settings.allow_multiple_uses === 1);
      }
    } catch (err) {
      console.error('Failed to fetch gallery');
    } finally {
      setIsLoadingGallery(false);
    }
  };

  // Toggle allow multiple uses setting
  const toggleAllowMultipleUses = async () => {
    const newValue = !allowMultipleUses;
    setAllowMultipleUses(newValue);
    try {
      await fetch('/api/gallery/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ allow_multiple_uses: newValue })
      });
    } catch (err) {
      console.error('Failed to update settings');
      setAllowMultipleUses(!newValue); // Revert on error
    }
  };

  // Upload Gallery image
  const uploadGalleryImage = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setIsUploadingImage(true);
    const formData = new FormData();

    // Append all files
    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    formData.append('category', newImageCategory);

    try {
      const response = await fetch('/api/gallery/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Add new images to the beginning of the list
        setGalleryImages(prev => [...(data.images || []), ...prev]);

        // Reset file input if needed
        if (galleryFileInputRef.current) {
          galleryFileInputRef.current.value = '';
        }
      } else {
        alert('Failed to upload images');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Delete Gallery image
  const deleteGalleryImage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      await fetch(`/api/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      setGalleryImages(prev => prev.filter(img => img.id !== id));
      checkGalleryStatus(); // Refresh depletion status
    } catch (err) {
      console.error('Failed to delete image');
    }
  };

  // Reset use count for gallery image(s)
  const resetGalleryCount = async (imageId?: string) => {
    try {
      await fetch('/api/gallery/reset-count', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId })
      });

      if (imageId) {
        // Reset single image
        setGalleryImages(prev => prev.map(img =>
          img.id === imageId ? { ...img, use_count: 0 } : img
        ));
      } else {
        // Reset all
        setGalleryImages(prev => prev.map(img => ({ ...img, use_count: 0 })));
        checkGalleryStatus(); // Refresh depletion status
      }
    } catch (err) {
      console.error('Failed to reset count');
    }
  };

  React.useEffect(() => {
    if (activeSettingsTab === 'admin') {
      fetchUsers();
    }
    if (activeSettingsTab === 'ai-config') {
      fetchAiConfig();
      fetchKnowledgebase();
    }
    if (activeSettingsTab === 'gallery') {
      fetchGallery();
    }
  }, [activeSettingsTab]);

  React.useEffect(() => {
    if (activeSection === 'campaigns') {
      fetchMysteryGifts();
    }
  }, [activeSection]);

  // Fetch mystery gifts on mount for alerts (red dot on Campaigns)
  // Fetch mystery gifts on mount removed (handled by parallel fetch)

  // Keyboard Navigation for Image Viewer (uses lazy-loaded proofs)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedProof) return;

      if (e.key === 'Escape') {
        setSelectedProof(null);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const proofs = loadedProofs[selectedProof.submissionId];
        if (!proofs) return;

        const imageProofs = proofs.filter((p: any) => p.type === 'image');
        if (imageProofs.length <= 1) return;

        const currentIndex = imageProofs.findIndex((p: any) => p.content === selectedProof.url);
        if (currentIndex === -1) return;

        let nextIndex;
        if (e.key === 'ArrowRight') {
          nextIndex = (currentIndex + 1) % imageProofs.length;
        } else {
          nextIndex = (currentIndex - 1 + imageProofs.length) % imageProofs.length;
        }

        setSelectedProof({
          url: imageProofs[nextIndex].content,
          submissionId: selectedProof.submissionId
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProof, loadedProofs]);

  // Admin State
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'staff' });
  const [userMsg, setUserMsg] = useState('');
  const isAdmin = localStorage.getItem('user_role') === 'admin';

  // Branch State
  const [branches, setBranches] = useState<{ id: string, name: string }[]>([]);
  const [editingBranch, setEditingBranch] = useState<string | null>(null);
  const [tempBranchName, setTempBranchName] = useState('');

  // Fetch Branches
  const fetchBranches = async () => {
    try {
      const res = await fetch('/api/branches');
      if (res.ok) setBranches(await res.json());
    } catch (err) {
      console.error("Failed to update branch:", err);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff');
      const data = await res.json();
      // Map DB snake_case to camelCase
      const mapped = data.map((s: any) => ({
        id: s.id,
        name: s.name,
        role: s.role,
        branchId: s.branch_id
      }));
      setStaffList(mapped);
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    }
  };

  const handleSaveStaff = async () => {
    if (!editingStaff) return;
    try {
      const method = editingStaff.id.startsWith('new-') ? 'POST' : 'PUT';
      const url = method === 'POST' ? '/api/staff' : `/api/staff/${editingStaff.id}`;

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(editingStaff)
      });

      setEditingStaff(null);
      fetchStaff();
    } catch (err) {
      console.error("Failed to save staff:", err);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await fetch(`/api/staff/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      fetchStaff();
    } catch (err) {
      console.error("Failed to delete staff:", err);
    }
  };

  // Parallel Fetching for Dashboard
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [branchesRes, staffRes, giftsRes] = await Promise.all([
          fetch('/api/branches'),
          fetch('/api/staff'),
          fetch('/api/mystery-gifts')
        ]);

        const [branchesData, staffData, giftsData] = await Promise.all([
          branchesRes.ok ? branchesRes.json() : [],
          staffRes.ok ? staffRes.json() : [],
          giftsRes.ok ? giftsRes.json() : []
        ]);

        // Batch Updates
        if (Array.isArray(branchesData)) setBranches(branchesData);

        if (Array.isArray(staffData)) {
          const mapped = staffData.map((s: any) => ({
            id: s.id,
            name: s.name,
            role: s.role,
            branchId: s.branch_id
          }));
          setStaffList(mapped);
        }

        if (Array.isArray(giftsData)) setMysteryGifts(giftsData);

      } catch (err) {
        console.error("Dashboard parallel fetch failed:", err);
      }
    };

    loadData();
  }, []);

  const handleUpdateBranch = async (id: string) => {
    try {
      await fetch(`/api/branches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` },
        body: JSON.stringify({ name: tempBranchName })
      });
      fetchBranches();
      setEditingBranch(null);
    } catch (err) { console.error("Failed to update branch"); }
  };

  const handleDeleteBranch = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete branch "${name}"? This action cannot be undone.`)) return;

    try {
      await fetch(`/api/branches/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      fetchBranches();
    } catch (err) {
      console.error("Failed to delete branch:", err);
      alert("Failed to delete branch");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ username: newUser.username, password: newUser.password, role: newUser.role })
      });
      const data = await res.json();
      if (data.success) {
        setUserMsg('User created successfully!');
        setNewUser({ username: '', password: '', role: 'staff' });
        fetchUsers(); // Refresh user list
      } else {
        setUserMsg(data.error || 'Failed to create user');
      }
    } catch (err) {
      setUserMsg('Network error');
    }
  };

  // Fetch Visits from Backend (Initial Load Only)
  React.useEffect(() => {
    const fetchStats = () => {
      setIsLoadingStats(true);
      fetch(`/api/dashboard/stats?period=${timeFilter}`)
        .then(res => res.json())
        .then(data => {
          setFetchedVisits(data.visits || 0);
          setIsLoadingStats(false);
        })
        .catch(err => console.error("Failed to fetch stats", err));
    };

    fetchStats();
  }, [timeFilter]);

  // Check gallery depletion status
  const checkGalleryStatus = React.useCallback(async () => {
    try {
      const res = await fetch('/api/gallery/status');
      const data = await res.json();
      setIsGalleryDepleted(data.isDepleted);
    } catch (err) {
      console.error('Failed to check gallery status', err);
    }
  }, []);

  // Check gallery status once on mount (no polling — saves egress)
  React.useEffect(() => {
    checkGalleryStatus();
  }, [checkGalleryStatus]);

  // Format Date Helper (GMT+8)
  // Format Date Helper (GMT+8)
  // Format Date Helper (GMT+8)
  const formatDate = (ts: number | string) => {
    const timestamp = typeof ts === 'string' ? Number(ts) : ts;
    if (!timestamp || isNaN(timestamp)) return '-';

    const date = new Date(timestamp);

    // YYYY-MM-DD
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kuala_Lumpur', year: 'numeric', month: '2-digit', day: '2-digit'
    });

    // HH:MM AM/PM
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kuala_Lumpur', hour: 'numeric', minute: '2-digit', hour12: true
    });

    return `${formatter.format(date)}, ${timeFormatter.format(date)}`;
  };

  // Filter Submissions Client-Side
  const filteredSubmissions = React.useMemo(() => {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    return submissions.filter(s => {
      if (timeFilter === 'all') return true;
      if (timeFilter === 'today') return s.timestamp >= new Date().setHours(0, 0, 0, 0);
      if (timeFilter === 'week') return s.timestamp >= now - (7 * DAY);
      if (timeFilter === 'month') return s.timestamp >= now - (30 * DAY);
      return true;
    });
  }, [submissions, timeFilter]);

  // Scroll to highlighted submission when switching to verification tab
  React.useEffect(() => {
    if (activeSection === 'reviews' && activeReviewTab === 'verification' && highlightedSubmissionId) {
      const element = document.getElementById(`submission-${highlightedSubmissionId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Optional: clear highlight after a delay
        setTimeout(() => setHighlightedSubmissionId(null), 3000);
      }
    }
  }, [activeSection, activeReviewTab, highlightedSubmissionId]);

  // Close export menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setShowExportMenu(null);
    if (showExportMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showExportMenu]);

  // Derived Stats based on Filtered Data
  const totalReviews = filteredSubmissions.length;
  const verifiedCount = filteredSubmissions.filter(s => s.status === 'Verified').length;
  const avgRating = filteredSubmissions.reduce((acc, curr) => acc + curr.rating, 0) / (totalReviews || 1);
  const conversionRate = fetchedVisits > 0 ? Math.round((totalReviews / fetchedVisits) * 100) : 0;

  // --- Derived Data for Charts ---
  // Branch Performance
  const branchData = branches.length > 0 ? branches.map(b => {
    const count = filteredSubmissions.filter(s => s.branchId === b.id).length;
    return { name: b.name, reviews: count };
  }) : Object.values(filteredSubmissions.reduce((acc, curr) => {
    const branchName = BRANCH_NAMES[curr.branchId] || curr.branchId;
    const name = branchName;
    if (!acc[name]) acc[name] = { name: name, reviews: 0 };
    acc[name].reviews++;
    return acc;
  }, {} as Record<string, any>));

  // Platform Distribution
  const platformCounts = filteredSubmissions.reduce((acc, curr) => {
    curr.platformsSelected?.forEach(p => {
      acc[p] = (acc[p] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  const pieData = Object.keys(platformCounts).map(k => ({ name: k, value: platformCounts[k] }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Top Staff / Therapists
  const topStaff = Object.values(filteredSubmissions.reduce((acc, curr) => {
    // Check both staffId and therapistId
    if (curr.staffId) {
      // Find name from backend JOIN, then dynamic list, then fallback to ID
      const backendName = curr.staffName && curr.staffName !== 'Unknown' ? curr.staffName : null;
      const staffMember = staffList.find(s => s.id === curr.staffId);
      const name = backendName || (staffMember ? staffMember.name : (curr.staffId === 'not_sure' ? 'Not Sure' : curr.staffId));

      if (!acc[name]) acc[name] = { name: name, role: 'Staff', reviews: 0, rating: 0, count: 0 };
      acc[name].reviews++;
      acc[name].rating += curr.rating;
      acc[name].count++;
    }
    if (curr.therapistId) {
      const backendName = curr.therapistName && curr.therapistName !== 'Unknown' ? curr.therapistName : null;
      const staffMember = staffList.find(s => s.id === curr.therapistId);
      const name = backendName || (staffMember ? staffMember.name : (curr.therapistId === 'not_sure' ? 'Not Sure' : curr.therapistId));

      if (!acc[name]) acc[name] = { name: name, role: 'Therapist', reviews: 0, rating: 0, count: 0 };
      acc[name].reviews++;
      acc[name].rating += curr.rating;
      acc[name].count++;
    }
    return acc;
  }, {} as Record<string, any>))
    .map(s => ({
      ...s,
      avgRating: (s.rating / s.count).toFixed(1)
    }))
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 5);

  // Top Services
  const serviceCounts = filteredSubmissions.reduce((acc, curr) => {
    curr.products?.forEach((s: string) => {
      acc[s] = (acc[s] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  const topServices = Object.entries(serviceCounts).sort((a: [string, number], b: [string, number]) => b[1] - a[1]).slice(0, 10);

  // Top Highlights
  const highlightCounts = filteredSubmissions.reduce((acc, curr) => {
    curr.highlights?.forEach((h: string) => {
      acc[h] = (acc[h] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);
  const topHighlights = Object.entries(highlightCounts).sort((a: [string, number], b: [string, number]) => b[1] - a[1]).slice(0, 5);


  const pendingSubmissions = filteredSubmissions.filter(s => s.status === 'Pending');
  const verifiedHistory = filteredSubmissions.filter(s => s.status === 'Verified' || s.status === 'Rejected');
  const feedbackSubmissions = filteredSubmissions.filter(s => (s.rating <= 3 || s.status === 'PrivateFeedback') && s.status !== 'Archived');
  const archivedFeedback = filteredSubmissions.filter(s => (s.rating <= 3 || s.status === 'PrivateFeedback') && s.status === 'Archived');
  const luckyDrawEntries = filteredSubmissions.filter(s => s.luckyDrawTicket);

  // --- Export Functions ---
  const formatExportDate = (val: string | number) => {
    const timestamp = Number(val);
    if (!timestamp || isNaN(timestamp)) return '-';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const prepareExportData = (data: any[], type: 'reviews' | 'complaints') => {
    return data.map(item => ({
      'Customer': item.customerName || 'Anonymous',
      'Phone': item.phone || '-',
      'Branch': BRANCH_NAMES[item.branchId] || item.branchId,
      'Rating': item.rating,
      'Status': item.status,
      'Platforms': item.platformsSelected?.join(', ') || '-',
      'Services': item.products?.join(', ') || '-',
      'Highlights': item.highlights?.join(', ') || '-',
      'Served By': (item.staffId && item.staffId !== 'not_sure') ? (item.staffName || item.staffId) : '-',
      'Therapist': (item.therapistId && item.therapistId !== 'not_sure') ? (item.therapistName || item.therapistId) : '-',
      'Date': formatExportDate(item.timestamp),
      ...(type === 'complaints' && { 'Feedback': item.personalFeedback || '-' })
    }));
  };

  const exportToCSV = (data: any[], filename: string) => {
    const exportData = prepareExportData(data, filename.includes('complaint') ? 'complaints' : 'reviews');
    const headers = Object.keys(exportData[0] || {});
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => headers.map(h => `"${(row as any)[h] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportToXLSX = (data: any[], filename: string) => {
    const exportData = prepareExportData(data, filename.includes('complaint') ? 'complaints' : 'reviews');
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    // Generate buffer and save
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = async (data: any[], filename: string, title: string) => {
    const exportData = prepareExportData(data, filename.includes('complaint') ? 'complaints' : 'reviews');

    // Dynamically import html2canvas for CJK font support
    const html2canvas = (await import('html2canvas')).default;

    // Create a hidden container with the table
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '1200px';
    container.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans SC", "Microsoft YaHei", sans-serif';
    container.style.fontSize = '11px';
    container.style.background = 'white';
    container.style.padding = '20px';

    // Build HTML table with column widths
    const headers = Object.keys(exportData[0] || {});

    // Define column widths (narrower for Services/Highlights, wider for others)
    const columnWidths: Record<string, string> = {
      'Customer': '80px',
      'Phone': '90px',
      'Branch': '70px',
      'Rating': '45px',
      'Status': '55px',
      'Platforms': '100px',
      'Services': '140px',
      'Highlights': '140px',
      'Served By': '65px',
      'Therapist': '65px',
      'Date': '90px',
      'Feedback': '150px'
    };

    let tableHTML = `
      <h1 style="font-size: 18px; margin-bottom: 5px;">${title}</h1>
      <p style="font-size: 10px; color: #666; margin-bottom: 15px;">Generated on: ${new Date().toLocaleDateString()}</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 9px; table-layout: fixed;">
        <thead>
          <tr style="background: #0d9488; color: white;">
            ${headers.map(h => `<th style="padding: 6px; border: 1px solid #ddd; text-align: left; width: ${columnWidths[h] || 'auto'}; white-space: nowrap;">${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${exportData.map((row, i) => `
            <tr style="background: ${i % 2 === 0 ? '#fff' : '#f5f5f5'};">
              ${headers.map(h => `<td style="padding: 5px; border: 1px solid #ddd; overflow: hidden; text-overflow: ellipsis;">${(row as any)[h] || ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    container.innerHTML = tableHTML;
    document.body.appendChild(container);

    try {
      // Render to canvas (preserves all fonts including Chinese)
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      // Create PDF from canvas
      const doc = new jsPDF('landscape');
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = doc.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Handle multi-page if content is taller than one page
      const pageHeight = doc.internal.pageSize.getHeight();
      let position = 0;

      if (pdfHeight <= pageHeight) {
        doc.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      } else {
        // Multi-page
        let heightLeft = pdfHeight;
        while (heightLeft > 0) {
          doc.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
          position -= pageHeight;
          if (heightLeft > 0) {
            doc.addPage();
          }
        }
      }

      doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    } finally {
      document.body.removeChild(container);
    }
  };

  return (
    <DashboardLayout
      activeSection={activeSection}
      onSectionChange={(section) => {
        if (section === 'settings') navigate('/admin/settings/qrcode');
        else if (section === 'reviews') navigate('/admin/reviews/verification');
        else navigate(`/admin/${section}`);
      }}
      alerts={{
        campaigns: mysteryGifts.some(g => g.stock <= g.threshold),
        settings: isGalleryDepleted
      }}
    >
      <div className="space-y-6">

        {/* Gallery Depletion Alert Banner */}
        {isGalleryDepleted && (
          <button
            onClick={() => {
              navigate('/admin/settings/image-gallery');
            }}
            className="w-full bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between text-left hover:bg-red-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-red-800">Image Gallery Depleted</p>
                <p className="text-sm text-red-600">All photos have been used. Customers won't see suggested images until you add more.</p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-red-400" />
          </button>
        )}

        {/* Header & Global Controls - Date filter only for data sections */}
        {((['dashboard', 'reviews', 'analytics'].includes(activeSection)) || (activeSection === 'campaigns' && activeCampaignTab !== 'mystery-gift')) && (
          <div className="flex flex-col md:flex-row justify-end items-start md:items-center gap-4">
            {/* Date Filter */}
            <div className="flex bg-gray-100 p-1 rounded-md items-center gap-2">
              {isLoadingStats && <RefreshCw className="w-3 h-3 animate-spin text-gray-400" />}
              {['today', 'week', 'month', 'all'].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTimeFilter(t as any);
                    setFilterKey(k => k + 1);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded transition-all duration-200 ${timeFilter === t ? 'bg-white shadow text-gray-900 scale-105' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- DASHBOARD SECTION --- */}
        {activeSection === 'dashboard' && (
          <div key={filterKey} className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <KPICard title="Total Reviews" value={totalReviews} icon={MessageSquare} color="blue" trend={timeFilter === 'today' ? "Today" : ""} onClick={() => navigate('/admin/reviews/verification')} />
                  <KPICard title="Visitors (Scans)" value={fetchedVisits} icon={Users} color="indigo" sub={`Conv: ${conversionRate}%`} />
                  <KPICard title="Avg Rating" value={avgRating.toFixed(1)} icon={Star} color="yellow" sub={`${totalReviews} reviews`} />
                  <KPICard title="Pending" value={pendingSubmissions.length} icon={Clock} color="purple" sub="Action needed" onClick={() => {
                    navigate('/admin/reviews/verification');
                    // Highlight the first pending submission
                    if (pendingSubmissions.length > 0) {
                      setHighlightedSubmissionId(pendingSubmissions[0].id);
                    }
                  }} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">Reviews by Branch</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={branchData.length ? branchData : [{ name: 'Main', reviews: 0 }]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="reviews" fill="#0d9488" radius={[4, 4, 0, 0]} name="Reviews" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4">Reviews by Platform</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PLATFORM_HEX[entry.name] || '#9CA3AF'} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* --- REVIEWS SECTION --- */}
        {activeSection === 'reviews' && (
          <div key={filterKey} className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="flex justify-between items-center">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                <button
                  onClick={() => navigate('/admin/reviews/verification')}
                  className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeReviewTab === 'verification'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Verification Queue
                  {pendingSubmissions.length > 0 && (
                    <span className="ml-2 bg-yellow-100 text-yellow-800 py-0.5 px-2 rounded-full text-xs">
                      {pendingSubmissions.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => navigate('/admin/reviews/feedback')}
                  className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${activeReviewTab === 'feedback'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Feedback & Complaints
                  {feedbackSubmissions.length > 0 && (
                    <span className="ml-2 bg-red-100 text-red-800 py-0.5 px-2 rounded-full text-xs">
                      {feedbackSubmissions.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Export Dropdown */}
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowExportMenu(showExportMenu === 'reviews' ? null : 'reviews');
                  }}
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
                {showExportMenu === 'reviews' && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        const data = activeReviewTab === 'verification' ? [...pendingSubmissions, ...verifiedHistory] : feedbackSubmissions;
                        exportToCSV(data, activeReviewTab === 'verification' ? 'reviews' : 'complaints');
                        setShowExportMenu(null);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      📄 Export as CSV
                    </button>
                    <button
                      onClick={() => {
                        const data = activeReviewTab === 'verification' ? [...pendingSubmissions, ...verifiedHistory] : feedbackSubmissions;
                        exportToXLSX(data, activeReviewTab === 'verification' ? 'reviews' : 'complaints');
                        setShowExportMenu(null);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      📊 Export as Excel
                    </button>
                    <button
                      onClick={() => {
                        const data = activeReviewTab === 'verification' ? [...pendingSubmissions, ...verifiedHistory] : feedbackSubmissions;
                        const title = activeReviewTab === 'verification' ? 'Reviews Report' : 'Complaints Report';
                        exportToPDF(data, activeReviewTab === 'verification' ? 'reviews' : 'complaints', title);
                        setShowExportMenu(null);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      📕 Export as PDF
                    </button>
                  </div>
                )}
              </div>
            </div>

            {activeReviewTab === 'verification' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Verification Queue</h3>
                    <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">{pendingSubmissions.length} Pending</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                          <th className="p-4">Customer</th>
                          <th className="p-4">Platform</th>
                          <th className="p-4">Proof</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Date</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {pendingSubmissions.length === 0 ? (
                          <tr><td colSpan={6} className="p-8 text-center text-gray-400">No pending verifications.</td></tr>
                        ) : pendingSubmissions.map(sub => (
                          <tr
                            key={sub.id}
                            id={`submission-${sub.id}`}
                            className={`hover:bg-gray-50 transition-colors duration-500 ${highlightedSubmissionId === sub.id ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}`}
                          >
                            <td className="p-4 font-medium">{sub.customerName || 'Anonymous'}</td>
                            <td className="p-4">
                              <div className="flex gap-1">
                                {sub.platformsSelected?.map(p => (
                                  <span key={p} className={`text-xs px-2 py-1 rounded-md font-medium ${PLATFORM_COLORS[p] || 'bg-gray-100 text-gray-600'}`}>
                                    {p}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="p-4">
                              {sub.proofs?.map((proof: any, i: number) => (
                                proof.type === 'image' || proof.hasImage ? (
                                  <button key={i} onClick={() => viewProofImage(sub.id, i)} className="flex items-center gap-1 text-blue-600 hover:underline">
                                    <ImageIcon className="w-4 h-4" /> {isLoadingProof ? 'Loading...' : 'View Image'}
                                  </button>
                                ) : proof.type === 'link' ? (
                                  <a key={i} href={proof.content} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline block truncate max-w-[150px]">{proof.content}</a>
                                ) : null
                              ))}
                            </td>
                            <td className="p-4"><span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">Pending</span></td>
                            <td className="p-4 text-xs text-gray-500">{formatDate(sub.timestamp)}</td>
                            <td className="p-4 text-right space-x-2">
                              <Button size="sm" className="bg-green-600 text-xs h-8" onClick={() => updateSubmissionStatus(sub.id, 'Verified')}>Approve</Button>
                              <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => updateSubmissionStatus(sub.id, 'Rejected')}>Reject</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Verification History */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden opacity-80">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-500">History</h3>
                  </div>
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium">
                      <tr>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Platform</th>
                        <th className="p-4">Proof</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {verifiedHistory.length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center text-gray-400">No history yet.</td></tr>
                      ) : verifiedHistory.slice(0, 10).map(sub => (
                        <tr
                          key={sub.id}
                          id={`submission-${sub.id}`}
                          className={`hover:bg-gray-50 text-gray-500 transition-colors duration-500 ${highlightedSubmissionId === sub.id ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''}`}
                        >
                          <td className="p-4 font-medium">{sub.customerName || 'Anonymous'}</td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              {sub.platformsSelected?.map(p => (
                                <span key={p} className={`text-xs px-2 py-1 rounded-md font-medium ${PLATFORM_COLORS[p] || 'bg-gray-100 text-gray-600'}`}>
                                  {p}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4">
                            {sub.proofs?.map((proof: any, i: number) => (
                              proof.type === 'image' || proof.hasImage ? (
                                <button key={i} onClick={() => viewProofImage(sub.id, i)} className="flex items-center gap-1 text-blue-600 hover:underline">
                                  <ImageIcon className="w-4 h-4" /> {isLoadingProof ? 'Loading...' : 'View'}
                                </button>
                              ) : null
                            ))}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${sub.status === 'Verified' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="p-4 text-xs">{formatDate(sub.timestamp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeReviewTab === 'feedback' && (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Feedback & Complaints (1-3 Stars)</h3>
                  </div>
                  <table className="w-full text-sm text-left">
                    <thead className="bg-red-50 text-red-700 font-medium">
                      <tr>
                        <th className="p-4">Rating</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Feedback</th>
                        <th className="p-4">Staff Mentioned</th>
                        <th className="p-4">Date</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {feedbackSubmissions.length === 0 ? (
                        <tr><td colSpan={6} className="p-8 text-center text-gray-400">No complaints. Good job!</td></tr>
                      ) : feedbackSubmissions.map(sub => (
                        <tr key={sub.id} className="hover:bg-gray-50">
                          <td className="p-4 text-red-600 font-bold">{sub.rating} ★</td>
                          <td className="p-4 font-medium">{sub.customerName || 'Anonymous'}</td>
                          <td className="p-4 text-gray-600 w-1/3">{sub.feedback || 'No written feedback'}</td>
                          <td className="p-4">{sub.staffName || sub.staffId} {sub.therapistId && `/ ${sub.therapistName || sub.therapistId}`}</td>
                          <td className="p-4 text-gray-400">{formatDate(sub.timestamp)}</td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => updateSubmissionStatus(sub.id, 'Archived')}
                              className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                              title="Archive"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {archivedFeedback.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden opacity-75 mt-6">
                    <div className="p-6 border-b border-gray-100">
                      <h3 className="text-lg font-bold text-gray-500 flex items-center gap-2">
                        <Archive className="w-4 h-4" /> Archived History
                      </h3>
                    </div>
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                          <th className="p-4">Rating</th>
                          <th className="p-4">Customer</th>
                          <th className="p-4">Feedback</th>
                          <th className="p-4">Staff Mentioned</th>
                          <th className="p-4">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-500">
                        {archivedFeedback.map(sub => (
                          <tr key={sub.id} className="hover:bg-gray-50">
                            <td className="p-4 font-bold">{sub.rating} ★</td>
                            <td className="p-4 font-medium">{sub.customerName || 'Anonymous'}</td>
                            <td className="p-4 w-1/3">{sub.feedback || 'No written feedback'}</td>
                            <td className="p-4">{sub.staffName || sub.staffId} {sub.therapistId && `/ ${sub.therapistName || sub.therapistId}`}</td>
                            <td className="p-4 text-xs">{formatDate(sub.timestamp)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* --- CAMPAIGNS SECTION --- */}
        {activeSection === 'campaigns' && (
          <div key={filterKey} className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
            {/* Tab Navigation */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                <button
                  onClick={() => setActiveCampaignTab('lucky-draw')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeCampaignTab === 'lucky-draw' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Ticket className="w-4 h-4" /> Lucky Draw
                  {luckyDrawEntries.length > 0 && <span className="bg-indigo-100 text-indigo-600 text-xs px-1.5 py-0.5 rounded-full">{luckyDrawEntries.length}</span>}
                </button>
                <button
                  onClick={() => setActiveCampaignTab('mystery-gift')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeCampaignTab === 'mystery-gift' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  <Gift className="w-4 h-4" /> Mystery Gift
                  {mysteryGifts.some(g => g.stock <= g.threshold) && <span className="bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full">!</span>}
                </button>
              </div>
            </div>

            {/* Lucky Draw Tab */}
            {activeCampaignTab === 'lucky-draw' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900">Lucky Draw Entries</h3>
                </div>
                <table className="w-full text-sm text-left">
                  <thead className="bg-indigo-50 text-indigo-700 font-medium">
                    <tr>
                      <th className="p-4">Ticket ID</th>
                      <th className="p-4">Phone Number</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Entries</th>
                      <th className="p-4">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {luckyDrawEntries.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-gray-400">No entries yet.</td></tr>
                    ) : luckyDrawEntries.map(sub => (
                      <tr key={sub.id} className="hover:bg-gray-50">
                        <td className="p-4 font-mono font-bold text-indigo-600">{sub.luckyDrawTicket}</td>
                        <td className="p-4 font-bold">{sub.phone || '-'}</td>
                        <td className="p-4">{sub.customerName || 'Anonymous'}</td>
                        <td className="p-4">
                          <button
                            onClick={() => {
                              navigate('/admin/reviews/verification');
                              setHighlightedSubmissionId(sub.id);
                            }}
                            className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs font-bold hover:bg-indigo-200 transition-colors"
                          >
                            {1 + (sub.bonusEntries || 0)} Entries
                          </button>
                        </td>
                        <td className="p-4 text-gray-400">{formatDate(sub.timestamp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Mystery Gift Tab */}
            {activeCampaignTab === 'mystery-gift' && (
              <div className="space-y-6">
                {/* Header with Add Button */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Mystery Gift Inventory</h3>
                    <p className="text-sm text-gray-500">Track your gifts and get notified when stock runs low.</p>
                  </div>
                  <Button
                    className="flex items-center gap-2"
                    onClick={() => setEditingGift({ name: '', image: null, stock: 0, threshold: 5 })}
                  >
                    <Gift className="w-4 h-4" /> Add Gift
                  </Button>
                </div>

                {/* Gift Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {mysteryGifts.length === 0 ? (
                    <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
                      <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No mystery gifts configured yet.</p>
                      <p className="text-sm">Add your first gift to start tracking inventory.</p>
                    </div>
                  ) : mysteryGifts.map(gift => (
                    <div key={gift.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden ${gift.stock <= gift.threshold ? 'border-red-300' : 'border-gray-100'}`}>
                      {/* Gift Image */}
                      <div className="aspect-square w-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center relative">
                        {gift.image ? (
                          <img src={gift.image} alt={gift.name} className="h-full w-full object-cover absolute inset-0" />
                        ) : (
                          <Gift className="w-16 h-16 text-indigo-300" />
                        )}
                      </div>
                      {/* Gift Info */}
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-gray-900 truncate pr-2" title={gift.name}>{gift.name}</h4>
                          {gift.stock <= gift.threshold && (
                            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-bold whitespace-nowrap">Low Stock!</span>
                          )}
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                          <div className="bg-gray-50 rounded-lg p-2">
                            <p className={`text-xl font-bold ${gift.stock <= gift.threshold ? 'text-red-600' : 'text-gray-900'}`}>{gift.stock}</p>
                            <p className="text-xs text-gray-500">In Stock</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-2">
                            <p className="text-xl font-bold text-green-600">{gift.given_out}</p>
                            <p className="text-xs text-gray-500">Given Out</p>
                          </div>
                          <div className="bg-yellow-50 rounded-lg p-2">
                            <p className="text-xl font-bold text-yellow-600">{gift.threshold}</p>
                            <p className="text-xs text-gray-500">Threshold</p>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setEditingGift({ id: gift.id, name: gift.name, image: gift.image, stock: gift.stock, threshold: gift.threshold })}
                          >
                            <Pencil className="w-3 h-3 mr-1" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={async () => {
                              if (window.confirm(`Delete "${gift.name}"?`)) {
                                const token = localStorage.getItem('auth_token');
                                await fetch(`/api/mystery-gifts/${gift.id}`, {
                                  method: 'DELETE',
                                  headers: { 'Authorization': `Bearer ${token}` }
                                });
                                fetchMysteryGifts();
                              }
                            }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Stats */}
                {mysteryGifts.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <p className="text-3xl font-bold text-gray-900">{mysteryGifts.reduce((acc, g) => acc + g.stock, 0)}</p>
                        <p className="text-sm text-gray-500">Total In Stock</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-green-600">{mysteryGifts.reduce((acc, g) => acc + g.given_out, 0)}</p>
                        <p className="text-sm text-gray-500">Total Given Out</p>
                      </div>
                      <div>
                        <p className="text-3xl font-bold text-red-600">{mysteryGifts.filter(g => g.stock <= g.threshold).length}</p>
                        <p className="text-sm text-gray-500">Low Stock Items</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Add/Edit Gift Modal */}
            {editingGift && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingGift(null)}>
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">{editingGift.id ? 'Edit Gift' : 'Add New Gift'}</h3>
                    <button onClick={() => setEditingGift(null)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Gift Image Upload */}
                  {/* Gift Image Upload */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Gift Image</label>
                    {selectedImage ? (
                      <div className="relative h-64 bg-black rounded-lg overflow-hidden mb-4">
                        <Cropper
                          image={selectedImage}
                          crop={crop}
                          zoom={zoom}
                          aspect={1}
                          onCropChange={setCrop}
                          onZoomChange={setZoom}
                          onCropComplete={onCropComplete}
                        />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 z-50 w-full justify-center px-4">
                          <Button size="sm" onClick={async () => {
                            const cropped = await getCroppedImg(selectedImage, croppedAreaPixels);
                            if (cropped) {
                              setEditingGift({ ...editingGift, image: cropped }); // Cast if needed
                              setSelectedImage(null);
                            }
                          }}>
                            <Check className="w-4 h-4 mr-1" /> Crop & Save
                          </Button>
                          <Button size="sm" variant="outline" className="bg-white border-none hover:bg-gray-100 text-gray-900" onClick={() => setSelectedImage(null)}>
                            <X className="w-4 h-4 mr-1" /> Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden text-center border border-gray-200 border-dashed">
                        {editingGift.image ? (
                          <>
                            <img src={editingGift.image} alt="Gift" className="h-full w-full object-cover" />
                            <button
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                              onClick={() => setEditingGift({ ...editingGift, image: null })}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center">
                            <Upload className="w-8 h-8 text-gray-400" />
                            <span className="text-sm text-gray-500">Upload Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => setSelectedImage(reader.result as string);
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Gift Name */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gift Name</label>
                    <input
                      type="text"
                      value={editingGift.name}
                      onChange={(e) => setEditingGift({ ...editingGift, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="e.g., Mystery Gift Box"
                    />
                  </div>

                  {/* Stock and Threshold */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stock Count</label>
                      <input
                        type="number"
                        value={editingGift.stock}
                        onChange={(e) => setEditingGift({ ...editingGift, stock: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                      <input
                        type="number"
                        value={editingGift.threshold}
                        onChange={(e) => setEditingGift({ ...editingGift, threshold: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setEditingGift(null)}>
                      Cancel
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={async () => {
                        try {
                          if (!editingGift.name) {
                            alert("Please enter a gift name");
                            return;
                          }

                          let response;
                          // --- FIX: Use relative path instead of hardcoded localhost ---
                          // const API_BASE = 'http://127.0.0.1:3005';

                          const token = localStorage.getItem('auth_token');

                          if (editingGift.id) {
                            // Update existing
                            response = await fetch(`/api/mystery-gifts/${editingGift.id}`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify(editingGift)
                            });
                          } else {
                            // Create new
                            response = await fetch(`/api/mystery-gifts`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify(editingGift)
                            });
                          }

                          if (response.ok) {
                            await fetchMysteryGifts();
                            setEditingGift(null);
                          } else {
                            const text = await response.text();
                            try {
                              const errData = JSON.parse(text);
                              alert(`Failed to save gift: ${errData.error || 'Unknown error'}`);
                            } catch (e) {
                              console.error("Server raw response:", text);
                              alert(`Failed to save gift. Server returned non-JSON response: ${text.substring(0, 150)}...`);
                            }
                          }
                        } catch (error: any) {
                          console.error("Failed to save gift:", error);
                          alert(`Failed to save gift. Error: ${error.message || error}`);
                        }
                      }}
                    >
                      <Save className="w-4 h-4 mr-1" /> {editingGift.id ? 'Save Changes' : 'Add Gift'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- ANALYTICS SECTION --- */}
        {activeSection === 'analytics' && (
          <div key={filterKey} className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-[fadeIn_0.3s_ease-out]">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Top Staff / Therapists</h3>
              <div className="space-y-4">
                {topStaff.map((staff, i) => (
                  <div key={staff.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' :
                        i === 1 ? 'bg-gray-200 text-gray-700' :
                          i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-white border'
                        }`}>
                        {i + 1}
                      </span>
                      <span className="font-medium">{staff.name}</span>
                    </div>
                    <span className="font-bold text-gray-900">{staff.reviews} mentions</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Customer Favorites</h3>

              <div className="space-y-6">
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Most Popular Services</p>
                  <div className="flex flex-wrap gap-2">
                    {topServices.length === 0 ? <p className="text-gray-400 text-sm">No data yet.</p> : topServices.map(([s, count]) => (
                      <span key={s} className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100 flex items-center gap-1">
                        {s} <span className="bg-green-200 text-green-800 px-1 rounded-full text-[10px]">{count}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">What Stood Out</p>
                  <div className="flex flex-wrap gap-2">
                    {topHighlights.length === 0 ? <p className="text-gray-400 text-sm">No data yet.</p> : topHighlights.map(([h, count]) => (
                      <span key={h} className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-100 flex items-center gap-1">
                        {h} <span className="bg-purple-200 text-purple-800 px-1 rounded-full text-[10px]">{count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- SETTINGS SECTION (QR Code & Admin) --- */}
        {activeSection === 'settings' && (
          <div className="space-y-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
              <button
                onClick={() => navigate('/admin/settings/qrcode')}
                className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeSettingsTab === 'qrcode'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                QR Code & Link
              </button>
              <button
                onClick={() => navigate('/admin/settings/admin-controls')}
                className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeSettingsTab === 'admin'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Admin Controls
              </button>
              <button
                onClick={() => navigate('/admin/settings/staff')}
                className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeSettingsTab === 'staff'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Staff Management
              </button>
              <button
                onClick={() => navigate('/admin/settings/ai-configuration')}
                className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeSettingsTab === 'ai-config'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                AI Configuration
              </button>
              <button
                onClick={() => navigate('/admin/settings/image-gallery')}
                className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeSettingsTab === 'gallery'
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Image Gallery
              </button>
            </div>

            {activeSettingsTab === 'qrcode' && (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                <div className="bg-white p-4 border-4 border-black rounded-lg mb-6">
                  <QRCodeSVG value={customerAppUrl} size={256} level="H" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Scan to Review & Win!</h2>
                <p className="text-gray-500 mb-4">Display this at your counter for customers to scan.</p>

                {/* URL Input */}
                <div className="w-full max-w-md mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-left">Customer App URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customerAppUrl}
                      onChange={(e) => setCustomerAppUrl(e.target.value)}
                      placeholder="https://yourdomain.com/review"
                      className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1 text-left">Update this when you have your own domain.</p>
                </div>

                <div className="flex gap-4">
                  <Button onClick={() => window.print()} variant="outline">Print QR Code</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(customerAppUrl);
                      setLinkCopied(true);
                      setTimeout(() => setLinkCopied(false), 2000);
                    }}
                    className="flex items-center gap-2"
                  >
                    {linkCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                    {linkCopied ? 'Copied!' : 'Copy Link'}
                  </Button>
                </div>
              </div>
            )}

            {/* Staff Management Tab */}
            {activeSettingsTab === 'staff' && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease-out]">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-gray-800">Staff & Therapists</h3>
                    <Button onClick={() => setEditingStaff({ id: `new-${Date.now()}`, name: '', role: 'staff', branchId: branches[0]?.id || '' })}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Staff
                    </Button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                        <tr>
                          <th className="p-3">Name</th>
                          <th className="p-3">Role</th>
                          <th className="p-3">Branch</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {staffList.map(s => (
                          <tr key={s.id} className="hover:bg-gray-50 group transition-colors">
                            <td className="p-3 font-medium text-gray-900">{s.name}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.role === 'therapist' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                {s.role.charAt(0).toUpperCase() + s.role.slice(1)}
                              </span>
                            </td>
                            <td className="p-3 text-gray-500">
                              {branches.find(b => b.id === s.branchId)?.name || s.branchId}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => setEditingStaff(s)}
                                  className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-900"
                                >
                                  <PenTool className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStaff(s.id)}
                                  className="p-1 hover:bg-red-100 rounded text-red-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {staffList.length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-gray-400">
                              No staff found. Add one to get started.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Staff Edit Modal */}
            {editingStaff && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
                >
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg">{editingStaff.id.startsWith('new-') ? 'Add Staff' : 'Edit Staff'}</h3>
                    <button onClick={() => setEditingStaff(null)} className="p-2 hover:bg-gray-100 rounded-full">
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={editingStaff.name}
                        onChange={e => setEditingStaff({ ...editingStaff, name: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="e.g. Sarah"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setEditingStaff({ ...editingStaff, role: 'staff' })}
                          className={`p-2 rounded-lg border text-sm font-medium transition-colors ${editingStaff.role === 'staff' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                          Staff (Service)
                        </button>
                        <button
                          onClick={() => setEditingStaff({ ...editingStaff, role: 'therapist' })}
                          className={`p-2 rounded-lg border text-sm font-medium transition-colors ${editingStaff.role === 'therapist' ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                          Therapist
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                      <div className="space-y-2">
                        {branches.map(b => (
                          <label key={b.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="radio"
                              name="branch"
                              checked={editingStaff.branchId === b.id}
                              onChange={() => setEditingStaff({ ...editingStaff, branchId: b.id })}
                              className="mr-3"
                            />
                            <span className="text-gray-900 font-medium">{b.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-gray-50 flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setEditingStaff(null)}>Cancel</Button>
                    <Button onClick={handleSaveStaff} disabled={!editingStaff.name}>Save Staff</Button>
                  </div>
                </motion.div>
              </div>
            )}

            {activeSettingsTab === 'admin' && (
              <div className="max-w-2xl mx-auto space-y-6">
                {/* User Management - Now First */}
                {/* Branch Management */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-600" />
                    Branch Management
                  </h2>

                  {branches.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No branches found.</p>
                  ) : (
                    <div className="space-y-3">
                      {branches.map(branch => (
                        <div key={branch.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <span className="font-medium text-gray-900">{branch.name}</span>
                          <button
                            onClick={() => handleDeleteBranch(branch.id, branch.name)}
                            className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete Branch"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-brand-600" />
                    User Management
                  </h2>

                  {usersList.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">No users found.</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                          <th className="p-3 text-left">Username</th>
                          <th className="p-3 text-left">Role</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {usersList.map(user => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="p-3 font-medium">{user.username}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                user.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </span>
                            </td>
                            <td className="p-3 text-right flex justify-end gap-1">
                              <button
                                onClick={() => setEditingUser({ ...user, password: '', profilePic: user.profile_pic || null })}
                                className="text-blue-400 hover:text-blue-600 p-1 hover:bg-blue-50 rounded transition-colors"
                                title="Edit User"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm(`Delete user "${user.username}"?`)) {
                                    await fetch(`/api/users/${user.id}`, {
                                      method: 'DELETE',
                                      headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
                                    });
                                    fetchUsers();
                                  }
                                }}
                                className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Create User Card - Now Second */}
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-brand-600" />
                    Create New User
                  </h2>

                  {userMsg && <div className={`p-3 rounded-md mb-4 text-sm font-medium ${userMsg.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{userMsg}</div>}

                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        required
                        value={newUser.username}
                        onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={newUser.password}
                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        value={newUser.role}
                        onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                      >
                        <option value="staff">Staff (View Only)</option>
                        <option value="manager">Manager (Approve/Reject)</option>
                        <option value="admin">Admin (Full Access)</option>
                      </select>
                    </div>
                    <Button type="submit" className="w-full">Create User</Button>
                  </form>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 p-8 rounded-xl border border-red-100">
                  <h2 className="text-xl font-bold mb-2 text-red-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Danger Zone
                  </h2>
                  <p className="text-red-600 mb-6">These actions are irreversible. Proceed with caution.</p>

                  <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-red-200">
                    <div>
                      <h3 className="font-bold text-gray-900">Clear All Data</h3>
                      <p className="text-sm text-gray-500">Permanently delete all submissions and visit records.</p>
                    </div>
                    <Button
                      variant="primary"
                      className="bg-red-600 hover:bg-red-700 border-transparent text-white"
                      onClick={() => {
                        const confirm = window.prompt("Type 'DELETE' to confirm clearing all data. This cannot be undone.");
                        if (confirm === 'DELETE') {
                          fetch('/api/admin/clear-data', {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
                          })
                            .then(res => res.json())
                            .then(data => {
                              if (data.success) {
                                alert("All data cleared successfully.");
                                window.location.reload();
                              } else {
                                alert("Failed to clear data.");
                              }
                            });
                        }
                      }}
                    >
                      Clear Data
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditingUser(null)}>
                <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <User className="w-5 h-5 text-brand-600" />
                      Edit User
                    </h2>
                    <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Profile Picture */}
                  <div className="flex flex-col items-center mb-6">
                    {editingUser.profilePic ? (
                      <img src={editingUser.profilePic} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-gray-100 mb-3" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-2xl font-bold mb-3">
                        {editingUser.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <label className="cursor-pointer text-sm text-brand-600 hover:text-brand-700 font-medium">
                      Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setEditingUser({ ...editingUser, profilePic: ev.target?.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        value={editingUser.username}
                        onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
                      <input
                        type="password"
                        value={editingUser.password}
                        onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        placeholder="••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        value={editingUser.role}
                        onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                        className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                      >
                        <option value="staff">Staff (View Only)</option>
                        <option value="manager">Manager (Approve/Reject)</option>
                        <option value="admin">Admin (Full Access)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setEditingUser(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 flex items-center justify-center gap-2"
                      onClick={async () => {
                        // Save to backend
                        const updates: any = { username: editingUser.username, role: editingUser.role };
                        if (editingUser.password) updates.password = editingUser.password;
                        if (editingUser.profilePic) updates.profile_pic = editingUser.profilePic;

                        await fetch(`/api/users/${editingUser.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(updates)
                        });

                        // If editing current user, update localStorage
                        if (editingUser.username === currentUsername || editingUser.id === localStorage.getItem('user_id')) {
                          localStorage.setItem('username', editingUser.username);
                          if (editingUser.profilePic) {
                            localStorage.setItem('profile_pic', editingUser.profilePic);
                            setProfilePic(editingUser.profilePic);
                          }
                          // Trigger header update
                          window.dispatchEvent(new Event('profileUpdated'));
                        }

                        fetchUsers();
                        setEditingUser(null);
                      }}
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* AI Configuration Tab */}
            {activeSettingsTab === 'ai-config' && (
              <div className="space-y-6">
                {isLoadingAiConfig ? (
                  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
                    <span className="ml-2 text-gray-500">Loading AI Configuration...</span>
                  </div>
                ) : aiConfig ? (
                  <>
                    {/* Model Selection */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Bot className="w-5 h-5 text-brand-600" />
                        AI Model Settings
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                          <select
                            value={aiConfig.model_name}
                            onChange={e => setAiConfig({ ...aiConfig, model_name: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg bg-white"
                          >
                            <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite (Fastest)</option>
                          </select>
                          <p className="text-xs text-gray-400 mt-1">Select the AI model for generating reviews</p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Temperature: {aiConfig.temperature.toFixed(2)}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={aiConfig.temperature}
                            onChange={e => setAiConfig({ ...aiConfig, temperature: parseFloat(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
                          />
                          <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>More Focused (0.0)</span>
                            <span>More Creative (1.0)</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Selling Points */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 className="text-lg font-bold mb-4">Selling Points</h3>
                      <p className="text-sm text-gray-500 mb-4">These will be mentioned in the generated reviews to highlight your business strengths.</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {aiConfig.selling_points.map((point, idx) => (
                          <span key={idx} className="px-3 py-1.5 bg-brand-50 text-brand-700 text-sm font-medium rounded-full border border-brand-200 flex items-center gap-2">
                            {point}
                            <button
                              onClick={() => setAiConfig({
                                ...aiConfig,
                                selling_points: aiConfig.selling_points.filter((_, i) => i !== idx)
                              })}
                              className="text-brand-400 hover:text-red-500"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newSellingPoint}
                          onChange={e => setNewSellingPoint(e.target.value)}
                          placeholder="Add a selling point..."
                          className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                          onKeyDown={e => {
                            if (e.key === 'Enter' && newSellingPoint.trim()) {
                              setAiConfig({
                                ...aiConfig,
                                selling_points: [...aiConfig.selling_points, newSellingPoint.trim()]
                              });
                              setNewSellingPoint('');
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (newSellingPoint.trim()) {
                              setAiConfig({
                                ...aiConfig,
                                selling_points: [...aiConfig.selling_points, newSellingPoint.trim()]
                              });
                              setNewSellingPoint('');
                            }
                          }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Knowledgebase */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-bold flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-brand-600" />
                            Knowledgebase
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">Add detailed information about your products/services to enhance AI-generated reviews.</p>
                        </div>
                        <Button
                          onClick={() => setEditingKnowledge({ category: 'service', title: '', content: '', tags: [] })}
                          className="flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add Entry
                        </Button>
                      </div>

                      {isLoadingKnowledge ? (
                        <div className="text-center py-8 text-gray-400">Loading...</div>
                      ) : knowledgeEntries.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                          <BookOpen className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                          <p className="text-gray-400 text-sm">No knowledge entries yet</p>
                          <p className="text-gray-400 text-xs mt-1">Add product/service details for richer reviews</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {['service', 'product', 'about', 'general'].map(category => {
                            const categoryEntries = knowledgeEntries.filter(e => e.category === category);
                            if (categoryEntries.length === 0) return null;
                            return (
                              <div key={category}>
                                <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">
                                  {category === 'service' ? 'Services' : category === 'product' ? 'Products' : category === 'about' ? 'Brand Info' : 'General'}
                                </h4>
                                <div className="space-y-2">
                                  {categoryEntries.map(entry => (
                                    <div key={entry.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-start justify-between group">
                                      <div className="flex-1 min-w-0">
                                        <h5 className="font-medium text-gray-900 truncate">{entry.title}</h5>
                                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{entry.content || 'No description'}</p>
                                        {entry.tags.length > 0 && (
                                          <div className="flex flex-wrap gap-1 mt-2">
                                            {entry.tags.map((tag, i) => (
                                              <span key={i} className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">{tag}</span>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => setEditingKnowledge({
                                            id: entry.id,
                                            category: entry.category,
                                            title: entry.title,
                                            content: entry.content,
                                            tags: entry.tags
                                          })}
                                          className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded"
                                        >
                                          <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => deleteKnowledgeEntry(entry.id)}
                                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Knowledgebase Edit Modal */}
                    {editingKnowledge && (
                      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditingKnowledge(null)}>
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                          <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold">{editingKnowledge.id ? 'Edit' : 'Add'} Knowledge Entry</h3>
                          </div>
                          <div className="p-6 space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                              <select
                                value={editingKnowledge.category}
                                onChange={e => setEditingKnowledge({ ...editingKnowledge, category: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded-lg bg-white"
                              >
                                <option value="service">Service</option>
                                <option value="product">Product</option>
                                <option value="about">Brand Info</option>
                                <option value="general">General</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                              <input
                                type="text"
                                value={editingKnowledge.title}
                                onChange={e => setEditingKnowledge({ ...editingKnowledge, title: e.target.value })}
                                placeholder="e.g., Glacial Hydration Management"
                                className="w-full p-2 border border-gray-300 rounded-lg"
                              />
                              <p className="text-xs text-gray-400 mt-1">Use the exact service/product name for automatic matching</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Description / Details</label>
                              <textarea
                                value={editingKnowledge.content}
                                onChange={e => setEditingKnowledge({ ...editingKnowledge, content: e.target.value })}
                                rows={8}
                                placeholder="Describe the product/service in detail. Include benefits, unique features, ingredients, duration, results, etc."
                                className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (for matching)</label>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {editingKnowledge.tags.map((tag, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full flex items-center gap-1">
                                    {tag}
                                    <button
                                      onClick={() => setEditingKnowledge({
                                        ...editingKnowledge,
                                        tags: editingKnowledge.tags.filter((_, i) => i !== idx)
                                      })}
                                      className="text-gray-400 hover:text-red-500"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newKnowledgeTag}
                                  onChange={e => setNewKnowledgeTag(e.target.value)}
                                  placeholder="Add tag..."
                                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                                  onKeyDown={e => {
                                    if (e.key === 'Enter' && newKnowledgeTag.trim()) {
                                      setEditingKnowledge({
                                        ...editingKnowledge,
                                        tags: [...editingKnowledge.tags, newKnowledgeTag.trim()]
                                      });
                                      setNewKnowledgeTag('');
                                    }
                                  }}
                                />
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    if (newKnowledgeTag.trim()) {
                                      setEditingKnowledge({
                                        ...editingKnowledge,
                                        tags: [...editingKnowledge.tags, newKnowledgeTag.trim()]
                                      });
                                      setNewKnowledgeTag('');
                                    }
                                  }}
                                >
                                  Add
                                </Button>
                              </div>
                              <p className="text-xs text-gray-400 mt-1">Tags help match this entry to customer selections</p>
                            </div>
                          </div>
                          <div className="p-6 border-t border-gray-100 flex gap-3 justify-end">
                            <Button variant="outline" onClick={() => setEditingKnowledge(null)}>Cancel</Button>
                            <Button onClick={saveKnowledgeEntry} className="flex items-center gap-2">
                              <Save className="w-4 h-4" />
                              {editingKnowledge.id ? 'Save Changes' : 'Add Entry'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* System Prompt */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                      <h3 className="text-lg font-bold mb-4">System Prompt</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        This is the core instruction that guides the AI on how to generate reviews. Customize the tone, style, and rules here.
                      </p>

                      <textarea
                        value={aiConfig.system_prompt}
                        onChange={e => setAiConfig({ ...aiConfig, system_prompt: e.target.value })}
                        rows={20}
                        className="w-full p-4 border border-gray-300 rounded-lg font-mono text-sm leading-relaxed bg-gray-50"
                        placeholder="Enter your system prompt..."
                      />
                      <p className="text-xs text-gray-400 mt-2">
                        Tip: Use clear sections like RULES, TONE, CONTENT REQUIREMENTS to organize the prompt.
                      </p>
                    </div>

                    {/* Save / Reset Buttons */}
                    <div className="flex gap-4 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (confirm('Reset to default configuration? This will overwrite your current settings.')) {
                            fetchAiConfig();
                          }
                        }}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reset to Default
                      </Button>
                      <Button
                        onClick={saveAiConfig}
                        disabled={isSavingAiConfig}
                        className="flex items-center gap-2"
                      >
                        {isSavingAiConfig ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Configuration
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-gray-500">Failed to load AI configuration. Please try again.</p>
                    <Button onClick={fetchAiConfig} className="mt-4">Retry</Button>
                  </div>
                )}
              </div>
            )}

            {/* Image Gallery Tab */}
            {activeSettingsTab === 'gallery' && (
              <div className="space-y-6">
                {/* Header with Upload Button */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <Images className="w-5 h-5 text-brand-600" />
                        Image Gallery
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Upload photos to use when customers don't provide their own images for reviews.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        ref={galleryFileInputRef}
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files && e.target.files.length > 0) {
                            uploadGalleryImage(e.target.files);
                          }
                          e.target.value = '';
                        }}
                      />
                      <select
                        value={newImageCategory}
                        onChange={e => setNewImageCategory(e.target.value)}
                        className="text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white"
                      >
                        <option value="general">General</option>
                        <option value="treatment">Treatment</option>
                        <option value="result">Result</option>
                        <option value="interior">Interior</option>
                        <option value="product">Product</option>
                      </select>
                      <Button
                        onClick={() => galleryFileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="flex items-center gap-2"
                      >
                        {isUploadingImage ? (
                          <><RefreshCw className="w-4 h-4 animate-spin" /> Uploading...</>
                        ) : (
                          <><Upload className="w-4 h-4" /> Upload Image(s)</>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div className="flex gap-2 mb-4">
                    {['all', 'treatment', 'result', 'interior', 'product', 'general'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setGalleryFilter(cat)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${galleryFilter === cat
                          ? 'bg-brand-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* Image Grid */}
                  {isLoadingGallery ? (
                    <div className="text-center py-12 text-gray-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading gallery...
                    </div>
                  ) : galleryImages.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                      <Images className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-400">No images in gallery yet</p>
                      <p className="text-gray-400 text-sm mt-1">Upload images to use in customer reviews</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {galleryImages
                        .filter(img => galleryFilter === 'all' || img.category === galleryFilter)
                        .map(img => (
                          <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                            <img
                              src={img.url}
                              alt={img.original_name}
                              className="w-full h-full object-cover"
                            />
                            {/* Overlay with delete and reset buttons */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              {img.use_count > 0 && (
                                <button
                                  onClick={() => resetGalleryCount(img.id)}
                                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                                  title="Reset count"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteGalleryImage(img.id)}
                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                            {/* Category badge */}
                            <div className="absolute top-2 left-2">
                              <span className="px-2 py-0.5 bg-black/50 text-white text-xs rounded-full">
                                {img.category}
                              </span>
                            </div>
                            {/* Use count badge */}
                            {img.use_count > 0 && (
                              <div className="absolute top-2 right-2">
                                <span className={`px-2 py-0.5 text-white text-xs rounded-full font-medium ${!allowMultipleUses && img.use_count >= 1 ? 'bg-red-500' : 'bg-brand-500'}`}>
                                  Used {img.use_count}x
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Settings & Stats */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                  {/* Toggle for allow multiple uses */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Allow Multiple Uses</p>
                      <p className="text-xs text-gray-500">When off, each photo can only be used once</p>
                    </div>
                    <button
                      onClick={toggleAllowMultipleUses}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${allowMultipleUses ? 'bg-brand-500' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${allowMultipleUses ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Stats row */}
                  {galleryImages.length > 0 && (
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-500">
                        <strong>{galleryImages.length}</strong> images
                        {' '}• <strong>{galleryImages.filter(img => (img.use_count || 0) === 0).length}</strong> unused
                        {' '}• <strong>{galleryImages.reduce((sum, img) => sum + (img.use_count || 0), 0)}</strong> total uses
                      </p>
                      {galleryImages.some(img => img.use_count > 0) && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (confirm('Reset usage counts for all images?')) {
                              resetGalleryCount();
                            }
                          }}
                          className="text-sm"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" /> Reset All Counts
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Image Modal */}
        {selectedProof && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setSelectedProof(null)}>
            <div className="relative max-w-4xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
              <img src={selectedProof.url} alt="Proof" className="max-w-full max-h-[80vh] rounded-lg shadow-2xl mb-4" />
              <div className="flex gap-4">
                <a
                  href={selectedProof.url}
                  download={`proof-${Date.now()}.png`}
                  className="bg-white text-gray-900 px-6 py-2 rounded-full font-bold hover:bg-gray-100 flex items-center gap-2"
                  onClick={e => e.stopPropagation()}
                >
                  <ImageIcon className="w-4 h-4" /> Download Image
                </a>
                <button
                  onClick={() => setSelectedProof(null)}
                  className="bg-gray-800 text-white px-6 py-2 rounded-full font-bold hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout >
  );
};

const KPICard = ({ title, value, icon: Icon, color, sub, trend, onClick }: any) => {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    purple: 'bg-indigo-50 text-indigo-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };
  return (
    <div
      className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 ${onClick ? 'cursor-pointer hover:shadow-md hover:border-gray-200 transition-all' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${colors[color] || colors.blue}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {(sub || trend) && (
        <p className={`text-xs mt-2 font-medium ${trend ? 'text-green-600' : 'text-gray-400'}`}>
          {trend || sub}
        </p>
      )}
    </div>
  );
};