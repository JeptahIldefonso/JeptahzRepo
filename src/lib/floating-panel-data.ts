/**
 * Right Floating Panel Data & Configuration
 * -----------------------------------------
 * Edit this file to customize the Announcement/Promo banner image,
 * text, action button, and the History/Changelog timeline logs.
 */

export interface PromoCardConfig {
  /** Optional custom banner image URL. Leave empty to use the built-in GitHub Universe pixel banner */
  bannerImageUrl?: string;
  /** Badge/Title displayed on the banner (e.g. "UNIVERSE'26" or "JEPTAHZ'26") */
  title: string;
  /** Subtitle or short description */
  description: string;
  /** Text for the call-to-action button */
  buttonText: string;
  /** Link for the action button */
  buttonHref: string;
  /** Whether the user can dismiss this card via the 'X' button */
  dismissible: boolean;
}

export interface ChangelogItem {
  id: string;
  /** Time string (e.g. "8 hours ago", "Yesterday", "Oct 23") */
  timestamp: string;
  /** Main update headline */
  title: string;
  /** Optional brief description */
  description?: string;
  /** Optional link to full doc or external note */
  href?: string;
}

export interface ChangelogCardConfig {
  /** Card header title */
  title: string;
  /** Link at the bottom of the changelog */
  viewAllText: string;
  /** Link target for view all */
  viewAllHref: string;
  /** Timeline entries (newest first) */
  items: ChangelogItem[];
}

export interface RightPanelData {
  promo: PromoCardConfig;
  changelog: ChangelogCardConfig;
}

export const RIGHT_PANEL_DATA: RightPanelData = {
  // ── Top Announcement / Promo Card ─────────────────────────────
  promo: {
    bannerImageUrl: "", // Put a custom image URL here (e.g. "/uploads/banner.png"), or leave empty for default Universe graphic
    title: "UNIVERSE'26",
    description: "Join Universe virtually, from anywhere.",
    buttonText: "Save your seat",
    buttonHref: "https://github.com/JeptahIldefonso",
    dismissible: true,
  },

  // ── Bottom History & Changelog Stream ──────────────────────────
  changelog: {
    title: "Latest from our changelog",
    viewAllText: "View changelog →",
    viewAllHref: "/home/docs",
    items: [
      {
        id: "log-1",
        timestamp: "8 hours ago",
        title: "GitHub Copilot in Visual Studio — September update",
        description: "Unified authentic GitHub profile avatar across hero and sidebar.",
        href: "/home/docs",
      },
      {
        id: "log-2",
        timestamp: "10 hours ago",
        title: "Custom skills, agents, and MCP servers in usage metrics API",
        description: "Refined navigation column width and balanced screen margins.",
        href: "/home/docs",
      },
      {
        id: "log-3",
        timestamp: "12 hours ago",
        title: "Global default for Copilot features generally available",
        description: "Interactive WebGL botanical silk wave shader on intro hero.",
        href: "/home/docs",
      },
      {
        id: "log-4",
        timestamp: "14 hours ago",
        title: "Meta API endpoints updated for Actions blob storage",
        description: "Verified Newsreader Italic masthead & @websiteBlog identity.",
        href: "/home/docs",
      },
    ],
  },
};
