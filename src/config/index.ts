import {
  IconDashboard,
  IconPill,
  IconArrowsExchange,
  IconShieldCheck,
  IconKey,
  IconHistory,
} from "@tabler/icons-react";
import type { NavItem } from "@/types/nav-item";

export const navLinks: NavItem[] = [
  { label: "Dashboard", icon: IconDashboard, link: "/dashboard" },
  { label: "Medications", icon: IconPill, link: "/medications" },
  { label: "Interactions", icon: IconArrowsExchange, link: "/interactions" },
  {
    label: "Rules",
    icon: IconShieldCheck,
    initiallyOpened: true,
    links: [
      { label: "Allergen Rules", link: "/allergen-rules" },
      { label: "Contraindications", link: "/contraindication-rules" },
    ],
    roles: ["super_admin", "pharmacist", "viewer"],
  },
  { label: "API Keys", icon: IconKey, link: "/api-keys", roles: ["super_admin"] },
  { label: "Audit Logs", icon: IconHistory, link: "/audit-logs" },
];
