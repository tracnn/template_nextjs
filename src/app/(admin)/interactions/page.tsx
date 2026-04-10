'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { Button, Group, Title, Badge, ActionIcon, Modal } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { apiClient } from '@/lib/api-client';
import { DrugInteraction } from '@/lib/api-types';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';
import { DataTable, Column } from '@/components/DataTable/DataTable';
import { useAuth } from '@/contexts/auth-context';
import { InteractionForm } from './interaction-form';
import { useTranslations } from 'next-intl';

const severityColor: Record<string, string> = { critical: 'red', high: 'orange', moderate: 'yellow', low: 'green' };

export default function InteractionsPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const t = useTranslations('interactions');
  const tc = useTranslations('common');
  const pq = usePaginatedQuery<DrugInteraction>({ endpoint: '/v1/interactions', queryKey: 'interactions' });
  const [editing, setEditing] = useState<DrugInteraction | null>(null);
  const [showForm, setShowForm] = useState(false);
  const canWrite = hasRole(['super_admin', 'pharmacist']);

  const columns: Column<DrugInteraction>[] = [
    { header: t('drugA'), accessor: (r) => r.drugA?.drugName ?? r.drugAId },
    { header: t('drugB'), accessor: (r) => r.drugB?.drugName ?? r.drugBId },
    { header: t('severity'), accessor: (r) => <Badge color={severityColor[r.severity] ?? 'gray'}>{r.severity}</Badge> },
    { header: t('sourceRef'), accessor: (r) => r.sourceRef ?? '—' },
  ];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/v1/interactions/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['interactions'] }); notifications.show({ message: t('deleted'), color: 'green' }); },
  });

  const confirmDelete = (item: DrugInteraction) => {
    modals.openConfirmModal({
      title: t('deleteTitle'), children: t('deleteConfirm'),
      labels: { confirm: tc('confirm'), cancel: tc('cancel') }, confirmProps: { color: 'red' },
      onConfirm: () => deleteMutation.mutate(item.id),
    });
  };

  return (
    <div>
      <Group justify="space-between" mb="md">
        <Title order={3}>{t('title')}</Title>
        {canWrite && <Button leftSection={<IconPlus size={16} />} onClick={() => { setEditing(null); setShowForm(true); }}>{t('add')}</Button>}
      </Group>
      <DataTable columns={columns} data={pq.data?.data ?? []} totalPages={pq.data?.meta.totalPages ?? 0} currentPage={pq.page} onPageChange={pq.setPage} search={pq.search} onSearchChange={pq.setSearch} isLoading={pq.isLoading}
        actions={canWrite ? (row) => (
          <Group gap={4}>
            <ActionIcon variant="subtle" onClick={() => { setEditing(row); setShowForm(true); }}><IconEdit size={16} /></ActionIcon>
            <ActionIcon variant="subtle" color="red" onClick={() => confirmDelete(row)}><IconTrash size={16} /></ActionIcon>
          </Group>
        ) : undefined}
      />
      <Modal opened={showForm} onClose={() => setShowForm(false)} title={editing ? t('editTitle') : t('addTitle')} size="lg">
        <InteractionForm interaction={editing} onSuccess={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['interactions'] }); }} />
      </Modal>
    </div>
  );
}
