"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Edit2,
  Box,
  FileText,
  ExternalLink,
  Check,
  X,
  Search,
  Image as ImageIcon,
  Upload,
  Loader2,
  BookOpen,
  Lightbulb,
  Link2,
  GraduationCap,
  Pin,
  Paperclip,
  Video,
  Eye,
  Sliders,
} from "lucide-react";
import {
  AppType,
  EntryType,
  EntryMediaItem,
  EntryAttachedFile,
} from "@/db/data-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalContent } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";

interface AdminManagerProps {
  initialApps: AppType[];
  initialEntries: EntryType[];
}

type TabType = "docs" | "apps" | "ideas" | "resources" | "courses";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminManager({ initialApps, initialEntries }: AdminManagerProps) {
  const [apps, setApps] = useState<AppType[]>(initialApps);
  const [entries, setEntries] = useState<EntryType[]>(initialEntries);
  const [activeTab, setActiveTab] = useState<TabType>("docs");
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  // Loading state for upload
  const [uploading, setUploading] = useState(false);

  // Modals for each dedicated section
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Partial<EntryType> | null>(null);

  const [appModalOpen, setAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Partial<AppType> | null>(null);

  const [ideaModalOpen, setIdeaModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Partial<EntryType> | null>(null);

  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Partial<EntryType> | null>(null);

  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<EntryType> | null>(null);

  // Temporary input helpers for media inside modal
  const [tempPhotoUrl, setTempPhotoUrl] = useState("");
  const [tempPhotoCaption, setTempPhotoCaption] = useState("");
  const [tempFileName, setTempFileName] = useState("");
  const [tempFileUrl, setTempFileUrl] = useState("");
  const [tempAppPhotoUrl, setTempAppPhotoUrl] = useState("");
  const [showAdvancedSlug, setShowAdvancedSlug] = useState(false);

  const showNotification = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  // -------------------------
  // Categorized Entry Buckets
  // -------------------------
  const docsEntries = useMemo(
    () => entries.filter((e) => e.topic_slug === "docs" || (!e.topic_slug && e.type === "doc")),
    [entries]
  );

  const ideasEntries = useMemo(
    () => entries.filter((e) => e.topic_slug === "ideas" || e.type === "idea"),
    [entries]
  );

  const resourcesEntries = useMemo(
    () => entries.filter((e) => e.topic_slug === "resources" || e.type === "link"),
    [entries]
  );

  const coursesEntries = useMemo(
    () => entries.filter((e) => e.topic_slug === "courses" || e.type === "course"),
    [entries]
  );

  // Universal File Upload Helper
  const handleFileUpload = async (
    file: File,
    onSuccess: (url: string, filename: string, sizeStr: string) => void
  ) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        const sizeMb = file.size / (1024 * 1024);
        const sizeStr = sizeMb >= 1 ? `${sizeMb.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;
        onSuccess(data.url, file.name, sizeStr);
        showNotification(`Uploaded ${file.name}`);
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // -------------------------
  // 1. NOTES & DOCS CRUD
  // -------------------------
  const handleOpenNewDoc = () => {
    setEditingDoc({
      title: "",
      slug: "",
      type: "doc",
      topic_slug: "docs",
      content: "",
      summary: "",
      tags: [],
      media_items: [],
      attached_files: [],
      video_url: "",
      is_pinned: false,
      is_published: true,
    });
    setTempPhotoUrl("");
    setTempPhotoCaption("");
    setTempFileName("");
    setTempFileUrl("");
    setShowAdvancedSlug(false);
    setDocModalOpen(true);
  };

  const handleOpenEditDoc = (doc: EntryType) => {
    setEditingDoc({ ...doc });
    setTempPhotoUrl("");
    setTempPhotoCaption("");
    setTempFileName("");
    setTempFileUrl("");
    setShowAdvancedSlug(false);
    setDocModalOpen(true);
  };

  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc?.title) return;

    const payload = {
      ...editingDoc,
      slug: editingDoc.slug ? slugify(editingDoc.slug) : slugify(editingDoc.title),
      type: "doc",
      topic_slug: "docs",
      summary:
        editingDoc.summary ||
        (editingDoc.content ? editingDoc.content.slice(0, 160).replace(/[#*`_]/g, "") + "..." : ""),
      tags: editingDoc.tags || [],
      media_items: editingDoc.media_items || [],
      attached_files: editingDoc.attached_files || [],
      video_url: editingDoc.video_url || null,
      is_pinned: Boolean(editingDoc.is_pinned),
      is_published: editingDoc.is_published !== false,
    };

    if (editingDoc.id) {
      const res = await fetch(`/api/entries/${editingDoc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setEntries((prev) => prev.map((item) => (item.id === editingDoc.id ? data.data : item)));
        showNotification(`Updated note "${data.data.title}"`);
      }
    } else {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setEntries((prev) => [data.data, ...prev]);
        showNotification(`Posted note "${data.data.title}"`);
      }
    }
    setDocModalOpen(false);
    setEditingDoc(null);
  };

  // -------------------------
  // 2. PROJECTS (APPS) CRUD
  // -------------------------
  const handleOpenNewApp = () => {
    setEditingApp({
      title: "",
      slug: "",
      tagline: "",
      description: "",
      version: "v1.0.0",
      badge: "Active",
      category: "Desktop App",
      carousel_images: [],
      repo_url: "",
      gdrive_url: "",
      demo_url: "",
      tech_stack: ["React", "TypeScript"],
      is_featured: false,
    });
    setTempAppPhotoUrl("");
    setShowAdvancedSlug(false);
    setAppModalOpen(true);
  };

  const handleOpenEditApp = (app: AppType) => {
    setEditingApp({ ...app });
    setTempAppPhotoUrl("");
    setShowAdvancedSlug(false);
    setAppModalOpen(true);
  };

  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp?.title || !editingApp?.tagline) return;

    const payload = {
      ...editingApp,
      slug: editingApp.slug ? slugify(editingApp.slug) : slugify(editingApp.title),
      category: editingApp.category || "Desktop App",
      version: editingApp.version || "v1.0.0",
      badge: editingApp.badge || "Active",
      tech_stack: editingApp.tech_stack || [],
      carousel_images: editingApp.carousel_images || [],
    };

    if (editingApp.id) {
      const res = await fetch(`/api/apps/${editingApp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setApps((prev) => prev.map((item) => (item.id === editingApp.id ? data.data : item)));
        showNotification(`Updated project "${data.data.title}"`);
      }
    } else {
      const res = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setApps((prev) => [...prev, data.data]);
        showNotification(`Created project "${data.data.title}"`);
      }
    }
    setAppModalOpen(false);
    setEditingApp(null);
  };

  // -------------------------
  // 3. IDEAS & LOGS CRUD
  // -------------------------
  const handleOpenNewIdea = () => {
    setEditingIdea({
      title: "",
      slug: "",
      type: "idea",
      topic_slug: "ideas",
      content: "",
      summary: "",
      metadata: { status: "Just an idea" },
      tags: ["Idea"],
      is_published: true,
    });
    setShowAdvancedSlug(false);
    setIdeaModalOpen(true);
  };

  const handleOpenEditIdea = (idea: EntryType) => {
    setEditingIdea({ ...idea });
    setShowAdvancedSlug(false);
    setIdeaModalOpen(true);
  };

  const handleSaveIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIdea?.title) return;

    const payload = {
      ...editingIdea,
      slug: editingIdea.slug ? slugify(editingIdea.slug) : slugify(editingIdea.title),
      type: "idea",
      topic_slug: "ideas",
      summary: editingIdea.summary || (editingIdea.content ? editingIdea.content.slice(0, 150) + "..." : ""),
      is_published: editingIdea.is_published !== false,
      tags: editingIdea.tags || [],
    };

    if (editingIdea.id) {
      const res = await fetch(`/api/entries/${editingIdea.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setEntries((prev) => prev.map((item) => (item.id === editingIdea.id ? data.data : item)));
        showNotification(`Updated idea "${data.data.title}"`);
      }
    } else {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setEntries((prev) => [data.data, ...prev]);
        showNotification(`Created idea "${data.data.title}"`);
      }
    }
    setIdeaModalOpen(false);
    setEditingIdea(null);
  };

  // -------------------------
  // 4. USEFUL LINKS CRUD
  // -------------------------
  const handleOpenNewResource = () => {
    setEditingResource({
      title: "",
      slug: "",
      type: "link",
      topic_slug: "resources",
      external_url: "",
      summary: "",
      content: "",
      tags: ["Tools"],
      is_published: true,
    });
    setShowAdvancedSlug(false);
    setResourceModalOpen(true);
  };

  const handleOpenEditResource = (resItem: EntryType) => {
    setEditingResource({ ...resItem });
    setShowAdvancedSlug(false);
    setResourceModalOpen(true);
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingResource?.title) return;

    const payload = {
      ...editingResource,
      slug: editingResource.slug ? slugify(editingResource.slug) : slugify(editingResource.title),
      type: "link",
      topic_slug: "resources",
      external_url: editingResource.external_url || null,
      summary: editingResource.summary || editingResource.content || "",
      is_published: editingResource.is_published !== false,
      tags: editingResource.tags || [],
    };

    if (editingResource.id) {
      const res = await fetch(`/api/entries/${editingResource.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setEntries((prev) => prev.map((item) => (item.id === editingResource.id ? data.data : item)));
        showNotification(`Updated resource "${data.data.title}"`);
      }
    } else {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setEntries((prev) => [data.data, ...prev]);
        showNotification(`Added resource "${data.data.title}"`);
      }
    }
    setResourceModalOpen(false);
    setEditingResource(null);
  };

  // -------------------------
  // 5. COURSES CRUD
  // -------------------------
  const handleOpenNewCourse = () => {
    setEditingCourse({
      title: "",
      slug: "",
      type: "course",
      topic_slug: "courses",
      content: "",
      summary: "",
      external_url: "",
      tags: ["CS"],
      is_published: true,
    });
    setShowAdvancedSlug(false);
    setCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: EntryType) => {
    setEditingCourse({ ...course });
    setShowAdvancedSlug(false);
    setCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse?.title) return;

    const payload = {
      ...editingCourse,
      slug: editingCourse.slug ? slugify(editingCourse.slug) : slugify(editingCourse.title),
      type: "course",
      topic_slug: "courses",
      summary: editingCourse.summary || (editingCourse.content ? editingCourse.content.slice(0, 150) + "..." : ""),
      is_published: editingCourse.is_published !== false,
      tags: editingCourse.tags || [],
    };

    if (editingCourse.id) {
      const res = await fetch(`/api/entries/${editingCourse.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setEntries((prev) => prev.map((item) => (item.id === editingCourse.id ? data.data : item)));
        showNotification(`Updated course "${data.data.title}"`);
      }
    } else {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setEntries((prev) => [data.data, ...prev]);
        showNotification(`Added course "${data.data.title}"`);
      }
    }
    setCourseModalOpen(false);
    setEditingCourse(null);
  };

  // -------------------------
  // Universal Deletes
  // -------------------------
  const handleDeleteEntry = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setEntries((prev) => prev.filter((item) => item.id !== id));
      showNotification(`Deleted "${title}"`);
    }
  };

  const handleDeleteApp = async (id: string, title: string) => {
    if (!confirm(`Delete project "${title}"?`)) return;
    const res = await fetch(`/api/apps/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setApps((prev) => prev.filter((item) => item.id !== id));
      showNotification(`Deleted project "${title}"`);
    }
  };

  // Filter items in active tab based on search query
  const filteredDocs = docsEntries.filter(
    (e) =>
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredApps = apps.filter(
    (a) =>
      !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tech_stack?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredIdeas = ideasEntries.filter(
    (e) =>
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredResources = resourcesEntries.filter(
    (e) =>
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredCourses = coursesEntries.filter(
    (e) =>
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {message && (
        <div className="fixed bottom-5 right-5 z-50 bg-black text-white px-4 py-2.5 text-xs font-mono rounded-[6px] shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* ── Section Metric Cards (Clickable Quick Switchers) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => {
            setActiveTab("docs");
            setSearchQuery("");
          }}
          className={`text-left p-3.5 border rounded-[8px] transition-all cursor-pointer ${
            activeTab === "docs"
              ? "bg-black text-white border-black shadow-sm"
              : "bg-bg-raised border-border hover:border-black/30 text-fg"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono opacity-80">
            <span>Notes & Docs</span>
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-display font-medium mt-1">{docsEntries.length}</div>
          <div className="text-[10px] opacity-70 mt-0.5 truncate">/home/docs feed</div>
        </button>

        <button
          onClick={() => {
            setActiveTab("apps");
            setSearchQuery("");
          }}
          className={`text-left p-3.5 border rounded-[8px] transition-all cursor-pointer ${
            activeTab === "apps"
              ? "bg-black text-white border-black shadow-sm"
              : "bg-bg-raised border-border hover:border-black/30 text-fg"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono opacity-80">
            <span>Projects</span>
            <Box className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-display font-medium mt-1">{apps.length}</div>
          <div className="text-[10px] opacity-70 mt-0.5 truncate">/home/apps showcase</div>
        </button>

        <button
          onClick={() => {
            setActiveTab("ideas");
            setSearchQuery("");
          }}
          className={`text-left p-3.5 border rounded-[8px] transition-all cursor-pointer ${
            activeTab === "ideas"
              ? "bg-black text-white border-black shadow-sm"
              : "bg-bg-raised border-border hover:border-black/30 text-fg"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono opacity-80">
            <span>Ideas & Logs</span>
            <Lightbulb className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-display font-medium mt-1">{ideasEntries.length}</div>
          <div className="text-[10px] opacity-70 mt-0.5 truncate">/home/ideas</div>
        </button>

        <button
          onClick={() => {
            setActiveTab("resources");
            setSearchQuery("");
          }}
          className={`text-left p-3.5 border rounded-[8px] transition-all cursor-pointer ${
            activeTab === "resources"
              ? "bg-black text-white border-black shadow-sm"
              : "bg-bg-raised border-border hover:border-black/30 text-fg"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono opacity-80">
            <span>Useful Links</span>
            <Link2 className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-display font-medium mt-1">{resourcesEntries.length}</div>
          <div className="text-[10px] opacity-70 mt-0.5 truncate">/home/resources</div>
        </button>

        <button
          onClick={() => {
            setActiveTab("courses");
            setSearchQuery("");
          }}
          className={`text-left p-3.5 border rounded-[8px] transition-all cursor-pointer col-span-2 sm:col-span-1 ${
            activeTab === "courses"
              ? "bg-black text-white border-black shadow-sm"
              : "bg-bg-raised border-border hover:border-black/30 text-fg"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono opacity-80">
            <span>Courses</span>
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <div className="text-2xl font-display font-medium mt-1">{coursesEntries.length}</div>
          <div className="text-[10px] opacity-70 mt-0.5 truncate">/home/courses</div>
        </button>
      </div>

      {/* ── Dedicated Tab Selector Pill Bar ── */}
      <div className="flex items-center justify-between border-b border-border pb-3 gap-2 overflow-x-auto">
        <div className="flex items-center space-x-1.5 p-1 bg-neutral-200/60 rounded-[8px] shrink-0">
          <button
            onClick={() => {
              setActiveTab("docs");
              setSearchQuery("");
            }}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-[6px] text-xs font-mono transition-all cursor-pointer ${
              activeTab === "docs"
                ? "bg-white text-black font-semibold shadow-xs"
                : "text-neutral-600 hover:text-black"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Notes & Docs ({docsEntries.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("apps");
              setSearchQuery("");
            }}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-[6px] text-xs font-mono transition-all cursor-pointer ${
              activeTab === "apps"
                ? "bg-white text-black font-semibold shadow-xs"
                : "text-neutral-600 hover:text-black"
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Projects ({apps.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("ideas");
              setSearchQuery("");
            }}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-[6px] text-xs font-mono transition-all cursor-pointer ${
              activeTab === "ideas"
                ? "bg-white text-black font-semibold shadow-xs"
                : "text-neutral-600 hover:text-black"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Ideas & Logs ({ideasEntries.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("resources");
              setSearchQuery("");
            }}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-[6px] text-xs font-mono transition-all cursor-pointer ${
              activeTab === "resources"
                ? "bg-white text-black font-semibold shadow-xs"
                : "text-neutral-600 hover:text-black"
            }`}
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Useful Links ({resourcesEntries.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("courses");
              setSearchQuery("");
            }}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-[6px] text-xs font-mono transition-all cursor-pointer ${
              activeTab === "courses"
                ? "bg-white text-black font-semibold shadow-xs"
                : "text-neutral-600 hover:text-black"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Courses ({coursesEntries.length})</span>
          </button>
        </div>

        {/* Tab Specific Quick Create Button */}
        <div className="shrink-0">
          {activeTab === "docs" && (
            <Button size="sm" onClick={handleOpenNewDoc} className="rounded-[6px] cursor-pointer">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Post New Note</span>
            </Button>
          )}
          {activeTab === "apps" && (
            <Button size="sm" onClick={handleOpenNewApp} className="rounded-[6px] cursor-pointer">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Add Project</span>
            </Button>
          )}
          {activeTab === "ideas" && (
            <Button size="sm" onClick={handleOpenNewIdea} className="rounded-[6px] cursor-pointer">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>New Idea / Log</span>
            </Button>
          )}
          {activeTab === "resources" && (
            <Button size="sm" onClick={handleOpenNewResource} className="rounded-[6px] cursor-pointer">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Add Useful Link</span>
            </Button>
          )}
          {activeTab === "courses" && (
            <Button size="sm" onClick={handleOpenNewCourse} className="rounded-[6px] cursor-pointer">
              <Plus className="w-4 h-4 mr-1.5" />
              <span>Add Course Guide</span>
            </Button>
          )}
        </div>
      </div>

      {/* ── Search Toolbar for the Active Tab ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Filter ${activeTab}...`}
            className="w-full bg-bg-raised border border-border pl-8 pr-3 py-1.5 text-xs font-mono text-fg placeholder:text-fg-subtle focus:outline-none focus:border-fg rounded-[6px]"
          />
        </div>
        <div className="text-xs font-mono text-fg-subtle">
          Showing{" "}
          <span className="font-semibold text-fg">
            {activeTab === "docs"
              ? filteredDocs.length
              : activeTab === "apps"
              ? filteredApps.length
              : activeTab === "ideas"
              ? filteredIdeas.length
              : activeTab === "resources"
              ? filteredResources.length
              : filteredCourses.length}
          </span>{" "}
          items
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* TAB 1: NOTES & DOCS (Social Feed Posts on /home/docs) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === "docs" && (
        <div className="space-y-3">
          {filteredDocs.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-[8px] text-xs font-mono text-fg-subtle">
              No notes or announcements found. Click &quot;+ Post New Note&quot; to publish one.
            </div>
          ) : (
            filteredDocs.map((item) => (
              <div
                key={item.id}
                className="border border-border bg-bg-raised p-4 rounded-[8px] hover:border-black/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2">
                    {item.is_pinned && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-[4px] bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-mono font-medium">
                        <Pin className="w-2.5 h-2.5 fill-sky-700" />
                        <span>Pinned</span>
                      </span>
                    )}
                    <span className="font-medium text-sm text-fg tracking-tight truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono text-fg-subtle">
                      {formatDate(item.created_at)}
                    </span>
                  </div>

                  {item.summary && (
                    <p className="text-xs text-fg-muted line-clamp-2">{item.summary}</p>
                  )}

                  <div className="flex items-center flex-wrap gap-2 pt-0.5 text-[10px] font-mono text-fg-subtle">
                    {item.media_items && item.media_items.length > 0 && (
                      <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-[4px] bg-bg border border-border">
                        <ImageIcon className="w-3 h-3 text-fg-subtle" />
                        <span>{item.media_items.length} photo{item.media_items.length > 1 ? "s" : ""}</span>
                      </span>
                    )}
                    {item.video_url && (
                      <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-[4px] bg-bg border border-border">
                        <Video className="w-3 h-3 text-fg-subtle" />
                        <span>Video attached</span>
                      </span>
                    )}
                    {item.attached_files && item.attached_files.length > 0 && (
                      <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-[4px] bg-bg border border-border">
                        <Paperclip className="w-3 h-3 text-fg-subtle" />
                        <span>{item.attached_files.length} file{item.attached_files.length > 1 ? "s" : ""}</span>
                      </span>
                    )}
                    {item.tags?.map((t) => (
                      <span key={t} className="text-neutral-500 font-sans">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <Link
                    href={`/home/docs`}
                    target="_blank"
                    className="flex items-center space-x-1 px-2.5 py-1 text-xs font-mono text-fg-subtle hover:text-fg border border-border hover:border-black/30 rounded-[6px] transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View Feed</span>
                  </Link>
                  <button
                    onClick={() => handleOpenEditDoc(item)}
                    className="p-1.5 text-fg-subtle hover:text-fg border border-border hover:border-black/30 rounded-[6px] transition-colors cursor-pointer"
                    title="Edit Note"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(item.id, item.title)}
                    className="p-1.5 text-fg-subtle hover:text-red-600 border border-border hover:border-red-200 rounded-[6px] transition-colors cursor-pointer"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* TAB 2: PROJECTS (Showcase Apps on /home/apps) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === "apps" && (
        <div className="space-y-3">
          {filteredApps.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-[8px] text-xs font-mono text-fg-subtle">
              No projects found. Click &quot;+ Add Project&quot; to showcase one.
            </div>
          ) : (
            filteredApps.map((app) => (
              <div
                key={app.id}
                className="border border-border bg-bg-raised p-4 rounded-[8px] hover:border-black/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="font-medium text-sm text-fg tracking-tight">{app.title}</span>
                    <Badge variant="subtle" className="text-[10px] rounded-[4px]">
                      {app.category}
                    </Badge>
                    <span className="text-[10px] font-mono text-fg-subtle">{app.version}</span>
                    <span className="text-[10px] font-mono text-emerald-600 font-medium">
                      [{app.badge}]
                    </span>
                  </div>

                  <p className="text-xs text-fg-muted line-clamp-1">{app.tagline}</p>

                  <div className="flex items-center flex-wrap gap-1.5 text-[10px] font-mono text-fg-subtle pt-0.5">
                    {app.carousel_images && (
                      <span className="px-1.5 py-0.5 rounded-[4px] bg-bg border border-border">
                        {app.carousel_images.length} frames
                      </span>
                    )}
                    {app.tech_stack?.map((tech) => (
                      <span key={tech} className="px-1.5 py-0.5 rounded-[4px] bg-bg border border-border">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <Link
                    href={`/home/apps/${app.slug}`}
                    target="_blank"
                    className="flex items-center space-x-1 px-2.5 py-1 text-xs font-mono text-fg-subtle hover:text-fg border border-border hover:border-black/30 rounded-[6px] transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View Showcase</span>
                  </Link>
                  <button
                    onClick={() => handleOpenEditApp(app)}
                    className="p-1.5 text-fg-subtle hover:text-fg border border-border hover:border-black/30 rounded-[6px] transition-colors cursor-pointer"
                    title="Edit Project"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteApp(app.id, app.title)}
                    className="p-1.5 text-fg-subtle hover:text-red-600 border border-border hover:border-red-200 rounded-[6px] transition-colors cursor-pointer"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* TAB 3: IDEAS & LOGS (Raw Brainstorms on /home/ideas) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === "ideas" && (
        <div className="space-y-3">
          {filteredIdeas.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-[8px] text-xs font-mono text-fg-subtle">
              No ideas or dev logs found. Click &quot;+ New Idea / Log&quot; to log a thought.
            </div>
          ) : (
            filteredIdeas.map((idea) => (
              <div
                key={idea.id}
                className="border border-border bg-bg-raised p-4 rounded-[8px] hover:border-black/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="font-medium text-sm text-fg tracking-tight">{idea.title}</span>
                    <span className="text-[10px] font-mono text-fg-subtle">
                      {formatDate(idea.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-fg-muted line-clamp-2">
                    {idea.summary || idea.content?.slice(0, 140)}
                  </p>

                  <div className="flex items-center flex-wrap gap-1.5 text-[10px] font-mono text-fg-subtle pt-0.5">
                    {idea.tags?.map((t) => (
                      <span key={t} className="text-neutral-500 font-sans">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <Link
                    href={`/home/ideas`}
                    target="_blank"
                    className="flex items-center space-x-1 px-2.5 py-1 text-xs font-mono text-fg-subtle hover:text-fg border border-border hover:border-black/30 rounded-[6px] transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View Page</span>
                  </Link>
                  <button
                    onClick={() => handleOpenEditIdea(idea)}
                    className="p-1.5 text-fg-subtle hover:text-fg border border-border hover:border-black/30 rounded-[6px] transition-colors cursor-pointer"
                    title="Edit Idea"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(idea.id, idea.title)}
                    className="p-1.5 text-fg-subtle hover:text-red-600 border border-border hover:border-red-200 rounded-[6px] transition-colors cursor-pointer"
                    title="Delete Idea"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* TAB 4: USEFUL LINKS (Bookmarks on /home/resources) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === "resources" && (
        <div className="space-y-3">
          {filteredResources.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-[8px] text-xs font-mono text-fg-subtle">
              No useful links found. Click &quot;+ Add Useful Link&quot; to save a bookmark.
            </div>
          ) : (
            filteredResources.map((resItem) => (
              <div
                key={resItem.id}
                className="border border-border bg-bg-raised p-4 rounded-[8px] hover:border-black/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="font-medium text-sm text-fg tracking-tight">
                      {resItem.title}
                    </span>
                    {resItem.external_url && (
                      <span className="text-[10px] font-mono text-fg-subtle truncate max-w-xs">
                        ({resItem.external_url})
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-fg-muted line-clamp-2">
                    {resItem.summary || resItem.content}
                  </p>

                  <div className="flex items-center flex-wrap gap-1.5 text-[10px] font-mono text-fg-subtle pt-0.5">
                    {resItem.tags?.map((t) => (
                      <span key={t} className="text-neutral-500 font-sans">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {resItem.external_url ? (
                    <a
                      href={resItem.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 px-2.5 py-1 text-xs font-mono text-fg-subtle hover:text-fg border border-border hover:border-black/30 rounded-[6px] transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Open Link</span>
                    </a>
                  ) : (
                    <Link
                      href={`/home/resources`}
                      target="_blank"
                      className="flex items-center space-x-1 px-2.5 py-1 text-xs font-mono text-fg-subtle hover:text-fg border border-border hover:border-black/30 rounded-[6px] transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View Page</span>
                    </Link>
                  )}
                  <button
                    onClick={() => handleOpenEditResource(resItem)}
                    className="p-1.5 text-fg-subtle hover:text-fg border border-border hover:border-black/30 rounded-[6px] transition-colors cursor-pointer"
                    title="Edit Resource"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(resItem.id, resItem.title)}
                    className="p-1.5 text-fg-subtle hover:text-red-600 border border-border hover:border-red-200 rounded-[6px] transition-colors cursor-pointer"
                    title="Delete Resource"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* TAB 5: COURSES (Course Guides on /home/courses) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === "courses" && (
        <div className="space-y-3">
          {filteredCourses.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-[8px] text-xs font-mono text-fg-subtle">
              No courses found. Click &quot;+ Add Course Guide&quot; to add a course syllabus.
            </div>
          ) : (
            filteredCourses.map((course) => (
              <div
                key={course.id}
                className="border border-border bg-bg-raised p-4 rounded-[8px] hover:border-black/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="font-medium text-sm text-fg tracking-tight">
                      {course.title}
                    </span>
                    <span className="text-[10px] font-mono text-fg-subtle">
                      {formatDate(course.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-fg-muted line-clamp-2">
                    {course.summary || course.content?.slice(0, 140)}
                  </p>

                  <div className="flex items-center flex-wrap gap-1.5 text-[10px] font-mono text-fg-subtle pt-0.5">
                    {course.tags?.map((t) => (
                      <span key={t} className="text-neutral-500 font-sans">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <Link
                    href={`/home/courses`}
                    target="_blank"
                    className="flex items-center space-x-1 px-2.5 py-1 text-xs font-mono text-fg-subtle hover:text-fg border border-border hover:border-black/30 rounded-[6px] transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View Page</span>
                  </Link>
                  <button
                    onClick={() => handleOpenEditCourse(course)}
                    className="p-1.5 text-fg-subtle hover:text-fg border border-border hover:border-black/30 rounded-[6px] transition-colors cursor-pointer"
                    title="Edit Course"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteEntry(course.id, course.title)}
                    className="p-1.5 text-fg-subtle hover:text-red-600 border border-border hover:border-red-200 rounded-[6px] transition-colors cursor-pointer"
                    title="Delete Course"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 1. DEDICATED MODAL: NOTES & DOCS (Social Feed Post) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <Modal open={docModalOpen} onOpenChange={setDocModalOpen}>
        <ModalContent
          className="max-w-2xl max-h-[88vh] overflow-y-auto rounded-[12px]"
          title={editingDoc?.id ? "Edit Note / Announcement" : "Create New Note / Announcement"}
        >
          {editingDoc && (
            <form onSubmit={handleSaveDoc} className="space-y-4 pt-2">
              {/* Title */}
              <div className="space-y-1">
                <label className="font-mono text-[11px] uppercase text-fg font-medium">
                  Post Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingDoc.title || ""}
                  onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                  placeholder="e.g. Distributed Consensus: Raft vs Paxos"
                  className="w-full bg-bg border border-border px-3 py-2 text-sm text-fg focus:outline-none focus:border-fg rounded-[6px]"
                />
              </div>

              {/* Note / Body Content */}
              <div className="space-y-1">
                <label className="font-mono text-[11px] uppercase text-fg font-medium">
                  Note / Announcement Message *
                </label>
                <textarea
                  rows={6}
                  required
                  value={editingDoc.content || ""}
                  onChange={(e) => setEditingDoc({ ...editingDoc, content: e.target.value })}
                  placeholder="Write your note or announcement here..."
                  className="w-full bg-bg border border-border px-3 py-2 text-sm text-fg focus:outline-none focus:border-fg rounded-[6px] leading-relaxed font-sans"
                />
              </div>

              {/* Photos Gallery (High-Res) */}
              <div className="space-y-2 p-3 bg-neutral-50 border border-border rounded-[8px]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase text-fg font-medium flex items-center space-x-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Photos & Images ({editingDoc.media_items?.length || 0})</span>
                  </span>
                  <label className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono bg-white border border-border hover:border-black/40 rounded-[6px] cursor-pointer transition-colors shadow-2xs">
                    {uploading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Upload className="w-3 h-3" />
                    )}
                    <span>{uploading ? "Uploading..." : "Upload Photo"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, (url, filename) => {
                            setEditingDoc((prev) => ({
                              ...prev,
                              media_items: [
                                ...(prev?.media_items || []),
                                {
                                  id: `m-${Date.now()}`,
                                  type: "image",
                                  url,
                                  caption: filename.replace(/\.[^/.]+$/, ""),
                                },
                              ],
                            }));
                          });
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Current Photos Grid */}
                {editingDoc.media_items && editingDoc.media_items.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {editingDoc.media_items.map((item, idx) => (
                      <div key={item.id || idx} className="relative group border border-border rounded-[6px] overflow-hidden bg-white">
                        <img
                          src={item.url}
                          alt={item.caption || "Photo"}
                          className="w-full h-20 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDoc((prev) => ({
                              ...prev,
                              media_items: (prev?.media_items || []).filter((_, i) => i !== idx),
                            }));
                          }}
                          className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-[4px] hover:bg-red-600 transition-colors cursor-pointer"
                          title="Remove image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Photo by URL */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="url"
                    value={tempPhotoUrl}
                    onChange={(e) => setTempPhotoUrl(e.target.value)}
                    placeholder="Or paste photo image URL..."
                    className="flex-1 bg-white border border-border px-2.5 py-1 text-xs text-fg rounded-[6px] focus:outline-none focus:border-fg"
                  />
                  <button
                    type="button"
                    disabled={!tempPhotoUrl}
                    onClick={() => {
                      if (!tempPhotoUrl) return;
                      setEditingDoc((prev) => ({
                        ...prev,
                        media_items: [
                          ...(prev?.media_items || []),
                          {
                            id: `m-${Date.now()}`,
                            type: "image",
                            url: tempPhotoUrl,
                            caption: tempPhotoCaption || "Visual Note",
                          },
                        ],
                      }));
                      setTempPhotoUrl("");
                      setTempPhotoCaption("");
                    }}
                    className="px-3 py-1 bg-neutral-900 text-white text-xs font-mono rounded-[6px] disabled:opacity-40 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Video URL */}
              <div className="space-y-1">
                <label className="font-mono text-[11px] uppercase text-fg font-medium flex items-center space-x-1.5">
                  <Video className="w-3.5 h-3.5" />
                  <span>Video URL (Optional)</span>
                </label>
                <input
                  type="url"
                  value={editingDoc.video_url || ""}
                  onChange={(e) => setEditingDoc({ ...editingDoc, video_url: e.target.value })}
                  placeholder="https://.../video.mp4 or YouTube link"
                  className="w-full bg-bg border border-border px-3 py-1.5 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[6px]"
                />
              </div>

              {/* Document Attachments (PDF / Word) */}
              <div className="space-y-2 p-3 bg-neutral-50 border border-border rounded-[8px]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase text-fg font-medium flex items-center space-x-1.5">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>File Attachments (PDF, Word, Docs)</span>
                  </span>
                  <label className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono bg-white border border-border hover:border-black/40 rounded-[6px] cursor-pointer transition-colors shadow-2xs">
                    {uploading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Upload className="w-3 h-3" />
                    )}
                    <span>{uploading ? "Uploading..." : "Upload File"}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.zip,.txt"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, (url, filename, sizeStr) => {
                            const ext = filename.split(".").pop()?.toLowerCase();
                            const docType: EntryAttachedFile["type"] =
                              ext === "pdf" ? "pdf" : ext === "doc" || ext === "docx" ? "word" : "file";
                            setEditingDoc((prev) => ({
                              ...prev,
                              attached_files: [
                                ...(prev?.attached_files || []),
                                {
                                  id: `f-${Date.now()}`,
                                  name: filename,
                                  url,
                                  size: sizeStr,
                                  type: docType,
                                },
                              ],
                            }));
                          });
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Attached Files List */}
                {editingDoc.attached_files && editingDoc.attached_files.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {editingDoc.attached_files.map((file, idx) => (
                      <div
                        key={file.id || idx}
                        className="flex items-center justify-between bg-white px-3 py-1.5 border border-border rounded-[6px] text-xs font-mono"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span className="uppercase font-semibold px-1 py-0.5 rounded bg-neutral-100 text-[10px]">
                            {file.type}
                          </span>
                          <span className="truncate">{file.name}</span>
                          {file.size && <span className="text-fg-subtle">({file.size})</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDoc((prev) => ({
                              ...prev,
                              attached_files: (prev?.attached_files || []).filter((_, i) => i !== idx),
                            }));
                          }}
                          className="p-1 text-fg-subtle hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="space-y-1">
                <label className="font-mono text-[11px] uppercase text-fg font-medium">
                  Hashtags / Topics (comma separated)
                </label>
                <input
                  type="text"
                  value={editingDoc.tags?.join(", ") || ""}
                  onChange={(e) =>
                    setEditingDoc({
                      ...editingDoc,
                      tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="e.g. Algorithms, DistributedSystems, Python"
                  className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[6px]"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center space-x-6 pt-1">
                <label className="flex items-center space-x-2 text-xs font-mono cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingDoc.is_pinned || false}
                    onChange={(e) => setEditingDoc({ ...editingDoc, is_pinned: e.target.checked })}
                    className="rounded-[4px]"
                  />
                  <span>📌 Pin to top of feed</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-mono cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingDoc.is_published !== false}
                    onChange={(e) =>
                      setEditingDoc({ ...editingDoc, is_published: e.target.checked })
                    }
                    className="rounded-[4px]"
                  />
                  <span>👁 Published (Publicly visible)</span>
                </label>
              </div>

              {/* Optional Advanced Settings Accordion */}
              <div className="border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdvancedSlug(!showAdvancedSlug)}
                  className="flex items-center space-x-1.5 text-[11px] font-mono text-fg-subtle hover:text-fg transition-colors"
                >
                  <Sliders className="w-3 h-3" />
                  <span>{showAdvancedSlug ? "Hide Custom URL Slug" : "Customize URL Slug (Optional)"}</span>
                </button>
                {showAdvancedSlug && (
                  <div className="mt-2 space-y-1">
                    <input
                      type="text"
                      value={editingDoc.slug || ""}
                      onChange={(e) => setEditingDoc({ ...editingDoc, slug: e.target.value })}
                      placeholder="auto-generated-from-title"
                      className="w-full bg-bg border border-border px-3 py-1.5 text-xs font-mono text-fg rounded-[6px]"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-border pt-4 flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDocModalOpen(false)}
                  className="rounded-[6px] cursor-pointer"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="rounded-[6px] cursor-pointer">
                  {editingDoc.id ? "Save Changes" : "Publish Note"}
                </Button>
              </div>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 2. DEDICATED MODAL: PROJECTS / SHOWCASE APPS */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <Modal open={appModalOpen} onOpenChange={setAppModalOpen}>
        <ModalContent
          className="max-w-2xl max-h-[88vh] overflow-y-auto rounded-[12px]"
          title={editingApp?.id ? "Edit Project Showcase" : "Add Project Showcase"}
        >
          {editingApp && (
            <form onSubmit={handleSaveApp} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-mono text-[11px] uppercase text-fg font-medium">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingApp.title || ""}
                    onChange={(e) => setEditingApp({ ...editingApp, title: e.target.value })}
                    placeholder="e.g. VibeAlarm"
                    className="w-full bg-bg border border-border px-3 py-2 text-sm text-fg rounded-[6px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[11px] uppercase text-fg font-medium">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editingApp.category || "Desktop App"}
                    onChange={(e) => setEditingApp({ ...editingApp, category: e.target.value })}
                    placeholder="Desktop App, Web App, Mobile App"
                    className="w-full bg-bg border border-border px-3 py-2 text-sm text-fg rounded-[6px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[11px] uppercase text-fg font-medium">
                  Tagline / Catchphrase *
                </label>
                <input
                  type="text"
                  required
                  value={editingApp.tagline || ""}
                  onChange={(e) => setEditingApp({ ...editingApp, tagline: e.target.value })}
                  placeholder="One sentence explaining the app..."
                  className="w-full bg-bg border border-border px-3 py-2 text-sm text-fg rounded-[6px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-mono text-[11px] uppercase text-fg font-medium">Version</label>
                  <input
                    type="text"
                    value={editingApp.version || "v1.0.0"}
                    onChange={(e) => setEditingApp({ ...editingApp, version: e.target.value })}
                    className="w-full bg-bg border border-border px-3 py-1.5 text-xs font-mono text-fg rounded-[6px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[11px] uppercase text-fg font-medium">Status Badge</label>
                  <input
                    type="text"
                    value={editingApp.badge || "Active"}
                    onChange={(e) => setEditingApp({ ...editingApp, badge: e.target.value })}
                    placeholder="Active, Beta, etc."
                    className="w-full bg-bg border border-border px-3 py-1.5 text-xs font-mono text-fg rounded-[6px]"
                  />
                </div>
              </div>

              {/* Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-mono text-[11px] uppercase text-fg font-medium">Demo URL</label>
                  <input
                    type="url"
                    value={editingApp.demo_url || ""}
                    onChange={(e) => setEditingApp({ ...editingApp, demo_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-bg border border-border px-3 py-1.5 text-xs font-mono text-fg rounded-[6px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[11px] uppercase text-fg font-medium">GitHub URL</label>
                  <input
                    type="url"
                    value={editingApp.repo_url || ""}
                    onChange={(e) => setEditingApp({ ...editingApp, repo_url: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full bg-bg border border-border px-3 py-1.5 text-xs font-mono text-fg rounded-[6px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[11px] uppercase text-fg font-medium">GDrive URL</label>
                  <input
                    type="url"
                    value={editingApp.gdrive_url || ""}
                    onChange={(e) => setEditingApp({ ...editingApp, gdrive_url: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="w-full bg-bg border border-border px-3 py-1.5 text-xs font-mono text-fg rounded-[6px]"
                  />
                </div>
              </div>

              {/* Tech Stack */}
              <div className="space-y-1">
                <label className="font-mono text-[11px] uppercase text-fg font-medium">
                  Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  value={editingApp.tech_stack?.join(", ") || ""}
                  onChange={(e) =>
                    setEditingApp({
                      ...editingApp,
                      tech_stack: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="e.g. React Native, Rust, TypeScript, SQLite"
                  className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg rounded-[6px]"
                />
              </div>

              {/* Screenshot Carousel */}
              <div className="space-y-2 p-3 bg-neutral-50 border border-border rounded-[8px]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] uppercase text-fg font-medium flex items-center space-x-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Carousel Screenshots ({editingApp.carousel_images?.length || 0})</span>
                  </span>
                  <label className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono bg-white border border-border hover:border-black/40 rounded-[6px] cursor-pointer transition-colors shadow-2xs">
                    {uploading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Upload className="w-3 h-3" />
                    )}
                    <span>{uploading ? "Uploading..." : "Upload Screenshot"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, (url, filename) => {
                            setEditingApp((prev) => ({
                              ...prev,
                              carousel_images: [
                                ...(prev?.carousel_images || []),
                                {
                                  url,
                                  caption: filename.replace(/\.[^/.]+$/, ""),
                                },
                              ],
                            }));
                          });
                        }
                      }}
                    />
                  </label>
                </div>

                {editingApp.carousel_images && editingApp.carousel_images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {editingApp.carousel_images.map((img, idx) => (
                      <div key={idx} className="relative group border border-border rounded-[6px] overflow-hidden bg-white">
                        <img src={img.url} alt={img.caption || `Frame ${idx + 1}`} className="w-full h-20 object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            setEditingApp((prev) => ({
                              ...prev,
                              carousel_images: (prev?.carousel_images || []).filter((_, i) => i !== idx),
                            }));
                          }}
                          className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-[4px] hover:bg-red-600 transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-mono text-[11px] uppercase text-fg font-medium">
                  Detailed Breakdown / Purpose
                </label>
                <textarea
                  rows={5}
                  value={editingApp.description || ""}
                  onChange={(e) => setEditingApp({ ...editingApp, description: e.target.value })}
                  placeholder="Detailed breakdown of features, use-cases, and purpose..."
                  className="w-full bg-bg border border-border px-3 py-2 text-sm text-fg rounded-[6px] font-sans"
                />
              </div>

              <div className="border-t border-border pt-4 flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAppModalOpen(false)}
                  className="rounded-[6px] cursor-pointer"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="rounded-[6px] cursor-pointer">
                  {editingApp.id ? "Save Changes" : "Add Project"}
                </Button>
              </div>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 3. DEDICATED MODAL: IDEAS & LOGS */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <Modal open={ideaModalOpen} onOpenChange={setIdeaModalOpen}>
        <ModalContent
          className="max-w-lg max-h-[85vh] overflow-y-auto rounded-[12px]"
          title={editingIdea?.id ? "Edit Idea / Log" : "New Idea or Dev Log"}
        >
          {editingIdea && (
            <form onSubmit={handleSaveIdea} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="font-mono text-[11px] uppercase text-fg font-medium">Title *</label>
                <input
                  type="text"
                  required
                  value={editingIdea.title || ""}
                  onChange={(e) => setEditingIdea({ ...editingIdea, title: e.target.value })}
                  placeholder="e.g. Peer-to-Peer Academic Syllabus Vault"
                  className="w-full bg-bg border border-border px-3 py-2 text-sm text-fg rounded-[6px]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[11px] uppercase text-fg font-medium">
                  Brainstorm Thoughts / Journal *
                </label>
                <textarea
                  rows={6}
                  required
                  value={editingIdea.content || ""}
                  onChange={(e) => setEditingIdea({ ...editingIdea, content: e.target.value })}
                  placeholder="Describe your raw idea, the problem it solves, and next steps..."
                  className="w-full bg-bg border border-border px-3 py-2 text-sm text-fg rounded-[6px] font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[11px] uppercase text-fg font-medium">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={editingIdea.tags?.join(", ") || ""}
                  onChange={(e) =>
                    setEditingIdea({
                      ...editingIdea,
                      tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="e.g. P2P, OpenSource, Idea"
                  className="w-full bg-bg border border-border px-3 py-1.5 text-xs font-mono text-fg rounded-[6px]"
                />
              </div>

              <div className="border-t border-border pt-4 flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIdeaModalOpen(false)}
                  className="rounded-[6px] cursor-pointer"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="rounded-[6px] cursor-pointer">
                  {editingIdea.id ? "Save Changes" : "Log Idea"}
                </Button>
              </div>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 4. DEDICATED MODAL: USEFUL LINKS */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <Modal open={resourceModalOpen} onOpenChange={setResourceModalOpen}>
        <ModalContent
          className="max-w-lg max-h-[85vh] overflow-y-auto rounded-[12px]"
          title={editingResource?.id ? "Edit Useful Link" : "Add Useful Link / Bookmark"}
        >
          {editingResource && (
            <form onSubmit={handleSaveResource} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="font-mono text-[11px] uppercase text-fg font-medium">
                  Bookmark Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingResource.title || ""}
                  onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })}
                  placeholder="e.g. Curated Systems & Architecture Papers"
                  className="w-full bg-bg border border-border px-3 py-2 text-sm text-fg rounded-[6px]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[11px] uppercase text-fg font-medium">
                  Destination URL *
                </label>
                <input
                  type="url"
                  required
                  value={editingResource.external_url || ""}
                  onChange={(e) =>
                    setEditingResource({ ...editingResource, external_url: e.target.value })
                  }
                  placeholder="https://github.com/..."
                  className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg rounded-[6px]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[11px] uppercase text-fg font-medium">
                  Short Description
                </label>
                <textarea
                  rows={3}
                  value={editingResource.summary || editingResource.content || ""}
                  onChange={(e) =>
                    setEditingResource({
                      ...editingResource,
                      summary: e.target.value,
                      content: e.target.value,
                    })
                  }
                  placeholder="Why is this resource worth bookmarking?"
                  className="w-full bg-bg border border-border px-3 py-2 text-sm text-fg rounded-[6px] font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[11px] uppercase text-fg font-medium">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={editingResource.tags?.join(", ") || ""}
                  onChange={(e) =>
                    setEditingResource({
                      ...editingResource,
                      tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="e.g. Tools, Papers, Reference"
                  className="w-full bg-bg border border-border px-3 py-1.5 text-xs font-mono text-fg rounded-[6px]"
                />
              </div>

              <div className="border-t border-border pt-4 flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setResourceModalOpen(false)}
                  className="rounded-[6px] cursor-pointer"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="rounded-[6px] cursor-pointer">
                  {editingResource.id ? "Save Changes" : "Add Link"}
                </Button>
              </div>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 5. DEDICATED MODAL: COURSES */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <Modal open={courseModalOpen} onOpenChange={setCourseModalOpen}>
        <ModalContent
          className="max-w-lg max-h-[85vh] overflow-y-auto rounded-[12px]"
          title={editingCourse?.id ? "Edit Course Guide" : "Add Course Guide"}
        >
          {editingCourse && (
            <form onSubmit={handleSaveCourse} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="font-mono text-[11px] uppercase text-fg font-medium">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  value={editingCourse.title || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  placeholder="e.g. CS 162: Operating Systems"
                  className="w-full bg-bg border border-border px-3 py-2 text-sm text-fg rounded-[6px]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[11px] uppercase text-fg font-medium">
                  Syllabus / Curriculum Notes
                </label>
                <textarea
                  rows={5}
                  value={editingCourse.content || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, content: e.target.value })}
                  placeholder="Course outline, key lecture topics, and study tips..."
                  className="w-full bg-bg border border-border px-3 py-2 text-sm text-fg rounded-[6px] font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[11px] uppercase text-fg font-medium">
                  External Course Link (Optional)
                </label>
                <input
                  type="url"
                  value={editingCourse.external_url || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, external_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-bg border border-border px-3 py-1.5 text-xs font-mono text-fg rounded-[6px]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[11px] uppercase text-fg font-medium">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={editingCourse.tags?.join(", ") || ""}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="e.g. OS, Systems, C"
                  className="w-full bg-bg border border-border px-3 py-1.5 text-xs font-mono text-fg rounded-[6px]"
                />
              </div>

              <div className="border-t border-border pt-4 flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCourseModalOpen(false)}
                  className="rounded-[6px] cursor-pointer"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="rounded-[6px] cursor-pointer">
                  {editingCourse.id ? "Save Changes" : "Add Course"}
                </Button>
              </div>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
