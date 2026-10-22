"use client";

import React, { useState, useMemo, useRef } from "react";
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
  EyeOff,
  MoreHorizontal,
  Hash,
  Globe,
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

  // ── Drag & drop state for the note modal ──
  const [isDragging, setIsDragging] = useState(false);

  // ── Modals for each dedicated section ──
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Partial<EntryType> | null>(null);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [showVideoInput, setShowVideoInput] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);

  const [appModalOpen, setAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Partial<AppType> | null>(null);

  const [ideaModalOpen, setIdeaModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Partial<EntryType> | null>(null);

  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Partial<EntryType> | null>(null);

  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<EntryType> | null>(null);

  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);

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

  // -------------------------
  // Universal Upload & Ingestion
  // -------------------------
  const processFiles = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    let uploadedCount = 0;

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        if (data.success && data.url) {
          uploadedCount++;
          const ext = file.name.split(".").pop()?.toLowerCase();
          const sizeMb = file.size / (1024 * 1024);
          const sizeStr =
            sizeMb >= 1
              ? `${sizeMb.toFixed(1)} MB`
              : `${Math.round(file.size / 1024)} KB`;

          if (file.type.startsWith("image/")) {
            setEditingDoc((prev) => ({
              ...prev,
              media_items: [
                ...(prev?.media_items || []),
                {
                  id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  type: "image",
                  url: data.url,
                  caption: file.name.replace(/\.[^/.]+$/, ""),
                },
              ],
            }));
          } else if (file.type.startsWith("video/")) {
            setEditingDoc((prev) => ({
              ...prev,
              video_url: data.url,
            }));
          } else {
            // PDF, Word, or other doc
            const docType: EntryAttachedFile["type"] =
              ext === "pdf" ? "pdf" : ext === "doc" || ext === "docx" ? "word" : "file";
            setEditingDoc((prev) => ({
              ...prev,
              attached_files: [
                ...(prev?.attached_files || []),
                {
                  id: `f-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  name: file.name,
                  url: data.url,
                  size: sizeStr,
                  type: docType,
                },
              ],
            }));
          }
        }
      }

      if (uploadedCount > 0) {
        showNotification(`Attached ${uploadedCount} file${uploadedCount > 1 ? "s" : ""}`);
      }
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Drag and Drop handlers for Note Creator
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFiles(files);
    }
  };

  // -------------------------
  // 1. NOTES & DOCS CRUD (Social Post Flow)
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
    setSettingsMenuOpen(false);
    setShowVideoInput(false);
    setShowTagInput(false);
    setDocModalOpen(true);
  };

  const handleOpenEditDoc = (doc: EntryType) => {
    setEditingDoc({ ...doc });
    setSettingsMenuOpen(false);
    setShowVideoInput(Boolean(doc.video_url));
    setShowTagInput(Boolean(doc.tags && doc.tags.length > 0));
    setDocModalOpen(true);
  };

  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;

    const trimmedContent = editingDoc.content?.trim() || "";
    // If title was left blank, derive a clean title from the first sentence or default
    const derivedTitle =
      editingDoc.title?.trim() ||
      trimmedContent.split("\n")[0]?.slice(0, 50).replace(/[#*`_]/g, "") ||
      "Announcement";

    const payload = {
      ...editingDoc,
      title: derivedTitle,
      slug: editingDoc.slug ? slugify(editingDoc.slug) : slugify(derivedTitle),
      type: "doc",
      topic_slug: "docs",
      content: trimmedContent,
      summary:
        editingDoc.summary ||
        (trimmedContent ? trimmedContent.slice(0, 160).replace(/[#*`_]/g, "") + "..." : ""),
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
        showNotification(`Updated post "${data.data.title}"`);
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
        showNotification(`Published post "${data.data.title}"`);
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
    setAppModalOpen(true);
  };

  const handleOpenEditApp = (app: AppType) => {
    setEditingApp({ ...app });
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
      tags: ["Idea"],
      is_published: true,
    });
    setIdeaModalOpen(true);
  };

  const handleOpenEditIdea = (idea: EntryType) => {
    setEditingIdea({ ...idea });
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
    setResourceModalOpen(true);
  };

  const handleOpenEditResource = (resItem: EntryType) => {
    setEditingResource({ ...resItem });
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
    setCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: EntryType) => {
    setEditingCourse({ ...course });
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
              <span>Create Note / Post</span>
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
              No notes or announcements found. Click &quot;+ Create Note / Post&quot; to publish one.
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
                    {!item.is_published && (
                      <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-[4px] bg-neutral-200 text-neutral-700 text-[10px] font-mono">
                        <EyeOff className="w-2.5 h-2.5" />
                        <span>Draft</span>
                      </span>
                    )}
                    <span className="font-medium text-sm text-fg tracking-tight truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono text-fg-subtle">
                      {formatDate(item.created_at)}
                    </span>
                  </div>

                  {item.content && (
                    <p className="text-xs text-fg-muted line-clamp-2">{item.content}</p>
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
      {/* 1. DEDICATED FACEBOOK-STYLE POST MODAL: NOTES & DOCS */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <Modal open={docModalOpen} onOpenChange={setDocModalOpen}>
        <ModalContent
          className="max-w-xl p-0 overflow-hidden rounded-[14px] bg-white border border-neutral-300 shadow-2xl"
          title={editingDoc?.id ? "Edit post" : "Create post"}
          headerActions={
            <div className="relative">
              <button
                type="button"
                onClick={() => setSettingsMenuOpen(!settingsMenuOpen)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-600 hover:text-black transition-colors cursor-pointer"
                title="Post settings (Pin, Visibility, Slug)"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>

              {/* Three-Dot Settings Popover */}
              {settingsMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setSettingsMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-9 w-64 bg-white border border-neutral-200 shadow-xl rounded-[10px] p-3 z-50 space-y-3 animate-in fade-in zoom-in-95">
                    <div className="font-mono text-[10px] uppercase text-neutral-500 font-semibold tracking-wider">
                      Post Settings
                    </div>

                    {/* Pin Toggle */}
                    <label className="flex items-center justify-between text-xs font-sans cursor-pointer py-1 hover:text-black">
                      <div className="flex items-center space-x-2">
                        <Pin className="w-3.5 h-3.5 text-sky-600" />
                        <span>Pin to top of feed</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={editingDoc?.is_pinned || false}
                        onChange={(e) =>
                          setEditingDoc((prev) => (prev ? { ...prev, is_pinned: e.target.checked } : null))
                        }
                        className="rounded-[3px] accent-black"
                      />
                    </label>

                    {/* Visibility Toggle */}
                    <label className="flex items-center justify-between text-xs font-sans cursor-pointer py-1 border-t border-neutral-100 pt-2 hover:text-black">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Published publicly</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={editingDoc?.is_published !== false}
                        onChange={(e) =>
                          setEditingDoc((prev) => (prev ? { ...prev, is_published: e.target.checked } : null))
                        }
                        className="rounded-[3px] accent-black"
                      />
                    </label>

                    {/* URL Slug */}
                    <div className="border-t border-neutral-100 pt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 uppercase">
                        <span>Custom URL Slug</span>
                      </div>
                      <input
                        type="text"
                        value={editingDoc?.slug || ""}
                        onChange={(e) =>
                          setEditingDoc((prev) => (prev ? { ...prev, slug: e.target.value } : null))
                        }
                        placeholder="auto-generated-from-title"
                        className="w-full bg-neutral-50 border border-neutral-200 px-2.5 py-1 text-xs font-mono rounded-[4px] focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          }
        >
          {editingDoc && (
            <form
              onSubmit={handleSaveDoc}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="flex flex-col max-h-[82vh] relative"
            >
              {/* Drag & Drop Visual Overlay */}
              {isDragging && (
                <div className="absolute inset-0 z-30 bg-sky-500/10 border-2 border-dashed border-sky-500 backdrop-blur-2xs rounded-[12px] flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-150">
                  <Upload className="w-10 h-10 text-sky-600 animate-bounce mb-2" />
                  <span className="font-semibold text-sm text-sky-800">
                    Drop photos, videos, or documents here
                  </span>
                  <span className="text-xs text-sky-600 mt-1">
                    Auto-attaches directly to your post
                  </span>
                </div>
              )}

              {/* Scrollable Post Content Body */}
              <div className="overflow-y-auto px-5 py-3 space-y-3 flex-1">
                {/* Author row (FB style) */}
                <div className="flex items-center space-x-3 pt-1">
                  <div className="w-10 h-10 rounded-full bg-neutral-900 text-white font-medium flex items-center justify-center text-sm shadow-xs shrink-0 select-none">
                    JI
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-neutral-900 leading-tight">
                      Jeptah Ildefonso
                    </div>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-[4px]">
                        <Globe className="w-3 h-3 text-neutral-500" />
                        <span>Public Feed</span>
                      </span>
                      {editingDoc.is_pinned && (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded-[4px]">
                          <Pin className="w-2.5 h-2.5 fill-sky-700" />
                          <span>Pinned</span>
                        </span>
                      )}
                      {!editingDoc.is_published && (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-neutral-600 bg-neutral-200 px-1.5 py-0.5 rounded-[4px]">
                          <EyeOff className="w-2.5 h-2.5" />
                          <span>Draft</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Optional Headline / Title Input */}
                <input
                  type="text"
                  value={editingDoc.title || ""}
                  onChange={(e) => setEditingDoc({ ...editingDoc, title: e.target.value })}
                  placeholder="Post title or headline (optional)..."
                  className="w-full text-base font-semibold text-neutral-900 placeholder:text-neutral-400 border-none bg-transparent px-0 py-1 focus:outline-none focus:ring-0"
                />

                {/* Primary Post Textarea (What's on your mind?) */}
                <textarea
                  rows={4}
                  value={editingDoc.content || ""}
                  onChange={(e) => setEditingDoc({ ...editingDoc, content: e.target.value })}
                  placeholder="What's on your mind, Jeptah? Write an announcement, note, or dev log..."
                  className="w-full text-sm text-neutral-900 placeholder:text-neutral-400 border-none bg-transparent px-0 py-1 focus:outline-none focus:ring-0 resize-none font-sans leading-relaxed"
                />

                {/* Attached Media Previews (Photos Mosaic) */}
                {editingDoc.media_items && editingDoc.media_items.length > 0 && (
                  <div className="pt-2">
                    <div
                      className={`grid gap-2 ${
                        editingDoc.media_items.length === 1
                          ? "grid-cols-1"
                          : editingDoc.media_items.length === 2
                          ? "grid-cols-2"
                          : "grid-cols-3"
                      }`}
                    >
                      {editingDoc.media_items.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="relative group rounded-[8px] overflow-hidden border border-neutral-200 bg-neutral-100"
                        >
                          <img
                            src={item.url}
                            alt={item.caption || "Attached photo"}
                            className="w-full h-32 object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDoc((prev) => ({
                                ...prev,
                                media_items: (prev?.media_items || []).filter((_, i) => i !== idx),
                              }));
                            }}
                            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 hover:bg-red-600 text-white transition-colors cursor-pointer"
                            title="Remove photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attached Video Preview */}
                {editingDoc.video_url && (
                  <div className="flex items-center justify-between p-2.5 bg-neutral-50 border border-neutral-200 rounded-[8px] text-xs font-mono">
                    <div className="flex items-center space-x-2 truncate">
                      <Video className="w-4 h-4 text-rose-500 shrink-0" />
                      <span className="truncate text-neutral-700">{editingDoc.video_url}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingDoc({ ...editingDoc, video_url: "" })}
                      className="p-1 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                      title="Remove video"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Attached Document Files Preview (PDF, Word, etc.) */}
                {editingDoc.attached_files && editingDoc.attached_files.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {editingDoc.attached_files.map((file, idx) => (
                      <div
                        key={file.id || idx}
                        className="flex items-center justify-between p-2.5 bg-neutral-50 border border-neutral-200 rounded-[8px] text-xs font-mono"
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          <span
                            className={`uppercase font-bold px-1.5 py-0.5 rounded text-[10px] ${
                              file.type === "pdf"
                                ? "bg-red-100 text-red-700"
                                : file.type === "word"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-neutral-200 text-neutral-700"
                            }`}
                          >
                            {file.type}
                          </span>
                          <span className="truncate font-sans font-medium text-neutral-900">
                            {file.name}
                          </span>
                          {file.size && <span className="text-neutral-500">({file.size})</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingDoc((prev) => ({
                              ...prev,
                              attached_files: (prev?.attached_files || []).filter((_, i) => i !== idx),
                            }));
                          }}
                          className="p-1 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Remove file"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Optional Inline Video Link Input */}
                {showVideoInput && (
                  <div className="flex items-center gap-2 p-2 bg-neutral-100 rounded-[8px] animate-in fade-in">
                    <Video className="w-4 h-4 text-rose-500 shrink-0" />
                    <input
                      type="url"
                      value={editingDoc.video_url || ""}
                      onChange={(e) => setEditingDoc({ ...editingDoc, video_url: e.target.value })}
                      placeholder="Paste MP4 video or YouTube URL..."
                      className="flex-1 bg-transparent text-xs font-mono focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowVideoInput(false)}
                      className="text-neutral-400 hover:text-black cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Optional Inline Hashtags Input */}
                {showTagInput && (
                  <div className="flex items-center gap-2 p-2 bg-neutral-100 rounded-[8px] animate-in fade-in">
                    <Hash className="w-4 h-4 text-amber-600 shrink-0" />
                    <input
                      type="text"
                      value={editingDoc.tags?.join(", ") || ""}
                      onChange={(e) =>
                        setEditingDoc({
                          ...editingDoc,
                          tags: e.target.value
                            .split(",")
                            .map((s) => s.trim().replace(/^#/, ""))
                            .filter(Boolean),
                        })
                      }
                      placeholder="Hashtags separated by comma (e.g. Algorithms, DistributedSystems)..."
                      className="flex-1 bg-transparent text-xs font-mono focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowTagInput(false)}
                      className="text-neutral-400 hover:text-black cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* ── Facebook-style "Add to your post" toolbar ── */}
              <div className="px-5 py-2.5 border-t border-neutral-200 bg-neutral-50/70 flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-700">Add to your note</span>

                <div className="flex items-center space-x-1">
                  {/* Photo / Video upload trigger */}
                  <button
                    type="button"
                    onClick={() => photoFileInputRef.current?.click()}
                    title="Photo / Video"
                    className="p-2 rounded-full hover:bg-neutral-200/80 text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <input
                    ref={photoFileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      processFiles(files);
                      e.target.value = "";
                    }}
                  />

                  {/* Document / File attachment trigger */}
                  <button
                    type="button"
                    onClick={() => docFileInputRef.current?.click()}
                    title="Attach Document (PDF, Word, etc.)"
                    className="p-2 rounded-full hover:bg-neutral-200/80 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    ref={docFileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.zip,.txt"
                    multiple
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      processFiles(files);
                      e.target.value = "";
                    }}
                  />

                  {/* Video URL Link trigger */}
                  <button
                    type="button"
                    onClick={() => setShowVideoInput(!showVideoInput)}
                    title="Add Video Link"
                    className="p-2 rounded-full hover:bg-neutral-200/80 text-rose-500 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Video className="w-5 h-5" />
                  </button>

                  {/* Hashtags trigger */}
                  <button
                    type="button"
                    onClick={() => setShowTagInput(!showTagInput)}
                    title="Add Hashtags"
                    className="p-2 rounded-full hover:bg-neutral-200/80 text-amber-600 hover:text-amber-700 transition-colors cursor-pointer"
                  >
                    <Hash className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Bottom Post Button */}
              <div className="p-4 bg-white border-t border-neutral-100">
                <button
                  type="submit"
                  disabled={
                    uploading ||
                    (!editingDoc.content && !editingDoc.title && !editingDoc.media_items?.length)
                  }
                  className="w-full py-2.5 rounded-[8px] bg-black text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer flex items-center justify-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading media...</span>
                    </>
                  ) : (
                    <span>{editingDoc.id ? "Save Changes" : "Post Note"}</span>
                  )}
                </button>
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
          className="max-w-2xl p-0 overflow-hidden rounded-[14px] bg-white border border-neutral-300 shadow-2xl"
          title={editingApp?.id ? "Edit Project Showcase" : "Add Project Showcase"}
        >
          {editingApp && (
            <form onSubmit={handleSaveApp} className="space-y-4 p-5 max-h-[80vh] overflow-y-auto">
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
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploading(true);
                          try {
                            const formData = new FormData();
                            formData.append("file", file);
                            const res = await fetch("/api/upload", { method: "POST", body: formData });
                            const data = await res.json();
                            if (data.success && data.url) {
                              setEditingApp((prev) => ({
                                ...prev,
                                carousel_images: [
                                  ...(prev?.carousel_images || []),
                                  {
                                    url: data.url,
                                    caption: file.name.replace(/\.[^/.]+$/, ""),
                                  },
                                ],
                              }));
                            }
                          } finally {
                            setUploading(false);
                          }
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
          className="max-w-lg p-0 overflow-hidden rounded-[14px] bg-white border border-neutral-300 shadow-2xl"
          title={editingIdea?.id ? "Edit Idea / Log" : "New Idea or Dev Log"}
        >
          {editingIdea && (
            <form onSubmit={handleSaveIdea} className="space-y-4 p-5 max-h-[80vh] overflow-y-auto">
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
          className="max-w-lg p-0 overflow-hidden rounded-[14px] bg-white border border-neutral-300 shadow-2xl"
          title={editingResource?.id ? "Edit Useful Link" : "Add Useful Link / Bookmark"}
        >
          {editingResource && (
            <form onSubmit={handleSaveResource} className="space-y-4 p-5 max-h-[80vh] overflow-y-auto">
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
          className="max-w-lg p-0 overflow-hidden rounded-[14px] bg-white border border-neutral-300 shadow-2xl"
          title={editingCourse?.id ? "Edit Course Guide" : "Add Course Guide"}
        >
          {editingCourse && (
            <form onSubmit={handleSaveCourse} className="space-y-4 p-5 max-h-[80vh] overflow-y-auto">
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
