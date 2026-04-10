"use client";

import { useState } from "react";
import { Card, Flex, Grid, GridCol, Group, Stack, Text, Title, Badge, Center, Loader, Avatar, Space } from "@mantine/core";
import { useAuth } from "@/contexts/auth-context";
import { useAnalytics } from "@/hooks/use-analytics";
import { StatsGroup } from "@/components/StatsGroup";
import { useTranslations } from "next-intl";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import classes from "./Dashboard.module.css";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#ef4444", high: "#f97316", moderate: "#eab308", low: "#22c55e",
};
const TYPE_COLORS: Record<string, string> = {
  ALLERGY: "#8b5cf6", INTERACTION: "#3b82f6", CONTRAINDICATION: "#f59e0b",
};

function ProfileCard() {
  const { user } = useAuth();
  const tr = useTranslations("roles");

  const roleLabel: Record<string, string> = {
    super_admin: tr("super_admin"),
    pharmacist: tr("pharmacist"),
    viewer: tr("viewer"),
  };

  return (
    <Card radius="md" h="100%" p={0} className="premium-card-hover">
      <div style={{ 
        height: 100, 
        background: "linear-gradient(135deg, var(--mantine-color-primary-filled) 0%, var(--mantine-color-primary-2) 100%)",
        position: 'relative'
      }} />
      <Center style={{ marginTop: -40 }}>
        <Avatar size={80} radius={80} style={{ border: '4px solid var(--mantine-color-body)' }} />
      </Center>
      <Stack align="center" gap={4} p="md" mt="xs">
        <Title order={4}>{user?.full_name}</Title>
        <Text fz="sm" c="dimmed" fw={500}>{user?.email}</Text>
        <Badge variant="dot" size="lg" mt="sm">{roleLabel[user?.role ?? ""] ?? user?.role}</Badge>
      </Stack>
    </Card>
  );
}

function WelcomeCard() {
  return (
    <Card radius="md" px="lg" py="xl" className="premium-gradient-bg" shadow="md">
      <Title order={3}>Welcome back!</Title>
      <Text fz="sm" fw={500} style={{ opacity: 0.9 }}>CDSS Admin Dashboard — Clinical Intelligence Hub</Text>
    </Card>
  );
}

export function DashboardContent() {
  const t = useTranslations("dashboard");
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const { data: stats, isLoading } = useAnalytics(from, to);

  const statsData = stats ? [
    { title: t("totalEvaluations"), value: stats.totalEvaluations.toLocaleString(), diff: 12.5 },
    { title: t("totalAlerts"), value: stats.totalAlerts.toLocaleString(), diff: -3.2 },
    { title: t("alertRatio"), value: stats.totalEvaluations ? `${((stats.totalAlerts / stats.totalEvaluations) * 100).toFixed(1)}%` : "0%", diff: 1.1 },
  ] : [];

  const severityData = stats ? Object.entries(stats.bySeverity).map(([name, value]) => ({ name, value })) : [];
  const typeData = stats ? Object.entries(stats.byType).map(([name, value]) => ({ name, value })) : [];

  if (isLoading) return <Center py="xl"><Loader variant="bars" /></Center>;

  return (
    <Grid gutter="md">
      {/* SVG Gradients for Recharts */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--mantine-color-primary-filled)" />
            <stop offset="100%" stopColor="var(--mantine-color-primary-4)" />
          </linearGradient>
        </defs>
      </svg>

      <GridCol span={{ sm: 12, md: 12, lg: 4 }}>
        <ProfileCard />
      </GridCol>
      <GridCol span={{ sm: 12, md: 12, lg: 8 }}>
        <Flex direction="column" h="100%" justify="space-between" gap="md">
          <WelcomeCard />
          <StatsGroup data={statsData} />
        </Flex>
      </GridCol>

      <GridCol span={12}>
        <Card radius="md" p="lg" className="premium-glass">
          <Group justify="space-between" mb="xl">
            <Title order={5} fw={800} tt="uppercase" style={{ letterSpacing: "0.02em" }}>{t("analyticsOverview")}</Title>
            <Group>
              <Flex align="center" gap="xs">
                <Text size="xs" fw={700} c="dimmed">{t("fromDate")}</Text>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                  style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid var(--mantine-color-gray-3)", fontSize: '12px' }} />
              </Flex>
              <Flex align="center" gap="xs">
                <Text size="xs" fw={700} c="dimmed">{t("toDate")}</Text>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
                  style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid var(--mantine-color-gray-3)", fontSize: '12px' }} />
              </Flex>
            </Group>
          </Group>
          
          <Grid gutter="xl">
            <GridCol span={{ base: 12, md: 6 }}>
              <Stack gap="xs">
                <Text fw={700} c="dimmed" size="xs" tt="uppercase">{t("bySeverity")}</Text>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={severityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--mantine-color-gray-2)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 500 }} />
                    <Tooltip cursor={{ fill: 'var(--mantine-color-gray-0)' }} 
                             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--mantine-shadow-md)' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="url(#barGradient)">
                      {severityData.map((e) => <Cell key={e.name} fill={SEVERITY_COLORS[e.name]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Stack>
            </GridCol>
            
            <GridCol span={{ base: 12, md: 6 }}>
              <Stack gap="xs">
                <Text fw={700} c="dimmed" size="xs" tt="uppercase">{t("byType")}</Text>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} stroke="none">
                      {typeData.map((e) => <Cell key={e.name} fill={TYPE_COLORS[e.name] ?? "#94a3b8"} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--mantine-shadow-md)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </Stack>
            </GridCol>
          </Grid>
        </Card>
      </GridCol>

      <GridCol span={{ sm: 12, lg: 8 }}>
        <Card radius="md" p="lg" className="premium-glass">
          <Title order={5} mb="xl" fw={800} tt="uppercase" style={{ letterSpacing: "0.02em" }}>{t("byHospital")}</Title>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats?.byHospital ?? []} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--mantine-color-gray-2)" />
              <XAxis type="number" axisLine={false} tickLine={false} />
              <YAxis dataKey="hospitalCode" type="category" width={100} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--mantine-shadow-md)' }} />
              <Bar dataKey="evaluations" fill="var(--mantine-color-primary-5)" radius={[0, 4, 4, 0]} name={t("evaluations")} />
              <Bar dataKey="alerts" fill="#ef4444" radius={[0, 4, 4, 0]} name={t("alerts")} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </GridCol>

      <GridCol span={{ sm: 12, lg: 4 }}>
        <Card radius="md" h="100%" p="lg" className="premium-glass">
          <Text fw={800} mb="xl" tt="uppercase" size="xs" style={{ letterSpacing: "0.05em" }}>{t("topInteractions")}</Text>
          <Stack gap="sm">
            {(stats?.topInteractions ?? []).map((item, i) => (
              <Group key={i} justify="space-between" p="sm" className="premium-card-hover" style={{ 
                background: 'var(--mantine-color-gray-0)', 
                borderRadius: 12,
                border: '1px solid var(--mantine-color-gray-2)'
              }}>
                <Stack gap={0}>
                  <Text size="sm" fw={700}>{item.drugA}</Text>
                  <Text size="xs" c="dimmed">{item.drugB}</Text>
                </Stack>
                <Badge variant="filled" size="lg" radius="sm">{item.count}</Badge>
              </Group>
            ))}
            {(stats?.topInteractions ?? []).length === 0 && (
              <Center h={200}>
                <Text c="dimmed" size="sm" fs="italic">{t("noInteractions")}</Text>
              </Center>
            )}
          </Stack>
        </Card>
      </GridCol>
    </Grid>
  );
}
