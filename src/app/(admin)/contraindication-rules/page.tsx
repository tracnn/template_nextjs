'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { Button, Group, Title, Badge, ActionIcon, Modal } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { apiClient } from '@/lib/api-client';
import { ContraindicationRule } from '@/lib/api-types';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';
import { DataTable, Column } from '@/components/DataTable/DataTable';
import { useAuth } from '@/contexts/auth-context';
import { ContraindicationForm } from './contraindication-form';
import { useTranslations } from 'next-intl';

export default function ContraindicationRulesPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const t = useTranslations('contraindicationRules');
  const tc = useTranslations('common');
  const pq = usePaginatedQuery<ContraindicationRule>({ endpoint: '/v1/contraindication-rules', queryKey: 'contraindication-rules' });
  const [editing, setEditing] = useState<ContraindicationRule | null>(null);
  const [showForm, setShowForm] = useState(false);
  const canWrite = hasRole(['super_admin', 'pharmacist']);

  const columns: Column<ContraindicationRule>[] = [
    { header: t('conditionCode'), accessor: 'conditionCode' },
    { header: t('disease'), accessor: 'conditionName' },
    { header: t('drug'), accessor: (r) => r.drug?.drugName ?? r.drugId },
    { header: t('severity'), accessor: (r) => <Badge color={r.severity === 'contraindicated' ? 'red' : 'blue'}>{r.severity}</Badge> },
    { header: t('lab'), accessor: (r) => r.labThreshold ? `${r.labThreshold.loinc} ${r.labThreshold.operator} ${r.labThreshold.value}` : '—' },
  ];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/v1/contraindication-rules/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['contraindication-rules'] }); notifications.show({ message: t('deleted'), color: 'green' }); },
    onError: () => notifications.show({ message: t('deleteError'), color: 'red' }),
  });

  const confirmDelete = (item: ContraindicationRule) => {
    modals.openConfirmModal({
      title: t('deleteTitle'), children: t('deleteConfirm', { name: item.conditionName }),
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
        <ContraindicationForm rule={editing} onSuccess={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['contraindication-rules'] }); }} />
      </Modal>
    </div>
  );
}
