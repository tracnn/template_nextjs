'use client';

import { Table, TextInput, Group, Text, Center, Loader, Pagination } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  search?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  actions?: (row: T) => React.ReactNode;
  isLoading?: boolean;
}

export function DataTable<T extends { id: string }>({
  columns, data, totalPages, currentPage, onPageChange,
  search, onSearchChange, searchPlaceholder, actions, isLoading,
}: DataTableProps<T>) {
  const t = useTranslations('common');

  return (
    <div>
      {onSearchChange && (
        <TextInput
          placeholder={searchPlaceholder ?? t('search')}
          value={search ?? ''}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          mb="md"
          maw={400}
        />
      )}
      <Table striped highlightOnHover withTableBorder>
        <Table.Thead>
          <Table.Tr>
            {columns.map((col, i) => (
              <Table.Th key={i}>{col.header}</Table.Th>
            ))}
            {actions && <Table.Th w={120}>{t('actions')}</Table.Th>}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {isLoading ? (
            <Table.Tr>
              <Table.Td colSpan={columns.length + (actions ? 1 : 0)}>
                <Center py="xl"><Loader size="sm" /></Center>
              </Table.Td>
            </Table.Tr>
          ) : data.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={columns.length + (actions ? 1 : 0)}>
                <Center py="xl"><Text c="dimmed">{t('noData')}</Text></Center>
              </Table.Td>
            </Table.Tr>
          ) : (
            data.map((row) => (
              <Table.Tr key={row.id}>
                {columns.map((col, i) => (
                  <Table.Td key={i}>
                    {typeof col.accessor === 'function' ? col.accessor(row) : String(row[col.accessor] ?? '')}
                  </Table.Td>
                ))}
                {actions && <Table.Td>{actions(row)}</Table.Td>}
              </Table.Tr>
            ))
          )}
        </Table.Tbody>
      </Table>
      {totalPages > 1 && (
        <Group justify="flex-end" mt="md">
          <Pagination total={totalPages} value={currentPage} onChange={onPageChange} />
        </Group>
      )}
    </div>
  );
}
