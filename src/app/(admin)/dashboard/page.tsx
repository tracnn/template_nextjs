'use client';

import { useState } from 'react';
import { Card, Text, SimpleGrid, Title, Center, Loader, Stack, Badge, Group } from '@mantine/core';
import { useAnalytics } from '@/hooks/use-analytics';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { useTranslations } from 'next-intl';

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444', high: '#f97316', moderate: '#eab308', low: '#22c55e',
};
const TYPE_COLORS: Record<string, string> = {
  ALLERGY: '#8b5cf6', INTERACTION: '#3b82f6', CONTRAINDICATION: '#f59e0b',
};

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const [from, setFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [to, setTo] = useState(() => new Date().toISOString().slice(0, 10));
  const { data: stats, isLoading } = useAnalytics(from, to);

  if (isLoading) return <Center py="xl"><Loader /></Center>;
  if (!stats) return <Center py="xl"><Text c="dimmed">{t('noData')}</Text></Center>;

  const severityData = Object.entries(stats.bySeverity).map(([name, value]) => ({ name, value }));
  const typeData = Object.entries(stats.byType).map(([name, value]) => ({ name, value }));

  return (
    <Stack gap="lg">
      <Group>
        <div>
          <Text size="sm" fw={500}>{t('fromDate')}</Text>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #dee2e6' }} />
        </div>
        <div>
          <Text size="sm" fw={500}>{t('toDate')}</Text>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #dee2e6' }} />
        </div>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text c="dimmed" size="sm">{t('totalEvaluations')}</Text>
          <Title order={2}>{stats.totalEvaluations.toLocaleString()}</Title>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text c="dimmed" size="sm">{t('totalAlerts')}</Text>
          <Title order={2}>{stats.totalAlerts.toLocaleString()}</Title>
        </Card>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text c="dimmed" size="sm">{t('alertRatio')}</Text>
          <Title order={2}>
            {stats.totalEvaluations ? ((stats.totalAlerts / stats.totalEvaluations) * 100).toFixed(1) : 0}%
          </Title>
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={500} mb="md">{t('bySeverity')}</Text>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={severityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {severityData.map((e) => <Cell key={e.name} fill={SEVERITY_COLORS[e.name] ?? '#94a3b8'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={500} mb="md">{t('byType')}</Text>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {typeData.map((e) => <Cell key={e.name} fill={TYPE_COLORS[e.name] ?? '#94a3b8'} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }}>
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={500} mb="md">{t('byHospital')}</Text>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.byHospital} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="hospitalCode" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="evaluations" fill="#3b82f6" name={t('evaluations')} />
              <Bar dataKey="alerts" fill="#ef4444" name={t('alerts')} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Text fw={500} mb="md">{t('topInteractions')}</Text>
          <Stack gap="sm">
            {stats.topInteractions.map((item, i) => (
              <Group key={i} justify="space-between" p="sm" style={{ border: '1px solid #dee2e6', borderRadius: 8 }}>
                <Text size="sm" fw={500}>{item.drugA} + {item.drugB}</Text>
                <Badge variant="light" color="blue">{item.count}</Badge>
              </Group>
            ))}
            {stats.topInteractions.length === 0 && <Text c="dimmed" size="sm">{t('noInteractions')}</Text>}
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
  );
}
