import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

// Language code + display name shown in the dropdown.
const LANGS = [
    { code: 'tr', label: 'TR', name: 'Türkçe' },
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'ru', label: 'RU', name: 'Русский' },
    { code: 'de', label: 'DE', name: 'Deutsch' },
];

// Inline SVG flags — emoji flags don't render on Windows, and inline SVG works
// offline (no external flag CDN needed on the hotel LAN).
const Flag = ({ code, className = 'w-6 h-[18px]' }) => {
    const common = {
        className: `${className} rounded-[2px] shrink-0 ring-1 ring-black/10`,
        viewBox: '0 0 24 18',
        xmlns: 'http://www.w3.org/2000/svg',
    };
    switch (code) {
        case 'de':
            return (
                <svg {...common}>
                    <rect width="24" height="6" y="0" fill="#000000" />
                    <rect width="24" height="6" y="6" fill="#DD0000" />
                    <rect width="24" height="6" y="12" fill="#FFCE00" />
                </svg>
            );
        case 'ru':
            return (
                <svg {...common}>
                    <rect width="24" height="6" y="0" fill="#FFFFFF" />
                    <rect width="24" height="6" y="6" fill="#0039A6" />
                    <rect width="24" height="6" y="12" fill="#D52B1E" />
                </svg>
            );
        case 'en': // England — St George's Cross
            return (
                <svg {...common}>
                    <rect width="24" height="18" fill="#FFFFFF" />
                    <rect x="10" width="4" height="18" fill="#CE1124" />
                    <rect y="7" width="24" height="4" fill="#CE1124" />
                </svg>
            );
        case 'tr':
            return (
                <svg {...common}>
                    <rect width="24" height="18" fill="#E30A17" />
                    <circle cx="9" cy="9" r="4.5" fill="#FFFFFF" />
                    <circle cx="10.4" cy="9" r="3.6" fill="#E30A17" />
                    <polygon
                        fill="#FFFFFF"
                        points="14.6,6.6 15.19,8.19 16.88,8.26 15.55,9.31 16.01,10.94 14.6,10.0 13.19,10.94 13.65,9.31 12.32,8.26 14.01,8.19"
                    />
                </svg>
            );
        default:
            return null;
    }
};

const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguage();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close the dropdown when clicking anywhere outside it.
    useEffect(() => {
        if (!open) return;
        const onClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-1 px-2 py-1.5 rounded-full hover:bg-black/5 transition-colors"
                title="Change language"
                aria-label="Change language"
            >
                <Flag code={language} />
                <span className="material-symbols-outlined text-[16px] text-gray-500">expand_more</span>
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-black/10 py-1 z-50 overflow-hidden">
                    {LANGS.map((l) => (
                        <button
                            key={l.code}
                            type="button"
                            onClick={() => {
                                setLanguage(l.code);
                                setOpen(false);
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-50 transition-colors ${language === l.code ? 'bg-[#F2EBE1]/60' : ''}`}
                        >
                            <Flag code={l.code} />
                            <span className={`text-sm font-bold ${language === l.code ? 'text-[#D35400]' : 'text-gray-700'}`}>
                                {l.label}
                            </span>
                            <span className="text-xs text-gray-400 ml-auto">{l.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
