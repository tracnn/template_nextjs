'use client';

import { AuditLogItem } from '@/lib/api-types';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';
import { MantineReactTable, type MRT_ColumnDef } from 'mantine-react-table';
import { useCustomTable } from '@/hooks/use-custom-table';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { Badge } from '@mantine/core';
import { useTranslations } from 'next-intl';

export default function AuditLogsPage() {
  const t = useTranslations('auditLogs');
  const pq = usePaginatedQuery<AuditLogItem>({ endpoint: '/v1/audit-logs', queryKey: 'audit-logs' });

  const columns: MRT_ColumnDef<AuditLogItem>[] = [
    { accessorKey: 'createdAt', header: t('time'), Cell: ({ row }) => new Date(row.original.createdAt).toLocaleString('vi-VN') },
    { accessorKey: 'hospitalCode', header: t('hospital') },
    { accessorKey: 'apiVersion', header: t('apiVersion') },
    { accessorKey: 'statusCode', header: t('status'), Cell: ({ row }) => <Badge color={row.original.statusCode === 200 ? 'green' : 'red'}>{row.original.statusCode}</Badge> },
    { accessorKey: 'durationMs', header: t('duration'), Cell: ({ row }) => row.original.durationMs != null ? `${row.original.durationMs}ms` : '—' },
    { accessorKey: 'evaluationId', header: t('evaluationId'), Cell: ({ row }) => row.original.evaluationId ? row.original.evaluationId.slice(0, 8) + '...' : '—' },
  ];

  const table = useCustomTable<AuditLogItem>({
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
    enableRowActions: false,
  });

  return (
    <PageContainer title={t('title')} items={[{ label: 'Dashboard', href: '/dashboard' }, { label: t('title'), href: '/audit-logs' }]}>
      <MantineReactTable table={table} />
    </PageContainer>
  );
}
