/**
 * Right Side Changelog Panel Data & Configuration
 * -----------------------------------------------
 * Formal, authentic repository changelog stream styled in singular brand color #041a24.
 * Customizable inside Admin Content Manager (/admin).
 */

export interface ChangelogItem {
  id: string;
  version_tag?: string;
  category: "feature" | "release" | "fix" | "doc" | "system";
  title: string;
  description: string;
  timestamp: string;
  href?: string;
  sort_order: number;
  created_at: string;
}

export interface ChangelogPanelConfig {
  title: string;
  subtitle: string;
  viewAllText: string;
  viewAllHref: string;
  items: ChangelogItem[];
}

export const INITIAL_CHANGELOG_DATA: ChangelogPanelConfig = {
  title: "System Changelog",
  subtitle: "Active Repository Feed",
  viewAllText: "All Notes & Docs →",
  viewAllHref: "/home/docs",
  items: [
    {
      id: "log-1",
      version_tag: "v1.2.4",
      category: "feature",
      title: "Unified GitHub profile avatar across platform",
      description: "Integrated authentic circular GitHub avatar across hero intro, floating sidebar, and community feed.",
      timestamp: "Today",
      href: "/home/docs",
      sort_order: 1,
      created_at: "2026-10-23T12:00:00Z",
    },
    {
      id: "log-2",
      version_tag: "v1.2.3",
      category: "system",
      title: "Refined sidebar & optical screen centering",
      description: "Adjusted navigation column geometry to keep reading flow perfectly centered across high-res displays.",
      timestamp: "Yesterday",
      href: "/home/docs",
      sort_order: 2,
      created_at: "2026-10-22T16:30:00Z",
    },
    {
      id: "log-3",
      version_tag: "v1.2.2",
      category: "feature",
      title: "WebGL botanical silk wave hero shader",
      description: "Deployed GPU-accelerated interactive silk wave backdrop on entry view with smooth cursor reaction.",
      timestamp: "Oct 20",
      href: "/home/docs",
      sort_order: 3,
      created_at: "2026-10-20T10:15:00Z",
    },
    {
      id: "log-4",
      version_tag: "v1.2.1",
      category: "doc",
      title: "Editorial typography & verified author identity",
      description: "Aligned Newsreader serif mastheads, Geist sans body text, and verified @websiteBlog identity badges.",
      timestamp: "Oct 18",
      href: "/home/docs",
      sort_order: 4,
      created_at: "2026-10-18T09:00:00Z",
    },
    {
      id: "log-5",
      version_tag: "v1.2.0",
      category: "release",
      title: "Public archive initial release",
      description: "Launched open documentation vault for systems programming notes, university courses, and project builds.",
      timestamp: "Oct 15",
      href: "/home/docs",
      sort_order: 5,
      created_at: "2026-10-15T08:00:00Z",
    },
  ],
};
