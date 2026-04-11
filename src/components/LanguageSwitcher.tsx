import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { Globe } from "lucide-react";

const LanguageSwitcher = () => {
  const { lang, switchLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => switchLanguage(lang === 'en' ? 'kn' : 'en')}
      className="gap-1.5 text-sm"
    >
      <Globe className="h-4 w-4" />
      {lang === 'en' ? 'ಕನ್ನಡ' : 'English'}
    </Button>
  );
};

export default LanguageSwitcher;
