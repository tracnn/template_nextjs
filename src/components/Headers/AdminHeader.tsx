"use client";

import { ActionIcon, Box, Drawer, Menu, Stack, TextInput, Button, Text, Badge } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconSearch, IconSettings, IconLogout } from "@tabler/icons-react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import classes from "./AdminHeader.module.css";
import { Logo } from "../Logo/Logo";
import { ThemeSwitcher } from "../ThemeSwitcher/ThemeSwitcher";
import { LanguageSwitcher } from "../LanguageSwitcher/LanguageSwitcher";

interface Props {
  burger?: React.ReactNode;
}

export function AdminHeader({ burger }: Props) {
  const [opened, { close, open }] = useDisclosure(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const t = useTranslations("auth");
  const tr = useTranslations("roles");

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const roleLabel: Record<string, string> = {
    super_admin: tr("super_admin"),
    pharmacist: tr("pharmacist"),
    viewer: tr("viewer"),
  };

  return (
    <header className={classes.header}>
      {burger && burger}
      <Logo />
      <Box style={{ flex: 1 }} />
      <TextInput
        placeholder="Search"
        variant="filled"
        leftSection={<IconSearch size="0.8rem" />}
      />
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Button variant="subtle" size="sm">
            <Text size="sm" mr={4}>{user?.full_name}</Text>
            <Badge size="xs" variant="light">{roleLabel[user?.role ?? ""] ?? user?.role}</Badge>
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item leftSection={<IconLogout size={14} />} onClick={handleLogout}>
            {t("logout")}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
      <ActionIcon onClick={open} variant="subtle">
        <IconSettings size="1.25rem" />
      </ActionIcon>

      <Drawer
        opened={opened}
        onClose={close}
        title="Settings"
        position="right"
        transitionProps={{ duration: 0 }}
      >
        <Stack gap="lg">
          <ThemeSwitcher />
          <LanguageSwitcher />
        </Stack>
      </Drawer>
    </header>
  );
}
