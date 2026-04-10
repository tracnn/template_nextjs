'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { Button, Group, Title, Badge, ActionIcon, Modal } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { apiClient } from '@/lib/api-client';
import { Medication } from '@/lib/api-types';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';
import { DataTable, Column } from '@/components/DataTable/DataTable';
import { useAuth } from '@/contexts/auth-context';
import { MedicationForm } from './medication-form';
import { useTranslations } from 'next-intl';

export default function MedicationsPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const t = useTranslations('medications');
  const tc = useTranslations('common');
  const pq = usePaginatedQuery<Medication>({ endpoint: '/v1/medications', queryKey: 'medications' });
  const [editing, setEditing] = useState<Medication | null>(null);
  const [showForm, setShowForm] = useState(false);
  const canWrite = hasRole(['super_admin', 'pharmacist']);

  const columns: Column<Medication>[] = [
    { header: t('drugCode'), accessor: 'drugCode' },
    { header: t('drugName'), accessor: 'drugName' },
    { header: t('activeIngredient'), accessor: (r) => r.activeIngredient ?? '—' },
    { header: t('drugClass'), accessor: (r) => r.drugClass ?? '—' },
    { header: t('status'), accessor: (r) => <Badge color={r.isActive ? 'green' : 'gray'}>{r.isActive ? tc('active') : tc('inactive')}</Badge> },
  ];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/v1/medications/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['medications'] }); notifications.show({ message: t('deleted'), color: 'green' }); },
  });

  const confirmDelete = (med: Medication) => {
    modals.openConfirmModal({
      title: t('deleteTitle'), children: t('deleteConfirm', { name: med.drugName }),
      labels: { confirm: tc('confirm'), cancel: tc('cancel') }, confirmProps: { color: 'red' },
      onConfirm: () => deleteMutation.mutate(med.id),
    });
  };

  return (
    <div>
      <Group justify="space-between" mb="md">
        <Title order={3}>{t('title')}</Title>
        {canWrite && <Button leftSection={<IconPlus size={16} />} onClick={() => { setEditing(null); setShowForm(true); }}>{t('add')}</Button>}
      </Group>
      <DataTable columns={columns} data={pq.data?.data ?? []} totalPages={pq.data?.meta.totalPages ?? 0} currentPage={pq.page} onPageChange={pq.setPage} search={pq.search} onSearchChange={pq.setSearch} searchPlaceholder={t('searchPlaceholder')} isLoading={pq.isLoading}
        actions={canWrite ? (row) => (
          <Group gap={4}>
            <ActionIcon variant="subtle" onClick={() => { setEditing(row); setShowForm(true); }}><IconEdit size={16} /></ActionIcon>
            <ActionIcon variant="subtle" color="red" onClick={() => confirmDelete(row)}><IconTrash size={16} /></ActionIcon>
          </Group>
        ) : undefined}
      />
      <Modal opened={showForm} onClose={() => setShowForm(false)} title={editing ? t('editTitle') : t('addTitle')} size="lg">
        <MedicationForm medication={editing} onSuccess={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['medications'] }); }} />
      </Modal>
    </div>
  );
}
