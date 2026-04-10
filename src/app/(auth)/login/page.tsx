'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { TextInput, PasswordInput, Button, Card, Title, Text, Center, Stack, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher/LanguageSwitcher';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/');
    } catch {
      setError(t('loginError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center h="100vh" bg="gray.0">
      <div style={{ position: 'absolute', top: 16, right: 16 }}>
        <LanguageSwitcher />
      </div>
      <Card shadow="md" padding="xl" radius="md" w={400}>
        <Stack gap="md">
          <div style={{ textAlign: 'center' }}>
            <Title order={2}>{t('title')}</Title>
            <Text c="dimmed" size="sm">{t('description')}</Text>
          </div>
          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput label={t('email')} type="email" value={email} onChange={(e) => setEmail(e.currentTarget.value)} required />
              <PasswordInput label={t('password')} value={password} onChange={(e) => setPassword(e.currentTarget.value)} required />
              {error && <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">{error}</Alert>}
              <Button type="submit" fullWidth loading={loading}>{loading ? t('loggingIn') : t('login')}</Button>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Center>
  );
}
