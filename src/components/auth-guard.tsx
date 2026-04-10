'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Center, Loader, Text } from '@mantine/core';
import { useTranslations } from 'next-intl';

export function AuthGuard({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations('common');

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) return <Center h="100vh"><Loader /></Center>;
  if (!user) return null;
  if (roles && !roles.includes(user.role)) {
    return <Center h="100vh"><Text c="red">{t('noPermission')}</Text></Center>;
  }

  return <>{children}</>;
}
