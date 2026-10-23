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
    description: "Personal full-stack builds, software applications, and developer tools",
  },
  {
    slug: "docs",
    href: "/home/docs",
    label: "Notes & Docs",
    category: "browse",
    icon: "BookOpen",
    description: "Technical documentation, shared files, images, and written notes",
  },

  // Explore
  {
    slug: "courses",
    href: "/home/courses",
    label: "Courses",
    category: "explore",
    icon: "GraduationCap",
    description: "Course information, academic roadmaps, and study materials",
  },

  // More
  {
    slug: "ideas",
    href: "/home/ideas",
    label: "Ideas & Logs",
    category: "more",
    icon: "Lightbulb",
    description: "Raw thoughts, project concepts, blueprints, and real-time logs",
  },
  {
    slug: "resources",
    href: "/home/resources",
    label: "Helpful Links",
    category: "more",
    icon: "Link2",
    description: "Curated collection of developer resources, technical references, and tools",
  },

  // Info
  {
    slug: "about",
    href: "/home/about",
    label: "Portfolio & About",
    category: "info",
    icon: "User",
    description: "Personal portfolio, developer profile, and project archive",
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
