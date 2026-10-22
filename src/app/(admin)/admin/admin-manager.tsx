"use client";

import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Box,
  FileText,
  HardDrive,
  ExternalLink,
  Check,
  X,
  Search,
  Image as ImageIcon,
  Upload,
  Loader2,
} from "lucide-react";
import { AppType, EntryType } from "@/db/data-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalContent } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";

interface AdminManagerProps {
  initialApps: AppType[];
  initialEntries: EntryType[];
}

export function AdminManager({ initialApps, initialEntries }: AdminManagerProps) {
  const [apps, setApps] = useState<AppType[]>(initialApps);
  const [entries, setEntries] = useState<EntryType[]>(initialEntries);
  const [activeTab, setActiveTab] = useState<"entries" | "apps">("entries");
  const [message, setMessage] = useState<string | null>(null);

  // Modal States
  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Partial<EntryType> | null>(null);

  const [appModalOpen, setAppModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Partial<AppType> | null>(null);

  // HD Image Upload States for Entries
  const [uploadingImage, setUploadingImage] = useState(false);
  const [insertImageUrl, setInsertImageUrl] = useState("");
  const [insertImageAlt, setInsertImageAlt] = useState("");

  const handleFileUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setInsertImageUrl(data.url);
        if (!insertImageAlt) {
          setInsertImageAlt(file.name.replace(/\.[^/.]+$/, ""));
        }
        showNotification("HD Image uploaded successfully!");
      } else {
        alert(data.error || "Failed to upload image");
      }
    } catch (err: any) {
      alert(err.message || "Upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const insertImageIntoMarkdown = () => {
    if (!insertImageUrl) return;
    const caption = insertImageAlt || "High-Definition Visual";
    const snippet = `\n\n![${caption}](${insertImageUrl})\n\n`;
    setEditingEntry((prev) => ({
      ...prev,
      content: (prev?.content || "") + snippet,
    }));
    setInsertImageUrl("");
    setInsertImageAlt("");
    showNotification("HD Image inserted into document!");
  };

  const showNotification = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  };

  // -------------------------
  // Entries CRUD
  // -------------------------
  const handleOpenNewEntry = () => {
    setEditingEntry({
      title: "",
      slug: "",
      type: "doc",
      topic_slug: "docs",
      summary: "",
      content: "",
      tags: [],
      is_pinned: false,
      is_published: true,
    });
    setEntryModalOpen(true);
  };

  const handleOpenEditEntry = (entry: EntryType) => {
    setEditingEntry({ ...entry });
    setEntryModalOpen(true);
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEntry?.title) return;

    if (editingEntry.id) {
      // Update
      const res = await fetch(`/api/entries/${editingEntry.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingEntry),
      });
      const data = await res.json();
      if (data.success) {
        setEntries((prev) =>
          prev.map((item) => (item.id === editingEntry.id ? data.data : item))
        );
        showNotification(`Updated entry "${data.data.title}"`);
      }
    } else {
      // Create
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingEntry),
      });
      const data = await res.json();
      if (data.success) {
        setEntries((prev) => [data.data, ...prev]);
        showNotification(`Created entry "${data.data.title}"`);
      }
    }
    setEntryModalOpen(false);
    setEditingEntry(null);
  };

  const handleDeleteEntry = async (id: string, title: string) => {
    if (!confirm(`Delete entry "${title}"?`)) return;
    const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setEntries((prev) => prev.filter((item) => item.id !== id));
      showNotification(`Deleted entry "${title}"`);
    }
  };

  // -------------------------
  // Apps CRUD
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
      carousel_images: [
        {
          url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
          caption: "Primary Application Viewport",
        },
      ],
      repo_url: "",
      gdrive_url: "",
      tech_stack: ["Rust", "React", "TypeScript"],
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
    if (!editingApp?.title) return;

    if (editingApp.id) {
      // Update
      const res = await fetch(`/api/apps/${editingApp.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingApp),
      });
      const data = await res.json();
      if (data.success) {
        setApps((prev) =>
          prev.map((item) => (item.id === editingApp.id ? data.data : item))
        );
        showNotification(`Updated app "${data.data.title}"`);
      }
    } else {
      // Create
      const res = await fetch("/api/apps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingApp),
      });
      const data = await res.json();
      if (data.success) {
        setApps((prev) => [...prev, data.data]);
        showNotification(`Created app "${data.data.title}"`);
      }
    }
    setAppModalOpen(false);
    setEditingApp(null);
  };

  const handleDeleteApp = async (id: string, title: string) => {
    if (!confirm(`Delete application "${title}"?`)) return;
    const res = await fetch(`/api/apps/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      setApps((prev) => prev.filter((item) => item.id !== id));
      showNotification(`Deleted app "${title}"`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Notifications */}
      {message && (
        <div className="fixed bottom-4 right-4 z-50 bg-fg text-bg-raised px-4 py-2 text-xs font-mono rounded-[2px] shadow-lg flex items-center space-x-2 animate-in fade-in">
          <Check className="w-3.5 h-3.5" />
          <span>{message}</span>
        </div>
      )}

      {/* Overview Stat Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="border border-border bg-bg-raised p-4 rounded-[2px]">
          <div className="font-mono text-[10px] text-fg-subtle uppercase">
            Total Entries
          </div>
          <div className="font-display text-2xl font-medium text-fg mt-1">
            {entries.length}
          </div>
        </div>
        <div className="border border-border bg-bg-raised p-4 rounded-[2px]">
          <div className="font-mono text-[10px] text-fg-subtle uppercase">
            Apps Showcase
          </div>
          <div className="font-display text-2xl font-medium text-fg mt-1">
            {apps.length}
          </div>
        </div>
        <div className="border border-border bg-bg-raised p-4 rounded-[2px]">
          <div className="font-mono text-[10px] text-fg-subtle uppercase">
            Security Status
          </div>
          <div className="font-display text-base font-medium text-fg mt-1 flex items-center space-x-1.5">
            <span className="h-2 w-2 rounded-full bg-fg" />
            <span>RLS Active</span>
          </div>
        </div>
        <div className="border border-border bg-bg-raised p-4 rounded-[2px]">
          <div className="font-mono text-[10px] text-fg-subtle uppercase">
            Storage Engine
          </div>
          <div className="font-display text-base font-medium text-fg mt-1">
            Supabase / S3
          </div>
        </div>
      </div>

      {/* Navigation Tabs & Creation Triggers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center space-x-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab("entries")}
            className={`px-3 py-1.5 rounded-[2px] transition-colors cursor-pointer ${
              activeTab === "entries"
                ? "bg-fg text-bg-raised font-medium"
                : "text-fg-subtle hover:text-fg hover:bg-bg-hover"
            }`}
          >
            Repository Entries ({entries.length})
          </button>
          <button
            onClick={() => setActiveTab("apps")}
            className={`px-3 py-1.5 rounded-[2px] transition-colors cursor-pointer ${
              activeTab === "apps"
                ? "bg-fg text-bg-raised font-medium"
                : "text-fg-subtle hover:text-fg hover:bg-bg-hover"
            }`}
          >
            Showcase Apps ({apps.length})
          </button>
        </div>

        <div>
          {activeTab === "entries" ? (
            <Button size="sm" onClick={handleOpenNewEntry}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>New Entry</span>
            </Button>
          ) : (
            <Button size="sm" onClick={handleOpenNewApp}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>New App Showcase</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tab 1: Entries Table */}
      {activeTab === "entries" && (
        <div className="border border-border bg-bg-raised rounded-[2px] overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-bg text-fg-subtle uppercase tracking-wider text-[10px]">
                <th className="p-3">Title / Slug</th>
                <th className="p-3">Type</th>
                <th className="p-3">Topic</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-bg-hover/50 transition-colors">
                  <td className="p-3 font-medium text-fg">
                    <div>{entry.title}</div>
                    <div className="text-[10px] text-fg-subtle font-normal">{entry.slug}</div>
                  </td>
                  <td className="p-3">
                    <Badge variant="subtle" className="uppercase">
                      {entry.type}
                    </Badge>
                  </td>
                  <td className="p-3 text-fg-muted">{entry.topic_slug || "—"}</td>
                  <td className="p-3">
                    {entry.is_pinned && <Badge variant="default" className="mr-1">Pinned</Badge>}
                    <span className="text-fg-subtle text-[10px]">
                      {entry.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="p-3 text-fg-subtle text-[10px]">
                    {formatDate(entry.created_at)}
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <button
                      onClick={() => handleOpenEditEntry(entry)}
                      className="p-1 text-fg-subtle hover:text-fg rounded-[2px]"
                      title="Edit Entry"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEntry(entry.id, entry.title)}
                      className="p-1 text-fg-subtle hover:text-red-600 rounded-[2px]"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Apps Table */}
      {activeTab === "apps" && (
        <div className="border border-border bg-bg-raised rounded-[2px] overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-border bg-bg text-fg-subtle uppercase tracking-wider text-[10px]">
                <th className="p-3">Application</th>
                <th className="p-3">Category</th>
                <th className="p-3">Version</th>
                <th className="p-3">Carousels</th>
                <th className="p-3">GDrive Link</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {apps.map((app) => (
                <tr key={app.id} className="hover:bg-bg-hover/50 transition-colors">
                  <td className="p-3 font-medium text-fg">
                    <div>{app.title}</div>
                    <div className="text-[10px] text-fg-subtle font-normal truncate max-w-xs">
                      {app.tagline}
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="subtle">{app.category}</Badge>
                  </td>
                  <td className="p-3 text-fg">{app.version}</td>
                  <td className="p-3 text-fg-subtle">
                    {app.carousel_images?.length || 0} frames
                  </td>
                  <td className="p-3 text-fg-subtle text-[10px]">
                    {app.gdrive_url ? "Configured" : "Unset"}
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <button
                      onClick={() => handleOpenEditApp(app)}
                      className="p-1 text-fg-subtle hover:text-fg rounded-[2px]"
                      title="Edit App"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteApp(app.id, app.title)}
                      className="p-1 text-fg-subtle hover:text-red-600 rounded-[2px]"
                      title="Delete App"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Entry Modal Form */}
      <Modal open={entryModalOpen} onOpenChange={setEntryModalOpen}>
        <ModalContent
          className="max-w-2xl max-h-[85vh] overflow-y-auto"
          title={editingEntry?.id ? "Edit Repository Entry" : "Create Repository Entry"}
        >
          {editingEntry && (
            <form onSubmit={handleSaveEntry} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase text-fg-subtle">Title</label>
                  <input
                    type="text"
                    required
                    value={editingEntry.title || ""}
                    onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
                    className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[2px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase text-fg-subtle">Slug</label>
                  <input
                    type="text"
                    value={editingEntry.slug || ""}
                    onChange={(e) => setEditingEntry({ ...editingEntry, slug: e.target.value })}
                    className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[2px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase text-fg-subtle">Type</label>
                  <select
                    value={editingEntry.type || "doc"}
                    onChange={(e: any) => setEditingEntry({ ...editingEntry, type: e.target.value })}
                    className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[2px]"
                  >
                    <option value="doc">Doc / Theory</option>
                    <option value="course">Course Curriculum</option>
                    <option value="project">Project / Repo</option>
                    <option value="link">Resource / Link</option>
                    <option value="idea">Raw Idea / Devlog</option>
                    <option value="file">Downloadable File</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase text-fg-subtle">Topic</label>
                  <select
                    value={editingEntry.topic_slug || "docs"}
                    onChange={(e) => setEditingEntry({ ...editingEntry, topic_slug: e.target.value })}
                    className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[2px]"
                  >
                    <option value="docs">Docs & Theory</option>
                    <option value="courses">Courses & Curricula</option>
                    <option value="projects">Code Repositories</option>
                    <option value="resources">Curated Links</option>
                    <option value="ideas">Raw Ideas</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[10px] uppercase text-fg-subtle">Summary / Excerpt</label>
                <textarea
                  rows={2}
                  value={editingEntry.summary || ""}
                  onChange={(e) => setEditingEntry({ ...editingEntry, summary: e.target.value })}
                  className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[2px]"
                />
              </div>

              {/* Cover Image Field */}
              <div className="space-y-1.5 p-3 border border-border bg-bg/50 rounded-[2px]">
                <label className="font-mono text-[10px] uppercase text-fg-subtle flex items-center justify-between">
                  <span>Cover Banner Image URL (Optional)</span>
                  <span className="text-[9px] text-fg-subtle">Displays full-bleed at top of doc</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editingEntry.cover_image_url || ""}
                    onChange={(e) => setEditingEntry({ ...editingEntry, cover_image_url: e.target.value })}
                    placeholder="https://images.unsplash.com/... or uploaded URL"
                    className="flex-1 bg-bg border border-border px-3 py-1.5 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[2px]"
                  />
                  {editingEntry.cover_image_url && (
                    <img
                      src={editingEntry.cover_image_url}
                      alt="Cover Preview"
                      className="h-8 w-12 object-cover border border-border rounded-[2px]"
                    />
                  )}
                </div>
              </div>

              {/* HD Image Insertion Assistant for Markdown */}
              <div className="space-y-2 p-3 border border-border/80 bg-bg-raised rounded-[2px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 font-mono text-[10px] uppercase text-fg font-medium">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Insert HD Image into Content</span>
                  </div>
                  <span className="font-mono text-[9px] text-fg-subtle">
                    Auto-enables full HD zoom lightbox
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                  {/* File Upload Button */}
                  <div className="sm:col-span-4">
                    <label className="flex items-center justify-center space-x-1.5 border border-dashed border-border hover:border-fg bg-bg px-2.5 py-1.5 text-xs font-mono text-fg-subtle hover:text-fg cursor-pointer transition-colors rounded-[2px]">
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span className="text-[10px]">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3 h-3" />
                          <span className="text-[10px]">Upload HD File</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingImage}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                      />
                    </label>
                  </div>

                  {/* Image URL Input */}
                  <div className="sm:col-span-8 flex gap-1.5">
                    <input
                      type="url"
                      value={insertImageUrl}
                      onChange={(e) => setInsertImageUrl(e.target.value)}
                      placeholder="Paste Image URL or uploaded..."
                      className="flex-1 bg-bg border border-border px-2 py-1 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[2px]"
                    />
                    <input
                      type="text"
                      value={insertImageAlt}
                      onChange={(e) => setInsertImageAlt(e.target.value)}
                      placeholder="Caption..."
                      className="w-24 bg-bg border border-border px-2 py-1 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[2px]"
                    />
                    <button
                      type="button"
                      onClick={insertImageIntoMarkdown}
                      disabled={!insertImageUrl}
                      className="px-2.5 py-1 bg-fg text-bg-raised font-mono text-[10px] uppercase font-medium hover:opacity-90 disabled:opacity-40 transition-opacity rounded-[2px] cursor-pointer shrink-0"
                    >
                      Insert
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[10px] uppercase text-fg-subtle">Markdown Content</label>
                <textarea
                  rows={7}
                  value={editingEntry.content || ""}
                  onChange={(e) => setEditingEntry({ ...editingEntry, content: e.target.value })}
                  placeholder="## Heading\n\nContent in markdown with code snippets and ![HD Image](url)..."
                  className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[2px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase text-fg-subtle">External Link (Optional)</label>
                  <input
                    type="url"
                    value={editingEntry.external_url || ""}
                    onChange={(e) => setEditingEntry({ ...editingEntry, external_url: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[2px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase text-fg-subtle">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={editingEntry.tags?.join(", ") || ""}
                    onChange={(e) =>
                      setEditingEntry({
                        ...editingEntry,
                        tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="Algorithms, Systems, Linux"
                    className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[2px]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-2">
                <label className="flex items-center space-x-2 text-xs font-mono cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingEntry.is_pinned || false}
                    onChange={(e) => setEditingEntry({ ...editingEntry, is_pinned: e.target.checked })}
                    className="rounded-[2px]"
                  />
                  <span>Pin to top of feed</span>
                </label>
                <label className="flex items-center space-x-2 text-xs font-mono cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingEntry.is_published !== false}
                    onChange={(e) => setEditingEntry({ ...editingEntry, is_published: e.target.checked })}
                    className="rounded-[2px]"
                  />
                  <span>Published (Publicly Visible)</span>
                </label>
              </div>

              <div className="border-t border-border pt-4 flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEntryModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Entry
                </Button>
              </div>
            </form>
          )}
        </ModalContent>
      </Modal>

      {/* App Modal Form */}
      <Modal open={appModalOpen} onOpenChange={setAppModalOpen}>
        <ModalContent
          className="max-w-2xl max-h-[85vh] overflow-y-auto"
          title={editingApp?.id ? "Edit Showcase Application" : "Create Showcase Application"}
        >
          {editingApp && (
            <form onSubmit={handleSaveApp} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase text-fg-subtle">App Title</label>
                  <input
                    type="text"
                    required
                    value={editingApp.title || ""}
                    onChange={(e) => setEditingApp({ ...editingApp, title: e.target.value })}
                    className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[2px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase text-fg-subtle">Slug</label>
                  <input
                    type="text"
                    value={editingApp.slug || ""}
                    onChange={(e) => setEditingApp({ ...editingApp, slug: e.target.value })}
                    className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[2px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[10px] uppercase text-fg-subtle">Tagline</label>
                <input
                  type="text"
                  required
                  value={editingApp.tagline || ""}
                  onChange={(e) => setEditingApp({ ...editingApp, tagline: e.target.value })}
                  placeholder="One sentence hook for the software..."
                  className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[2px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase text-fg-subtle">Version</label>
                  <input
                    type="text"
                    value={editingApp.version || "v1.0.0"}
                    onChange={(e) => setEditingApp({ ...editingApp, version: e.target.value })}
                    className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[2px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase text-fg-subtle">Category</label>
                  <input
                    type="text"
                    value={editingApp.category || "Desktop App"}
                    onChange={(e) => setEditingApp({ ...editingApp, category: e.target.value })}
                    className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[2px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase text-fg-subtle">Badge</label>
                  <input
                    type="text"
                    value={editingApp.badge || "Active"}
                    onChange={(e) => setEditingApp({ ...editingApp, badge: e.target.value })}
                    className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[2px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[10px] uppercase text-fg-subtle">
                  Carousel Screenshot Image URLs (1 per line)
                </label>
                <textarea
                  rows={3}
                  value={editingApp.carousel_images?.map((img) => img.url).join("\n") || ""}
                  onChange={(e) =>
                    setEditingApp({
                      ...editingApp,
                      carousel_images: e.target.value
                        .split("\n")
                        .map((u) => u.trim())
                        .filter(Boolean)
                        .map((url, i) => ({ url, caption: `Screenshot ${i + 1}` })),
                    })
                  }
                  placeholder="https://.../screenshot1.png&#10;https://.../screenshot2.png"
                  className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[2px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase text-fg-subtle">GitHub Repository URL</label>
                  <input
                    type="url"
                    value={editingApp.repo_url || ""}
                    onChange={(e) => setEditingApp({ ...editingApp, repo_url: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[2px]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-[10px] uppercase text-fg-subtle">Google Drive Installer URL</label>
                  <input
                    type="url"
                    value={editingApp.gdrive_url || ""}
                    onChange={(e) => setEditingApp({ ...editingApp, gdrive_url: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[2px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[10px] uppercase text-fg-subtle">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={editingApp.tech_stack?.join(", ") || ""}
                  onChange={(e) =>
                    setEditingApp({
                      ...editingApp,
                      tech_stack: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="Rust, Tauri, React, SQLite"
                  className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[2px]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[10px] uppercase text-fg-subtle">Install Instructions</label>
                <textarea
                  rows={3}
                  value={editingApp.install_instructions || ""}
                  onChange={(e) => setEditingApp({ ...editingApp, install_instructions: e.target.value })}
                  placeholder="1. Download binary\n2. Run installer..."
                  className="w-full bg-bg border border-border px-3 py-2 text-xs font-mono text-fg focus:outline-none focus:border-fg rounded-[2px]"
                />
              </div>

              <div className="border-t border-border pt-4 flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAppModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Save Application
                </Button>
              </div>
            </form>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
