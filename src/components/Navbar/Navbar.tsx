'use client';

import { NavLink, Stack, Text, Box } from '@mantine/core';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { navItems } from '@/config';
import { useTranslations } from 'next-intl';

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const t = useTranslations('sidebar');

  const visibleItems = navItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <Stack gap={4} p="sm">
      <Box p="md" mb="sm">
        <Text fw={700} size="lg">CDSS Admin</Text>
      </Box>
      {visibleItems.map((item) => (
        <NavLink
          key={item.href}
          component={Link}
          href={item.href}
          label={t(item.i18nKey)}
          leftSection={<item.icon size={20} />}
          active={pathname === item.href}
        />
      ))}
    </Stack>
  );
}
