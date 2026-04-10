'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { TextInput, Select, Button, Stack } from '@mantine/core';
import { apiClient } from '@/lib/api-client';
import { AllergenRule, Medication, PaginatedResponse } from '@/lib/api-types';
import { useTranslations } from 'next-intl';

export function AllergenRuleForm({ rule, onSuccess }: { rule: AllergenRule | null; onSuccess: () => void }) {
  const t = useTranslations('allergenRules');
  const tc = useTranslations('common');

  const schema = z.object({
    allergenCode: z.string().min(1, tc('required')),
    allergenName: z.string().min(1, tc('required')),
    blockMode: z.enum(['class', 'drug']),
    blockedDrugClass: z.string().optional(),
    blockedDrugId: z.string().optional(),
    severity: z.enum(['contraindicated', 'caution']),
    sourceRef: z.string().optional(),
  }).refine((d) => (d.blockMode === 'class' ? !!d.blockedDrugClass : !!d.blockedDrugId), { message: t('validationError'), path: ['blockedDrugClass'] });
  type FormData = z.infer<typeof schema>;

  const { data: medsData } = useQuery({
    queryKey: ['medications-all'],
    queryFn: async () => { const { data } = await apiClient.get<PaginatedResponse<Medication>>('/v1/medications?limit=500'); return data.data; },
  });

  const defaultMode: 'class' | 'drug' = rule?.blockedDrugClass ? 'class' : 'drug';

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: rule
      ? { allergenCode: rule.allergenCode, allergenName: rule.allergenName, blockMode: defaultMode, blockedDrugClass: rule.blockedDrugClass ?? '', blockedDrugId: rule.blockedDrug?.id ?? rule.blockedDrugId ?? '', severity: rule.severity, sourceRef: rule.sourceRef ?? '' }
      : { allergenCode: '', allergenName: '', blockMode: 'class', blockedDrugClass: '', blockedDrugId: '', severity: 'contraindicated', sourceRef: '' },
  });

  const blockModeValue = watch('blockMode');

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      const payload = { allergenCode: data.allergenCode, allergenName: data.allergenName, blockedDrugClass: data.blockMode === 'class' ? data.blockedDrugClass : null, blockedDrugId: data.blockMode === 'drug' ? data.blockedDrugId : null, severity: data.severity, sourceRef: data.sourceRef || null };
      return rule ? apiClient.put(`/v1/allergen-rules/${rule.id}`, payload) : apiClient.post('/v1/allergen-rules', payload);
    },
    onSuccess: () => { notifications.show({ message: rule ? t('updated') : t('created'), color: 'green' }); onSuccess(); },
    onError: () => notifications.show({ message: t('error'), color: 'red' }),
  });

  const meds = (medsData ?? []).map((m) => ({ value: m.id, label: m.drugName }));

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
      <Stack gap="md">
        <TextInput label={`${t('allergenCode')} *`} {...register('allergenCode')} error={errors.allergenCode?.message} />
        <TextInput label={`${t('allergenName')} *`} {...register('allergenName')} error={errors.allergenName?.message} />
        <Select label={`${t('blockBy')} *`} data={[{ value: 'class', label: t('blockByClass') }, { value: 'drug', label: t('blockByDrug') }]} value={blockModeValue} onChange={(v) => setValue('blockMode', (v ?? 'class') as 'class' | 'drug')} />
        {blockModeValue === 'class' ? (
          <TextInput label={`${t('blockedDrugClass')} *`} {...register('blockedDrugClass')} placeholder="VD: Beta-lactam" />
        ) : (
          <Select label={`${t('blockedDrug')} *`} data={meds} value={watch('blockedDrugId')} onChange={(v) => setValue('blockedDrugId', v ?? '')} searchable placeholder={t('selectDrug')} />
        )}
        <Select label={`${t('severity')} *`} data={[{ value: 'contraindicated', label: t('contraindicated') }, { value: 'caution', label: t('caution') }]} value={watch('severity')} onChange={(v) => setValue('severity', (v ?? 'contraindicated') as 'contraindicated' | 'caution')} />
        <TextInput label={tc('source')} {...register('sourceRef')} />
        {errors.blockedDrugClass && <p style={{ color: 'red', fontSize: 12 }}>{errors.blockedDrugClass.message}</p>}
        <Button type="submit" fullWidth loading={mutation.isPending}>{mutation.isPending ? tc('saving') : tc('save')}</Button>
      </Stack>
    </form>
  );
}
