'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { Button, Group, Badge, ActionIcon, Modal, TextInput, Stack, Code, CopyButton } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconTrash, IconPlus, IconCopy, IconCheck } from '@tabler/icons-react';
import { apiClient } from '@/lib/api-client';
import { ApiKeyItem } from '@/lib/api-types';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';
import { MantineReactTable, type MRT_ColumnDef } from 'mantine-react-table';
import { useCustomTable } from '@/hooks/use-custom-table';
import { PageContainer } from '@/components/PageContainer/PageContainer';
import { AuthGuard } from '@/components/auth-guard';
import { useTranslations } from 'next-intl';

export default function ApiKeysPage() {
  const queryClient = useQueryClient();
  const t = useTranslations('apiKeys');
  const tc = useTranslations('common');
  const pq = usePaginatedQuery<ApiKeyItem>({ endpoint: '/v1/api-keys', queryKey: 'api-keys' });
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyHospital, setNewKeyHospital] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const columns: MRT_ColumnDef<ApiKeyItem>[] = [
    { accessorKey: 'name', header: t('name') },
    { accessorKey: 'hospitalCode', header: t('hospitalCode') },
    { accessorKey: 'isActive', header: t('status'), Cell: ({ row }) => <Badge color={row.original.isActive ? 'green' : 'gray'}>{row.original.isActive ? tc('active') : tc('inactive')}</Badge> },
    { accessorKey: 'lastUsedAt', header: t('lastUsed'), Cell: ({ row }) => row.original.lastUsedAt ? new Date(row.original.lastUsedAt).toLocaleString('vi-VN') : t('neverUsed') },
    { accessorKey: 'createdAt', header: t('createdAt'), Cell: ({ row }) => new Date(row.original.createdAt).toLocaleString('vi-VN') },
  ];

  const createMutation = useMutation({
    mutationFn: async () => { const { data } = await apiClient.post<{ key: string }>('/v1/api-keys', { name: newKeyName, hospitalCode: newKeyHospital }); return data; },
    onSuccess: (data) => { setCreatedKey(data.key); queryClient.invalidateQueries({ queryKey: ['api-keys'] }); setNewKeyName(''); setNewKeyHospital(''); },
    onError: () => notifications.show({ message: t('createError'), color: 'red' }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/v1/api-keys/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['api-keys'] }); notifications.show({ message: t('deleted'), color: 'green' }); },
    onError: () => notifications.show({ message: t('deleteError'), color: 'red' }),
  });

  const confirmDelete = (item: ApiKeyItem) => {
    modals.openConfirmModal({
      title: t('deleteTitle'), children: t('deleteConfirm', { name: item.name }),
      labels: { confirm: tc('confirm'), cancel: tc('cancel') }, confirmProps: { color: 'red' },
      onConfirm: () => deleteMutation.mutate(item.id),
    });
  };

  const table = useCustomTable<ApiKeyItem>({
    columns,
    data: pq.data?.data ?? [],
    rowCount: pq.data?.meta.totalItems ?? 0,
    manualPagination: true,
    enableTopToolbar: true,
    enableGlobalFilter: false,
    state: {
      isLoading: pq.isLoading,
      pagination: { pageIndex: pq.page - 1, pageSize: 20 },
    },
    onPaginationChange: (updater) => {
      const newPagination = typeof updater === 'function'
        ? updater({ pageIndex: pq.page - 1, pageSize: 20 })
        : updater;
      pq.setPage(newPagination.pageIndex + 1);
    },
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <ActionIcon variant="subtle" color="red" onClick={() => confirmDelete(row.original)}><IconTrash size={16} /></ActionIcon>
    ),
  });

  return (
    <AuthGuard roles={['super_admin']}>
      <PageContainer title={t('title')} items={[{ label: 'Dashboard', href: '/dashboard' }, { label: t('title'), href: '/api-keys' }]}>
        <Group justify="flex-end" mb="md">
          <Button leftSection={<IconPlus size={16} />} onClick={() => setShowCreate(true)}>{t('create')}</Button>
        </Group>
        <MantineReactTable table={table} />
        <Modal opened={showCreate} onClose={() => { setShowCreate(false); setCreatedKey(null); }} title={createdKey ? t('createdTitle') : t('createTitle')}>
          {createdKey ? (
            <Stack gap="md">
              <p style={{ fontSize: 14, color: '#666' }}>{t('createdDescription')}</p>
              <Code block style={{ wordBreak: 'break-all' }}>{createdKey}</Code>
              <CopyButton value={createdKey}>
                {({ copied, copy }) => (
                  <Button variant="outline" fullWidth onClick={copy} leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}>
                    {copied ? t('copied') : t('copyClipboard')}
                  </Button>
                )}
              </CopyButton>
            </Stack>
          ) : (
            <Stack gap="md">
              <TextInput label={`${t('name')} *`} value={newKeyName} onChange={(e) => setNewKeyName(e.currentTarget.value)} placeholder={t('namePlaceholder')} />
              <TextInput label={`${t('hospitalCode')} *`} value={newKeyHospital} onChange={(e) => setNewKeyHospital(e.currentTarget.value)} placeholder={t('hospitalCodePlaceholder')} />
              <Button fullWidth disabled={!newKeyName || !newKeyHospital} loading={createMutation.isPending} onClick={() => createMutation.mutate()}>
                {createMutation.isPending ? t('creating') : t('createSubmit')}
              </Button>
            </Stack>
          )}
        </Modal>
      </PageContainer>
    </AuthGuard>
  );
}
