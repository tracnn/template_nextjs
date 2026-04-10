'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { Button, Group, Badge, ActionIcon, Modal } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { apiClient } from '@/lib/api-client';
import { AllergenRule } from '@/lib/api-types';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';
import { MantineReactTable, type MRT_ColumnDef } from 'mantine-react-table';
import { useCustomTable } from '@/hooks/use-custom-table';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { useAuth } from '@/contexts/auth-context';
import { AllergenRuleForm } from './allergen-rule-form';
import { useTranslations } from 'next-intl';
import { SplitLayoutContainer } from '@/components/PageContainer/SplitLayoutContainer';

export default function AllergenRulesPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const t = useTranslations('allergenRules');
  const tc = useTranslations('common');
  const pq = usePaginatedQuery<AllergenRule>({ endpoint: '/v1/allergen-rules', queryKey: 'allergen-rules' });
  const [editing, setEditing] = useState<AllergenRule | null>(null);
  const [showForm, setShowForm] = useState(false);
  const canWrite = hasRole(['super_admin', 'pharmacist']);

  const columns: MRT_ColumnDef<AllergenRule>[] = [
    { accessorKey: 'allergenCode', header: t('allergenCode') },
    { accessorKey: 'allergenName', header: t('allergenName') },
    { accessorKey: 'blockedDrugClass', header: t('blockTarget'), Cell: ({ row }) => row.original.blockedDrugClass ? `${t('groupPrefix')}: ${row.original.blockedDrugClass}` : `${t('drugPrefix')}: ${row.original.blockedDrug?.drugName ?? row.original.blockedDrugId ?? '—'}` },
    { accessorKey: 'severity', header: t('severity'), Cell: ({ row }) => <Badge color={row.original.severity === 'contraindicated' ? 'red' : 'blue'}>{row.original.severity}</Badge> },
    { accessorKey: 'sourceRef', header: tc('source'), Cell: ({ row }) => row.original.sourceRef ?? '—' },
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

  const table = useCustomTable<AllergenRule>({
    columns,
    data: pq.data?.data ?? [],
    rowCount: pq.data?.meta.totalItems ?? 0,
    manualPagination: true,
    enableTopToolbar: true,
    enableGlobalFilter: true,
    onGlobalFilterChange: pq.setSearch,
    state: {
      globalFilter: pq.search,
      isLoading: pq.isLoading,
      pagination: { pageIndex: pq.page - 1, pageSize: 20 },
    },
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function'
        ? updater({ pageIndex: pq.page - 1, pageSize: 20 })
        : updater;
      pq.setPage(newPagination.pageIndex + 1);
    },
    enableRowActions: canWrite,
    renderRowActions: canWrite ? ({ row }) => (
      <Group gap={4}>
        <ActionIcon variant="subtle" onClick={() => { setEditing(row.original); setShowForm(true); }}><IconEdit size={16} /></ActionIcon>
        <ActionIcon variant="subtle" color="red" onClick={() => confirmDelete(row.original)}><IconTrash size={16} /></ActionIcon>
      </Group>
    ) : undefined,
  });

  return (
    <SplitLayoutContainer
      title={t('title')}
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: t('title'), href: '/allergen-rules' }]}
      showDetail={showForm}
      onCloseDetail={() => setShowForm(false)}
      detailTitle={editing ? t('editTitle') : t('addTitle')}
      actions={
        canWrite && (
          <Button leftSection={<IconPlus size={16} />} onClick={() => { setEditing(null); setShowForm(true); }}>
            {t('add')}
          </Button>
        )
      }
      master={<MantineReactTable table={table} />}
      detail={
        <AllergenRuleForm 
          rule={editing} 
          onSuccess={() => { 
            setShowForm(false); 
            queryClient.invalidateQueries({ queryKey: ['allergen-rules'] }); 
          }} 
        />
      }
    />
  );
}
