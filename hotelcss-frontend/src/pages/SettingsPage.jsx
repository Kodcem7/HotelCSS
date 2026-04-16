import Layout from '../components/Layout';
import { useLanguage } from '../context/LanguageContext';

const languageOptions = [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ru', name: 'Русский' },
];

const labels = {
    en: {
        title: 'Application Settings',
        subtitle: 'Choose your preferred language for the application interface.',
        sectionTitle: 'Language',
        sectionText: 'Changes are applied immediately and saved for your next session.',
        active: 'Active',
    },
    de: {
        title: 'Anwendungseinstellungen',
        subtitle: 'Wählen Sie Ihre bevorzugte Sprache für die Benutzeroberfläche.',
        sectionTitle: 'Sprache',
        sectionText: 'Änderungen werden sofort angewendet und für die nächste Sitzung gespeichert.',
        active: 'Aktiv',
    },
    ru: {
        title: 'Настройки приложения',
        subtitle: 'Выберите предпочитаемый язык интерфейса приложения.',
        sectionTitle: 'Язык',
        sectionText: 'Изменения применяются сразу и сохраняются для следующей сессии.',
        active: 'Активно',
    },
};

const SettingsPage = () => {
    const { language, setLanguage } = useLanguage();
    const text = labels[language] || labels.en;

    return (
        <Layout>
            <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-8 space-y-8">
                <div>
                    <h2 className="text-3xl font-semibold text-slate-900">{text.title}</h2>
                    <p className="mt-2 text-slate-600">{text.subtitle}</p>
                </div>

                <section className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">{text.sectionTitle}</h3>
                        <p className="text-sm text-slate-500">{text.sectionText}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {languageOptions.map((option) => {
                            const isActive = language === option.code;
                            return (
                                <button
                                    key={option.code}
                                    type="button"
                                    onClick={() => setLanguage(option.code)}
                                    className={`rounded-xl border px-4 py-3 text-left transition ${
                                        isActive
                                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                            : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700'
                                    }`}
                                >
                                    <div className="font-medium">{option.name}</div>
                                    {isActive && <div className="text-xs mt-1">{text.active}</div>}
                                </button>
                            );
                        })}
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default SettingsPage;
