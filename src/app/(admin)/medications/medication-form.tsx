'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { TextInput, Switch, Button, Stack } from '@mantine/core';
import { apiClient } from '@/lib/api-client';
import { Medication } from '@/lib/api-types';
import { useTranslations } from 'next-intl';

export function MedicationForm({ medication, onSuccess }: { medication: Medication | null; onSuccess: () => void }) {
  const t = useTranslations('medications');
  const tc = useTranslations('common');

  const schema = z.object({
    drugCode: z.string().min(1, tc('required')),
    drugName: z.string().min(1, tc('required')),
    activeIngredient: z.string().optional(),
    drugClass: z.string().optional(),
    atcCode: z.string().optional(),
    fhirCode: z.string().optional(),
    isActive: z.boolean(),
  });
  type FormData = z.infer<typeof schema>;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: medication
      ? { drugCode: medication.drugCode, drugName: medication.drugName, activeIngredient: medication.activeIngredient ?? '', drugClass: medication.drugClass ?? '', atcCode: medication.atcCode ?? '', fhirCode: medication.fhirCode ?? '', isActive: medication.isActive }
      : { drugCode: '', drugName: '', activeIngredient: '', drugClass: '', atcCode: '', fhirCode: '', isActive: true },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => medication ? apiClient.put(`/v1/medications/${medication.id}`, data) : apiClient.post('/v1/medications', data),
    onSuccess: () => { notifications.show({ message: medication ? t('updated') : t('created'), color: 'green' }); onSuccess(); },
    onError: () => notifications.show({ message: t('error'), color: 'red' }),
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
      <Stack gap="md">
        <TextInput label={`${t('drugCode')} *`} {...register('drugCode')} error={errors.drugCode?.message} />
        <TextInput label={`${t('drugName')} *`} {...register('drugName')} error={errors.drugName?.message} />
        <TextInput label={t('activeIngredient')} {...register('activeIngredient')} />
        <TextInput label={t('drugClass')} {...register('drugClass')} />
        <TextInput label={t('atcCode')} {...register('atcCode')} />
        <TextInput label={t('fhirCode')} {...register('fhirCode')} />
        <Switch label={t('isActive')} checked={watch('isActive')} onChange={(e) => setValue('isActive', e.currentTarget.checked)} />
        <Button type="submit" fullWidth loading={mutation.isPending}>{mutation.isPending ? tc('saving') : tc('save')}</Button>
      </Stack>
    </form>
  );
}
