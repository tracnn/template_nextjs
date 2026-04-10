'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { Button, Group, Title, Badge, ActionIcon, Modal } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { apiClient } from '@/lib/api-client';
import { AllergenRule } from '@/lib/api-types';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';
import { DataTable, Column } from '@/components/DataTable/DataTable';
import { useAuth } from '@/contexts/auth-context';
import { AllergenRuleForm } from './allergen-rule-form';
import { useTranslations } from 'next-intl';

export default function AllergenRulesPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const t = useTranslations('allergenRules');
  const tc = useTranslations('common');
  const pq = usePaginatedQuery<AllergenRule>({ endpoint: '/v1/allergen-rules', queryKey: 'allergen-rules' });
  const [editing, setEditing] = useState<AllergenRule | null>(null);
  const [showForm, setShowForm] = useState(false);
  const canWrite = hasRole(['super_admin', 'pharmacist']);

  const columns: Column<AllergenRule>[] = [
    { header: t('allergenCode'), accessor: 'allergenCode' },
    { header: t('allergenName'), accessor: 'allergenName' },
    { header: t('blockTarget'), accessor: (r) => r.blockedDrugClass ? `${t('groupPrefix')}: ${r.blockedDrugClass}` : `${t('drugPrefix')}: ${r.blockedDrug?.drugName ?? r.blockedDrugId ?? '—'}` },
    { header: t('severity'), accessor: (r) => <Badge color={r.severity === 'contraindicated' ? 'red' : 'blue'}>{r.severity}</Badge> },
    { header: tc('source'), accessor: (r) => r.sourceRef ?? '—' },
  ];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/v1/allergen-rules/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['allergen-rules'] }); notifications.show({ message: t('deleted'), color: 'green' }); },
  });

  const confirmDelete = (item: AllergenRule) => {
    modals.openConfirmModal({
      title: t('deleteTitle'), children: t('deleteConfirm', { name: item.allergenName }),
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
        <AllergenRuleForm rule={editing} onSuccess={() => { setShowForm(false); queryClient.invalidateQueries({ queryKey: ['allergen-rules'] }); }} />
      </Modal>
    </div>
  );
}
