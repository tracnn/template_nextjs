'use client';

import { Group, Menu, Button, Text, Badge } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ThemeSwitcher } from '@/components/ThemeSwitcher/ThemeSwitcher';
import { LanguageSwitcher } from '@/components/LanguageSwitcher/LanguageSwitcher';

interface AdminHeaderProps {
  burger?: React.ReactNode;
}

export function AdminHeader({ burger }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const t = useTranslations('auth');
  const tr = useTranslations('roles');

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const roleLabel: Record<string, string> = {
    super_admin: tr('super_admin'),
    pharmacist: tr('pharmacist'),
    viewer: tr('viewer'),
  };

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group>{burger}</Group>
      <Group gap="sm">
        <LanguageSwitcher />
        <ThemeSwitcher />
        <Menu shadow="md" width={200}>
          <Menu.Target>
            <Button variant="subtle" size="sm">
              <Text size="sm" mr={4}>{user?.full_name}</Text>
              <Badge size="xs" variant="light">{roleLabel[user?.role ?? ''] ?? user?.role}</Badge>
            </Button>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<IconLogout size={14} />} onClick={handleLogout}>
              {t('logout')}
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Group>
  );
}
