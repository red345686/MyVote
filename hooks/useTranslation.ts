import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const useTranslation = () => {
    const { currentLanguage, translate } = useLanguage();
    const [translations, setTranslations] = useState<Record<string, string>>({});

    const t = async (key: string, defaultText: string): Promise<string> => {
        if (currentLanguage === 'en') {
            return defaultText;
        }

        if (translations[key]) {
            return translations[key];
        }

        try {
            const translatedText = await translate(defaultText);
            setTranslations(prev => ({
                ...prev,
                [key]: translatedText
            }));
            return translatedText;
        } catch (error) {
            console.error('Translation error:', error);
            return defaultText;
        }
    };

    const tSync = (key: string, defaultText: string): string => {
        if (currentLanguage === 'en') {
            return defaultText;
        }
        return translations[key] || defaultText;
    };

    return { t, tSync, currentLanguage };
};