import { useState, useEffect } from 'react';
import { Language, getLanguage, setLanguage } from '@/lib/i18n';

export const useLanguage = () => {
  const [lang, setLang] = useState<Language>(getLanguage());

  useEffect(() => {
    setLang(getLanguage());
  }, []);

  const switchLanguage = (newLang: Language) => {
    setLanguage(newLang);
    setLang(newLang);
  };

  return { lang, switchLanguage };
};
