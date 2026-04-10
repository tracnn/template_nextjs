"use client";

import { Card, Group, SimpleGrid, Text, useMantineTheme } from "@mantine/core";
import { IconArrowDownRight, IconArrowUpRight } from "@tabler/icons-react";

interface StatsGroupProps {
  data: { title: string; value: string; diff: number }[];
}

export function StatsGroup({ data }: StatsGroupProps) {
  const theme = useMantineTheme();
  const stats = data.map((stat) => {
    const DiffIcon = stat.diff > 0 ? IconArrowUpRight : IconArrowDownRight;

    return (
      <Card 
        key={stat.title} 
        p="lg" 
        radius="md" 
        className="premium-card-hover stats-card-bg"
      >
        <Group align="flex-start" justify="space-between">
          <div>
            <Text c="dimmed" tt="uppercase" fw={800} fz="xs" style={{ letterSpacing: "0.05em" }}>
              {stat.title}
            </Text>
            <Text fw={800} fz="2rem" style={{ lineHeight: 1.2 }}>
              {stat.value}
            </Text>
          </div>
          <DiffIcon
            size="2rem"
            color={stat.diff > 0 ? theme.colors.green[6] : theme.colors.red[6]}
            style={{ opacity: 0.8 }}
          />
        </Group>
        <Group gap="xs" mt="sm">
          <Text
            component="span"
            c={stat.diff > 0 ? "green.6" : "red.6"}
            fw={700}
            fz="sm"
          >
            {stat.diff > 0 ? "+" : ""}{stat.diff}%
          </Text>
          <Text c="dimmed" fz="xs">
            since last month
          </Text>
        </Group>
      </Card>
    );
  });

  return <SimpleGrid cols={{ sm: 1, md: 3 }}>{stats}</SimpleGrid>;
}
