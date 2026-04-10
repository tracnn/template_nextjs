'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { Button, Group, Title, Badge, ActionIcon, Modal, TextInput, Stack, Code, CopyButton } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconTrash, IconPlus, IconCopy, IconCheck } from '@tabler/icons-react';
import { apiClient } from '@/lib/api-client';
import { ApiKeyItem } from '@/lib/api-types';
import { usePaginatedQuery } from '@/hooks/use-paginated-query';
import { DataTable, Column } from '@/components/DataTable/DataTable';
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

  const columns: Column<ApiKeyItem>[] = [
    { header: t('name'), accessor: 'name' },
    { header: t('hospitalCode'), accessor: 'hospitalCode' },
    { header: t('status'), accessor: (r) => <Badge color={r.isActive ? 'green' : 'gray'}>{r.isActive ? tc('active') : tc('inactive')}</Badge> },
    { header: t('lastUsed'), accessor: (r) => r.lastUsedAt ? new Date(r.lastUsedAt).toLocaleString('vi-VN') : t('neverUsed') },
    { header: t('createdAt'), accessor: (r) => new Date(r.createdAt).toLocaleString('vi-VN') },
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

  return (
    <AuthGuard roles={['super_admin']}>
      <div>
        <Group justify="space-between" mb="md">
          <Title order={3}>{t('title')}</Title>
          <Button leftSection={<IconPlus size={16} />} onClick={() => setShowCreate(true)}>{t('create')}</Button>
        </Group>
        <DataTable columns={columns} data={pq.data?.data ?? []} totalPages={pq.data?.meta.totalPages ?? 0} currentPage={pq.page} onPageChange={pq.setPage} isLoading={pq.isLoading}
          actions={(row) => <ActionIcon variant="subtle" color="red" onClick={() => confirmDelete(row)}><IconTrash size={16} /></ActionIcon>}
        />
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
      </div>
    </AuthGuard>
  );
}
