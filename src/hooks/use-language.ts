import { useState, useEffect } from 'react';
import { Language, getLanguage, setLanguage } from '@/lib/i18n';

const LANG_CHANGE_EVENT = 'policypoll-language-change';

export const useLanguage = () => {
  const [lang, setLang] = useState<Language>(getLanguage());

  useEffect(() => {
    const handleLangChange = (e: Event) => {
      setLang((e as CustomEvent<Language>).detail);
    };
    window.addEventListener(LANG_CHANGE_EVENT, handleLangChange);
    return () => window.removeEventListener(LANG_CHANGE_EVENT, handleLangChange);
  }, []);

  const switchLanguage = (newLang: Language) => {
    setLanguage(newLang);
    setLang(newLang);
    window.dispatchEvent(new CustomEvent<Language>(LANG_CHANGE_EVENT, { detail: newLang }));
  };

  return { lang, switchLanguage };
};
