'use client';

import { AppShell, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { AuthGuard } from '@/components/auth-guard';
import { Navbar } from '@/components/Navbar/Navbar';
import { AdminHeader } from '@/components/Headers/AdminHeader';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AuthGuard>
      <AppShell
        header={{ height: 60 }}
        navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
        padding="md"
      >
        <AppShell.Header>
          <AdminHeader burger={<Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />} />
        </AppShell.Header>
        <AppShell.Navbar>
          <Navbar />
        </AppShell.Navbar>
        <AppShell.Main>{children}</AppShell.Main>
      </AppShell>
    </AuthGuard>
  );
}
