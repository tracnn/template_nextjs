'use client';

import { SegmentedControl } from '@mantine/core';
import { useLocale } from 'next-intl';

const LOCALES = [
  { value: 'vi', label: 'VI' },
  { value: 'en', label: 'EN' },
];

export function LanguageSwitcher() {
  const currentLocale = useLocale();

  const handleChange = (locale: string) => {
    document.cookie = `locale=${locale};path=/;max-age=31536000`;
    window.location.reload();
  };

  return (
    <SegmentedControl
      size="xs"
      value={currentLocale}
      onChange={handleChange}
      data={LOCALES}
    />
  );
}
