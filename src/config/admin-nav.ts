import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Images, FolderKanban, LayoutGrid, Briefcase, Quote,
  Building2, Award, Package, Inbox, Mail, Share2, FileText, Newspaper,
  ImageIcon, Search, Settings, Users, ScrollText, BarChart3,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Minimum role required. Defaults to EDITOR. */
  minRole?: "EDITOR" | "ADMIN" | "SUPER_ADMIN";
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const adminNav: NavGroup[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    title: "Website",
    items: [
      { label: "Hero Slides", href: "/admin/hero", icon: Images },
      { label: "Portfolio", href: "/admin/portfolio", icon: FolderKanban },
      { label: "Categories", href: "/admin/categories", icon: LayoutGrid },
      { label: "Services", href: "/admin/services", icon: Briefcase },
      { label: "Statistics", href: "/admin/stats", icon: BarChart3 },
      { label: "Testimonials", href: "/admin/testimonials", icon: Quote },
      { label: "Clients", href: "/admin/clients", icon: Building2 },
      { label: "Awards", href: "/admin/awards", icon: Award },
      { label: "Packages", href: "/admin/packages", icon: Package },
      { label: "Homepage", href: "/admin/homepage", icon: LayoutDashboard },
      { label: "Pages", href: "/admin/pages", icon: FileText },
      { label: "Journal", href: "/admin/journal", icon: Newspaper },
    ],
  },
  {
    title: "Engagement",
    items: [
      { label: "Inquiries", href: "/admin/inquiries", icon: Inbox },
      { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
      { label: "Social Media", href: "/admin/social", icon: Share2 },
    ],
  },
  {
    title: "System",
    items: [
      { label: "Media Library", href: "/admin/media", icon: ImageIcon },
      { label: "SEO", href: "/admin/seo", icon: Search, minRole: "ADMIN" },
      { label: "Settings", href: "/admin/settings", icon: Settings, minRole: "ADMIN" },
      { label: "Admin Users", href: "/admin/users", icon: Users, minRole: "ADMIN" },
      { label: "Activity Logs", href: "/admin/activity", icon: ScrollText, minRole: "ADMIN" },
    ],
  },
];
