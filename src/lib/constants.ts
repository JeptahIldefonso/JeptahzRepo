export interface NavItem {
  slug: string;
  href: string;
  label: string;
  category: "command" | "academic" | "vault" | "info";
  icon: string;
  description: string;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  // Command Center
  {
    slug: "overview",
    href: "/home",
    label: "Hub Overview",
    category: "command",
    icon: "LayoutDashboard",
    description: "Central repository feed and recent updates",
  },
  {
    slug: "apps",
    href: "/home/apps",
    label: "Apps Showcase",
    category: "command",
    icon: "Box",
    description: "Production software with carousels and direct downloads",
  },

  // Academic Repository
  {
    slug: "docs",
    href: "/home/docs",
    label: "Docs & Theory",
    category: "academic",
    icon: "BookOpen",
    description: "Algorithms, distributed systems, and technical breakdowns",
  },
  {
    slug: "courses",
    href: "/home/courses",
    label: "Courses & Curricula",
    category: "academic",
    icon: "GraduationCap",
    description: "Curated study roadmaps and university syllabi",
  },
  {
    slug: "projects",
    href: "/home/projects",
    label: "Code Repositories",
    category: "academic",
    icon: "Code2",
    description: "Open-source projects, lab code, and downloadable packages",
  },

  // Intellectual Vault
  {
    slug: "resources",
    href: "/home/resources",
    label: "Curated Resources",
    category: "vault",
    icon: "Link2",
    description: "Verified developer tools, whitepapers, and bookmarks",
  },
  {
    slug: "ideas",
    href: "/home/ideas",
    label: "Raw Ideas & Devlogs",
    category: "vault",
    icon: "Lightbulb",
    description: "Unfiltered engineering thoughts and architecture drafts",
  },

  // Archival Info
  {
    slug: "about",
    href: "/home/about",
    label: "About Me",
    category: "info",
    icon: "User",
    description: "Computer science student background and philosophy",
  },
  {
    slug: "contact",
    href: "/home/contact",
    label: "Contact & Network",
    category: "info",
    icon: "Send",
    description: "Direct contact channels and social profiles",
  },
];

export const CATEGORY_LABELS: Record<string, string> = {
  command: "Command Center",
  academic: "Academic Repository",
  vault: "Intellectual Vault",
  info: "Archival Info",
};
