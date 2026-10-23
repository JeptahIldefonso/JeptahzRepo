export interface NavItem {
  slug: string;
  href: string;
  label: string;
  category: "browse" | "explore" | "more" | "manage" | "info";
  icon: string;
  description: string;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  // Browse
  {
    slug: "overview",
    href: "/home",
    label: "Home",
    category: "browse",
    icon: "LayoutDashboard",
    description: "Main feed and recent updates",
  },
  {
    slug: "apps",
    href: "/home/apps",
    label: "Projects",
    category: "browse",
    icon: "Box",
    description: "Software builds, tools, and side projects",
  },
  {
    slug: "docs",
    href: "/home/docs",
    label: "Notes & Docs",
    category: "browse",
    icon: "BookOpen",
    description: "Technical write-ups, architecture notes, and guides",
  },

  // Explore
  {
    slug: "courses",
    href: "/home/courses",
    label: "Courses",
    category: "explore",
    icon: "GraduationCap",
    description: "Course notes and learning roadmaps",
  },

  // More
  {
    slug: "ideas",
    href: "/home/ideas",
    label: "Ideas & Logs",
    category: "more",
    icon: "Lightbulb",
    description: "Thoughts, experiments, and dev logs",
  },
  {
    slug: "resources",
    href: "/home/resources",
    label: "Useful Links",
    category: "more",
    icon: "Link2",
    description: "Tools, references, and bookmarks worth sharing",
  },

  // Manage
  {
    slug: "admin",
    href: "/admin",
    label: "Admin Panel",
    category: "manage",
    icon: "Shield",
    description: "Manage repository entries, projects, and media",
  },

  // Info
  {
    slug: "about",
    href: "/home/about",
    label: "Portfolio & About",
    category: "info",
    icon: "User",
    description: "Personal portfolio, background, and archive overview",
  },
  {
    slug: "contact",
    href: "/home/contact",
    label: "Contact",
    category: "info",
    icon: "Send",
    description: "Get in touch",
  },
];

export const CATEGORY_LABELS: Record<string, string> = {
  browse: "Browse",
  explore: "Explore",
  more: "More",
  manage: "Manage",
  info: "Info",
};
