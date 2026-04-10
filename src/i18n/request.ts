import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

const SUPPORTED_LOCALES = ['vi', 'en'];
const DEFAULT_LOCALE = 'vi';

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const cookieLang = cookieStore.get('locale')?.value;
  const acceptLang = headerStore.get('accept-language')?.split(',')[0]?.slice(0, 2);

  const locale =
    (cookieLang && SUPPORTED_LOCALES.includes(cookieLang) ? cookieLang : null) ||
    (acceptLang && SUPPORTED_LOCALES.includes(acceptLang) ? acceptLang : null) ||
    DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
