import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
];

interface LanguageContextType {
    currentLanguage: string;
    setLanguage: (languageCode: string) => void;
    translate: (text: string, targetLanguage?: string) => Promise<string>;
    isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentLanguage, setCurrentLanguage] = useState('en');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadSavedLanguage();
    }, []);

    const loadSavedLanguage = async () => {
        try {
            const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
            if (savedLanguage) {
                setCurrentLanguage(savedLanguage);
            }
        } catch (error) {
            console.error('Error loading saved language:', error);
        }
    };

    const setLanguage = async (languageCode: string) => {
        try {
            setCurrentLanguage(languageCode);
            await AsyncStorage.setItem('selectedLanguage', languageCode);
        } catch (error) {
            console.error('Error saving language:', error);
        }
    };

    const translate = async (text: string, targetLanguage?: string): Promise<string> => {
        const target = targetLanguage || currentLanguage;

        if (target === 'en' || !text.trim()) {
            return text;
        }

        setIsLoading(true);
        try {
            const response = await fetch(
                `https://translation.googleapis.com/language/translate/v2?key=${process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        q: text,
                        target: target,
                        source: 'en',
                        format: 'text',
                    }),
                }
            );

            const data = await response.json();

            if (data.error) {
                console.error('Translation error:', data.error);
                return text;
            }

            return data.data?.translations?.[0]?.translatedText || text;
        } catch (error) {
            console.error('Translation error:', error);
            return text;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LanguageContext.Provider value={{ currentLanguage, setLanguage, translate, isLoading }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};