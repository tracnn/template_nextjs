'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { Button, Group, Badge, ActionIcon, Modal } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';
import { apiClient } from '@/lib/api-client';
import { ContraindicationRule } from '@/lib/api-types';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';
import { MantineReactTable, type MRT_ColumnDef } from 'mantine-react-table';
import { useCustomTable } from '@/hooks/use-custom-table';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { useAuth } from '@/contexts/auth-context';
import { ContraindicationForm } from './contraindication-form';
import { useTranslations } from 'next-intl';
import { SplitLayoutContainer } from '@/components/PageContainer/SplitLayoutContainer';

export default function ContraindicationRulesPage() {
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const t = useTranslations('contraindicationRules');
  const tc = useTranslations('common');
  const pq = usePaginatedQuery<ContraindicationRule>({ endpoint: '/v1/contraindication-rules', queryKey: 'contraindication-rules' });
  const [editing, setEditing] = useState<ContraindicationRule | null>(null);
  const [showForm, setShowForm] = useState(false);
  const canWrite = hasRole(['super_admin', 'pharmacist']);

  const columns: MRT_ColumnDef<ContraindicationRule>[] = [
    { accessorKey: 'conditionCode', header: t('conditionCode') },
    { accessorKey: 'conditionName', header: t('disease') },
    { accessorKey: 'drugId', header: t('drug'), Cell: ({ row }) => row.original.drug?.drugName ?? row.original.drugId },
    { accessorKey: 'severity', header: t('severity'), Cell: ({ row }) => <Badge color={row.original.severity === 'contraindicated' ? 'red' : 'blue'}>{row.original.severity}</Badge> },
    { accessorKey: 'labThreshold', header: t('lab'), Cell: ({ row }) => row.original.labThreshold ? `${row.original.labThreshold.loinc} ${row.original.labThreshold.operator} ${row.original.labThreshold.value}` : '—' },
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

  const table = useCustomTable<ContraindicationRule>({
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
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: t('title'), href: '/contraindication-rules' }]}
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
        <ContraindicationForm 
          rule={editing} 
          onSuccess={() => { 
            setShowForm(false); 
            queryClient.invalidateQueries({ queryKey: ['contraindication-rules'] }); 
          }} 
        />
      }
    />
  );
}
