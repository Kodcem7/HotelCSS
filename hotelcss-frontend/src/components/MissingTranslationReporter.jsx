import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { PHRASE_TRANSLATIONS, UI_TRANSLATIONS, useLanguage } from '../context/LanguageContext';

const AUTH_ROUTES = ['/login', '/register', '/room-login', '/forgot-password', '/reset-password'];
const STORAGE_KEY = 'hotelcss-missing-translations';
const BRAND_WORDS = new Set(['Parador Beach Hotel']);
const ICON_WORDS = new Set([
    'search',
    'settings',
    'logout',
    'notifications',
    'dashboard',
    'event',
    'campaign',
    'history',
    'stars',
    'confirmation_number',
    'arrow_back',
    'pts',
]);

const shouldIgnore = (text) => {
    if (!text) {
        return true;
    }
    if (BRAND_WORDS.has(text) || ICON_WORDS.has(text)) {
        return true;
    }
    if (text.length <= 1) {
        return true;
    }
    if (/^\d+$/.test(text)) {
        return true;
    }
    if (/^[A-Z]$/.test(text)) {
        return true;
    }
    if (/^[\p{L}]+\d+$/u.test(text)) {
        return true;
    }
    if (/^[#\-+–—↕↑↓•]+$/.test(text)) {
        return true;
    }
    return false;
};

const MissingTranslationReporter = () => {
    const { language } = useLanguage();
    const location = useLocation();
    const lastReportRef = useRef('');

    useEffect(() => {
        if (language === 'en' || AUTH_ROUTES.includes(location.pathname)) {
            return;
        }

        const phraseMap = PHRASE_TRANSLATIONS[language] || {};
        const uiMap = UI_TRANSLATIONS[language] || {};
        const knownKeys = new Set([...Object.keys(phraseMap), ...Object.keys(uiMap)]);
        const knownValues = new Set([...Object.values(phraseMap), ...Object.values(uiMap)]);
        const missing = new Set();

        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node = walker.nextNode();
        while (node) {
            const parentTag = node.parentElement?.tagName;
            const isIgnoredParent = parentTag === 'SCRIPT' || parentTag === 'STYLE' || parentTag === 'NOSCRIPT';
            if (!isIgnoredParent) {
                const text = (node.nodeValue || '').trim().replace(/\s+/g, ' ');
                    if (
                        !shouldIgnore(text) &&
                        /[A-Za-z\u00C0-\u024F\u0400-\u04FF]/.test(text) &&
                        !knownKeys.has(text) &&
                        !knownValues.has(text)
                    ) {
                    missing.add(text);
                }
            }
            node = walker.nextNode();
        }

        if (missing.size > 0) {
            const values = Array.from(missing).sort();
            const signature = `${language}:${location.pathname}:${values.join('|')}`;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
            if (lastReportRef.current !== signature) {
                console.warn('[i18n] Missing phrases detected:', values);
                lastReportRef.current = signature;
            }
        } else {
            localStorage.removeItem(STORAGE_KEY);
            lastReportRef.current = `${language}:${location.pathname}:none`;
        }
    }, [language, location.pathname]);

    return null;
};

export default MissingTranslationReporter;
