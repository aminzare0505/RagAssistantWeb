import { Languages } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { isLanguage, type Language } from '@/i18n/messages';
import { useLanguage } from '@/i18n/use-language';

const languageOptions: readonly {
  value: Language;
  labelKey: 'languageFa' | 'languageEn';
}[] = [
  { value: 'fa', labelKey: 'languageFa' },
  { value: 'en', labelKey: 'languageEn' },
];

export function LanguageMenu() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-11"
              aria-label={t.header.languageToggle}
            >
              <Languages aria-hidden className="size-5" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{t.header.language}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>{t.header.language}</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={language}
          onValueChange={(value) => {
            if (isLanguage(value)) {
              setLanguage(value);
            }
          }}
        >
          {languageOptions.map((option) => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              lang={option.value}
              dir={option.value === 'fa' ? 'rtl' : 'ltr'}
            >
              {t.header[option.labelKey]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
