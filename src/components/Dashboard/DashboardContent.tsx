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
    <Card radius="md" h="100%">
      <Card.Section style={{ padding: "var(--mantine-spacing-md)" }}>
        <Avatar radius="xl" size="lg" />
        <Space h="md" />
        <Title order={5}>{user?.full_name}</Title>
        <Space h="xs" />
        <Text fz="sm" c="dimmed" fw={500}>{user?.email}</Text>
        <Space h={4} />
        <Badge variant="light">{roleLabel[user?.role ?? ""] ?? user?.role}</Badge>
      </Card.Section>
    </Card>
  );
}

function WelcomeCard() {
  return (
    <Card radius="md">
      <Title order={5}>Welcome back!</Title>
      <Text fz="sm" c="dimmed" fw={500}>CDSS Admin Dashboard</Text>
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
    { title: t("totalEvaluations"), value: stats.totalEvaluations.toLocaleString(), diff: 0 },
    { title: t("totalAlerts"), value: stats.totalAlerts.toLocaleString(), diff: 0 },
    { title: t("alertRatio"), value: stats.totalEvaluations ? `${((stats.totalAlerts / stats.totalEvaluations) * 100).toFixed(1)}%` : "0%", diff: 0 },
  ] : [];

  const severityData = stats ? Object.entries(stats.bySeverity).map(([name, value]) => ({ name, value })) : [];
  const typeData = stats ? Object.entries(stats.byType).map(([name, value]) => ({ name, value })) : [];

  if (isLoading) return <Center py="xl"><Loader /></Center>;

  return (
    <Grid>
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
        <Card radius="md">
          <Card.Section className={classes.section}>
            <Group>
              <div>
                <Text size="sm" fw={500}>{t("fromDate")}</Text>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                  style={{ padding: "6px 12px", borderRadius: 4, border: "1px solid #dee2e6" }} />
              </div>
              <div>
                <Text size="sm" fw={500}>{t("toDate")}</Text>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
                  style={{ padding: "6px 12px", borderRadius: 4, border: "1px solid #dee2e6" }} />
              </div>
            </Group>
          </Card.Section>
          <Card.Section className={classes.section}>
            <Stack style={{ flex: 1 }}>
              <Text fw={500}>{t("bySeverity")}</Text>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={severityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value">
                    {severityData.map((e) => <Cell key={e.name} fill={SEVERITY_COLORS[e.name] ?? "#94a3b8"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Stack>
            <Stack style={{ flex: 1 }}>
              <Text fw={500}>{t("byType")}</Text>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {typeData.map((e) => <Cell key={e.name} fill={TYPE_COLORS[e.name] ?? "#94a3b8"} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Stack>
          </Card.Section>
        </Card>
      </GridCol>

      <GridCol span={{ sm: 12, lg: 8 }}>
        <Card radius="md">
          <Card.Section className={classes.section}>
            <Title order={5}>{t("byHospital")}</Title>
          </Card.Section>
          <Card.Section className={classes.section}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats?.byHospital ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="hospitalCode" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="evaluations" fill="#3b82f6" name={t("evaluations")} />
                <Bar dataKey="alerts" fill="#ef4444" name={t("alerts")} />
              </BarChart>
            </ResponsiveContainer>
          </Card.Section>
        </Card>
      </GridCol>

      <GridCol span={{ sm: 12, lg: 4 }}>
        <Card radius="md" h="100%">
          <Text fw={500} mb="md">{t("topInteractions")}</Text>
          <Stack gap="sm">
            {(stats?.topInteractions ?? []).map((item, i) => (
              <Group key={i} justify="space-between" p="sm" style={{ border: "1px solid #dee2e6", borderRadius: 8 }}>
                <Text size="sm" fw={500}>{item.drugA} + {item.drugB}</Text>
                <Badge variant="light" color="blue">{item.count}</Badge>
              </Group>
            ))}
            {(stats?.topInteractions ?? []).length === 0 && <Text c="dimmed" size="sm">{t("noInteractions")}</Text>}
          </Stack>
        </Card>
      </GridCol>
    </Grid>
  );
}
