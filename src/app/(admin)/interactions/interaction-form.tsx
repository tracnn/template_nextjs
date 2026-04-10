'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { TextInput, Select, Switch, Button, Stack } from '@mantine/core';
import { apiClient } from '@/lib/api-client';
import { DrugInteraction, Medication, PaginatedResponse } from '@/lib/api-types';
import { useTranslations } from 'next-intl';

export function InteractionForm({ interaction, onSuccess }: { interaction: DrugInteraction | null; onSuccess: () => void }) {
  const t = useTranslations('interactions');
  const tc = useTranslations('common');

  const schema = z.object({
    drugAId: z.string().uuid(t('selectDrug')),
    drugBId: z.string().uuid(t('selectDrug')),
    severity: z.enum(['critical', 'high', 'moderate', 'low']),
    mechanism: z.string().optional(),
    clinicalEffect: z.string().optional(),
    recommendation: z.string().optional(),
    sourceRef: z.string().optional(),
    isActive: z.boolean(),
  });
  type FormData = z.infer<typeof schema>;

  const { data: medsData } = useQuery({
    queryKey: ['medications-all'],
    queryFn: async () => { const { data } = await apiClient.get<PaginatedResponse<Medication>>('/v1/medications?limit=500'); return data.data; },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: interaction
      ? { drugAId: interaction.drugA?.id ?? '', drugBId: interaction.drugB?.id ?? '', severity: interaction.severity, mechanism: interaction.mechanism ?? '', clinicalEffect: interaction.clinicalEffect ?? '', recommendation: interaction.recommendation ?? '', sourceRef: interaction.sourceRef ?? '', isActive: interaction.isActive }
      : { drugAId: '', drugBId: '', severity: 'moderate', mechanism: '', clinicalEffect: '', recommendation: '', sourceRef: '', isActive: true },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => interaction ? apiClient.put(`/v1/interactions/${interaction.id}`, data) : apiClient.post('/v1/interactions', data),
    onSuccess: () => { notifications.show({ message: interaction ? t('updated') : t('created'), color: 'green' }); onSuccess(); },
    onError: () => notifications.show({ message: t('error'), color: 'red' }),
  });

  const meds = (medsData ?? []).map((m) => ({ value: m.id, label: `${m.drugName} (${m.drugCode})` }));

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
      <Stack gap="md">
        <Select label={`${t('drugA')} *`} data={meds} value={watch('drugAId')} onChange={(v) => setValue('drugAId', v ?? '')} error={errors.drugAId?.message} searchable />
        <Select label={`${t('drugB')} *`} data={meds} value={watch('drugBId')} onChange={(v) => setValue('drugBId', v ?? '')} error={errors.drugBId?.message} searchable />
        <Select label={`${t('severity')} *`} data={[{ value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' }, { value: 'moderate', label: 'Moderate' }, { value: 'low', label: 'Low' }]} value={watch('severity')} onChange={(v) => setValue('severity', (v ?? 'moderate') as FormData['severity'])} />
        <TextInput label={t('mechanism')} {...register('mechanism')} />
        <TextInput label={t('clinicalEffect')} {...register('clinicalEffect')} />
        <TextInput label={t('recommendation')} {...register('recommendation')} />
        <TextInput label={tc('source')} {...register('sourceRef')} />
        <Switch label={t('isActive')} checked={watch('isActive')} onChange={(e) => setValue('isActive', e.currentTarget.checked)} />
        <Button type="submit" fullWidth loading={mutation.isPending}>{mutation.isPending ? tc('saving') : tc('save')}</Button>
      </Stack>
    </form>
  );
}
