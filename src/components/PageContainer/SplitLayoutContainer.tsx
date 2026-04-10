'use client';

import React from 'react';
import { Box, Flex, Paper, Group, Title, ActionIcon, Transition, Stack, ScrollArea } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import { PageContainer } from './PageContainer';

interface SplitLayoutContainerProps {
  title: string;
  breadcrumbs: { label: string; href: string }[];
  master: React.ReactNode;
  detail: React.ReactNode;
  showDetail: boolean;
  onCloseDetail: () => void;
  detailTitle?: string;
  detailWidth?: number | string;
  actions?: React.ReactNode;
}

export function SplitLayoutContainer({
  title,
  breadcrumbs,
  master,
  detail,
  showDetail,
  onCloseDetail,
  detailTitle,
  detailWidth = 450,
  actions,
}: SplitLayoutContainerProps) {
  return (
    <PageContainer title={title} items={breadcrumbs}>
      <Group justify="flex-end" mb="md">
        {actions}
      </Group>

      <Flex gap="md" align="flex-start" style={{ position: 'relative' }}>
        <Box style={{ flex: 1, minWidth: 0, transition: 'all 0.3s ease' }}>
          {master}
        </Box>

        <Transition mounted={showDetail} transition="slide-left" duration={300} timingFunction="ease">
          {(styles) => (
            <Box
              style={{
                ...styles,
                width: detailWidth,
                height: 'calc(100vh - 120px)',
                position: 'sticky',
                top: 80,
                zIndex: 10,
              }}
            >
              <Paper
                p="md"
                radius="md"
                className="premium-glass premium-card-hover"
                shadow="xl"
                h="100%"
                style={{ 
                  border: '1px solid var(--mantine-color-gray-3)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Group justify="space-between" mb="lg">
                  <Title order={4} fw={800} tt="uppercase" style={{ letterSpacing: '0.02em' }}>
                    {detailTitle}
                  </Title>
                  <ActionIcon variant="subtle" color="gray" onClick={onCloseDetail}>
                    <IconX size={20} />
                  </ActionIcon>
                </Group>
                
                <ScrollArea offsetScrollbars style={{ flex: 1 }}>
                  {detail}
                </ScrollArea>
              </Paper>
            </Box>
          )}
        </Transition>
      </Flex>
    </PageContainer>
  );
}
