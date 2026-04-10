import {
  IconDashboard, IconPill, IconArrowsExchange, IconAlertTriangle,
  IconShieldX, IconKey, IconHistory,
} from '@tabler/icons-react';

export interface NavItem {
  label: string;
  icon: React.ComponentType<{ size?: number | string }>;
  href: string;
  i18nKey: string;
  roles: string[];
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', icon: IconDashboard, href: '/', i18nKey: 'dashboard', roles: ['super_admin', 'pharmacist', 'viewer'] },
  { label: 'Medications', icon: IconPill, href: '/medications', i18nKey: 'medications', roles: ['super_admin', 'pharmacist', 'viewer'] },
  { label: 'Interactions', icon: IconArrowsExchange, href: '/interactions', i18nKey: 'interactions', roles: ['super_admin', 'pharmacist', 'viewer'] },
  { label: 'Allergen Rules', icon: IconAlertTriangle, href: '/allergen-rules', i18nKey: 'allergenRules', roles: ['super_admin', 'pharmacist', 'viewer'] },
  { label: 'Contraindications', icon: IconShieldX, href: '/contraindication-rules', i18nKey: 'contraindicationRules', roles: ['super_admin', 'pharmacist', 'viewer'] },
  { label: 'API Keys', icon: IconKey, href: '/api-keys', i18nKey: 'apiKeys', roles: ['super_admin'] },
  { label: 'Audit Logs', icon: IconHistory, href: '/audit-logs', i18nKey: 'auditLogs', roles: ['super_admin', 'pharmacist', 'viewer'] },
];
