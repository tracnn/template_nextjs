'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { TextInput, Select, Switch, Button, Stack, NumberInput, Paper } from '@mantine/core';
import { apiClient } from '@/lib/api-client';
import { ContraindicationRule, Medication, PaginatedResponse } from '@/lib/api-types';
import { useTranslations } from 'next-intl';

export function ContraindicationForm({ rule, onSuccess }: { rule: ContraindicationRule | null; onSuccess: () => void }) {
  const t = useTranslations('contraindicationRules');
  const tc = useTranslations('common');

  const schema = z.object({
    conditionCode: z.string().min(1, tc('required')),
    conditionName: z.string().min(1, tc('required')),
    drugId: z.string().uuid(t('selectDrug')),
    severity: z.enum(['contraindicated', 'caution']),
    sourceRef: z.string().optional(),
    hasLab: z.boolean(),
    labLoinc: z.string().optional(),
    labOperator: z.string().optional(),
    labValue: z.number().optional(),
  }).refine((d) => !d.hasLab || (d.labLoinc && d.labOperator && d.labValue !== undefined), { message: t('labValidation'), path: ['labLoinc'] });
  type FormData = z.infer<typeof schema>;

  const { data: medsData } = useQuery({
    queryKey: ['medications-all'],
    queryFn: async () => { const { data } = await apiClient.get<PaginatedResponse<Medication>>('/v1/medications?limit=500'); return data.data; },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: rule
      ? { conditionCode: rule.conditionCode, conditionName: rule.conditionName, drugId: rule.drug?.id ?? rule.drugId ?? '', severity: rule.severity, sourceRef: rule.sourceRef ?? '', hasLab: !!rule.labThreshold, labLoinc: rule.labThreshold?.loinc ?? '', labOperator: rule.labThreshold?.operator ?? '>', labValue: rule.labThreshold?.value ?? 0 }
      : { conditionCode: '', conditionName: '', drugId: '', severity: 'caution', sourceRef: '', hasLab: false, labLoinc: '', labOperator: '>', labValue: 0 },
  });

  const hasLabValue = watch('hasLab');
  const meds = (medsData ?? []).map((m) => ({ value: m.id, label: m.drugName }));

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = { conditionCode: data.conditionCode, conditionName: data.conditionName, drugId: data.drugId, severity: data.severity, sourceRef: data.sourceRef || null, labThreshold: data.hasLab ? { loinc: data.labLoinc!, operator: data.labOperator!, value: data.labValue! } : null };
      return rule ? apiClient.put(`/v1/contraindication-rules/${rule.id}`, payload) : apiClient.post('/v1/contraindication-rules', payload);
    },
    onSuccess: () => { notifications.show({ message: rule ? t('updated') : t('created'), color: 'green' }); onSuccess(); },
    onError: () => notifications.show({ message: t('error'), color: 'red' }),
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
      <Stack gap="md">
        <TextInput label={`${t('conditionCode')} *`} {...register('conditionCode')} placeholder={t('conditionCodePlaceholder')} error={errors.conditionCode?.message} />
        <TextInput label={`${t('conditionName')} *`} {...register('conditionName')} placeholder={t('conditionNamePlaceholder')} error={errors.conditionName?.message} />
        <Select label={`${t('drug')} *`} data={meds} value={watch('drugId')} onChange={(v) => setValue('drugId', v ?? '')} searchable placeholder={t('selectDrug')} error={errors.drugId?.message} />
        <Select label={`${t('severity')} *`} data={[{ value: 'contraindicated', label: t('contraindicated') }, { value: 'caution', label: t('caution') }]} value={watch('severity')} onChange={(v) => setValue('severity', (v ?? 'caution') as 'contraindicated' | 'caution')} />
        <TextInput label={t('source')} {...register('sourceRef')} />
        <Switch label={t('hasLab')} checked={hasLabValue} onChange={(e) => setValue('hasLab', e.currentTarget.checked)} />
        {hasLabValue && (
          <Paper p="md" withBorder>
            <Stack gap="sm">
              <TextInput label={t('labLoinc')} {...register('labLoinc')} placeholder={t('labLoincPlaceholder')} error={errors.labLoinc?.message} />
              <Select label={t('labOperator')} data={[{ value: '>', label: '>' }, { value: '>=', label: '>=' }, { value: '<', label: '<' }, { value: '<=', label: '<=' }]} value={watch('labOperator')} onChange={(v) => setValue('labOperator', v ?? '>')} />
              <NumberInput label={t('labValue')} value={watch('labValue')} onChange={(v) => setValue('labValue', typeof v === 'number' ? v : 0)} />
            </Stack>
          </Paper>
        )}
        <Button type="submit" fullWidth loading={mutation.isPending}>{mutation.isPending ? tc('saving') : tc('save')}</Button>
      </Stack>
    </form>
  );
}
