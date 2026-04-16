import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const AUTH_ROUTES = ['/login', '/register', '/room-login', '/forgot-password', '/reset-password'];

const GlobalTranslator = () => {
    const { language, translateUiText } = useLanguage();
    const location = useLocation();
    const textMapRef = useRef(new WeakMap());
    const attrMapRef = useRef(new WeakMap());

    useEffect(() => {
        if (AUTH_ROUTES.includes(location.pathname)) {
            return;
        }

        const root = document.body;
        if (!root) {
            return;
        }

        const textMap = textMapRef.current;
        const attrMap = attrMapRef.current;
        let isApplying = false;
        let isMounted = true;
        let pendingTimer = null;

        const applyTranslations = () => {
            if (!isMounted || isApplying) {
                return;
            }
            isApplying = true;
            observer.disconnect();

            try {
                const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
                let node = walker.nextNode();
                while (node) {
                    const parentTag = node.parentElement?.tagName;
                    const ignored = parentTag === 'SCRIPT' || parentTag === 'STYLE' || parentTag === 'NOSCRIPT';
                    if (!ignored) {
                        if (!textMap.has(node)) {
                            textMap.set(node, node.nodeValue || '');
                        }
                        const original = textMap.get(node) || '';
                        const translated = translateUiText(original);
                        if (node.nodeValue !== translated) {
                            node.nodeValue = translated;
                        }
                    }
                    node = walker.nextNode();
                }

                const attrTargets = root.querySelectorAll('input[placeholder], textarea[placeholder], [title], [aria-label]');
                attrTargets.forEach((element) => {
                    if (!attrMap.has(element)) {
                        attrMap.set(element, {
                            placeholder: element.getAttribute('placeholder'),
                            title: element.getAttribute('title'),
                            ariaLabel: element.getAttribute('aria-label'),
                        });
                    }
                    const original = attrMap.get(element);
                    if (!original) {
                        return;
                    }

                    if (original.placeholder !== null) {
                        const translated = translateUiText(original.placeholder);
                        if (element.getAttribute('placeholder') !== translated) {
                            element.setAttribute('placeholder', translated);
                        }
                    }
                    if (original.title !== null) {
                        const translated = translateUiText(original.title);
                        if (element.getAttribute('title') !== translated) {
                            element.setAttribute('title', translated);
                        }
                    }
                    if (original.ariaLabel !== null) {
                        const translated = translateUiText(original.ariaLabel);
                        if (element.getAttribute('aria-label') !== translated) {
                            element.setAttribute('aria-label', translated);
                        }
                    }
                });
            } finally {
                isApplying = false;
                if (isMounted) {
                    observer.observe(root, {
                        childList: true,
                        subtree: true,
                        attributes: true,
                        attributeFilter: ['placeholder', 'title', 'aria-label'],
                    });
                }
            }
        };

        const scheduleApply = () => {
            if (pendingTimer) {
                clearTimeout(pendingTimer);
            }
            pendingTimer = setTimeout(applyTranslations, 0);
        };

        const observer = new MutationObserver(() => {
            if (!isApplying) {
                scheduleApply();
            }
        });

        applyTranslations();
        const frame = requestAnimationFrame(applyTranslations);

        const originalConfirm = window.confirm.bind(window);
        window.confirm = (message) => originalConfirm(translateUiText(String(message ?? '')));

        return () => {
            isMounted = false;
            if (pendingTimer) {
                clearTimeout(pendingTimer);
            }
            cancelAnimationFrame(frame);
            observer.disconnect();
            window.confirm = originalConfirm;
        };
    }, [language, location.pathname, translateUiText]);

    return null;
};

export default GlobalTranslator;
