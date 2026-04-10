'use client';

import { AuditLogItem } from '@/lib/api-types';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';
import { DataTable, Column } from '@/components/DataTable/DataTable';
import { Badge, Title } from '@mantine/core';
import { useTranslations } from 'next-intl';

export default function AuditLogsPage() {
  const t = useTranslations('auditLogs');
  const pq = usePaginatedQuery<AuditLogItem>({ endpoint: '/v1/audit-logs', queryKey: 'audit-logs' });

  const columns: Column<AuditLogItem>[] = [
    { header: t('time'), accessor: (r) => new Date(r.createdAt).toLocaleString('vi-VN') },
    { header: t('hospital'), accessor: 'hospitalCode' },
    { header: t('apiVersion'), accessor: 'apiVersion' },
    { header: t('status'), accessor: (r) => <Badge color={r.statusCode === 200 ? 'green' : 'red'}>{r.statusCode}</Badge> },
    { header: t('duration'), accessor: (r) => r.durationMs != null ? `${r.durationMs}ms` : '—' },
    { header: t('evaluationId'), accessor: (r) => r.evaluationId ? r.evaluationId.slice(0, 8) + '...' : '—' },
  ];

  return (
    <div>
      <Title order={3} mb="md">{t('title')}</Title>
      <DataTable columns={columns} data={pq.data?.data ?? []} totalPages={pq.data?.meta.totalPages ?? 0} currentPage={pq.page} onPageChange={pq.setPage} search={pq.search} onSearchChange={pq.setSearch} searchPlaceholder={t('searchPlaceholder')} isLoading={pq.isLoading} />
    </div>
  );
}
