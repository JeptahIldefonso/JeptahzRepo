"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import NextImage from "next/image";
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
  GitCommit,
} from "lucide-react";
import {
  AppType,
  EntryType,
  EntryMediaItem,
  EntryAttachedFile,
  ChangelogItem,
} from "@/db/data-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalContent } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";

interface AdminManagerProps {
  initialApps: AppType[];
  initialEntries: EntryType[];
  initialChangelog?: ChangelogItem[];
}

type TabType = "docs" | "apps" | "ideas" | "resources" | "courses" | "changelog";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseResourceSingleBox(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    return { title: "", tags: [] as string[], summary: "" };
  }

  let titleLine = "";
  let descLine = "";

  if (trimmed.includes("\n")) {
    const lines = trimmed.split("\n");
    titleLine = lines[0].trim();
    descLine = lines.slice(1).join("\n").trim();
  } else if (trimmed.includes(":") && !trimmed.startsWith("http")) {
    const colonIdx = trimmed.indexOf(":");
    titleLine = trimmed.slice(0, colonIdx).trim();
    descLine = trimmed.slice(colonIdx + 1).trim();
  } else if (trimmed.includes(" - ")) {
    const dashIdx = trimmed.indexOf(" - ");
    titleLine = trimmed.slice(0, dashIdx).trim();
    descLine = trimmed.slice(dashIdx + 3).trim();
  } else if (trimmed.includes(" // ")) {
    const slashIdx = trimmed.indexOf(" // ");
    titleLine = trimmed.slice(0, slashIdx).trim();
    descLine = trimmed.slice(slashIdx + 4).trim();
  } else {
    titleLine = trimmed;
    descLine = "";
  }

  // Extract comma-separated tokens from titleLine for tags & search indexing
  const tokens = titleLine
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    title: titleLine,
    tags: tokens.length > 0 ? tokens : [titleLine].filter(Boolean),
    summary: descLine,
  };
}

function parseAppSingleBox(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    return { title: "", category: "Desktop App", description: "" };
  }

  const lines = trimmed.split("\n");
  let title = "";
  let category = "Desktop App";
  let description = "";

  // Check if labeled format is used (Title:, Category:, Description:/Purpose:/Details:)
  const hasLabels = lines.some((l) =>
    /^(?:title|name|project\s*name|category|description|purpose|details)\s*:/i.test(l.trim())
  );

  if (hasLabels) {
    let currentSection: "title" | "category" | "description" | null = null;
    const descLines: string[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      const titleMatch = line.match(/^(?:title|name|project\s*name)\s*:\s*(.*)$/i);
      const catMatch = line.match(/^category\s*:\s*(.*)$/i);
      const descMatch = line.match(/^(?:description|purpose|details|detailed\s*breakdown\s*\/?\s*purpose)\s*:\s*(.*)$/i);

      if (titleMatch) {
        currentSection = "title";
        title = titleMatch[1].trim();
      } else if (catMatch) {
        currentSection = "category";
        const parsedCat = catMatch[1].trim();
        if (parsedCat) category = parsedCat;
      } else if (descMatch) {
        currentSection = "description";
        if (descMatch[1].trim()) {
          descLines.push(descMatch[1].trim());
        }
      } else {
        if (currentSection === "description") {
          descLines.push(rawLine);
        } else if (currentSection === "title" && !title) {
          title = line;
        } else if (currentSection === "category" && !category) {
          category = line;
        }
      }
    }
    description = descLines.join("\n").trim();
  } else {
    // Unlabeled positional fallback
    title = lines[0]?.trim() || "";
    if (lines.length > 1) {
      const line2 = lines[1]?.trim();
      if (line2 && line2.length < 40) {
        category = line2;
      }
    }
    if (lines.length > 2) {
      description = lines.slice(2).join("\n").trim();
    }
  }

  return {
    title,
    category: category || "Desktop App",
    description,
  };
}

export function AdminManager({ initialApps, initialEntries, initialChangelog }: AdminManagerProps) {
  const [apps, setApps] = useState<AppType[]>(initialApps);
  const [entries, setEntries] = useState<EntryType[]>(initialEntries);
  const [changelog, setChangelog] = useState<ChangelogItem[]>(initialChangelog || []);
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
  const [appCombinedText, setAppCombinedText] = useState("");

  const [ideaModalOpen, setIdeaModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Partial<EntryType> | null>(null);

  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Partial<EntryType> | null>(null);
  const [resourceCombinedText, setResourceCombinedText] = useState("");

  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<EntryType> | null>(null);
  const [courseSettingsMenuOpen, setCourseSettingsMenuOpen] = useState(false);
  const [showCourseVideoInput, setShowCourseVideoInput] = useState(false);
  const [showCourseTagInput, setShowCourseTagInput] = useState(false);
  const [isCourseDragging, setIsCourseDragging] = useState(false);
  const coursePhotoFileInputRef = useRef<HTMLInputElement>(null);
  const courseDocFileInputRef = useRef<HTMLInputElement>(null);

  const [changelogModalOpen, setChangelogModalOpen] = useState(false);
  const [editingChangelog, setEditingChangelog] = useState<Partial<ChangelogItem> | null>(null);
  const [changelogForm, setChangelogForm] = useState<{
    title: string;
    version_tag: string;
    category: ChangelogItem["category"];
    timestamp: string;
    description: string;
    href: string;
  }>({
    title: "",
    version_tag: "v1.2.5",
    category: "feature",
    timestamp: "Today",
    description: "",
    href: "/home/docs",
  });

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
            const newMediaItem: EntryMediaItem = {
              id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              type: "image",
              url: data.url,
              caption: file.name.replace(/\.[^/.]+$/, ""),
            };
            if (courseModalOpen) {
              setEditingCourse((prev) => ({
                ...prev,
                media_items: [...(prev?.media_items || []), newMediaItem],
              }));
            } else {
              setEditingDoc((prev) => ({
                ...prev,
                media_items: [...(prev?.media_items || []), newMediaItem],
              }));
            }
          } else if (file.type.startsWith("video/")) {
            if (courseModalOpen) {
              setEditingCourse((prev) => ({
                ...prev,
                video_url: data.url,
              }));
            } else {
              setEditingDoc((prev) => ({
                ...prev,
                video_url: data.url,
              }));
            }
          } else {
            // PDF, Word, or other doc
            const docType: EntryAttachedFile["type"] =
              ext === "pdf" ? "pdf" : ext === "doc" || ext === "docx" ? "word" : "file";
            const newFileItem: EntryAttachedFile = {
              id: `f-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              name: file.name,
              url: data.url,
              size: sizeStr,
              type: docType,
            };
            if (courseModalOpen) {
              setEditingCourse((prev) => ({
                ...prev,
                attached_files: [...(prev?.attached_files || []), newFileItem],
              }));
            } else {
              setEditingDoc((prev) => ({
                ...prev,
                attached_files: [...(prev?.attached_files || []), newFileItem],
              }));
            }
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

  // Drag and Drop handlers for Course Creator
  const handleCourseDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCourseDragging(true);
  };

  const handleCourseDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCourseDragging(false);
  };

  const handleCourseDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCourseDragging(false);
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
      description: "",
      category: "Desktop App",
      carousel_images: [],
      repo_url: "",
      gdrive_url: "",
      tech_stack: ["React", "TypeScript"],
      is_featured: false,
    });
    setAppCombinedText("");
    setAppModalOpen(true);
  };

  const handleOpenEditApp = (app: AppType) => {
    setEditingApp({ ...app });
    const titleLine = app.title ? `Title: ${app.title}` : "";
    const catLine = `Category: ${app.category || "Desktop App"}`;
    const descSection = app.description ? `Description:\n${app.description}` : "Description:\n";
    const combined = [titleLine, catLine, descSection].filter(Boolean).join("\n");
    setAppCombinedText(combined);
    setAppModalOpen(true);
  };

  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseAppSingleBox(appCombinedText);
    const finalTitle = parsed.title || editingApp?.title || "";
    if (!finalTitle) {
      showNotification("Please provide a project name or title.");
      return;
    }

    const payload = {
      ...editingApp,
      title: finalTitle,
      category: parsed.category || editingApp?.category || "Desktop App",
      description: parsed.description || editingApp?.description || "",
      slug: editingApp?.slug ? slugify(editingApp.slug) : slugify(finalTitle),
      tech_stack: editingApp?.tech_stack || [],
      carousel_images: editingApp?.carousel_images || [],
    };

    if (editingApp?.id) {
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
    setAppCombinedText("");
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
      tags: [],
      is_pinned: false,
      is_published: true,
    });
    setResourceCombinedText("");
    setResourceModalOpen(true);
  };

  const handleOpenEditResource = (resItem: EntryType) => {
    setEditingResource({ ...resItem });
    const existingTitle = resItem.title || "";
    // If there are tags not already present in the title, append them to keep everything visible & editable in 1 box
    const extraTags = (resItem.tags || []).filter(
      (t) => !existingTitle.toLowerCase().includes(t.toLowerCase())
    );
    const titleLine = extraTags.length > 0 ? `${existingTitle}, ${extraTags.join(", ")}` : existingTitle;
    const descLine = resItem.summary || resItem.content || "";
    const combined = descLine ? `${titleLine}\n${descLine}` : titleLine;
    setResourceCombinedText(combined);
    setResourceModalOpen(true);
  };

  const handleSaveResource = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseResourceSingleBox(resourceCombinedText);
    const finalTitle = parsed.title || editingResource?.title || "";
    if (!finalTitle) {
      showNotification("Please enter at least a title or search keyword.");
      return;
    }
    if (!editingResource?.external_url) {
      showNotification("Please provide a destination URL.");
      return;
    }

    const payload = {
      ...editingResource,
      title: finalTitle,
      slug: editingResource?.slug
        ? slugify(editingResource.slug)
        : slugify(finalTitle.split(",")[0].trim() || finalTitle),
      type: "link",
      topic_slug: "resources",
      external_url: editingResource?.external_url || null,
      summary: parsed.summary || editingResource?.summary || "",
      content: parsed.summary || editingResource?.content || "",
      is_pinned: Boolean(editingResource?.is_pinned),
      is_published: editingResource?.is_published !== false,
      tags: parsed.tags.length > 0 ? parsed.tags : editingResource?.tags || [],
    };

    if (editingResource?.id) {
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
    setResourceCombinedText("");
  };

  // -------------------------
  // 5. COURSES CRUD (Academic Syllabus & Curriculum)
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
      is_pinned: false,
      media_items: [],
      attached_files: [],
      video_url: "",
    });
    setCourseSettingsMenuOpen(false);
    setShowCourseVideoInput(false);
    setShowCourseTagInput(false);
    setCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: EntryType) => {
    setEditingCourse({
      ...course,
      media_items: course.media_items || [],
      attached_files: course.attached_files || [],
      tags: course.tags || [],
    });
    setCourseSettingsMenuOpen(false);
    setShowCourseVideoInput(!!course.external_url || !!course.video_url);
    setShowCourseTagInput(!!(course.tags && course.tags.length > 0));
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
      external_url: editingCourse.external_url || null,
      video_url: editingCourse.video_url || null,
      summary: editingCourse.summary || (editingCourse.content ? editingCourse.content.slice(0, 160) + "..." : ""),
      is_published: editingCourse.is_published !== false,
      is_pinned: Boolean(editingCourse.is_pinned),
      tags: editingCourse.tags || [],
      media_items: editingCourse.media_items || [],
      attached_files: editingCourse.attached_files || [],
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

  // -------------------------
  // Changelog Management Handlers
  // -------------------------
  const handleOpenNewChangelog = () => {
    setEditingChangelog(null);
    setChangelogForm({
      title: "",
      version_tag: "v1.2.5",
      category: "feature",
      timestamp: "Today",
      description: "",
      href: "/home/docs",
    });
    setChangelogModalOpen(true);
  };

  const handleOpenEditChangelog = (item: ChangelogItem) => {
    setEditingChangelog(item);
    setChangelogForm({
      title: item.title,
      version_tag: item.version_tag || "",
      category: item.category || "feature",
      timestamp: item.timestamp,
      description: item.description || "",
      href: item.href || "/home/docs",
    });
    setChangelogModalOpen(true);
  };

  const handleSaveChangelog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changelogForm.title.trim()) return;

    const payload = {
      title: changelogForm.title.trim(),
      version_tag: changelogForm.version_tag.trim(),
      category: changelogForm.category,
      timestamp: changelogForm.timestamp.trim() || "Just now",
      description: changelogForm.description.trim(),
      href: changelogForm.href.trim() || "/home/docs",
    };

    if (editingChangelog?.id) {
      const res = await fetch(`/api/changelog/${editingChangelog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setChangelog((prev) =>
          prev.map((item) => (item.id === editingChangelog.id ? data.data : item))
        );
        showNotification(`Updated changelog "${data.data.title}"`);
        window.dispatchEvent(new CustomEvent("changelog_updated"));
        try {
          localStorage.setItem("changelog_last_updated", String(Date.now()));
        } catch {}
      }
    } else {
      const res = await fetch("/api/changelog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setChangelog((prev) => [data.data, ...prev]);
        showNotification(`Added changelog "${data.data.title}"`);
        window.dispatchEvent(new CustomEvent("changelog_updated"));
        try {
          localStorage.setItem("changelog_last_updated", String(Date.now()));
        } catch {}
      }
    }

    setChangelogModalOpen(false);
    setEditingChangelog(null);
  };

  const handleDeleteChangelog = async (id: string, title: string) => {
    if (!confirm(`Delete changelog entry "${title}"?`)) return;
    const res = await fetch(`/api/changelog/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setChangelog((prev) => prev.filter((item) => item.id !== id));
      showNotification(`Deleted "${title}"`);
      window.dispatchEvent(new CustomEvent("changelog_updated"));
      try {
        localStorage.setItem("changelog_last_updated", String(Date.now()));
      } catch {}
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
      (a.category && a.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.description && a.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      a.tech_stack?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredIdeas = ideasEntries.filter(
    (e) =>
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredResources = resourcesEntries.filter((e) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    if (e.title.toLowerCase().includes(q)) return true;
    if (e.summary && e.summary.toLowerCase().includes(q)) return true;
    if (e.tags?.some((t) => t.toLowerCase().includes(q))) return true;

    // Multi-keyword comma search (e.g. user types "react, web")
    const searchTerms = q.split(",").map((s) => s.trim()).filter(Boolean);
    if (searchTerms.length > 1) {
      return searchTerms.some(
        (term) =>
          e.title.toLowerCase().includes(term) ||
          (e.summary && e.summary.toLowerCase().includes(term)) ||
          e.tags?.some((t) => t.toLowerCase().includes(term))
      );
    }
    return false;
  });

  const filteredCourses = coursesEntries.filter(
    (e) =>
      !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredChangelog = changelog.filter(
    (c) =>
      !searchQuery ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.version_tag && c.version_tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.category && c.category.toLowerCase().includes(searchQuery.toLowerCase()))
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
            <span>Helpful Links</span>
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
          className={`text-left p-3.5 border rounded-[8px] transition-all cursor-pointer ${
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

        <button
          onClick={() => {
            setActiveTab("changelog");
            setSearchQuery("");
          }}
          className={`text-left p-3.5 border rounded-[8px] transition-all cursor-pointer ${
            activeTab === "changelog"
              ? "bg-[#041a24] text-white border-[#041a24] shadow-sm"
              : "bg-bg-raised border-border hover:border-black/30 text-fg"
          }`}
        >
          <div className="flex items-center justify-between text-xs font-mono opacity-80">
            <span>Changelog</span>
            <GitCommit className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-display font-medium mt-1">{changelog.length}</div>
          <div className="text-[10px] opacity-70 mt-0.5 truncate">#041a24 Rail Stream</div>
        </button>
      </div>

      {/* ── Dedicated Tab Selector Pill Bar ── */}
      <div className="flex items-center justify-between border-b border-border pb-3 gap-3 overflow-x-auto">
        <div className="flex items-center space-x-1 p-0.5 bg-neutral-200/70 rounded-[6px] shrink-0">
          <button
            onClick={() => {
              setActiveTab("docs");
              setSearchQuery("");
            }}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-[5px] text-[11px] font-mono transition-all cursor-pointer ${
              activeTab === "docs"
                ? "bg-white text-black font-semibold shadow-2xs"
                : "text-neutral-600 hover:text-black"
            }`}
          >
            <BookOpen className="w-3 h-3" />
            <span>Docs ({docsEntries.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("apps");
              setSearchQuery("");
            }}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-[5px] text-[11px] font-mono transition-all cursor-pointer ${
              activeTab === "apps"
                ? "bg-white text-black font-semibold shadow-2xs"
                : "text-neutral-600 hover:text-black"
            }`}
          >
            <Box className="w-3 h-3" />
            <span>Projects ({apps.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("ideas");
              setSearchQuery("");
            }}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-[5px] text-[11px] font-mono transition-all cursor-pointer ${
              activeTab === "ideas"
                ? "bg-white text-black font-semibold shadow-2xs"
                : "text-neutral-600 hover:text-black"
            }`}
          >
            <Lightbulb className="w-3 h-3" />
            <span>Ideas ({ideasEntries.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("resources");
              setSearchQuery("");
            }}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-[5px] text-[11px] font-mono transition-all cursor-pointer ${
              activeTab === "resources"
                ? "bg-white text-black font-semibold shadow-2xs"
                : "text-neutral-600 hover:text-black"
            }`}
          >
            <Link2 className="w-3 h-3" />
            <span>Links ({resourcesEntries.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("courses");
              setSearchQuery("");
            }}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-[5px] text-[11px] font-mono transition-all cursor-pointer ${
              activeTab === "courses"
                ? "bg-white text-black font-semibold shadow-2xs"
                : "text-neutral-600 hover:text-black"
            }`}
          >
            <GraduationCap className="w-3 h-3" />
            <span>Courses ({coursesEntries.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("changelog");
              setSearchQuery("");
            }}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-[5px] text-[11px] font-mono transition-all cursor-pointer ${
              activeTab === "changelog"
                ? "bg-white text-black font-semibold shadow-2xs"
                : "text-neutral-600 hover:text-black"
            }`}
          >
            <GitCommit className="w-3 h-3 text-sky-500" />
            <span>Changelog ({changelog.length})</span>
          </button>
        </div>

        {/* Tab Specific Quick Create Button - Bigger & More Prominent */}
        <div className="shrink-0">
          {activeTab === "docs" && (
            <Button
              size="md"
              onClick={handleOpenNewDoc}
              className="h-10 px-4 text-xs font-semibold shadow-xs hover:shadow-md transition-all rounded-[6px] cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2 stroke-[2.25]" />
              <span>Create Note / Post</span>
            </Button>
          )}
          {activeTab === "apps" && (
            <Button
              size="md"
              onClick={handleOpenNewApp}
              className="h-10 px-4 text-xs font-semibold shadow-xs hover:shadow-md transition-all rounded-[6px] cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2 stroke-[2.25]" />
              <span>Add Project</span>
            </Button>
          )}
          {activeTab === "ideas" && (
            <Button
              size="md"
              onClick={handleOpenNewIdea}
              className="h-10 px-4 text-xs font-semibold shadow-xs hover:shadow-md transition-all rounded-[6px] cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2 stroke-[2.25]" />
              <span>New Idea / Log</span>
            </Button>
          )}
          {activeTab === "resources" && (
            <Button
              size="md"
              onClick={handleOpenNewResource}
              className="h-10 px-4 text-xs font-semibold shadow-xs hover:shadow-md transition-all rounded-[6px] cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2 stroke-[2.25]" />
              <span>Add Helpful Link</span>
            </Button>
          )}
          {activeTab === "courses" && (
            <Button
              size="md"
              onClick={handleOpenNewCourse}
              className="h-10 px-4 text-xs font-semibold shadow-xs hover:shadow-md transition-all rounded-[6px] cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-2 stroke-[2.25]" />
              <span>Add Course Guide</span>
            </Button>
          )}
          {activeTab === "changelog" && (
            <Button
              size="md"
              onClick={handleOpenNewChangelog}
              className="h-10 px-4 text-xs font-semibold shadow-xs hover:shadow-md transition-all rounded-[6px] cursor-pointer bg-[#041a24] hover:bg-[#062432] text-white"
            >
              <Plus className="w-4 h-4 mr-2 stroke-[2.25]" />
              <span>Add Changelog Entry</span>
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
              : activeTab === "courses"
              ? filteredCourses.length
              : filteredChangelog.length}
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
                  </div>

                  {app.description && (
                    <p className="text-xs text-fg-muted line-clamp-1">
                      {app.description.replace(/[#*`_]/g, "").slice(0, 120)}
                    </p>
                  )}

                  <div className="flex items-center flex-wrap gap-1.5 text-[10px] font-mono text-fg-subtle pt-0.5">
                    {app.carousel_images && app.carousel_images.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-[4px] bg-bg border border-border">
                        {app.carousel_images.length} frame{app.carousel_images.length > 1 ? "s" : ""}
                      </span>
                    )}
                    {app.tech_stack?.slice(0, 3).map((tech) => (
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
              No helpful links found. Click &quot;+ Add Helpful Link&quot; to save a bookmark.
            </div>
          ) : (
            filteredResources.map((resItem) => (
              <div
                key={resItem.id}
                className="border border-border bg-bg-raised p-4 rounded-[8px] hover:border-black/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap">
                    {resItem.is_pinned && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-[4px] bg-[#041a24] text-white text-[10px] font-mono font-medium shadow-2xs">
                        <Pin className="w-2.5 h-2.5 fill-white rotate-45" />
                        <span>Pinned</span>
                      </span>
                    )}
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
                    {course.is_pinned && (
                      <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded-[4px]">
                        <Pin className="w-2.5 h-2.5 fill-sky-700" />
                        <span>Pinned</span>
                      </span>
                    )}
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
                    {course.attached_files && course.attached_files.length > 0 && (
                      <span className="inline-flex items-center space-x-1 text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-[4px]">
                        <Paperclip className="w-2.5 h-2.5" />
                        <span>{course.attached_files.length} doc{course.attached_files.length > 1 ? "s" : ""}</span>
                      </span>
                    )}
                    {course.media_items && course.media_items.length > 0 && (
                      <span className="inline-flex items-center space-x-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-[4px]">
                        <ImageIcon className="w-2.5 h-2.5" />
                        <span>{course.media_items.length} slide{course.media_items.length > 1 ? "s" : ""}</span>
                      </span>
                    )}
                    {course.external_url && (
                      <span className="inline-flex items-center space-x-1 text-[10px] text-neutral-600 bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded-[4px]">
                        <ExternalLink className="w-2.5 h-2.5" />
                        <span>Portal</span>
                      </span>
                    )}
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
      {/* TAB 6: CHANGELOG (Right Floating Panel Entries) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeTab === "changelog" && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-[8px] bg-[#041a24] text-white border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] text-white/80">
                These entries power the formal right-side changelog rail on /home, /home/docs, /home/courses, /home/ideas, and /home/resources.
              </span>
            </div>
            <Link
              href="/home"
              target="_blank"
              className="inline-flex items-center space-x-1 font-mono text-[10px] text-sky-300 hover:text-white transition-colors shrink-0"
            >
              <span>Preview Live Rail</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {filteredChangelog.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-[8px] text-xs font-mono text-fg-subtle">
              No changelog entries found. Click &quot;+ Add Changelog Entry&quot; to publish your first milestone.
            </div>
          ) : (
            filteredChangelog.map((log) => (
              <div
                key={log.id}
                className="border border-border bg-bg-raised p-4 rounded-[8px] hover:border-black/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center space-x-2 flex-wrap">
                    {log.version_tag && (
                      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-[3px] bg-[#041a24] text-white">
                        {log.version_tag}
                      </span>
                    )}
                    <span className="font-medium text-sm text-fg tracking-tight">
                      {log.title}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded-[3px] bg-neutral-200 text-neutral-700 font-semibold">
                      {log.category}
                    </span>
                    <span className="text-[10px] font-mono text-fg-subtle">
                      {log.timestamp}
                    </span>
                  </div>

                  <p className="text-xs text-fg-muted line-clamp-2">
                    {log.description}
                  </p>

                  {log.href && (
                    <div className="text-[10px] font-mono text-fg-subtle pt-0.5">
                      Target Link: <span className="text-neutral-500">{log.href}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleOpenEditChangelog(log)}
                    className="p-1.5 text-fg-subtle hover:text-fg border border-border hover:border-black/30 rounded-[6px] transition-colors cursor-pointer"
                    title="Edit Changelog Entry"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteChangelog(log.id, log.title)}
                    className="p-1.5 text-fg-subtle hover:text-red-600 border border-border hover:border-red-200 rounded-[6px] transition-colors cursor-pointer"
                    title="Delete Changelog Entry"
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
                  <div className="w-10 h-10 rounded-full overflow-hidden shadow-xs shrink-0 ring-1 ring-black/10 select-none">
                    <NextImage
                      src="/avatar.png"
                      alt="Jeptah Ildefonso"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[#041a24] leading-tight">
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
                  className="w-full text-base font-semibold text-[#041a24] placeholder:text-neutral-400 border-none bg-transparent px-0 py-1 focus:outline-none focus:ring-0"
                />

                {/* Primary Post Textarea (What's on your mind?) */}
                <textarea
                  rows={4}
                  value={editingDoc.content || ""}
                  onChange={(e) => setEditingDoc({ ...editingDoc, content: e.target.value })}
                  placeholder="What's on your mind, Jeptah? Write an announcement, note, or dev log..."
                  className="w-full text-sm text-[#041a24] placeholder:text-neutral-400 border-none bg-transparent px-0 py-1 focus:outline-none focus:ring-0 resize-none font-sans leading-relaxed"
                />

                {/* Attached Media Previews (Photos Mosaic - Full Uncropped View) */}
                {editingDoc.media_items && editingDoc.media_items.length > 0 && (
                  <div className="pt-2">
                    <div
                      className={`grid gap-2.5 ${
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
                          className="relative group rounded-[10px] overflow-hidden border border-neutral-200 bg-neutral-100/60 flex items-center justify-center p-1"
                        >
                          <img
                            src={item.url}
                            alt={item.caption || "Attached photo"}
                            className="w-full h-auto max-h-[460px] object-contain rounded-[6px] block"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDoc((prev) => ({
                                ...prev,
                                media_items: (prev?.media_items || []).filter((_, i) => i !== idx),
                              }));
                            }}
                            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/75 hover:bg-red-600 text-white shadow-md transition-all cursor-pointer"
                            title="Remove photo"
                          >
                            <X className="w-4 h-4" />
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
                          <span className="truncate font-sans font-medium text-black">
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
                  className="w-full py-2.5 rounded-[8px] bg-black text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer flex items-center justify-center space-x-2"
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
            <form onSubmit={handleSaveApp} className="space-y-4 p-5 max-h-[85vh] overflow-y-auto">
              {/* 1 Single Box: Title, Category, and Description with Guidelines */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] uppercase text-fg font-medium">
                    Project Details (Single Box) *
                  </label>
                  <span className="text-[10px] font-mono text-fg-subtle">
                    Title • Category • Description
                  </span>
                </div>
                <textarea
                  rows={7}
                  required
                  value={appCombinedText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAppCombinedText(val);
                    const parsed = parseAppSingleBox(val);
                    setEditingApp((prev) =>
                      prev
                        ? {
                            ...prev,
                            title: parsed.title,
                            category: parsed.category,
                            description: parsed.description,
                          }
                        : null
                    );
                  }}
                  placeholder={"Title: VibeAlarm\nCategory: Desktop App\nDescription:\nA lightweight desktop productivity application that launches on computer startup to keep you on schedule with custom alarms, calendar planning, and task reminders."}
                  className="w-full bg-bg border border-border px-3 py-2.5 text-xs text-fg rounded-[6px] focus:outline-none focus:border-black/50 font-sans leading-relaxed resize-y min-h-[140px]"
                />
                <div className="text-[11px] text-fg-subtle font-sans leading-tight space-y-0.5">
                  <p>
                    <span className="font-semibold text-fg">Guideline Format:</span> Use prefixes like{" "}
                    <code className="font-mono text-[10px] bg-neutral-100 px-1 py-0.5 rounded">Title:</code>,{" "}
                    <code className="font-mono text-[10px] bg-neutral-100 px-1 py-0.5 rounded">Category:</code>, and{" "}
                    <code className="font-mono text-[10px] bg-neutral-100 px-1 py-0.5 rounded">Description:</code> (or enter Title on Line 1, Category on Line 2, and Purpose on Line 3+).
                  </p>
                </div>
              </div>

              {/* Real-time Project Breakdown Live Pill */}
              {appCombinedText.trim() && (
                <div className="rounded-[8px] border border-border bg-neutral-50/80 p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase text-fg font-medium tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      Detected Project Breakdown
                    </span>
                    <span className="text-[10px] font-mono text-fg-subtle">live preview</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                    <div className="bg-white border border-border px-2 py-0.5 rounded-[4px]">
                      <span className="text-fg-subtle text-[10px]">Title: </span>
                      <span className="font-semibold text-fg">
                        {parseAppSingleBox(appCombinedText).title || "(Enter title...)"}
                      </span>
                    </div>
                    <div className="bg-white border border-border px-2 py-0.5 rounded-[4px]">
                      <span className="text-fg-subtle text-[10px]">Category: </span>
                      <span className="font-semibold text-fg">
                        {parseAppSingleBox(appCombinedText).category}
                      </span>
                    </div>
                  </div>
                  {parseAppSingleBox(appCombinedText).description && (
                    <div className="pt-2 border-t border-neutral-200/60">
                      <span className="font-mono text-[10px] text-fg-subtle block mb-0.5">
                        Purpose &amp; Details:
                      </span>
                      <p className="text-fg-muted text-[11px] leading-relaxed line-clamp-3">
                        {parseAppSingleBox(appCombinedText).description}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Links (GitHub & GDrive) placed below the single box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-mono text-[11px] uppercase text-fg font-medium">GitHub Repository URL</label>
                  <input
                    type="url"
                    value={editingApp.repo_url || ""}
                    onChange={(e) => setEditingApp({ ...editingApp, repo_url: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg rounded-[6px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[11px] uppercase text-fg font-medium">Google Drive Download URL</label>
                  <input
                    type="url"
                    value={editingApp.gdrive_url || ""}
                    onChange={(e) => setEditingApp({ ...editingApp, gdrive_url: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg rounded-[6px]"
                  />
                </div>
              </div>

              {/* Tech Stack (optional) placed below repo and gdrive */}
              <div className="space-y-1">
                <label className="font-mono text-[11px] uppercase text-fg font-medium">
                  Tech Stack (comma separated, optional)
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
                  placeholder="e.g. React, Rust, SQLite, TypeScript"
                  className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg rounded-[6px]"
                />
              </div>

              {/* Slight Thicker Screenshot Upload Zone */}
              <div className="space-y-3 p-5 bg-neutral-50/80 border-2 border-dashed border-neutral-300 hover:border-black/40 rounded-[10px] transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <ImageIcon className="w-4 h-4 text-black" />
                      <span className="font-mono text-xs uppercase text-fg font-semibold tracking-wider">
                        Carousel Screenshots ({editingApp.carousel_images?.length || 0})
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 font-sans">
                      High-resolution interface captures for the interactive showcase carousel.
                    </p>
                  </div>

                  <label className="inline-flex items-center justify-center space-x-2 px-4 py-2 text-xs font-mono font-medium bg-black text-white hover:opacity-90 rounded-[6px] cursor-pointer transition-opacity shadow-2xs shrink-0">
                    {uploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    <span>{uploading ? "Uploading..." : "Upload Screenshots"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      disabled={uploading}
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 0) {
                          setUploading(true);
                          try {
                            for (const file of files) {
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
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-neutral-200">
                    {editingApp.carousel_images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group border border-neutral-200 rounded-[8px] overflow-hidden bg-white shadow-2xs p-1"
                      >
                        <img
                          src={img.url}
                          alt={img.caption || `Frame ${idx + 1}`}
                          className="w-full h-24 object-contain rounded-[4px] bg-neutral-50"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setEditingApp((prev) => ({
                              ...prev,
                              carousel_images: (prev?.carousel_images || []).filter((_, i) => i !== idx),
                            }));
                          }}
                          className="absolute top-2 right-2 p-1 bg-black/75 text-white rounded-[4px] hover:bg-red-600 transition-colors cursor-pointer"
                          title="Remove screenshot"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <span className="block text-[10px] font-mono text-neutral-500 truncate px-1 pt-1">
                          {img.caption || `Frame ${idx + 1}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
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
          title={editingResource?.id ? "Edit Helpful Link" : "Add Helpful Link / Bookmark"}
        >
          {editingResource && (
            <form onSubmit={handleSaveResource} className="space-y-4 p-5 max-h-[85vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="font-mono text-[11px] uppercase text-fg font-medium flex items-center justify-between">
                  <span>Destination URL *</span>
                  <span className="text-[10px] text-fg-subtle lowercase">https://...</span>
                </label>
                <input
                  type="url"
                  required
                  value={editingResource.external_url || ""}
                  onChange={(e) =>
                    setEditingResource({ ...editingResource, external_url: e.target.value })
                  }
                  placeholder="https://github.com/..."
                  className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg rounded-[6px] focus:outline-none focus:border-black/50"
                />
              </div>

              {/* 1 Single Box: Title (comma-separated keywords) and Description */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] uppercase text-fg font-medium">
                    Title &amp; Description (Single Box) *
                  </label>
                  <span className="text-[10px] font-mono text-fg-subtle">
                    1 Box • Comma-separated title
                  </span>
                </div>
                <textarea
                  rows={5}
                  required
                  value={resourceCombinedText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setResourceCombinedText(val);
                    const parsed = parseResourceSingleBox(val);
                    setEditingResource((prev) =>
                      prev
                        ? {
                            ...prev,
                            title: parsed.title,
                            tags: parsed.tags,
                            summary: parsed.summary,
                            content: parsed.summary,
                          }
                        : null
                    );
                  }}
                  placeholder={"React 19, Documentation, Web Development, UI Library\nOfficial documentation and interactive guides for building modern web applications."}
                  className="w-full bg-bg border border-border px-3 py-2.5 text-xs text-fg rounded-[6px] focus:outline-none focus:border-black/50 font-sans leading-relaxed resize-y min-h-[120px]"
                />
                <p className="text-[11px] text-fg-subtle font-sans leading-tight">
                  <span className="font-semibold text-fg">First line:</span> Title terms separated by commas (e.g. <code className="font-mono text-[10px] bg-neutral-100 px-1 py-0.5 rounded">React, Web Dev, UI</code>) so every keyword is searchable. <br />
                  <span className="font-semibold text-fg">Next lines:</span> Description or summary notes for the bookmark.
                </p>
              </div>

              {/* Live Search Index & Preview Pill */}
              {resourceCombinedText.trim() && (
                <div className="rounded-[8px] border border-border bg-neutral-50/80 p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase text-fg font-medium tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      Searchable Keywords ({parseResourceSingleBox(resourceCombinedText).tags.length})
                    </span>
                    <span className="text-[10px] font-mono text-fg-subtle">live index</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {parseResourceSingleBox(resourceCombinedText).tags.map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[10px] font-mono bg-white border border-border text-fg shadow-2xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  {parseResourceSingleBox(resourceCombinedText).summary ? (
                    <div className="pt-2 border-t border-neutral-200/60">
                      <span className="font-mono text-[10px] text-fg-subtle block mb-0.5">
                        Description Preview:
                      </span>
                      <p className="text-fg-muted text-[11px] leading-relaxed line-clamp-3">
                        {parseResourceSingleBox(resourceCombinedText).summary}
                      </p>
                    </div>
                  ) : (
                    <div className="pt-1 text-[10px] text-fg-subtle italic">
                      Tip: Press Enter or type &quot;:&quot; to add a description on the next line.
                    </div>
                  )}
                </div>
              )}

              {/* Pin this link toggle */}
              <div className="flex items-center justify-between p-2.5 bg-neutral-50 border border-neutral-200 rounded-[6px] text-xs font-mono">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(editingResource.is_pinned)}
                    onChange={(e) =>
                      setEditingResource({ ...editingResource, is_pinned: e.target.checked })
                    }
                    className="rounded accent-black cursor-pointer"
                  />
                  <span className="text-fg font-medium">Pin link to top (noticeable shining gray)</span>
                </label>
                {editingResource.is_pinned && (
                  <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-white bg-[#041a24] px-1.5 py-0.5 rounded-[4px]">
                    <Pin className="w-2.5 h-2.5 fill-white rotate-45" />
                    <span>Pinned</span>
                  </span>
                )}
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
      {/* 5. DEDICATED MODAL: COURSES (Academic Syllabus & Curriculum) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <Modal open={courseModalOpen} onOpenChange={setCourseModalOpen}>
        <ModalContent
          className="max-w-xl p-0 overflow-hidden rounded-[14px] bg-white border border-neutral-300 shadow-2xl"
          title={editingCourse?.id ? "Edit Course Guide" : "Create Course Guide"}
          headerActions={
            <div className="relative flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setCourseSettingsMenuOpen(!courseSettingsMenuOpen)}
                className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-600 hover:text-black transition-colors cursor-pointer"
                title="Course Settings (Pin, Publish, Slug)"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {/* Course Settings Popover */}
              {courseSettingsMenuOpen && editingCourse && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setCourseSettingsMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-8 z-50 w-64 bg-white border border-neutral-200 rounded-[10px] shadow-xl p-3 space-y-3 animate-in fade-in zoom-in-95">
                    <div className="font-mono text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                      Course Guide Settings
                    </div>

                    {/* Pin to top */}
                    <label className="flex items-center justify-between text-xs cursor-pointer hover:bg-neutral-50 p-1.5 rounded-[6px]">
                      <span className="flex items-center space-x-2 font-medium text-black">
                        <Pin className="w-3.5 h-3.5 text-sky-600" />
                        <span>Pin to top of Curricula</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={Boolean(editingCourse.is_pinned)}
                        onChange={(e) =>
                          setEditingCourse({ ...editingCourse, is_pinned: e.target.checked })
                        }
                        className="rounded border-neutral-300 text-black focus:ring-black"
                      />
                    </label>

                    {/* Published status */}
                    <label className="flex items-center justify-between text-xs cursor-pointer hover:bg-neutral-50 p-1.5 rounded-[6px]">
                      <span className="flex items-center space-x-2 font-medium text-black">
                        <Globe className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Published Publicly</span>
                      </span>
                      <input
                        type="checkbox"
                        checked={editingCourse.is_published !== false}
                        onChange={(e) =>
                          setEditingCourse({ ...editingCourse, is_published: e.target.checked })
                        }
                        className="rounded border-neutral-300 text-black focus:ring-black"
                      />
                    </label>

                    {/* Custom slug */}
                    <div className="pt-2 border-t border-neutral-100 space-y-1">
                      <label className="font-mono text-[10px] text-neutral-500 uppercase">
                        Custom URL Slug
                      </label>
                      <input
                        type="text"
                        value={editingCourse.slug || ""}
                        onChange={(e) =>
                          setEditingCourse({ ...editingCourse, slug: e.target.value })
                        }
                        placeholder="e.g. cs162-operating-systems"
                        className="w-full bg-neutral-50 border border-neutral-200 px-2 py-1 text-xs font-mono rounded-[4px] focus:outline-none focus:bg-white"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          }
        >
          {editingCourse && (
            <form
              onSubmit={handleSaveCourse}
              onDragOver={handleCourseDragOver}
              onDragLeave={handleCourseDragLeave}
              onDrop={handleCourseDrop}
              className="flex flex-col max-h-[82vh] relative"
            >
              {/* Drag & Drop Visual Overlay */}
              {isCourseDragging && (
                <div className="absolute inset-0 z-30 bg-sky-500/10 border-2 border-dashed border-sky-500 backdrop-blur-2xs rounded-[12px] flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-150">
                  <Upload className="w-10 h-10 text-sky-600 animate-bounce mb-2" />
                  <span className="font-semibold text-sm text-sky-800">
                    Drop course slides, syllabus PDFs, or materials here
                  </span>
                  <span className="text-xs text-sky-600 mt-1">
                    Auto-attaches directly to this curriculum guide
                  </span>
                </div>
              )}

              {/* Scrollable Course Content Body */}
              <div className="overflow-y-auto px-5 py-3 space-y-3 flex-1">
                {/* Academic Instructor Banner */}
                <div className="flex items-center space-x-3 pt-1">
                  <div className="w-10 h-10 rounded-full overflow-hidden shadow-xs shrink-0 ring-1 ring-black/10 select-none">
                    <NextImage
                      src="/avatar.png"
                      alt="Jeptah Ildefonso"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[#041a24] leading-tight">
                      Jeptah Ildefonso
                    </div>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-[4px]">
                        <BookOpen className="w-3 h-3 text-neutral-600" />
                        <span>CS Curriculum</span>
                      </span>
                      {editingCourse.is_pinned && (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-sky-700 bg-sky-50 border border-sky-200 px-1.5 py-0.5 rounded-[4px]">
                          <Pin className="w-2.5 h-2.5 fill-sky-700" />
                          <span>Pinned</span>
                        </span>
                      )}
                      {!editingCourse.is_published && (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-mono text-neutral-600 bg-neutral-200 px-1.5 py-0.5 rounded-[4px]">
                          <EyeOff className="w-2.5 h-2.5" />
                          <span>Draft</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Course Code & Title Headline Input */}
                <input
                  type="text"
                  required
                  value={editingCourse.title || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  placeholder="Course Code & Title (e.g. CS 162: Operating Systems & System Programming)..."
                  className="w-full text-base font-semibold text-[#041a24] placeholder:text-neutral-400 border-none bg-transparent px-0 py-1 focus:outline-none focus:ring-0"
                />

                {/* Syllabus / Curriculum Roadmaps Body */}
                <textarea
                  rows={4}
                  value={editingCourse.content || ""}
                  onChange={(e) => setEditingCourse({ ...editingCourse, content: e.target.value })}
                  placeholder="Syllabus overview, core lecture roadmaps, recommended textbooks, prerequisite concepts, and study notes (Markdown supported)..."
                  className="w-full text-sm text-[#041a24] placeholder:text-neutral-400 border-none bg-transparent px-0 py-1 focus:outline-none focus:ring-0 resize-none font-sans leading-relaxed"
                />

                {/* Attached Diagrams / Lecture Slides Preview Mosaic (Uncropped) */}
                {editingCourse.media_items && editingCourse.media_items.length > 0 && (
                  <div className="pt-2">
                    <div
                      className={`grid gap-2.5 ${
                        editingCourse.media_items.length === 1
                          ? "grid-cols-1"
                          : editingCourse.media_items.length === 2
                          ? "grid-cols-2"
                          : "grid-cols-3"
                      }`}
                    >
                      {editingCourse.media_items.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="relative group rounded-[10px] overflow-hidden border border-neutral-200 bg-neutral-100/60 flex items-center justify-center p-1"
                        >
                          <img
                            src={item.url}
                            alt={item.caption || "Course diagram/slide"}
                            className="w-full h-auto max-h-[460px] object-contain rounded-[6px] block"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCourse((prev) => ({
                                ...prev,
                                media_items: (prev?.media_items || []).filter((_, i) => i !== idx),
                              }));
                            }}
                            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/75 hover:bg-red-600 text-white shadow-md transition-all cursor-pointer"
                            title="Remove slide"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attached Course Documents Preview (PDF, Word, Zip) */}
                {editingCourse.attached_files && editingCourse.attached_files.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {editingCourse.attached_files.map((file, idx) => (
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
                          <span className="truncate font-sans font-medium text-black">
                            {file.name}
                          </span>
                          {file.size && <span className="text-neutral-500">({file.size})</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCourse((prev) => ({
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

                {/* Optional External Course Portal / Video Link Input */}
                {showCourseVideoInput && (
                  <div className="flex items-center gap-2 p-2 bg-neutral-100 rounded-[8px] animate-in fade-in">
                    <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
                    <input
                      type="url"
                      value={editingCourse.external_url || ""}
                      onChange={(e) => setEditingCourse({ ...editingCourse, external_url: e.target.value })}
                      placeholder="External course portal or syllabus URL (e.g. https://cs162.org)..."
                      className="flex-1 bg-transparent text-xs font-mono focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCourseVideoInput(false)}
                      className="text-neutral-400 hover:text-black cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Optional Course Tags / Topic Codes Input */}
                {showCourseTagInput && (
                  <div className="flex items-center gap-2 p-2 bg-neutral-100 rounded-[8px] animate-in fade-in">
                    <Hash className="w-4 h-4 text-amber-600 shrink-0" />
                    <input
                      type="text"
                      value={editingCourse.tags?.join(", ") || ""}
                      onChange={(e) =>
                        setEditingCourse({
                          ...editingCourse,
                          tags: e.target.value
                            .split(",")
                            .map((s) => s.trim().replace(/^#/, ""))
                            .filter(Boolean),
                        })
                      }
                      placeholder="Course tags & topics (e.g. CS162, OperatingSystems, Concurrency, C)..."
                      className="flex-1 bg-transparent text-xs font-mono focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCourseTagInput(false)}
                      className="text-neutral-400 hover:text-black cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* ── Toolbar: "Add course materials" ── */}
              <div className="px-5 py-2.5 border-t border-neutral-200 bg-neutral-50/70 flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-700">Add course materials</span>

                <div className="flex items-center space-x-1">
                  {/* Diagram / Slide trigger */}
                  <button
                    type="button"
                    onClick={() => coursePhotoFileInputRef.current?.click()}
                    title="Upload Lecture Slides / Diagrams"
                    className="p-2 rounded-full hover:bg-neutral-200/80 text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <input
                    ref={coursePhotoFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      processFiles(files);
                      e.target.value = "";
                    }}
                  />

                  {/* Document / Syllabus attachment trigger */}
                  <button
                    type="button"
                    onClick={() => courseDocFileInputRef.current?.click()}
                    title="Attach Syllabus / Documents (PDF, Word, etc.)"
                    className="p-2 rounded-full hover:bg-neutral-200/80 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    ref={courseDocFileInputRef}
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

                  {/* Course Portal Link trigger */}
                  <button
                    type="button"
                    onClick={() => setShowCourseVideoInput(!showCourseVideoInput)}
                    title="Add Course Portal Link"
                    className="p-2 rounded-full hover:bg-neutral-200/80 text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>

                  {/* Course Codes & Topic Tags trigger */}
                  <button
                    type="button"
                    onClick={() => setShowCourseTagInput(!showCourseTagInput)}
                    title="Add Course Codes & Topics"
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
                  disabled={uploading || (!editingCourse.title && !editingCourse.content)}
                  className="w-full py-2.5 rounded-[8px] bg-black text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer flex items-center justify-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading materials...</span>
                    </>
                  ) : (
                    <span>{editingCourse.id ? "Save Changes" : "Add Course Guide"}</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* 6. DEDICATED CHANGELOG ENTRY MODAL */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <Modal open={changelogModalOpen} onOpenChange={setChangelogModalOpen}>
        <ModalContent
          className="max-w-lg p-0 overflow-hidden rounded-[14px] bg-white border border-neutral-300 shadow-2xl"
          title={editingChangelog?.id ? "Edit Changelog Entry" : "New Changelog Entry"}
        >
          <form onSubmit={handleSaveChangelog} className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-mono font-semibold text-neutral-700 mb-1">
                Headline / Title *
              </label>
              <input
                type="text"
                required
                value={changelogForm.title}
                onChange={(e) =>
                  setChangelogForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g. Unified GitHub profile avatar across platform"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-[6px] focus:outline-none focus:border-black font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-semibold text-neutral-700 mb-1">
                  Version / Tag
                </label>
                <input
                  type="text"
                  value={changelogForm.version_tag}
                  onChange={(e) =>
                    setChangelogForm((prev) => ({ ...prev, version_tag: e.target.value }))
                  }
                  placeholder="e.g. v1.2.5 or FEATURE"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-[6px] focus:outline-none focus:border-black font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-neutral-700 mb-1">
                  Category
                </label>
                <select
                  value={changelogForm.category}
                  onChange={(e) =>
                    setChangelogForm((prev) => ({
                      ...prev,
                      category: e.target.value as ChangelogItem["category"],
                    }))
                  }
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-[6px] focus:outline-none focus:border-black font-mono bg-white cursor-pointer"
                >
                  <option value="feature">Feature</option>
                  <option value="release">Release</option>
                  <option value="fix">Fix</option>
                  <option value="doc">Documentation</option>
                  <option value="system">System</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono font-semibold text-neutral-700 mb-1">
                  Timestamp / Date Display
                </label>
                <input
                  type="text"
                  value={changelogForm.timestamp}
                  onChange={(e) =>
                    setChangelogForm((prev) => ({ ...prev, timestamp: e.target.value }))
                  }
                  placeholder="e.g. Today, Oct 23, 8 hours ago"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-[6px] focus:outline-none focus:border-black font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-neutral-700 mb-1">
                  Target Link (Optional)
                </label>
                <input
                  type="text"
                  value={changelogForm.href}
                  onChange={(e) =>
                    setChangelogForm((prev) => ({ ...prev, href: e.target.value }))
                  }
                  placeholder="e.g. /home/docs"
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-[6px] focus:outline-none focus:border-black font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-neutral-700 mb-1">
                Summary / Description
              </label>
              <textarea
                rows={3}
                value={changelogForm.description}
                onChange={(e) =>
                  setChangelogForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Briefly explain what was added, updated, or improved..."
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-[6px] focus:outline-none focus:border-black font-sans resize-none"
              />
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setChangelogModalOpen(false)}
                className="px-3.5 py-2 text-xs font-mono rounded-[6px] border border-neutral-300 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-[6px] bg-[#041a24] text-white hover:bg-[#062432] transition-colors cursor-pointer shadow-xs"
              >
                {editingChangelog?.id ? "Save Changes" : "Publish to Changelog"}
              </button>
            </div>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
