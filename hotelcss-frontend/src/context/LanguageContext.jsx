import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const SUPPORTED_LANGUAGES = ['en', 'de', 'ru'];
const STORAGE_KEY = 'hotelcss-language';

const translations = {
    en: {
        settings: 'Settings',
        logout: 'Logout',
        searchOperations: 'Search operations...',
        backToDashboard: 'Back to dashboard',
        administrator: 'Administrator',
        manager: 'Manager',
        reception: 'Reception',
        staff: 'Staff',
        housekeeping: 'Housekeeping',
        restaurant: 'Restaurant',
        room: 'Room',
        dashboard: 'Dashboard',
        adminSuite: 'ADMIN SUITE',
        hotelManagerSuite: 'HOTEL MANAGER SUITE',
        receptionSuite: 'RECEPTION SUITE',
        staffSuite: 'STAFF SUITE',
        roomSuite: 'ROOM SUITE',
    },
    de: {
        settings: 'Einstellungen',
        logout: 'Abmelden',
        searchOperations: 'Vorgaenge suchen...',
        backToDashboard: 'Zurueck zum Dashboard',
        administrator: 'Administrator',
        manager: 'Manager',
        reception: 'Rezeption',
        staff: 'Mitarbeiter',
        housekeeping: 'Housekeeping',
        restaurant: 'Restaurant',
        room: 'Zimmer',
        dashboard: 'Dashboard',
        adminSuite: 'ADMIN BEREICH',
        hotelManagerSuite: 'HOTELMANAGER BEREICH',
        receptionSuite: 'REZEPTION BEREICH',
        staffSuite: 'MITARBEITER BEREICH',
        roomSuite: 'ZIMMER BEREICH',
    },
    ru: {
        settings: 'Настройки',
        logout: 'Выйти',
        searchOperations: 'Поиск операций...',
        backToDashboard: 'Назад к панели',
        administrator: 'Администратор',
        manager: 'Менеджер',
        reception: 'Ресепшн',
        staff: 'Персонал',
        housekeeping: 'Хаускипинг',
        restaurant: 'Ресторан',
        room: 'Номер',
        dashboard: 'Панель',
        adminSuite: 'АДМИН ПАНЕЛЬ',
        hotelManagerSuite: 'ПАНЕЛЬ МЕНЕДЖЕРА ОТЕЛЯ',
        receptionSuite: 'ПАНЕЛЬ РЕСЕПШН',
        staffSuite: 'ПАНЕЛЬ ПЕРСОНАЛА',
        roomSuite: 'ПАНЕЛЬ НОМЕРА',
    },
};

const phraseTranslations = {
    de: {
        'Operational Overview': 'Betriebsuebersicht',
        'Reception Overview': 'Rezeptionsuebersicht',
        'Room Overview': 'Zimmeruebersicht',
        'Reception Actions': 'Rezeptionsaktionen',
        'Executive Actions': 'Leitungsaktionen',
        'My Tasks': 'Meine Aufgaben',
        'Service requests assigned to your department.': 'Serviceanfragen fuer Ihre Abteilung.',
        'No pending requests.': 'Keine offenen Anfragen.',
        'View All Requests': 'Alle Anfragen anzeigen',
        'Total Rooms': 'Zimmer gesamt',
        'Available Rooms': 'Verfuegbare Zimmer',
        'Total Requests': 'Anfragen gesamt',
        'Pending Requests': 'Offene Anfragen',
        'Room Information': 'Zimmerinformationen',
        'Create Service Request': 'Serviceanfrage erstellen',
        'Report an Issue': 'Problem melden',
        'Reception Request': 'Rezeptionsanfrage',
        'My Requests': 'Meine Anfragen',
        'Hotel Events': 'Hotelveranstaltungen',
        'Campaigns': 'Kampagnen',
        'Point Shop': 'Punkteshop',
        'My Reward Vouchers': 'Meine Praemiengutscheine',
        'Open': 'Oeffnen',
        'Live': 'Live',
        'Today': 'Heute',
        'Urgent': 'Dringend',
        'Available': 'Verfuegbar',
        'Quantity:': 'Menge:',
        'Note:': 'Notiz:',
        'Room': 'Zimmer',
        'Settings': 'Einstellungen',
        'Logout': 'Abmelden',
        'Requests': 'Anfragen',
        'Rooms': 'Zimmer',
        'Departments': 'Abteilungen',
        'Staff': 'Mitarbeiter',
        'Events': 'Veranstaltungen',
        'Vouchers': 'Gutscheine',
        'Reception Services': 'Rezeptionsdienste',
        'Room assistant': 'Zimmerassistent',
        'Open chat': 'Chat oeffnen',
        'Close chat': 'Chat schliessen',
        'Close': 'Schliessen',
        'Send': 'Senden',
        'Thinking...': 'Denke...',
        'Type your request...': 'Geben Sie Ihre Anfrage ein...',
        'Confirm': 'Bestaetigen',
        'Processing...': 'Verarbeite...',
        'Loading dashboard...': 'Dashboard wird geladen...',
        'Loading room dashboard...': 'Zimmer-Dashboard wird geladen...',
        'Loading reception services...': 'Rezeptionsdienste werden geladen...',
        'Loading hotel events...': 'Hotelveranstaltungen werden geladen...',
        'Create announcements, meal menus and bonus point campaigns for guests.': 'Erstellen Sie Ankuendigungen, Menues und Bonuspunkt-Kampagnen fuer Gaeste.',
        'Add Event': 'Ereignis hinzufuegen',
        'No hotel events defined yet.': 'Noch keine Hotelveranstaltungen vorhanden.',
        'Edit': 'Bearbeiten',
        'Delete': 'Loeschen',
        'Edit Event': 'Ereignis bearbeiten',
        'Create Event': 'Ereignis erstellen',
        'Title *': 'Titel *',
        'Description': 'Beschreibung',
        'Event Type': 'Ereignistyp',
        'Active': 'Aktiv',
        'Start Date/Time': 'Startdatum/-zeit',
        'End Date/Time': 'Enddatum/-zeit',
        'Extra Points': 'Extra Punkte',
        'Cancel': 'Abbrechen',
        'Update Event': 'Ereignis aktualisieren',
        'General': 'Allgemein',
        'Meal / Menu': 'Mahlzeit / Menue',
        'Bonus Point Campaign': 'Bonuspunkte-Kampagne',
        'Are you sure you want to delete the event': 'Sind Sie sicher, dass Sie das Ereignis loeschen moechten',
        'Click to toggle active status': 'Klicken, um den Status umzuschalten',
        'Inactive': 'Inaktiv',
        'Start:': 'Start:',
        'End:': 'Ende:',
        'Bonus point campaign is active for eligible purchases.': 'Bonuspunkte-Kampagne ist fuer berechtigte Einkaeufe aktiv.',
        'Reception services': 'Rezeptionsdienste',
        'Manage wake-up calls and pick-up times with the same editorial clarity as the guest-facing portal.': 'Verwalten Sie Weckrufe und Abholzeiten mit derselben Klarheit wie im Gastportal.',
        'No reception services found.': 'Keine Rezeptionsdienste gefunden.',
        'Hi! I am your digital concierge. I can order room service, set wake-up calls, check your points balance, or show you the point shop.': 'Hallo! Ich bin Ihr digitaler Concierge. Ich kann Zimmerservice bestellen, Weckrufe einrichten, Ihren Punktestand pruefen oder den Punkteshop zeigen.',
        'I am your Hotel Assistant. Please tell me what you need for your room.': 'Ich bin Ihr Hotelassistent. Bitte sagen Sie mir, was Sie fuer Ihr Zimmer brauchen.',
        'What time and date would you like me to set the wake-up call for?': 'Welche Uhrzeit und welches Datum soll ich fuer den Weckruf einstellen?',
        'At this time, we do not have any active promotional campaigns. Please check back later!': 'Derzeit gibt es keine aktiven Werbekampagnen. Bitte schauen Sie spaeter noch einmal vorbei!',
        'We do not have any special meal menus posted at the moment. Please check with the restaurant!': 'Derzeit sind keine speziellen Speisekarten verfuegbar. Bitte fragen Sie im Restaurant nach!',
        'Sorry, I couldn\'t understand that. Try something like "2 towels", "wake me up at 8 AM", or "what can I buy with points?".': 'Entschuldigung, das habe ich nicht verstanden. Versuchen Sie etwas wie "2 Handtuecher", "wecke mich um 8 Uhr" oder "was kann ich mit Punkten kaufen?".',
        'Order confirmed! Your request has been sent.': 'Bestellung bestaetigt! Ihre Anfrage wurde gesendet.',
        'Requested via AI Chatbot': 'Angefragt ueber KI-Chatbot',
        'Lütfen bir oda numarası girin.': 'Bitte geben Sie eine Zimmernummer ein.',
        'Lütfen pick-up için bir tarih ve saat seçin.': 'Bitte waehlen Sie ein Datum und eine Uhrzeit fuer die Abholung.',
        'Pick-up zamanı başarıyla kaydedildi veya güncellendi.': 'Abholzeit wurde erfolgreich gespeichert oder aktualisiert.',
        'Pick-up zamanı kaydedilirken bir hata oluştu.': 'Beim Speichern der Abholzeit ist ein Fehler aufgetreten.',
        'Bu kaydı silmek istediğinize emin misiniz?': 'Moechten Sie diesen Eintrag wirklich loeschen?',
        'Pick-up zamanı gir / güncelle': 'Abholzeit eingeben / aktualisieren',
        'Oda numarası girerek misafirler için yeni bir pick-up (transfer) saati tanımlayabilir veya mevcut zamanı güncelleyebilirsiniz.': 'Mit einer Zimmernummer koennen Sie eine neue Abholzeit (Transfer) fuer Gaeste festlegen oder eine bestehende Zeit aktualisieren.',
        'Örn: 101': 'z.B.: 101',
        'Örneğin: Havaalanı transferi, otelden 2 saat önce çıkış.': 'Beispiel: Flughafentransfer, Abfahrt 2 Stunden vor Verlassen des Hotels.',
        'Kaydediliyor...': 'Wird gespeichert...',
        'Pick-up zamanı kaydet': 'Abholzeit speichern',
    },
    ru: {
        'Operational Overview': 'Обзор операций',
        'Reception Overview': 'Обзор ресепшн',
        'Room Overview': 'Обзор номера',
        'Reception Actions': 'Действия ресепшн',
        'Executive Actions': 'Управленческие действия',
        'My Tasks': 'Мои задачи',
        'Service requests assigned to your department.': 'Сервисные запросы, назначенные вашему отделу.',
        'No pending requests.': 'Нет ожидающих запросов.',
        'View All Requests': 'Посмотреть все запросы',
        'Total Rooms': 'Всего номеров',
        'Available Rooms': 'Доступные номера',
        'Total Requests': 'Всего запросов',
        'Pending Requests': 'Ожидающие запросы',
        'Room Information': 'Информация о номере',
        'Create Service Request': 'Создать сервисный запрос',
        'Report an Issue': 'Сообщить о проблеме',
        'Reception Request': 'Запрос на ресепшн',
        'My Requests': 'Мои запросы',
        'Hotel Events': 'События отеля',
        'Campaigns': 'Кампании',
        'Point Shop': 'Магазин баллов',
        'My Reward Vouchers': 'Мои купоны наград',
        'Open': 'Открыть',
        'Live': 'Актуально',
        'Today': 'Сегодня',
        'Urgent': 'Срочно',
        'Available': 'Доступно',
        'Quantity:': 'Количество:',
        'Note:': 'Заметка:',
        'Room': 'Номер',
        'Settings': 'Настройки',
        'Logout': 'Выйти',
        'Requests': 'Запросы',
        'Rooms': 'Номера',
        'Departments': 'Отделы',
        'Staff': 'Персонал',
        'Events': 'События',
        'Vouchers': 'Купоны',
        'Reception Services': 'Услуги ресепшн',
        'Room assistant': 'Помощник номера',
        'Open chat': 'Открыть чат',
        'Close chat': 'Закрыть чат',
        'Close': 'Закрыть',
        'Send': 'Отправить',
        'Thinking...': 'Думаю...',
        'Type your request...': 'Введите ваш запрос...',
        'Confirm': 'Подтвердить',
        'Processing...': 'Обрабатывается...',
        'Loading dashboard...': 'Загрузка панели...',
        'Loading room dashboard...': 'Загрузка панели номера...',
        'Loading reception services...': 'Загрузка услуг ресепшн...',
        'Loading hotel events...': 'Загрузка событий отеля...',
        'Create announcements, meal menus and bonus point campaigns for guests.': 'Создавайте объявления, меню питания и кампании бонусных баллов для гостей.',
        'Add Event': 'Добавить событие',
        'No hotel events defined yet.': 'События отеля пока не добавлены.',
        'Edit': 'Изменить',
        'Delete': 'Удалить',
        'Edit Event': 'Изменить событие',
        'Create Event': 'Создать событие',
        'Title *': 'Заголовок *',
        'Description': 'Описание',
        'Event Type': 'Тип события',
        'Active': 'Активно',
        'Inactive': 'Неактивно',
        'Start Date/Time': 'Дата/время начала',
        'End Date/Time': 'Дата/время окончания',
        'Extra Points': 'Дополнительные баллы',
        'Cancel': 'Отмена',
        'Update Event': 'Обновить событие',
        'General': 'Общее',
        'Meal / Menu': 'Питание / Меню',
        'Bonus Point Campaign': 'Кампания бонусных баллов',
        'Click to toggle active status': 'Нажмите, чтобы переключить статус',
        'Start:': 'Начало:',
        'End:': 'Конец:',
        'Bonus point campaign is active for eligible purchases.': 'Кампания бонусных баллов активна для подходящих покупок.',
        'No reception services found.': 'Услуги ресепшн не найдены.',
        'Hi! I am your digital concierge. I can order room service, set wake-up calls, check your points balance, or show you the point shop.': 'Привет! Я ваш цифровой консьерж. Я могу заказать обслуживание в номер, установить будильник, проверить баланс баллов или показать магазин баллов.',
        'I am your Hotel Assistant. Please tell me what you need for your room.': 'Я ваш помощник отеля. Пожалуйста, скажите, что вам нужно для номера.',
        'What time and date would you like me to set the wake-up call for?': 'На какое время и дату установить звонок-будильник?',
        'At this time, we do not have any active promotional campaigns. Please check back later!': 'Сейчас у нас нет активных промо-кампаний. Пожалуйста, проверьте позже!',
        'We do not have any special meal menus posted at the moment. Please check with the restaurant!': 'Сейчас у нас нет специальных меню питания. Пожалуйста, уточните в ресторане!',
        'Sorry, I couldn\'t understand that. Try something like "2 towels", "wake me up at 8 AM", or "what can I buy with points?".': 'Извините, я не понял. Попробуйте, например: "2 полотенца", "разбуди меня в 8 утра" или "что можно купить за баллы?".',
        'Order confirmed! Your request has been sent.': 'Заказ подтвержден! Ваш запрос отправлен.',
        'Requested via AI Chatbot': 'Запрошено через ИИ-чатбот',
        'Lütfen bir oda numarası girin.': 'Пожалуйста, введите номер комнаты.',
        'Lütfen pick-up için bir tarih ve saat seçin.': 'Пожалуйста, выберите дату и время для трансфера.',
        'Pick-up zamanı başarıyla kaydedildi veya güncellendi.': 'Время трансфера успешно сохранено или обновлено.',
        'Pick-up zamanı kaydedilirken bir hata oluştu.': 'Произошла ошибка при сохранении времени трансфера.',
        'Bu kaydı silmek istediğinize emin misiniz?': 'Вы уверены, что хотите удалить эту запись?',
        'Pick-up zamanı gir / güncelle': 'Ввести / обновить время трансфера',
        'Oda numarası girerek misafirler için yeni bir pick-up (transfer) saati tanımlayabilir veya mevcut zamanı güncelleyebilirsiniz.': 'Введите номер комнаты, чтобы назначить новое время трансфера для гостей или обновить текущее.',
        'Örn: 101': 'Напр.: 101',
        'Örneğin: Havaalanı transferi, otelden 2 saat önce çıkış.': 'Например: трансфер в аэропорт, выезд за 2 часа до выхода из отеля.',
        'Kaydediliyor...': 'Сохранение...',
        'Pick-up zamanı kaydet': 'Сохранить время трансфера',
    },
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguageState] = useState('en');

    useEffect(() => {
        const storedLanguage = localStorage.getItem(STORAGE_KEY);
        if (storedLanguage && SUPPORTED_LANGUAGES.includes(storedLanguage)) {
            setLanguageState(storedLanguage);
        }
    }, []);

    const setLanguage = (nextLanguage) => {
        if (!SUPPORTED_LANGUAGES.includes(nextLanguage)) {
            return;
        }
        setLanguageState(nextLanguage);
        localStorage.setItem(STORAGE_KEY, nextLanguage);
    };

    const t = (key, fallback) => {
        const table = translations[language] || translations.en;
        return table[key] || fallback || key;
    };

    const translateUiText = (text) => {
        if (typeof text !== 'string') {
            return text;
        }
        const trimmed = text.trim();
        if (!trimmed || language === 'en') {
            return text;
        }
        const table = phraseTranslations[language] || {};
        if (table[trimmed]) {
            return text.replace(trimmed, table[trimmed]);
        }

        let translatedText = text;
        const keys = Object.keys(table).sort((a, b) => b.length - a.length);
        keys.forEach((key) => {
            if (translatedText.includes(key)) {
                translatedText = translatedText.split(key).join(table[key]);
            }
        });
        return translatedText;
    };

    const value = useMemo(
        () => ({
            language,
            setLanguage,
            supportedLanguages: SUPPORTED_LANGUAGES,
            t,
            translateUiText,
        }),
        [language],
    );

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};
